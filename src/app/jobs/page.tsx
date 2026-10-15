"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Plane, SearchX, Globe } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import {
  Job,
  getSeedJobs,
  listJobs,
  ROLE_OPTIONS,
  TECH_OPTIONS,
  WORLD_COUNTRIES,
} from "@/lib/jobs";

export default function JobsPage() {
  // Built-in jobs are available immediately; saved/remote jobs are merged in below.
  const [jobs, setJobs] = useState<Job[]>(() => getSeedJobs());
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("");
  const [tech, setTech] = useState("");
  const [relocOnly, setRelocOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Opened from the Countries page (/jobs?country=CA) -> pre-select that country.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("country");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the URL once on mount
    if (c) setCountry(c.toUpperCase());
  }, []);

  useEffect(() => {
    let active = true;
    listJobs().then((j) => {
      if (active) setJobs(j);
    });
    return () => {
      active = false;
    };
  }, []);

  // A country with no listings of its own still shows every Remote Worldwide job,
  // because those can be done from any country.
  const countryHasOwnJobs = useMemo(
    () => !country || jobs.some((j) => j.countryCode === country),
    [jobs, country],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (country) {
        const inCountry = j.countryCode === country;
        if (countryHasOwnJobs ? !inCountry : !j.remoteGlobal) return false;
      }
      if (role && j.roleType !== role) return false;
      if (tech && !j.techStack.includes(tech)) return false;
      if (relocOnly && !(j.relocation || j.visaSponsorship)) return false;
      if (remoteOnly && !j.remoteGlobal) return false;
      if (s) {
        const hay =
          `${j.title} ${j.companyName} ${j.city} ${j.countryName} ${j.techStack.join(" ")} ${j.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [jobs, q, country, role, tech, relocOnly, remoteOnly, countryHasOwnJobs]);

  const field =
    "h-11 w-full rounded-xl border border-ink-3 bg-white px-3 text-sm text-[var(--foreground)] outline-none transition-colors hover:border-gold focus:border-gold";

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-brand">
          <div className="orb orb-a" aria-hidden />
          <div className="orb orb-b" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-widest text-white/80"
            >
              <Plane className="h-3.5 w-3.5 -rotate-45" /> Global tech careers
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-5 font-display text-4xl leading-tight text-white md:text-6xl"
            >
              Find your next role,
              <br />
              <span className="italic text-white/80">in any country</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/75 md:text-base"
            >
              Companies from every country post Full Stack, Frontend, Software
              and Senior Engineer jobs — with relocation packages and visa
              support.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8"
            >
              <Link
                href="/jobs/post"
                className="btn-sheen inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-gold transition-transform hover:scale-[1.04]"
              >
                <Plus className="h-4 w-4" /> Post a job
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <div className="relative z-10 -mt-10 rounded-3xl border border-ink-3 bg-white p-4 shadow-xl md:p-6">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, company, skill…"
                  className={`${field} pl-9`}
                />
              </div>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={field}
                aria-label="Country"
              >
                <option value="">All countries</option>
                {WORLD_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={field}
                aria-label="Role"
              >
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                className={field}
                aria-label="Technology"
              >
                <option value="">Any technology</option>
                {TECH_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-mist">
                <input
                  type="checkbox"
                  checked={relocOnly}
                  onChange={(e) => setRelocOnly(e.target.checked)}
                  className="h-4 w-4 accent-[#d21f1f]"
                />
                Relocation / visa sponsorship only
              </label>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-mist">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="h-4 w-4 accent-[#d21f1f]"
                />
                Remote Worldwide only
              </label>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <p className="mb-6 text-sm text-steel">
            {`${filtered.length} job${filtered.length === 1 ? "" : "s"} found`}
          </p>
          {country && !countryHasOwnJobs && (
            <p className="mb-6 flex items-start gap-2 rounded-2xl border border-gold/40 bg-white px-4 py-3 text-sm text-mist">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              No on-site roles in this country yet — showing Remote Worldwide
              jobs you can do from here, with no visa needed.
            </p>
          )}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-ink-3 py-20 text-center">
              <SearchX className="h-10 w-10 text-gold" />
              <p className="mt-4 font-display text-xl">No jobs match yet</p>
              <p className="mt-1 text-sm text-mist">
                Try clearing a filter, or post the first one.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((j, i) => (
                <JobCard key={j.id} job={j} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
