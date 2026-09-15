"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Watches for two independent signs of interview cheating while `armed`
 * is true:
 *  - leaving the tab/window (Page Visibility API) — allowed twice, the
 *    second switch disqualifies the session
 *  - pasted text landing in an answer field (call flagPaste() from the
 *    caller's onPaste handler) — disqualifies immediately, since a typed
 *    or spoken answer should never arrive as a paste
 * Both modes (voice or typed) share this hook so cheating detection is
 * identical either way. This is a client-side signal only — a real
 * deployment should corroborate it with server-side session checks.
 */
export function useFocusGuard(armed: boolean, maxTabViolations = 2) {
  const [tabViolations, setTabViolations] = useState(0);
  const [pasteViolations, setPasteViolations] = useState(0);
  const [disqualified, setDisqualified] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState<string | null>(null);
  const armedRef = useRef(armed);

  useEffect(() => {
    armedRef.current = armed;
  }, [armed]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden && armedRef.current) {
        setTabViolations((v) => {
          const next = v + 1;
          if (next >= maxTabViolations) {
            setDisqualified(true);
            setDisqualifyReason(
              "Interview session was interrupted (tab/window switched) more than the allowed number of times."
            );
          }
          return next;
        });
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [maxTabViolations]);

  const flagPaste = useCallback(() => {
    if (!armedRef.current) return;
    setPasteViolations((v) => v + 1);
    setDisqualified(true);
    setDisqualifyReason(
      "Pasted text was detected in an answer. Interview answers must be your own words — typed or spoken live — not pasted from another source such as an AI tool."
    );
  }, []);

  return {
    violations: tabViolations + pasteViolations,
    tabViolations,
    pasteViolations,
    disqualified,
    disqualifyReason,
    flagPaste,
  };
}
