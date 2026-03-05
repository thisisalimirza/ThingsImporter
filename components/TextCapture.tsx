"use client";

import { useState } from "react";

interface TextCaptureProps {
  onTranscript: (text: string, smartBreakdown: boolean) => void;
}

export default function TextCapture({ onTranscript }: TextCaptureProps) {
  const [text, setText] = useState("");
  const [smartBreakdown, setSmartBreakdown] = useState(false);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) onTranscript(trimmed, smartBreakdown);
  };

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
        <div className="mt-0.5 flex-shrink-0">
          <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${smartBreakdown ? "bg-amber-400" : "bg-stone-700"}`}>
            <div className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform shadow-sm ${smartBreakdown ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>
        <div>
          <p className={`font-medium text-sm ${smartBreakdown ? "text-amber-300" : "text-stone-200"}`}>Smart Breakdown</p>
          <p className="text-stone-500 text-xs mt-0.5 leading-relaxed font-light">
            AI suggests prerequisite steps for big tasks — so you always know the next action
          </p>
        </div>
      </button>

      {/* Text area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste or type your tasks here…\n\nExamples:\n• Call dentist tomorrow\n• Finish Q4 report by Friday\n• Buy groceries"}
          rows={8}
          className="w-full bg-stone-900 border border-stone-800/80 text-stone-200 text-sm rounded-2xl px-4 py-4 outline-none placeholder:text-stone-600 font-light leading-relaxed resize-none focus:border-amber-400/40 transition-colors"
        />
        {text && (
          <button
            onClick={() => setText("")}
            className="absolute top-3 right-3 text-stone-700 hover:text-stone-400 transition-colors text-lg leading-none"
            aria-label="Clear"
          >
            ×
          </button>
        )}
      </div>

      {!text && (
        <p className="text-stone-600 text-sm text-center font-light -mt-1">
          Paste meeting notes, a list, or anything with tasks in it
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="btn-amber w-full py-4 bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 hover:bg-amber-300 text-stone-950 text-lg font-semibold rounded-2xl shadow-lg shadow-amber-400/10"
      >
        Extract Tasks
      </button>
    </div>
  );
}
