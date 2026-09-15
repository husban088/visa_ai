"use client";

import { jsPDF } from "jspdf";

/**
 * Generates fully synthetic, clearly-labeled sample documents client-side.
 *
 * IMPORTANT: This never touches a real passport, bank record, or certificate.
 * Every value below is fabricated for demo purposes and every page carries a
 * visible "SAMPLE / SYNTHETIC" watermark + footer disclaimer, so it can never
 * be mistaken for (or misused as) a real document.
 */

export interface DemoDocResult {
  blob: Blob;
  fileName: string;
}

// ---- tiny deterministic PRNG so the same name+doc always looks the same ----
function seedFromString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad(n: number, len: number) {
  return String(Math.floor(n)).padStart(len, "0");
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ---- shared page chrome: header, watermark, footer disclaimer ----
function addChrome(doc: jsPDF, title: string) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // diagonal watermark
  doc.saveGraphicsState();
  try {
    // GState opacity — supported by jsPDF; wrapped in try in case of version drift
    doc.setGState(new (jsPDF as unknown as { GState: new (o: object) => unknown }).GState({ opacity: 0.12 }));
  } catch {
    /* older jsPDF without GState — watermark still shows via light gray text */
  }
  doc.setTextColor(180, 30, 30);
  doc.setFontSize(46);
  doc.text("SAMPLE DOCUMENT", w / 2, h / 2, { angle: 35, align: "center" });
  doc.restoreGraphicsState();

  // header bar
  doc.setFillColor(17, 17, 20);
  doc.rect(0, 0, w, 18, "F");
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(11);
  doc.text("VisaAI", 10, 12);
  doc.setTextColor(230, 230, 230);
  doc.setFontSize(9);
  doc.text(title, w - 10, 12, { align: "right" });

  // footer disclaimer
  doc.setTextColor(150, 30, 30);
  doc.setFontSize(8);
  doc.text(
    "This is a synthetically generated demo file for the VisaAI portfolio project — no real personal, financial, or government data. Not valid for any official use.",
    w / 2,
    h - 8,
    { align: "center", maxWidth: w - 20 }
  );

  doc.setTextColor(20, 20, 20);
}

interface GenCtx {
  fullName: string;
  countryName: string;
  visaTypeName: string;
  rand: () => number;
}

function passportDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Passport — Bio Page (Sample)");
  const { fullName, rand } = ctx;
  const [given, ...rest] = fullName.split(" ");
  const surname = rest.length ? rest[rest.length - 1] : "APPLICANT";
  const dob = new Date(1985 + Math.floor(rand() * 15), Math.floor(rand() * 12), 1 + Math.floor(rand() * 27));
  const issue = new Date(2022, 0, 1);
  const expiry = new Date(2032, 0, 1);
  const num = `P${pad(rand() * 1e7, 7)}`;

  let y = 34;
  doc.setFontSize(14);
  doc.text("PASSPORT — SPECIMEN", 14, y);
  y += 12;
  doc.setFontSize(10);
  const rows: [string, string][] = [
    ["Surname", surname.toUpperCase()],
    ["Given Name(s)", given.toUpperCase()],
    ["Passport No.", num],
    ["Nationality", "SPECIMEN / DEMO"],
    ["Date of Birth", fmtDate(dob)],
    ["Sex", rand() > 0.5 ? "M" : "F"],
    ["Date of Issue", fmtDate(issue)],
    ["Date of Expiry", fmtDate(expiry)],
    ["Authority", "VisaAI Demo Authority"],
  ];
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 70, y);
    y += 9;
  });
  doc.setDrawColor(180);
  doc.rect(150, 30, 40, 50); // photo placeholder box
  doc.setFontSize(8);
  doc.text("PHOTO\n(placeholder)", 170, 55, { align: "center" });
  return doc;
}

function bankStatementDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Bank Statement (Sample)");
  const { fullName, rand } = ctx;
  let balance = 4000 + Math.floor(rand() * 12000);
  const acct = pad(rand() * 1e8, 8);

  let y = 32;
  doc.setFontSize(13);
  doc.text("VisaAI Demo Bank — Account Statement", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Account Holder: ${fullName}`, 14, y);
  y += 7;
  doc.text(`Account No.: ${acct}`, 14, y);
  y += 7;
  doc.text(`Statement Period: Last 3 months`, 14, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Date", 14, y);
  doc.text("Description", 50, y);
  doc.text("Amount", 130, y);
  doc.text("Balance", 165, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.setDrawColor(200);
  doc.line(14, y - 4, 196, y - 4);

  const descriptions = ["Salary credit", "Rent payment", "Utility bill", "Grocery spend", "Transfer in", "ATM withdrawal"];
  const today = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (8 - i) * 4);
    const desc = descriptions[Math.floor(rand() * descriptions.length)];
    const isCredit = rand() > 0.45;
    const amt = Math.round((100 + rand() * 900) * (isCredit ? 1 : -1));
    balance += amt;
    doc.text(fmtDate(d), 14, y);
    doc.text(desc, 50, y);
    doc.text(`${amt > 0 ? "+" : ""}${amt}`, 130, y);
    doc.text(`${balance}`, 165, y);
    y += 8;
  }
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Closing Balance: ${balance} (demo currency units)`, 14, y);
  return doc;
}

function offerLetterDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  const isWork = /work|employment/i.test(ctx.visaTypeName);
  addChrome(doc, isWork ? "Employment Offer Letter (Sample)" : "Admission Offer Letter (Sample)");
  const { fullName, countryName, rand } = ctx;
  const date = new Date();
  let y = 34;
  doc.setFontSize(11);
  doc.text(fmtDate(date), 14, y);
  y += 14;
  doc.text(`Dear ${fullName},`, 14, y);
  y += 12;

  const body = isWork
    ? `We are pleased to offer you the position of Software Engineer at Demo Corp ${countryName}, ` +
      `starting on ${fmtDate(new Date(date.getFullYear(), date.getMonth() + 2, 1))}. This is a full-time role ` +
      `with an annual salary of ${20000 + Math.floor(rand() * 40000)} (demo currency units). This letter is a ` +
      `synthetic sample generated for demonstration of the VisaAI application flow only.`
    : `We are pleased to offer you admission into the Master of Science program at Demo University, ` +
      `${countryName}, commencing ${fmtDate(new Date(date.getFullYear(), date.getMonth() + 6, 1))}. Tuition for ` +
      `the program is ${8000 + Math.floor(rand() * 15000)} (demo currency units) per year. This letter is a ` +
      `synthetic sample generated for demonstration of the VisaAI application flow only.`;

  doc.setFontSize(10);
  const lines = doc.splitTextToSize(body, 180);
  doc.text(lines, 14, y);
  y += lines.length * 6 + 14;
  doc.text("Sincerely,", 14, y);
  y += 8;
  doc.text(isWork ? "Demo Corp HR Team" : "Demo University Admissions Office", 14, y);
  return doc;
}

function transcriptDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Academic Transcript (Sample)");
  const { fullName, rand } = ctx;
  let y = 32;
  doc.setFontSize(13);
  doc.text("Demo University — Official Transcript (Specimen)", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Student: ${fullName}`, 14, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("Course", 14, y);
  doc.text("Grade", 130, y);
  doc.text("Credits", 165, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.line(14, y - 4, 196, y - 4);

  const courses = ["Mathematics", "Computer Science", "Physics", "English Composition", "Statistics", "Economics"];
  const grades = ["A", "A-", "B+", "B", "A"];
  courses.forEach((c) => {
    doc.text(c, 14, y);
    doc.text(grades[Math.floor(rand() * grades.length)], 130, y);
    doc.text(String(3 + Math.floor(rand() * 2)), 165, y);
    y += 8;
  });
  y += 6;
  doc.text(`Overall GPA: ${(3 + rand()).toFixed(2)} / 4.00`, 14, y);
  return doc;
}

function marriageCertDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Marriage Certificate (Sample)");
  const { fullName, rand } = ctx;
  const date = new Date(2015 + Math.floor(rand() * 8), Math.floor(rand() * 12), 1 + Math.floor(rand() * 27));
  let y = 40;
  doc.setFontSize(14);
  doc.text("CERTIFICATE OF MARRIAGE — SPECIMEN", 105, y, { align: "center" });
  y += 20;
  doc.setFontSize(10);
  doc.text(`This is to certify that ${fullName}`, 14, y);
  y += 8;
  doc.text(`and Demo Spouse Name were lawfully married on ${fmtDate(date)}.`, 14, y);
  y += 8;
  doc.text(`Registration No.: MC-${pad(rand() * 1e6, 6)}`, 14, y);
  return doc;
}

function residencyProofDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Spouse Residency Proof (Sample)");
  const { countryName, rand } = ctx;
  let y = 40;
  doc.setFontSize(13);
  doc.text("Residency / Citizenship Confirmation — Specimen", 14, y);
  y += 12;
  doc.setFontSize(10);
  doc.text(`This confirms Demo Spouse Name holds legal residency status in ${countryName},`, 14, y);
  y += 8;
  doc.text(`under permit number RS-${pad(rand() * 1e6, 6)}, valid through 2030.`, 14, y);
  return doc;
}

function relationshipEvidenceDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Relationship Evidence Summary (Sample)");
  const { fullName } = ctx;
  let y = 40;
  doc.setFontSize(12);
  doc.text("Joint Photographs / Correspondence — Specimen Summary", 14, y);
  y += 12;
  doc.setFontSize(10);
  const body =
    `This placeholder stands in for photo/correspondence evidence, since this demo generates ` +
    `text documents only. It lists sample items ${fullName} would typically attach: dated joint photos, ` +
    `shared travel bookings, and message screenshots spanning the relationship.`;
  doc.text(doc.splitTextToSize(body, 180), 14, y);
  return doc;
}

function employmentContractDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Employment Contract (Sample)");
  const { fullName, countryName, rand } = ctx;
  let y = 34;
  doc.setFontSize(13);
  doc.text("Employment Contract — Specimen", 14, y);
  y += 12;
  doc.setFontSize(10);
  const body =
    `This agreement is entered into between Demo Corp (${countryName}) and ${fullName} for the role of ` +
    `Software Engineer, effective from the visa approval date. Annual compensation: ${25000 + Math.floor(rand() * 35000)} ` +
    `(demo currency units). Contract term: 2 years, renewable. This document is fabricated for demonstration only.`;
  doc.text(doc.splitTextToSize(body, 180), 14, y);
  return doc;
}

function certificateDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Educational / Trade Certificate (Sample)");
  const { fullName, rand } = ctx;
  let y = 46;
  doc.setFontSize(16);
  doc.text("CERTIFICATE OF COMPLETION — SPECIMEN", 105, y, { align: "center" });
  y += 16;
  doc.setFontSize(11);
  doc.text(`This certifies that ${fullName} has completed the required`, 105, y, { align: "center" });
  y += 8;
  doc.text("training / trade program (demo).", 105, y, { align: "center" });
  y += 12;
  doc.setFontSize(9);
  doc.text(`Certificate No.: EDU-${pad(rand() * 1e6, 6)}`, 105, y, { align: "center" });
  return doc;
}

function policeClearanceDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Police Clearance Certificate (Sample)");
  const { fullName, rand } = ctx;
  let y = 40;
  doc.setFontSize(13);
  doc.text("Police Clearance Certificate — Specimen", 14, y);
  y += 12;
  doc.setFontSize(10);
  doc.text(`This certifies that ${fullName} has no record of criminal conviction`, 14, y);
  y += 8;
  doc.text(`on file, as of the date of issue. Reference No.: PCC-${pad(rand() * 1e6, 6)}.`, 14, y);
  return doc;
}

function flightIntentDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Return Flight Intent (Sample)");
  const { fullName, countryName, rand } = ctx;
  const dep = new Date();
  dep.setDate(dep.getDate() + 14);
  const ret = new Date(dep);
  ret.setDate(ret.getDate() + 10);
  let y = 34;
  doc.setFontSize(12);
  doc.text("Round-Trip Flight Reservation — Specimen", 14, y);
  y += 12;
  doc.setFontSize(10);
  doc.text(`Passenger: ${fullName}`, 14, y);
  y += 8;
  doc.text(`Outbound: ${fmtDate(dep)} → ${countryName}, Flight DM${100 + Math.floor(rand() * 800)}`, 14, y);
  y += 8;
  doc.text(`Return: ${fmtDate(ret)} → Home Country, Flight DM${100 + Math.floor(rand() * 800)}`, 14, y);
  return doc;
}

function hotelBookingDoc(ctx: GenCtx): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, "Hotel / Invitation Letter (Sample)");
  const { fullName, countryName, rand } = ctx;
  let y = 34;
  doc.setFontSize(12);
  doc.text("Hotel Booking Confirmation — Specimen", 14, y);
  y += 12;
  doc.setFontSize(10);
  doc.text(`Guest: ${fullName}`, 14, y);
  y += 8;
  doc.text(`Hotel: Demo Grand Hotel, ${countryName}`, 14, y);
  y += 8;
  doc.text(`Confirmation No.: HB-${pad(rand() * 1e6, 6)}`, 14, y);
  return doc;
}

function genericDoc(ctx: GenCtx, label: string): jsPDF {
  const doc = new jsPDF();
  addChrome(doc, `${label} (Sample)`);
  const { fullName } = ctx;
  let y = 40;
  doc.setFontSize(12);
  doc.text(`${label} — Specimen Document`, 14, y);
  y += 12;
  doc.setFontSize(10);
  doc.text(`Prepared for: ${fullName}`, 14, y);
  y += 8;
  doc.text("This is a synthetic placeholder generated to demonstrate the upload step.", 14, y);
  return doc;
}

function buildDoc(label: string, ctx: GenCtx): jsPDF {
  const l = label.toLowerCase();
  if (l.includes("passport")) return passportDoc(ctx);
  if (l.includes("bank statement")) return bankStatementDoc(ctx);
  if (l.includes("employment contract")) return employmentContractDoc(ctx);
  if (l.includes("admission") || l.includes("offer letter")) return offerLetterDoc(ctx);
  if (l.includes("transcript")) return transcriptDoc(ctx);
  if (l.includes("marriage certificate")) return marriageCertDoc(ctx);
  if (l.includes("residency") || l.includes("citizenship")) return residencyProofDoc(ctx);
  if (l.includes("photograph") || l.includes("correspondence")) return relationshipEvidenceDoc(ctx);
  if (l.includes("trade certificate") || l.includes("educational")) return certificateDoc(ctx);
  if (l.includes("police clearance")) return policeClearanceDoc(ctx);
  if (l.includes("return flight")) return flightIntentDoc(ctx);
  if (l.includes("hotel") || l.includes("invitation")) return hotelBookingDoc(ctx);
  return genericDoc(ctx, label);
}

/**
 * Generate a synthetic sample PDF for a given required-document label.
 * Deterministic per (fullName + label) so re-visiting the step looks stable.
 */
export function generateDemoDocument(
  label: string,
  fullName: string,
  countryName: string,
  visaTypeName: string
): DemoDocResult {
  const rand = mulberry32(seedFromString(`${fullName}::${label}`));
  const doc = buildDoc(label, { fullName, countryName, visaTypeName, rand });
  const blob = doc.output("blob");
  const safeLabel = label.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return { blob, fileName: `sample-${safeLabel}.pdf` };
}
