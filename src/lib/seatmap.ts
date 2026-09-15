import { BaggageOption, FlightOffer } from "@/types";

export type SeatZone = "extra_legroom" | "front" | "standard";

export interface Seat {
  id: string; // "12A"
  row: number;
  letter: string;
  zone: SeatZone;
  fee: number;
  occupied: boolean;
}

export interface SeatRow {
  row: number;
  left: Seat[];
  right: Seat[];
  exitRow: boolean;
}

export const zoneLabels: Record<SeatZone, string> = {
  extra_legroom: "Extra legroom",
  front: "Front of cabin",
  standard: "Standard",
};

const ZONE_FEE: Record<SeatZone, number> = {
  extra_legroom: 42,
  front: 24,
  standard: 0,
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Builds a deterministic seat map for an offer. Real Duffel seat maps come from
 * `GET /air/seat_maps`, which is only available for live offers — this keeps the
 * UI identical in both modes so the flow can always be demonstrated.
 */
export function buildSeatMap(offer: FlightOffer, rows = 12): SeatRow[] {
  const seed = hash(offer.id);
  const letters = ["A", "B", "C", "D", "E", "F"];
  const business = offer.cabin.toLowerCase().includes("business");

  return Array.from({ length: rows }, (_, i) => {
    const row = 11 + i;
    const exitRow = i === 5;

    const make = (letter: string, index: number): Seat => {
      const zone: SeatZone = exitRow ? "extra_legroom" : i < 3 ? "front" : "standard";
      // Deterministic occupancy, denser at the back so the map looks alive.
      const occupied = (seed >> ((i + index) % 24)) % 10 < (i > 7 ? 5 : 3);
      return {
        id: `${row}${letter}`,
        row,
        letter,
        zone,
        fee: business ? 0 : ZONE_FEE[zone],
        occupied,
      };
    };

    return {
      row,
      exitRow,
      left: letters.slice(0, 3).map(make),
      right: letters.slice(3).map((l, idx) => make(l, idx + 3)),
    };
  });
}

/** Baggage add-ons. Business fares already include a generous allowance. */
export function baggageOptions(offer: FlightOffer): BaggageOption[] {
  const business = offer.cabin.toLowerCase().includes("business");
  return [
    {
      id: "included",
      label: business ? "Included — 2 × 32 kg" : "Included — 1 × 23 kg",
      detail: "Standard checked allowance plus one cabin bag.",
      fee: 0,
    },
    {
      id: "extra_23",
      label: "Add 1 × 23 kg",
      detail: "One additional checked bag, added to your booking.",
      fee: business ? 45 : 65,
    },
    {
      id: "extra_46",
      label: "Add 2 × 23 kg",
      detail: "Two additional checked bags — best if you're relocating.",
      fee: business ? 85 : 120,
    },
  ];
}
