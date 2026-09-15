"use client";

import { useEffect, useRef, useState } from "react";
import { VideoOff } from "lucide-react";

export function CameraPreview({ active }: { active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (active) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => setError("Camera and microphone access is required for the interview."));
    }
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  if (error) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-ink-3 bg-ink-2 text-mist">
        <VideoOff className="h-6 w-6" />
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="aspect-video w-full scale-x-[-1] rounded-xl border border-ink-3 bg-ink-2 object-cover"
    />
  );
}
