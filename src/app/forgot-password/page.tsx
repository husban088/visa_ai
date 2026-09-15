"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { isAuthEnabled, sendPasswordResetEmail } from "@/lib/auth";
import { Loader2, Mail, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const enabled = isAuthEnabled();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!enabled || !email || busy) return;
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-gold-bright"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>

          <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-gold">Applicant portal</p>
          <h1 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-4xl">
            Reset your password
          </h1>
          <p className="mt-3 text-sm text-mist">
            Enter the email on your account and we&apos;ll send you a link to
            set a new password.
          </p>

          {!enabled && (
            <p className="mt-6 flex items-start gap-2 rounded-xl border border-ink-3 bg-ink-2/60 px-4 py-3 text-xs text-steel">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Accounts aren&apos;t set up on this deployment yet.
            </p>
          )}

          <div className="mt-8 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
            {sent ? (
              <p className="flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-3 text-sm text-gold-bright">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                If an account exists for {email}, a reset link is on its way.
                Check your inbox (and spam folder).
              </p>
            ) : (
              <>
                <label className="block text-sm text-[var(--foreground)]">
                  Email
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-3 bg-ink px-4 focus-within:border-gold">
                    <Mail className="h-4 w-4 shrink-0 text-steel" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={!enabled}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && enabled && email) handleSubmit();
                      }}
                      className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                    />
                  </div>
                </label>

                {error && (
                  <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!enabled || busy || !email}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
              </>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
