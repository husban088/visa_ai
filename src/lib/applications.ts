import { getSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/auth";
import type { ScreeningResult } from "@/lib/screening";

export interface StoredFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  /** "yes" | "no" | "" ("" = question was not asked for this job) */
  readyToRelocate: "yes" | "no" | "";
  answers: { question: string; answer: string }[];
  cv: StoredFile;
  coverLetter: StoredFile | null;
  /** AI screening report (score vs. the job), filled in after submitting. */
  screening?: ScreeningResult;
  createdAt: string;
  userId?: string;
}

export const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB per file
export const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Validates a picked file and converts it to a storable data-URL object. */
export function fileToStored(file: File): Promise<StoredFile> {
  return new Promise((resolve, reject) => {
    const lower = file.name.toLowerCase();
    if (!ALLOWED_EXT.some((e) => lower.endsWith(e))) {
      reject(new Error("Only PDF, DOC or DOCX files are allowed."));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error("File is too large. Maximum size is 2 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("Could not read the file. Please try again."));
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: String(reader.result),
      });
    reader.readAsDataURL(file);
  });
}

/** Triggers a browser download for a stored file. */
export async function downloadStored(file: StoredFile): Promise<void> {
  const blob = await (await fetch(file.dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Storage: Supabase when configured, else localStorage ---------- */
const LS_KEY = "visaai.applications.v1";

function readLocal(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

export async function submitApplication(
  input: Omit<Application, "id" | "createdAt" | "userId">,
): Promise<Application> {
  const userId = await currentUserId();
  const app: Application = {
    ...input,
    id: `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    userId,
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from("applications").insert({
        id: app.id,
        job_id: app.jobId,
        data: app,
        user_id: userId ?? null,
      });
      if (!error) return app;
    } catch {
      /* fall back to local */
    }
  }

  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify([app, ...readLocal()]));
  } catch {
    throw new Error(
      "Browser storage is full. Please use smaller files (under 1 MB) or run the applications SQL in Supabase.",
    );
  }
  return app;
}

/** Saves the AI screening report onto an already-submitted application (device storage). */
export function attachScreening(
  appId: string,
  screening: ScreeningResult,
): void {
  try {
    const list = readLocal();
    const idx = list.findIndex((a) => a.id === appId);
    if (idx === -1) return;
    list[idx] = { ...list[idx], screening };
    window.localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    /* non-critical — the report is still shown on screen */
  }
}
