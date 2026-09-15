type LandmarkKey = "eiffel" | "bigben" | "gate" | "cntower" | "opera" | "burj";

/**
 * Minimal engraved-line silhouettes, in the style of a passport-page
 * watermark. Deliberately simple geometry rather than photographic
 * imagery — keeps the country cards cohesive and license-free.
 */
export function Landmark({ id, className }: { id: LandmarkKey; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 120 140",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (id) {
    case "eiffel":
      return (
        <svg {...common}>
          <path d="M60 12 L45 70 L20 128 M60 12 L75 70 L100 128 M38 92 H82 M30 110 H90 M52 45 H68 M60 12 V70" />
          <path d="M45 70 L75 70" />
        </svg>
      );
    case "bigben":
      return (
        <svg {...common}>
          <rect x="42" y="30" width="36" height="80" />
          <path d="M42 30 L60 12 L78 30" />
          <circle cx="60" cy="46" r="9" />
          <path d="M42 110 H78 M36 128 H84 M50 60 V100 M70 60 V100" />
        </svg>
      );
    case "gate":
      return (
        <svg {...common}>
          <path d="M20 128 V56 M100 128 V56 M20 56 H100 M20 56 L28 40 H92 L100 56" />
          <path d="M36 128 V56 M52 128 V56 M68 128 V56 M84 128 V56" />
          <path d="M46 40 V24 M74 40 V24" />
        </svg>
      );
    case "cntower":
      return (
        <svg {...common}>
          <path d="M60 10 V128 M48 45 H72 M42 60 H78 M50 30 H70" />
          <ellipse cx="60" cy="52" rx="16" ry="8" />
          <path d="M44 128 H76" />
        </svg>
      );
    case "opera":
      return (
        <svg {...common}>
          <path d="M14 118 Q30 78 46 118" />
          <path d="M38 118 Q56 68 74 118" />
          <path d="M64 118 Q82 78 106 118" />
          <path d="M10 122 H110" />
        </svg>
      );
    case "burj":
      return (
        <svg {...common}>
          <path d="M60 8 L68 40 L58 40 L64 70 L54 70 L60 100 L48 128 L72 128 L60 8" />
          <path d="M60 8 V0" />
        </svg>
      );
    default:
      return null;
  }
}
