"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSupabase } from "@/lib/supabase";
import { updatePassword } from "@/lib/auth";
import { Loader2, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The emailed link lands here with a recovery session already attached by
  // the auth client (it reads the token out of the URL automatically).
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      Promise.resolve().then(() => setReady(true));
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setValidLink(Boolean(data.session));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setValidLink(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const passwordsMatch = password === confirmPassword;
  const canSubmit = validLink && !busy && password.length >= 6 && passwordsMatch;

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => router.push("/profile"), 1800);
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
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Applicant portal</p>
          <h1 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-4xl">
            Set a new password
          </h1>

          <div className="mt-8 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
            {!ready ? (
              <p className="flex items-center gap-2 text-sm text-mist">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking your link...
              </p>
            ) : done ? (
              <p className="flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-3 text-sm text-gold-bright">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Password updated. Taking you to your profile...
              </p>
            ) : !validLink ? (
              <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                This link has expired or was already used. Request a new one
                from the{" "}
                <Link href="/forgot-password" className="underline underline-offset-4">
                  forgot password
                </Link>{" "}
                page.
              </p>
            ) : (
              <>
                <label className="block text-sm text-[var(--foreground)]">
                  New password
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-3 bg-ink px-4 focus-within:border-gold">
                    <Lock className="h-4 w-4 shrink-0 text-steel" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                    />
                  </div>
                </label>

                <label className="mt-4 block text-sm text-[var(--foreground)]">
                  Confirm new password
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg border bg-ink px-4 focus-within:border-gold ${
                      confirmPassword && !passwordsMatch ? "border-red-500/50" : "border-ink-3"
                    }`}
                  >
                    <Lock className="h-4 w-4 shrink-0 text-steel" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && canSubmit) handleSubmit();
                      }}
                      className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <span className="mt-1.5 block text-[11px] text-red-300">Passwords don&apos;t match.</span>
                  )}
                </label>

                {error && (
                  <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update password
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
