"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { countries } from "@/lib/countries";
import { Landmark } from "./Landmarks";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function DeparturesBoard() {
  return (
    <section id="countries" className="bg-ink py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-wide text-gold">Departures</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-4xl">
              Six countries, taking interviews tonight
            </h2>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              <Link
                href={`/apply?country=${c.code}`}
                className="relative block overflow-hidden rounded-[1.75rem] border border-ink-3 bg-ink-2 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[transform,box-shadow,border-color] duration-500 ease-out will-change-transform hover:-translate-y-2.5 hover:border-gold/60 hover:shadow-[0_28px_60px_-18px_rgba(210,31,31,0.35)]"
              >
                {/* Photo */}
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {c.heroImageUrl ? (
                    <Image
                      src={c.heroImageUrl}
                      alt={`${c.name} skyline`}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.12]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink-2">
                      <Landmark id={c.landmark} className="h-24 w-24 text-steel/50" />
                    </div>
                  )}

                  {/* base gradient for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 transition-opacity duration-500 group-hover:from-black/90" />

                  {/* diagonal shine sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[130%] group-hover:opacity-100"
                    style={{ width: "60%" }}
                  />

                  {/* gold ring that grows in on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-gold/50"
                  />

                  {/* top row: landmark glyph + decision chip */}
                  <div className="absolute inset-x-4 top-4 flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/30 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 group-hover:border-gold/60">
                      <Landmark id={c.landmark} className="h-5 w-5 text-white/90 transition-colors group-hover:text-gold-bright" />
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium text-gold-bright backdrop-blur-sm">
                      <Sparkles className="h-3 w-3" />
                      {c.avgProcessingDays === 1 ? "Decides in 1 day" : `Decides in ${c.avgProcessingDays} days`}
                    </span>
                  </div>

                  {/* bottom content */}
                  <div className="absolute inset-x-5 bottom-5 translate-y-1 transition-transform duration-500 ease-out group-hover:translate-y-0">
                    <p className="text-[11px] uppercase tracking-wider text-white/60">{c.region}</p>
                    <p className="mt-1 flex items-center gap-2 font-display text-2xl text-white">
                      <span className="text-lg">{c.flag}</span> {c.name}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 opacity-90">
                      <span className="text-xs text-white/70">
                        {c.visaTypesOffered.length} visa types
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-white transition-all group-hover:gap-2 group-hover:text-gold-bright">
                        Apply
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
