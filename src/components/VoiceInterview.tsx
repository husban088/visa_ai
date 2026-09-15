"use client";

import { useEffect, useState } from "react";
import { MicOff, Volume2, Pencil, ArrowRight, RotateCcw } from "lucide-react";
import { useSpeechRecognition, speakQuestion } from "@/lib/use-speech";

type VoiceStage = "asking" | "listening" | "reviewing";

export function VoiceInterview({
  question,
  questionIndex,
  totalQuestions,
  onSubmit,
  onPasteDetected,
}: {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  onSubmit: (answer: string) => void;
  onPasteDetected: () => void;
}) {
  const [stage, setStage] = useState<VoiceStage>("asking");
  const [reviewText, setReviewText] = useState("");
  const { listening, transcript, start, stop, reset } = useSpeechRecognition();

  // Every time the question changes: reset, have the AI ask it aloud,
  // then automatically start listening for the spoken answer.
  useEffect(() => {
    let cancelled = false;
    // This effect drives a client-only speak-then-listen sequence keyed on
    // the question text — the setState calls here start that sequence.
    /* eslint-disable react-hooks/set-state-in-effect */
    setStage("asking");
    setReviewText("");
    /* eslint-enable react-hooks/set-state-in-effect */
    reset();
    speakQuestion(question).then(() => {
      if (cancelled) return;
      setStage("listening");
      start();
    });
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  function handleDoneAnswering() {
    stop();
    setReviewText(transcript.trim());
    setStage("reviewing");
  }

  function handleRecordAgain() {
    setStage("listening");
    start();
  }

  function handleConfirm() {
    onSubmit(reviewText.trim());
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-steel">
          Question {questionIndex + 1} of {totalQuestions} — voice interview
        </p>
        <button
          onClick={() => speakQuestion(question)}
          className="flex items-center gap-1 text-xs text-steel hover:text-gold-bright"
        >
          <Volume2 className="h-3.5 w-3.5" /> Repeat question
        </button>
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-xl border border-ink-3 bg-ink-2 p-5">
        <Volume2
          className={`mt-0.5 h-5 w-5 shrink-0 ${stage === "asking" ? "animate-pulse text-gold" : "text-steel"}`}
        />
        <h2 className="font-display text-lg text-[var(--foreground)]">{question}</h2>
      </div>

      {stage === "asking" && (
        <p className="mt-4 text-sm text-mist">The interviewer is asking the question aloud…</p>
      )}

      {stage === "listening" && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm text-gold-bright">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
            </span>
            {listening ? "Listening — speak your answer naturally" : "Starting the microphone…"}
          </div>
          <p className="mt-3 min-h-[4.5rem] rounded-xl border border-ink-3 bg-ink-2 p-4 text-sm text-[var(--foreground)]">
            {transcript || <span className="text-steel">Waiting for you to start speaking…</span>}
          </p>
          <button
            onClick={handleDoneAnswering}
            disabled={!transcript.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MicOff className="h-4 w-4" /> Done answering
          </button>
        </div>
      )}

      {stage === "reviewing" && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs text-steel">
            <Pencil className="h-3.5 w-3.5" /> Review what was heard — fix any mishearing, then continue
          </p>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              onPasteDetected();
            }}
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-ink-3 bg-ink-2 p-4 text-sm text-[var(--foreground)] outline-none focus:border-gold"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleRecordAgain}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-3 px-5 py-3 text-sm text-mist hover:border-gold hover:text-gold-bright"
            >
              <RotateCcw className="h-4 w-4" /> Record again
            </button>
            <button
              onClick={handleConfirm}
              disabled={reviewText.trim().length < 3}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {questionIndex + 1 < totalQuestions ? "Next question" : "Finish interview"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
