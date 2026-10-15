"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Armchair, ArrowUpRight, BadgeCheck, Clock, Plane } from "lucide-react";
import { countries } from "@/lib/countries";
import { useCountryPhoto } from "@/lib/country-photo";
import { Country, VisaTypeId } from "@/types";
import { Flag } from "./Flag";
import { Landmark } from "./Landmarks";

const VISA_LABELS: Record<VisaTypeId, string> = {
  study: "Study",
  married: "Married",
  visit: "Visit",
  work: "Work",
};

const EASE = [0.22, 1, 0.36, 1] as const;
const REGIONS = ["All", ...Array.from(new Set(countries.map((c) => c.region)))];

/** Photo area: line-art placeholder underneath, real photo fades in on top. */
function CardPhoto({ country }: { country: Country }) {
  const photo = useCountryPhoto(country);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center bg-gradient-brand"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px), var(--gradient-brand)",
          backgroundSize: "18px 18px, 100% 100%",
        }}
      >
        <Landmark id={country.landmark} className="h-20 w-20 text-white/35" />
      </div>
      {photo.url && (
        <Image
          key={photo.url}
          src={photo.url}
          alt={`${country.name} skyline`}
          fill
          unoptimized={photo.fromWiki}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            photo.onError();
          }}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-[opacity,transform] duration-[1400ms] ease-out group-hover:scale-110 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </>
  );
}

function CountryCard({ c, i }: { c: Country; i: number }) {
  const decision =
    c.avgProcessingDays === 1 ? "1 day" : `${c.avgProcessingDays} days`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: EASE }}
      className="h-full"
    >
      <Link
        href={`/jobs?country=${c.code}`}
        aria-label={`See jobs in ${c.name}`}
        className="group relative block h-full rounded-[1.9rem] bg-ink-3 p-px transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_34px_70px_-28px_rgba(127,15,15,0.55)]"
      >
        {/* gradient border that fades in on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.9rem] bg-gradient-brand opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <article className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.9rem-1px)] bg-white">
          {/* ───────── Photo ───────── */}
          <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden">
            <CardPhoto country={c} />

            {/* soft vignette */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20"
            />

            {/* shine sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover:translate-x-[330%] group-hover:opacity-100"
            />

            {/* flag badge — top-left corner */}
            <div className="absolute left-3.5 top-3.5 flex items-center gap-2 rounded-full bg-white/90 py-1.5 pl-1.5 pr-3.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/70 backdrop-blur-md transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 sm:left-4 sm:top-4">
              <Flag code={c.code} className="h-6 w-9 rounded-full" />
              <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-text">
                {c.code}
              </span>
            </div>

            {/* landmark glyph — top-right */}
            <span className="absolute right-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/25 backdrop-blur-md transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:border-white/80 sm:right-4 sm:top-4">
              <Landmark id={c.landmark} className="h-5 w-5 text-white" />
            </span>

            {/* arrow — bottom-right */}
            <span className="absolute bottom-3.5 right-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gold shadow-[0_10px_26px_-8px_rgba(0,0,0,0.55)] transition-all duration-500 ease-out group-hover:bg-gradient-brand group-hover:text-white [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 sm:bottom-4 sm:right-4">
              <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
            </span>
          </div>

          {/* ───────── Details (below the photo) ───────── */}
          <div
            className="relative flex flex-1 flex-col p-5 sm:p-6"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--mx",
                `${e.clientX - r.left}px`,
              );
              e.currentTarget.style.setProperty(
                "--my",
                `${e.clientY - r.top}px`,
              );
            }}
          >
            {/* cursor spotlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(340px circle at var(--mx, 50%) var(--my, 20%), rgba(210,31,31,0.09), transparent 60%)",
              }}
            />

            <div className="relative flex items-center gap-2.5">
              <span className="h-px w-7 bg-gradient-brand transition-all duration-500 group-hover:w-12" />
              <p className="text-[11px] uppercase tracking-[0.24em] text-gold">
                {c.region}
              </p>
            </div>

            <h3 className="relative mt-2.5 font-display text-[1.65rem] leading-tight text-[var(--foreground)] transition-colors duration-300 group-hover:text-gold sm:text-[1.8rem]">
              {c.name}
            </h3>

            <p className="relative mt-2 flex items-center gap-2 text-xs text-mist">
              <Plane className="h-3.5 w-3.5 shrink-0 -rotate-45 text-gold transition-transform duration-500 group-hover:translate-x-1" />
              <span className="truncate">
                {c.airportName} ·{" "}
                <span className="tracking-wider">{c.airportCode}</span>
              </span>
            </p>

            {/* stats */}
            <div className="relative mt-5 grid grid-cols-3 divide-x divide-ink-3 rounded-2xl border border-ink-3 bg-paper/70 py-3.5 transition-colors duration-500 group-hover:border-gold/25 group-hover:bg-white">
              <Stat
                icon={<Clock className="h-3.5 w-3.5" />}
                value={decision}
                label="Decision"
              />
              <Stat
                icon={<BadgeCheck className="h-3.5 w-3.5" />}
                value={String(c.visaTypesOffered.length)}
                label="Visa types"
              />
              <Stat
                icon={<Armchair className="h-3.5 w-3.5" />}
                value={String(c.seatsOpenToday)}
                label="Seats today"
              />
            </div>

            {/* visa chips */}
            <div className="relative mt-4 flex flex-wrap gap-1.5">
              {c.visaTypesOffered.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-ink-3 bg-white px-3 py-1 text-[11px] text-steel transition-all duration-300 group-hover:border-gold/35 group-hover:text-gold"
                >
                  {VISA_LABELS[v]}
                </span>
              ))}
            </div>

            {/* footer */}
            <div className="h-5 flex-1" aria-hidden />
            <div className="relative flex items-end justify-between gap-3 border-t border-ink-3 pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-steel">
                  Embassy fee
                </p>
                <p className="mt-0.5 font-display text-lg text-[var(--foreground)]">
                  ${c.embassyFeeUSD}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-medium text-gold transition-all duration-300 group-hover:gap-2.5">
                View jobs
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center px-1 text-center">
      <span className="text-gold">{icon}</span>
      <span className="mt-1 font-display text-base leading-none text-[var(--foreground)] sm:text-lg">
        {value}
      </span>
      <span className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-steel sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

export function DeparturesBoard() {
  const [region, setRegion] = useState("All");
  const list =
    region === "All" ? countries : countries.filter((c) => c.region === region);

  return (
    <section
      id="countries"
      className="relative overflow-hidden bg-ink py-20 sm:py-24"
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(210,31,31,0.07), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(127,15,15,0.06), transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-gold">
              <span className="h-px w-8 bg-gradient-brand" />
              Departures
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-4xl">
              {countries.length} countries hiring right now
            </h2>
          </div>

          {/* region filter */}
          <div
            role="tablist"
            aria-label="Filter countries by region"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {REGIONS.map((r) => {
              const active = r === region;
              return (
                <button
                  key={r}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRegion(r)}
                  className={`relative shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors duration-300 ${
                    active
                      ? "border-transparent text-white"
                      : "border-ink-3 bg-white text-mist hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="region-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-gradient-brand shadow-[0_10px_24px_-10px_rgba(210,31,31,0.8)]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative">{r}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={region}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3"
          >
            {list.map((c, i) => (
              <CountryCard key={c.code} c={c} i={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
