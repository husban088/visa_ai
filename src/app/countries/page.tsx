import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DeparturesBoard } from "@/components/DeparturesBoard";
import { FinalCta } from "@/components/FinalCta";

export const metadata = {
  title: "Countries — VisaAI",
  description:
    "Browse every country with open tech jobs and see companies hiring there.",
};

export default function CountriesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-ink pt-20 pb-4">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-xs uppercase tracking-wide text-gold">
              Departures
            </p>
            <h1 className="mt-3 font-display text-4xl text-[var(--foreground)] md:text-5xl">
              Pick a country, see who is hiring
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist md:text-base">
              Tap a country to see its open jobs. A visa process only starts
              after a company sends you an offer letter.
            </p>
          </div>
        </section>
        <DeparturesBoard />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
