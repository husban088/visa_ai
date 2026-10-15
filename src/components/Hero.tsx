"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  FileSignature,
  Mic,
  Plane,
  Plus,
  Sparkles,
  Timer,
  Zap,
  Globe,
} from "lucide-react";

const stats = [
  { icon: Zap, value: "Instant", label: "AI offer decision" },
  { icon: Timer, value: "15 min", label: "avg. visa interview" },
  { icon: Globe, value: "21+", label: "countries hiring" },
];

const pipeline = [
  {
    icon: Briefcase,
    title: "Apply for a job",
    note: "CV, portfolio & answers",
  },
  { icon: Sparkles, title: "AI checks your profile", note: "Score in seconds" },
  {
    icon: FileSignature,
    title: "Offer letter issued",
    note: "Auto-accepted for you",
  },
  { icon: Mic, title: "Visa interview", note: "Voice or typed, recorded" },
  { icon: BadgeCheck, title: "Visa decision", note: "Approved the same day" },
];

function PipelineCard() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((a) => (a + 1) % (pipeline.length + 1)),
      1700,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-md"
    >
      {/* floating accents */}
      <motion.span
        aria-hidden
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-3 -top-5 z-10 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-gold shadow-xl sm:-right-6"
      >
        <BadgeCheck className="h-4 w-4" /> Offer accepted
      </motion.span>
      <motion.span
        aria-hidden
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-5 -left-3 z-10 flex items-center gap-1.5 rounded-full bg-black px-3.5 py-2 text-xs font-medium text-white shadow-xl sm:-left-6"
      >
        <Plane className="h-4 w-4 -rotate-45 text-gold-bright" /> Visa approved
      </motion.span>

      <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-7">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
            Your journey
          </p>
          <span className="flex items-center gap-1.5 text-[11px] text-white/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            live demo
          </span>
        </div>

        <ol className="mt-5 space-y-2.5">
          {pipeline.map((s, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <li
                key={s.title}
                className={`flex items-center gap-3.5 rounded-2xl border px-4 py-3 transition-all duration-500 ${
                  current
                    ? "scale-[1.03] border-white/50 bg-white/20 shadow-lg"
                    : done
                      ? "border-white/15 bg-white/10"
                      : "border-white/10 bg-white/[0.03] opacity-60"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${
                    done || current
                      ? "bg-white text-gold"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {s.title}
                  </p>
                  <p className="truncate text-xs text-white/60">{s.note}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white"
            animate={{
              width: `${(Math.min(active, pipeline.length) / pipeline.length) * 100}%`,
            }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-brand pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="orb orb-a" aria-hidden />
      <div className="orb orb-b" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-widest text-white/85 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered job to visa platform
          </span>

          <h1 className="mt-6 font-display text-[2.5rem] leading-[1.08] text-white sm:text-5xl md:text-6xl">
            Get hired abroad.
            <br />
            <span className="italic text-white/80">Get your visa</span> the same
            day.
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/75 lg:mx-0">
            Apply for tech jobs in any country. Our AI reviews your profile and
            issues your offer letter instantly. Accept it, sit a short voice or
            typed interview from home, and get your work-visa decision — no
            embassy queue.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/jobs"
              className="btn-sheen group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium text-gold transition-transform hover:scale-[1.04] sm:w-auto"
            >
              Find a job
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/jobs/post"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-white hover:text-gold sm:w-auto"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Post a job
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="mt-6 inline-block text-sm text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            Track my application
          </Link>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35 + i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3.5 text-left backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/20 sm:p-4"
              >
                <s.icon className="h-5 w-5 text-white/80 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6" />
                <p className="mt-2.5 font-display text-xl text-white sm:text-2xl">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-white/65 sm:text-xs">
                  {s.label}
                </p>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[2px] w-0 bg-white transition-all duration-500 group-hover:w-full"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <PipelineCard />
      </div>
    </section>
  );
}
