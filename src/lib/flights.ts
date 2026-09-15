import { FlightOffer, FlightSegment } from "@/types";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string; // YYYY-MM-DD
  passengers: number;
  cabin: CabinClass;
}

export type CabinClass = "economy" | "premium_economy" | "business";

export const cabinLabels: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
};

/** Currencies that Stripe treats as zero-decimal (no cents). */
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

/** Convert a decimal amount string ("742.30") into Stripe's minor units. */
export function toMinorUnits(amount: string, currency: string): number {
  const value = Number.parseFloat(amount);
  if (!Number.isFinite(value)) return 0;
  if (ZERO_DECIMAL.has(currency.toUpperCase())) return Math.round(value);
  return Math.round(value * 100);
}

export function formatMoney(amount: string, currency: string): string {
  const value = Number.parseFloat(amount);
  if (!Number.isFinite(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Demo offer generator — used whenever DUFFEL_API_KEY is not configured, so the
// booking flow is always demonstrable without any paid account.
// ---------------------------------------------------------------------------

const DEMO_AIRLINES = [
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
  { code: "TK", name: "Turkish Airlines" },
  { code: "EY", name: "Etihad Airways" },
  { code: "PK", name: "Pakistan International" },
];

const HUBS: Record<string, string> = {
  EK: "DXB",
  QR: "DOH",
  TK: "IST",
  EY: "AUH",
  PK: "KHI",
};

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  economy: 1,
  premium_economy: 1.7,
  business: 3.2,
};

/** Small deterministic hash so the same search always returns the same prices. */
function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function buildDemoOffers(params: FlightSearchParams): FlightOffer[] {
  const seed = seedFrom(
    `${params.origin}${params.destination}${params.departureDate}${params.cabin}`
  );

  return DEMO_AIRLINES.slice(0, 4).map((airline, i) => {
    const rand = (seed >> (i * 3)) % 97;
    const departHour = 2 + ((rand + i * 5) % 18);
    const departingAt = new Date(
      `${params.departureDate}T${String(departHour).padStart(2, "0")}:${
        rand % 2 ? "45" : "15"
      }:00Z`
    ).toISOString();

    const direct = i === 0;
    const hub = HUBS[airline.code] ?? "DXB";
    const legOne = 180 + (rand % 120);
    const layover = 70 + (rand % 90);
    const legTwo = 260 + (rand % 180);

    const segments: FlightSegment[] = direct
      ? [
          {
            origin: params.origin,
            originName: params.origin,
            destination: params.destination,
            destinationName: params.destination,
            departingAt,
            arrivingAt: addMinutes(departingAt, legOne + legTwo),
            carrier: airline.name,
            carrierCode: airline.code,
            flightNumber: `${airline.code}${300 + (rand % 600)}`,
            durationMinutes: legOne + legTwo,
          },
        ]
      : [
          {
            origin: params.origin,
            originName: params.origin,
            destination: hub,
            destinationName: hub,
            departingAt,
            arrivingAt: addMinutes(departingAt, legOne),
            carrier: airline.name,
            carrierCode: airline.code,
            flightNumber: `${airline.code}${100 + (rand % 400)}`,
            durationMinutes: legOne,
          },
          {
            origin: hub,
            originName: hub,
            destination: params.destination,
            destinationName: params.destination,
            departingAt: addMinutes(departingAt, legOne + layover),
            arrivingAt: addMinutes(departingAt, legOne + layover + legTwo),
            carrier: airline.name,
            carrierCode: airline.code,
            flightNumber: `${airline.code}${500 + (rand % 400)}`,
            durationMinutes: legTwo,
          },
        ];

    const durationMinutes = direct ? legOne + legTwo : legOne + layover + legTwo;
    const base = 410 + (rand % 240) + (direct ? 190 : 0);
    const total = base * CABIN_MULTIPLIER[params.cabin] * Math.max(1, params.passengers);

    return {
      id: `demo_${airline.code}_${seed}_${i}`,
      carrier: airline.name,
      carrierCode: airline.code,
      cabin: cabinLabels[params.cabin],
      totalAmount: total.toFixed(2),
      currency: "USD",
      stops: segments.length - 1,
      durationMinutes,
      segments,
      source: "demo",
    } satisfies FlightOffer;
  });
}

/** Deterministic-looking seat / gate / PNR for the boarding pass. */
export function makeBoardingDetails(offerId: string) {
  const seed = seedFrom(offerId);
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const pnr = Array.from(
    { length: 6 },
    (_, i) => letters[(seed >> (i * 4)) % letters.length]
  ).join("");
  return {
    bookingReference: pnr,
    seat: `${12 + (seed % 30)}${"ABCDEF"[seed % 6]}`,
    gate: `${"ABCD"[seed % 4]}${1 + (seed % 24)}`,
  };
}
