"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Landmark } from "@/components/Landmarks";
import { getApplication, getLatestApplication } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getCountry } from "@/lib/countries";
import { getVisaType } from "@/lib/visa-types";
import { Application } from "@/types";
import { CheckCircle2, Circle, Clock, PlaneTakeoff, PlayCircle, XCircle } from "lucide-react";

const statusOrder: Application["status"][] = [
  "documents_pending",
  "interview_scheduled",
  "interview_completed",
  "approved",
];

const statusLabel: Record<Application["status"], string> = {
  documents_pending: "Documents received",
  interview_scheduled: "Interview scheduled",
  interview_completed: "Interview completed",
  approved: "Visa approved",
  rejected: "Visa rejected",
};

export default function DashboardPage() {
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const { user, loading: authLoading, enabled: authEnabled } = useAuth();

  useEffect(() => {
    // Wait for the session before deciding, otherwise a signed-in user on a new
    // device would briefly be told they have no application.
    if (authLoading) return;

    (async () => {
      const id = localStorage.getItem("visaai_active_id");
      if (id) {
        const found = await getApplication(id);
        if (found) {
          setApp(found);
          return;
        }
      }

      // Signed in? Pull this account's most recent application — this is what
      // makes the case reachable from a second device.
      if (user) {
        const latest = await getLatestApplication();
        if (latest) {
          localStorage.setItem("visaai_active_id", latest.id);
          setApp(latest);
          return;
        }
      }

      setApp(null);
    })();
  }, [user, authLoading]);

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl text-[var(--foreground)] md:text-4xl">
          Your application
        </h1>

        {app === undefined && <p className="mt-6 text-sm text-mist">Loading…</p>}

        {app === null && (
          <div className="mt-8 rounded-2xl border border-ink-3 bg-ink-2/40 p-10 text-center">
            <p className="text-sm text-mist">
              No application found on this device yet.
            </p>
            {authEnabled && !user && (
              <p className="mx-auto mt-3 max-w-sm text-xs text-steel">
                Already applied on another device?{" "}
                <Link href="/login" className="text-mist underline underline-offset-4 hover:text-gold-bright">
                  Sign in
                </Link>{" "}
                to load your case here.
              </p>
            )}
            <Link
              href="/apply"
              className="mt-5 inline-block rounded-full bg-gradient-brand px-6 py-3 text-sm font-medium text-white"
            >
              Start an application
            </Link>
          </div>
        )}

        {app && <ApplicationView app={app} />}
      </main>
      <Footer />
    </>
  );
}

function ApplicationView({ app }: { app: Application }) {
  const country = getCountry(app.countryCode);
  const visaType = getVisaType(app.visaType);
  const rejected = app.status === "rejected";
  const currentIndex = rejected ? -1 : statusOrder.indexOf(app.status);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
        {country && <Landmark id={country.landmark} className="h-10 w-10 text-gold" />}
        <div>
          <p className="text-[var(--foreground)]">{app.fullName}</p>
          <p className="text-xs text-steel">
            {visaType?.name} · {country?.flag} {country?.name} · Ref {app.id}
          </p>
        </div>
      </div>

      <ol className="mt-8 space-y-5">
        {rejected ? (
          <li className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm text-[var(--foreground)]">Visa rejected</p>
              {app.decisionReason && (
                <p className="mt-1 text-xs text-mist">{app.decisionReason}</p>
              )}
            </div>
          </li>
        ) : (
          statusOrder.map((s, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <li key={s} className="flex items-start gap-3">
                {done || active ? (
                  <CheckCircle2 className={`mt-0.5 h-5 w-5 ${done ? "text-gold" : "text-gold-bright"}`} />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 text-ink-3" />
                )}
                <div>
                  <p className={`text-sm ${done || active ? "text-[var(--foreground)]" : "text-steel"}`}>
                    {statusLabel[s]}
                  </p>
                  {s === "interview_scheduled" && app.interviewSlot && active && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gold-bright">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(app.interviewSlot.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · {app.interviewSlot.time}
                    </p>
                  )}
                  {s === "approved" && active && app.decisionReason && (
                    <p className="mt-1 text-xs text-mist">{app.decisionReason}</p>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ol>

      {app.interviewVideoUrl && (
        <a
          href={app.interviewVideoUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm text-mist underline decoration-ink-3 underline-offset-4 transition-colors hover:text-gold-bright hover:decoration-gold-bright"
        >
          <PlayCircle className="h-4 w-4" /> Watch your interview recording
        </a>
      )}

      <div className="mt-10">
        {app.status === "interview_scheduled" && (
          <Link
            href="/interview"
            className="inline-block rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white"
          >
            Begin AI interview
          </Link>
        )}
        {app.status === "approved" && (
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/ticket"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white"
            >
              <PlaneTakeoff className="h-4 w-4" />
              {app.booking ? "View boarding pass" : "Book your flight"}
            </Link>
            {app.booking && (
              <p className="text-xs text-steel">
                {app.booking.offer.carrier} ·{" "}
                {app.booking.offer.segments[0]?.origin} →{" "}
                {app.booking.offer.segments[app.booking.offer.segments.length - 1]?.destination} ·
                PNR {app.booking.bookingReference}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
