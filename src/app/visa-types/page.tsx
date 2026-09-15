import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VisaTypesShowcase } from "@/components/VisaTypesShowcase";
import { FinalCta } from "@/components/FinalCta";

export const metadata = {
  title: "Visa types — VisaAI",
  description:
    "Study, spouse, visit, or work — see required documents and average decision time for every visa type VisaAI processes.",
};

export default function VisaTypesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-paper pt-20 pb-4 text-ink-text">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-xs uppercase tracking-wide text-gold">Visa types</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">
              Whatever the reason for travel, there&apos;s a lane for it
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-text/70 md:text-base">
              Every visa type runs through the same fair, same-day interview
              process — only the required documents change.
            </p>
          </div>
        </section>
        <VisaTypesShowcase />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
