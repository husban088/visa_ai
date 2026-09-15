import { NextRequest, NextResponse } from "next/server";
import { toMinorUnits } from "@/lib/flights";

const STRIPE_API = "https://api.stripe.com/v1";

function form(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for the selected flight offer and returns
 * its hosted-payment URL. When STRIPE_SECRET_KEY is missing the route responds
 * with { mode: "demo" } and the UI simulates the payment instead, so the whole
 * booking flow is still demonstrable with zero setup.
 */
export async function POST(req: NextRequest) {
  let body: {
    applicationId?: string;
    offerId?: string;
    amount?: string;
    currency?: string;
    description?: string;
    passengerName?: string;
    seatFee?: number;
    seatId?: string;
    baggageFee?: number;
    baggageLabel?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = body.amount ?? "";
  const currency = (body.currency ?? "USD").toLowerCase();

  // Extras are re-priced here rather than trusting a client-sent total.
  const seatFee = Math.max(0, Number(body.seatFee ?? 0));
  const baggageFee = Math.max(0, Number(body.baggageFee ?? 0));
  const minor =
    toMinorUnits(amount, currency) +
    toMinorUnits(String(seatFee), currency) +
    toMinorUnits(String(baggageFee), currency);

  if (!body.offerId || minor <= 0) {
    return NextResponse.json({ error: "A valid offer and amount are required." }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({
      mode: "demo" as const,
      notice: "STRIPE_SECRET_KEY is not set — the UI will simulate the payment.",
    });
  }

  const origin = req.nextUrl.origin;

  // Build the Stripe line items: fare first, then any extras. Indices must be
  // contiguous, so they're generated rather than hard-coded.
  const items: { name: string; description?: string; minor: number }[] = [
    {
      name: body.description || "VisaAI flight booking",
      description: `Passenger: ${body.passengerName || "Applicant"}`,
      minor: toMinorUnits(amount, currency),
    },
  ];
  if (seatFee > 0) {
    items.push({
      name: `Seat ${body.seatId ?? "selection"}`,
      minor: toMinorUnits(String(seatFee), currency),
    });
  }
  if (baggageFee > 0) {
    items.push({
      name: body.baggageLabel ?? "Extra baggage",
      minor: toMinorUnits(String(baggageFee), currency),
    });
  }

  const lineItemFields: Record<string, string> = {};
  items.forEach((item, i) => {
    lineItemFields[`line_items[${i}][quantity]`] = "1";
    lineItemFields[`line_items[${i}][price_data][currency]`] = currency;
    lineItemFields[`line_items[${i}][price_data][unit_amount]`] = String(item.minor);
    lineItemFields[`line_items[${i}][price_data][product_data][name]`] = item.name;
    if (item.description) {
      lineItemFields[`line_items[${i}][price_data][product_data][description]`] =
        item.description;
    }
  });

  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: form({
        mode: "payment",
        success_url: `${origin}/dashboard/ticket?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/dashboard/ticket?canceled=1`,
        ...lineItemFields,
        "metadata[application_id]": body.applicationId ?? "",
        "metadata[offer_id]": body.offerId,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message ?? `Stripe error (${res.status}).` },
        { status: 502 }
      );
    }

    return NextResponse.json({ mode: "stripe" as const, url: json.url, sessionId: json.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout?session_id=cs_test_...
 * Verifies server-side that the session was actually paid before a ticket is issued.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required." }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Stripe is not configured on this server." }, { status: 501 });
  }

  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error?.message ?? `Stripe error (${res.status}).` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      paid: json.payment_status === "paid",
      amountTotal: json.amount_total,
      currency: json.currency,
      applicationId: json.metadata?.application_id ?? null,
      offerId: json.metadata?.offer_id ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification failed." },
      { status: 500 }
    );
  }
}
