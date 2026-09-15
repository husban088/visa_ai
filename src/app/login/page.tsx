"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { isAuthEnabled, signIn, signUp } from "@/lib/auth";
import { Loader2, Mail, Lock, AlertTriangle, CheckCircle2, ShieldCheck, UserRound } from "lucide-react";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const enabled = isAuthEnabled();
  const [mode, setMode] = useState<Mode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const passwordsMatch = mode === "signin" || password === confirmPassword;
  const canSubmit =
    enabled &&
    !busy &&
    Boolean(email) &&
    password.length >= 6 &&
    (mode === "signin" || (Boolean(fullName.trim()) && confirmPassword.length >= 6 && passwordsMatch));

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords don't match.");
          return;
        }
        const { needsEmailConfirmation } = await signUp(email, password, fullName.trim());
        if (needsEmailConfirmation) {
          setMessage(
            "Account created. Check your inbox for the confirmation link, then sign in."
          );
          setMode("signin");
          return;
        }
      } else {
        await signIn(email, password);
      }
      router.push("/dashboard");
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
            {mode === "signin" ? "Sign in to your case" : "Create your account"}
          </h1>
          <p className="mt-3 text-sm text-mist">
            Signing in links your application to your account, so you can open it
            from any device — phone, laptop, or a friend&apos;s computer.
          </p>

          {!enabled && (
            <p className="mt-6 flex items-start gap-2 rounded-xl border border-ink-3 bg-ink-2/60 px-4 py-3 text-xs text-steel">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Accounts aren&apos;t set up on this deployment yet. The app still
              works — your application is stored in this browser only. See
              SETUP.md to enable sign-in.
            </p>
          )}

          <div className="mt-8 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-ink-3 p-1">
              {(["signin", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError(null);
                    setMessage(null);
                  }}
                  className={`rounded-full px-4 py-2 text-xs transition-colors ${
                    mode === m ? "bg-gold text-ink" : "text-mist hover:text-gold-bright"
                  }`}
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {mode === "signup" && (
              <label className="block text-sm text-[var(--foreground)]">
                Full name
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-3 bg-ink px-4 focus-within:border-gold">
                  <UserRound className="h-4 w-4 shrink-0 text-steel" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    disabled={!enabled}
                    className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                  />
                </div>
              </label>
            )}

            <label className={mode === "signup" ? "mt-4 block text-sm text-[var(--foreground)]" : "block text-sm text-[var(--foreground)]"}>
              Email
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-3 bg-ink px-4 focus-within:border-gold">
                <Mail className="h-4 w-4 shrink-0 text-steel" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={!enabled}
                  className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                />
              </div>
            </label>

            <label className="mt-4 block text-sm text-[var(--foreground)]">
              Password
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-3 bg-ink px-4 focus-within:border-gold">
                <Lock className="h-4 w-4 shrink-0 text-steel" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={!enabled}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mode === "signin" && canSubmit) {
                      handleSubmit();
                    }
                  }}
                  className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                />
              </div>
            </label>

            {mode === "signin" && (
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-mist underline underline-offset-4 hover:text-gold-bright"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {mode === "signup" && (
              <label className="mt-4 block text-sm text-[var(--foreground)]">
                Confirm password
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
                    placeholder="Re-enter your password"
                    disabled={!enabled}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canSubmit) {
                        handleSubmit();
                      }
                    }}
                    className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <span className="mt-1.5 block text-[11px] text-red-300">Passwords don&apos;t match.</span>
                )}
              </label>
            )}

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
              </p>
            )}
            {message && (
              <p className="mt-4 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-bright">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {message}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>

            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-steel">
              <ShieldCheck className="h-3.5 w-3.5" /> Your password is encrypted
              end-to-end — this app never stores it in plain text.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-steel">
            Just exploring?{" "}
            <Link href="/apply" className="text-mist underline underline-offset-4 hover:text-gold-bright">
              Start an application without an account
            </Link>
          </p>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
