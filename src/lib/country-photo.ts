"use client";

import { useEffect, useState } from "react";
import { Country } from "@/types";

/**
 * Wikipedia article whose lead photo is a good "skyline / landmark" shot
 * for each country. Countries that already have `heroImageUrl` in
 * countries.ts keep using that photo; every other country uses this list.
 * Any country not listed falls back to its own Wikipedia article photo
 * (flags / maps are rejected), and finally to the line-art landmark.
 */
const WIKI_TITLES: Record<string, string> = {
  US: "Statue of Liberty",
  NL: "Amsterdam",
  SE: "Stockholm",
  CH: "Matterhorn",
  IE: "Cliffs of Moher",
  IT: "Colosseum",
  ES: "Sagrada Família",
  NO: "Geirangerfjord",
  NZ: "Milford Sound",
  SG: "Marina Bay Sands",
  MY: "Petronas Towers",
  JP: "Mount Fuji",
  SA: "Kingdom Centre Tower",
  QA: "Doha",
  TR: "Hagia Sophia",
  PK: "Badshahi Mosque",
  AT: "Vienna",
  BE: "Brussels",
  DK: "Copenhagen",
  FI: "Helsinki",
  PL: "Warsaw",
  PT: "Lisbon",
  GR: "Acropolis of Athens",
  CZ: "Prague",
  HU: "Budapest",
  KR: "Seoul",
  TH: "Bangkok",
  HK: "Hong Kong",
  CN: "Great Wall of China",
  ZA: "Table Mountain",
  EG: "Giza pyramid complex",
  KE: "Nairobi",
  BR: "Christ the Redeemer (statue)",
  MX: "Chichen Itza",
  AR: "Buenos Aires",
  KW: "Kuwait Towers",
  BH: "Bahrain World Trade Center",
  OM: "Sultan Qaboos Grand Mosque",
  IN: "Taj Mahal",
  ID: "Borobudur",
  VN: "Ha Long Bay",
  PH: "Manila",
  LU: "Luxembourg City",
  HR: "Dubrovnik",
  RO: "Bucharest",
  EE: "Tallinn",
  LV: "Riga",
  LT: "Vilnius",
  IS: "Reykjavík",
  CL: "Santiago",
  CO: "Bogotá",
  PE: "Machu Picchu",
  MA: "Marrakesh",
  NG: "Lagos",
  GH: "Accra",
  LK: "Sigiriya",
  BD: "Dhaka",
  NP: "Mount Everest",
  JO: "Petra",
  IL: "Jerusalem",
  UA: "Kyiv",
  RU: "Saint Basil's Cathedral",
  BG: "Sofia",
  RS: "Belgrade",
  SK: "Bratislava",
  SI: "Ljubljana",
  MT: "Valletta",
  CY: "Nicosia",
};

/** Extra Wikipedia articles to try (in order) if the main one has no usable photo. */
const EXTRA_TITLES: Record<string, string[]> = {
  MY: ["Kuala Lumpur", "Malaysia"],
  SA: ["Riyadh", "Kingdom Centre", "Jeddah"],
  QA: ["Katara", "Doha Corniche"],
  KW: ["Kuwait City"],
  BH: ["Manama"],
  OM: ["Muscat, Oman"],
  SG: ["Singapore"],
  AE: ["Dubai"],
};

// Rejects flags, maps, seals, logos (we want real skyline / landmark photos).
const BAD_PHOTO =
  /flag_of|locator|location_map|_map[_.]|coat_of_arms|emblem|_seal[_.]|logo|blank|\.svg/i;

const cache = new Map<string, string[]>();

const API = "https://en.wikipedia.org/w/api.php";

type WikiPage = {
  index?: number;
  thumbnail?: { source?: string };
};

function pickUrls(data: unknown): string[] {
  const pages = (data as { query?: { pages?: Record<string, WikiPage> } })
    ?.query?.pages;
  if (!pages) return [];
  return Object.values(pages)
    .sort((x, y) => (x.index ?? 0) - (y.index ?? 0))
    .map((p) => p.thumbnail?.source)
    .filter(
      (u): u is string =>
        Boolean(u) && !BAD_PHOTO.test(decodeURIComponent(u as string)),
    );
}

/** Photo of one Wikipedia article. Wikipedia itself picks a valid thumbnail size. */
async function photoOfTitle(title: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${API}?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=1280&titles=${encodeURIComponent(title)}`,
    );
    if (!res.ok) return null;
    return pickUrls(await res.json())[0] ?? null;
  } catch {
    return null;
  }
}

/** Last resort: search Wikipedia for "<country> skyline" and take the page photos. */
async function photosFromSearch(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${API}?action=query&format=json&origin=*&generator=search&gsrlimit=8&gsrsearch=${encodeURIComponent(query)}&prop=pageimages&piprop=thumbnail&pithumbsize=1280`,
    );
    if (!res.ok) return [];
    return pickUrls(await res.json());
  } catch {
    return [];
  }
}

async function fetchCountryPhotos(country: Country): Promise<string[]> {
  const titles = [
    WIKI_TITLES[country.code],
    ...(EXTRA_TITLES[country.code] ?? []),
  ].filter(Boolean) as string[];

  const urls: string[] = [];
  for (const t of titles) {
    const u = await photoOfTitle(t);
    if (u && !urls.includes(u)) urls.push(u);
    if (urls.length >= 3) break;
  }
  if (urls.length < 3) {
    const more = await photosFromSearch(`${country.name} skyline landmark`);
    for (const u of more) {
      if (!urls.includes(u)) urls.push(u);
      if (urls.length >= 4) break;
    }
  }
  return urls;
}

/**
 * Returns the photo URL to show for a country, or null while loading /
 * when no good photo exists (callers then show the landmark illustration).
 * If a photo fails to load, the next candidate is tried automatically.
 * `fromWiki` is true for Wikimedia photos (render those unoptimized).
 */
export function useCountryPhoto(country: Country): {
  url: string | null;
  fromWiki: boolean;
  onError: () => void;
} {
  const [fetched, setFetched] = useState<{ code: string; urls: string[] }>({
    code: "",
    urls: [],
  });
  const [skip, setSkip] = useState<{ code: string; n: number }>({
    code: "",
    n: 0,
  });
  const [heroFailed, setHeroFailed] = useState(false);

  const heroOk = Boolean(country.heroImageUrl) && !heroFailed;
  const urls =
    cache.get(country.code) ??
    (fetched.code === country.code ? fetched.urls : []);
  const idx = skip.code === country.code ? skip.n : 0;

  useEffect(() => {
    if (heroOk || cache.has(country.code)) return;
    let alive = true;
    fetchCountryPhotos(country).then((list) => {
      cache.set(country.code, list);
      if (alive) setFetched({ code: country.code, urls: list });
    });
    return () => {
      alive = false;
    };
  }, [country, heroOk]);

  if (heroOk) {
    return {
      url: country.heroImageUrl as string,
      fromWiki: false,
      onError: () => setHeroFailed(true),
    };
  }
  const url = urls[idx] ?? null;
  return {
    url,
    fromWiki: true,
    onError: () => setSkip({ code: country.code, n: idx + 1 }),
  };
}
