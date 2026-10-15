"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Building2 } from "lucide-react";

const candidates = [
  { name: "Ayesha K.", role: "Full Stack Developer", score: 91 },
  { name: "Daniel R.", role: "Senior Software Engineer", score: 84 },
  { name: "Sana M.", role: "Frontend Developer", score: 72 },
];

const points = [
  "Post a role from any country in minutes",
  "Rich job description with skills, languages and relocation details",
  "AI scores every applicant against your requirements",
  "Great candidates get your offer letter automatically",
];

export function HomeForCompanies() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-brand p-6 sm:p-10 md:p-14">
          <div className="orb orb-a" aria-hidden />
          <div className="orb orb-b" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-widest text-white/85">
                <Building2 className="h-3.5 w-3.5" /> For companies
              </span>
              <h2 className="mt-5 font-display text-3xl text-white md:text-5xl">
                Hire global talent,
                <span className="italic text-white/80">
                  {" "}
                  without the paperwork
                </span>
              </h2>
              <ul className="mt-6 space-y-3">
                {points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 text-sm text-white/80"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-gold">
                      <Check className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href="/jobs/post"
                className="btn-sheen group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-gold transition-transform hover:scale-[1.04]"
              >
                Post a job
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-3 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl sm:p-6"
            >
              <p className="px-1 text-[11px] uppercase tracking-[0.25em] text-white/60">
                AI-ranked applicants
              </p>
              {candidates.map((c, i) => (
                <div
                  key={c.name}
                  className="group rounded-2xl border border-white/15 bg-white/10 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {c.name}
                      </p>
                      <p className="truncate text-xs text-white/60">{c.role}</p>
                    </div>
                    <span className="font-display text-2xl text-white">
                      {c.score}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.15 }}
                    />
                  </div>
                </div>
              ))}
              <p className="px-1 text-[11px] text-white/50">
                Sample data for demonstration.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
