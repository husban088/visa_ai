import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FinalCta } from "@/components/FinalCta";
import { JourneyPlanner } from "@/components/JourneyPlanner";

export const metadata = {
  title: "Journey planner — VisaAI",
  description:
    "Pick where you are flying from, your destination and visa type — see the embassy fee, flight estimate, decision time and documents in one boarding pass.",
};

const ARC = "M -40 210 C 300 -50, 900 -50, 1240 200";

export default function PlannerPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-brand pb-28 pt-16 text-white sm:pb-36 sm:pt-24">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            aria-hidden
            className="absolute -left-32 -top-32 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(239,68,68,0.35), transparent 65%)",
            }}
          />
          <svg
            aria-hidden
            viewBox="0 0 1200 220"
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-x-0 bottom-0 h-full w-full"
          >
            <path
              d={ARC}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.5"
              strokeDasharray="4 9"
            />
            <g>
              <circle r="16" fill="rgba(255,255,255,0.14)" />
              <circle r="5" fill="#fff" />
              <animateMotion dur="7s" repeatCount="indefinite" path={ARC} />
            </g>
          </svg>

          <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
              Journey planner
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
              Plan the whole journey{" "}
              <span className="italic text-red-200">before you pack</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
              Choose where you fly from, where you are headed and the visa lane.
              Get the embassy fee, flight estimate, decision time and the
              documents you will need — on one boarding pass.
            </p>
          </div>
        </section>

        <JourneyPlanner />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
