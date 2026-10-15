import { getSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/auth";
import { GENERATED_JOBS } from "@/lib/seed-jobs";

export interface Job {
  id: string;
  title: string;
  roleType: string;
  countryCode: string;
  countryName: string;
  city: string;
  companyName: string;
  companyLocation: string;
  companyWebsite: string;
  companyPhone: string;
  companyEmail: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  salary: string;
  techStack: string[];
  skills: string[];
  languages: string[];
  relocation: boolean;
  relocationDetails: string;
  visaSponsorship: boolean;
  descriptionHtml: string;
  /** Extra questions the company wants every applicant to answer. */
  questions?: string[];
  /** Fully remote role open to candidates from any country. */
  remoteGlobal?: boolean;
  /** Detailed company information shown on the job page. */
  companyProfile?: {
    industry: string;
    founded: string;
    size: string;
    headquarters: string;
    about: string;
    culture: string;
    workLanguage: string;
  };
  responsibilities?: string[];
  /** What the company asks from candidates. */
  requirements?: string[];
  benefits?: string[];
  hiringProcess?: string[];
  /** Visa type + what the company handles. */
  visaDetails?: string;
  createdAt: string;
  userId?: string;
}

export const ROLE_OPTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Software Engineer",
  "Senior Software Engineer",
  "Mobile App Developer",
  "DevOps Engineer",
  "Data Engineer",
  "QA / Test Engineer",
  "UI/UX Designer",
  "Other",
];

export const TECH_OPTIONS = [
  "Python",
  "Java",
  ".NET",
  "C#",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Angular",
  "Vue.js",
  "Node.js",
  "PHP",
  "Laravel",
  "Go",
  "Ruby",
  "Kotlin",
  "Swift",
  "React Native",
  "Flutter",
  "Django",
  "Spring Boot",
  "ASP.NET Core",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Urdu",
  "Hindi",
  "Arabic",
  "German",
  "French",
  "Spanish",
  "Chinese",
  "Japanese",
  "Russian",
  "Turkish",
  "Portuguese",
  "Italian",
  "Dutch",
];

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];
export const WORK_MODES = ["On-site", "Hybrid", "Remote"];
export const EXPERIENCE_LEVELS = [
  "Fresher",
  "1-2 years",
  "3-5 years",
  "5-8 years",
  "8+ years",
];

