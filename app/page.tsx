"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PAYMENT_LINK = "https://buy.stripe.com/8x2aEW6bU7gc5sQ2mV8Zq00";

// ── Demo animation ──────────────────────────────────────────────────────────

const DEMO_TASKS = [
  "Sarah sends proposal by Friday",
  "Review contract with legal",
  "Schedule team sync next week",
];

type DemoPhase = "idle" | "scanning" | "extracting" | "done";

function CaptureDemo() {
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    async function run() {
      if (cancelled) return;
      setPhase("idle");
      setVisible(0);

      await wait(900);
      if (cancelled) return;
      setPhase("scanning");

      await wait(2300);
      if (cancelled) return;
      setPhase("extracting");

      for (let i = 1; i <= DEMO_TASKS.length; i++) {
        await wait(420);
        if (cancelled) return;
        setVisible(i);
      }

      await wait(400);
      if (cancelled) return;
      setPhase("done");

      await wait(3200);
      if (!cancelled) run();
    }

    run();
    return () => { cancelled = true; };
  }, []);

  const scanning = phase === "scanning";
  const extracted = phase === "extracting" || phase === "done";

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Outer frame */}
      <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md grid sm:grid-cols-2">

        {/* ── Left: photo input ── */}
        <div className="relative overflow-hidden border-b sm:border-b-0 sm:border-r border-stone-200"
          style={{ background: "#f5f0e6" }}>

          {/* Camera badge */}
          <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
              Photo · Meeting notes
            </span>
          </div>

          {/* Simulated handwritten notes */}
          <div className="px-5 pb-5 font-mono text-[11px] leading-[1.85] select-none">
            <div className="text-stone-400 mb-1.5">Q1 Planning — 2/28</div>
            <div className="text-stone-300 mb-2">───────────────────</div>
            <div className="text-stone-600">→ Sarah sends proposal by Fri</div>
            <div className="text-stone-600">→ Review contract w/ legal</div>
            <div className="text-stone-600">→ Schedule team sync next wk</div>
            <div className="text-stone-600">→ Follow up on budget ask</div>
            <div className="text-stone-300 mt-2">───────────────────</div>
            <div className="text-stone-400 mt-1.5">Also: order office supplies</div>
          </div>

          {/* Scan line */}
          {scanning && (
            <div
              className="absolute left-0 right-0 h-px pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #f59e0b 30%, #fbbf24 50%, #f59e0b 70%, transparent 100%)",
                boxShadow: "0 0 14px 5px rgba(251,191,36,0.4)",
                animation: "scanDown 2.3s linear forwards",
                top: 0,
              }}
            />
          )}

          {/* "Extracted" badge */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
            style={{ opacity: extracted ? 1 : 0 }}
          >
            <div className="bg-amber-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md shadow-amber-500/30">
              ✓ Tasks extracted
            </div>
          </div>

          {/* Subtle tint when done */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{ background: "rgba(251,191,36,0.06)", opacity: extracted ? 1 : 0 }}
          />
        </div>

        {/* ── Right: Things 3 output ── */}
        <div className="bg-white flex flex-col">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ background: "#1C2033" }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#2F86FA" }}>
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M2 6.5L4.5 9L10 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white/80 text-[10px] font-medium tracking-wide">Things 3 · Inbox</span>

            {/* Pulsing dot when extracting */}
            {(phase === "extracting") && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" style={{ animation: "pulse 1s ease-in-out infinite" }} />
            )}
          </div>

          {/* Task list */}
          <div className="flex-1 divide-y divide-stone-100">
            {DEMO_TASKS.map((task, i) => (
              <div
                key={task}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  opacity: visible > i ? 1 : 0,
                  transform: visible > i ? "translateY(0)" : "translateY(5px)",
                  transition: "opacity 0.45s ease, transform 0.45s ease",
                }}
              >
                <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "#2F86FA" }} />
                <span className="text-stone-700 text-xs">{task}</span>
              </div>
            ))}

            {/* Idle placeholder */}
            {visible === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-stone-200 text-xs">Waiting for scan…</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loop indicator */}
      <p className="text-center text-stone-300 text-[10px] mt-3 font-light tracking-wide uppercase">
        Loops automatically · this is what it actually does
      </p>

      {/* Keyframes */}
      <style>{`
        @keyframes scanDown {
          from { top: 0% }
          to   { top: 100% }
        }
      `}</style>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 overflow-x-hidden">

      {/* Ambient warm glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(ellipse, #fbbf24 0%, transparent 70%)" }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border-2 border-amber-500/60 flex items-center justify-center">
            <span className="font-display italic text-amber-500 text-xs leading-none select-none">B</span>
          </div>
          <span className="font-display italic text-lg text-stone-900 tracking-tight">BetterTasks</span>
        </div>
        <Link href="/app" className="text-stone-400 hover:text-stone-600 text-sm transition-colors font-light">
          Already paid? Enter →
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">

        <h1 className="animate-fade-up font-display italic text-stone-900 tracking-tight mb-5"
          style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", lineHeight: 1.07 }}>
          Stop retyping tasks<br />
          <span className="text-amber-500">you already wrote.</span>
        </h1>

        <p className="animate-fade-up anim-delay-1 text-stone-500 text-lg font-light mb-10 leading-relaxed">
          Snap a photo, say it out loud, or paste a brain dump.<br />
          BetterTasks sends every task straight to Things&nbsp;3.
        </p>

        <div className="animate-fade-up anim-delay-2 flex flex-col items-center gap-3">
          <a
            href={PAYMENT_LINK}
            className="btn-amber inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20"
          >
            Get instant access · $10
          </a>
          <p className="text-stone-400 text-sm font-light">
            One-time · not a subscription · lasts 3–6 months
          </p>
        </div>
      </section>

      {/* ── Demo animation ──────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-28">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium text-center mb-6">
          Watch it work
        </p>
        <CaptureDemo />
      </section>

      {/* ── Situations ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">

        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium text-center mb-8">
          You&rsquo;ve been here before
        </p>

        <div className="grid sm:grid-cols-3 gap-4">

          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-sm transition-all">
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-3">After every meeting</p>
            <p className="text-stone-800 font-medium text-base leading-snug mb-1">
              The whiteboard is covered.
            </p>
            <p className="text-stone-500 text-sm font-light leading-snug">
              Photograph it. Every action<br />item lands in Things 3.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-sm transition-all">
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-3">On a walk</p>
            <p className="text-stone-800 font-medium text-base leading-snug mb-1">
              Good idea. You&rsquo;ll forget it.
            </p>
            <p className="text-stone-500 text-sm font-light leading-snug">
              Say it out loud. Done before<br />you finish the thought.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-sm transition-all">
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-3">End of day</p>
            <p className="text-stone-800 font-medium text-base leading-snug mb-1">
              Tabs, notes, texts, emails.
            </p>
            <p className="text-stone-500 text-sm font-light leading-snug">
              Paste the chaos. BetterTasks<br />picks out every task.
            </p>
          </div>

        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">

        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium text-center mb-8">
          How it works
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-0">

          <div className="flex-1 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-3 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-stone-700 font-medium text-sm mb-0.5">Capture</p>
            <p className="text-stone-400 text-xs font-light">Photo, voice, or paste</p>
          </div>

          <div className="hidden sm:block text-stone-300 text-lg">→</div>

          <div className="flex-1 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z" />
              </svg>
            </div>
            <p className="text-stone-700 font-medium text-sm mb-0.5">AI extracts</p>
            <p className="text-stone-400 text-xs font-light">Every task, dates included</p>
          </div>

          <div className="hidden sm:block text-stone-300 text-lg">→</div>

          <div className="flex-1 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-3 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-stone-700 font-medium text-sm mb-0.5">In your app</p>
            <p className="text-stone-400 text-xs font-light">Things 3, Reminders, Todoist</p>
          </div>
        </div>
      </section>

      {/* ── App mockups ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">

        <p className="text-xs text-stone-400 uppercase tracking-widest font-medium text-center mb-8">
          Tasks land exactly where you work
        </p>

        <div className="grid sm:grid-cols-3 gap-5">

          {/* ── Things 3 ── */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: "#1C2033" }}>
              <div className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0" style={{ background: "#2F86FA" }}>
                <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                  <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white/90 text-xs font-medium tracking-wide">Things 3 · Inbox</span>
            </div>
            <div className="bg-white divide-y divide-stone-100">
              {["Send project proposal to client", "Review the contract draft", "Schedule follow-up with team"].map((task) => (
                <div key={task} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "#2F86FA" }} />
                  <span className="text-stone-700 text-xs">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Apple Reminders ── */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-white border-b border-stone-100">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)" }}>
                <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                  <circle cx="7" cy="7" r="4" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-stone-800 text-xs font-semibold">Reminders</span>
            </div>
            <div className="bg-white divide-y divide-stone-100">
              {["Renew car registration", "Order birthday gift for Dad", "Fix the leaky faucet"].map((task) => (
                <div key={task} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-stone-300 flex-shrink-0" />
                  <span className="text-stone-700 text-xs">{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Todoist ── */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: "#DB4035" }}>
              <div className="w-6 h-6 rounded-[6px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                  <path d="M2 4h10M2 7h7M2 10h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-white/90 text-xs font-medium tracking-wide">Todoist · Inbox</span>
            </div>
            <div className="bg-white divide-y divide-stone-100">
              {["Pick up groceries", "Call the insurance company", "Plan the weekend trip"].map((task) => (
                <div key={task} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-stone-300 flex-shrink-0" />
                  <span className="text-stone-700 text-xs">{task}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-sm mx-auto px-6 pb-32">

        <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center relative overflow-hidden shadow-sm">
          <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-[0.15] blur-2xl"
            style={{ background: "radial-gradient(circle, #fbbf24, transparent)" }} />

          <div className="mb-0.5">
            <span className="font-display italic text-amber-500" style={{ fontSize: "5rem", lineHeight: 1 }}>$10</span>
          </div>
          <p className="text-stone-400 font-light text-sm mb-7">
            One-time · lasts 3–6 months
          </p>

          <ul className="text-left space-y-2.5 mb-8">
            {[
              "Unlimited photo scans",
              "Voice capture + AI breakdown",
              "Things 3, Reminders, Todoist",
              "No account, installs as PWA",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-amber-500 flex-shrink-0">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                <span className="text-stone-600 text-sm font-light">{f}</span>
              </li>
            ))}
          </ul>

          <a
            href={PAYMENT_LINK}
            className="btn-amber block w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-2xl shadow-md shadow-amber-500/20"
          >
            Get instant access
          </a>
          <p className="text-stone-400 text-xs mt-3 font-light">Secure checkout via Stripe</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-stone-200 py-7 px-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-amber-500/40 flex items-center justify-center">
            <span className="font-display italic text-amber-500 text-[10px] leading-none select-none">B</span>
          </div>
          <span className="text-stone-400 text-sm font-light">BetterTasks</span>
        </div>
        <p className="text-stone-300 text-xs font-light">
          Powered by Claude AI · Payments by Stripe
        </p>
        <Link href="/app" className="text-stone-400 hover:text-stone-600 text-xs transition-colors font-light">
          Already have access →
        </Link>
      </footer>

    </div>
  );
}
