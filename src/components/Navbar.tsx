"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Route,
  Briefcase,
  Globe,
  LayoutDashboard,
  LogOut,
  Plane,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";

const links = [
  { href: "/planner", label: "Journey planner", icon: Route },
  { href: "/countries", label: "Countries", icon: Globe },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard", label: "Track application", icon: LayoutDashboard },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const listV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.28 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialOf(email?: string | null) {
  return (email?.trim()?.[0] ?? "V").toUpperCase();
}

/** Luxury sheen that sweeps across a button on hover. */
function Sheen() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-[320%]"
    />
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { user, enabled } = useAuth();
  const pathname = usePathname() ?? "";
  const closeRef = useRef<HTMLButtonElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.4,
  });

  // Compact + glassy header after scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Sidebar: lock page scroll, close on Esc, focus the close button.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 350);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  // Close the sidebar automatically if the screen grows to desktop size.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const doSignOut = () => {
    setOpen(false);
    signOut().then(() => window.location.assign("/"));
  };

  return (
    <>
      {/* ───────────── Top bar ───────────── */}
      <header
        className={`sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled
            ? "bg-white/80 shadow-[0_14px_40px_-22px_rgba(127,15,15,0.45)] backdrop-blur-xl"
            : "bg-white/60 backdrop-blur-md"
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] duration-500 sm:px-6 ${
            scrolled ? "py-2.5" : "py-4"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-white shadow-[0_8px_20px_-8px_rgba(210,31,31,0.8)] transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
              <span
                aria-hidden
                className="absolute -inset-1 rounded-full border border-dashed border-gold/40 transition-transform duration-1000 group-hover:rotate-180"
              />
              <Plane
                className="h-[18px] w-[18px] -rotate-45 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
            </span>
            <span className="font-display text-xl tracking-tight text-[var(--foreground)]">
              Visa<span className="text-gradient-brand">AI</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            onMouseLeave={() => setHovered(null)}
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main"
          >
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={() => setHovered(l.href)}
                  onFocus={() => setHovered(l.href)}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                    active || hovered === l.href ? "text-gold" : "text-mist"
                  }`}
                >
                  {hovered === l.href && (
                    <motion.span
                      layoutId="nav-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-800/10 ring-1 ring-red-500/20"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      aria-hidden
                      className="absolute inset-x-4 -bottom-0.5 h-[2px] rounded-full bg-gradient-brand"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            {enabled &&
              (user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    title={user.email ?? "Profile"}
                    className="group flex items-center gap-2 rounded-full border border-ink-3 bg-white/70 py-1 pl-1 pr-3 transition-all duration-300 hover:border-gold/50 hover:shadow-[0_8px_24px_-12px_rgba(210,31,31,0.55)]"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-xs font-medium text-white transition-transform duration-300 group-hover:scale-110">
                      {initialOf(user.email)}
                    </span>
                    <span className="hidden max-w-[130px] truncate text-sm text-mist transition-colors group-hover:text-gold xl:block">
                      {user.email}
                    </span>
                    <UserRound className="h-3.5 w-3.5 text-gold xl:hidden" />
                  </Link>
                  <button
                    onClick={doSignOut}
                    aria-label="Sign out"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-steel transition-all duration-300 hover:rotate-6 hover:border-ink-3 hover:bg-ink-2 hover:text-gold"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="group relative px-2 py-2 text-sm text-mist transition-colors hover:text-gold"
                >
                  Sign in
                  <span className="absolute inset-x-2 bottom-1 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            <Link
              href="/jobs"
              className="group/cta relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-medium text-white shadow-[0_10px_26px_-10px_rgba(210,31,31,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(210,31,31,0.95)]"
            >
              <Sheen />
              <span className="relative">Find a job</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </div>

          {/* Mobile / tablet menu button */}
          <button
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-ink-3 bg-white/80 transition-all duration-300 hover:border-gold/60 hover:shadow-[0_8px_24px_-12px_rgba(210,31,31,0.6)] active:scale-95 lg:hidden"
          >
            <span className="flex w-5 flex-col items-end gap-[5px]">
              <span className="h-[1.5px] w-5 rounded-full bg-[var(--foreground)] transition-all duration-300 group-hover:bg-gold" />
              <span className="h-[1.5px] w-3.5 rounded-full bg-[var(--foreground)] transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
              <span className="h-[1.5px] w-2.5 rounded-full bg-[var(--foreground)] transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
            </span>
          </button>
        </div>

        {/* hairline + scroll progress */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-red-900/20 to-transparent" />
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-brand"
        />
      </header>

      {/* ───────────── Side drawer (opens from the right) ───────────── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            {/* Backdrop — clicking OUTSIDE the panel closes it */}
            <motion.div
              key="backdrop"
              aria-hidden
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
            />

            {/* Panel — clicking INSIDE it never closes it */}
            <motion.aside
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="absolute inset-y-0 right-0 flex h-[100dvh] w-[min(88vw,390px)] flex-col overflow-hidden border-l border-white/10 text-white shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.7)]"
              style={{
                background:
                  "linear-gradient(165deg, #0b0606 0%, #1a0808 48%, #3a0d0d 100%)",
              }}
            >
              {/* decoration */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.5]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(239,68,68,0.38), transparent 65%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(210,31,31,0.28), transparent 65%)",
                }}
              />
              <motion.div
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-20 -right-20 flex h-72 w-72 items-center justify-center rounded-full border border-dashed border-white/[0.09]"
              >
                <span className="flex h-52 w-52 items-center justify-center rounded-full border border-white/[0.07]">
                  <Plane
                    className="h-16 w-16 -rotate-45 text-white/[0.06]"
                    strokeWidth={1}
                  />
                </span>
              </motion.div>

              {/* header */}
              <div
                className="relative flex items-center justify-between px-6 pb-4"
                style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
              >
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-2.5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand shadow-[0_8px_22px_-8px_rgba(239,68,68,0.9)] ring-1 ring-white/20 transition-transform duration-500 group-hover:rotate-[-8deg]">
                    <Plane
                      className="h-[18px] w-[18px] -rotate-45"
                      strokeWidth={1.75}
                    />
                  </span>
                  <span className="font-display text-xl tracking-tight">
                    Visa<span className="text-red-400">AI</span>
                  </span>
                </Link>
                <button
                  ref={closeRef}
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] transition-all duration-300 hover:border-red-400/60 hover:bg-red-500/15 active:scale-95"
                >
                  <X className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
                </button>
              </div>

              <div className="relative mx-6 h-px bg-gradient-to-r from-white/25 via-white/10 to-transparent" />

              {/* scrollable middle */}
              <div className="relative flex-1 overflow-y-auto overscroll-contain px-3 py-5">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.22, duration: 0.5 }}
                  className="mb-2 px-4 text-[10px] uppercase tracking-[0.28em] text-red-300/70"
                >
                  Navigate
                </motion.p>

                <motion.ul
                  variants={listV}
                  initial="hidden"
                  animate="show"
                  className="space-y-1"
                >
                  {links.map((l, i) => {
                    const active = isActive(pathname, l.href);
                    const Icon = l.icon;
                    return (
                      <motion.li key={l.href} variants={itemV}>
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl px-4 py-3.5 transition-colors duration-300 hover:bg-white/[0.05] ${
                            active ? "bg-white/[0.06]" : ""
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-red-300 to-red-700" />
                          )}
                          <span className="w-5 font-display text-xs tabular-nums text-white/30 transition-colors duration-300 group-hover:text-red-300">
                            0{i + 1}
                          </span>
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:-rotate-6 group-hover:border-red-400/50 group-hover:bg-red-500/15 group-hover:text-white ${
                              active
                                ? "border-red-400/50 bg-red-500/15 text-white"
                                : "border-white/10 bg-white/[0.03] text-white/70"
                            }`}
                          >
                            <Icon
                              className="h-[18px] w-[18px]"
                              strokeWidth={1.6}
                            />
                          </span>
                          <span className="font-display text-[1.35rem] leading-none text-white/90 transition-transform duration-300 group-hover:translate-x-1.5">
                            {l.label}
                          </span>
                          <ArrowUpRight className="ml-auto h-4 w-4 -translate-x-2 text-red-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                          <span className="absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 bg-gradient-to-r from-red-400/60 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </div>

              {/* footer: account + CTA */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.55, ease: EASE }}
                className="relative space-y-3 border-t border-white/10 bg-black/20 px-6 pt-5 backdrop-blur-sm"
                style={{
                  paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
                }}
              >
                {enabled &&
                  (user ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-white/[0.05]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-medium ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                          {initialOf(user.email)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] uppercase tracking-[0.2em] text-red-300/70">
                            Signed in
                          </span>
                          <span className="block truncate text-sm text-white/90">
                            {user.email}
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-white/40 transition-all duration-300 group-hover:text-red-300" />
                      </Link>
                      <button
                        onClick={doSignOut}
                        className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/70 transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/10 hover:text-white"
                      >
                        <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] py-3 text-sm text-white/90 transition-all duration-300 hover:border-red-400/60 hover:bg-red-500/10"
                    >
                      <UserRound className="h-4 w-4 text-red-300" />
                      Sign in
                    </Link>
                  ))}

                <Link
                  href="/jobs"
                  onClick={() => setOpen(false)}
                  className="group/cta relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-900 py-3.5 text-sm font-medium text-white shadow-[0_14px_34px_-12px_rgba(239,68,68,0.75)] ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(239,68,68,0.9)]"
                >
                  <Sheen />
                  <Sparkles className="relative h-4 w-4" />
                  <span className="relative">Find a job</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                </Link>

                <p className="pt-1 text-center font-display text-xs italic text-white/35">
                  Your visa, decided by evening.
                </p>
              </motion.div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
