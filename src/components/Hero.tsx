"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Timer, Zap, Clock } from "lucide-react";

const stats = [
  { icon: Timer, value: "15 min", label: "avg. interview length" },
  { icon: Zap, value: "90%", label: "faster than embassy queue" },
  { icon: Clock, value: "24/7", label: "interview availability" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink pt-16 pb-24 md:pt-24 md:pb-32">
      {/* world-map dot grid, decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--steel) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 md:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-3 bg-ink-2 px-3 py-1 text-xs text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
            6 countries taking applications tonight
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.08] text-[var(--foreground)] md:text-6xl">
            Your visa decided
            <br />
            by <span className="text-gradient-brand">this evening.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-mist">
            Apply for a study, spouse, visit, or work visa. Sit a scheduled
            interview from home. Get a documented decision the same day —
            instead of a three-month embassy queue.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/apply"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
            >
              Start your application
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-mist underline decoration-ink-3 underline-offset-4 transition-colors hover:text-gold-bright hover:decoration-gold-bright"
            >
              I already applied
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-ink-3 bg-ink-2/50 p-4 transition-all duration-500 ease-out will-change-transform hover:-translate-y-1 hover:border-gold/60 hover:bg-ink-2 hover:shadow-[0_20px_45px_-18px_rgba(210,31,31,0.45)]"
              >
                {/* radial glow reveal */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-bright/0 blur-2xl transition-all duration-500 group-hover:bg-gold-bright/20"
                />

                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-[0_6px_16px_-6px_rgba(210,31,31,0.5)] transition-all duration-500 ease-out group-hover:-rotate-3 group-hover:scale-110">
                  <s.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                </div>

                <p className="relative mt-3 font-display text-xl text-[var(--foreground)] transition-colors duration-500 group-hover:text-gold-bright sm:text-2xl">
                  {s.value}
                </p>
                <p className="relative mt-0.5 text-[11px] leading-snug text-steel sm:text-xs">
                  {s.label}
                </p>

                {/* bottom accent bar that grows in */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-brand transition-all duration-500 ease-out group-hover:w-full"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <BoardingPassCard />
      </div>
    </section>
  );
}

function BoardingPassCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
      className="relative mx-auto w-full max-w-sm animate-drift"
    >
      <div className="overflow-hidden rounded-2xl border border-ink-3 bg-ink-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-dashed border-ink-3 px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-steel">Applicant</p>
            <p className="font-display text-lg text-[var(--foreground)]">A. Rahman</p>
          </div>
          <span className="stamp-ring flex h-14 w-14 items-center justify-center text-[10px] font-medium text-gold">
            APPROVED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 px-6 py-6">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-steel">From</p>
            <p className="font-display text-2xl text-[var(--foreground)]">FSD</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-steel">To</p>
            <p className="font-display text-2xl text-[var(--foreground)]">YYZ</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-steel">Visa type</p>
            <p className="text-sm text-[var(--foreground)]">Study Visa</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-steel">Decision</p>
            <p className="text-sm text-[var(--foreground)]">Same evening</p>
          </div>
        </div>

        <div className="perforated-left flex items-center justify-between bg-ink px-6 py-4">
          <p className="text-[10px] uppercase tracking-wide text-steel">Interview</p>
          <p className="text-sm text-gold-bright">Today · 4:30 PM</p>
        </div>
      </div>
    </motion.div>
  );
}
