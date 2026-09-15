"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth, signOut, deleteAccount, updateFullName, updatePassword } from "@/lib/auth";
import { listApplications } from "@/lib/store";
import { getCountry } from "@/lib/countries";
import { Application } from "@/types";
import {
  UserRound,
  Mail,
  CalendarDays,
  LogOut,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Lock,
  Pencil,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, enabled } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Edit name
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Change password
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!enabled || !user) {
      router.replace("/login");
      return;
    }
    listApplications()
      .then(setApps)
      .finally(() => setAppsLoading(false));
  }, [loading, enabled, user, router]);

  // Keep the name field in sync with the account whenever it (re)loads.
  useEffect(() => {
    if (user) {
      const name = (user.user_metadata?.full_name as string | undefined) ?? "";
      Promise.resolve().then(() => setNameInput(name));
    }
  }, [user]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete account.");
      setDeleting(false);
    }
  }

  async function handleSaveName() {
    if (!nameInput.trim() || nameSaving) return;
    setNameSaving(true);
    setNameError(null);
    setNameSuccess(false);
    try {
      await updateFullName(nameInput.trim());
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Could not update name.");
    } finally {
      setNameSaving(false);
    }
  }

  const newPasswordsMatch = newPassword === confirmNewPassword;

  async function handleUpdatePassword() {
    if (newPassword.length < 6 || !newPasswordsMatch || passwordSaving) return;
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await updatePassword(newPassword);
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </main>
        <Footer />
      </>
    );
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const joined = new Date(user.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Applicant portal</p>
          <h1 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-4xl">Your profile</h1>
          <p className="mt-3 text-sm text-mist">All the details tied to your account.</p>

          {/* Account details */}
          <div className="mt-8 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
                <UserRound className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg text-[var(--foreground)]">
                  {fullName || "Applicant"}
                </p>
                <p className="truncate text-sm text-mist">{user.email}</p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-ink-3 pt-6 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-steel">
                  <UserRound className="h-3.5 w-3.5" /> Full name
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{fullName || "Not provided"}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-steel">
                  <Mail className="h-3.5 w-3.5" /> Email
                </dt>
                <dd className="mt-1 truncate text-sm text-[var(--foreground)]">{user.email}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-steel">
                  <CalendarDays className="h-3.5 w-3.5" /> Member since
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{joined}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-steel">
                  <FileText className="h-3.5 w-3.5" /> Applications
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  {appsLoading ? "…" : apps.length}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-ink-3 pt-6">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center gap-2 rounded-full border border-ink-3 px-5 py-2.5 text-sm text-mist transition-colors hover:border-gold hover:text-gold-bright disabled:opacity-50"
              >
                {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Log out
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/40 px-5 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
            </div>
          </div>

          {/* Edit profile */}
          <div className="mt-6 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg text-[var(--foreground)]">
              <Pencil className="h-4 w-4 text-gold" /> Edit profile
            </h2>

            {/* Name */}
            <label className="mt-5 block text-sm text-[var(--foreground)]">
              Full name
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-3 bg-ink px-4 focus-within:border-gold">
                <UserRound className="h-4 w-4 shrink-0 text-steel" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setNameSuccess(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                  }}
                  placeholder="Your full name"
                  className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                />
              </div>
            </label>
            {nameError && (
              <p className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {nameError}
              </p>
            )}
            {nameSuccess && (
              <p className="mt-2 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-bright">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Name updated.
              </p>
            )}
            <button
              onClick={handleSaveName}
              disabled={nameSaving || !nameInput.trim() || nameInput.trim() === fullName}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-ink-3 px-5 py-2 text-sm text-mist transition-colors hover:border-gold hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
            >
              {nameSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save name
            </button>

            {/* Password */}
            <div className="mt-6 border-t border-ink-3 pt-6">
              <p className="text-sm text-[var(--foreground)]">Change password</p>
              <p className="mt-1 text-xs text-mist">Set a new password for your account.</p>

              <label className="mt-4 block text-sm text-[var(--foreground)]">
                New password
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-3 bg-ink px-4 focus-within:border-gold">
                  <Lock className="h-4 w-4 shrink-0 text-steel" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordSuccess(false);
                    }}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                  />
                </div>
              </label>

              <label className="mt-4 block text-sm text-[var(--foreground)]">
                Confirm new password
                <div
                  className={`mt-2 flex items-center gap-2 rounded-lg border bg-ink px-4 focus-within:border-gold ${
                    confirmNewPassword && !newPasswordsMatch ? "border-red-500/50" : "border-ink-3"
                  }`}
                >
                  <Lock className="h-4 w-4 shrink-0 text-steel" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setPasswordSuccess(false);
                    }}
                    placeholder="Re-enter new password"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdatePassword();
                    }}
                    className="w-full bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-steel"
                  />
                </div>
                {confirmNewPassword && !newPasswordsMatch && (
                  <span className="mt-1.5 block text-[11px] text-red-300">Passwords don&apos;t match.</span>
                )}
              </label>

              {passwordError && (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-bright">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Password updated.
                </p>
              )}

              <button
                onClick={handleUpdatePassword}
                disabled={passwordSaving || newPassword.length < 6 || !newPasswordsMatch}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-ink-3 px-5 py-2 text-sm text-mist transition-colors hover:border-gold hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
              >
                {passwordSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Update password
              </button>
            </div>
          </div>

          {/* Applications */}
          {!appsLoading && apps.length > 0 && (
            <div className="mt-6 rounded-2xl border border-ink-3 bg-ink-2/50 p-6">
              <h2 className="font-display text-lg text-[var(--foreground)]">Your applications</h2>
              <ul className="mt-4 space-y-3">
                {apps.map((app) => {
                  const country = getCountry(app.countryCode);
                  return (
                    <li key={app.id}>
                      <Link
                        href="/dashboard"
                        onClick={() => localStorage.setItem("visaai_active_id", app.id)}
                        className="flex items-center justify-between rounded-xl border border-ink-3 bg-ink px-4 py-3 text-sm transition-colors hover:border-gold"
                      >
                        <span className="text-[var(--foreground)]">
                          {country?.name ?? app.countryCode} — {app.visaType}
                        </span>
                        <span className="text-xs capitalize text-mist">{app.status.replace(/_/g, " ")}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />

      {/* Delete account confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-ink-3 bg-ink-2 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                {!deleting && (
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-steel hover:text-mist"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h3 className="mt-4 font-display text-xl text-[var(--foreground)]">Delete your account?</h3>
              <p className="mt-2 text-sm text-mist">
                This permanently deletes your account and every application
                tied to it. This can&apos;t be undone.
              </p>

              {deleteError && (
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {deleteError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 rounded-full border border-ink-3 px-4 py-2.5 text-sm text-mist transition-colors hover:text-gold-bright disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
