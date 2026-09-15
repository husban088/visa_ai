"use client";

import { motion } from "framer-motion";
import { FileCheck2, Calendar, Video, Ticket } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: FileCheck2,
    title: "Apply & upload documents",
    body: "Pick a country and visa type, then upload your passport, bank statement, and supporting letters.",
  },
  {
    n: "02",
    icon: Calendar,
    title: "Get an interview slot",
    body: "The next open slot is assigned instantly — often the same day, no waiting weeks for an embassy date.",
  },
  {
    n: "03",
    icon: Video,
    title: "Sit the AI interview",
    body: "A 15-minute video interview from your camera. Answer honestly — the fairness rules apply to everyone equally.",
  },
  {
    n: "04",
    icon: Ticket,
    title: "Decision, then ticket",
    body: "Approved applicants get a decision letter and can book their flight straight from the dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-lg">
          <p className="text-xs uppercase tracking-wide text-gold">Process</p>
          <h2 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-4xl">
            Four stamps between you and departure
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-ink-3 bg-ink-2/50 p-8 transition-all duration-500 ease-out will-change-transform hover:-translate-y-2 hover:border-gold/60 hover:bg-ink-2 hover:shadow-[0_25px_60px_-20px_rgba(210,31,31,0.4)]"
            >
              {/* radial glow reveal */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-bright/0 blur-2xl transition-all duration-500 group-hover:bg-gold-bright/20"
              />

              {/* giant faint number watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-3 select-none font-display text-7xl text-ink-3/70 transition-all duration-500 group-hover:-translate-y-1 group-hover:text-gold/15"
              >
                {s.n}
              </span>

              {/* connector line to next card (desktop only) */}
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-[-13px] top-[52px] hidden h-px w-6 bg-ink-3 transition-colors duration-500 group-hover:bg-gold/70 lg:block"
                />
              )}

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-[0_8px_20px_-6px_rgba(210,31,31,0.5)] transition-all duration-500 ease-out group-hover:-rotate-3 group-hover:scale-110 group-hover:shadow-[0_10px_28px_-6px_rgba(210,31,31,0.7)]">
                <s.icon className="h-6 w-6" strokeWidth={1.6} />
              </div>

              <p className="relative mt-5 font-display text-sm text-steel transition-colors duration-500 group-hover:text-gold-bright">
                {s.n}
              </p>
              <h3 className="relative mt-1 text-lg text-[var(--foreground)]">{s.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-mist">{s.body}</p>

              {/* bottom accent bar that grows in */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-brand transition-all duration-500 ease-out group-hover:w-full"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
