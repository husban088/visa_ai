"use client";

import { Application, ApplicationStatus, Booking, InterviewSlot, VisaTypeId } from "@/types";
import { getSupabase } from "@/lib/supabase";
import { currentUserId } from "@/lib/auth";

const KEY = "visaai_applications";

// ---------------------------------------------------------------------------
// localStorage backend (default — works with zero setup)
// ---------------------------------------------------------------------------

function readAll(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

function writeAll(apps: Application[]) {
  window.localStorage.setItem(KEY, JSON.stringify(apps));
}

// ---------------------------------------------------------------------------
// Supabase backend (used automatically once env vars are set — see
// supabase/schema.sql and README.md "Adding Supabase")
// ---------------------------------------------------------------------------

type Row = {
  id: string;
  country_code: string;
  visa_type: VisaTypeId;
  full_name: string;
  status: ApplicationStatus;
  documents: Application["documents"];
  interview_slot: InterviewSlot | null;
  score: number | null;
  decision_reason: string | null;
  interview_video_url: string | null;
  booking: Booking | null;
  user_id: string | null;
  created_at: string;
};

function fromRow(row: Row): Application {
  return {
    id: row.id,
    countryCode: row.country_code,
    visaType: row.visa_type,
    fullName: row.full_name,
    status: row.status,
    documents: row.documents ?? [],
    interviewSlot: row.interview_slot ?? undefined,
    score: row.score ?? undefined,
    decisionReason: row.decision_reason ?? undefined,
    interviewVideoUrl: row.interview_video_url ?? undefined,
    booking: row.booking ?? undefined,
    userId: row.user_id ?? undefined,
    createdAt: row.created_at,
  };
}

function toRow(app: Application): Row {
  return {
    id: app.id,
    country_code: app.countryCode,
    visa_type: app.visaType,
    full_name: app.fullName,
    status: app.status,
    documents: app.documents,
    interview_slot: app.interviewSlot ?? null,
    score: app.score ?? null,
    decision_reason: app.decisionReason ?? null,
    interview_video_url: app.interviewVideoUrl ?? null,
    booking: app.booking ?? null,
    user_id: app.userId ?? null,
    created_at: app.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Public API — every function is async so call sites don't need to care
// which backend is actually serving the data.
// ---------------------------------------------------------------------------

export async function createApplication(input: {
  countryCode: string;
  visaType: VisaTypeId;
  fullName: string;
}): Promise<Application> {
  const app: Application = {
    id: `VA-${Date.now().toString(36).toUpperCase()}`,
    countryCode: input.countryCode,
    visaType: input.visaType,
    fullName: input.fullName,
    status: "documents_pending",
    documents: [],
    userId: await currentUserId(),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("applications").insert(toRow(app));
    if (error) throw new Error(error.message);
    return app;
  }

  const apps = readAll();
  apps.unshift(app);
  writeAll(apps);
  return app;
}

export async function getApplication(id: string): Promise<Application | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return undefined;
    return fromRow(data as Row);
  }
  return readAll().find((a) => a.id === id);
}

export async function getLatestApplication(): Promise<Application | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    const userId = await currentUserId();
    let query = supabase.from("applications").select("*");
    // Signed in -> only ever return that person's own applications, which is
    // what makes "log in on another device and see your case" work.
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return undefined;
    return fromRow(data as Row);
  }
  return readAll()[0];
}

/** All applications belonging to the signed-in user (newest first). */
export async function listApplications(): Promise<Application[]> {
  const supabase = getSupabase();
  if (supabase) {
    const userId = await currentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(fromRow);
  }
  return readAll();
}

export async function updateApplication(
  id: string,
  patch: Partial<Application>
): Promise<Application | undefined> {
  const supabase = getSupabase();
  if (supabase) {
    const current = await getApplication(id);
    if (!current) return undefined;
    const merged = { ...current, ...patch };
    const { error } = await supabase.from("applications").update(toRow(merged)).eq("id", id);
    if (error) throw new Error(error.message);
    return merged;
  }

  const apps = readAll();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  apps[idx] = { ...apps[idx], ...patch };
  writeAll(apps);
  return apps[idx];
}

export async function addDocument(id: string, doc: { name: string; url: string }) {
  const app = await getApplication(id);
  if (!app) return;
  const documents = [...app.documents, { ...doc, uploadedAt: new Date().toISOString() }];
  return updateApplication(id, { documents });
}

/** Deterministic-ish next available slot: tomorrow, on the hour, business hours. */
export function nextInterviewSlot(): InterviewSlot {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const hour = 10 + (d.getMinutes() % 7); // 10am - 4pm spread
  d.setHours(hour, 0, 0, 0);
  return {
    date: d.toISOString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export async function setStatus(id: string, status: ApplicationStatus) {
  return updateApplication(id, { status });
}
