import type { Job } from "@/lib/jobs";
import { htmlToText } from "@/lib/jobs";
import type { Application } from "@/lib/applications";
import type { ScreeningResult } from "@/lib/screening";

/**
 * Demo company offer letters.
 *
 * After the AI screens a job application it either issues an offer letter
 * (applicant is a good fit) or a rejection (not a fit). The letter is a
 * clearly-labelled DEMO document — nothing here is a real legal offer.
 * Stored in localStorage so the visa process can read it later.
 */

export interface OfferLetter {
  id: string; // OFR-XXXXXX
  jobApplicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLocation: string;
  companyEmail: string;
  companyPhone: string;
  countryCode: string;
  countryName: string;
  city: string;
  employmentType: string;
  workMode: string;
  salary: string;
  startDate: string; // ISO
  probationMonths: number;
  benefits: string[];
  relocation: boolean;
  relocationDetails: string;
  visaSponsorship: boolean;
  applicantName: string;
  applicantEmail: string;
  aiScore: number;
  aiSummary: string;
  issuedAt: string;
  status: "issued" | "accepted";
  acceptedAt?: string;
  /** Set once the visa process has been started for this offer. */
  visaApplicationId?: string;
}

/** Minimum AI match score (0-100) for an offer letter to be issued. */
export const OFFER_MIN_SCORE = 60;

export interface JobDecision {
  offer: boolean;
  reason: string;
}

/** Turns the AI screening report into an instant yes / no. */
export function decideFromScreening(result: ScreeningResult): JobDecision {
  if (result.eligible && result.overallScore >= OFFER_MIN_SCORE) {
    return {
      offer: true,
      reason: result.summary,
    };
  }
  const gap = result.gaps?.[0];
  return {
    offer: false,
    reason:
      result.summary ||
      gap ||
      "Your profile does not match the main requirements of this role yet.",
  };
}

const LS_KEY = "visaai.offers.v1";

function readAll(): OfferLetter[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as OfferLetter[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: OfferLetter[]) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* storage full — offer still shows on screen */
  }
}

export function listOffers(): OfferLetter[] {
  return readAll();
}

export function getOffer(id: string): OfferLetter | undefined {
  return readAll().find((o) => o.id === id);
}

export function getOfferByJobApplication(
  jobApplicationId: string,
): OfferLetter | undefined {
  return readAll().find((o) => o.jobApplicationId === jobApplicationId);
}

export function getOfferByVisaApplication(
  visaApplicationId: string,
): OfferLetter | undefined {
  return readAll().find((o) => o.visaApplicationId === visaApplicationId);
}

function patchOffer(
  id: string,
  patch: Partial<OfferLetter>,
): OfferLetter | undefined {
  const list = readAll();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...patch };
  writeAll(list);
  return list[idx];
}

export function acceptOffer(id: string): OfferLetter | undefined {
  return patchOffer(id, {
    status: "accepted",
    acceptedAt: new Date().toISOString(),
  });
}

export function linkVisaApplication(
  offerId: string,
  visaApplicationId: string,
): OfferLetter | undefined {
  return patchOffer(offerId, { visaApplicationId });
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SALARY_BY_LEVEL: Record<string, [number, number]> = {
  Fresher: [28000, 38000],
  "1-2 years": [38000, 52000],
  "3-5 years": [52000, 75000],
  "5-8 years": [75000, 105000],
  "8+ years": [105000, 150000],
};

function demoSalary(job: Job): string {
  if (job.salary && job.salary.trim()) return job.salary.trim();
  const [lo, hi] = SALARY_BY_LEVEL[job.experienceLevel] ?? [45000, 70000];
  const h = hash(job.id);
  const value = Math.round((lo + (h % (hi - lo))) / 500) * 500;
  return `USD ${value.toLocaleString("en-US")} / year (demo)`;
}

/** Creates (or returns the existing) offer letter for a job application. */
export function createOffer(args: {
  job: Job;
  application: Application;
  screening: ScreeningResult;
}): OfferLetter {
  const { job, application, screening } = args;
  const existing = getOfferByJobApplication(application.id);
  if (existing) return existing;

  const h = hash(`${job.id}::${application.id}`);
  const start = new Date();
  start.setDate(start.getDate() + 30 + (h % 21));

  const benefits = [
    "Health insurance for you and your family",
    "28 days of paid annual leave",
    "Annual performance bonus",
    "Learning & certification budget",
  ];
  if (job.relocation) {
    benefits.unshift(
      job.relocationDetails
        ? `Relocation package: ${job.relocationDetails}`
        : "Relocation package including flight and temporary housing",
    );
  }
  if (job.visaSponsorship) {
    benefits.push("Company visa sponsorship & immigration support");
  }

  const offer: OfferLetter = {
    id: `OFR-${(Date.now() % 1e9).toString(36).toUpperCase()}${(h % 1296)
      .toString(36)
      .toUpperCase()}`,
    jobApplicationId: application.id,
    jobId: job.id,
    jobTitle: job.title,
    companyName: job.companyName,
    companyLocation: job.companyLocation,
    companyEmail: job.companyEmail,
    companyPhone: job.companyPhone,
    countryCode: job.countryCode,
    countryName: job.countryName,
    city: job.city,
    employmentType: job.employmentType,
    workMode: job.workMode,
    salary: demoSalary(job),
    startDate: start.toISOString(),
    probationMonths: 3,
    benefits,
    relocation: job.relocation,
    relocationDetails: job.relocationDetails,
    visaSponsorship: job.visaSponsorship,
    applicantName: application.fullName,
    applicantEmail: application.email,
    aiScore: screening.overallScore,
    aiSummary:
      screening.summary || htmlToText(job.descriptionHtml).slice(0, 160),
    issuedAt: new Date().toISOString(),
    status: "issued",
  };

  writeAll([offer, ...readAll()]);
  return offer;
}
