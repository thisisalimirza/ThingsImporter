"use client";

import { useState, useRef, useEffect } from "react";

interface AudioCaptureProps {
  onTranscript: (text: string) => void;
}

// Extend window for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function AudioCapture({ onTranscript }: AudioCaptureProps) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
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
    if (full) onTranscript(full);
  };

  if (!supported) {
    return (
      <div className="bg-gray-800 rounded-2xl px-4 py-6 text-center text-gray-400 text-sm">
        Voice input isn&apos;t supported in this browser. Try Safari on iPhone or Chrome.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Record button */}
      <button
        onClick={toggleRecording}
        className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-white text-xl font-semibold active:scale-95 transition-all ${
          recording
            ? "bg-red-500 shadow-lg shadow-red-500/30"
            : "bg-blue-500 shadow-lg shadow-blue-500/20"
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
              className="w-7 h-7"
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
        <div className="bg-gray-800 rounded-2xl px-4 py-4 min-h-[80px]">
          <p className="text-sm text-gray-400 mb-2">Transcript</p>
          <p className="text-white text-base leading-relaxed">
            {transcript}
            {interimText && (
              <span className="text-gray-500">{interimText}</span>
            )}
          </p>
        </div>
      )}

      {/* Hint */}
      {!recording && !transcript && (
        <p className="text-gray-500 text-sm text-center">
          Dictate your tasks naturally — e.g. &ldquo;Call dentist tomorrow, review the report by Friday&rdquo;
        </p>
      )}

      {/* Submit */}
      {transcript && !recording && (
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:scale-95 transition-all text-white text-lg font-semibold rounded-2xl shadow-lg shadow-blue-500/20"
        >
          Extract Tasks
        </button>
      )}
    </div>
  );
}
