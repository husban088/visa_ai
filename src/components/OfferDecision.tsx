"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileSignature,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Plane,
  SearchX,
} from "lucide-react";
import type { Job } from "@/lib/jobs";
import type { Application } from "@/lib/applications";
import type { ScreeningResult } from "@/lib/screening";
import {
  OfferLetter as Offer,
  acceptOffer,
  createOffer,
  decideFromScreening,
} from "@/lib/offers";
import { OfferLetter } from "@/components/OfferLetter";

type Phase = "drafting" | "issued" | "accepted";

/**
 * Instant AI decision shown right after the AI application check:
 *  - good match  -> luxury DEMO offer letter, auto-accepted by the AI,
 *                   then the visa process can be started
 *  - weak match  -> job rejection message
 */
export function OfferDecision({
  job,
  application,
  result,
}: {
  job: Job;
  application: Application;
  result: ScreeningResult;
}) {
  const decision = decideFromScreening(result);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [phase, setPhase] = useState<Phase>("drafting");

  useEffect(() => {
    if (!decision.offer) return;
    const created = createOffer({ job, application, screening: result });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync offer from storage
    setOffer(created);
    if (created.status === "accepted") {
      setPhase("accepted");
      return;
    }
    setPhase("drafting");
    const t1 = setTimeout(() => setPhase("issued"), 1800);
    const t2 = setTimeout(() => {
      const accepted = acceptOffer(created.id);
      if (accepted) setOffer(accepted);
      setPhase("accepted");
    }, 4600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, decision.offer, application.id, job.id]);

  /* ---------------- Rejection ---------------- */
  if (!decision.offer) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-3xl bg-white p-6 text-center shadow-2xl md:p-10"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-white"
        >
          <XCircle className="h-8 w-8" />
        </motion.span>
        <h2 className="mt-5 font-display text-2xl text-[var(--foreground)] md:text-3xl">
          Application not selected
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist">
          Sorry {application.fullName}, {job.companyName} will not move forward
          with your application for{" "}
          <b className="text-[var(--foreground)]">{job.title}</b> right now.
        </p>
        <p className="mx-auto mt-4 max-w-lg rounded-2xl border border-ink-3 bg-paper p-4 text-sm leading-relaxed text-mist">
          <span className="font-medium text-[var(--foreground)]">
            AI reason:{" "}
          </span>
          {decision.reason}
        </p>
        {result.suggestions?.length > 0 && (
          <ul className="mx-auto mt-4 max-w-lg space-y-1.5 text-left text-sm text-mist">
            {result.suggestions.slice(0, 3).map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {s}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/jobs"
          className="btn-sheen mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          <SearchX className="h-4 w-4" /> Browse other jobs
        </Link>
      </motion.section>
    );
  }

  /* ---------------- Offer ---------------- */
  return (
    <section className="mt-6">
      {phase === "drafting" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white p-8 text-center shadow-2xl"
        >
          <FileSignature className="mx-auto h-9 w-9 animate-pulse text-gold" />
          <p className="mt-4 font-display text-xl text-[var(--foreground)]">
            Good news — {job.companyName} wants to hire you
          </p>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-mist">
            <Loader2 className="h-4 w-4 animate-spin" /> AI is writing your
            offer letter…
          </p>
        </motion.div>
      )}

      {offer && phase !== "drafting" && (
        <>
          <OfferLetter offer={offer} />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-5 max-w-3xl rounded-3xl bg-white p-6 text-center shadow-2xl"
          >
            {phase === "issued" ? (
              <p className="flex items-center justify-center gap-2 text-sm text-mist">
                <Loader2 className="h-4 w-4 animate-spin text-gold" /> AI is
                accepting the offer on your behalf…
              </p>
            ) : (
              <>
                <p className="flex items-center justify-center gap-2 font-display text-xl text-[var(--foreground)]">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Offer
                  accepted
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist">
                  Your work-visa process for{" "}
                  <b className="text-[var(--foreground)]">
                    {offer.countryName}
                  </b>{" "}
                  can start now. Next: documents, then your AI interview (typed
                  or voice, with video recording).
                </p>
                <Link
                  href={`/apply?offer=${offer.id}`}
                  className="btn-sheen group mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
                >
                  <Plane className="h-4 w-4 -rotate-45" /> Start visa process
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </motion.div>
        </>
      )}
    </section>
  );
}
