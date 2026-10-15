import { VisaType } from "@/types";

export const visaTypes: VisaType[] = [
  {
    id: "study",
    name: "Study Visa",
    tagline: "For an offer letter from a university or college",
    description:
      "For applicants holding an admission offer from an accredited institution abroad.",
    avgDecisionTime: "Same evening",
    requiredDocuments: [
      "Passport (bio page)",
      "Admission / offer letter",
      "Bank statement (last 6 months)",
      "Academic transcripts",
    ],
  },
  {
    id: "married",
    name: "Spouse / Married Visa",
    tagline: "To join a spouse who is a resident or citizen abroad",
    description:
      "For applicants joining a husband or wife who is already settled in the destination country.",
    avgDecisionTime: "Same evening",
    requiredDocuments: [
      "Passport (bio page)",
      "Marriage certificate",
      "Spouse's residency / citizenship proof",
      "Joint photographs or correspondence",
    ],
  },
  {
    id: "visit",
    name: "Visit Visa",
    tagline: "Tourism, family visits, or short business trips",
    description:
      "For short stays — sightseeing, visiting relatives, conferences, or business meetings.",
    avgDecisionTime: "Within hours",
    requiredDocuments: [
      "Passport (bio page)",
      "Bank statement (last 3 months)",
      "Return flight intent",
      "Hotel or invitation letter",
    ],
  },
  {
    id: "work",
    name: "Work Visa",
    tagline: "For a confirmed job offer abroad",
    description:
      "For applicants with a signed employment contract from a company in the destination country.",
    avgDecisionTime: "Within 24 hours",
    requiredDocuments: [
      "Passport (bio page)",
      "Company offer letter",
      "Employment contract",
      "Educational or trade certificates",
      "Police clearance certificate",
    ],
  },
];

export function getVisaType(id: string) {
  return visaTypes.find((v) => v.id === id);
}
