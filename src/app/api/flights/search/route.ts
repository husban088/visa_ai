import { NextRequest, NextResponse } from "next/server";
import { FlightOffer, FlightSegment } from "@/types";
import {
  CabinClass,
  buildDemoOffers,
  cabinLabels,
  type FlightSearchParams,
} from "@/lib/flights";

const DUFFEL_URL = "https://api.duffel.com/air/offer_requests?return_offers=true";
const VALID_CABINS: CabinClass[] = ["economy", "premium_economy", "business"];

/** Convert an ISO-8601 duration ("PT13H45M") into minutes. */
function isoDurationToMinutes(value: string | undefined): number {
  if (!value) return 0;
  const match = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(value);
  if (!match) return 0;
  const [, d, h, m] = match;
  return Number(d ?? 0) * 1440 + Number(h ?? 0) * 60 + Number(m ?? 0);
}

interface DuffelPlace {
  iata_code?: string;
  name?: string;
  city_name?: string;
}

interface DuffelSegment {
  origin: DuffelPlace;
  destination: DuffelPlace;
  departing_at: string;
  arriving_at: string;
  duration?: string;
  marketing_carrier?: { name?: string; iata_code?: string };
  marketing_carrier_flight_number?: string;
}

interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  owner?: { name?: string; iata_code?: string };
  slices?: { duration?: string; segments?: DuffelSegment[] }[];
}

function placeLabel(place: DuffelPlace): string {
  return place.city_name ?? place.name ?? place.iata_code ?? "";
}

function mapOffer(offer: DuffelOffer, cabin: CabinClass): FlightOffer {
  const slice = offer.slices?.[0];
  const segments: FlightSegment[] = (slice?.segments ?? []).map((seg) => ({
    origin: seg.origin.iata_code ?? "",
    originName: placeLabel(seg.origin),
    destination: seg.destination.iata_code ?? "",
    destinationName: placeLabel(seg.destination),
    departingAt: seg.departing_at,
    arrivingAt: seg.arriving_at,
    carrier: seg.marketing_carrier?.name ?? offer.owner?.name ?? "Airline",
    carrierCode: seg.marketing_carrier?.iata_code ?? offer.owner?.iata_code ?? "",
    flightNumber: `${seg.marketing_carrier?.iata_code ?? ""}${
      seg.marketing_carrier_flight_number ?? ""
    }`,
    durationMinutes: isoDurationToMinutes(seg.duration),
  }));

  const durationMinutes =
    isoDurationToMinutes(slice?.duration) ||
    segments.reduce((sum, s) => sum + s.durationMinutes, 0);

  return {
    id: offer.id,
    carrier: offer.owner?.name ?? segments[0]?.carrier ?? "Airline",
    carrierCode: offer.owner?.iata_code ?? segments[0]?.carrierCode ?? "",
    cabin: cabinLabels[cabin],
    totalAmount: offer.total_amount,
    currency: offer.total_currency,
    stops: Math.max(0, segments.length - 1),
    durationMinutes,
    segments,
    source: "duffel",
  };
}

export async function POST(req: NextRequest) {
  let body: Partial<FlightSearchParams>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const origin = (body.origin ?? "").toUpperCase();
  const destination = (body.destination ?? "").toUpperCase();
  const departureDate = body.departureDate ?? "";
  const passengers = Math.min(Math.max(Number(body.passengers ?? 1), 1), 4);
  const cabin: CabinClass = VALID_CABINS.includes(body.cabin as CabinClass)
    ? (body.cabin as CabinClass)
    : "economy";

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json({ error: "Origin and destination must be IATA codes." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
    return NextResponse.json({ error: "departureDate must be YYYY-MM-DD." }, { status: 400 });
  }

  const params: FlightSearchParams = { origin, destination, departureDate, passengers, cabin };
  const token = process.env.DUFFEL_API_KEY;

  // No Duffel account configured -> deterministic demo offers so the flow still works.
  if (!token) {
    return NextResponse.json({
      offers: buildDemoOffers(params),
      source: "demo" as const,
      notice: "DUFFEL_API_KEY is not set — showing generated demo offers.",
    });
  }

  try {
    const res = await fetch(DUFFEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Duffel-Version": "v2",
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin, destination, departure_date: departureDate }],
          passengers: Array.from({ length: passengers }, () => ({ type: "adult" })),
          cabin_class: cabin,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({
        offers: buildDemoOffers(params),
        source: "demo" as const,
        notice: `Duffel returned ${res.status} — falling back to demo offers. ${detail.slice(0, 200)}`,
      });
    }

    const json = (await res.json()) as { data?: { offers?: DuffelOffer[] } };
    const offers = (json.data?.offers ?? [])
      .slice(0, 8)
      .map((offer) => mapOffer(offer, cabin))
      .filter((offer) => offer.segments.length > 0);

    if (!offers.length) {
      return NextResponse.json({
        offers: buildDemoOffers(params),
        source: "demo" as const,
        notice: "Duffel found no offers for that route/date — showing demo offers instead.",
      });
    }

    return NextResponse.json({ offers, source: "duffel" as const });
  } catch (err) {
    return NextResponse.json({
      offers: buildDemoOffers(params),
      source: "demo" as const,
      notice: `Flight search failed (${
        err instanceof Error ? err.message : "unknown error"
      }) — showing demo offers.`,
    });
  }
}
