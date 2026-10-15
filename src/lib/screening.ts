import type { Application } from "@/lib/applications";
import type { Job } from "@/lib/jobs";
import { htmlToText } from "@/lib/jobs";

export type Verdict =
  | "strong_match"
  | "good_match"
  | "partial_match"
  | "weak_match";

export interface ScoreItem {
  /** 0-100, or null when that part could not be judged (e.g. no cover letter). */
  score: number | null;
  comment: string;
}

export interface ScreeningResult {
  overallScore: number;
  verdict: Verdict;
  /** true = applicant meets the main requirements of this job. */
  eligible: boolean;
  summary: string;
  breakdown: {
    skills: ScoreItem;
    experience: ScoreItem;
    cv: ScoreItem;
    coverLetter: ScoreItem;
    website: ScoreItem;
    answers: ScoreItem;
  };
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  /** Things the AI could not check (website not reachable, DOC file, etc.). */
  notes: string[];
  screenedAt: string;
}

export interface ScreeningRequest {
  job: {
    title: string;
    roleType: string;
    companyName: string;
    country: string;
    city: string;
    employmentType: string;
    workMode: string;
    experienceLevel: string;
    salary: string;
    techStack: string[];
    skills: string[];
    languages: string[];
    relocation: boolean;
    visaSponsorship: boolean;
    descriptionText: string;
    questions: string[];
  };
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    website: string;
    github: string;
    readyToRelocate: string;
    answers: { question: string; answer: string }[];
  };
  cv: { name: string; dataUrl: string };
  coverLetter: { name: string; dataUrl: string } | null;
}

/** Vercel rejects request bodies above ~4.5 MB, so stay safely below that. */
const MAX_PAYLOAD_CHARS = 4_000_000;

export async function runScreening(
  job: Job,
  app: Application,
): Promise<ScreeningResult> {
  const cvLen = app.cv.dataUrl.length;
  const clLen = app.coverLetter?.dataUrl.length ?? 0;
  if (cvLen + clLen > MAX_PAYLOAD_CHARS) {
    throw new Error(
      "Your files are too large for the AI check (try CV + cover letter under about 2.5 MB in total). Your application itself was submitted successfully.",
    );
  }

  const body: ScreeningRequest = {
    job: {
      title: job.title,
      roleType: job.roleType,
      companyName: job.companyName,
      country: job.countryName,
      city: job.city,
      employmentType: job.employmentType,
      workMode: job.workMode,
      experienceLevel: job.experienceLevel,
      salary: job.salary,
      techStack: job.techStack,
      skills: job.skills,
      languages: job.languages,
      relocation: job.relocation,
      visaSponsorship: job.visaSponsorship,
      descriptionText: htmlToText(job.descriptionHtml).slice(0, 6000),
      questions: job.questions ?? [],
    },
    applicant: {
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      website: app.website,
      github: app.github,
      readyToRelocate: app.readyToRelocate,
      answers: app.answers,
    },
    cv: { name: app.cv.name, dataUrl: app.cv.dataUrl },
    coverLetter: app.coverLetter
      ? { name: app.coverLetter.name, dataUrl: app.coverLetter.dataUrl }
      : null,
  };

  const res = await fetch("/api/screen-application", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `AI check failed (${res.status}).`;
    throw new Error(msg);
  }
  return data as ScreeningResult;
}
