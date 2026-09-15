"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

/** True when Supabase env vars are present, i.e. accounts are available at all. */
export function isAuthEnabled(): boolean {
  return getSupabase() !== null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  /** false when Supabase isn't configured — the app then runs in single-device demo mode. */
  enabled: boolean;
}

/**
 * Subscribes to the Supabase session. Safe to call even when Supabase isn't
 * configured: it simply reports { enabled: false, user: null } and every
 * caller falls back to the localStorage flow.
 */
export function useAuth(): AuthState {
  const supabase = getSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading, enabled: Boolean(supabase) };
}

/** Returns the signed-in user's id, or undefined (demo mode / signed out). */
export async function currentUserId(): Promise<string | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Accounts are not enabled on this deployment.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: fullName ? { data: { full_name: fullName } } : undefined,
  });
  if (error) throw new Error(error.message);
  // When "Confirm email" is ON, no session comes back yet.
  return { needsEmailConfirmation: !data.session };
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Accounts are not enabled on this deployment.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
  localStorage.removeItem("visaai_active_id");
}

/** Sends a "reset your password" email with a link back to /reset-password. */
export async function sendPasswordResetEmail(email: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Accounts are not enabled on this deployment.");
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}

/**
 * Sets a new password for the currently active session. Used on the
 * /reset-password page, which is opened from the emailed recovery link and
 * therefore already has a short-lived "recovery" session active.
 */
export async function updatePassword(newPassword: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Accounts are not enabled on this deployment.");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

/** Updates the signed-in user's display name. */
export async function updateFullName(fullName: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Accounts are not enabled on this deployment.");
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) throw new Error(error.message);
}

/**
 * Permanently deletes the signed-in user's account: their application data
 * and their login itself. Cannot be undone.
 */
export async function deleteAccount() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Accounts are not enabled on this deployment.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Session expired. Please sign in again.");

  const res = await fetch("/api/account/delete", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Could not delete account.");

  await supabase.auth.signOut();
  localStorage.removeItem("visaai_active_id");
}
