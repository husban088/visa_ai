import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="bg-gradient-brand py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-3xl text-white md:text-5xl">
          Stop refreshing the embassy portal.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-white/70">
          Start your application now and see today&apos;s open interview slots
          for your country.
        </p>
        <Link
          href="/apply"
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
        >
          Start your application
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}
