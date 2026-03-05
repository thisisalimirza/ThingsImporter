"use client";

import { useState } from "react";
import type { Task } from "@/lib/claude";

interface TaskListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onReset: () => void;
}

function formatWhen(when: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(when)) {
    return new Date(when + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  return when.charAt(0).toUpperCase() + when.slice(1);
}

export default function TaskList({ tasks, onTasksChange, onReset }: TaskListProps) {
  const [project, setProject] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [sent, setSent] = useState(false);

  const deleteTask = (index: number) => {
    onTasksChange(tasks.filter((_, i) => i !== index));
  };

  const clearWhen = (index: number) => {
    onTasksChange(tasks.map((t, i) => (i === index ? { ...t, when: undefined } : t)));
  };

  const deleteSubtask = (taskIndex: number, subIndex: number) => {
    onTasksChange(
      tasks.map((t, i) =>
        i === taskIndex
          ? { ...t, subtasks: t.subtasks?.filter((_, si) => si !== subIndex) }
          : t
      )
    );
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(tasks[index].title);
  };

  const commitEdit = (index: number) => {
    if (editValue.trim()) {
      onTasksChange(tasks.map((t, i) => (i === index ? { ...t, title: editValue.trim() } : t)));
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const addToThings = () => {
    const data = tasks.map(({ title, when, subtasks }) => ({
      type: "to-do",
      attributes: {
        title,
        ...(when ? { when } : {}),
        ...(project.trim() ? { list: project.trim() } : {}),
        ...(subtasks && subtasks.length > 0
          ? {
              "checklist-items": subtasks.map((s) => ({
                type: "checklist-item",
                attributes: { title: s },
              })),
            }
          : {}),
      },
    }));
    const url = `things:///json?data=${encodeURIComponent(JSON.stringify(data))}`;
    window.location.href = url;
    setSent(true);
  };

  const totalSubtasks = tasks.reduce((n, t) => n + (t.subtasks?.length ?? 0), 0);

  // Confirmation screen
  if (sent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-400">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-white text-xl font-semibold">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} sent to Things 3
          </p>
          {totalSubtasks > 0 && (
            <p className="text-gray-400 text-sm mt-1">
              with {totalSubtasks} check-item{totalSubtasks !== 1 ? "s" : ""}
            </p>
          )}
          {project && (
            <p className="text-gray-400 text-sm mt-1">Added to &ldquo;{project}&rdquo;</p>
          )}
        </div>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all text-white font-medium rounded-2xl"
        >
          Scan Another
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-6">No tasks found.</p>
        <button onClick={onReset} className="px-6 py-3 bg-gray-700 text-white rounded-2xl font-medium active:scale-95 transition-transform">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
        </h2>
        <button onClick={onReset} className="text-sm text-gray-400 underline underline-offset-2">
          Start over
        </button>
      </div>

      {/* Project picker */}
      <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-3">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 flex-shrink-0">
          <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
        </svg>
        <input
          type="text"
          placeholder="Things project or area (optional)"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
        />
      </div>

      {/* Task list */}
      <ul className="flex flex-col gap-2">
        {tasks.map((task, i) => (
          <li key={i} className="flex flex-col bg-gray-800 rounded-2xl px-4 py-3 gap-2">
            {/* Task title row */}
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              {editingIndex === i ? (
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-white text-base outline-none border-b border-blue-400"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(i);
                    if (e.key === "Escape") { setEditingIndex(null); setEditValue(""); }
                  }}
                />
              ) : (
                <span className="flex-1 text-white text-base cursor-pointer" onClick={() => startEdit(i)}>
                  {task.title}
                </span>
              )}
              <button onClick={() => deleteTask(i)} className="text-gray-500 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0" aria-label="Delete task">
                ×
              </button>
            </div>

            {/* Date badge */}
            {task.when && (
              <div className="flex items-center gap-1 pl-5">
                <span className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M4.75 1a.75.75 0 0 1 .75.75V3h5V1.75a.75.75 0 0 1 1.5 0V3h.25A2.75 2.75 0 0 1 15 5.75v7.5A2.75 2.75 0 0 1 12.25 16H3.75A2.75 2.75 0 0 1 1 13.25v-7.5A2.75 2.75 0 0 1 3.75 3H4V1.75A.75.75 0 0 1 4.75 1Zm-1 5.5A.25.25 0 0 0 3.5 6.75v6.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25H3.75Z" clipRule="evenodd" />
                  </svg>
                  {formatWhen(task.when)}
                  <button onClick={() => clearWhen(i)} className="ml-0.5 text-gray-500 hover:text-gray-300" aria-label="Clear date">×</button>
                </span>
              </div>
            )}

            {/* Subtasks (smart breakdown) */}
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
          <input
            autoFocus
            className="flex-1 bg-transparent text-white text-base outline-none border-b border-blue-400"
            placeholder="New task..."
            onBlur={(e) => {
              if (e.target.value.trim()) onTasksChange([...tasks, { title: e.target.value.trim() }]);
              setAdding(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) onTasksChange([...tasks, { title: val }]);
                setAdding(false);
              }
              if (e.key === "Escape") setAdding(false);
            }}
          />
        </div>
      )}

      <button onClick={() => setAdding(true)} className="text-sm text-gray-400 text-left pl-2">
        + Add task
      </button>

      <button
        onClick={addToThings}
        className="mt-2 w-full py-4 bg-blue-500 hover:bg-blue-400 active:scale-95 transition-all text-white text-lg font-semibold rounded-2xl shadow-lg shadow-blue-500/20"
      >
        Add All to Things 3
      </button>
    </div>
  );
}
