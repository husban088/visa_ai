"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { VideoOff } from "lucide-react";

export interface InterviewRecorderHandle {
  /** Stops the camera + recorder and resolves with the recorded clip, if any. */
  stop: () => Promise<Blob | null>;
}

const CANDIDATE_MIME_TYPES = ["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"];

export const InterviewRecorder = forwardRef<InterviewRecorderHandle, { active: boolean }>(
  function InterviewRecorder({ active }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
      let cancelled = false;

      if (active) {
        navigator.mediaDevices
          ?.getUserMedia({ video: true, audio: true })
          .then((stream) => {
            if (cancelled) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;

            if (typeof MediaRecorder !== "undefined") {
              const mimeType = CANDIDATE_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
              const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
              chunksRef.current = [];
              recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
              };
              recorder.start(1000);
              recorderRef.current = recorder;
            }
          })
          .catch(() => setError("Camera and microphone access is required for the interview."));
      }

      return () => {
        cancelled = true;
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== "inactive") recorder.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
    }, [active]);

    useImperativeHandle(ref, () => ({
      stop: () =>
        new Promise((resolve) => {
          const recorder = recorderRef.current;
          const finish = () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            resolve(
              chunksRef.current.length
                ? new Blob(chunksRef.current, { type: recorder?.mimeType || "video/webm" })
                : null
            );
          };
          if (!recorder || recorder.state === "inactive") {
            finish();
            return;
          }
          recorder.onstop = finish;
          recorder.stop();
        }),
    }));

    if (error) {
      return (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-ink-3 bg-ink-2 text-mist">
          <VideoOff className="h-6 w-6" />
          <p className="text-xs">{error}</p>
        </div>
      );
    }

    return (
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full scale-x-[-1] rounded-xl border border-ink-3 bg-ink-2 object-cover"
        />
        {active && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] text-red-400 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> REC
          </span>
        )}
      </div>
    );
  }
);
