"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Plane, LogOut, UserRound } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/visa-types", label: "Visa types" },
  { href: "/countries", label: "Countries" },
  { href: "/dashboard", label: "Track application" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, enabled } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-3/70 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-white transition-transform group-hover:scale-105">
            <Plane className="h-4 w-4 -rotate-45" strokeWidth={1.75} />
          </span>
          <span className="font-display text-lg tracking-tight text-[var(--foreground)]">
            Visa<span className="text-gradient-brand">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-mist transition-colors hover:text-gold-bright"
            >
              {l.label}
            </Link>
          ))}
          {enabled &&
            (user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex max-w-[160px] items-center gap-1.5 truncate text-sm text-mist transition-colors hover:text-gold-bright"
                >
                  <UserRound className="h-3.5 w-3.5 shrink-0 text-gold" />
                  {user.email}
                </Link>
                <button
                  onClick={() => signOut().then(() => window.location.assign("/"))}
                  aria-label="Sign out"
                  className="text-steel transition-colors hover:text-gold-bright"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-mist transition-colors hover:text-gold-bright"
              >
                Sign in
              </Link>
            ))}
          <Link
            href="/apply"
            className="rounded-full bg-gradient-brand px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Start application
          </Link>
        </nav>

        <button
          aria-label="Toggle menu"
          className="text-[var(--foreground)] md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-3 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-mist hover:text-gold-bright"
              >
                {l.label}
              </Link>
            ))}
            {enabled &&
              (user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="text-sm text-mist hover:text-gold-bright"
                  >
                    Profile ({user.email})
                  </Link>
                  <button
                    onClick={() => signOut().then(() => window.location.assign("/"))}
                    className="text-left text-sm text-mist hover:text-gold-bright"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm text-mist hover:text-gold-bright"
                >
                  Sign in
                </Link>
              ))}
            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gradient-brand px-5 py-2 text-center text-sm font-medium text-white"
            >
              Start application
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
