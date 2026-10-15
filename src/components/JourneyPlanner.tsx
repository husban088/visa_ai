"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  Clock,
  GraduationCap,
  Heart,
  Minus,
  Plane,
  Plus,
  ShieldCheck,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { countries } from "@/lib/countries";
import { RESIDENCE_COUNTRIES } from "@/lib/geo";
import { estimateRoute } from "@/lib/pricing";
import { getVisaType } from "@/lib/visa-types";
import { useResidenceCountry } from "@/lib/use-residence-country";
import { VisaTypeId } from "@/types";
import { Flag } from "./Flag";

const EASE = [0.22, 1, 0.36, 1] as const;

const VISA_ICONS: Record<VisaTypeId, LucideIcon> = {
  study: GraduationCap,
  married: Heart,
  visit: Camera,
  work: Briefcase,
};
const VISA_SHORT: Record<VisaTypeId, string> = {
  study: "Study",
  married: "Spouse",
  visit: "Visit",
  work: "Work",
};
const ALL_VISAS: VisaTypeId[] = ["study", "married", "visit", "work"];

function usd(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Number that counts up/down smoothly whenever the value changes. */
function Money({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => usd(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: EASE });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span className={className}>{text}</motion.span>;
}

function StepHeader({
  n,
  title,
  hint,
}: {
  n: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="font-display text-sm tabular-nums text-gold">{n}</span>
        <span className="h-px w-8 bg-gradient-brand" />
        <h3 className="font-display text-xl text-[var(--foreground)]">
          {title}
        </h3>
      </div>
      {hint && <p className="hidden text-xs text-steel sm:block">{hint}</p>}
    </div>
  );
}

export function JourneyPlanner() {
  const { country: detected } = useResidenceCountry();
  const [fromPick, setFromPick] = useState<string | null>(null);
  const [destCode, setDestCode] = useState("CA");
  const [visaPick, setVisaPick] = useState<VisaTypeId>("work");
  const [travelers, setTravelers] = useState(1);
  const [trip, setTrip] = useState<"oneway" | "return">("oneway");

  const fromCode = fromPick ?? detected?.code ?? "PK";
  const dest = countries.find((c) => c.code === destCode) ?? countries[0];
  const visaId = dest.visaTypesOffered.includes(visaPick)
    ? visaPick
    : dest.visaTypesOffered[0];
  const visa = getVisaType(visaId);

  const route = estimateRoute(fromCode, dest);
  const embassy = route.embassyFeeUSD * travelers;
  const flight = route.flightPriceUSD * travelers * (trip === "return" ? 2 : 1);
  const total = embassy + flight;
  const embassyPct = total ? Math.round((embassy / total) * 100) : 0;
  const flightPct = total ? 100 - embassyPct : 0;
  const fromName =
    RESIDENCE_COUNTRIES.find((c) => c.code === fromCode)?.name ?? fromCode;

  return (
    <section className="relative bg-ink pb-20 sm:pb-24">
      <div className="relative mx-auto -mt-14 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8">
          {/* ───────────── Controls ───────────── */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="rounded-[2rem] border border-ink-3 bg-white p-5 shadow-[0_40px_90px_-40px_rgba(127,15,15,0.4)] sm:p-8"
          >
            {/* 01 from */}
            <StepHeader
              n="01"
              title="Traveling from"
              hint="Auto-detected, change anytime"
            />
            <div className="group relative flex items-center gap-3 rounded-2xl border border-ink-3 bg-paper/60 px-4 py-3 transition-all duration-300 focus-within:border-gold hover:border-gold/50">
              <Flag code={fromCode} className="h-6 w-9" />
              <select
                aria-label="Traveling from"
                value={fromCode}
                onChange={(e) => setFromPick(e.target.value)}
                className="w-full cursor-pointer appearance-none bg-transparent pr-8 text-sm text-[var(--foreground)] outline-none"
              >
                {RESIDENCE_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-steel transition-transform duration-300 group-hover:translate-y-0.5" />
            </div>

            {/* 02 destination */}
            <div className="mt-9">
              <StepHeader
                n="02"
                title="Destination"
                hint={`${countries.length} countries hiring`}
              />
              <div className="grid max-h-[19.5rem] grid-cols-2 gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] sm:grid-cols-3">
                {countries.map((c) => {
                  const active = c.code === dest.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setDestCode(c.code)}
                      aria-pressed={active}
                      className={`group relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                        active
                          ? "border-transparent"
                          : "border-ink-3 bg-white hover:border-gold/40 hover:shadow-[0_10px_24px_-14px_rgba(210,31,31,0.5)]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="dest-ring"
                          aria-hidden
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/10 to-red-800/10 ring-2 ring-gold"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                      <Flag code={c.code} className="relative h-4 w-6" />
                      <span className="relative min-w-0">
                        <span
                          className={`block truncate text-[13px] leading-tight transition-colors ${
                            active
                              ? "font-medium text-gold"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {c.name}
                        </span>
                        <span className="block text-[10px] tracking-[0.16em] text-steel">
                          {c.airportCode}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03 visa type */}
            <div className="mt-9">
              <StepHeader n="03" title="Visa type" />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {ALL_VISAS.map((id) => {
                  const offered = dest.visaTypesOffered.includes(id);
                  const active = id === visaId;
                  const Icon = VISA_ICONS[id];
                  return (
                    <button
                      key={id}
                      disabled={!offered}
                      onClick={() => setVisaPick(id)}
                      aria-pressed={active}
                      className={`group relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition-all duration-300 ${
                        !offered
                          ? "cursor-not-allowed border-dashed border-ink-3 opacity-40"
                          : active
                            ? "border-transparent text-white"
                            : "border-ink-3 bg-white hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_14px_30px_-16px_rgba(210,31,31,0.55)]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="visa-ring"
                          aria-hidden
                          className="absolute inset-0 rounded-2xl bg-gradient-brand shadow-[0_16px_34px_-14px_rgba(210,31,31,0.85)]"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                      <span
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                          active
                            ? "border-white/40 bg-white/15"
                            : "border-ink-3 bg-paper text-gold group-hover:-rotate-6 group-hover:border-gold/40"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                      </span>
                      <span className="relative text-sm font-medium">
                        {VISA_SHORT[id]}
                      </span>
                      {!offered && (
                        <span className="relative -mt-1 text-[10px] text-steel">
                          Not offered
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 04 travelers + trip */}
            <div className="mt-9 grid gap-8 sm:grid-cols-2">
              <div>
                <StepHeader n="04" title="Travelers" />
                <div className="flex items-center justify-between rounded-2xl border border-ink-3 bg-paper/60 p-2">
                  <button
                    aria-label="Fewer travelers"
                    onClick={() => setTravelers((n) => Math.max(1, n - 1))}
                    disabled={travelers <= 1}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-3 bg-white text-steel transition-all duration-300 hover:border-gold hover:text-gold active:scale-90 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p
                        key={travelers}
                        initial={{ y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -14, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="font-display text-2xl leading-none text-[var(--foreground)]"
                      >
                        {travelers}
                      </motion.p>
                    </AnimatePresence>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-steel">
                      {travelers === 1 ? "Traveler" : "Travelers"}
                    </p>
                  </div>
                  <button
                    aria-label="More travelers"
                    onClick={() => setTravelers((n) => Math.min(6, n + 1))}
                    disabled={travelers >= 6}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-3 bg-white text-steel transition-all duration-300 hover:border-gold hover:text-gold active:scale-90 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <StepHeader n="05" title="Flight" />
                <div className="relative grid grid-cols-2 rounded-2xl border border-ink-3 bg-paper/60 p-1.5">
                  {(
                    [
                      ["oneway", "One-way"],
                      ["return", "Return"],
                    ] as const
                  ).map(([id, label]) => {
                    const active = trip === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setTrip(id)}
                        aria-pressed={active}
                        className={`relative rounded-xl py-3 text-sm font-medium transition-colors duration-300 ${
                          active ? "text-white" : "text-mist hover:text-gold"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="trip-pill"
                            aria-hidden
                            className="absolute inset-0 rounded-xl bg-gradient-brand shadow-[0_10px_24px_-10px_rgba(210,31,31,0.8)]"
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 34,
                            }}
                          />
                        )}
                        <span className="relative">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ───────────── Boarding-pass result ───────────── */}
          <motion.aside
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
            className="lg:sticky lg:top-24"
            aria-live="polite"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-ink-3 bg-white shadow-[0_40px_90px_-36px_rgba(127,15,15,0.55)]">
              {/* header */}
              <div className="relative overflow-hidden bg-gradient-brand px-6 pb-8 pt-6 text-white sm:px-8">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 h-52 w-52 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(239,68,68,0.45), transparent 65%)",
                  }}
                />
                <p className="relative text-[11px] uppercase tracking-[0.28em] text-white/70">
                  Estimated total
                </p>
                <Money
                  value={total}
                  className="relative mt-1 block font-display text-5xl leading-none sm:text-6xl"
                />
                <p className="relative mt-3 text-xs text-white/70">
                  {visa?.name} · {travelers}{" "}
                  {travelers === 1 ? "traveler" : "travelers"} ·{" "}
                  {trip === "return" ? "return flight" : "one-way flight"}
                </p>

                {/* route */}
                <div className="relative mt-7 flex items-center gap-3">
                  <div className="flex min-w-0 flex-col items-start gap-1.5">
                    <span className="rounded-full bg-white/95 p-1 shadow-lg">
                      <Flag code={fromCode} className="h-6 w-9 rounded-full" />
                    </span>
                    <span className="max-w-[7rem] truncate text-[11px] uppercase tracking-[0.16em] text-white/80">
                      {fromName}
                    </span>
                  </div>
                  <div className="relative mb-5 h-8 flex-1">
                    <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/45" />
                    <motion.span
                      aria-hidden
                      className="absolute top-1/2 -mt-3 text-white"
                      animate={{ left: ["0%", "88%"] }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse",
                      }}
                    >
                      <Plane
                        className="h-6 w-6 -rotate-45 drop-shadow"
                        strokeWidth={1.6}
                      />
                    </motion.span>
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={dest.code}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.28 }}
                      className="flex min-w-0 flex-col items-end gap-1.5"
                    >
                      <span className="rounded-full bg-white/95 p-1 shadow-lg">
                        <Flag
                          code={dest.code}
                          className="h-6 w-9 rounded-full"
                        />
                      </span>
                      <span className="max-w-[7rem] truncate text-[11px] uppercase tracking-[0.16em] text-white/80">
                        {dest.name}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* perforation */}
              <div className="relative h-0 border-t-2 border-dashed border-ink-3">
                <span className="absolute -left-3.5 -top-3.5 h-7 w-7 rounded-full border border-ink-3 bg-ink" />
                <span className="absolute -right-3.5 -top-3.5 h-7 w-7 rounded-full border border-ink-3 bg-ink" />
              </div>

              {/* body */}
              <div className="space-y-6 p-6 sm:p-8">
                {/* breakdown */}
                <div className="space-y-4">
                  {[
                    {
                      label: "Embassy fee",
                      sub: `${usd(route.embassyFeeUSD)} × ${travelers}`,
                      value: embassy,
                      pct: embassyPct,
                    },
                    {
                      label: "Flight (est.)",
                      sub: `${usd(route.flightPriceUSD)} × ${travelers}${trip === "return" ? " × 2" : ""}`,
                      value: flight,
                      pct: flightPct,
                    },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="flex items-baseline justify-between gap-3">
                        <div>
                          <p className="text-sm text-[var(--foreground)]">
                            {r.label}
                          </p>
                          <p className="text-[11px] text-steel">{r.sub}</p>
                        </div>
                        <p className="font-display text-lg text-[var(--foreground)]">
                          {usd(r.value)}
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-2">
                        <motion.div
                          className="h-full rounded-full bg-gradient-brand"
                          initial={false}
                          animate={{ width: `${r.pct}%` }}
                          transition={{ duration: 0.8, ease: EASE }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* tiles */}
                <div className="grid grid-cols-3 divide-x divide-ink-3 rounded-2xl border border-ink-3 bg-paper/70 py-4">
                  {[
                    {
                      icon: <ShieldCheck className="h-4 w-4" />,
                      v:
                        route.processingDays === 1
                          ? "1 day"
                          : `${route.processingDays} days`,
                      l: "Decision",
                    },
                    {
                      icon: <Clock className="h-4 w-4" />,
                      v: route.flightDurationHours
                        ? `${route.flightDurationHours}h`
                        : "—",
                      l: "In the air",
                    },
                    {
                      icon: <Timer className="h-4 w-4" />,
                      v: `~${route.totalDaysUntilArrival}d`,
                      l: "To arrive",
                    },
                  ].map((t) => (
                    <div
                      key={t.l}
                      className="flex flex-col items-center px-1 text-center"
                    >
                      <span className="text-gold">{t.icon}</span>
                      <span className="mt-1.5 font-display text-lg leading-none text-[var(--foreground)]">
                        {t.v}
                      </span>
                      <span className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-steel">
                        {t.l}
                      </span>
                    </div>
                  ))}
                </div>

                {/* documents */}
                {visa && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
                      Documents for a {VISA_SHORT[visaId].toLowerCase()} visa
                    </p>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.ul
                        key={`${dest.code}-${visaId}`}
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: {},
                          show: { transition: { staggerChildren: 0.06 } },
                        }}
                        className="mt-3 space-y-2"
                      >
                        {visa.requiredDocuments.map((d) => (
                          <motion.li
                            key={d}
                            variants={{
                              hidden: { opacity: 0, x: -12 },
                              show: {
                                opacity: 1,
                                x: 0,
                                transition: { duration: 0.4, ease: EASE },
                              },
                            }}
                            className="flex items-start gap-2.5 text-sm text-mist"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
                              <Check className="h-3 w-3" strokeWidth={2.5} />
                            </span>
                            {d}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </AnimatePresence>
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-2.5 pt-1">
                  <Link
                    href={`/jobs?country=${dest.code}`}
                    className="group/cta relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-brand py-3.5 text-sm font-medium text-white shadow-[0_14px_34px_-12px_rgba(210,31,31,0.8)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(210,31,31,0.95)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-[320%]"
                    />
                    <span className="relative">See jobs in {dest.name}</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="group flex items-center justify-center gap-1.5 rounded-2xl border border-ink-3 py-3 text-sm text-mist transition-all duration-300 hover:border-gold/50 hover:text-gold"
                  >
                    How the visa process works
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <p className="text-center text-[11px] leading-relaxed text-steel">
                  Estimates only. Flight fares are scaled by region and may
                  differ at booking. A visa process starts after a hiring
                  company sends you an offer letter.
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
