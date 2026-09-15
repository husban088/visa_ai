import { Banknote, Plane, Clock3 } from "lucide-react";
import { Country } from "@/types";
import { estimateRoute } from "@/lib/pricing";

/**
 * Once both ends of the trip are known (residence country → destination
 * country), this shows the embassy fee for that destination, an estimated
 * ticket price and flight time for that specific route, and — the thing
 * people actually want to know — roughly how long from applying today
 * until landing there.
 */
export function RouteEstimate({
  originCountryCode,
  originName,
  destination,
}: {
  originCountryCode: string;
  originName: string;
  destination: Country;
}) {
  const estimate = estimateRoute(originCountryCode, destination);
  const sameCountry = originCountryCode.toUpperCase() === destination.code.toUpperCase();

  return (
    <div className="mt-6 rounded-2xl border border-ink-3 bg-ink-2/40 p-5">
      <p className="text-xs text-steel">
        {originName} → {destination.name}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <p className="text-[11px] text-steel">Embassy fee</p>
            <p className="text-sm text-[var(--foreground)]">
              ~${estimate.embassyFeeUSD} <span className="text-steel">USD</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Plane className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <p className="text-[11px] text-steel">Estimated ticket</p>
            <p className="text-sm text-[var(--foreground)]">
              {sameCountry ? (
                "No flight needed"
              ) : (
                <>
                  ~${estimate.flightPriceUSD} <span className="text-steel">USD</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div>
            <p className="text-[11px] text-steel">Total time to get there</p>
            <p className="text-sm text-[var(--foreground)]">
              ~{estimate.totalDaysUntilArrival} day{estimate.totalDaysUntilArrival === 1 ? "" : "s"}
            </p>
            <p className="text-[11px] text-steel">
              {estimate.processingDays}-day decision
              {!sameCountry && ` + ~${estimate.flightDurationHours}h flight`}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-steel">
        Estimates only — real fares are shown at booking, and embassy fees vary by visa type.
      </p>
    </div>
  );
}
