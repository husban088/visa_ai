"use client";

import Image from "next/image";
import { Landmark } from "./Landmarks";
import { Flag } from "./Flag";
import { Country } from "@/types";
import { useCountryPhoto } from "@/lib/country-photo";

/**
 * Real HD destination photo for EVERY country (own `heroImageUrl` first,
 * otherwise an auto-fetched Wikipedia landmark photo), with the real flag
 * image on top. If no photo can be loaded, the line-art landmark shows.
 */
export function DestinationPhoto({
  country,
  className = "",
}: {
  country: Country;
  className?: string;
}) {
  const photo = useCountryPhoto(country);

  return (
    <div
      className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-ink-3 bg-ink-2 sm:aspect-[21/9] ${className}`}
    >
      {photo.url ? (
        <Image
          src={photo.url}
          alt={`${country.name} skyline`}
          fill
          unoptimized={photo.fromWiki}
          onError={photo.onError}
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
          <Landmark
            id={country.landmark}
            className="h-24 w-24 text-steel/60 sm:h-32 sm:w-32"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
      <div className="absolute bottom-4 left-5 flex items-center gap-2.5 sm:bottom-5 sm:left-6">
        <Flag code={country.code} className="h-5 w-7 sm:h-6 sm:w-9" />
        <p className="font-display text-lg text-[var(--foreground)] sm:text-xl">
          {country.name}
        </p>
      </div>
    </div>
  );
}