const COUNTRY_DATA =
  "AF:Afghanistan,AL:Albania,DZ:Algeria,AD:Andorra,AO:Angola,AG:Antigua and Barbuda,AR:Argentina,AM:Armenia,AU:Australia,AT:Austria,AZ:Azerbaijan,BS:Bahamas,BH:Bahrain,BD:Bangladesh,BB:Barbados,BY:Belarus,BE:Belgium,BZ:Belize,BJ:Benin,BT:Bhutan,BO:Bolivia,BA:Bosnia and Herzegovina,BW:Botswana,BR:Brazil,BN:Brunei,BG:Bulgaria,BF:Burkina Faso,BI:Burundi,KH:Cambodia,CM:Cameroon,CA:Canada,CV:Cape Verde,CF:Central African Republic,TD:Chad,CL:Chile,CN:China,CO:Colombia,KM:Comoros,CG:Congo,CD:DR Congo,CR:Costa Rica,CI:Cote d'Ivoire,HR:Croatia,CU:Cuba,CY:Cyprus,CZ:Czechia,DK:Denmark,DJ:Djibouti,DM:Dominica,DO:Dominican Republic,EC:Ecuador,EG:Egypt,SV:El Salvador,GQ:Equatorial Guinea,ER:Eritrea,EE:Estonia,SZ:Eswatini,ET:Ethiopia,FJ:Fiji,FI:Finland,FR:France,GA:Gabon,GM:Gambia,GE:Georgia,DE:Germany,GH:Ghana,GR:Greece,GD:Grenada,GT:Guatemala,GN:Guinea,GW:Guinea-Bissau,GY:Guyana,HT:Haiti,HN:Honduras,HK:Hong Kong,HU:Hungary,IS:Iceland,IN:India,ID:Indonesia,IR:Iran,IQ:Iraq,IE:Ireland,IL:Israel,IT:Italy,JM:Jamaica,JP:Japan,JO:Jordan,KZ:Kazakhstan,KE:Kenya,KI:Kiribati,XK:Kosovo,KW:Kuwait,KG:Kyrgyzstan,LA:Laos,LV:Latvia,LB:Lebanon,LS:Lesotho,LR:Liberia,LY:Libya,LI:Liechtenstein,LT:Lithuania,LU:Luxembourg,MO:Macau,MG:Madagascar,MW:Malawi,MY:Malaysia,MV:Maldives,ML:Mali,MT:Malta,MH:Marshall Islands,MR:Mauritania,MU:Mauritius,MX:Mexico,FM:Micronesia,MD:Moldova,MC:Monaco,MN:Mongolia,ME:Montenegro,MA:Morocco,MZ:Mozambique,MM:Myanmar,NA:Namibia,NR:Nauru,NP:Nepal,NL:Netherlands,NZ:New Zealand,NI:Nicaragua,NE:Niger,NG:Nigeria,KP:North Korea,MK:North Macedonia,NO:Norway,OM:Oman,PK:Pakistan,PW:Palau,PS:Palestine,PA:Panama,PG:Papua New Guinea,PY:Paraguay,PE:Peru,PH:Philippines,PL:Poland,PT:Portugal,PR:Puerto Rico,QA:Qatar,RO:Romania,RU:Russia,RW:Rwanda,KN:Saint Kitts and Nevis,LC:Saint Lucia,VC:Saint Vincent and the Grenadines,WS:Samoa,SM:San Marino,ST:Sao Tome and Principe,SA:Saudi Arabia,SN:Senegal,RS:Serbia,SC:Seychelles,SL:Sierra Leone,SG:Singapore,SK:Slovakia,SI:Slovenia,SB:Solomon Islands,SO:Somalia,ZA:South Africa,KR:South Korea,SS:South Sudan,ES:Spain,LK:Sri Lanka,SD:Sudan,SR:Suriname,SE:Sweden,CH:Switzerland,SY:Syria,TW:Taiwan,TJ:Tajikistan,TZ:Tanzania,TH:Thailand,TL:Timor-Leste,TG:Togo,TO:Tonga,TT:Trinidad and Tobago,TN:Tunisia,TR:Turkey,TM:Turkmenistan,TV:Tuvalu,UG:Uganda,UA:Ukraine,AE:United Arab Emirates,GB:United Kingdom,US:United States,UY:Uruguay,UZ:Uzbekistan,VU:Vanuatu,VA:Vatican City,VE:Venezuela,VN:Vietnam,YE:Yemen,ZM:Zambia,ZW:Zimbabwe";

export const WORLD_COUNTRIES: { code: string; name: string }[] =
  COUNTRY_DATA.split(",").map((p) => {
    const i = p.indexOf(":");
    return { code: p.slice(0, i), name: p.slice(i + 1) };
  });

export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 127397 + c.charCodeAt(0)),
  );
}

