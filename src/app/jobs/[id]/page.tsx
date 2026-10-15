"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plane,
  BadgeCheck,
  Languages,
  Briefcase,
  Wallet,
  Cpu,
  Clock,
  Send,
  ListChecks,
  Gift,
  Route,
  Factory,
  Users,
  CalendarDays,
  CheckCircle2,
  Stamp,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Job, getJob, sanitizeHtml, flagEmoji } from "@/lib/jobs";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    getJob(id).then((j) => {
      if (!active) return;
      setJob(j ?? null);
      setHtml(j ? sanitizeHtml(j.descriptionHtml) : "");
    });
    return () => {
      active = false;
    };
  }, [id]);

  const site = job?.companyWebsite
    ? /^https?:\/\//i.test(job.companyWebsite)
      ? job.companyWebsite
      : `https://${job.companyWebsite}`
    : "";

  return (
    <>
      <Navbar />
      <main className="bg-paper/50">
        {job === undefined && (
          <div className="mx-auto max-w-4xl px-6 py-32 text-center text-mist">
            Loading…
          </div>
        )}
        {job === null && (
          <div className="mx-auto max-w-4xl px-6 py-32 text-center">
            <p className="font-display text-2xl">Job not found</p>
            <Link
              href="/jobs"
              className="mt-4 inline-block text-gold hover:underline"
            >
              Back to all jobs
            </Link>
          </div>
        )}
        {job && (
          <>
            <section className="relative overflow-hidden bg-gradient-brand">
              <div className="orb orb-a" aria-hidden />
              <div className="orb orb-b" aria-hidden />
              <div className="relative mx-auto max-w-5xl px-6 py-14 md:py-20">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> All jobs
                </Link>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-white/75"
                >
                  <span className="text-lg leading-none">
                    {flagEmoji(job.countryCode)}
                  </span>{" "}
                  {job.countryName}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 font-display text-3xl leading-tight text-white md:text-5xl"
                >
                  {job.title}
                </motion.h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {job.companyName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.remoteGlobal
                      ? `Remote · open to candidates worldwide`
                      : `${job.city ? `${job.city}, ` : ""}${job.countryName}`}
                  </span>
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/jobs/${job.id}/apply`}
                    className="btn-sheen flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-medium text-gold transition-transform hover:scale-[1.04]"
                  >
                    <Send className="h-4 w-4" /> Apply now
                  </Link>
                  {job.remoteGlobal && (
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gold">
                      <Globe className="h-3.5 w-3.5" /> Remote Worldwide
                    </span>
                  )}
                  {job.relocation && (
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-gold">
                      <Plane className="h-3.5 w-3.5 -rotate-45" /> Relocation
                      package
                    </span>
                  )}
                  {job.visaSponsorship && (
                    <span className="flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-1.5 text-xs font-medium text-white">
                      <BadgeCheck className="h-3.5 w-3.5" /> Visa sponsorship
                    </span>
                  )}
                </div>
              </div>
            </section>

            <div className="mx-auto grid max-w-5xl gap-6 px-6 py-12 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
                >
                  <h2 className="font-display text-xl">
                    About the company & role
                  </h2>
                  <div
                    className="rte-content mt-4 break-words text-sm leading-relaxed text-[var(--foreground)]"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </motion.div>

                {job.companyProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl">
                      <Building2 className="h-5 w-5 text-gold" /> About{" "}
                      {job.companyName}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)]">
                      {job.companyProfile.about}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-mist">
                      <b className="text-[var(--foreground)]">Culture: </b>
                      {job.companyProfile.culture}
                    </p>
                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      {[
                        [Factory, "Industry", job.companyProfile.industry],
                        [CalendarDays, "Founded", job.companyProfile.founded],
                        [Users, "Company size", job.companyProfile.size],
                        [
                          MapPin,
                          "Headquarters",
                          job.companyProfile.headquarters,
                        ],
                        [
                          Languages,
                          "Work language",
                          job.companyProfile.workLanguage,
                        ],
                      ].map(([Icon, label, value]) => {
                        const I = Icon as typeof Factory;
                        return (
                          <div
                            key={label as string}
                            className="flex items-start gap-2.5 rounded-2xl bg-paper/60 px-4 py-3"
                          >
                            <I className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-steel">
                                {label as string}
                              </dt>
                              <dd className="text-[var(--foreground)]">
                                {value as string}
                              </dd>
                            </div>
                          </div>
                        );
                      })}
                    </dl>
                  </motion.div>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl">
                      <ListChecks className="h-5 w-5 text-gold" /> What the
                      company asks for
                    </h2>
                    <ul className="mt-4 space-y-2.5 text-sm text-[var(--foreground)]">
                      {job.requirements.map((r) => (
                        <li key={r} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {job.benefits && job.benefits.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl">
                      <Gift className="h-5 w-5 text-gold" /> Benefits &amp;
                      perks
                    </h2>
                    <ul className="mt-4 grid gap-2.5 text-sm text-[var(--foreground)] sm:grid-cols-2">
                      {job.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 rounded-2xl bg-paper/60 px-4 py-3"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {job.visaDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl">
                      <Stamp className="h-5 w-5 text-gold" /> Visa sponsorship
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-mist">
                      {job.visaDetails}
                    </p>
                  </motion.div>
                )}

                {job.hiringProcess && job.hiringProcess.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl">
                      <Route className="h-5 w-5 text-gold" /> Hiring process
                    </h2>
                    <ol className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
                      {job.hiringProcess.map((step, i) => (
                        <li key={step} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-medium text-white">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
                >
                  <h2 className="flex items-center gap-2 font-display text-xl">
                    <Cpu className="h-5 w-5 text-gold" /> Technologies
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.techStack.map((t) => (
                      <span key={t} className="chip chip-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                  {job.skills.length > 0 && (
                    <>
                      <h3 className="mt-6 text-xs font-medium uppercase tracking-wide text-steel">
                        Other skills
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skills.map((t) => (
                          <span key={t} className="chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {job.languages.length > 0 && (
                    <>
                      <h3 className="mt-6 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-steel">
                        <Languages className="h-3.5 w-3.5" /> Languages
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.languages.map((t) => (
                          <span key={t} className="chip">
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>

                {job.relocation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl bg-gradient-brand p-6 text-white md:p-8"
                  >
                    <h2 className="flex items-center gap-2 font-display text-xl">
                      <Plane className="h-5 w-5 -rotate-45" /> Relocation
                      package included
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/85">
                      {job.relocationDetails ||
                        "This company offers a relocation package. Contact them for details."}
                    </p>
                  </motion.div>
                )}
              </div>

              <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="luxe-card rounded-3xl border border-ink-3 bg-white p-6"
                >
                  <h2 className="font-display text-lg">Job overview</h2>
                  <ul className="mt-4 space-y-3 text-sm text-mist">
                    <li className="flex items-center gap-2.5">
                      <Briefcase className="h-4 w-4 text-gold" />
                      {job.employmentType} · {job.workMode}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-gold" />
                      {job.experienceLevel}
                    </li>
                    {job.salary && (
                      <li className="flex items-center gap-2.5">
                        <Wallet className="h-4 w-4 text-gold" />
                        {job.salary}
                      </li>
                    )}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="luxe-card rounded-3xl border border-ink-3 bg-white p-6"
                >
                  <h2 className="font-display text-lg">Apply &amp; contact</h2>
                  <p className="mt-3 flex items-start gap-2.5 text-sm text-mist">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {job.companyLocation}
                  </p>
                  <div className="mt-4 grid gap-3">
                    <Link
                      href={`/jobs/${job.id}/apply`}
                      className="btn-sheen flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
                    >
                      <Send className="h-4 w-4" /> Apply now
                    </Link>
                    <a
                      href={`tel:${job.companyPhone.replace(/[^\d+]/g, "")}`}
                      className="btn-sheen flex items-center justify-center gap-2 rounded-full border border-gold px-5 py-3 text-sm text-gold transition-all hover:bg-gold hover:text-white"
                    >
                      <Phone className="h-4 w-4" /> {job.companyPhone}
                    </a>
                    <a
                      href={`mailto:${job.companyEmail}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                      className="btn-sheen flex items-center justify-center gap-2 rounded-full border border-ink-3 px-5 py-3 text-sm text-mist transition-all hover:border-gold hover:text-gold"
                    >
                      <Mail className="h-4 w-4" /> Email company
                    </a>
                    {site && (
                      <a
                        href={site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-sm text-mist transition-colors hover:text-gold"
                      >
                        <Globe className="h-4 w-4" /> Visit website
                      </a>
                    )}
                  </div>
                </motion.div>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
