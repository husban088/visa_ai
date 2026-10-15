"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  FileSignature,
  Mic,
  BadgeCheck,
} from "lucide-react";

const steps = [
  {
    icon: Briefcase,
    tag: "You",
    title: "Apply for a job",
    body: "Pick a role in any country, upload your CV and answer the company's questions.",
  },
  {
    icon: Sparkles,
    tag: "AI · instant",
    title: "AI checks your profile",
    body: "Skills, experience, CV, portfolio and GitHub are scored against the job in seconds.",
  },
  {
    icon: FileSignature,
    tag: "AI · instant",
    title: "Offer letter or rejection",
    body: "A good fit gets a luxury offer letter that is accepted for you. Not a fit? You know right away.",
  },
  {
    icon: Mic,
    tag: "You",
    title: "Visa interview",
    body: "Documents are created and uploaded by AI. You answer a short interview by voice or typing, with video recorded.",
  },
  {
    icon: BadgeCheck,
    tag: "AI · instant",
    title: "Visa decision",
    body: "Interview and documents complete? The visa is approved. Otherwise you get the reason immediately.",
  },
];

export function HomeJourney() {
  return (
    <section id="journey" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            The journey
          </p>
          <h2 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-5xl">
            From job application to visa,
            <span className="italic text-gradient-brand"> in five steps</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-mist md:text-base">
            The visa process only starts after a company offers you the job — so
            every visa on VisaAI is tied to a real role.
          </p>
        </motion.div>

        <div className="relative mt-14">
          {/* connecting line (desktop) */}
          <div
            aria-hidden
            className="absolute left-[10%] right-[10%] top-[3.2rem] hidden border-t-2 border-dashed border-ink-3 lg:block"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.09 }}
                className={`group relative overflow-hidden rounded-3xl border border-ink-3 bg-white p-6 transition-all duration-500 hover:-translate-y-2.5 hover:border-gold/60 hover:shadow-[0_28px_60px_-20px_rgba(210,31,31,0.35)] ${
                  i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <span
                  aria-hidden
                  className="absolute -right-2 -top-4 select-none font-display text-8xl text-ink-3/70 transition-colors duration-500 group-hover:text-gold/15"
                >
                  {i + 1}
                </span>
                <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-[0_10px_24px_-8px_rgba(210,31,31,0.6)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <s.icon className="h-6 w-6" />
                </span>
                <p className="relative mt-5 text-[11px] font-medium uppercase tracking-widest text-gold">
                  {s.tag}
                </p>
                <h3 className="relative mt-1 font-display text-lg text-[var(--foreground)]">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-mist">
                  {s.body}
                </p>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-brand transition-all duration-500 group-hover:w-full"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