/* ---------- HTML sanitizer (client only) ---------- */
const ALLOWED_TAGS = new Set([
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "STRIKE",
  "P",
  "DIV",
  "BR",
  "UL",
  "OL",
  "LI",
  "SPAN",
  "FONT",
  "H1",
  "H2",
  "H3",
  "H4",
  "BLOCKQUOTE",
  "SUB",
  "SUP",
]);
const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i;
const SAFE_STYLE: Record<string, RegExp> = {
  color: COLOR_RE,
  "background-color": COLOR_RE,
  "font-size": /^(-webkit-)?[a-z-]+$|^\d+(\.\d+)?(px|pt|em|rem|%)$/i,
  "font-family": /^[\w\s,'"-]+$/,
  "font-weight": /^(normal|bold|bolder|lighter|[1-9]00)$/i,
  "font-style": /^(normal|italic)$/i,
  "text-decoration":
    /^(none|underline|line-through|underline line-through|line-through underline)$/i,
  "text-decoration-line":
    /^(none|underline|line-through|underline line-through|line-through underline)$/i,
  "text-align": /^(left|right|center|justify)$/i,
};

function cleanInto(source: Node, target: HTMLElement) {
  source.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(child.textContent ?? ""));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    if (el.tagName === "SCRIPT" || el.tagName === "STYLE") return;
    if (!ALLOWED_TAGS.has(el.tagName)) {
      cleanInto(el, target);
      return;
    }
    const copy = document.createElement(el.tagName.toLowerCase());
    const kept: string[] = [];
    for (let i = 0; i < el.style.length; i++) {
      const prop = el.style[i];
      const rule = SAFE_STYLE[prop];
      const val = el.style.getPropertyValue(prop).trim();
      if (rule && rule.test(val)) kept.push(`${prop}: ${val}`);
    }
    if (kept.length) copy.setAttribute("style", kept.join("; "));
    if (el.tagName === "FONT") {
      const color = el.getAttribute("color");
      const face = el.getAttribute("face");
      const size = el.getAttribute("size");
      if (color && COLOR_RE.test(color)) copy.setAttribute("color", color);
      if (face && /^[\w\s,'"-]+$/.test(face)) copy.setAttribute("face", face);
      if (size && /^[1-7]$/.test(size)) copy.setAttribute("size", size);
    }
    cleanInto(el, copy);
    target.appendChild(copy);
  });
}

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined")
    return "";
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const root = document.createElement("div");
  cleanInto(doc.body, root);
  return root.innerHTML;
}

export function htmlToText(html: string): string {
  if (typeof window === "undefined") return "";
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent ?? "").trim();
}

/* ---------- Storage: Supabase when configured, else localStorage ---------- */
const LS_KEY = "visaai.jobs.v1";

function readLocal(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Job[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(jobs: Job[]) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(jobs));
  } catch {
    /* storage full or blocked — ignore */
  }
}

