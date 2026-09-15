export type VisaTypeId = "study" | "married" | "visit" | "work";

export interface VisaType {
  id: VisaTypeId;
  name: string;
  tagline: string;
  description: string;
  avgDecisionTime: string;
  requiredDocuments: string[];
}

export interface Country {
  code: string;
  name: string;
  region: string;
  flag: string;
  landmark: "eiffel" | "bigben" | "gate" | "cntower" | "opera" | "burj";
  /** Optional HD destination photo (e.g. a Cloudinary URL). Falls back to the line-art landmark when unset. */
  heroImageUrl?: string;
  /** Main arrival airport (IATA) used by the flight search on /dashboard/ticket. */
  airportCode: string;
  airportName: string;
  avgProcessingDays: number;
  visaTypesOffered: VisaTypeId[];
  seatsOpenToday: number;
  /** Government/embassy visa application fee for this destination, in USD. */
  embassyFeeUSD: number;
  /** Baseline one-way economy fare estimate (USD) — scaled per-route by distance in lib/pricing.ts. */
  baseFlightPriceUSD: number;
  /** Baseline flight duration (hours) — scaled per-route by distance in lib/pricing.ts. */
  baseFlightDurationHours: number;
}

export type ApplicationStatus =
  | "documents_pending"
  | "interview_scheduled"
  | "interview_completed"
  | "approved"
  | "rejected";

export interface InterviewSlot {
  date: string; // ISO date
  time: string; // display time
}

export interface Application {
  id: string;
  countryCode: string;
  visaType: VisaTypeId;
  fullName: string;
  status: ApplicationStatus;
  documents: { name: string; url: string; uploadedAt: string }[];
  interviewSlot?: InterviewSlot;
  score?: number;
  decisionReason?: string;
  interviewVideoUrl?: string;
  booking?: Booking;
  /** Supabase auth user id — set when the applicant is signed in, so the
   *  application can be opened again from any device. */
  userId?: string;
  createdAt: string;
}

/** A single leg of an itinerary. */
export interface FlightSegment {
  origin: string; // IATA
  originName: string;
  destination: string; // IATA
  destinationName: string;
  departingAt: string; // ISO
  arrivingAt: string; // ISO
  carrier: string;
  carrierCode: string;
  flightNumber: string;
  durationMinutes: number;
}

export interface FlightOffer {
  id: string;
  carrier: string;
  carrierCode: string;
  cabin: string;
  totalAmount: string; // decimal string, e.g. "742.30"
  currency: string; // ISO-4217, e.g. "USD"
  stops: number;
  durationMinutes: number;
  segments: FlightSegment[];
  /** "duffel" when the offer came from the live Duffel API, "demo" when generated locally. */
  source: "duffel" | "demo";
}

export interface BaggageOption {
  id: string;
  label: string;
  detail: string;
  fee: number; // in the offer's currency
}

export interface BookingExtras {
  seat: string;
  seatFee: number;
  baggageId: string;
  baggageLabel: string;
  baggageFee: number;
}

export interface Booking {
  offerId: string;
  bookingReference: string; // PNR
  passengerName: string;
  amountPaid: string;
  currency: string;
  paymentReference: string; // Stripe session id, or "demo"
  paymentMode: "stripe" | "demo";
  bookingMode: "duffel" | "demo";
  seat: string;
  gate: string;
  extras?: BookingExtras;
  boardingTime: string; // ISO
  offer: FlightOffer;
  bookedAt: string;
}
