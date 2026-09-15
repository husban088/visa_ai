"use client";

import { motion } from "framer-motion";
import { Plane, QrCode } from "lucide-react";
import { Booking, Country } from "@/types";
import { Landmark } from "./Landmarks";
import { formatClock, formatDuration, formatMoney } from "@/lib/flights";

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function BoardingPass({
  booking,
  country,
}: {
  booking: Booking;
  country?: Country;
}) {
  const segments = booking.offer.segments;
  const first = segments[0];
  const last = segments[segments.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-ink-2 to-ink shadow-[0_24px_60px_-24px_rgba(184,146,90,0.45)]"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 border-b border-gold/25 bg-gold/10 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          {country && <Landmark id={country.landmark} className="h-8 w-8 text-gold" />}
          <div>
            <p className="font-display text-base text-[var(--foreground)] sm:text-lg">Boarding pass</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-steel">
              {booking.offer.carrier} · {booking.offer.cabin}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.2em] text-steel">PNR</p>
          <p className="font-display text-lg tracking-[0.18em] text-gold-bright sm:text-xl">
            {booking.bookingReference}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-6 sm:px-7">
        <div>
          <p className="font-display text-3xl text-[var(--foreground)] sm:text-4xl">{first.origin}</p>
          <p className="mt-1 text-xs text-mist">{first.originName}</p>
          <p className="text-xs text-steel">{formatClock(first.departingAt)}</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <motion.div
            initial={{ x: -14, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Plane className="h-5 w-5 rotate-90 text-gold" />
          </motion.div>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold/60 to-transparent sm:w-28" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-steel">
            {booking.offer.stops === 0 ? "Non-stop" : `${booking.offer.stops} stop`}
          </p>
        </div>

        <div className="text-right">
          <p className="font-display text-3xl text-[var(--foreground)] sm:text-4xl">{last.destination}</p>
          <p className="mt-1 text-xs text-mist">{last.destinationName}</p>
          <p className="text-xs text-steel">{formatClock(last.arrivingAt)}</p>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative border-t border-dashed border-ink-3">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-ink" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-ink" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 px-5 py-6 sm:grid-cols-4 sm:px-7">
        {[
          { label: "Passenger", value: booking.passengerName },
          { label: "Date", value: dateLabel(first.departingAt) },
          { label: "Flight", value: first.flightNumber },
          { label: "Seat", value: booking.seat },
          { label: "Gate", value: booking.gate },
          { label: "Boarding", value: formatClock(booking.boardingTime) },
          { label: "Duration", value: formatDuration(booking.offer.durationMinutes) },
          {
            label: "Baggage",
            value: booking.extras?.baggageLabel ?? "Standard allowance",
          },
          {
            label: "Paid",
            value: formatMoney(booking.amountPaid, booking.currency),
          },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-steel">{item.label}</p>
            <p className="mt-1 truncate text-sm text-[var(--foreground)]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-3 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2 text-steel">
          <QrCode className="h-8 w-8" />
          <p className="text-[11px] leading-tight">
            {booking.bookingMode === "duffel"
              ? "Issued through the Duffel airline API."
              : "Demo confirmation — no airline was contacted."}
            <br />
            {booking.paymentMode === "stripe"
              ? `Paid via Stripe · ${booking.paymentReference.slice(0, 18)}…`
              : "Payment simulated (Stripe keys not configured)."}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-full border border-ink-3 px-4 py-2 text-xs text-mist transition-colors hover:border-gold hover:text-gold-bright"
        >
          Print / save as PDF
        </button>
      </div>
    </motion.div>
  );
}
