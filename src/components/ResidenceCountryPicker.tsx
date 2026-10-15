"use client";

import { useState } from "react";
import { MapPin, Pencil } from "lucide-react";
import { RESIDENCE_COUNTRIES } from "@/lib/geo";
import { Flag } from "./Flag";
import { useResidenceCountry } from "@/lib/use-residence-country";

/**
 * "Traveling from" — auto-filled the instant the page loads (IP-based, so
 * it also correctly reflects a VPN's exit country when testing). Always
 * editable in case detection is wrong or the applicant wants a different
 * departure country.
 */
export function ResidenceCountryPicker({
  onChange,
}: {
  onChange?: (code: string) => void;
}) {
  const { country, status, override } = useResidenceCountry();
  const [editing, setEditing] = useState(false);

  function handlePick(code: string) {
    override(code);
    onChange?.(code);
    setEditing(false);
  }

  return (
    <div className="mt-10">
      <p className="text-sm text-[var(--foreground)]">Traveling from</p>

      {editing ? (
        <select
          autoFocus
          defaultValue={country?.code ?? ""}
          onChange={(e) => handlePick(e.target.value)}
          onBlur={() => setEditing(false)}
          className="mt-3 w-full max-w-xs rounded-lg border border-gold bg-ink-2 px-4 py-3 text-sm text-[var(--foreground)] outline-none"
        >
          <option value="" disabled>
            Select your country
          </option>
          {RESIDENCE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      ) : status === "detecting" ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-steel">
          <MapPin className="h-4 w-4 animate-pulse" />
          Detecting your location…
        </div>
      ) : country ? (
        <button
          onClick={() => setEditing(true)}
          className="mt-3 flex items-center gap-3 rounded-xl border border-ink-3 bg-ink-2/40 px-4 py-3 text-left transition-colors hover:border-steel"
        >
          <Flag code={country.code} className="h-5 w-7" />
          <span className="text-sm text-[var(--foreground)]">
            {country.name}
          </span>
          {country.source === "ip" && (
            <span className="rounded-full border border-ink-3 px-2 py-0.5 text-[10px] text-steel">
              detected
            </span>
          )}
          <Pencil className="ml-1 h-3.5 w-3.5 text-steel" />
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="mt-3 rounded-xl border border-dashed border-ink-3 px-4 py-3 text-left text-sm text-steel transition-colors hover:border-steel"
        >
          Couldn&apos;t detect your country — tap to select it
        </button>
      )}
    </div>
  );
}
