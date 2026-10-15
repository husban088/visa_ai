"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { countries } from "@/lib/countries";
import { Flag } from "./Flag";

/** Endless strip of hiring countries. Each one opens that country's jobs. */
export function HomeMarquee() {
  const items = [...countries, ...countries];
  return (
    <section
      aria-label="Countries hiring"
      className="relative overflow-hidden border-b border-ink-3 bg-white py-5"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {items.map((c, i) => (
          <Link
            key={`${c.code}-${i}`}
            href={`/jobs?country=${c.code}`}
            className="group flex shrink-0 items-center gap-2.5 rounded-full border border-ink-3 bg-paper px-4 py-2 text-sm text-[var(--foreground)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gradient-brand hover:text-white"
          >
            <Flag code={c.code} className="h-4 w-6" />
            {c.name}
          </Link>
        ))}
      </motion.div>
    </section>
  );
}
