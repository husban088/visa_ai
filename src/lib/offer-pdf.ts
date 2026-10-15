"use client";

import { jsPDF } from "jspdf";
import type { OfferLetter } from "@/lib/offers";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Builds the luxury-styled DEMO offer letter as a PDF blob. */
export function buildOfferPdf(offer: OfferLetter): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // paper
  doc.setFillColor(253, 250, 244);
  doc.rect(0, 0, W, H, "F");

  // gold double border
  doc.setDrawColor(176, 138, 52);
  doc.setLineWidth(0.9);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.25);
  doc.rect(11, 11, W - 22, H - 22);

  // diagonal demo watermark
  doc.saveGraphicsState();
  try {
    doc.setGState(
      new (jsPDF as unknown as { GState: new (o: object) => unknown }).GState({
        opacity: 0.07,
      }),
    );
  } catch {
    /* older jsPDF */
  }
  doc.setTextColor(120, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(64);
  doc.text("DEMO", W / 2, H / 2, { angle: 35, align: "center" });
  doc.restoreGraphicsState();

  // letterhead
  doc.setTextColor(30, 20, 20);
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text(offer.companyName.toUpperCase(), W / 2, 30, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110, 95, 90);
  doc.text(
    `${offer.companyLocation}  ·  ${offer.companyEmail}  ·  ${offer.companyPhone}`,
    W / 2,
    36,
    { align: "center", maxWidth: W - 40 },
  );
  doc.setDrawColor(176, 138, 52);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 25, 41, W / 2 + 25, 41);

  // title
  doc.setTextColor(150, 25, 25);
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.text("Letter of Employment", W / 2, 52, { align: "center" });
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 20, 20);
  doc.text("OFFER OF EMPLOYMENT", W / 2, 61, { align: "center" });

  // meta
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 95, 90);
  doc.text(`Ref: ${offer.id}`, 20, 74);
  doc.text(`Date: ${fmt(offer.issuedAt)}`, W - 20, 74, { align: "right" });

  // salutation + body
  let y = 86;
  doc.setTextColor(30, 20, 20);
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text(`Dear ${offer.applicantName},`, 20, y);
  y += 9;

  const intro =
    `On behalf of ${offer.companyName}, we are delighted to offer you the position of ` +
    `${offer.jobTitle} at our ${offer.city ? offer.city + ", " : ""}${offer.countryName} office. ` +
    `Our AI hiring assistant reviewed your CV, answers and portfolio and scored your profile ` +
    `${offer.aiScore}/100 against this role — we were impressed and would love to have you on the team.`;
  const introLines = doc.splitTextToSize(intro, W - 40);
  doc.text(introLines, 20, y);
  y += introLines.length * 6 + 6;

  // terms box
  doc.setFillColor(247, 240, 225);
  doc.setDrawColor(210, 190, 140);
  doc.setLineWidth(0.3);
  const rows: [string, string][] = [
    ["Position", offer.jobTitle],
    ["Employment", `${offer.employmentType} · ${offer.workMode}`],
    ["Location", `${offer.city ? offer.city + ", " : ""}${offer.countryName}`],
    ["Compensation", offer.salary],
    ["Start date", fmt(offer.startDate)],
    ["Probation", `${offer.probationMonths} months`],
    [
      "Visa",
      offer.visaSponsorship
        ? "Company-sponsored work visa"
        : "Work visa support provided",
    ],
  ];
  const boxH = rows.length * 8 + 8;
  doc.roundedRect(20, y, W - 40, boxH, 2, 2, "FD");
  let ry = y + 9;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(150, 25, 25);
    doc.text(k.toUpperCase(), 26, ry);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 20, 20);
    doc.text(v, 66, ry, { maxWidth: W - 100 });
    ry += 8;
  });
  y += boxH + 9;

  // benefits
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("Benefits", 20, y);
  y += 6;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  offer.benefits.slice(0, 6).forEach((b) => {
    const lines = doc.splitTextToSize(`•  ${b}`, W - 46);
    doc.text(lines, 24, y);
    y += lines.length * 5.4 + 1;
  });
  y += 4;

  const closing =
    "This offer is accepted automatically on your behalf by the VisaAI assistant. " +
    "You can now begin your work-visa process directly from your VisaAI dashboard.";
  const closeLines = doc.splitTextToSize(closing, W - 40);
  doc.setFont("times", "italic");
  doc.text(closeLines, 20, y);
  y += closeLines.length * 5.6 + 12;

  // signature block
  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.setTextColor(60, 30, 30);
  doc.text("AI Hiring Desk", 20, y);
  doc.setDrawColor(120, 100, 90);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 80, y + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110, 95, 90);
  doc.text(`Talent Acquisition · ${offer.companyName}`, 20, y + 7);

  // seal
  const sx = W - 42;
  const sy = y - 2;
  doc.setDrawColor(176, 138, 52);
  doc.setLineWidth(0.8);
  doc.circle(sx, sy, 13);
  doc.setLineWidth(0.25);
  doc.circle(sx, sy, 10.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(150, 25, 25);
  doc.text("OFFER", sx, sy - 1, { align: "center" });
  doc.text("ACCEPTED", sx, sy + 3, { align: "center" });

  // footer disclaimer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(150, 30, 30);
  doc.text(
    "Demo document generated by AI for the VisaAI portfolio project — not a real offer and not valid for any official use.",
    W / 2,
    H - 15,
    { align: "center", maxWidth: W - 40 },
  );

  return doc.output("blob");
}

export function downloadOfferPdf(offer: OfferLetter) {
  const blob = buildOfferPdf(offer);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `offer-letter-${offer.companyName
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
