"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";
import { generateDemoDocument } from "@/lib/demo-documents";
import type { OfferLetter } from "@/lib/offers";

export interface ReadyDoc {
  name: string;
  url: string;
  /** Always true here — every document is an AI-generated, watermarked sample. */
  isSample?: boolean;
}

type Status = "idle" | "generating" | "ready" | "error";

/**
 * Every required document is generated automatically (clearly watermarked
 * "SAMPLE") the moment the applicant's name is known — there is no real
 * upload step. Documents are auto-verified by VisaAI, so this card's only
 * job is to let the applicant download a copy of what was generated.
 */
export function DocumentDownloader({
  label,
  fullName,
  countryName,
  visaTypeName,
  offer,
  onReady,
}: {
  label: string;
  fullName?: string;
  countryName?: string;
  visaTypeName?: string;
  offer?: OfferLetter;
  onReady: (doc: ReadyDoc) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const blobRef = useRef<Blob | null>(null);
  const generatedOnce = useRef(false);

  function generate() {
    if (!fullName) return;
    setStatus("generating");
    setError("");
    try {
      const { blob, fileName: name } = generateDemoDocument(
        label,
        fullName,
        countryName || "the destination country",
        visaTypeName || "",
        offer,
      );
      blobRef.current = blob;
      setFileName(name);
      setStatus("ready");
      onReady({ name: label, url: URL.createObjectURL(blob), isSample: true });
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate this document.",
      );
    }
  }

  // Auto-generate the moment we know the applicant's name — no click needed.
  useEffect(() => {
    if (fullName && !generatedOnce.current) {
      generatedOnce.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, label]);

  function handleDownload() {
    if (!blobRef.current) return;
    const url = URL.createObjectURL(blobRef.current);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `${label}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="rounded-xl border border-ink-3 bg-ink-2/50 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--foreground)]">{label}</p>
        {status === "ready" && <CheckCircle2 className="h-4 w-4 text-gold" />}
        {status === "generating" && (
          <Loader2 className="h-4 w-4 animate-spin text-mist" />
        )}
        {status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
      </div>

      {status === "generating" && (
        <p className="mt-3 text-xs text-mist">
          AI is creating & uploading this document…
        </p>
      )}

      {status === "ready" && (
        <>
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-ink-3 bg-ink-3/30 px-3 py-2">
            <span className="truncate text-xs text-mist">{fileName}</span>
            <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">
              Auto-uploaded
            </span>
          </div>

          <button
            onClick={handleDownload}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-3 py-3 text-xs text-mist transition-colors hover:border-gold hover:text-gold-bright"
          >
            <FileDown className="h-4 w-4" />
            Download this document
          </button>

          <button
            onClick={generate}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-steel hover:text-gold-bright"
          >
            <RefreshCcw className="h-3 w-3" /> Regenerate sample
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <p className="mt-2 text-xs text-red-400">{error}</p>
          <button
            onClick={generate}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink-3 py-3 text-xs text-mist transition-colors hover:border-gold hover:text-gold-bright"
          >
            <RefreshCcw className="h-4 w-4" /> Try again
          </button>
        </>
      )}
    </div>
  );
}
