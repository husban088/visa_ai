"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CameraPreview } from "@/components/CameraPreview";
import {
  InterviewRecorder,
  InterviewRecorderHandle,
} from "@/components/InterviewRecorder";
import { VoiceInterview } from "@/components/VoiceInterview";
import { getApplication, updateApplication } from "@/lib/store";
import { getQuestions, scoreInterview } from "@/lib/interview";
import { getOfferByVisaApplication } from "@/lib/offers";
import { getCountry } from "@/lib/countries";
import { getVisaType } from "@/lib/visa-types";
import { useFocusGuard } from "@/lib/use-focus-guard";
import { isVoiceInterviewSupported } from "@/lib/use-speech";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Application } from "@/types";
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Mic,
  Keyboard,
} from "lucide-react";

type Stage = "loading" | "gate" | "interview" | "scoring";
type InterviewMode = "voice" | "typed";

export default function InterviewPage() {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [scoringNote, setScoringNote] = useState(
    "Reviewing your answers against your application…",
  );
  const recorderRef = useRef<InterviewRecorderHandle>(null);

  const { violations, disqualified, disqualifyReason, flagPaste } =
    useFocusGuard(stage === "interview");

  useEffect(() => {
    // Feature detection only works client-side; this one-time check can't
    // move into render without risking a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(isVoiceInterviewSupported());
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("visaai_active_id");
    if (!id) {
      router.replace("/dashboard");
      return;
    }
    getApplication(id).then((found) => {
      if (!found) {
        router.replace("/dashboard");
        return;
      }
      setApp(found);
      setStage("gate");
    });
  }, [router]);

  const questions = useMemo(() => {
    if (!app) return [];
    const offer = getOfferByVisaApplication(app.id);
    return getQuestions(
      app.visaType,
      offer
        ? {
            role: offer.jobTitle,
            company: offer.companyName,
            country: offer.countryName,
          }
        : undefined,
    );
  }, [app]);

  useEffect(() => {
    if (disqualified && app) {
      recorderRef.current?.stop();
      updateApplication(app.id, {
        status: "rejected",
        decisionReason:
          disqualifyReason ??
          "Interview session was flagged for a fairness violation.",
      }).then(() => router.push("/dashboard"));
    }
  }, [disqualified, disqualifyReason, app, router]);

  if (!app || stage === "loading") return null;

  function beginInterview(chosenMode: InterviewMode) {
    setMode(chosenMode);
    setStage("interview");
  }

  function submitAnswer(text: string) {
    const nextAnswers = [...answers, text];
    setAnswers(nextAnswers);
    setAnswer("");
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
    } else {
      finish(nextAnswers);
    }
  }

  async function finish(finalAnswers: string[]) {
    setStage("scoring");

    // Stop the camera/mic recording and try to save it to Cloudinary.
    // This is best-effort: an unconfigured or failed upload never blocks the decision.
    let interviewVideoUrl: string | undefined;
    try {
      const clip = await recorderRef.current?.stop();
      if (clip && clip.size > 0) {
        setScoringNote("Saving your interview recording…");
        const { url } = await uploadToCloudinary(
          clip,
          undefined,
          "visaai/interviews",
        );
        interviewVideoUrl = url;
      }
    } catch {
      // No Cloudinary config, or the upload failed — continue without a saved clip.
    }

    setScoringNote("Asking the AI reviewer to go through your answers…");
    const country = getCountry(app!.countryCode);
    const visaType = getVisaType(app!.visaType);
    const result = await scoreInterview({
      countryName: country?.name ?? app!.countryCode,
      visaTypeName: visaType?.name ?? app!.visaType,
      requiredDocuments: visaType?.requiredDocuments ?? [],
      uploadedDocumentNames: app!.documents.map((d) => d.name),
      questions,
      answers: finalAnswers,
    });

    await updateApplication(app!.id, {
      status: result.approved ? "approved" : "rejected",
      score: result.score,
      interviewVideoUrl,
      decisionReason:
        result.reasoning ??
        (result.approved
          ? undefined
          : "Your interview answers weren't specific or consistent enough for this visa type."),
    });
    router.push("/dashboard");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
        {stage === "gate" && (
          <div>
            <h1 className="font-display text-3xl text-[var(--foreground)] md:text-4xl">
              Before your interview
            </h1>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 p-5">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="text-sm text-gold-bright">
                <p className="font-medium">
                  This interview must be you, alone, answering honestly.
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-gold-bright/90">
                  <li>
                    Do not use ChatGPT, Claude, or any other AI tool to generate
                    answers.
                  </li>
                  <li>Do not have someone else answer on your behalf.</li>
                  <li>
                    Stay on this tab for the full interview — switching away
                    twice ends the session as a rejection.
                  </li>
                  <li>
                    Pasting text into an answer — voice or typed — is detected
                    instantly and ends the session too.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <CameraPreview active={stage === "gate"} />
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-mist">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--gold)]"
              />
              I understand the rules above and confirm I&apos;ll answer this
              interview myself.
            </label>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => beginInterview("voice")}
                disabled={!agreed || !voiceSupported}
                className="group flex flex-col items-start gap-1.5 rounded-xl border border-ink-3 bg-ink-2 p-5 text-left transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                  <Mic className="h-4 w-4 text-gold" /> Voice interview
                  <ArrowRight className="h-4 w-4 text-steel transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-xs text-mist">
                  The AI asks each question out loud and listens to you answer,
                  live.
                </span>
              </button>

              <button
                onClick={() => beginInterview("typed")}
                disabled={!agreed}
                className="group flex flex-col items-start gap-1.5 rounded-xl border border-ink-3 bg-ink-2 p-5 text-left transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                  <Keyboard className="h-4 w-4 text-gold" /> Typed interview
                  <ArrowRight className="h-4 w-4 text-steel transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-xs text-mist">
                  Type your answers instead of speaking.
                </span>
              </button>
            </div>
            {!voiceSupported && (
              <p className="mt-3 text-xs text-steel">
                Voice interview needs a Chromium browser (Chrome or Edge) on
                desktop — not available in this browser, so typed is the only
                option here.
              </p>
            )}
          </div>
        )}

        {stage === "interview" && mode && (
          <div>
            <div className="flex items-center justify-end">
              {violations > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Fairness warning — {violations} violation
                  {violations > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="mt-2 grid gap-6 md:grid-cols-[1fr_1.1fr]">
              <InterviewRecorder
                ref={recorderRef}
                active={stage === "interview"}
              />

              {mode === "voice" ? (
                <VoiceInterview
                  question={questions[qIndex]?.prompt ?? ""}
                  questionIndex={qIndex}
                  totalQuestions={questions.length}
                  onSubmit={submitAnswer}
                  onPasteDetected={flagPaste}
                />
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-wide text-steel">
                    Question {qIndex + 1} of {questions.length}
                  </p>
                  <h2 className="mt-3 font-display text-xl text-[var(--foreground)]">
                    {questions[qIndex]?.prompt}
                  </h2>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      flagPaste();
                    }}
                    rows={7}
                    placeholder="Type your answer in your own words."
                    className="mt-4 w-full resize-none rounded-xl border border-ink-3 bg-ink-2 p-4 text-sm text-[var(--foreground)] outline-none placeholder:text-steel focus:border-gold"
                  />
                  <button
                    onClick={() => submitAnswer(answer)}
                    disabled={answer.trim().length < 3}
                    className="mt-4 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {qIndex + 1 < questions.length
                      ? "Next question"
                      : "Finish interview"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {stage === "scoring" && (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-3 border-t-gold" />
            <p className="mt-6 text-sm text-mist">{scoringNote}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
