import type { Job } from "@/lib/jobs";

/**
 * Built-in sample jobs: 5 per featured country
 *   - 3 on-site / hybrid roles WITH relocation + visa sponsorship
 *   - 2 fully remote roles open to candidates from ANY country (Remote Worldwide)
 * They are generated here (no network) so every country page shows jobs instantly.
 * Companies are fictional — replace with real listings before launch.
 */

interface CountryMeta {
  code: string;
  name: string;
  street: string;
  dial: string;
  visa: string;
  visaNote: string;
  leave: string;
  health: string;
  localBenefit: string;
  allowance: string;
  weeks: number;
  language: string | null; // local language that is a plus (must exist in LANGUAGE_OPTIONS)
  workLang: string;
  cur: string;
  unit: "year" | "month";
  sc: "k" | "M" | "";
  pay: [number, number][]; // [junior, mid, senior]
  companies: string[]; // name|industry|city|founded|size
}

const COUNTRY_META: CountryMeta[] = [
  {
    code: "CA",
    name: "Canada",
    street: "King Street W",
    dial: "+1 416",
    visa: "Employer-sponsored Work Permit (Global Talent Stream)",
    visaNote:
      "The company files the LMIA/Global Talent Stream paperwork and covers the government and lawyer fees.",
    leave: "20 days paid vacation + public holidays",
    health: "Extended health, dental and vision from day 1",
    localBenefit: "RRSP matching up to 4%",
    allowance: "CAD 4,000",
    weeks: 4,
    language: "French",
    workLang: "English",
    cur: "CAD",
    unit: "year",
    sc: "k",
    pay: [
      [70, 90],
      [95, 125],
      [125, 160],
    ],
    companies: [
      "Northern Harbour Systems|logistics|Toronto|2014|250–500",
      "Aurora Ledger|fintech|Vancouver|2017|80–150",
      "Lumen Ridge Health|healthtech|Montreal|2016|150–300",
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    street: "Bishopsgate",
    dial: "+44 20",
    visa: "Skilled Worker visa (Certificate of Sponsorship)",
    visaNote:
      "The company is a licensed sponsor and issues your Certificate of Sponsorship; visa and Immigration Health Surcharge are paid by the company.",
    leave: "28 days paid holiday (incl. bank holidays)",
    health: "Private medical insurance + NHS access",
    localBenefit: "Workplace pension, 6% employer contribution",
    allowance: "GBP 3,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "GBP",
    unit: "year",
    sc: "k",
    pay: [
      [38, 50],
      [55, 75],
      [80, 105],
    ],
    companies: [
      "Thames Quay Digital|fintech|London|2013|300–600",
      "Pennine Cloudworks|saas|Manchester|2015|100–200",
      "Caledon Secure|cybersecurity|Edinburgh|2016|60–120",
    ],
  },
  {
    code: "DE",
    name: "Germany",
    street: "Friedrichstrasse",
    dial: "+49 30",
    visa: "EU Blue Card",
    visaNote:
      "The company applies for your EU Blue Card with you and pays the lawyer fees; your spouse can usually join and work.",
    leave: "30 days paid vacation",
    health: "Statutory health insurance paid 50% by employer",
    localBenefit: "Company pension (bAV) and public-transport ticket",
    allowance: "EUR 3,000",
    weeks: 4,
    language: "German",
    workLang: "English",
    cur: "EUR",
    unit: "year",
    sc: "k",
    pay: [
      [50, 60],
      [62, 78],
      [80, 100],
    ],
    companies: [
      "Rheinwerk Mobility|logistics|Munich|2012|400–800",
      "Spree Analytics|saas|Berlin|2016|120–250",
      "Elbe Solar Systems|cleanenergy|Hamburg|2014|200–400",
    ],
  },
  {
    code: "FR",
    name: "France",
    street: "Rue de Rivoli",
    dial: "+33 1",
    visa: "Talent Passport (Passeport Talent – Salarié Qualifié)",
    visaNote:
      "The company supports your Talent Passport file and the OFII formalities after arrival.",
    leave: "25 days paid leave + RTT days",
    health: "Top-up mutuelle paid by employer",
    localBenefit: "Meal vouchers and 50% transport refund",
    allowance: "EUR 2,500",
    weeks: 4,
    language: "French",
    workLang: "English",
    cur: "EUR",
    unit: "year",
    sc: "k",
    pay: [
      [38, 46],
      [48, 62],
      [65, 85],
    ],
    companies: [
      "Lumière Pay|fintech|Paris|2015|150–300",
      "Rhône Voyage Tech|travel|Lyon|2013|100–220",
      "Atelier Pixel Games|gaming|Montpellier|2011|80–160",
    ],
  },
  {
    code: "AU",
    name: "Australia",
    street: "George Street",
    dial: "+61 2",
    visa: "Skills in Demand visa (subclass 482)",
    visaNote:
      "The company is an approved sponsor, nominates your role and pays the nomination and lawyer fees.",
    leave: "20 days annual leave + 10 days personal leave",
    health: "OSHC / private health cover assistance",
    localBenefit: "Superannuation 12% on top of salary",
    allowance: "AUD 5,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "AUD",
    unit: "year",
    sc: "k",
    pay: [
      [80, 100],
      [110, 140],
      [145, 185],
    ],
    companies: [
      "Southern Cross Freight Tech|logistics|Sydney|2014|200–400",
      "Coral Reef Health|healthtech|Melbourne|2016|90–180",
      "Brisbane Bright Energy|cleanenergy|Brisbane|2015|120–250",
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    street: "Business Bay",
    dial: "+971 4",
    visa: "Employer-sponsored UAE residence visa + Emirates ID",
    visaNote:
      "Entry permit, medical test, Emirates ID and residence stamping are all arranged and paid by the company.",
    leave: "30 days paid leave",
    health: "Premium health insurance for you and family",
    localBenefit: "Tax-free salary + annual flight ticket home",
    allowance: "AED 10,000",
    weeks: 4,
    language: "Arabic",
    workLang: "English",
    cur: "AED",
    unit: "month",
    sc: "k",
    pay: [
      [12, 17],
      [18, 28],
      [30, 42],
    ],
    companies: [
      "Falcon Wings Commerce|ecommerce|Dubai|2015|300–600",
      "Oasis Pay|fintech|Abu Dhabi|2017|100–200",
      "Marina Cloud Technologies|saas|Dubai|2013|150–300",
    ],
  },
  {
    code: "US",
    name: "United States",
    street: "Market Street",
    dial: "+1 415",
    visa: "H-1B / O-1 / L-1 sponsorship (eligibility and annual lottery rules apply)",
    visaNote:
      "The company's immigration counsel files your petition and pays the filing fees. H-1B is subject to the annual cap lottery; the team will explain the options during the interview.",
    leave: "20 days PTO + 10 paid holidays",
    health: "Medical, dental and vision (90% employer-paid)",
    localBenefit: "401(k) with 4% match + equity options",
    allowance: "USD 6,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "USD",
    unit: "year",
    sc: "k",
    pay: [
      [85, 105],
      [115, 150],
      [160, 210],
    ],
    companies: [
      "Redwood Bay Software|saas|San Francisco|2012|500–1,000",
      "Lone Star Logistics Cloud|logistics|Austin|2014|250–500",
      "Hudson Vale Health|healthtech|New York|2015|150–300",
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    street: "Herengracht",
    dial: "+31 20",
    visa: "Highly Skilled Migrant permit (kennismigrant)",
    visaNote:
      "The company is a recognised sponsor and files your permit with the IND; the 30% tax ruling can be applied for.",
    leave: "25 days paid vacation + 8% holiday allowance",
    health: "Basic health insurance contribution",
    localBenefit: "30% ruling support + pension scheme",
    allowance: "EUR 3,000",
    weeks: 4,
    language: "Dutch",
    workLang: "English",
    cur: "EUR",
    unit: "year",
    sc: "k",
    pay: [
      [45, 55],
      [60, 78],
      [80, 100],
    ],
    companies: [
      "Canal Ring Payments|fintech|Amsterdam|2014|200–400",
      "Delta Port Systems|logistics|Rotterdam|2012|300–600",
      "Tulip Learning|edtech|Utrecht|2016|70–140",
    ],
  },
  {
    code: "SE",
    name: "Sweden",
    street: "Kungsgatan",
    dial: "+46 8",
    visa: "Work permit for skilled workers (Migrationsverket)",
    visaNote:
      "The company submits the employer part of the application and meets collective-agreement salary and insurance rules.",
    leave: "25 days paid vacation + parental leave",
    health: "Private health care plan + wellness allowance",
    localBenefit: "Occupational pension and 'friskvård' fitness grant",
    allowance: "SEK 30,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "SEK",
    unit: "month",
    sc: "k",
    pay: [
      [38, 47],
      [50, 62],
      [65, 82],
    ],
    companies: [
      "Nordstjärna Games|gaming|Stockholm|2011|200–450",
      "Skärgård Cloud|saas|Gothenburg|2015|90–180",
      "Fjäll Energy Tech|cleanenergy|Malmö|2016|100–200",
    ],
  },
  {
    code: "CH",
    name: "Switzerland",
    street: "Bahnhofstrasse",
    dial: "+41 44",
    visa: "B work permit (cantonal quota)",
    visaNote:
      "The company applies for your cantonal work permit within the quota and covers the application costs.",
    leave: "25 days paid vacation",
    health: "Mandatory health insurance premium subsidy",
    localBenefit: "Pension fund (BVG) with generous employer share",
    allowance: "CHF 5,000",
    weeks: 6,
    language: "German",
    workLang: "English",
    cur: "CHF",
    unit: "year",
    sc: "k",
    pay: [
      [85, 100],
      [105, 130],
      [135, 170],
    ],
    companies: [
      "Alpenbank Digital|fintech|Zurich|2012|300–600",
      "Matterhorn Med Systems|healthtech|Basel|2010|250–500",
      "Lakeview Secure|cybersecurity|Geneva|2015|60–130",
    ],
  },
  {
    code: "IE",
    name: "Ireland",
    street: "Grand Canal Dock",
    dial: "+353 1",
    visa: "Critical Skills Employment Permit",
    visaNote:
      "Your role is on the Critical Skills list; the company applies for the permit and after 2 years you can apply for long-term residence.",
    leave: "24 days paid leave + public holidays",
    health: "Private health insurance (VHI) paid by employer",
    localBenefit: "Pension 5% match + bike-to-work scheme",
    allowance: "EUR 3,500",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "EUR",
    unit: "year",
    sc: "k",
    pay: [
      [45, 55],
      [60, 80],
      [85, 110],
    ],
    companies: [
      "Liffey Data Works|saas|Dublin|2013|200–400",
      "Emerald Trust Pay|fintech|Cork|2016|90–180",
      "Shannon Travel Labs|travel|Galway|2017|50–110",
    ],
  },
  {
    code: "IT",
    name: "Italy",
    street: "Via Torino",
    dial: "+39 02",
    visa: "EU Blue Card Italy / Nulla Osta for skilled work",
    visaNote:
      "The company requests the Nulla Osta from the Sportello Unico and guides you through the visa and permesso di soggiorno.",
    leave: "26 days paid leave + 13th-month salary",
    health: "National health service + supplementary insurance",
    localBenefit: "13th/14th-month salary and meal vouchers",
    allowance: "EUR 2,000",
    weeks: 4,
    language: "Italian",
    workLang: "English",
    cur: "EUR",
    unit: "year",
    sc: "k",
    pay: [
      [30, 38],
      [40, 52],
      [55, 72],
    ],
    companies: [
      "Navigli Software|saas|Milan|2013|120–250",
      "Colosseo Commerce|ecommerce|Rome|2015|90–200",
      "Adriatica Logistics Tech|logistics|Bologna|2012|150–300",
    ],
  },
  {
    code: "ES",
    name: "Spain",
    street: "Passeig de Gràcia",
    dial: "+34 93",
    visa: "Highly Qualified Professional visa (HQP) / Digital talent route",
    visaNote:
      "The company supports the HQP application under the Spanish startup and talent rules; processing is fast-tracked for qualified tech roles.",
    leave: "23 days paid vacation + local holidays",
    health: "Private health insurance (Sanitas/Adeslas)",
    localBenefit: "Flexible compensation: meals, transport and childcare",
    allowance: "EUR 2,500",
    weeks: 4,
    language: "Spanish",
    workLang: "English",
    cur: "EUR",
    unit: "year",
    sc: "k",
    pay: [
      [28, 36],
      [38, 50],
      [52, 70],
    ],
    companies: [
      "Sol Mediterráneo Tech|travel|Barcelona|2014|150–300",
      "Retiro Digital Bank|fintech|Madrid|2016|200–400",
      "Turia Learn|edtech|Valencia|2017|50–110",
    ],
  },
  {
    code: "NO",
    name: "Norway",
    street: "Karl Johans gate",
    dial: "+47 22",
    visa: "Skilled Worker residence permit",
    visaNote:
      "The company provides the job offer and confirms salary meets the national minimum for skilled workers; fees are covered.",
    leave: "25 days paid vacation + holiday pay",
    health: "Public health system + private top-up cover",
    localBenefit: "Occupational pension and generous parental leave",
    allowance: "NOK 35,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "NOK",
    unit: "year",
    sc: "k",
    pay: [
      [550, 650],
      [680, 820],
      [850, 1050],
    ],
    companies: [
      "Fjordkraft Digital|cleanenergy|Oslo|2013|200–400",
      "Nordlys Secure|cybersecurity|Bergen|2015|60–130",
      "Vik Marine Systems|logistics|Stavanger|2012|150–300",
    ],
  },
  {
    code: "NZ",
    name: "New Zealand",
    street: "Queen Street",
    dial: "+64 9",
    visa: "Accredited Employer Work Visa (AEWV)",
    visaNote:
      "The company is an accredited employer and handles the job-check and your visa application; the fees are reimbursed.",
    leave: "20 days annual leave + 5 days sick leave",
    health: "Private health insurance contribution",
    localBenefit: "KiwiSaver 3% employer contribution",
    allowance: "NZD 5,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "NZD",
    unit: "year",
    sc: "k",
    pay: [
      [70, 85],
      [90, 115],
      [120, 150],
    ],
    companies: [
      "Kiwi Summit Software|saas|Auckland|2014|100–220",
      "Tasman Freight Labs|logistics|Wellington|2015|60–140",
      "Aotea Health Tech|healthtech|Christchurch|2016|50–110",
    ],
  },
  {
    code: "SG",
    name: "Singapore",
    street: "Marina Boulevard",
    dial: "+65",
    visa: "Employment Pass (EP)",
    visaNote:
      "The company applies for your Employment Pass through MOM and pays the application fee; salary meets the EP qualifying threshold.",
    leave: "18 days annual leave + 14 sick days",
    health: "Group hospitalisation and outpatient insurance",
    localBenefit: "13th-month bonus + performance bonus",
    allowance: "SGD 4,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "SGD",
    unit: "month",
    sc: "k",
    pay: [
      [4.5, 6],
      [6.5, 9],
      [9.5, 13],
    ],
    companies: [
      "Merlion Pay|fintech|Singapore|2014|300–600",
      "Harbourfront Commerce|ecommerce|Singapore|2013|400–800",
      "Orchid AI Labs|ai|Singapore|2018|60–130",
    ],
  },
  {
    code: "MY",
    name: "Malaysia",
    street: "Jalan Sultan Ismail",
    dial: "+60 3",
    visa: "Employment Pass (EP) via ESD",
    visaNote:
      "The company submits your Employment Pass application and pays the processing and levy costs.",
    leave: "16 days annual leave + 14 sick days",
    health: "Medical card for you and your family",
    localBenefit: "EPF contribution and annual bonus",
    allowance: "MYR 8,000",
    weeks: 4,
    language: null,
    workLang: "English",
    cur: "MYR",
    unit: "month",
    sc: "k",
    pay: [
      [5, 7],
      [8, 12],
      [13, 19],
    ],
    companies: [
      "Kampung Digital|ecommerce|Kuala Lumpur|2015|200–400",
      "Selat Logistics Cloud|logistics|Penang|2014|120–250",
      "Rimba Pay|fintech|Kuala Lumpur|2017|80–160",
    ],
  },
  {
    code: "JP",
    name: "Japan",
    street: "Marunouchi",
    dial: "+81 3",
    visa: "Engineer / Specialist in Humanities / Highly Skilled Professional visa",
    visaNote:
      "The company obtains your Certificate of Eligibility and supports the visa and residence-card procedures; Japanese is not required.",
    leave: "20 days paid leave + national holidays",
    health: "National health insurance + employer pension",
    localBenefit: "Commuting allowance and twice-yearly bonus",
    allowance: "JPY 300,000",
    weeks: 4,
    language: "Japanese",
    workLang: "English",
    cur: "JPY",
    unit: "year",
    sc: "M",
    pay: [
      [4.5, 6],
      [6.5, 9],
      [9, 13],
    ],
    companies: [
      "Sakura Systems|saas|Tokyo|2010|300–600",
      "Kansai Robotics Software|ai|Osaka|2014|120–250",
      "Fuji Game Works|gaming|Fukuoka|2012|100–220",
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    street: "King Fahd Road",
    dial: "+966 11",
    visa: "Employer-sponsored work visa + Iqama (via Qiwa)",
    visaNote:
      "Work visa, medical, Iqama and Absher setup are processed and paid by the company.",
    leave: "21 days paid leave + Eid holidays",
    health: "Premium medical insurance for you and family",
    localBenefit: "Housing & transport allowance + annual ticket home",
    allowance: "SAR 15,000",
    weeks: 4,
    language: "Arabic",
    workLang: "English",
    cur: "SAR",
    unit: "month",
    sc: "k",
    pay: [
      [10, 14],
      [15, 24],
      [25, 38],
    ],
    companies: [
      "Najd Digital|fintech|Riyadh|2016|250–500",
      "Red Sea Commerce|ecommerce|Jeddah|2017|200–400",
      "Dammam Energy Software|cleanenergy|Dammam|2015|150–300",
    ],
  },
  {
    code: "QA",
    name: "Qatar",
    street: "West Bay",
    dial: "+974",
    visa: "Employer-sponsored work residence permit (RP) + Qatar ID",
    visaNote:
      "Entry visa, medical, Qatar ID and residence permit are handled and paid by the company.",
    leave: "21 days paid leave + national holidays",
    health: "Comprehensive health insurance for you and family",
    localBenefit:
      "Tax-free salary, housing allowance and end-of-service gratuity",
    allowance: "QAR 12,000",
    weeks: 4,
    language: "Arabic",
    workLang: "English",
    cur: "QAR",
    unit: "month",
    sc: "k",
    pay: [
      [10, 14],
      [15, 24],
      [26, 38],
    ],
    companies: [
      "Doha Pearl Technologies|fintech|Doha|2015|150–300",
      "Lusail Smart Systems|saas|Doha|2017|100–200",
      "Al Wakrah Logistics Cloud|logistics|Doha|2014|120–250",
    ],
  },
  {
    code: "TR",
    name: "Turkey",
    street: "Büyükdere Caddesi",
    dial: "+90 212",
    visa: "Work permit (Turquoise Card eligible roles)",
    visaNote:
      "The company submits your work-permit application through the Ministry of Labour and covers the fees.",
    leave: "20 days paid leave + national holidays",
    health: "Private health insurance (SGK + top-up)",
    localBenefit: "Meal card, shuttle service and annual bonus",
    allowance: "EUR 1,500",
    weeks: 4,
    language: "Turkish",
    workLang: "English",
    cur: "EUR",
    unit: "month",
    sc: "k",
    pay: [
      [2.2, 3],
      [3.2, 4.5],
      [4.8, 6.5],
    ],
    companies: [
      "Bosphorus Soft|saas|Istanbul|2013|250–500",
      "Anatolia Games|gaming|Ankara|2015|100–220",
      "Aegean Commerce Cloud|ecommerce|Izmir|2016|120–250",
    ],
  },
];

/* ------------------------- industry copy ------------------------- */
const INDUSTRIES: Record<
  string,
  { label: string; does: string; culture: string }
> = {
  fintech: {
    label: "FinTech / Payments",
    does: "builds payment and digital-banking infrastructure used by SMEs, marketplaces and consumer apps",
    culture:
      "Security-first engineering, small autonomous squads and a strong code-review culture.",
  },
  logistics: {
    label: "Logistics & Supply Chain",
    does: "runs a freight-tracking and last-mile delivery platform that connects shippers, drivers and warehouses in real time",
    culture:
      "Data-driven decisions, pragmatic engineering and on-call that is shared fairly.",
  },
  healthtech: {
    label: "HealthTech",
    does: "develops telemedicine and patient-records software used by clinics and hospitals",
    culture:
      "Quality and privacy come first; engineers sit close to doctors and product to build things people really use.",
  },
  ecommerce: {
    label: "E-commerce",
    does: "operates a multi-brand online marketplace and checkout platform serving millions of shoppers",
    culture:
      "Fast shipping cycles, A/B-test everything, and customers' feedback drives the roadmap.",
  },
  saas: {
    label: "B2B SaaS",
    does: "sells workflow-automation and analytics software to mid-size and enterprise teams",
    culture:
      "Product-led, well-documented engineering, and regular hack weeks.",
  },
  cleanenergy: {
    label: "Clean Energy Software",
    does: "builds monitoring and forecasting software for solar farms, wind assets and EV-charging networks",
    culture:
      "Mission-driven team, reliability engineering and lots of IoT/time-series challenges.",
  },
  travel: {
    label: "Travel Technology",
    does: "powers booking, itinerary and loyalty tools for airlines, hotels and travel agencies",
    culture:
      "Friendly international team, flexible hours and a yearly travel allowance.",
  },
  cybersecurity: {
    label: "Cybersecurity",
    does: "provides threat-detection and identity-security products for enterprises and public bodies",
    culture:
      "Deep technical focus, blameless post-mortems and a dedicated research-and-learning budget.",
  },
  gaming: {
    label: "Gaming",
    does: "creates mobile and cross-platform games together with a live-ops and analytics platform",
    culture:
      "Creative, playful and quality-obsessed — engineers, artists and designers ship together.",
  },
  edtech: {
    label: "EdTech",
    does: "runs online learning and certification platforms for universities and employers",
    culture:
      "Learner-first thinking, strong accessibility standards and a supportive, mentoring culture.",
  },
  ai: {
    label: "Applied AI",
    does: "builds applied-AI products such as document understanding and demand-forecasting APIs",
    culture:
      "Research meets production: small teams, quick experiments and rigorous evaluation.",
  },
};

/* ------------------------- role templates ------------------------- */
interface RoleTemplate {
  title: string;
  roleType: string;
  level: 0 | 1 | 2; // 0 = 1-2 yrs, 1 = 3-5 yrs, 2 = 5-8 yrs
  tech: string[];
  skills: string[];
  resp: string[];
  req: string[];
}

const LEVELS = ["1-2 years", "3-5 years", "5-8 years"];

const ROLES: RoleTemplate[] = [
  {
    title: "Full Stack Developer",
    roleType: "Full Stack Developer",
    level: 1,
    tech: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
    skills: ["REST APIs", "Testing", "Agile"],
    resp: [
      "Build and ship features end-to-end, from database to polished UI",
      "Design clean REST/GraphQL APIs and keep them fast and secure",
      "Write automated tests and take part in code reviews",
      "Work with product and design to turn ideas into releases every sprint",
    ],
    req: [
      "3+ years of professional experience with React and Node.js/TypeScript",
      "Solid SQL knowledge (PostgreSQL preferred) and API design skills",
      "Experience with Git, CI/CD and a cloud provider (AWS/Azure)",
      "Bachelor's degree in CS/IT or equivalent proven experience",
    ],
  },
  {
    title: "Frontend Developer",
    roleType: "Frontend Developer",
    level: 0,
    tech: ["React", "Next.js", "TypeScript", "JavaScript"],
    skills: ["Responsive design", "Accessibility", "Figma handoff"],
    resp: [
      "Turn Figma designs into fast, responsive and accessible interfaces",
      "Build reusable components for our design system",
      "Improve performance (Core Web Vitals) and animation quality",
      "Collaborate with designers and backend engineers in small squads",
    ],
    req: [
      "1–2+ years with React/Next.js and modern TypeScript",
      "Strong HTML, CSS (Tailwind or similar) and responsive-design skills",
      "A portfolio or live projects you can share",
      "Degree in CS/IT/design or equivalent practical experience",
    ],
  },
  {
    title: "Backend Developer (Java)",
    roleType: "Backend Developer",
    level: 1,
    tech: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
    skills: ["Microservices", "API design", "Testing"],
    resp: [
      "Develop and maintain high-traffic Spring Boot microservices",
      "Model data and optimise PostgreSQL queries",
      "Add monitoring, logging and alerts to every service you own",
      "Mentor junior developers through reviews and pairing",
    ],
    req: [
      "3+ years of Java/Spring Boot in production",
      "Good knowledge of SQL, messaging (Kafka/RabbitMQ) and Docker",
      "Understanding of security, scalability and clean architecture",
      "Bachelor's degree in CS/IT or equivalent proven experience",
    ],
  },
  {
    title: "Senior Software Engineer",
    roleType: "Senior Software Engineer",
    level: 2,
    tech: ["Go", "Kubernetes", "AWS", "PostgreSQL"],
    skills: ["System design", "Mentoring", "Code review"],
    resp: [
      "Lead the design of scalable, resilient backend services",
      "Own technical decisions and write clear design documents",
      "Mentor 3–5 engineers and raise the engineering bar",
      "Drive reliability: SLOs, incident response and post-mortems",
    ],
    req: [
      "5+ years building distributed systems in production",
      "Strong in Go, Java or similar and with Kubernetes/cloud",
      "Proven leadership or mentoring experience",
      "Bachelor's/Master's degree in CS or equivalent experience",
    ],
  },
  {
    title: "Software Engineer (Python)",
    roleType: "Software Engineer",
    level: 0,
    tech: ["Python", "Django", "SQL", "Git"],
    skills: ["Problem solving", "Clean code", "Agile"],
    resp: [
      "Build and improve Django services and internal tools",
      "Write readable, tested code and fix bugs quickly",
      "Learn from senior engineers through pairing and mentoring",
      "Help automate manual processes with scripts and APIs",
    ],
    req: [
      "1–2+ years of Python (Django/FastAPI) experience",
      "Good understanding of SQL, Git and REST APIs",
      "Eagerness to learn and to take feedback",
      "Degree in CS/IT or equivalent practical experience",
    ],
  },
  {
    title: "Mobile App Developer",
    roleType: "Mobile App Developer",
    level: 1,
    tech: ["React Native", "TypeScript", "Kotlin", "Swift"],
    skills: ["App Store releases", "Performance", "Testing"],
    resp: [
      "Build and release iOS/Android apps used by thousands of people daily",
      "Integrate APIs, push notifications and offline mode",
      "Profile and improve app speed, battery use and stability",
      "Own the release process on App Store and Google Play",
    ],
    req: [
      "3+ years of mobile development (React Native, Kotlin or Swift)",
      "Published apps you can show",
      "Experience with state management, REST APIs and unit testing",
      "Degree in CS/IT or equivalent practical experience",
    ],
  },
  {
    title: "DevOps Engineer",
    roleType: "DevOps Engineer",
    level: 1,
    tech: ["AWS", "Docker", "Kubernetes", "Git"],
    skills: ["CI/CD", "Terraform", "Monitoring"],
    resp: [
      "Run and improve our CI/CD pipelines and Kubernetes clusters",
      "Automate infrastructure with Terraform and scripts",
      "Build monitoring, alerting and cost dashboards",
      "Support developers and take part in a fair on-call rota",
    ],
    req: [
      "3+ years in DevOps/SRE roles with AWS or Azure",
      "Hands-on with Docker, Kubernetes and infrastructure-as-code",
      "Good Linux, networking and security fundamentals",
      "Bachelor's degree in CS/IT or equivalent proven experience",
    ],
  },
  {
    title: "Data Engineer",
    roleType: "Data Engineer",
    level: 1,
    tech: ["Python", "SQL", "AWS", "PostgreSQL"],
    skills: ["ETL pipelines", "Data modelling", "Airflow"],
    resp: [
      "Design and maintain reliable data pipelines and warehouses",
      "Model data for analytics and machine-learning teams",
      "Monitor data quality and fix issues at the source",
      "Document datasets so the whole company can use them",
    ],
    req: [
      "3+ years of Python and advanced SQL",
      "Experience with Airflow/dbt and a cloud data warehouse",
      "Understanding of data modelling and performance tuning",
      "Bachelor's degree in CS/IT/maths or equivalent experience",
    ],
  },
  {
    title: "QA Automation Engineer",
    roleType: "QA / Test Engineer",
    level: 0,
    tech: ["JavaScript", "TypeScript", "Git", "Docker"],
    skills: ["Playwright / Cypress", "API testing", "Agile"],
    resp: [
      "Create and maintain automated UI and API test suites",
      "Find bugs early with exploratory and regression testing",
      "Integrate tests into the CI pipeline",
      "Work with developers to improve quality across the product",
    ],
    req: [
      "1–2+ years in QA/test automation (Playwright, Cypress or Selenium)",
      "Good knowledge of JavaScript/TypeScript and REST APIs",
      "Attention to detail and clear bug reporting",
      "Degree in CS/IT or equivalent practical experience",
    ],
  },
  {
    title: "Senior .NET Backend Engineer",
    roleType: "Backend Developer",
    level: 2,
    tech: ["C#", ".NET", "ASP.NET Core", "Azure", "SQL"],
    skills: ["System design", "Code review", "Mentoring"],
    resp: [
      "Design and build scalable ASP.NET Core services on Azure",
      "Lead architecture discussions and review critical code",
      "Improve performance, observability and test coverage",
      "Coach mid-level engineers and share knowledge across teams",
    ],
    req: [
      "5+ years of C#/.NET in production systems",
      "Experience with Azure, SQL Server/PostgreSQL and event-driven design",
      "Strong communication in English (written and spoken)",
      "Bachelor's degree in CS/IT or equivalent proven experience",
    ],
  },
];

/* ------------------------- helpers ------------------------- */
const REMOTE_PAY: [number, number][] = [
  [2500, 3800],
  [4000, 6000],
  [6000, 9000],
];

function n(x: number): string {
  return x.toLocaleString("en-US");
}

function localSalary(m: CountryMeta, level: number): string {
  const [lo, hi] = m.pay[level];
  const f = (v: number) => (m.sc === "" ? n(v) : `${v}${m.sc}`);
  return `${m.cur} ${f(lo)} – ${f(hi)} / ${m.unit}`;
}

function li(items: string[]): string {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

const HIRING_RELOCATION = [
  "Apply on VisaAI — our AI screens your profile in minutes",
  "30-minute intro call with the recruiter",
  "Technical interview or take-home task (max. 3 hours)",
  "Final interview with your future team",
  "Offer, then visa paperwork and relocation planning start together",
];
const HIRING_REMOTE = [
  "Apply on VisaAI — our AI screens your profile in minutes",
  "30-minute intro call with the recruiter",
  "Technical interview or paid take-home task",
  "Final interview with your future team",
  "Offer and contract — you can start from your own country",
];

function buildJob(m: CountryMeta, ci: number, k: number): Job {
  const remote = k >= 3;
  // companies: relocation jobs use companies 0,1,2 — remote jobs use companies 0,1
  const coIndex = remote ? k - 3 : k;
  const [coName, indKey, city, founded, size] = m.companies[coIndex].split("|");
  const ind = INDUSTRIES[indKey];
  const role = ROLES[(ci * 5 + k) % ROLES.length];
  const slug = coName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");

  const salary = remote
    ? `USD ${n(REMOTE_PAY[role.level][0])} – ${n(REMOTE_PAY[role.level][1])} / month (paid in USD, work from anywhere)`
    : localSalary(m, role.level);

  const about = `${coName} is a ${ind.label.toLowerCase()} company founded in ${founded} and headquartered in ${city}, ${m.name}. It ${ind.does}. With ${size} employees across product, engineering and operations, the company is growing fast and hiring ${remote ? "remote engineers worldwide" : "international engineers who relocate to " + m.name}.`;

  const overview = remote
    ? `<p><b>About the role</b></p><p>${coName} is looking for a <b>${role.title}</b> to join its distributed team <b>100% remotely</b>. You can live and work from <b>any country</b> — no relocation and no visa needed. Work is organised asynchronously with about 4 hours of overlap with ${city} time.</p>`
    : `<p><b>About the role</b></p><p>${coName} is hiring a <b>${role.title}</b> for its ${city} office (${k === 1 ? "on-site" : "hybrid, 3 days in the office"}). The company sponsors your <b>${m.visa}</b> and supports your move to ${m.name} with a full relocation package.</p>`;

  const responsibilities = role.resp;
  const requirements = remote
    ? [
        ...role.req,
        "Excellent written and spoken English (we work async, so clear writing matters)",
        `Availability for at least 4 hours of overlap with ${city} working hours`,
        "A stable internet connection and a quiet workspace",
        "Comfortable working as a full-time contractor or via an employer-of-record (Deel/Remote)",
      ]
    : [
        ...role.req,
        "English is required — " +
          (m.language
            ? `${m.language} is a plus, but not mandatory`
            : "no local language is needed"),
        "Valid passport (6+ months validity) and willingness to relocate within 8–12 weeks",
        "Degree certificate or proof of experience (needed for the visa application)",
        "Clean background check",
      ];

  const benefits = remote
    ? [
        "100% remote — work from any country, no visa required",
        "Salary paid in USD every month (Wise / Deel)",
        "Flexible working hours and an async-first culture",
        "USD 1,000 home-office / equipment stipend",
        "USD 1,200 yearly learning & conference budget",
        "25 days paid time off + public holidays of your country",
        "Monthly co-working or internet allowance",
        "Annual team retreat (travel and stay paid)",
        "Health & wellbeing stipend",
      ]
    : [
        `Visa sponsorship: ${m.visa}`,
        `Relocation package: flight ticket, ${m.weeks} weeks of temporary housing and a ${m.allowance} relocation bonus`,
        m.health,
        m.leave,
        m.localBenefit,
        "Family visa support for your spouse and children",
        "Language classes and settling-in help (bank account, SIM, housing search)",
        "Laptop + monitor of your choice and USD 1,000 yearly learning budget",
        "Clear promotion path and yearly performance bonus",
      ];

  const relocationDetails = remote
    ? ""
    : `Flight ticket, ${m.weeks} weeks of temporary housing, ${m.allowance} relocation bonus, visa fees and legal support covered, settling-in help. ${m.visaNote}`;

  const ordinal = k * COUNTRY_META.length + ci;
  const base = new Date();
  base.setUTCHours(9, 0, 0, 0);
  const created = new Date(
    base.getTime() -
      Math.floor(ordinal / 8) * 86400000 -
      (ordinal % 8) * 3600000,
  ).toISOString();

  const questions = remote
    ? [
        `How many years have you worked with ${role.tech[0]}?`,
        "Which country and time zone are you in, and how many hours can you overlap with the team?",
      ]
    : [
        `How many years have you worked with ${role.tech[0]}?`,
        `When could you start if you relocate to ${m.name} (notice period + visa time)?`,
      ];

  return {
    id: `seed-${m.code.toLowerCase()}-${k + 1}`,
    title: role.title,
    roleType: role.roleType,
    countryCode: m.code,
    countryName: m.name,
    city: remote ? "Remote (Worldwide)" : city,
    companyName: coName,
    companyLocation: `${100 + ci * 7 + k * 3} ${m.street}, ${city}, ${m.name}`,
    companyWebsite: "",
    companyPhone: `${m.dial} 555 01${String(ci).padStart(2, "0").slice(-2)}`,
    companyEmail: `careers@${slug}.example`,
    employmentType: "Full-time",
    workMode: remote ? "Remote" : k === 1 ? "On-site" : "Hybrid",
    experienceLevel: LEVELS[role.level],
    salary,
    techStack: role.tech,
    skills: role.skills,
    languages: ["English", ...(!remote && m.language ? [m.language] : [])],
    relocation: !remote,
    relocationDetails,
    visaSponsorship: !remote,
    remoteGlobal: remote,
    descriptionHtml: `${overview}<p><b>What you will do</b></p>${li(responsibilities)}`,
    questions,
    createdAt: created,
    companyProfile: {
      industry: ind.label,
      founded,
      size: `${size} employees`,
      headquarters: `${city}, ${m.name}`,
      about,
      culture: ind.culture,
      workLanguage: m.workLang,
    },
    responsibilities,
    requirements,
    benefits,
    hiringProcess: remote ? HIRING_REMOTE : HIRING_RELOCATION,
    visaDetails: remote ? "" : `${m.visa}. ${m.visaNote}`,
  };
}

export const GENERATED_JOBS: Job[] = COUNTRY_META.flatMap((m, ci) =>
  [0, 1, 2, 3, 4].map((k) => buildJob(m, ci, k)),
);
