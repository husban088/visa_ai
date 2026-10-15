"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { DestinationPhoto } from "@/components/DestinationPhoto";
import { ResidenceCountryPicker } from "@/components/ResidenceCountryPicker";
import { RouteEstimate } from "@/components/RouteEstimate";
import { getCountry } from "@/lib/countries";
import { useResidenceCountry } from "@/lib/use-residence-country";
import { OfferLetter, listOffers } from "@/lib/offers";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileSignature,
  Lock,
  Search,
} from "lucide-react";

function ApplyStepOne() {
  const router = useRouter();
  const params = useSearchParams();
  const offerParam = params.get("offer");

  // null = not loaded yet (localStorage is only readable in the browser)
  const [offers, setOffers] = useState<OfferLetter[] | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const { country: residenceCountry } = useResidenceCountry();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read offers from browser storage on mount
    setOffers(listOffers().filter((o) => o.status === "accepted"));
  }, []);

  if (offers === null) return <Shell>{null}</Shell>;

  /* ---------- No accepted offer yet: the visa process is locked ---------- */
  if (offers.length === 0) {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-xl rounded-3xl border border-ink-3 bg-white p-8 text-center shadow-xl md:p-12"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-white">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-6 font-display text-3xl text-[var(--foreground)]">
            Get a company offer first
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            A visa process can only start after a company sends you an offer
            letter. Apply for a job — our AI checks your profile instantly and
            issues your offer letter if you are a good fit.
          </p>
          <Link
            href="/jobs"
            className="btn-sheen mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-8 py-3.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            <Search className="h-4 w-4" /> Browse jobs
          </Link>
        </motion.div>
      </Shell>
    );
  }

  const selectedId =
    pickedId ?? offerParam ?? (offers.length === 1 ? offers[0].id : null);
  const offer = offers.find((o) => o.id === selectedId);

  /* ---------- Several offers: choose which one to continue ---------- */
  if (!offer) {
    return (
      <Shell>
        <h1 className="font-display text-3xl text-[var(--foreground)] md:text-4xl">
          Choose your offer
        </h1>
        <p className="mt-3 max-w-lg text-sm text-mist">
          Pick the accepted offer you want to start the visa process for.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {offers.map((o) => (
            <button
              key={o.id}
              onClick={() => setPickedId(o.id)}
              className="group rounded-2xl border border-ink-3 bg-white p-5 text-left transition-all hover:-translate-y-1 hover:border-gold hover:shadow-xl"
            >
              <p className="flex items-center gap-2 font-display text-lg text-[var(--foreground)]">
                <Briefcase className="h-4 w-4 text-gold" /> {o.jobTitle}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-mist">
                <Building2 className="h-4 w-4" /> {o.companyName}
              </p>
              <p className="mt-2 text-xs text-steel">{o.countryName}</p>
              {o.visaApplicationId && (
                <p className="mt-2 text-xs text-gold">
                  Visa process already started
                </p>
              )}
            </button>
          ))}
        </div>
      </Shell>
    );
  }

  const country = getCountry(offer.countryCode);

  function handleContinue() {
    if (!offer) return;
    sessionStorage.setItem(
      "visaai_draft",
      JSON.stringify({
        countryCode: offer.countryCode,
        visaType: "work",
        fullName: offer.applicantName,
        originCountryCode: residenceCountry?.code ?? "",
        offerId: offer.id,
      }),
    );
    router.push("/apply/documents");
  }

  return (
    <Shell>
      <StepIndicator current={1} />

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 font-display text-3xl text-[var(--foreground)] md:text-4xl"
      >
        Your work visa for {offer.countryName}
      </motion.h1>
      <p className="mt-3 max-w-lg text-sm text-mist">
        Your offer was accepted. The country, visa type and your details are
        already filled in from the offer letter.
      </p>

      <div className="mt-8 rounded-2xl border border-ink-3 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-white">
            <FileSignature className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg text-[var(--foreground)]">
              {offer.jobTitle}
            </p>
            <p className="text-sm text-mist">
              {offer.companyName} · {offer.city ? `${offer.city}, ` : ""}
              {offer.countryName}
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3 py-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Offer accepted
          </span>
        </div>
        <dl className="mt-5 grid gap-4 border-t border-ink-3 pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-steel">
              Applicant
            </dt>
            <dd className="mt-1 text-[var(--foreground)]">
              {offer.applicantName}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-steel">
              Visa type
            </dt>
            <dd className="mt-1 text-[var(--foreground)]">Work Visa</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-steel">
              Offer ref
            </dt>
            <dd className="mt-1 break-all text-[var(--foreground)]">
              {offer.id}
            </dd>
          </div>
        </dl>
      </div>

      {country && <DestinationPhoto country={country} className="mt-8" />}

      <ResidenceCountryPicker />

      {country && residenceCountry && (
        <RouteEstimate
          originCountryCode={residenceCountry.code}
          originName={residenceCountry.name}
          destination={country}
        />
      )}

      {offer.visaApplicationId ? (
        <div className="mt-10 rounded-2xl border border-gold/30 bg-paper p-5 text-sm text-mist">
          <p>You already started the visa process for this offer.</p>
          <button
            onClick={() => {
              localStorage.setItem(
                "visaai_active_id",
                offer.visaApplicationId!,
              );
              router.push("/dashboard");
            }}
            className="btn-sheen mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Go to my visa application
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleContinue}
          className="btn-sheen group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
        >
          Continue to documents
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-4xl px-6 py-16">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={null}>
      <ApplyStepOne />
    </Suspense>
  );
}
