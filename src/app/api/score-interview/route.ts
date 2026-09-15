import { NextRequest, NextResponse } from "next/server";

export interface ScoreInterviewRequest {
  countryName: string;
  visaTypeName: string;
  requiredDocuments: string[];
  uploadedDocumentNames: string[];
  qa: { question: string; answer: string }[];
}

export interface ScoreInterviewResponse {
  score: number; // 0-100
  approved: boolean;
  reasoning: string;
}

const SYSTEM_PROMPT = `You are a strict but fair visa interview officer for a demo immigration
platform called VisaAI. All required documents are AI-generated,
watermarked sample paperwork that VisaAI auto-verifies before the
interview even starts — treat every document as already cleared and do
NOT factor documents into your decision at all, whether they're
mentioned in the prompt or not.

The interview transcript is the ONLY thing that decides this
application. Score how convincing and consistent the answers are for
someone genuinely pursuing this visa type — consider specificity,
internal consistency across answers, and whether the stated purpose
and details match the visa type being applied for. Reward answers that
directly and substantively address what was asked; penalize vague,
generic, evasive, or off-topic answers.

Reply with ONLY minified JSON, no prose, no markdown fences, matching
exactly this shape:
{"score": <integer 0-100>, "approved": <boolean>, "reasoning": "<one or two sentences, addressed to the applicant, explaining the decision based only on their interview answers>"}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 501 }
    );
  }

  let body: ScoreInterviewRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body?.qa?.length) {
    return NextResponse.json({ error: "No interview answers were provided." }, { status: 400 });
  }

  const transcript = body.qa
    .map((pair, i) => `Q${i + 1}: ${pair.question}\nA${i + 1}: ${pair.answer}`)
    .join("\n\n");

  const userPrompt = `Destination: ${body.countryName}
Visa type: ${body.visaTypeName}
(All required documents are already AI-verified — ignore documents entirely and decide from the transcript alone.)

Interview transcript:
${transcript}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `Claude API error (${res.status}): ${detail.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw: string =
      data.content?.find((block: { type: string }) => block.type === "text")?.text ?? "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as ScoreInterviewResponse;

    if (
      typeof parsed.score !== "number" ||
      typeof parsed.approved !== "boolean" ||
      typeof parsed.reasoning !== "string"
    ) {
      throw new Error("Unexpected response shape from model.");
    }

    return NextResponse.json(parsed satisfies ScoreInterviewResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scoring failed." },
      { status: 500 }
    );
  }
}
