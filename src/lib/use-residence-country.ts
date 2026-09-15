"use client";

import { useCallback, useEffect, useState } from "react";
import { DetectedCountry, detectResidenceCountry, setResidenceCountry } from "@/lib/geo";

/**
 * "Which country are you applying from?" — auto-filled on mount from the
 * visitor's IP, editable at any time. Used as the default origin for the
 * embassy-fee / ticket-price / total-time estimate shown once a
 * destination is picked.
 */
export function useResidenceCountry() {
  const [country, setCountry] = useState<DetectedCountry | null>(null);
  const [status, setStatus] = useState<"detecting" | "done" | "failed">("detecting");

  useEffect(() => {
    let cancelled = false;
    detectResidenceCountry()
      .then((result) => {
        if (cancelled) return;
        setCountry(result);
        setStatus(result ? "done" : "failed");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const override = useCallback((code: string) => {
    const chosen = setResidenceCountry(code);
    setCountry(chosen);
    setStatus("done");
  }, []);

  return { country, status, override };
}
