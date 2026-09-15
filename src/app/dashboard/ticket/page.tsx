"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DestinationPhoto } from "@/components/DestinationPhoto";
import { FlightOfferCard } from "@/components/FlightOfferCard";
import { BoardingPass } from "@/components/BoardingPass";
import { getApplication, updateApplication } from "@/lib/store";
import { getCountry, originAirports } from "@/lib/countries";
import { CabinClass, cabinLabels, formatMoney } from "@/lib/flights";
import { Application, BaggageOption, Booking, BookingExtras, FlightOffer } from "@/types";
import { SeatAndBaggage } from "@/components/SeatAndBaggage";
import { Seat, baggageOptions } from "@/lib/seatmap";
import {
  Search,
  CreditCard,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const PENDING_KEY = "visaai_pending_offer";

type Stage = "search" | "results" | "extras" | "paying" | "issuing" | "done";

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export default function TicketPage() {
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [stage, setStage] = useState<Stage>("search");
  const [booking, setBooking] = useState<Booking | null>(null);

  // search form
  const [origin, setOrigin] = useState(originAirports[0].code);
  const [date, setDate] = useState(tomorrowISO());
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState<CabinClass>("economy");

  // results
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [selected, setSelected] = useState<FlightOffer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // seat + baggage
  const [seat, setSeat] = useState<Seat | null>(null);
  const [baggage, setBaggage] = useState<BaggageOption | null>(null);

  const country = app ? getCountry(app.countryCode) : undefined;

  /** Turn a paid Stripe session (or a simulated payment) into a confirmed booking. */
  const issueTicket = useCallback(
    async (
      application: Application,
      offer: FlightOffer,
      paymentReference: string,
      paymentMode: "stripe" | "demo",
      extras?: BookingExtras
    ) => {
      setStage("issuing");
      try {
        const res = await fetch("/api/flights/book", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            offer,
            extras,
            passengerName: application.fullName,
            paymentReference,
            paymentMode,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.booking) throw new Error(data.error ?? "Booking failed.");

        await updateApplication(application.id, { booking: data.booking as Booking });
        setBooking(data.booking as Booking);
        if (data.notice) setNotice(data.notice);
        setStage("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Booking failed.");
        setStage("results");
      } finally {
        sessionStorage.removeItem(PENDING_KEY);
      }
    },
    []
  );

  // Load the application, and pick up a Stripe redirect if we are returning from one.
  useEffect(() => {
    const id = localStorage.getItem("visaai_active_id");
    if (!id) {
      router.replace("/dashboard");
      return;
    }

    (async () => {
      const found = await getApplication(id);
      if (!found || found.status !== "approved") {
        router.replace("/dashboard");
        return;
      }
      setApp(found);

      if (found.booking) {
        setBooking(found.booking);
        setStage("done");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("canceled")) {
        setError("Payment was cancelled — your seat was not booked.");
        window.history.replaceState({}, "", "/dashboard/ticket");
        return;
      }

      const sessionId = params.get("session_id");
      if (!sessionId) return;

      window.history.replaceState({}, "", "/dashboard/ticket");
      const pendingRaw = sessionStorage.getItem(PENDING_KEY);
      if (!pendingRaw) {
        setError("Payment completed, but the selected flight was lost. Please search again.");
        return;
      }

      const verify = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);
      const result = await verify.json();
      if (!verify.ok || !result.paid) {
        setError(result.error ?? "Payment could not be verified.");
        return;
      }

      const pending = JSON.parse(pendingRaw) as {
        offer: FlightOffer;
        extras?: BookingExtras;
      };
      await issueTicket(found, pending.offer, sessionId, "stripe", pending.extras);
    })();
  }, [router, issueTicket]);

  async function handleSearch() {
    if (!country) return;
    setSearching(true);
    setError(null);
    setNotice(null);
    setSelected(null);

    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          origin,
          destination: country.airportCode,
          departureDate: date,
          passengers,
          cabin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setOffers(data.offers ?? []);
      if (data.notice) setNotice(data.notice);
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  function buildExtras(): BookingExtras | undefined {
    if (!selected) return undefined;
    const bag = baggage ?? baggageOptions(selected)[0];
    return {
      seat: seat?.id ?? "",
      seatFee: seat?.fee ?? 0,
      baggageId: bag.id,
      baggageLabel: bag.label,
      baggageFee: bag.fee,
    };
  }

  function extrasTotal(): number {
    const extras = buildExtras();
    return (extras?.seatFee ?? 0) + (extras?.baggageFee ?? 0);
  }

  function grandTotal(): string {
    if (!selected) return "0";
    return (Number.parseFloat(selected.totalAmount) + extrasTotal()).toFixed(2);
  }

  async function handlePay() {
    if (!app || !selected || !country) return;
    const extras = buildExtras();
    setStage("paying");
    setError(null);

    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ offer: selected, extras }));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          offerId: selected.id,
          amount: selected.totalAmount,
          currency: selected.currency,
          passengerName: app.fullName,
          description: `${origin} → ${country.airportCode} · ${selected.carrier} (${selected.cabin})`,
          seatId: extras?.seat,
          seatFee: extras?.seatFee ?? 0,
          baggageFee: extras?.baggageFee ?? 0,
          baggageLabel: extras?.baggageLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");

      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url as string;
        return;
      }

      // Demo mode: no Stripe keys configured, so simulate a successful payment.
      if (data.notice) setNotice(data.notice);
      await issueTicket(app, selected, "demo", "demo", extras);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setStage("extras");
    }
  }

  if (!app) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-14 sm:py-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-steel transition-colors hover:text-gold-bright"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>

        <h1 className="mt-5 font-display text-3xl text-[var(--foreground)] md:text-4xl">
          {stage === "done" ? "You're flying" : "Book your flight"}
        </h1>
        <p className="mt-3 text-sm text-mist">
          {stage === "done"
            ? "Your visa is approved and your seat is confirmed. Boarding pass below."
            : "Your visa is approved. Search live fares, pay securely, and we'll issue your boarding pass."}
        </p>

        {country && <DestinationPhoto country={country} className="mt-8" />}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        {notice && stage !== "search" && (
          <p className="mt-4 rounded-xl border border-ink-3 bg-ink-2/60 px-4 py-3 text-xs text-steel">
            {notice}
          </p>
        )}

        {/* ---------------- Boarding pass ---------------- */}
        {stage === "done" && booking && (
          <div className="mt-8">
            <BoardingPass booking={booking} country={country} />
          </div>
        )}

        {/* ---------------- Issuing ---------------- */}
        {stage === "issuing" && (
          <div className="mt-10 flex items-center gap-3 rounded-2xl border border-ink-3 bg-ink-2/50 p-6 text-sm text-mist">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            Payment received — issuing your ticket…
          </div>
        )}

        {/* ---------------- Search form ---------------- */}
        {(stage === "search" || stage === "results") && country && (
          <div className="mt-8 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-[var(--foreground)]">
                From
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-ink-3 bg-ink px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-gold"
                >
                  {originAirports.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-[var(--foreground)]">
                To
                <input
                  readOnly
                  value={`${country.airportCode} — ${country.airportName}`}
                  className="mt-2 block w-full cursor-not-allowed rounded-lg border border-ink-3 bg-ink px-4 py-3 text-sm text-mist outline-none"
                />
              </label>

              <label className="block text-sm text-[var(--foreground)]">
                Departure date
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-ink-3 bg-ink px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-gold"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-[var(--foreground)]">
                  Travellers
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="mt-2 block w-full rounded-lg border border-ink-3 bg-ink px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-gold"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-[var(--foreground)]">
                  Cabin
                  <select
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value as CabinClass)}
                    className="mt-2 block w-full rounded-lg border border-ink-3 bg-ink px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-gold"
                  >
                    {(Object.keys(cabinLabels) as CabinClass[]).map((c) => (
                      <option key={c} value={c}>
                        {cabinLabels[c]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={searching || !date}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {searching ? "Searching fares…" : "Search flights"}
            </button>
          </div>
        )}

        {/* ---------------- Results ---------------- */}
        {stage === "results" && offers.length > 0 && (
          <div className="mt-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-steel">
              {offers.length} fares · {origin} → {country?.airportCode}
            </p>
            <div className="mt-4 space-y-3">
              {offers.map((offer, i) => (
                <FlightOfferCard
                  key={offer.id}
                  offer={offer}
                  index={i}
                  selected={selected?.id === offer.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------- Continue to extras ---------------- */}
        <AnimatePresence>
          {stage === "results" && selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="sticky bottom-4 mt-8 rounded-2xl border border-gold/40 bg-ink-2/95 p-5 backdrop-blur"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[var(--foreground)]">
                    {selected.carrier} · {selected.cabin}
                  </p>
                  <p className="text-xs text-steel">
                    {passengers} traveller{passengers > 1 ? "s" : ""} ·{" "}
                    {formatMoney(selected.totalAmount, selected.currency)} fare
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBaggage(baggageOptions(selected)[0]);
                    setStage("extras");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-colors"
                >
                  Choose seat &amp; baggage <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------- Seat + baggage ---------------- */}
        {stage === "extras" && selected && (
          <>
            <button
              onClick={() => setStage("results")}
              className="mt-8 inline-flex items-center gap-1.5 text-xs text-steel transition-colors hover:text-gold-bright"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to fares
            </button>

            <SeatAndBaggage
              offer={selected}
              seatId={seat?.id ?? null}
              onSeatChange={setSeat}
              baggageId={(baggage ?? baggageOptions(selected)[0]).id}
              onBaggageChange={setBaggage}
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-4 mt-6 rounded-2xl border border-gold/40 bg-ink-2/95 p-5 backdrop-blur"
            >
              <div className="space-y-1.5 border-b border-ink-3 pb-4 text-xs">
                <div className="flex justify-between text-mist">
                  <span>
                    Fare · {selected.carrier} · {passengers} traveller
                    {passengers > 1 ? "s" : ""}
                  </span>
                  <span>{formatMoney(selected.totalAmount, selected.currency)}</span>
                </div>
                <div className="flex justify-between text-mist">
                  <span>Seat {seat ? seat.id : "— not selected"}</span>
                  <span>
                    {seat && seat.fee > 0
                      ? formatMoney(String(seat.fee), selected.currency)
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-mist">
                  <span>{(baggage ?? baggageOptions(selected)[0]).label}</span>
                  <span>
                    {(baggage ?? baggageOptions(selected)[0]).fee > 0
                      ? formatMoney(
                          String((baggage ?? baggageOptions(selected)[0]).fee),
                          selected.currency
                        )
                      : "Included"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-steel">
                    Total to pay
                  </p>
                  <p className="font-display text-xl text-gold-bright">
                    {formatMoney(grandTotal(), selected.currency)}
                  </p>
                </div>
                <button
                  onClick={handlePay}
                  disabled={!seat}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CreditCard className="h-4 w-4" /> Pay &amp; confirm
                </button>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-steel">
                <ShieldCheck className="h-3.5 w-3.5" />
                {seat
                  ? "Card details are entered on Stripe's hosted checkout — they never touch this app."
                  : "Pick a seat to continue."}
              </p>
            </motion.div>
          </>
        )}

        {/* ---------------- Redirecting ---------------- */}
        {stage === "paying" && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-ink-3 bg-ink-2/50 p-6 text-sm text-mist">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            Opening secure checkout…
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