const SEED_JOBS: Job[] = [
  {
    id: "seed-1",
    title: "Senior Software Engineer",
    roleType: "Senior Software Engineer",
    countryCode: "DE",
    countryName: "Germany",
    city: "Berlin",
    companyName: "Nordlicht Technologies",
    companyLocation: "Friedrichstrasse 120, 10117 Berlin",
    companyWebsite: "",
    companyPhone: "+49 30 1234 5678",
    companyEmail: "careers@nordlicht.example",
    employmentType: "Full-time",
    workMode: "Hybrid",
    experienceLevel: "5-8 years",
    salary: "€70,000 – €95,000 / year",
    techStack: ["C#", ".NET", "ASP.NET Core", "Azure", "SQL"],
    skills: ["System design", "Code review", "Mentoring"],
    languages: ["English", "German"],
    relocation: true,
    relocationDetails:
      "Flight ticket, 4 weeks of temporary housing and visa support.",
    visaSponsorship: true,
    descriptionHtml:
      "<p><b>About the role</b></p><p>Lead backend services for our logistics platform and mentor a team of five engineers.</p><ul><li>Design scalable APIs</li><li>Own cloud deployments</li></ul>",
    questions: [
      "How many years have you worked with C# / .NET?",
      "What is your notice period?",
    ],
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "seed-2",
    title: "Full Stack Developer",
    roleType: "Full Stack Developer",
    countryCode: "CA",
    countryName: "Canada",
    city: "Toronto",
    companyName: "Maple & Pine Labs",
    companyLocation: "200 King St W, Toronto, ON",
    companyWebsite: "",
    companyPhone: "+1 416 555 0148",
    companyEmail: "jobs@maplepine.example",
    employmentType: "Full-time",
    workMode: "Remote",
    experienceLevel: "3-5 years",
    salary: "CAD 90,000 – 120,000 / year",
    techStack: ["Python", "Django", "React", "TypeScript", "PostgreSQL"],
    skills: ["REST APIs", "Testing", "Agile"],
    languages: ["English", "French"],
    relocation: false,
    relocationDetails: "",
    visaSponsorship: true,
    descriptionHtml:
      "<p><b>Build the next generation of our product.</b></p><p>You will work across the stack, from Django services to polished React interfaces.</p>",
    createdAt: "2026-10-05T09:00:00.000Z",
  },
  {
    id: "seed-3",
    title: "Frontend Developer",
    roleType: "Frontend Developer",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    city: "Dubai",
    companyName: "Falcon Digital",
    companyLocation: "Business Bay, Dubai",
    companyWebsite: "",
    companyPhone: "+971 4 555 0192",
    companyEmail: "hr@falcondigital.example",
    employmentType: "Full-time",
    workMode: "On-site",
    experienceLevel: "1-2 years",
    salary: "AED 14,000 – 20,000 / month",
    techStack: ["JavaScript", "React", "Next.js", "Java"],
    skills: ["Responsive design", "Animations", "Figma handoff"],
    languages: ["English", "Arabic", "Urdu"],
    relocation: true,
    relocationDetails:
      "Visa, flight ticket and one month accommodation provided.",
    visaSponsorship: true,
    descriptionHtml:
      "<p>Craft luxury, high-performance interfaces for premium clients across the Gulf.</p>",
    questions: ["Share one live project link you built with React or Next.js."],
    createdAt: "2026-10-08T09:00:00.000Z",
  },
  {
    id: "seed-4",
    title: "Frontend Developer",
    roleType: "Frontend Developer",
    countryCode: "PK",
    countryName: "Pakistan",
    city: "Karachi",
    companyName: "Indus Pixel Studio",
    companyLocation: "Clifton Block 5, Karachi",
    companyWebsite: "",
    companyPhone: "+92 21 3555 0100",
    companyEmail: "jobs@induspixel.example",
    employmentType: "Full-time",
    workMode: "On-site",
    experienceLevel: "1-2 years",
    salary: "PKR 120,000 – 180,000 / month",
    techStack: ["JavaScript", "TypeScript", "React", "Next.js"],
    skills: ["Tailwind CSS", "Responsive design"],
    languages: ["English", "Urdu"],
    relocation: false,
    relocationDetails: "",
    visaSponsorship: false,
    descriptionHtml:
      "<p><b>Local role, no visa needed.</b></p><p>Build modern storefronts and dashboards with a friendly in-house team.</p>",
    questions: [],
    createdAt: "2026-10-09T09:00:00.000Z",
  },
];

/** Built-in jobs (always available, no network needed) so pages render instantly. */
const ALL_SEED_JOBS: Job[] = [...GENERATED_JOBS, ...SEED_JOBS].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);

export function getSeedJobs(): Job[] {
  return ALL_SEED_JOBS;
}

/** Seed jobs + jobs saved in this browser. Synchronous, so it can be used for the first paint. */
export function getLocalJobs(): Job[] {
  return [...readLocal(), ...ALL_SEED_JOBS];
}

export async function listJobs(): Promise<Job[]> {
  let remote: Job[] = [];
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("data")
        .order("created_at", { ascending: false });
      if (!error && data) remote = data.map((r) => r.data as Job);
    } catch {
      /* fall through to local */
    }
  }
  const seen = new Set<string>();
  return [...readLocal(), ...remote, ...ALL_SEED_JOBS]
    .filter((j) => (seen.has(j.id) ? false : (seen.add(j.id), true)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getJob(id: string): Promise<Job | undefined> {
  // Built-in jobs resolve instantly, without waiting for the database.
  const builtIn = ALL_SEED_JOBS.find((j) => j.id === id);
  if (builtIn) return builtIn;
  const all = await listJobs();
  return all.find((j) => j.id === id);
}

export async function createJob(
  input: Omit<Job, "id" | "createdAt" | "userId">,
): Promise<Job> {
  const userId = await currentUserId();
  const job: Job = {
    ...input,
    descriptionHtml: sanitizeHtml(input.descriptionHtml),
    id: `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    userId,
  };
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("jobs")
        .insert({ id: job.id, data: job, user_id: userId ?? null });
      if (!error) return job;
    } catch {
      /* fall back to local */
    }
  }
  writeLocal([job, ...readLocal()]);
  return job;
}
