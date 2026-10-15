"use client";

import { useState } from "react";

/**
 * Real flag image for any 2-letter ISO country code (US, DE, PK ...).
 * Emoji flags show up as plain letters ("US") on Windows, so we use
 * actual flag pictures instead. Falls back to a globe if the image fails.
 */
export function Flag({
  code,
  className = "h-4 w-6",
}: {
  code: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const c = (code || "").toLowerCase();

  if (failed || !/^[a-z]{2}$/.test(c)) {
    return (
      <span aria-hidden className="inline-block leading-none">
        🌍
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${c}.png`}
      srcSet={`https://flagcdn.com/w160/${c}.png 2x`}
      alt={`${c.toUpperCase()} flag`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-[3px] object-cover align-middle shadow-sm ring-1 ring-black/10 ${className}`}
    />
  );
}
