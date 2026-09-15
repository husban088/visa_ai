"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StepIndicator } from "@/components/StepIndicator";
import { Landmark } from "@/components/Landmarks";
import { DestinationPhoto } from "@/components/DestinationPhoto";
import { ResidenceCountryPicker } from "@/components/ResidenceCountryPicker";
import { RouteEstimate } from "@/components/RouteEstimate";
import { countries } from "@/lib/countries";
import { visaTypes } from "@/lib/visa-types";
import { useResidenceCountry } from "@/lib/use-residence-country";
import { VisaTypeId } from "@/types";
import { ArrowRight } from "lucide-react";

function ApplyStepOne() {
  const router = useRouter();
  const params = useSearchParams();

  const [countryCode, setCountryCode] = useState(params.get("country") ?? "");
  const [visaType, setVisaType] = useState<VisaTypeId | "">(
    (params.get("visaType") as VisaTypeId) ?? ""
  );
  const [fullName, setFullName] = useState("");
  const { country: residenceCountry } = useResidenceCountry();

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === countryCode),
    [countryCode]
  );

  const availableVisaTypes = selectedCountry
    ? visaTypes.filter((v) => selectedCountry.visaTypesOffered.includes(v.id))
    : visaTypes;

  const canContinue = countryCode && visaType && fullName.trim().length > 1;

  function handleContinue() {
    if (!canContinue) return;
    sessionStorage.setItem(
      "visaai_draft",
      JSON.stringify({
        countryCode,
        visaType,
        fullName: fullName.trim(),
        originCountryCode: residenceCountry?.code ?? "",
      })
    );
    router.push("/apply/documents");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-4xl px-6 py-16">
        <StepIndicator current={1} />

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 font-display text-3xl text-[var(--foreground)] md:text-4xl"
        >
          Where are you going, and why?
        </motion.h1>
        <p className="mt-3 max-w-lg text-sm text-mist">
          Choose a destination and the reason for your trip. This determines
          which documents you&apos;ll need and who reviews your interview.
        </p>

        <div className="mt-10">
          <p className="text-sm text-[var(--foreground)]">Your full name (as on passport)</p>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ahsan Hussain"
            className="mt-2 w-full max-w-sm rounded-lg border border-ink-3 bg-ink-2 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel focus:border-gold"
          />
        </div>

        <ResidenceCountryPicker />

        {selectedCountry && <DestinationPhoto country={selectedCountry} className="mt-10" />}

        <div className="mt-10">
          <p className="text-sm text-[var(--foreground)]">Destination country</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setCountryCode(c.code)}
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  countryCode === c.code
                    ? "border-gold bg-ink-2"
                    : "border-ink-3 bg-ink-2/40 hover:border-steel"
                }`}
              >
                <Landmark
                  id={c.landmark}
                  className={`h-7 w-7 transition-colors ${
                    countryCode === c.code ? "text-gold" : "text-steel group-hover:text-mist"
                  }`}
                />
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    {c.flag} {c.name}
                  </p>
                  <p className="text-[11px] text-steel">{c.avgProcessingDays}-day decision</p>
                </div>
              </button>
            ))}
          </div>

          {selectedCountry && residenceCountry && (
            <RouteEstimate
              originCountryCode={residenceCountry.code}
              originName={residenceCountry.name}
              destination={selectedCountry}
            />
          )}
        </div>

        <div className="mt-10">
          <p className="text-sm text-[var(--foreground)]">Visa type</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {availableVisaTypes.map((v) => (
              <button
                key={v.id}
                onClick={() => setVisaType(v.id)}
                className={`rounded-xl border px-5 py-4 text-left transition-all ${
                  visaType === v.id
                    ? "border-gold bg-ink-2"
                    : "border-ink-3 bg-ink-2/40 hover:border-steel"
                }`}
              >
                <p className="text-sm text-[var(--foreground)]">{v.name}</p>
                <p className="mt-1 text-[11px] text-steel">{v.tagline}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="group mt-12 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Continue to documents
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
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
