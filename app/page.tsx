"use client";

import Link from "next/link";

const PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";

// ── Small helpers ──────────────────────────────────────────────────────────

function AmberDot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mx-0.5 translate-y-[-2px]" />;
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3 bg-stone-900/60 border border-stone-800/70 rounded-2xl p-5 hover:border-stone-700/80 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-stone-100 mb-1">{title}</h3>
        <p className="text-stone-500 text-sm leading-relaxed font-light">{body}</p>
      </div>
    </div>
  );
}

// ── Main landing page ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Ambient gradient — subtle warm blob behind hero */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "radial-gradient(ellipse, #f59e0b 0%, transparent 70%)" }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400/70 flex items-center justify-center">
            <span className="font-display italic text-amber-400 text-sm leading-none select-none">B</span>
          </div>
          <span className="font-display italic text-xl text-stone-100 tracking-tight">BetterTasks</span>
        </div>
        <Link
          href="/app"
          className="text-stone-500 hover:text-stone-300 text-sm transition-colors font-light"
        >
          Already paid? Enter →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-24 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-8 animate-fade-up">
          <span className="text-amber-400 text-xs font-medium tracking-wide uppercase">Like Readwise</span>
          <AmberDot />
          <span className="text-stone-400 text-xs font-light">but for the things you need to do</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up anim-delay-1 font-display italic text-5xl sm:text-6xl md:text-7xl text-stone-50 leading-[1.05] tracking-tight mb-6">
          Your tasks,<br />
          <span className="text-amber-400">wherever they came from</span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-up anim-delay-2 text-stone-400 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-10 font-light">
          Photograph a whiteboard. Dictate on a walk. Paste messy notes.
          BetterTasks reads everything, extracts what matters, and sends
          it straight into Things&nbsp;3, Apple Reminders, or Todoist.
        </p>

        {/* CTA */}
        <div className="animate-fade-up anim-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <a
            href={PAYMENT_LINK}
            className="btn-amber inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-amber-400/15"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
            </svg>
            Get Access · $10
          </a>
        </div>

        {/* Pricing note */}
        <p className="animate-fade-up anim-delay-4 text-stone-600 text-sm font-light">
          One-time payment, not a subscription <AmberDot /> $10 typically lasts 3–6 months of regular use
        </p>
      </section>

      {/* ── The analogy ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Readwise card */}
          <div className="bg-stone-900/50 border border-stone-800/70 rounded-3xl p-7">
            <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-4">Readwise does this for reading</p>
            <p className="text-stone-300 text-lg leading-relaxed font-light mb-5">
              You highlight something on Kindle. You clip an article in Safari. You photograph a passage in a physical book.
            </p>
            <p className="text-stone-100 font-semibold text-lg">
              Everything lands in one place — automatically.
            </p>
            {/* Mini flow */}
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {["Kindle", "Safari", "Physical book", "Twitter"].map((s, i) => (
                <span key={i} className="text-xs bg-stone-800 border border-stone-700/60 text-stone-400 px-2.5 py-1 rounded-full">{s}</span>
              ))}
              <span className="text-stone-700 text-sm mx-1">→</span>
              <span className="text-xs bg-amber-400/10 border border-amber-400/25 text-amber-300 px-2.5 py-1 rounded-full font-medium">Readwise</span>
            </div>
          </div>

          {/* BetterTasks card */}
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-3xl p-7">
            <p className="text-xs text-amber-400/60 uppercase tracking-widest font-medium mb-4">BetterTasks does this for tasks</p>
            <p className="text-stone-300 text-lg leading-relaxed font-light mb-5">
              You photograph a whiteboard after a meeting. You dictate a task during your commute. You paste a messy brain dump.
            </p>
            <p className="text-stone-100 font-semibold text-lg">
              Everything lands in your task manager — automatically.
            </p>
            {/* Mini flow */}
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              {["Whiteboard", "Voice note", "Brain dump", "Screenshot"].map((s, i) => (
                <span key={i} className="text-xs bg-stone-800/80 border border-stone-700/60 text-stone-400 px-2.5 py-1 rounded-full">{s}</span>
              ))}
              <span className="text-stone-700 text-sm mx-1">→</span>
              <span className="text-xs bg-amber-400/15 border border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-full font-medium">BetterTasks</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-10 text-center">How it works</p>

        {/* Flow diagram */}
        <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-0">

          {/* Step 1 — Capture */}
          <div className="flex-1 flex flex-col items-center text-center p-6 bg-stone-900/60 border border-stone-800/70 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
            <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700/60 flex items-center justify-center mb-4 text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-amber-400/60 font-medium uppercase tracking-wider mb-2">Capture</span>
            <h3 className="font-semibold text-stone-100 mb-2">Photograph or dictate</h3>
            <p className="text-stone-500 text-sm font-light">Take a photo of any written list, whiteboard, or note. Or just say your tasks out loud.</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center md:px-0 py-3 md:py-0 md:-mx-px">
            <div className="md:hidden w-px h-6 bg-amber-400/20" />
            <div className="hidden md:block h-px w-8 bg-amber-400/20" />
          </div>

          {/* Step 2 — AI reads */}
          <div className="flex-1 flex flex-col items-center text-center p-6 bg-amber-400/5 border border-amber-400/15 md:border-y">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mb-4 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M16.5 7.5h-9v9h9v-9Z" />
                <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 0 1 9 3v.75h2.25V3a.75.75 0 0 1 1.5 0v.75H15V3a.75.75 0 0 1 1.5 0v.75h.75a3 3 0 0 1 3 3v.75H21A.75.75 0 0 1 21 9h-.75v2.25H21a.75.75 0 0 1 0 1.5h-.75V15H21a.75.75 0 0 1 0 1.5h-.75v.75a3 3 0 0 1-3 3h-.75V21a.75.75 0 0 1-1.5 0v-.75h-2.25V21a.75.75 0 0 1-1.5 0v-.75H9V21a.75.75 0 0 1-1.5 0v-.75h-.75a3 3 0 0 1-3-3v-.75H3A.75.75 0 0 1 3 15h.75v-2.25H3a.75.75 0 0 1 0-1.5h.75V9H3a.75.75 0 0 1 0-1.5h.75v-.75a3 3 0 0 1 3-3h.75V3a.75.75 0 0 1 .75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h10.5a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6.75Z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-amber-400/60 font-medium uppercase tracking-wider mb-2">AI Reads</span>
            <h3 className="font-semibold text-stone-100 mb-2">Claude extracts the tasks</h3>
            <p className="text-stone-500 text-sm font-light">Claude AI reads your input and pulls out every actionable item — dates, subtasks, and all.</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center py-3 md:py-0 md:-mx-px">
            <div className="md:hidden w-px h-6 bg-amber-400/20" />
            <div className="hidden md:block h-px w-8 bg-amber-400/20" />
          </div>

          {/* Step 3 — Send */}
          <div className="flex-1 flex flex-col items-center text-center p-6 bg-stone-900/60 border border-stone-800/70 rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">
            <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700/60 flex items-center justify-center mb-4 text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-amber-400/60 font-medium uppercase tracking-wider mb-2">Send</span>
            <h3 className="font-semibold text-stone-100 mb-2">Straight to your app</h3>
            <p className="text-stone-500 text-sm font-light">One tap sends everything to Things&nbsp;3, Apple Reminders, Todoist, or your clipboard.</p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-10 text-center">Features</p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCard
            title="Scan any surface"
            body="Whiteboards, sticky notes, physical notebooks, screenshots, printed lists — if you can photograph it, BetterTasks can read it."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
            }
          />
          <FeatureCard
            title="Dictate on the go"
            body="Open BetterTasks and speak. It transcribes your voice and extracts every task — even when you ramble."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
                <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
              </svg>
            }
          />
          <FeatureCard
            title="Smart Breakdown"
            body="For big tasks, AI suggests the minimum next action so your list is always actionable, never overwhelming."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75H10a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 15.25Z" clipRule="evenodd" />
              </svg>
            }
          />
          <FeatureCard
            title="Things 3 native"
            body="Sends tasks directly into Things 3 via URL scheme — with project assignment, dates, and subtasks preserved."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            }
          />
          <FeatureCard
            title="Apple Reminders & Todoist"
            body="Works with Apple Reminders via .ics export, and Todoist via their official API with your personal token."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4 8a6 6 0 1 1 12 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 0 1-.515 1.076 32.91 32.91 0 0 1-3.256.508 3.5 3.5 0 0 1-6.972 0 32.903 32.903 0 0 1-3.256-.508.75.75 0 0 1-.515-1.076A11.448 11.448 0 0 0 4 8Zm6 7c-.655 0-1.305-.02-1.95-.057a2 2 0 0 0 3.9 0c-.645.038-1.295.057-1.95.057Z" clipRule="evenodd" />
              </svg>
            }
          />
          <FeatureCard
            title="Runs on your device"
            body="A mobile-first PWA. No accounts, no sync, no subscriptions. Add to your home screen and use it like a native app."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M8 16.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
                <path fillRule="evenodd" d="M4 4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4Zm4-1.5v.75c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75V2.5h1A1.5 1.5 0 0 1 14.5 4v12a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 16V4A1.5 1.5 0 0 1 7 2.5h1Z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="relative z-10 max-w-lg mx-auto px-6 pb-28">
        <p className="text-xs text-stone-600 uppercase tracking-widest font-medium mb-10 text-center">Pricing</p>

        <div className="bg-stone-900/70 border border-stone-800/80 rounded-3xl p-8 text-center relative overflow-hidden">
          {/* Subtle amber corner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.07] blur-2xl"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }}
          />

          {/* Price */}
          <div className="mb-1">
            <span className="font-display italic text-7xl text-amber-400">$10</span>
          </div>
          <p className="text-stone-400 font-light mb-8">one-time · not a subscription</p>

          {/* What it is */}
          <div className="bg-amber-400/8 border border-amber-400/15 rounded-2xl px-5 py-4 mb-8 text-left">
            <p className="text-stone-200 text-sm leading-relaxed font-light">
              Your $10 covers Claude AI API usage for the life of your access token —
              enough for <strong className="text-stone-100 font-medium">3 to 6 months</strong> of regular use
              for most people. When you need a top-up, it&rsquo;s another $10.
            </p>
          </div>

          {/* Features */}
          <ul className="text-left flex flex-col gap-2.5 mb-8">
            {[
              "Unlimited photo scans (within usage credit)",
              "Voice capture + Smart Breakdown",
              "Things 3, Apple Reminders, Todoist, clipboard",
              "Access token valid for 180 days",
              "No account required · installs as PWA",
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                <span className="text-stone-400 text-sm font-light">{f}</span>
              </li>
            ))}
          </ul>

          <a
            href={PAYMENT_LINK}
            className="btn-amber block w-full py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 text-lg font-semibold rounded-2xl shadow-lg shadow-amber-400/10"
          >
            Get Access · $10
          </a>

          <p className="text-stone-700 text-xs mt-4 font-light">
            Secure checkout via Stripe
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-stone-900 px-6 py-8 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-amber-400/50 flex items-center justify-center">
            <span className="font-display italic text-amber-400 text-xs leading-none select-none">B</span>
          </div>
          <span className="text-stone-600 text-sm font-light">BetterTasks</span>
        </div>
        <p className="text-stone-700 text-xs font-light text-center">
          Powered by Claude AI · Payments by Stripe · No accounts, no servers, no fuss
        </p>
        <Link href="/app" className="text-stone-700 hover:text-stone-500 text-xs transition-colors font-light">
          Already have access →
        </Link>
      </footer>
    </div>
  );
}
