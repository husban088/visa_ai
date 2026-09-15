"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Minimal shape of the Web Speech API's SpeechRecognition — it isn't in
 * lib.dom.d.ts across all TS configs, so we type only what we use rather
 * than pulling in `any`.
 */
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** True only in browsers that can both listen (STT) and speak (TTS) — today, Chrome/Edge. */
export function isVoiceInterviewSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!getSpeechRecognitionCtor() && "speechSynthesis" in window;
}

/**
 * Browser-native speech-to-text. Free and real-time, with zero API key —
 * the trade-off is that it only ships in Chromium-based browsers today.
 * Callers must check isVoiceInterviewSupported() and offer typed answers
 * as a fallback elsewhere (the interview page does this).
 */
export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [listening, setListening] = useState(false);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    recognitionRef.current?.abort();
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript + " ";
        else interim += result[0].transcript;
      }
      if (final) setFinalText((t) => (t + " " + final).trim());
      setInterimText(interim);
    };
    recognition.onerror = () => {
      // Frequently fires on brief silence ("no-speech") — onend cleans up state.
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setFinalText("");
    setInterimText("");
    setListening(true);
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setFinalText("");
    setInterimText("");
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return {
    listening,
    transcript: [finalText, interimText].filter(Boolean).join(" ").trim(),
    start,
    stop,
    reset,
  };
}

/**
 * Browser-native text-to-speech for the AI asking each question aloud.
 * Resolves once speaking ends (or immediately if unsupported).
 */
export function speakQuestion(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.97;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function cancelSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
