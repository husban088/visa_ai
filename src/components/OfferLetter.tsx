"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Download,
  Gift,
  MapPin,
  Wallet,
  CalendarDays,
  Briefcase,
} from "lucide-react";
import type { OfferLetter as Offer } from "@/lib/offers";
import { downloadOfferPdf } from "@/lib/offer-pdf";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Luxury on-screen version of the AI-generated DEMO offer letter. */
export function OfferLetter({ offer }: { offer: Offer }) {
  const accepted = offer.status === "accepted";

  return (
    <motion.article
      initial={{ opacity: 0, y: 40, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-[#fdfaf4] p-2 text-left shadow-[0_40px_90px_-30px_rgba(0,0,0,0.55)] sm:p-3"
    >
      {/* gold double frame */}
      <div className="relative rounded-[1.4rem] border-2 border-[#b08a34] p-1.5">
        <div className="relative overflow-hidden rounded-[1.2rem] border border-[#b08a34]/60 px-5 py-8 sm:px-10 sm:py-12">
          {/* DEMO watermark */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] select-none font-display text-[6rem] font-semibold tracking-widest text-[#7a1414]/[0.06] sm:text-[10rem]"
          >
            DEMO
          </span>
          {/* soft shine sweep */}
          <motion.span
            aria-hidden
            initial={{ x: "-120%" }}
            animate={{ x: "320%" }}
            transition={{ duration: 2.4, delay: 0.6, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          />

          <header className="relative text-center">
            <p className="font-display text-[11px] uppercase tracking-[0.35em] text-[#b08a34]">
              Letter of employment
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold uppercase tracking-wide text-[#1e1414] sm:text-4xl">
              {offer.companyName}
            </h2>
            <p className="mx-auto mt-2 max-w-md break-words text-xs leading-relaxed text-[#6e5f5a]">
              {offer.companyLocation} · {offer.companyEmail} ·{" "}
              {offer.companyPhone}
            </p>
            <div className="mx-auto mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#b08a34]" />
              <Gift className="h-4 w-4 text-[#b08a34]" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#b08a34]" />
            </div>
            <h3 className="mt-5 font-display text-xl italic text-[#961919] sm:text-2xl">
              Offer of Employment
            </h3>
          </header>

          <div className="relative mt-7 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6e5f5a]">
            <span>Ref: {offer.id}</span>
            <span>Date: {fmt(offer.issuedAt)}</span>
          </div>

          <div className="relative mt-6 font-display text-[15px] leading-relaxed text-[#1e1414] sm:text-base">
            <p>Dear {offer.applicantName},</p>
            <p className="mt-4">
              On behalf of <b>{offer.companyName}</b>, we are delighted to offer
              you the position of <b>{offer.jobTitle}</b> at our{" "}
              {offer.city ? `${offer.city}, ` : ""}
              {offer.countryName} office. Our AI hiring assistant reviewed your
              CV, answers and portfolio and scored your profile{" "}
              <b>{offer.aiScore}/100</b> for this role — we would love to have
              you on the team.
            </p>
          </div>

          <dl className="relative mt-7 grid gap-px overflow-hidden rounded-2xl border border-[#d2be8c] bg-[#d2be8c] sm:grid-cols-2">
            {[
              { icon: Briefcase, k: "Position", v: offer.jobTitle },
              {
                icon: Briefcase,
                k: "Employment",
                v: `${offer.employmentType} · ${offer.workMode}`,
              },
              {
                icon: MapPin,
                k: "Location",
                v: `${offer.city ? offer.city + ", " : ""}${offer.countryName}`,
              },
              { icon: Wallet, k: "Compensation", v: offer.salary },
              { icon: CalendarDays, k: "Start date", v: fmt(offer.startDate) },
              {
                icon: BadgeCheck,
                k: "Visa",
                v: offer.visaSponsorship
                  ? "Company-sponsored work visa"
                  : "Work visa support provided",
              },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-start gap-3 bg-[#f7f0e1] p-4"
              >
                <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#961919]" />
                <div className="min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-widest text-[#961919]">
                    {row.k}
                  </dt>
                  <dd className="mt-0.5 break-words font-display text-sm text-[#1e1414]">
                    {row.v}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="relative mt-7">
            <p className="font-display text-base font-semibold text-[#1e1414]">
              Benefits
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-[#3a2c2a]">
              {offer.benefits.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b08a34]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <footer className="relative mt-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-display text-3xl italic text-[#3c1e1e]">
                AI Hiring Desk
              </p>
              <div className="mt-1 h-px w-44 bg-[#78645a]" />
              <p className="mt-1.5 text-xs text-[#6e5f5a]">
                Talent Acquisition · {offer.companyName}
              </p>
            </div>

            {/* seal */}
            <motion.div
              initial={{ scale: 2.4, opacity: 0, rotate: -25 }}
              animate={
                accepted
                  ? { scale: 1, opacity: 1, rotate: -10 }
                  : { scale: 1, opacity: 0.35, rotate: -10 }
              }
              transition={{ type: "spring", stiffness: 160, damping: 11 }}
              className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#b08a34] text-[#961919]"
            >
              <div className="flex h-[5.9rem] w-[5.9rem] flex-col items-center justify-center rounded-full border border-dashed border-[#b08a34] text-center">
                <BadgeCheck className="h-5 w-5" />
                <span className="mt-1 text-[10px] font-semibold uppercase leading-tight tracking-widest">
                  Offer
                  <br />
                  {accepted ? "accepted" : "issued"}
                </span>
              </div>
            </motion.div>
          </footer>

          <p className="relative mt-8 text-center text-[11px] leading-relaxed text-[#961919]">
            Demo document generated by AI for the VisaAI portfolio project — not
            a real offer and not valid for any official use.
          </p>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <button
          type="button"
          onClick={() => downloadOfferPdf(offer)}
          className="inline-flex items-center gap-2 rounded-full border border-[#b08a34] bg-white px-6 py-2.5 text-sm font-medium text-[#7a1414] transition-all hover:-translate-y-0.5 hover:bg-[#b08a34] hover:text-white"
        >
          <Download className="h-4 w-4" /> Download offer letter (PDF)
        </button>
      </div>
    </motion.article>
  );
}
