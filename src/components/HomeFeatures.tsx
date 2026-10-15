"use client";

import { motion } from "framer-motion";
import {
  FileSignature,
  FolderCheck,
  Mic,
  Video,
  Zap,
  PlaneTakeoff,
} from "lucide-react";

const small = [
  {
    icon: FolderCheck,
    title: "Documents made for you",
    body: "Offer letter, contract, passport and more are created and uploaded by AI. Nothing to scan or chase.",
  },
  {
    icon: Mic,
    title: "Speak it or type it",
    body: "Answer the visa interview by voice or by typing — whichever is easier for you.",
  },
  {
    icon: Video,
    title: "Video & voice recorded",
    body: "Your interview is recorded so the decision is fair and can be reviewed.",
  },
  {
    icon: PlaneTakeoff,
    title: "Fly right after approval",
    body: "Visa approved? Pick your seat and book your flight and boarding pass in the same place.",
  },
];

export function HomeFeatures() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            Why VisaAI
          </p>
          <h2 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-5xl">
            Everything handled by AI,
            <span className="italic text-gradient-brand">
              {" "}
              nothing left to chance
            </span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* hero card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-white transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_70px_-20px_rgba(127,15,15,0.7)] md:col-span-2 md:p-10"
          >
            <div className="orb orb-b opacity-60" aria-hidden />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <FileSignature className="h-7 w-7" />
            </span>
            <h3 className="relative mt-6 font-display text-2xl md:text-4xl">
              An offer letter in seconds
            </h3>
            <p className="relative mt-3 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
              Apply for a job and the AI scores your skills, experience, CV and
              portfolio against the role. A strong match gets a luxury offer
              letter straight away — accepted for you — and the visa process
              unlocks. Not a match? A clear rejection with reasons, instantly.
            </p>
            <div className="relative mt-7 flex flex-wrap gap-2">
              {[
                "Skills match",
                "Experience",
                "CV quality",
                "GitHub & portfolio",
              ].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs backdrop-blur transition-colors hover:bg-white hover:text-gold"
                >
                  {c}
                </span>
              ))}
            </div>
          </motion.div>

          {/* decision card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink-3 bg-paper p-8 transition-all duration-500 hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_28px_60px_-20px_rgba(210,31,31,0.35)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
              <Zap className="h-6 w-6" />
            </span>
            <div className="mt-8">
              <p className="font-display text-5xl text-gradient-brand">
                Same day
              </p>
              <h3 className="mt-2 font-display text-lg text-[var(--foreground)]">
                Visa decision
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                Interview and documents complete? The AI approves the visa right
                away.
              </p>
            </div>
          </motion.div>

          {small.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-ink-3 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_28px_60px_-20px_rgba(210,31,31,0.35)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg text-[var(--foreground)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{f.body}</p>
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-brand transition-all duration-500 group-hover:w-full"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
