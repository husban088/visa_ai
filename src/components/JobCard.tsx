"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Building2,
  Briefcase,
  Plane,
  ArrowUpRight,
  Clock,
  Send,
  Globe,
  BadgeCheck,
} from "lucide-react";
import { Job } from "@/lib/jobs";
import { Flag } from "./Flag";

function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function JobCard({ job, index }: { job: Job; index: number }) {
  const router = useRouter();
  const open = () => router.push(`/jobs/${job.id}`);
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.07 }}
    >
      <div
        role="link"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter") open();
        }}
        className="luxe-card group relative block h-full cursor-pointer overflow-hidden rounded-3xl border border-ink-3 bg-white p-6"
      >
        <span className="luxe-glow" aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gold">
              <Flag code={job.countryCode} className="h-4 w-6" />
              {job.countryName}
            </p>
            <h3 className="mt-2 font-display text-xl leading-snug text-[var(--foreground)] transition-colors group-hover:text-gold">
              {job.title}
            </h3>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-3 text-steel transition-all duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-gradient-brand group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="relative mt-4 space-y-1.5 text-sm text-mist">
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-gold" />
            {job.companyName}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-gold" />
            {job.remoteGlobal
              ? `Remote · open worldwide (HQ ${job.countryName})`
              : `${job.city ? `${job.city}, ` : ""}${job.countryName}`}
          </p>
          <p className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 shrink-0 text-gold" />
            {job.employmentType} · {job.workMode} · {job.experienceLevel}
          </p>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {job.techStack.slice(0, 5).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
          {job.techStack.length > 5 && (
            <span className="chip">+{job.techStack.length - 5}</span>
          )}
        </div>

        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-ink-3 pt-4 text-xs text-steel">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {ago(job.createdAt)}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {job.remoteGlobal && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-1 font-medium text-white">
                <Globe className="h-3 w-3" /> Remote Worldwide
              </span>
            )}
            {job.relocation && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-brand px-3 py-1 font-medium text-white">
                <Plane className="h-3 w-3 -rotate-45" /> Relocation
              </span>
            )}
            {job.visaSponsorship && (
              <span className="flex items-center gap-1 rounded-full border border-gold px-3 py-1 font-medium text-gold">
                <BadgeCheck className="h-3 w-3" /> Visa
              </span>
            )}
            <Link
              href={`/jobs/${job.id}/apply`}
              onClick={(e) => e.stopPropagation()}
              className="btn-sheen flex items-center gap-1.5 rounded-full border border-gold px-4 py-1.5 font-medium text-gold transition-all hover:bg-gold hover:text-white"
            >
              <Send className="h-3 w-3" /> Apply
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
