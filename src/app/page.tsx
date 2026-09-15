import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { VisaTypesShowcase } from "@/components/VisaTypesShowcase";
import { DeparturesBoard } from "@/components/DeparturesBoard";
import { Fairness } from "@/components/Fairness";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <VisaTypesShowcase />
        <DeparturesBoard />
        <Fairness />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
