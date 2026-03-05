"use client";

import { useState, useRef, useEffect } from "react";

interface AudioCaptureProps {
  onTranscript: (text: string, smartBreakdown: boolean) => void;
}

export default function AudioCapture({ onTranscript }: AudioCaptureProps) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [smartBreakdown, setSmartBreakdown] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimText(interim);
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => {
      setRecording(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (recording) {
      recognition.stop();
    } else {
      setTranscript("");
      setInterimText("");
      recognition.start();
      setRecording(true);
    }
  };

  const handleSubmit = () => {
    const full = transcript.trim();
    if (full) onTranscript(full, smartBreakdown);
  };

  if (!supported) {
    return (
      <div className="bg-stone-900 border border-stone-800/80 rounded-2xl px-4 py-6 text-center text-stone-500 text-sm">
        Voice input isn&apos;t supported in this browser. Try Safari on iPhone or Chrome.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Smart Breakdown toggle */}
      <button
        onClick={() => setSmartBreakdown((v) => !v)}
        className={`flex items-start gap-3 w-full text-left rounded-2xl px-4 py-4 transition-all border ${
          smartBreakdown
            ? "bg-amber-400/8 border-amber-400/30"
            : "bg-stone-900 border-stone-800/80"
        }`}
      >
        {/* Toggle pill */}
        <div className="mt-0.5 flex-shrink-0">
          <div
            className={`w-10 h-6 rounded-full flex items-center transition-colors ${
              smartBreakdown ? "bg-amber-400" : "bg-stone-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform shadow-sm ${
                smartBreakdown ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>
        <div>
          <p className={`font-medium text-sm ${smartBreakdown ? "text-amber-300" : "text-stone-200"}`}>
            Smart Breakdown
          </p>
          <p className="text-stone-500 text-xs mt-0.5 leading-relaxed font-light">
            AI suggests prerequisite steps for big tasks — so you always know the minimum next action
          </p>
        </div>
      </button>

      {/* Record button */}
      <button
        onClick={toggleRecording}
        className={`btn-amber flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-xl font-semibold ${
          recording
            ? "bg-red-500 shadow-lg shadow-red-500/20 text-white"
            : "bg-amber-400 shadow-lg shadow-amber-400/10 text-stone-950"
        }`}
      >
        {recording ? (
          <>
            <span className="w-3 h-3 rounded-sm bg-white animate-pulse" />
            Tap to stop
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
              <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
            </svg>
            Start speaking
          </>
        )}
      </button>

      {/* Transcript display */}
      {(transcript || interimText) && (
        <div className="bg-stone-900 border border-stone-800/80 rounded-2xl px-4 py-4 min-h-[80px]">
          <p className="text-xs text-stone-600 mb-2 uppercase tracking-wider font-medium">Transcript</p>
          <p className="text-stone-200 text-base leading-relaxed">
            {transcript}
            {interimText && <span className="text-stone-600">{interimText}</span>}
          </p>
        </div>
      )}

      {!recording && !transcript && (
        <p className="text-stone-600 text-sm text-center font-light">
          Dictate your tasks — e.g. &ldquo;Call dentist tomorrow, finish the quarterly report by Friday&rdquo;
        </p>
      )}

      {transcript && !recording && (
        <button
          onClick={handleSubmit}
          className="btn-amber w-full py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 text-lg font-semibold rounded-2xl shadow-lg shadow-amber-400/10"
        >
          Extract Tasks
        </button>
      )}
    </div>
  );
}
