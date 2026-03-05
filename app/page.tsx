"use client";

import Link from "next/link";

const PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 overflow-x-hidden">

      {/* Ambient warm glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[360px] opacity-[0.055] blur-3xl"
        style={{ background: "radial-gradient(ellipse, #f59e0b 0%, transparent 70%)" }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border-2 border-amber-400/70 flex items-center justify-center">
            <span className="font-display italic text-amber-400 text-xs leading-none select-none">B</span>
          </div>
          <span className="font-display italic text-lg text-stone-100 tracking-tight">BetterTasks</span>
        </div>
        <Link href="/app" className="text-stone-500 hover:text-stone-300 text-sm transition-colors font-light">
          Already paid? Enter →
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">

        <h1 className="animate-fade-up font-display italic text-stone-50 tracking-tight mb-5"
          style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", lineHeight: 1.07 }}>
          Stop retyping tasks<br />
          <span className="text-amber-400">you already wrote.</span>
        </h1>

        <p className="animate-fade-up anim-delay-1 text-stone-400 text-lg font-light mb-10 leading-relaxed">
          Snap a photo, say it out loud, or paste a brain dump.<br />
          BetterTasks sends every task straight to Things&nbsp;3.
        </p>

        <div className="animate-fade-up anim-delay-2 flex flex-col items-center gap-3">
          <a
            href={PAYMENT_LINK}
            className="btn-amber inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-amber-400/15"
          >
            Get instant access · $10
          </a>
          <p className="text-stone-600 text-sm font-light">
            One-time · not a subscription · lasts 3–6 months
          </p>
        </div>
      </section>

      {/* ── Situations ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">

        <p className="text-xs text-stone-700 uppercase tracking-widest font-medium text-center mb-8">
          You&rsquo;ve been here before
        </p>

        <div className="grid sm:grid-cols-3 gap-4">

          {/* Situation 1 */}
          <div className="bg-stone-900/70 border border-stone-800/60 rounded-2xl p-6 hover:border-stone-700/70 transition-colors">
            <p className="text-stone-600 text-xs font-medium uppercase tracking-wider mb-3">After every meeting</p>
            <p className="text-stone-100 font-medium text-base leading-snug mb-1">
              The whiteboard is covered.
            </p>
            <p className="text-stone-500 text-sm font-light leading-snug">
              Photograph it. Every action<br />item lands in Things 3.
            </p>
          </div>

          {/* Situation 2 */}
          <div className="bg-stone-900/70 border border-stone-800/60 rounded-2xl p-6 hover:border-stone-700/70 transition-colors">
            <p className="text-stone-600 text-xs font-medium uppercase tracking-wider mb-3">On a walk</p>
            <p className="text-stone-100 font-medium text-base leading-snug mb-1">
              Good idea. You&rsquo;ll forget it.
            </p>
            <p className="text-stone-500 text-sm font-light leading-snug">
              Say it out loud. Done before<br />you finish the thought.
            </p>
          </div>

          {/* Situation 3 */}
          <div className="bg-stone-900/70 border border-stone-800/60 rounded-2xl p-6 hover:border-stone-700/70 transition-colors">
            <p className="text-stone-600 text-xs font-medium uppercase tracking-wider mb-3">End of day</p>
            <p className="text-stone-100 font-medium text-base leading-snug mb-1">
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

        <p className="text-xs text-stone-700 uppercase tracking-widest font-medium text-center mb-8">
          How it works
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-0">

          <div className="flex-1 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-stone-200 font-medium text-sm mb-0.5">Capture</p>
            <p className="text-stone-600 text-xs font-light">Photo, voice, or paste</p>
          </div>

          <div className="hidden sm:block text-stone-800 text-lg">→</div>

          <div className="flex-1 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.061 1.06l1.06 1.06Z" />
              </svg>
            </div>
            <p className="text-stone-200 font-medium text-sm mb-0.5">AI extracts</p>
            <p className="text-stone-600 text-xs font-light">Every task, dates included</p>
          </div>

          <div className="hidden sm:block text-stone-800 text-lg">→</div>

          <div className="flex-1 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-stone-200 font-medium text-sm mb-0.5">In your app</p>
            <p className="text-stone-600 text-xs font-light">Things 3, Reminders, Todoist</p>
          </div>
        </div>
      </section>

      {/* ── Works with ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <p className="text-xs text-stone-700 uppercase tracking-widest font-medium text-center mb-6">
          Works with
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { label: "Things 3",       color: "text-blue-400",   ring: "ring-blue-400/30"   },
            { label: "Apple Reminders",color: "text-orange-400", ring: "ring-orange-400/30" },
            { label: "Todoist",        color: "text-red-400",    ring: "ring-red-400/30"    },
            { label: "Clipboard",      color: "text-green-400",  ring: "ring-green-400/30"  },
          ].map(({ label, color, ring }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 bg-stone-900 ring-1 ${ring} px-4 py-2 rounded-full text-sm font-medium ${color}`}
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-sm mx-auto px-6 pb-32">

        <div className="bg-stone-900/80 border border-stone-800/80 rounded-3xl p-8 text-center relative overflow-hidden">
          {/* Glow */}
          <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-[0.08] blur-2xl"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />

          <div className="mb-0.5">
            <span className="font-display italic text-amber-400" style={{ fontSize: "5rem", lineHeight: 1 }}>$10</span>
          </div>
          <p className="text-stone-500 font-light text-sm mb-7">
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-amber-400 flex-shrink-0">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                <span className="text-stone-400 text-sm font-light">{f}</span>
              </li>
            ))}
          </ul>

          <a
            href={PAYMENT_LINK}
            className="btn-amber block w-full py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded-2xl shadow-lg shadow-amber-400/10"
          >
            Get instant access
          </a>
          <p className="text-stone-700 text-xs mt-3 font-light">Secure checkout via Stripe</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-stone-900 py-7 px-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-amber-400/50 flex items-center justify-center">
            <span className="font-display italic text-amber-400 text-[10px] leading-none select-none">B</span>
          </div>
          <span className="text-stone-600 text-sm font-light">BetterTasks</span>
        </div>
        <p className="text-stone-800 text-xs font-light">
          Powered by Claude AI · Payments by Stripe
        </p>
        <Link href="/app" className="text-stone-700 hover:text-stone-500 text-xs transition-colors font-light">
          Already have access →
        </Link>
      </footer>

    </div>
  );
}
