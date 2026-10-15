"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  Briefcase,
  Wallet,
  Clock,
  User,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Send,
  Loader2,
  X,
  CheckCircle2,
  HelpCircle,
  Link2,
  Code2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth";
import { Job, getJob, sanitizeHtml, flagEmoji } from "@/lib/jobs";
import {
  StoredFile,
  Application,
  fileToStored,
  downloadStored,
  submitApplication,
  attachScreening,
  formatBytes,
} from "@/lib/applications";
import { ScreeningResult, runScreening } from "@/lib/screening";
import { ScreeningReport } from "@/components/ScreeningReport";
import { OfferDecision } from "@/components/OfferDecision";

const input =
  "h-12 w-full rounded-xl border border-ink-3 bg-white px-4 text-sm text-[var(--foreground)] outline-none transition-all duration-200 hover:border-gold/60 focus:border-gold focus:shadow-[0_0_0_4px_rgba(210,31,31,0.08)]";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
    >
      <h2 className="flex items-center gap-3 font-display text-xl text-[var(--foreground)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-6 grid gap-5">{children}</div>
    </motion.section>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-steel">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist">{hint}</span>}
    </label>
  );
}

function FileSlot({
  label,
  required,
  file,
  onPick,
  onRemove,
  onError,
}: {
  label: string;
  required?: boolean;
  file: StoredFile | null;
  onPick: (f: StoredFile) => void;
  onRemove: () => void;
  onError: (msg: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  async function handle(f: File | undefined) {
    if (!f) return;
    try {
      onPick(await fileToStored(f));
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not add the file.");
    }
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-steel">
        {label}{" "}
        {required ? (
          <span className="text-gold">*</span>
        ) : (
          <span className="normal-case text-mist">(optional)</span>
        )}
      </span>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
      {file ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-paper p-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {file.name}
            </p>
            <p className="text-xs text-mist">{formatBytes(file.size)}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadStored(file)}
              className="flex h-10 items-center gap-1.5 rounded-full border border-gold px-4 text-xs text-gold transition-colors hover:bg-gold hover:text-white"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-10 items-center gap-1.5 rounded-full border border-ink-3 px-4 text-xs text-mist transition-colors hover:border-gold hover:bg-gold hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handle(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-paper ${drag ? "border-gold bg-paper" : "border-ink-3 bg-white"}`}
        >
          <UploadCloud className="h-7 w-7 text-gold" />
          <span className="text-sm text-[var(--foreground)]">
            Click to upload or drag &amp; drop
          </span>
          <span className="text-xs text-mist">PDF, DOC or DOCX · max 2 MB</span>
        </button>
      )}
    </div>
  );
}

function normalizeUrl(v: string) {
  const t = v.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
function validUrl(v: string) {
  try {
    const u = new URL(v);
    return u.hostname.includes(".");
  } catch {
    return false;
  }
}

export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null | undefined>(undefined);
  const [html, setHtml] = useState("");

  const [fullName, setFullName] = useState("");
  // null = untouched, so a signed-in user's email is pre-filled without an effect
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const email = emailInput ?? user?.email ?? "";
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [relocate, setRelocate] = useState<"yes" | "no" | "">("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [cv, setCv] = useState<StoredFile | null>(null);
  const [cover, setCover] = useState<StoredFile | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<Application | null>(null);
  const [screening, setScreening] = useState<{
    status: "idle" | "loading" | "ready" | "error";
    result?: ScreeningResult;
    error?: string;
  }>({ status: "idle" });

  useEffect(() => {
    if (!id) return;
    let active = true;
    getJob(id).then((j) => {
      if (!active) return;
      setJob(j ?? null);
      setHtml(j ? sanitizeHtml(j.descriptionHtml) : "");
      setAnswers((j?.questions ?? []).map(() => ""));
    });
    return () => {
      active = false;
    };
  }, [id]);

  const questions = job?.questions ?? [];
  // Relocation is only asked when the company offers relocation or visa sponsorship.
  const askRelocate = Boolean(job && (job.relocation || job.visaSponsorship));

  const site = job?.companyWebsite
    ? /^https?:\/\//i.test(job.companyWebsite)
      ? job.companyWebsite
      : `https://${job.companyWebsite}`
    : "";

  async function startScreening(app: Application) {
    if (!job) return;
    setScreening({ status: "loading" });
    try {
      const result = await runScreening(job, app);
      attachScreening(app.id, result);
      setScreening({ status: "ready", result });
    } catch (err) {
      setScreening({
        status: "error",
        error:
          err instanceof Error
            ? err.message
            : "The AI check could not be completed.",
      });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;
    setError("");
    if (fullName.trim().length < 2)
      return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError("Please enter a valid email address.");
    if (phone.replace(/[^\d]/g, "").length < 6)
      return setError("Please enter a valid phone number.");
    if (website.trim() && !validUrl(normalizeUrl(website)))
      return setError("Please enter a valid website link.");
    if (github.trim() && !validUrl(normalizeUrl(github)))
      return setError("Please enter a valid GitHub link.");
    if (askRelocate && !relocate)
      return setError("Please tell us if you are ready to relocate.");
    for (let i = 0; i < questions.length; i++) {
      if (!answers[i]?.trim())
        return setError(`Please answer: "${questions[i]}"`);
    }
    if (!cv) return setError("Please upload your CV.");

    setSaving(true);
    try {
      const app = await submitApplication({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: normalizeUrl(website),
        github: normalizeUrl(github),
        readyToRelocate: askRelocate ? relocate : "",
        answers: questions.map((q, i) => ({
          question: q,
          answer: (answers[i] ?? "").trim(),
        })),
        cv,
        coverLetter: cover,
      });
      setDone(app);
      window.scrollTo({ top: 0, behavior: "smooth" });
      void startScreening(app);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

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

        {job && done && (
          <section className="relative overflow-hidden bg-gradient-brand">
            <div className="orb orb-a" aria-hidden />
            <div className="orb orb-b" aria-hidden />
            <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="rounded-3xl bg-white p-8 text-center shadow-2xl md:p-12"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                  }}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-white"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.span>
                <h1 className="mt-6 font-display text-3xl text-[var(--foreground)] md:text-4xl">
                  Application submitted
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist">
                  Thank you, {done.fullName}. Your application for{" "}
                  <b className="text-[var(--foreground)]">{done.jobTitle}</b> at{" "}
                  <b className="text-[var(--foreground)]">{done.companyName}</b>{" "}
                  has been sent successfully.
                </p>
                <div className="mt-6 rounded-2xl border border-ink-3 bg-paper p-4 text-left text-sm text-mist">
                  <p>
                    Email:{" "}
                    <span className="text-[var(--foreground)]">
                      {done.email}
                    </span>
                  </p>
                  <p className="mt-1">
                    Phone:{" "}
                    <span className="text-[var(--foreground)]">
                      {done.phone}
                    </span>
                  </p>
                  <p className="mt-1 break-all">
                    CV:{" "}
                    <span className="text-[var(--foreground)]">
                      {done.cv.name}
                    </span>
                  </p>
                  {done.coverLetter && (
                    <p className="mt-1 break-all">
                      Cover letter:{" "}
                      <span className="text-[var(--foreground)]">
                        {done.coverLetter.name}
                      </span>
                    </p>
                  )}
                  <p className="mt-1">
                    Reference:{" "}
                    <span className="text-[var(--foreground)]">{done.id}</span>
                  </p>
                </div>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/jobs"
                    className="btn-sheen rounded-full bg-gradient-brand px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
                  >
                    Browse more jobs
                  </Link>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-full border border-gold px-7 py-3 text-sm text-gold transition-colors hover:bg-gold hover:text-white"
                  >
                    Back to this job
                  </Link>
                </div>
              </motion.div>

              <ScreeningReport
                status={screening.status}
                result={screening.result}
                error={screening.error}
                onRetry={() => startScreening(done)}
              />

              {screening.status === "ready" && screening.result && (
                <OfferDecision
                  job={job}
                  application={done}
                  result={screening.result}
                />
              )}
            </div>
          </section>
        )}

        {job && !done && (
          <>
            <section className="relative overflow-hidden bg-gradient-brand">
              <div className="orb orb-a" aria-hidden />
              <div className="orb orb-b" aria-hidden />
              <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-white/75 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to job
                </Link>
                <p className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-white/75">
                  <span className="text-lg leading-none">
                    {flagEmoji(job.countryCode)}
                  </span>{" "}
                  {job.countryName}
                </p>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 font-display text-3xl leading-tight text-white md:text-5xl"
                >
                  Apply for {job.title}
                </motion.h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {job.companyName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.city ? `${job.city}, ` : ""}
                    {job.countryName}
                  </span>
                </p>
              </div>
            </section>

            <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[1fr_1.5fr]">
              {/* ---------- Company details ---------- */}
              <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="luxe-card rounded-3xl border border-ink-3 bg-white p-6"
                >
                  <h2 className="font-display text-lg">Company details</h2>
                  <p className="mt-3 font-display text-xl text-[var(--foreground)]">
                    {job.companyName}
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-mist">
                    <li className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {job.companyLocation}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 shrink-0 text-gold" />
                      {job.companyPhone}
                    </li>
                    <li className="flex items-center gap-2.5 break-all">
                      <Mail className="h-4 w-4 shrink-0 text-gold" />
                      {job.companyEmail}
                    </li>
                    {site && (
                      <li className="flex items-center gap-2.5 break-all">
                        <Globe className="h-4 w-4 shrink-0 text-gold" />
                        <a
                          href={site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-gold hover:underline"
                        >
                          {job.companyWebsite}
                        </a>
                      </li>
                    )}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.relocation && (
                      <span className="flex items-center gap-1.5 rounded-full bg-gradient-brand px-3 py-1 text-xs font-medium text-white">
                        <Plane className="h-3 w-3 -rotate-45" /> Relocation
                        package
                      </span>
                    )}
                    {job.visaSponsorship ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-gold px-3 py-1 text-xs font-medium text-gold">
                        <BadgeCheck className="h-3 w-3" /> Visa sponsorship
                      </span>
                    ) : (
                      <span className="rounded-full border border-ink-3 px-3 py-1 text-xs text-mist">
                        No visa needed
                      </span>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
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
                  {job.techStack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.techStack.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="luxe-card rounded-3xl border border-ink-3 bg-white p-6"
                >
                  <h2 className="font-display text-lg">
                    About the company &amp; role
                  </h2>
                  <div
                    className="rte-content mt-3 max-h-72 overflow-y-auto break-words pr-1 text-sm leading-relaxed text-[var(--foreground)]"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </motion.div>
              </aside>

              {/* ---------- Application form ---------- */}
              <form onSubmit={submit} className="grid content-start gap-6">
                <Section
                  icon={<User className="h-4 w-4" />}
                  title="Your details"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Full name *">
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                        className={input}
                      />
                    </Field>
                    <Field label="Email *">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@email.com"
                        autoComplete="email"
                        className={input}
                      />
                    </Field>
                    <Field label="Phone number *">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 0000000"
                        autoComplete="tel"
                        className={input}
                      />
                    </Field>
                    <Field label="Website / portfolio (optional)">
                      <div className="relative">
                        <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                        <input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="yourwebsite.com"
                          className={`${input} pl-10`}
                        />
                      </div>
                    </Field>
                  </div>
                  <Field label="GitHub link (optional)">
                    <div className="relative">
                      <Code2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
                      <input
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="github.com/username"
                        className={`${input} pl-10`}
                      />
                    </div>
                  </Field>
                </Section>

                {askRelocate && (
                  <Section
                    icon={<Plane className="h-4 w-4 -rotate-45" />}
                    title="Relocation"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-3 p-4">
                      <span className="text-sm text-[var(--foreground)]">
                        Are you ready to relocate to {job.countryName}? *
                      </span>
                      <div className="flex overflow-hidden rounded-full border border-ink-3 text-sm">
                        <button
                          type="button"
                          onClick={() => setRelocate("yes")}
                          className={`px-5 py-1.5 transition-colors ${relocate === "yes" ? "bg-gradient-brand text-white" : "text-mist hover:text-gold"}`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setRelocate("no")}
                          className={`px-5 py-1.5 transition-colors ${relocate === "no" ? "bg-gradient-brand text-white" : "text-mist hover:text-gold"}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {job.relocation && job.relocationDetails && (
                      <p className="text-xs leading-relaxed text-mist">
                        Package: {job.relocationDetails}
                      </p>
                    )}
                  </Section>
                )}

                {questions.length > 0 && (
                  <Section
                    icon={<HelpCircle className="h-4 w-4" />}
                    title={`Questions from ${job.companyName}`}
                  >
                    {questions.map((q, i) => (
                      <Field key={i} label={`${q} *`}>
                        <textarea
                          rows={3}
                          value={answers[i] ?? ""}
                          onChange={(e) =>
                            setAnswers((cur) =>
                              cur.map((a, idx) =>
                                idx === i ? e.target.value : a,
                              ),
                            )
                          }
                          placeholder="Your answer…"
                          className={`${input} h-auto py-3`}
                        />
                      </Field>
                    ))}
                  </Section>
                )}

                <Section
                  icon={<FileText className="h-4 w-4" />}
                  title="CV & cover letter"
                >
                  <FileSlot
                    label="CV / Resume"
                    required
                    file={cv}
                    onPick={(f) => {
                      setCv(f);
                      setError("");
                    }}
                    onRemove={() => setCv(null)}
                    onError={setError}
                  />
                  <FileSlot
                    label="Cover letter"
                    file={cover}
                    onPick={(f) => {
                      setCover(f);
                      setError("");
                    }}
                    onRemove={() => setCover(null)}
                    onError={setError}
                  />
                </Section>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-2xl border border-gold/40 bg-paper px-4 py-3 text-sm text-gold"
                  >
                    <X className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-sheen flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-brand text-base font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {saving ? "Submitting…" : "Submit application"}
                </button>
              </form>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
