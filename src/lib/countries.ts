import { Country } from "@/types";

export const countries: Country[] = [
  {
    code: "CA",
    name: "Canada",
    region: "North America",
    flag: "🇨🇦",
    landmark: "cntower",
    heroImageUrl:
      "https://images.unsplash.com/photo-1749098140326-3dc9cc3b7d97?w=1600&q=80&auto=format&fit=crop",
    airportCode: "YYZ",
    airportName: "Toronto Pearson",
    avgProcessingDays: 1,
    visaTypesOffered: ["study", "married", "visit", "work"],
    seatsOpenToday: 42,
    embassyFeeUSD: 100,
    baseFlightPriceUSD: 950,
    baseFlightDurationHours: 13,
  },
  {
    code: "GB",
    name: "United Kingdom",
    region: "Europe",
    flag: "🇬🇧",
    landmark: "bigben",
    heroImageUrl:
      "https://images.unsplash.com/photo-1473905008190-69b1a3dc6dd7?w=1600&q=80&auto=format&fit=crop",
    airportCode: "LHR",
    airportName: "London Heathrow",
    avgProcessingDays: 1,
    visaTypesOffered: ["study", "married", "visit", "work"],
    seatsOpenToday: 37,
    embassyFeeUSD: 145,
    baseFlightPriceUSD: 650,
    baseFlightDurationHours: 9,
  },
  {
    code: "DE",
    name: "Germany",
    region: "Europe",
    flag: "🇩🇪",
    landmark: "gate",
    heroImageUrl:
      "https://images.unsplash.com/photo-1770609529264-8776bf80e51a?w=1600&q=80&auto=format&fit=crop",
    airportCode: "FRA",
    airportName: "Frankfurt am Main",
    avgProcessingDays: 2,
    visaTypesOffered: ["study", "married", "visit", "work"],
    seatsOpenToday: 29,
    embassyFeeUSD: 90,
    baseFlightPriceUSD: 600,
    baseFlightDurationHours: 8,
  },
  {
    code: "FR",
    name: "France",
    region: "Europe",
    flag: "🇫🇷",
    landmark: "eiffel",
    heroImageUrl:
      "https://images.unsplash.com/photo-1743065272129-5e261bad0c46?w=1600&q=80&auto=format&fit=crop",
    airportCode: "CDG",
    airportName: "Paris Charles de Gaulle",
    avgProcessingDays: 2,
    visaTypesOffered: ["study", "married", "visit"],
    seatsOpenToday: 24,
    embassyFeeUSD: 95,
    baseFlightPriceUSD: 620,
    baseFlightDurationHours: 8.5,
  },
  {
    code: "AU",
    name: "Australia",
    region: "Oceania",
    flag: "🇦🇺",
    landmark: "opera",
    heroImageUrl:
      "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=1600&q=80&auto=format&fit=crop",
    airportCode: "SYD",
    airportName: "Sydney Kingsford Smith",
    avgProcessingDays: 2,
    visaTypesOffered: ["study", "married", "visit", "work"],
    seatsOpenToday: 31,
    embassyFeeUSD: 145,
    baseFlightPriceUSD: 1100,
    baseFlightDurationHours: 15,
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    region: "Middle East",
    flag: "🇦🇪",
    landmark: "burj",
    heroImageUrl:
      "https://images.unsplash.com/photo-1748626083682-611d0a66cb50?w=1600&q=80&auto=format&fit=crop",
    airportCode: "DXB",
    airportName: "Dubai International",
    avgProcessingDays: 1,
    visaTypesOffered: ["visit", "work", "married"],
    seatsOpenToday: 55,
    embassyFeeUSD: 90,
    baseFlightPriceUSD: 280,
    baseFlightDurationHours: 3.5,
  },
];

export function getCountry(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

/** Departure airports offered by the booking flow (applicant side). */
export const originAirports = [
  { code: "LHE", name: "Lahore Allama Iqbal Intl" },
  { code: "ISB", name: "Islamabad Intl" },
  { code: "KHI", name: "Karachi Jinnah Intl" },
  { code: "LYP", name: "Faisalabad Intl" },
];
