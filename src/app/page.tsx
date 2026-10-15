import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HomeMarquee } from "@/components/HomeMarquee";
import { HomeJourney } from "@/components/HomeJourney";
import { HomeLiveJobs } from "@/components/HomeLiveJobs";
import { HomeFeatures } from "@/components/HomeFeatures";
import { DeparturesBoard } from "@/components/DeparturesBoard";
import { HomeForCompanies } from "@/components/HomeForCompanies";
import { Fairness } from "@/components/Fairness";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HomeMarquee />
        <HomeJourney />
        <HomeLiveJobs />
        <HomeFeatures />
        <DeparturesBoard />
        <HomeForCompanies />
        <Fairness />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
