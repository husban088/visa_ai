import { VisaTypeId } from "@/types";

export interface InterviewQuestion {
  id: string;
  prompt: string;
  keywords: string[]; // used only for the demo scoring heuristic
}

const bank: Record<VisaTypeId, InterviewQuestion[]> = {
  study: [
    {
      id: "q1",
      prompt: "Which course and institution have you been admitted to?",
      keywords: ["university", "college", "course", "program", "admission"],
    },
    {
      id: "q2",
      prompt:
        "How does this course connect to your career plan after you graduate?",
      keywords: ["career", "job", "future", "plan", "work"],
    },
    {
      id: "q3",
      prompt: "Who is funding your tuition and living costs, and how?",
      keywords: ["fund", "sponsor", "savings", "loan", "family", "bank"],
    },
    {
      id: "q4",
      prompt: "What do you plan to do once your study period ends?",
      keywords: ["return", "home", "work", "extend", "plan"],
    },
  ],
  married: [
    {
      id: "q1",
      prompt:
        "How did you and your spouse meet, and for how long have you known each other?",
      keywords: ["met", "years", "months", "relationship", "known"],
    },
    {
      id: "q2",
      prompt: "Where does your spouse currently live and work?",
      keywords: ["lives", "works", "city", "job", "resident"],
    },
    {
      id: "q3",
      prompt:
        "What are your plans for living arrangements after you join them?",
      keywords: ["live", "house", "apartment", "together", "plan"],
    },
    {
      id: "q4",
      prompt:
        "Can you describe a recent shared milestone or event with your spouse?",
      keywords: ["wedding", "anniversary", "visit", "family", "event"],
    },
  ],
  visit: [
    {
      id: "q1",
      prompt: "What is the main purpose of this visit?",
      keywords: ["visit", "family", "tourism", "business", "conference"],
    },
    {
      id: "q2",
      prompt: "Where will you stay during your trip, and for how long?",
      keywords: ["hotel", "stay", "days", "weeks", "invite"],
    },
    {
      id: "q3",
      prompt: "What ties you to your home country that ensure you'll return?",
      keywords: ["job", "family", "property", "business", "return"],
    },
    {
      id: "q4",
      prompt: "Who is covering the cost of this trip?",
      keywords: ["fund", "myself", "sponsor", "savings", "employer"],
    },
  ],
  work: [
    {
      id: "q1",
      prompt: "What role have you been offered, and by which company?",
      keywords: ["role", "position", "company", "offer", "employer"],
    },
    {
      id: "q2",
      prompt:
        "What relevant experience or qualification makes you suited for this role?",
      keywords: ["experience", "years", "qualification", "skill", "worked"],
    },
    {
      id: "q3",
      prompt: "What are the key terms of your employment contract?",
      keywords: ["salary", "contract", "duration", "hours", "terms"],
    },
    {
      id: "q4",
      prompt: "Do you plan to bring any dependents with you?",
      keywords: ["family", "dependents", "spouse", "children", "alone"],
    },
  ],
};

export interface JobContext {
  role: string;
  company: string;
  country: string;
}

/**
 * Work-visa interviews are built around the accepted job offer, so every
 * question refers to the real role, company and country from the offer letter.
 */
export function getQuestions(
  visaType: VisaTypeId,
  job?: JobContext,
): InterviewQuestion[] {
  if (visaType === "work" && job) {
    return [
      {
        id: "q1",
        prompt: `You have been offered the role of ${job.role} at ${job.company}. Tell us about the company and what you will be responsible for.`,
        keywords: [
          "role",
          "position",
          "company",
          "offer",
          "responsible",
          "team",
        ],
      },
      {
        id: "q2",
        prompt: `What experience and skills make you a good fit for the ${job.role} position?`,
        keywords: [
          "experience",
          "years",
          "skill",
          "worked",
          "project",
          "built",
        ],
      },
      {
        id: "q3",
        prompt: `What are the key terms of your contract with ${job.company} — salary, start date and working mode?`,
        keywords: [
          "salary",
          "contract",
          "start",
          "hours",
          "remote",
          "hybrid",
          "terms",
        ],
      },
      {
        id: "q4",
        prompt: `Why do you want to work in ${job.country}, and how do you plan to settle there?`,
        keywords: [
          "live",
          "settle",
          "house",
          "apartment",
          "family",
          "plan",
          "career",
        ],
      },
      {
        id: "q5",
        prompt:
          "Do you plan to bring any dependents with you, and how will you support yourself before your first salary?",
        keywords: [
          "family",
          "dependents",
          "spouse",
          "children",
          "alone",
          "savings",
          "support",
        ],
      },
    ];
  }
  return bank[visaType] ?? bank.visit;
}

/**
 * Fallback scoring heuristic — used automatically if the real AI scoring
 * route (`/api/score-interview`, see scoreInterview() below) isn't
 * configured or the request fails. Keyword-matching only; never the
 * primary decision path once ANTHROPIC_API_KEY is set.
 */
export function scoreAnswers(
  answers: string[],
  questions: InterviewQuestion[],
) {
  let hits = 0;
  let totalWords = 0;
  answers.forEach((answer, i) => {
    const words = answer.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    const lower = answer.toLowerCase();
    const q = questions[i];
    if (q && q.keywords.some((k) => lower.includes(k))) hits++;
  });

  const depthScore = Math.min(1, totalWords / (questions.length * 25));
  const relevanceScore = hits / questions.length;
  const score = Math.round((depthScore * 0.5 + relevanceScore * 0.5) * 100);
  return score;
}

export interface ScoreResult {
  score: number;
  approved: boolean;
  reasoning?: string;
  source: "ai" | "heuristic";
}

/**
 * Real AI scoring, server-side. Calls /api/score-interview (which holds the
 * Anthropic key and never ships it to the browser). Falls back to the local
 * keyword heuristic if the route isn't configured or the request fails, so
 * the interview flow never breaks even with zero setup.
 */
export async function scoreInterview(input: {
  countryName: string;
  visaTypeName: string;
  requiredDocuments: string[];
  uploadedDocumentNames: string[];
  questions: InterviewQuestion[];
  answers: string[];
}): Promise<ScoreResult> {
  try {
    const res = await fetch("/api/score-interview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        countryName: input.countryName,
        visaTypeName: input.visaTypeName,
        requiredDocuments: input.requiredDocuments,
        uploadedDocumentNames: input.uploadedDocumentNames,
        qa: input.questions.map((q, i) => ({
          question: q.prompt,
          answer: input.answers[i] ?? "",
        })),
      }),
    });

    if (!res.ok) throw new Error(`Scoring route returned ${res.status}`);
    const data = await res.json();
    return {
      score: data.score,
      approved: data.approved,
      reasoning: data.reasoning,
      source: "ai",
    };
  } catch {
    const score = scoreAnswers(input.answers, input.questions);
    return { score, approved: score >= 55, source: "heuristic" };
  }
}
