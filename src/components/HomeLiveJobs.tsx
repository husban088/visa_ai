"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { Job, listJobs } from "@/lib/jobs";
import { JobCard } from "@/components/JobCard";

/** Latest real jobs posted on the platform. */
export function HomeLiveJobs() {
  const [jobs, setJobs] = useState<Job[] | null>(null);

  useEffect(() => {
    let active = true;
    listJobs().then((j) => {
      if (active) setJobs(j.slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Open roles
            </p>
            <h2 className="mt-3 font-display text-3xl text-[var(--foreground)] md:text-5xl">
              Latest jobs{" "}
              <span className="italic text-gradient-brand">
                with visa support
              </span>
            </h2>
          </motion.div>
          <Link
            href="/jobs"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-gold px-6 py-3 text-sm font-medium text-gold transition-all hover:bg-gold hover:text-white"
          >
            See all jobs
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12">
          {jobs === null && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-3xl border border-ink-3 bg-white"
                />
              ))}
            </div>
          )}

          {jobs && jobs.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((j, i) => (
                <JobCard key={j.id} job={j} index={i} />
              ))}
            </div>
          )}

          {jobs && jobs.length === 0 && (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-ink-3 bg-white px-6 py-16 text-center">
              <p className="font-display text-2xl text-[var(--foreground)]">
                No jobs posted yet
              </p>
              <p className="mt-2 max-w-sm text-sm text-mist">
                Be the first company to post a role — candidates from every
                country can apply.
              </p>
              <Link
                href="/jobs/post"
                className="btn-sheen mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.04]"
              >
                <Plus className="h-4 w-4" /> Post a job
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
