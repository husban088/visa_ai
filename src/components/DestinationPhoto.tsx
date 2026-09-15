import Image from "next/image";
import { Landmark } from "./Landmarks";
import { Country } from "@/types";

/**
 * Shows a real HD destination photo when `country.heroImageUrl` is set
 * (point it at any Cloudinary — or other HTTPS — image and it renders here,
 * full-bleed, with the night-flight gold gradient wash on top).
 *
 * When no photo is set, falls back to the line-art landmark on a navy
 * dot-grid panel, so a page never ships a placeholder or a broken image.
 */
export function DestinationPhoto({
  country,
  className = "",
}: {
  country: Country;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-ink-3 bg-ink-2 sm:aspect-[21/9] ${className}`}
    >
      {country.heroImageUrl ? (
        <Image
          src={country.heroImageUrl}
          alt={`${country.name} skyline`}
          fill
          sizes="(min-width: 768px) 700px, 100vw"
          className="object-cover"
          priority={false}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--steel) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <Landmark id={country.landmark} className="h-24 w-24 text-steel/60 sm:h-32 sm:w-32" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
      <div className="absolute bottom-4 left-5 flex items-center gap-2 sm:bottom-5 sm:left-6">
        <span className="text-lg sm:text-xl">{country.flag}</span>
        <p className="font-display text-lg text-[var(--foreground)] sm:text-xl">{country.name}</p>
      </div>
    </div>
  );
}
