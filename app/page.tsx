"use client";

import { useState } from "react";
import PhotoCapture from "@/components/PhotoCapture";
import AudioCapture from "@/components/AudioCapture";
import TaskList from "@/components/TaskList";
import type { Task } from "@/lib/claude";

type AppState = "capture" | "loading" | "review";
type InputMode = "photo" | "voice";

export default function Home() {
  const [state, setState] = useState<AppState>("capture");
  const [inputMode, setInputMode] = useState<InputMode>("photo");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState("Claude is reading your journal");

  const runExtraction = async (body: object, label: string) => {
    setState("loading");
    setLoadingLabel(label);
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to extract tasks");
      setTasks(data.tasks ?? []);
      setState("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("capture");
    }
  };

  const handleImageSelected = (
    base64: string,
    mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
    dataUrl: string
  ) => {
    setImagePreview(dataUrl);
    runExtraction({ image: base64, mediaType }, "Claude is reading your journal");
  };

  const handleVoiceTranscript = (text: string, smartBreakdown: boolean) => {
    setImagePreview(null);
    runExtraction(
      { text, smartBreakdown },
      smartBreakdown ? "Claude is breaking down your tasks" : "Claude is extracting your tasks"
    );
  };

  const handleReset = () => {
    setState("capture");
    setTasks([]);
    setError(null);
    setImagePreview(null);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8 pb-safe">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">JournalCut</h1>
          <p className="text-gray-400 mt-1 text-base">
            Capture tasks from your journal — send to Things 3
          </p>
        </div>

        {/* Capture screen */}
        {state === "capture" && (
          <div className="flex flex-col gap-6">
            {/* Tab switcher */}
            <div className="flex bg-gray-800 rounded-2xl p-1">
              <button
                onClick={() => setInputMode("photo")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  inputMode === "photo"
                    ? "bg-gray-600 text-white"
                    : "text-gray-400"
                }`}
              >
                Photo
              </button>
              <button
                onClick={() => setInputMode("voice")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  inputMode === "voice"
                    ? "bg-gray-600 text-white"
                    : "text-gray-400"
                }`}
              >
                Voice
              </button>
            </div>

            {inputMode === "photo" ? (
              <PhotoCapture onImageSelected={handleImageSelected} />
            ) : (
              <AudioCapture onTranscript={handleVoiceTranscript} />
            )}

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-2xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {inputMode === "photo" && (
              <p className="text-gray-500 text-sm text-center">
                Point your camera at a handwritten task list or daily journal page
              </p>
            )}
          </div>
        )}

        {/* Loading screen */}
        {state === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            {imagePreview && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Captured journal"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-lg">Extracting tasks…</p>
              <p className="text-gray-400 text-sm mt-1">{loadingLabel}</p>
            </div>
          </div>
        )}

        {/* Review screen */}
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
