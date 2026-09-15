"use client";

/**
 * Everything related to "which country is the applicant physically in /
 * living in right now" — auto-detected from their IP on page load, used as
 * the default "traveling from" country, and always editable by hand.
 *
 * Detection is IP-based (no permission prompt, works instantly, and — this
 * is the point — reflects whatever country a VPN is currently exiting
 * through, exactly like every other "detect my country" flow on the web).
 */

/** ISO 3166-1 alpha-2 codes. Good enough coverage for a "pick your country"
 *  dropdown without shipping a huge static names table — names are derived
 *  at runtime via Intl.DisplayNames. */
export const COUNTRY_CODES = [
  "AF","AL","DZ","AD","AO","AR","AM","AU","AT","AZ",
  "BS","BH","BD","BB","BY","BE","BZ","BJ","BT","BO",
  "BA","BW","BR","BN","BG","BF","BI","KH","CM","CA",
  "CV","CF","TD","CL","CN","CO","KM","CG","CD","CR",
  "CI","HR","CU","CY","CZ","DK","DJ","DM","DO","EC",
  "EG","SV","GQ","ER","EE","SZ","ET","FJ","FI","FR",
  "GA","GM","GE","DE","GH","GR","GD","GT","GN","GW",
  "GY","HT","HN","HU","IS","IN","ID","IR","IQ","IE",
  "IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG",
  "LA","LV","LB","LS","LR","LY","LI","LT","LU","MG",
  "MW","MY","MV","ML","MT","MH","MR","MU","MX","FM",
  "MD","MC","MN","ME","MA","MZ","MM","NA","NR","NP",
  "NL","NZ","NI","NE","NG","KP","MK","NO","OM","PK",
  "PW","PA","PG","PY","PE","PH","PL","PT","QA","RO",
  "RU","RW","KN","LC","VC","WS","SM","ST","SA","SN",
  "RS","SC","SL","SG","SK","SI","SB","SO","ZA","KR",
  "SS","ES","LK","SD","SR","SE","CH","SY","TW","TJ",
  "TZ","TH","TL","TG","TO","TT","TN","TR","TM","TV",
  "UG","UA","AE","GB","US","UY","UZ","VU","VA","VE",
  "VN","YE","ZM","ZW",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

/** 🇵🇰-style flag from a 2-letter ISO code — no image assets needed. */
export function flagEmoji(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return "🌍";
  const base = 0x1f1e6;
  const chars = [...upper].map((c) => base + (c.charCodeAt(0) - 65));
  if (chars.some((cp) => cp < base || cp > base + 25)) return "🌍";
  return String.fromCodePoint(...chars);
}

let displayNames: Intl.DisplayNames | null = null;
export function countryName(code: string): string {
  try {
    displayNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export const RESIDENCE_COUNTRIES = COUNTRY_CODES.map((code) => ({
  code,
  name: countryName(code),
  flag: flagEmoji(code),
})).sort((a, b) => a.name.localeCompare(b.name));

export interface DetectedCountry {
  code: string;
  name: string;
  flag: string;
  /** "ip" = auto-detected from the browser's public IP; "manual" = user picked it. */
  source: "ip" | "manual";
}

const STORAGE_KEY = "visaai_residence_country";

/**
 * Hits a couple of free, keyless IP-geolocation APIs (first one that
 * answers wins). This is what makes VPN testing "just work": whichever
 * country your public IP appears to be exiting from is what comes back —
 * there's nothing Pakistan-specific hardcoded here.
 */
async function lookupCountryFromIP(): Promise<{ code: string } | null> {
  const attempts: Array<() => Promise<string | null>> = [
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data?.country === "string" ? data.country : null;
    },
    async () => {
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.success && typeof data?.country_code === "string" ? data.country_code : null;
    },
  ];

  for (const attempt of attempts) {
    try {
      const code = await attempt();
      if (code && code.length === 2) return { code: code.toUpperCase() };
    } catch {
      // try the next provider
    }
  }
  return null;
}

/** Auto-detects the applicant's country from IP, unless they already picked
 *  one by hand earlier in this browser (that choice always wins). */
export async function detectResidenceCountry(): Promise<DetectedCountry | null> {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as DetectedCountry;
      if (parsed?.code) return parsed;
    }
  } catch {
    // ignore corrupt cache
  }

  const ip = await lookupCountryFromIP();
  if (!ip) return null;

  const detected: DetectedCountry = {
    code: ip.code,
    name: countryName(ip.code),
    flag: flagEmoji(ip.code),
    source: "ip",
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(detected));
  } catch {
    // ignore write failure (private browsing etc.)
  }
  return detected;
}

/** Applicant manually overrides the "traveling from" country. */
export function setResidenceCountry(code: string) {
  const chosen: DetectedCountry = {
    code: code.toUpperCase(),
    name: countryName(code),
    flag: flagEmoji(code),
    source: "manual",
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chosen));
  } catch {
    // ignore
  }
  return chosen;
}
