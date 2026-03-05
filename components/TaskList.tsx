"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/lib/claude";

type Destination = "things" | "reminders" | "todoist" | "copy";

interface TaskListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onReset: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatWhen(when: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(when)) {
    return new Date(when + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  }
  return when.charAt(0).toUpperCase() + when.slice(1);
}

function generateICS(tasks: Task[]): string {
  const escape = (s: string) => s.replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n");
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}@journalcut`;

  const vtodos = tasks.map((t) => {
    const lines = [
      "BEGIN:VTODO",
      `UID:${uid()}`,
      `SUMMARY:${escape(t.title)}`,
      "STATUS:NEEDS-ACTION",
    ];
    if (t.when && /^\d{4}-\d{2}-\d{2}$/.test(t.when)) {
      lines.push(`DUE;VALUE=DATE:${t.when.replace(/-/g, "")}`);
    }
    if (t.subtasks?.length) {
      lines.push(`DESCRIPTION:Steps:\\n${t.subtasks.map(escape).join("\\n")}`);
    }
    lines.push("END:VTODO");
    return lines.join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BetterTasks//EN",
    "METHOD:PUBLISH",
    ...vtodos,
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(tasks: Task[]) {
  const content = generateICS(tasks);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function tasksToText(tasks: Task[]): string {
  return tasks
    .map((t) => {
      const when = t.when ? ` (${formatWhen(t.when)})` : "";
      const subs = t.subtasks?.length
        ? "\n" + t.subtasks.map((s) => `  • ${s}`).join("\n")
        : "";
      return `• ${t.title}${when}${subs}`;
    })
    .join("\n");
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <p className="text-gray-300 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TaskList({ tasks, onTasksChange, onReset }: TaskListProps) {
  const [destination, setDestination] = useState<Destination>("things");
  const [project, setProject] = useState("");
  const [todoistToken, setTodoistToken] = useState("");
  const [todoistTokenInput, setTodoistTokenInput] = useState("");
  const [todoistVerifying, setTodoistVerifying] = useState(false);
  const [todoistTokenError, setTodoistTokenError] = useState("");
  const [showTodoistSetup, setShowTodoistSetup] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [exporting, setExporting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState<Destination>("things");
  const [remindersViaShare, setRemindersViaShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState("");

  // Load saved Todoist token
  useEffect(() => {
    const saved = localStorage.getItem("bettertasks_todoist_token");
    if (saved) setTodoistToken(saved);
  }, []);

  // ── Task editing ─────────────────────────────────────────────────────────

  const deleteTask = (i: number) => onTasksChange(tasks.filter((_, idx) => idx !== i));

  const clearWhen = (i: number) =>
    onTasksChange(tasks.map((t, idx) => (idx === i ? { ...t, when: undefined } : t)));

  const deleteSubtask = (ti: number, si: number) =>
    onTasksChange(
      tasks.map((t, idx) =>
        idx === ti ? { ...t, subtasks: t.subtasks?.filter((_, s) => s !== si) } : t
      )
    );

  const startEdit = (i: number) => { setEditingIndex(i); setEditValue(tasks[i].title); };

  const commitEdit = (i: number) => {
    if (editValue.trim())
      onTasksChange(tasks.map((t, idx) => (idx === i ? { ...t, title: editValue.trim() } : t)));
    setEditingIndex(null);
    setEditValue("");
  };

  // ── Todoist token setup ───────────────────────────────────────────────────

  const saveTodoistToken = async () => {
    const t = todoistTokenInput.trim();
    if (!t) return;
    setTodoistVerifying(true);
    setTodoistTokenError("");
    try {
      const res = await fetch(`/api/todoist?token=${encodeURIComponent(t)}`);
      const data = await res.json();
      if (!data.valid) {
        setTodoistTokenError("That token didn't work. Double-check you copied the whole thing.");
        return;
      }
      localStorage.setItem("bettertasks_todoist_token", t);
      setTodoistToken(t);
      setTodoistTokenInput("");
      setShowTodoistSetup(false);
    } catch {
      setTodoistTokenError("Couldn't connect. Check your internet and try again.");
    } finally {
      setTodoistVerifying(false);
    }
  };

  const forgetTodoistToken = () => {
    localStorage.removeItem("bettertasks_todoist_token");
    setTodoistToken("");
    setShowTodoistSetup(true);
  };

  // ── Export handlers ───────────────────────────────────────────────────────

  const exportThings = () => {
    const data = tasks.map(({ title, when, subtasks }) => ({
      type: "to-do",
      attributes: {
        title,
        ...(when && when !== "anytime" ? { when } : {}),
        ...(project.trim() ? { list: project.trim() } : {}),
        ...(subtasks?.length
          ? { "checklist-items": subtasks.map((s) => ({ type: "checklist-item", attributes: { title: s } })) }
          : {}),
      },
    }));
    window.location.href = `things:///json?data=${encodeURIComponent(JSON.stringify(data))}`;
    setSentTo("things");
    setSent(true);
  };

  const exportReminders = async () => {
    const icsContent = generateICS(tasks);
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const file = new File([blob], "tasks.ics", { type: "text/calendar" });

    // Web Share API: works natively on iOS Safari (opens share sheet → user picks Reminders)
    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Tasks" });
        setRemindersViaShare(true);
        setSentTo("reminders");
        setSent(true);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // user cancelled share sheet
        // fall through to download
      }
    }

    // Fallback for desktop: trigger file download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.ics";
    a.click();
    URL.revokeObjectURL(url);
    setRemindersViaShare(false);
    setSentTo("reminders");
    setSent(true);
  };

  const exportTodoist = async () => {
    setExporting(true);
    setExportError("");
    try {
      const res = await fetch("/api/todoist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: todoistToken, tasks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      setSentTo("todoist");
      setSent(true);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setExporting(false);
    }
  };

  const exportCopy = async () => {
    await navigator.clipboard.writeText(tasksToText(tasks));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExport = () => {
    if (destination === "things") exportThings();
    else if (destination === "reminders") exportReminders();
    else if (destination === "todoist") exportTodoist();
    else exportCopy();
  };

  const totalSubtasks = tasks.reduce((n, t) => n + (t.subtasks?.length ?? 0), 0);

  // ── Confirmation screen ───────────────────────────────────────────────────

  if (sent) {
    const isReminders = sentTo === "reminders";
    return (
      <div className="flex flex-col gap-6 py-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-400">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-white text-xl font-semibold">
              {isReminders
                ? remindersViaShare ? "Sent to Apple Reminders!" : "File downloaded!"
                : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} sent!`}
            </p>
            {totalSubtasks > 0 && !isReminders && (
              <p className="text-gray-400 text-sm mt-0.5">with {totalSubtasks} subtask{totalSubtasks !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>

        {/* Apple Reminders post-export instructions */}
        {isReminders && !remindersViaShare && (
          <div className="bg-gray-800 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-white font-semibold text-sm">Now import into Apple Reminders:</p>
            <Step n={1}>Find the downloaded file — open your <strong className="text-white">Files app</strong> and look in the <strong className="text-white">Downloads</strong> folder for <strong className="text-white">tasks.ics</strong></Step>
            <Step n={2}>Tap the file. Your iPhone will ask <strong className="text-white">&ldquo;Add to Reminders?&rdquo;</strong> — tap <strong className="text-white">Add</strong></Step>
            <Step n={3}>Done! Open <strong className="text-white">Apple Reminders</strong> and your tasks will be there.</Step>
          </div>
        )}

        <button onClick={onReset} className="w-full py-3 bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all text-white font-medium rounded-2xl">
          Scan Another
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-6">No tasks found.</p>
        <button onClick={onReset} className="px-6 py-3 bg-gray-700 text-white rounded-2xl font-medium active:scale-95 transition-transform">Try Again</button>
      </div>
    );
  }

  // ── Destination tabs ──────────────────────────────────────────────────────

  const destinations: { id: Destination; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: "things",
      label: "Things 3",
      color: "text-blue-400",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "reminders",
      label: "Reminders",
      color: "text-orange-400",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M4 8a6 6 0 1 1 12 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 0 1-.515 1.076 32.91 32.91 0 0 1-3.256.508 3.5 3.5 0 0 1-6.972 0 32.903 32.903 0 0 1-3.256-.508.75.75 0 0 1-.515-1.076A11.448 11.448 0 0 0 4 8Zm6 7c-.655 0-1.305-.02-1.95-.057a2 2 0 0 0 3.9 0c-.645.038-1.295.057-1.95.057Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "todoist",
      label: "Todoist",
      color: "text-red-400",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: "copy",
      label: "Copy",
      color: "text-green-400",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
          <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
        </h2>
        <button onClick={onReset} className="text-sm text-gray-400 underline underline-offset-2">Start over</button>
      </div>

      {/* Task list */}
      <ul className="flex flex-col gap-2">
        {tasks.map((task, i) => (
          <li key={i} className="flex flex-col bg-gray-800 rounded-2xl px-4 py-3 gap-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              {editingIndex === i ? (
                <input autoFocus className="flex-1 bg-transparent text-white text-base outline-none border-b border-blue-400" value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(i)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(i); if (e.key === "Escape") { setEditingIndex(null); setEditValue(""); } }} />
              ) : (
                <span className="flex-1 text-white text-base cursor-pointer" onClick={() => startEdit(i)}>{task.title}</span>
              )}
              <button onClick={() => deleteTask(i)} className="text-gray-500 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0" aria-label="Delete">×</button>
            </div>

            {task.when && (
              <div className="flex items-center pl-5">
                <span className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M4.75 1a.75.75 0 0 1 .75.75V3h5V1.75a.75.75 0 0 1 1.5 0V3h.25A2.75 2.75 0 0 1 15 5.75v7.5A2.75 2.75 0 0 1 12.25 16H3.75A2.75 2.75 0 0 1 1 13.25v-7.5A2.75 2.75 0 0 1 3.75 3H4V1.75A.75.75 0 0 1 4.75 1Zm-1 5.5A.25.25 0 0 0 3.5 6.75v6.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25H3.75Z" clipRule="evenodd" />
                  </svg>
                  {formatWhen(task.when)}
                  <button onClick={() => clearWhen(i)} className="ml-0.5 text-gray-500 hover:text-gray-300" aria-label="Clear date">×</button>
                </span>
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="pl-5 flex flex-col gap-1.5 mt-1">
                <p className="text-xs text-purple-400 font-medium uppercase tracking-wide">Next steps</p>
                {task.subtasks.map((sub, si) => (
                  <div key={si} className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0">
                      <path fillRule="evenodd" d="M2.75 3.5a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75Zm0 4a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 4a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
                    </svg>
                    <span className="flex-1 text-gray-300 text-sm leading-snug">{sub}</span>
                    <button onClick={() => deleteSubtask(i, si)} className="text-gray-600 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0 mt-0.5" aria-label="Remove step">×</button>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Add task */}
      {adding && (
        <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
          <input autoFocus className="flex-1 bg-transparent text-white text-base outline-none border-b border-blue-400" placeholder="New task..."
            onBlur={(e) => { if (e.target.value.trim()) onTasksChange([...tasks, { title: e.target.value.trim() }]); setAdding(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value.trim(); if (v) onTasksChange([...tasks, { title: v }]); setAdding(false); } if (e.key === "Escape") setAdding(false); }} />
        </div>
      )}
      <button onClick={() => setAdding(true)} className="text-sm text-gray-400 text-left pl-2">+ Add task</button>

      {/* ── Destination picker ── */}
      <div className="mt-2 flex flex-col gap-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium pl-1">Send to</p>

        <div className="grid grid-cols-4 gap-2">
          {destinations.map(({ id, label, icon, color }) => (
            <button
              key={id}
              onClick={() => { setDestination(id); setExportError(""); }}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all ${
                destination === id
                  ? "bg-gray-700 ring-2 ring-blue-500 text-white"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              <span className={destination === id ? color : ""}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Things 3 — project picker */}
        {destination === "things" && (
          <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 flex-shrink-0">
              <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
            </svg>
            <input type="text" placeholder="Project or area (optional)" value={project} onChange={(e) => setProject(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500" />
          </div>
        )}

        {/* Apple Reminders — info */}
        {destination === "reminders" && (
          <div className="bg-gray-800 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-white text-sm font-semibold">Sends to Apple Reminders</p>
            <Step n={1}>Tap <strong className="text-white">&ldquo;Send to Apple Reminders&rdquo;</strong> below</Step>
            <Step n={2}><strong className="text-white">On iPhone:</strong> your share sheet opens — scroll down and tap <strong className="text-white">Reminders</strong> (the red icon). If you don&rsquo;t see it, tap <strong className="text-white">More</strong> first.</Step>
            <Step n={3}><strong className="text-white">On desktop:</strong> a <strong className="text-white">tasks.ics</strong> file will download — open it and your calendar or tasks app will offer to import it.</Step>
          </div>
        )}

        {/* Todoist — token setup or confirmation */}
        {destination === "todoist" && (
          <div className="flex flex-col gap-3">
            {todoistToken && !showTodoistSetup ? (
              <div className="flex items-center justify-between bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-gray-300">Todoist connected</span>
                </div>
                <button onClick={forgetTodoistToken} className="text-xs text-gray-500 underline">Change</button>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl p-4 flex flex-col gap-4">
                <div>
                  <p className="text-white text-sm font-semibold mb-3">Connect your Todoist account</p>
                  <div className="flex flex-col gap-3">
                    <Step n={1}>Open <strong className="text-white">todoist.com</strong> in another tab (or the Todoist app)</Step>
                    <Step n={2}>Click your <strong className="text-white">profile picture</strong> in the top-right corner</Step>
                    <Step n={3}>Click <strong className="text-white">Settings</strong></Step>
                    <Step n={4}>Click <strong className="text-white">Integrations</strong> in the left menu, then scroll to the bottom</Step>
                    <Step n={5}>You&rsquo;ll see <strong className="text-white">&ldquo;API token&rdquo;</strong> — click <strong className="text-white">Copy to clipboard</strong></Step>
                    <Step n={6}>Come back here and paste it below 👇</Step>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="password"
                    placeholder="Paste your Todoist API token here"
                    value={todoistTokenInput}
                    onChange={(e) => { setTodoistTokenInput(e.target.value); setTodoistTokenError(""); }}
                    className="w-full bg-gray-700 text-white text-sm rounded-xl px-4 py-3 outline-none placeholder:text-gray-500 font-mono"
                  />
                  {todoistTokenError && (
                    <p className="text-red-400 text-xs px-1">{todoistTokenError}</p>
                  )}
                  <button
                    onClick={saveTodoistToken}
                    disabled={!todoistTokenInput.trim() || todoistVerifying}
                    className="w-full py-3 bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 text-white font-medium rounded-xl text-sm transition-colors"
                  >
                    {todoistVerifying ? "Checking…" : "Save & Connect"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Copy — no extra UI needed */}
        {destination === "copy" && (
          <p className="text-gray-500 text-sm pl-1">Copies a plain-text task list to your clipboard — paste anywhere.</p>
        )}

        {exportError && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-2xl px-4 py-3 text-sm">
            {exportError}
          </div>
        )}

        {/* Export button */}
        {destination === "copy" ? (
          <button onClick={exportCopy} className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:scale-95 transition-all text-white text-lg font-semibold rounded-2xl shadow-lg shadow-blue-500/20">
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        ) : (
          <button
            onClick={handleExport}
            disabled={exporting || (destination === "todoist" && !todoistToken)}
            className="w-full py-4 bg-blue-500 disabled:bg-gray-600 disabled:text-gray-400 hover:bg-blue-400 active:scale-95 transition-all text-white text-lg font-semibold rounded-2xl shadow-lg shadow-blue-500/20"
          >
            {exporting ? "Sending…" : {
              things: "Add All to Things 3",
              reminders: "Send to Apple Reminders",
              todoist: todoistToken ? "Add All to Todoist" : "Connect Todoist First",
              copy: "Copy to Clipboard",
            }[destination]}
          </button>
        )}
      </div>
    </div>
  );
}
