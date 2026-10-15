"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { DocumentDownloader, ReadyDoc } from "@/components/DocumentDownloader";
import { getVisaType } from "@/lib/visa-types";
import { getCountry } from "@/lib/countries";
import { getOffer } from "@/lib/offers";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Draft {
  countryCode: string;
  visaType: string;
  fullName: string;
  offerId?: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ready, setReady] = useState<ReadyDoc[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("visaai_draft");
    if (!raw) {
      router.replace("/apply");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser storage on mount
    setDraft(JSON.parse(raw));
  }, [router]);

  if (!draft) return null;

  const visaType = getVisaType(draft.visaType);
  const country = getCountry(draft.countryCode);
  const offer = draft.offerId ? getOffer(draft.offerId) : undefined;
  const allDone = visaType
    ? ready.length >= visaType.requiredDocuments.length
    : false;

  function handleContinue() {
    sessionStorage.setItem("visaai_documents", JSON.stringify(ready));
    router.push("/apply/review");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
        <StepIndicator current={2} />

        <h1 className="mt-8 font-display text-3xl text-[var(--foreground)] md:text-4xl">
          Your documents
        </h1>
        <p className="mt-3 text-sm text-mist">
          For your {visaType?.name.toLowerCase()} to {country?.name}
          {offer ? ` (${offer.jobTitle} at ${offer.companyName})` : ""}.
          There&apos;s nothing to upload — your company offer letter is attached
          automatically and the AI has created and uploaded the other demo
          documents for {draft.fullName}. Download any of them for your own
          records; your interview is what actually decides this visa.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {visaType?.requiredDocuments.map((doc) => (
            <DocumentDownloader
              key={doc}
              label={doc}
              fullName={draft.fullName}
              countryName={country?.name}
              visaTypeName={visaType?.name}
              offer={offer}
              onReady={(d) =>
                setReady((prev) => [
                  ...prev.filter((p) => p.name !== d.name),
                  d,
                ])
              }
            />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={() => router.push("/apply")}
            className="inline-flex items-center gap-2 text-sm text-mist hover:text-gold-bright"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!allDone}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            Review application
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
