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
  const [loadingLabel, setLoadingLabel] = useState("Scanning for tasks…");

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
    runExtraction({ image: base64, mediaType }, "Reading your image…");
  };

  const handleVoiceTranscript = (text: string, smartBreakdown: boolean) => {
    setImagePreview(null);
    runExtraction(
      { text, smartBreakdown },
      smartBreakdown ? "Breaking down your tasks…" : "Extracting your tasks…"
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
          <div className="flex items-center gap-3 mb-1.5">
            {/* Logo mark */}
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">BetterTasks</h1>
          </div>
          <p className="text-gray-400 text-base pl-0.5">
            Capture tasks from anywhere. Send them anywhere.
          </p>
        </div>

        {/* Capture screen */}
        {state === "capture" && (
          <div className="flex flex-col gap-6">
            {/* Tab switcher */}
            <div className="flex bg-gray-800 rounded-2xl p-1">
              <button
                onClick={() => setInputMode("photo")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  inputMode === "photo" ? "bg-gray-600 text-white" : "text-gray-400"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                </svg>
                Scan
              </button>
              <button
                onClick={() => setInputMode("voice")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  inputMode === "voice" ? "bg-gray-600 text-white" : "text-gray-400"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
                  <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
                </svg>
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
                Point your camera at any written task list, note, or whiteboard
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
                <img src={imagePreview} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-lg">Finding tasks…</p>
              <p className="text-gray-400 text-sm mt-1">{loadingLabel}</p>
            </div>
          </div>
        )}

        {/* Review screen */}
        {state === "review" && (
          <TaskList tasks={tasks} onTasksChange={setTasks} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
