"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { getVisaType } from "@/lib/visa-types";
import { getCountry } from "@/lib/countries";
import { createApplication, nextInterviewSlot, updateApplication } from "@/lib/store";
import { Landmark } from "@/components/Landmarks";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, CheckCircle2, UserRound } from "lucide-react";

interface Draft {
  countryCode: string;
  visaType: string;
  fullName: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [docs, setDocs] = useState<{ name: string; url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user, enabled: authEnabled } = useAuth();

  useEffect(() => {
    const rawDraft = sessionStorage.getItem("visaai_draft");
    const rawDocs = sessionStorage.getItem("visaai_documents");
    if (!rawDraft || !rawDocs) {
      router.replace("/apply");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser storage on mount
    setDraft(JSON.parse(rawDraft));
    setDocs(JSON.parse(rawDocs));
  }, [router]);

  if (!draft) return null;

  const visaType = getVisaType(draft.visaType);
  const country = getCountry(draft.countryCode);

  async function handleSubmit() {
    if (!draft) return;
    setSubmitting(true);
    try {
      const app = await createApplication({
        countryCode: draft.countryCode,
        visaType: draft.visaType as never,
        fullName: draft.fullName,
      });
      const documents = docs.map((d) => ({ ...d, uploadedAt: new Date().toISOString() }));
      const slot = nextInterviewSlot();
      const finalApp = await updateApplication(app.id, {
        documents,
        status: "interview_scheduled",
        interviewSlot: slot,
      });
      sessionStorage.removeItem("visaai_draft");
      sessionStorage.removeItem("visaai_documents");
      if (finalApp) {
        localStorage.setItem("visaai_active_id", finalApp.id);
        router.push("/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-2xl px-6 py-16">
        <StepIndicator current={3} />

        <h1 className="mt-8 font-display text-3xl text-[var(--foreground)] md:text-4xl">
          Review before you submit
        </h1>
        <p className="mt-3 text-sm text-mist">
          Once submitted, you&apos;ll be assigned an interview slot immediately.
        </p>

        <div className="mt-10 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
          <div className="flex items-center gap-3 border-b border-ink-3 pb-5">
            {country && <Landmark id={country.landmark} className="h-9 w-9 text-gold" />}
            <div>
              <p className="text-[var(--foreground)]">{draft.fullName}</p>
              <p className="text-xs text-steel">
                {visaType?.name} · {country?.flag} {country?.name}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {docs.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm text-mist">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-5 text-sm text-gold-bright">
          By submitting, you confirm the interview will be conducted by you,
          in one continuous session, without assistance from another AI tool
          or person. Attempts to bypass this are treated as grounds for
          rejection.
        </div>

        {authEnabled && !user && (
          <p className="mt-6 flex items-start gap-2 rounded-xl border border-ink-3 bg-ink-2/60 px-5 py-4 text-xs text-steel">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>
              You&apos;re submitting without an account, so this application will
              only be visible in this browser.{" "}
              <Link href="/login" className="text-mist underline underline-offset-4 hover:text-gold-bright">
                Sign in first
              </Link>{" "}
              if you want to track it from any device.
            </span>
          </p>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => router.push("/apply/documents")}
            className="inline-flex items-center gap-2 text-sm text-mist hover:text-gold-bright"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
