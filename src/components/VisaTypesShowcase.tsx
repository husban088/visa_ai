"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { visaTypes } from "@/lib/visa-types";
import {
  ArrowRight,
  GraduationCap,
  Heart,
  Plane,
  Briefcase,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  study: GraduationCap,
  married: Heart,
  visit: Plane,
  work: Briefcase,
};

export function VisaTypesShowcase() {
  return (
    <section id="visa-types" className="bg-paper py-24 text-ink-text">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-wide text-gold">
              Visa types
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Four reasons people travel, one process for all of them
            </h2>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {visaTypes.map((v, i) => {
            const Icon = iconMap[v.id] ?? Plane;
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-paper-2 bg-[#faf8f2] p-8 transition-all duration-500 ease-out will-change-transform hover:-translate-y-2 hover:border-gold/60 hover:bg-white hover:shadow-[0_25px_60px_-20px_rgba(210,31,31,0.28)]"
              >
                {/* radial glow reveal */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-bright/0 blur-2xl transition-all duration-500 group-hover:bg-gold-bright/15"
                />

                <div>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-[0_8px_20px_-6px_rgba(210,31,31,0.45)] transition-all duration-500 ease-out group-hover:-rotate-3 group-hover:scale-110 group-hover:shadow-[0_10px_28px_-6px_rgba(210,31,31,0.6)]">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>

                  <h3 className="relative mt-5 font-display text-xl transition-colors duration-500 group-hover:text-gold">
                    {v.name}
                  </h3>
                  <p className="relative mt-2 text-sm text-ink-text/70">
                    {v.tagline}
                  </p>
                  <ul className="relative mt-5 space-y-1.5 text-sm text-ink-text/70">
                    {v.requiredDocuments.slice(0, 3).map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gold transition-transform duration-500 group-hover:scale-150" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative mt-8 flex items-center justify-between border-t border-paper-2 pt-5">
                  <span className="text-xs text-steel">
                    {v.avgDecisionTime}
                  </span>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1 text-sm font-medium text-ink-text transition-colors group-hover:text-gold"
                  >
                    Find a job{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* bottom accent bar that grows in */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-brand transition-all duration-500 ease-out group-hover:w-full"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
