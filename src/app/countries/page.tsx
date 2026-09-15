import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DeparturesBoard } from "@/components/DeparturesBoard";
import { FinalCta } from "@/components/FinalCta";

export const metadata = {
  title: "Countries — VisaAI",
  description:
    "Browse every country VisaAI currently takes interviews for, with average decision time and open interview seats today.",
};

export default function CountriesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-ink pt-20 pb-4">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-xs uppercase tracking-wide text-gold">Departures</p>
            <h1 className="mt-3 font-display text-4xl text-[var(--foreground)] md:text-5xl">
              Pick a country, see tonight&apos;s open seats
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-mist md:text-base">
              Every destination below is taking interviews right now. Tap a
              country to start an application for it directly.
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
