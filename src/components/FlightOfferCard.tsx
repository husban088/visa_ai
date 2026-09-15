"use client";

import { motion } from "framer-motion";
import { Plane, Clock, CheckCircle2 } from "lucide-react";
import { FlightOffer } from "@/types";
import { formatClock, formatDuration, formatMoney } from "@/lib/flights";

export function FlightOfferCard({
  offer,
  selected,
  onSelect,
  index = 0,
}: {
  offer: FlightOffer;
  selected: boolean;
  onSelect: (offer: FlightOffer) => void;
  index?: number;
}) {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(offer)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className={`w-full rounded-2xl border p-5 text-left transition-colors ${
        selected
          ? "border-gold bg-gold/10"
          : "border-ink-3 bg-ink-2/50 hover:border-gold/50 hover:bg-ink-2"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-3 font-display text-xs tracking-wider text-gold">
            {offer.carrierCode || <Plane className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-sm text-[var(--foreground)]">{offer.carrier}</p>
            <p className="text-xs text-steel">
              {offer.cabin} · {offer.stops === 0 ? "Non-stop" : `${offer.stops} stop`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-gold-bright">
            {formatMoney(offer.totalAmount, offer.currency)}
          </p>
          <p className="text-[11px] text-steel">total, all passengers</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 sm:gap-5">
        <div>
          <p className="font-display text-lg text-[var(--foreground)]">{formatClock(first.departingAt)}</p>
          <p className="text-xs text-steel">{first.origin}</p>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <div className="flex w-full items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-px flex-1 bg-ink-3" />
            <Plane className="h-3.5 w-3.5 rotate-90 text-steel" />
            <span className="h-px flex-1 bg-ink-3" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-steel">
            <Clock className="h-3 w-3" /> {formatDuration(offer.durationMinutes)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg text-[var(--foreground)]">{formatClock(last.arrivingAt)}</p>
          <p className="text-xs text-steel">{last.destination}</p>
        </div>
      </div>

      {offer.segments.length > 1 && (
        <p className="mt-4 border-t border-ink-3 pt-3 text-[11px] text-steel">
          Via {offer.segments.slice(0, -1).map((s) => s.destination).join(", ")} ·{" "}
          {offer.segments.map((s) => s.flightNumber).join(" + ")}
        </p>
      )}

      {selected && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-gold-bright">
          <CheckCircle2 className="h-3.5 w-3.5" /> Selected
        </p>
      )}
    </motion.button>
  );
}
