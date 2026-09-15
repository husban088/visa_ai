import { NextRequest, NextResponse } from "next/server";
import { Booking, BookingExtras, FlightOffer } from "@/types";
import { makeBoardingDetails } from "@/lib/flights";

const DUFFEL_BASE = "https://api.duffel.com";

interface BookRequest {
  offer: FlightOffer;
  passengerName: string;
  paymentReference: string;
  paymentMode: "stripe" | "demo";
  extras?: BookingExtras;
  bornOn?: string; // YYYY-MM-DD
  email?: string;
  phoneNumber?: string;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { given: parts[0] ?? "Applicant", family: "Traveller" };
  return { given: parts[0], family: parts.slice(1).join(" ") };
}

function buildBooking(
  body: BookRequest,
  overrides: Partial<Booking> & { bookingMode: Booking["bookingMode"] }
): Booking {
  const details = makeBoardingDetails(body.offer.id);
  const firstSegment = body.offer.segments[0];
  const boardingTime = firstSegment
    ? new Date(new Date(firstSegment.departingAt).getTime() - 45 * 60_000).toISOString()
    : new Date().toISOString();

  const extrasTotal =
    (body.extras?.seatFee ?? 0) + (body.extras?.baggageFee ?? 0);
  const amountPaid = (
    Number.parseFloat(body.offer.totalAmount) + extrasTotal
  ).toFixed(2);

  return {
    offerId: body.offer.id,
    bookingReference: details.bookingReference,
    passengerName: body.passengerName,
    amountPaid,
    currency: body.offer.currency,
    paymentReference: body.paymentReference,
    paymentMode: body.paymentMode,
    seat: body.extras?.seat || details.seat,
    gate: details.gate,
    extras: body.extras,
    boardingTime,
    offer: body.offer,
    bookedAt: new Date().toISOString(),
    ...overrides,
  };
}

export async function POST(req: NextRequest) {
  let body: BookRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body?.offer?.id || !body.passengerName) {
    return NextResponse.json({ error: "An offer and passenger name are required." }, { status: 400 });
  }

  const token = process.env.DUFFEL_API_KEY;

  // Demo offers (or no Duffel account) -> issue a local confirmation.
  if (!token || body.offer.source !== "duffel") {
    return NextResponse.json({
      booking: buildBooking(body, { bookingMode: "demo" }),
      notice: token
        ? "This offer was generated locally, so no airline order was created."
        : "DUFFEL_API_KEY is not set — issued a demo confirmation instead of a real order.",
    });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Duffel-Version": "v2",
    "content-type": "application/json",
    accept: "application/json",
  };

  try {
    // Duffel needs the passenger IDs that belong to the original offer request.
    const offerRes = await fetch(`${DUFFEL_BASE}/air/offers/${encodeURIComponent(body.offer.id)}`, {
      headers,
    });
    const offerJson = await offerRes.json();
    if (!offerRes.ok) {
      throw new Error(offerJson?.errors?.[0]?.message ?? `Offer lookup failed (${offerRes.status}).`);
    }

    const passengerIds: string[] = (offerJson?.data?.passengers ?? []).map(
      (p: { id: string }) => p.id
    );
    if (!passengerIds.length) throw new Error("Offer has expired or has no passengers.");

    const { given, family } = splitName(body.passengerName);
    const passengers = passengerIds.map((id) => ({
      id,
      title: "mr",
      gender: "m",
      given_name: given,
      family_name: family,
      born_on: body.bornOn ?? "1996-01-01",
      email: body.email ?? "traveller@visaai.demo",
      phone_number: body.phoneNumber ?? "+923001234567",
    }));

    const orderRes = await fetch(`${DUFFEL_BASE}/air/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "instant",
          selected_offers: [body.offer.id],
          payments: [
            {
              type: "balance",
              amount: offerJson.data.total_amount,
              currency: offerJson.data.total_currency,
            },
          ],
          passengers,
        },
      }),
    });

    const orderJson = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(orderJson?.errors?.[0]?.message ?? `Order creation failed (${orderRes.status}).`);
    }

    return NextResponse.json({
      booking: buildBooking(body, {
        bookingMode: "duffel",
        bookingReference:
          orderJson?.data?.booking_reference ?? makeBoardingDetails(body.offer.id).bookingReference,
      }),
    });
  } catch (err) {
    // Never strand a paying applicant: fall back to a local confirmation and say so.
    return NextResponse.json({
      booking: buildBooking(body, { bookingMode: "demo" }),
      notice: `Airline order could not be created (${
        err instanceof Error ? err.message : "unknown error"
      }). A demo confirmation was issued instead.`,
    });
  }
}
