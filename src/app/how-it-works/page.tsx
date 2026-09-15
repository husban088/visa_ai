import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import { Fairness } from "@/components/Fairness";
import { FinalCta } from "@/components/FinalCta";

export const metadata = {
  title: "How it works — VisaAI",
  description:
    "See exactly how a VisaAI application moves from upload, to interview slot, to decision — and the fairness rules behind the AI interview.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-ink pt-20 pb-4">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-xs uppercase tracking-wide text-gold">Process</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--foreground)] md:text-5xl">
              How a VisaAI application actually moves
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist md:text-base">
              No embassy queue, no months of waiting on a letter. Four clear
              steps, each one visible on your dashboard as it happens.
            </p>
          </div>
        </section>
        <HowItWorks />
        <Fairness />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
