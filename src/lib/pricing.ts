import { Country } from "@/types";

/**
 * The `baseFlightPriceUSD` / `baseFlightDurationHours` on each destination in
 * lib/countries.ts are calibrated for a South Asian departure (this app's
 * original hardcoded origin airports are all in Pakistan). This file scales
 * those numbers for whatever country the applicant is actually detected /
 * selected as traveling from, using a coarse region-distance multiplier —
 * good enough for an "estimated" badge, not a real fare API.
 */

type Region =
  | "south-asia"
  | "middle-east"
  | "europe"
  | "north-america"
  | "east-asia"
  | "southeast-asia"
  | "central-asia"
  | "africa"
  | "oceania"
  | "south-america"
  | "other";

const REGION_BY_COUNTRY: Record<string, Region> = {
  PK: "south-asia", IN: "south-asia", BD: "south-asia", NP: "south-asia",
  LK: "south-asia", BT: "south-asia", MV: "south-asia", AF: "south-asia",

  AE: "middle-east", SA: "middle-east", QA: "middle-east", KW: "middle-east",
  BH: "middle-east", OM: "middle-east", IQ: "middle-east", IR: "middle-east",
  IL: "middle-east", JO: "middle-east", LB: "middle-east", SY: "middle-east",
  YE: "middle-east", TR: "middle-east",

  GB: "europe", FR: "europe", DE: "europe", IT: "europe", ES: "europe",
  NL: "europe", BE: "europe", CH: "europe", SE: "europe", NO: "europe",
  DK: "europe", FI: "europe", IE: "europe", PT: "europe", PL: "europe",
  AT: "europe", GR: "europe", CZ: "europe", RO: "europe", HU: "europe",
  RU: "europe", UA: "europe",

  US: "north-america", CA: "north-america", MX: "north-america",

  CN: "east-asia", JP: "east-asia", KR: "east-asia", TW: "east-asia",
  HK: "east-asia", MN: "east-asia", KP: "east-asia",

  SG: "southeast-asia", MY: "southeast-asia", TH: "southeast-asia",
  ID: "southeast-asia", PH: "southeast-asia", VN: "southeast-asia",
  MM: "southeast-asia", KH: "southeast-asia", LA: "southeast-asia",

  KZ: "central-asia", UZ: "central-asia", TJ: "central-asia",
  KG: "central-asia", TM: "central-asia", AZ: "central-asia",
  GE: "central-asia", AM: "central-asia",

  ZA: "africa", NG: "africa", EG: "africa", KE: "africa", ET: "africa",
  GH: "africa", MA: "africa", DZ: "africa", TZ: "africa", UG: "africa",

  AU: "oceania", NZ: "oceania", FJ: "oceania", PG: "oceania",

  BR: "south-america", AR: "south-america", CL: "south-america",
  CO: "south-america", PE: "south-america",
};

/** Price/duration multiplier of a given origin region relative to the
 *  South-Asia baseline the destination data was calibrated for. */
const REGION_MULTIPLIER: Record<Region, number> = {
  "south-asia": 1,
  "middle-east": 0.75,
  "central-asia": 0.85,
  "east-asia": 1,
  "southeast-asia": 0.9,
  europe: 1.15,
  africa: 1.1,
  "north-america": 1.6,
  oceania: 1.5,
  "south-america": 1.9,
  other: 1.2,
};

function regionFor(countryCode: string): Region {
  return REGION_BY_COUNTRY[countryCode.toUpperCase()] ?? "other";
}

export interface RouteEstimate {
  embassyFeeUSD: number;
  flightPriceUSD: number;
  flightDurationHours: number;
  processingDays: number;
  /** processing days converted to hours + flight duration, in whole days for display. */
  totalDaysUntilArrival: number;
}

/** Same-country edge case (origin === destination): flight numbers collapse
 *  to ~0 since no international leg is needed, only the embassy step. */
export function estimateRoute(originCountryCode: string, destination: Country): RouteEstimate {
  const sameCountry = originCountryCode.toUpperCase() === destination.code.toUpperCase();

  if (sameCountry) {
    return {
      embassyFeeUSD: destination.embassyFeeUSD,
      flightPriceUSD: 0,
      flightDurationHours: 0,
      processingDays: destination.avgProcessingDays,
      totalDaysUntilArrival: destination.avgProcessingDays,
    };
  }

  const multiplier = REGION_MULTIPLIER[regionFor(originCountryCode)];
  const flightPriceUSD = Math.round((destination.baseFlightPriceUSD * multiplier) / 5) * 5;
  const flightDurationHours =
    Math.round(destination.baseFlightDurationHours * multiplier * 10) / 10;

  const totalDaysUntilArrival =
    destination.avgProcessingDays + Math.max(1, Math.ceil(flightDurationHours / 24));

  return {
    embassyFeeUSD: destination.embassyFeeUSD,
    flightPriceUSD,
    flightDurationHours,
    processingDays: destination.avgProcessingDays,
    totalDaysUntilArrival,
  };
}
