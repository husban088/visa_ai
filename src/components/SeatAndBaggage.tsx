"use client";

import { motion } from "framer-motion";
import { Luggage, Check } from "lucide-react";
import { BaggageOption, FlightOffer } from "@/types";
import { Seat, buildSeatMap, baggageOptions, zoneLabels } from "@/lib/seatmap";
import { formatMoney } from "@/lib/flights";

function seatClasses(seat: Seat, selected: boolean) {
  if (seat.occupied) return "cursor-not-allowed border-ink-3 bg-ink-3/60 text-steel/60";
  if (selected) return "border-gold bg-gold text-ink";
  if (seat.zone === "extra_legroom")
    return "border-gold/50 bg-gold/10 text-gold-bright hover:bg-gold/20";
  if (seat.zone === "front") return "border-ink-3 bg-ink-2 text-mist hover:border-gold/50";
  return "border-ink-3 bg-ink-2/60 text-mist hover:border-gold/50";
}

export function SeatAndBaggage({
  offer,
  seatId,
  onSeatChange,
  baggageId,
  onBaggageChange,
}: {
  offer: FlightOffer;
  seatId: string | null;
  onSeatChange: (seat: Seat) => void;
  baggageId: string;
  onBaggageChange: (option: BaggageOption) => void;
}) {
  const rows = buildSeatMap(offer);
  const bags = baggageOptions(offer);

  return (
    <div className="mt-8 space-y-6">
      {/* ---------------- Seat map ---------------- */}
      <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-[var(--foreground)]">Choose your seat</h2>
            <p className="mt-1 text-xs text-steel">
              {offer.carrier} · {offer.cabin} · {offer.segments[0].flightNumber}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.14em] text-steel">
            {(["extra_legroom", "front", "standard"] as const).map((zone) => (
              <span key={zone} className="flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-sm border ${
                    zone === "extra_legroom"
                      ? "border-gold/50 bg-gold/30"
                      : "border-ink-3 bg-ink-2"
                  }`}
                />
                {zoneLabels[zone]}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-ink-3 bg-ink-3" /> Taken
            </span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="mx-auto w-fit rounded-t-[3rem] border border-ink-3 border-b-0 px-4 pt-5 pb-1 sm:px-8">
            <p className="mb-4 text-center text-[10px] uppercase tracking-[0.2em] text-steel">
              Nose of aircraft
            </p>

            <div className="flex gap-6 px-2 pb-2 text-[10px] text-steel">
              <div className="flex gap-1.5">
                {["A", "B", "C"].map((l) => (
                  <span key={l} className="w-9 text-center">
                    {l}
                  </span>
                ))}
              </div>
              <span className="w-6" />
              <div className="flex gap-1.5">
                {["D", "E", "F"].map((l) => (
                  <span key={l} className="w-9 text-center">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pb-6">
              {rows.map((r) => (
                <div key={r.row} className="flex items-center gap-6">
                  <div className="flex gap-1.5">
                    {r.left.map((seat) => (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        selected={seatId === seat.id}
                        currency={offer.currency}
                        onSelect={onSeatChange}
                      />
                    ))}
                  </div>
                  <span className="w-6 text-center text-[10px] text-steel">{r.row}</span>
                  <div className="flex gap-1.5">
                    {r.right.map((seat) => (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        selected={seatId === seat.id}
                        currency={offer.currency}
                        onSelect={onSeatChange}
                      />
                    ))}
                  </div>
                  {r.exitRow && (
                    <span className="ml-1 text-[9px] uppercase tracking-[0.16em] text-gold/70">
                      Exit
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Baggage ---------------- */}
      <div className="rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        <h2 className="font-display text-xl text-[var(--foreground)]">Baggage</h2>
        <p className="mt-1 text-xs text-steel">
          Visa applicants relocating for study or work usually need more than the
          standard allowance — add it now, it&apos;s cheaper than at the airport.
        </p>

        <div className="mt-5 space-y-3">
          {bags.map((bag) => {
            const selected = bag.id === baggageId;
            return (
              <button
                key={bag.id}
                type="button"
                onClick={() => onBaggageChange(bag)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-gold bg-gold/10"
                    : "border-ink-3 bg-ink/40 hover:border-gold/50"
                }`}
              >
                <Luggage
                  className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? "text-gold" : "text-steel"}`}
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-[var(--foreground)]">{bag.label}</span>
                    <span className="text-sm text-gold-bright">
                      {bag.fee === 0 ? "Included" : `+ ${formatMoney(String(bag.fee), offer.currency)}`}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-steel">{bag.detail}</span>
                </span>
                {selected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  selected,
  currency,
  onSelect,
}: {
  seat: Seat;
  selected: boolean;
  currency: string;
  onSelect: (seat: Seat) => void;
}) {
  const title = seat.occupied
    ? `${seat.id} — taken`
    : `${seat.id} — ${zoneLabels[seat.zone]}${
        seat.fee ? `, + ${formatMoney(String(seat.fee), currency)}` : ", free"
      }`;

  return (
    <motion.button
      type="button"
      title={title}
      aria-label={title}
      disabled={seat.occupied}
      onClick={() => onSelect(seat)}
      whileHover={seat.occupied ? undefined : { scale: 1.08 }}
      whileTap={seat.occupied ? undefined : { scale: 0.95 }}
      className={`h-9 w-9 rounded-md border text-[10px] transition-colors ${seatClasses(
        seat,
        selected
      )}`}
    >
      {seat.letter}
    </motion.button>
  );
}
