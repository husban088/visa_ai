"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Info,
} from "lucide-react";
import type { ScreeningResult, Verdict } from "@/lib/screening";

const VERDICT: Record<Verdict, { label: string; tone: string }> = {
  strong_match: { label: "Strong match", tone: "text-emerald-600" },
  good_match: { label: "Good match", tone: "text-emerald-600" },
  partial_match: { label: "Partial match", tone: "text-amber-600" },
  weak_match: { label: "Weak match", tone: "text-gold" },
};

const ITEMS: { key: keyof ScreeningResult["breakdown"]; label: string }[] = [
  { key: "skills", label: "Skills & tech stack" },
  { key: "experience", label: "Experience level" },
  { key: "cv", label: "CV quality" },
  { key: "coverLetter", label: "Cover letter" },
  { key: "website", label: "Portfolio & GitHub" },
  { key: "answers", label: "Company questions" },
];

const STEPS = [
  "Reading your CV…",
  "Reading your cover letter…",
  "Checking your portfolio website…",
  "Checking your GitHub…",
  "Matching skills with the job…",
  "Calculating your score…",
];

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className="text-ink-3"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl text-[var(--foreground)]">
          {score}
        </span>
        <span className="text-xs text-mist">out of 100</span>
      </div>
    </div>
  );
}

function List({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-ink-3 bg-paper p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
        {icon} {title}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm text-mist">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScreeningReport({
  status,
  result,
  error,
  onRetry,
}: {
  status: "idle" | "loading" | "ready" | "error";
  result?: ScreeningResult;
  error?: string;
  onRetry: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (status !== "loading") return;
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      2500,
    );
    return () => {
      clearInterval(t);
      setStep(0);
    };
  }, [status]);

  if (status === "idle") return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 rounded-3xl bg-white p-6 shadow-2xl md:p-10"
    >
      <h2 className="flex items-center gap-3 font-display text-2xl text-[var(--foreground)]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        AI application check
      </h2>

      {status === "loading" && (
        <div className="mt-8 flex flex-col items-center gap-4 py-6 text-center">
          <Loader2 className="h-9 w-9 animate-spin text-gold" />
          <p className="text-sm text-[var(--foreground)]">{STEPS[step]}</p>
          <p className="text-xs text-mist">
            This can take up to a minute. Please keep this page open.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-paper p-5 text-sm">
          <p className="flex items-start gap-2 text-gold">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error || "The AI check could not be completed."}
          </p>
          <p className="mt-2 text-xs text-mist">
            Your application was still submitted successfully.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2 text-xs text-gold transition-colors hover:bg-gold hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      )}

      {status === "ready" && result && (
        <div className="mt-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ScoreRing score={result.overallScore} />
            <div className="text-center sm:text-left">
              <p
                className={`font-display text-2xl ${VERDICT[result.verdict].tone}`}
              >
                {VERDICT[result.verdict].label}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-ink-3 px-3 py-1 text-xs text-mist">
                {result.eligible ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{" "}
                    Meets the main requirements
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-gold" /> Does not
                    yet meet the main requirements
                  </>
                )}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                {result.summary}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {ITEMS.map(({ key, label }) => {
              const item = result.breakdown[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--foreground)]">{label}</span>
                    <span className="text-xs text-mist">
                      {item.score === null ? "Not rated" : `${item.score}/100`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-3">
                    {item.score !== null && (
                      <motion.div
                        className="h-full rounded-full bg-gradient-brand"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    )}
                  </div>
                  {item.comment && (
                    <p className="mt-1.5 text-xs leading-relaxed text-mist">
                      {item.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4">
            <List
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              title="Strengths"
              items={result.strengths}
            />
            <List
              icon={<AlertTriangle className="h-4 w-4 text-gold" />}
              title="Gaps for this job"
              items={result.gaps}
            />
            <List
              icon={<Lightbulb className="h-4 w-4 text-gold" />}
              title="How to improve"
              items={result.suggestions}
            />
            <List
              icon={<Info className="h-4 w-4 text-steel" />}
              title="Could not be checked"
              items={result.notes}
            />
          </div>

          <p className="mt-6 text-center text-xs text-mist">
            This score is an AI estimate to help you understand your fit. The
            company makes the final decision.
          </p>
        </div>
      )}
    </motion.section>
  );
}
