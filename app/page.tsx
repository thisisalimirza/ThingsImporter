"use client";

import { useState } from "react";
import PhotoCapture from "@/components/PhotoCapture";
import TaskList from "@/components/TaskList";

type AppState = "capture" | "loading" | "review";

export default function Home() {
  const [state, setState] = useState<AppState>("capture");
  const [tasks, setTasks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (
    base64: string,
    mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
  ) => {
    setState("loading");
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to extract tasks");
      }

      setTasks(data.tasks ?? []);
      setState("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("capture");
    }
  };

  const handleReset = () => {
    setState("capture");
    setTasks([]);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8 pb-safe">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">JournalCut</h1>
          <p className="text-gray-400 mt-1 text-base">
            Photograph your journal, send tasks to Things 3
          </p>
        </div>

        {/* Content */}
        {state === "capture" && (
          <div className="flex flex-col gap-6">
            <PhotoCapture onImageSelected={handleImageSelected} />
            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-2xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div className="text-gray-500 text-sm text-center">
              Point your camera at a handwritten task list or daily journal page
            </div>
          </div>
        )}

        {state === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-lg">Extracting tasks…</p>
              <p className="text-gray-400 text-sm mt-1">Claude is reading your journal</p>
            </div>
          </div>
        )}

        {state === "review" && (
          <TaskList
            tasks={tasks}
            onTasksChange={setTasks}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}
