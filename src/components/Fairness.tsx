"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Eye, ScanFace, Mic } from "lucide-react";

const rules = [
  {
    icon: ScanFace,
    title: "Answer as yourself",
    body: "The interview measures your own understanding of your application. Reading answers from another AI tool, a script, or a second person is treated as misrepresentation.",
  },
  {
    icon: Eye,
    title: "Stay on this tab",
    body: "Switching tabs, opening another window, or leaving the frame during the interview pauses the session and flags it for manual review.",
  },
  {
    icon: ShieldCheck,
    title: "The same rules for everyone",
    body: "Every applicant for a given visa type is scored against the same questions and the same criteria — confidence, consistency, and whether your documents match what you say.",
  },
  {
    icon: Mic,
    title: "Speak it or type it — always your own words",
    body: "Answer by voice or by typing, whichever you prefer. Either way, pasting text into an answer (e.g. from an AI chat) is detected instantly and ends the interview as a rejection.",
  },
];

export function Fairness() {
  return (
    <section id="fairness" className="bg-paper py-24 text-ink-text">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-lg">
          <p className="text-xs uppercase tracking-wide text-gold">Interview fairness</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">
            One honest conversation decides it
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-text/70">
            The interview replaces a queue, not your credibility. Here is
            exactly what it checks for, stated plainly before you ever sit down.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {rules.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl border border-paper-2 bg-[#faf8f2] p-8 transition-all duration-500 ease-out will-change-transform hover:-translate-y-2 hover:border-gold/60 hover:bg-white hover:shadow-[0_25px_60px_-20px_rgba(210,31,31,0.28)]"
            >
              {/* radial glow reveal */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold-bright/0 blur-2xl transition-all duration-500 group-hover:bg-gold-bright/15"
              />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-[0_8px_20px_-6px_rgba(210,31,31,0.45)] transition-all duration-500 ease-out group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-[0_10px_28px_-6px_rgba(210,31,31,0.6)]">
                <r.icon className="h-6 w-6" strokeWidth={1.6} />
              </div>

              <h3 className="relative mt-5 text-lg transition-colors duration-500 group-hover:text-gold">
                {r.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-text/70">{r.body}</p>

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
