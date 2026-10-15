import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-3 bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-lg text-[var(--foreground)]">
              Visa<span className="text-gold">AI</span>
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">
              A single evening between filling out a form and knowing whether
              you can go. Find a job, get your AI offer letter, then your work
              visa.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm text-mist">
              <li>
                <Link href="/jobs" className="hover:text-gold-bright">
                  Find a job
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gold-bright">
                  Track status
                </Link>
              </li>
              <li>
                <Link href="/planner" className="hover:text-gold-bright">
                  Journey planner
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Trust
            </p>
            <ul className="mt-3 space-y-2 text-sm text-mist">
              <li>
                <Link href="/#fairness" className="hover:text-gold-bright">
                  Interview fairness
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Company
            </p>
            <ul className="mt-3 space-y-2 text-sm text-mist">
              <li className="hover:text-gold-bright">Careers</li>
              <li className="hover:text-gold-bright">Contact</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-ink-3 pt-6 text-xs text-steel md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} VisaAI. A student portfolio project —
            not an affiliate of any government or embassy.
          </p>
          <p>Made for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
