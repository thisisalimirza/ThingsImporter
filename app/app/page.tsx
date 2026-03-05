"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PhotoCapture from "@/components/PhotoCapture";
import AudioCapture from "@/components/AudioCapture";
import TaskList from "@/components/TaskList";
import type { Task } from "@/lib/claude";

// ── Access gate (inner — uses useSearchParams, must be inside Suspense) ────

function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "granted" | "denied">("loading");

  useEffect(() => {
    const verify = async () => {
      const sessionId = searchParams.get("session_id");

      // Fresh payment: exchange Stripe session for a signed token
      if (sessionId) {
        try {
          const res = await fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId)}`);
          const data = await res.json();
          if (data.token) {
            localStorage.setItem("bettertasks_access", data.token);
            // Clean up URL without reload
            router.replace("/app");
            setStatus("granted");
            return;
          }
        } catch { /* fall through to stored token check */ }
      }

      // Returning user: validate stored token
      const stored = localStorage.getItem("bettertasks_access");
      if (stored) {
        try {
          const res = await fetch("/api/check-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: stored }),
          });
          const data = await res.json();
          if (data.valid) {
            setStatus("granted");
            return;
          }
        } catch { /* fall through */ }
      }

      // No valid access — send to landing page
      router.replace("/");
    };

    verify();
  }, [router, searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-stone-800" />
          <div className="absolute inset-0 rounded-full border-[3px] border-amber-400 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (status === "denied") return null; // router.replace already fired

  return <>{children}</>;
}

// ── App core ───────────────────────────────────────────────────────────────

type AppState = "capture" | "loading" | "review";
type InputMode = "photo" | "voice";

function AppCore() {
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
    <main className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8 pb-safe">

        {/* Header */}
        <div className="mb-9 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full border-2 border-amber-400/70 flex items-center justify-center flex-shrink-0">
              <span className="font-display italic text-amber-400 text-base leading-none select-none">B</span>
            </div>
            <h1 className="font-display italic text-3xl text-stone-50 tracking-tight">BetterTasks</h1>
          </div>
          <p className="text-stone-500 text-sm font-light pl-0.5">
            Capture tasks from anywhere. Send them anywhere.
          </p>
        </div>

        {/* Capture screen */}
        {state === "capture" && (
          <div className="flex flex-col gap-5">
            <div className="animate-fade-up anim-delay-1 flex bg-stone-900 border border-stone-800/80 rounded-xl p-1 gap-1">
              <button
                onClick={() => setInputMode("photo")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === "photo"
                    ? "bg-amber-400 text-stone-950 shadow-sm"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                </svg>
                Scan
              </button>
              <button
                onClick={() => setInputMode("voice")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === "voice"
                    ? "bg-amber-400 text-stone-950 shadow-sm"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
                  <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
                </svg>
                Voice
              </button>
            </div>

            <div className="animate-fade-up anim-delay-2">
              {inputMode === "photo" ? (
                <PhotoCapture onImageSelected={handleImageSelected} />
              ) : (
                <AudioCapture onTranscript={handleVoiceTranscript} />
              )}
            </div>

            {error && (
              <div className="animate-fade-up bg-red-950/60 border border-red-800/60 text-red-300 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {inputMode === "photo" && (
              <p className="animate-fade-up anim-delay-3 text-stone-600 text-sm text-center font-light">
                Point your camera at any written task list, note, or whiteboard
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-7 animate-fade-up">
            {imagePreview && (
              <div className="w-28 h-28 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 rounded-full border-[3px] border-stone-800" />
              <div className="absolute inset-0 rounded-full border-[3px] border-amber-400 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-display italic text-xl text-stone-100">Finding tasks…</p>
              <p className="text-stone-500 text-sm mt-1.5 font-light">{loadingLabel}</p>
            </div>
          </div>
        )}

        {/* Review */}
        {state === "review" && (
          <TaskList tasks={tasks} onTasksChange={setTasks} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}

// ── Default export — wraps with access gate + Suspense ─────────────────────

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[3px] border-stone-800" />
            <div className="absolute inset-0 rounded-full border-[3px] border-amber-400 border-t-transparent animate-spin" />
          </div>
        </div>
      }
    >
      <AccessGate>
        <AppCore />
      </AccessGate>
    </Suspense>
  );
}
