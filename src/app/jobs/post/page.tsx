"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Briefcase,
  Cpu,
  Languages,
  Plane,
  FileText,
  Phone,
  Plus,
  X,
  Send,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  createJob,
  htmlToText,
  ROLE_OPTIONS,
  TECH_OPTIONS,
  LANGUAGE_OPTIONS,
  EMPLOYMENT_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  WORLD_COUNTRIES,
} from "@/lib/jobs";

const input =
  "h-12 w-full rounded-xl border border-ink-3 bg-white px-4 text-sm text-[var(--foreground)] outline-none transition-all duration-200 hover:border-gold/60 focus:border-gold focus:shadow-[0_0_0_4px_rgba(210,31,31,0.08)]";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      className="luxe-card rounded-3xl border border-ink-3 bg-white p-6 md:p-8"
    >
      <h2 className="flex items-center gap-3 font-display text-xl text-[var(--foreground)]">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-6 grid gap-5">{children}</div>
    </motion.section>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-steel">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist">{hint}</span>}
    </label>
  );
}

function ChipPicker({
  options,
  selected,
  onToggle,
  onAdd,
  placeholder,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onAdd: (v: string) => void;
  placeholder: string;
}) {
  const [custom, setCustom] = useState("");
  const extra = selected.filter((s) => !options.includes(s));
  const add = () => {
    const v = custom.trim();
    if (v) onAdd(v);
    setCustom("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[...options, ...extra].map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 ${on ? "border-transparent bg-gradient-brand text-white shadow-md" : "border-ink-3 bg-white text-mist hover:border-gold hover:text-gold"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={placeholder}
          className={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          onClick={add}
          className="flex h-12 shrink-0 items-center gap-1 rounded-xl border border-gold px-4 text-sm text-gold transition-colors hover:bg-gold hover:text-white"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}

export default function PostJobPage() {
  const router = useRouter();
  const [roleType, setRoleType] = useState(ROLE_OPTIONS[0]);
  const [customTitle, setCustomTitle] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [employmentType, setEmploymentType] = useState(EMPLOYMENT_TYPES[0]);
  const [workMode, setWorkMode] = useState(WORK_MODES[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_LEVELS[1]);
  const [salary, setSalary] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [relocation, setRelocation] = useState(false);
  const [relocationDetails, setRelocationDetails] = useState("");
  const [visaSponsorship, setVisaSponsorship] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void) => (v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const addTo = (list: string[], set: (v: string[]) => void) => (v: string) =>
    set(list.includes(v) ? list : [...list, v]);

  const addQuestion = () => {
    const v = questionInput.trim();
    if (v && !questions.includes(v)) setQuestions([...questions, v]);
    setQuestionInput("");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const title = roleType === "Other" ? customTitle.trim() : roleType;
    const country = WORLD_COUNTRIES.find((c) => c.code === countryCode);
    if (!title) return setError("Please enter a job title.");
    if (!country) return setError("Please select the country.");
    if (!companyName.trim()) return setError("Please enter the company name.");
    if (!companyLocation.trim())
      return setError("Please enter the company location.");
    if (!/^\S+@\S+\.\S+$/.test(companyEmail.trim()))
      return setError("Please enter a valid company email.");
    if (companyPhone.replace(/[^\d]/g, "").length < 6)
      return setError("Please enter a valid company phone number.");
    if (!htmlToText(descriptionHtml))
      return setError("Please write the company / job details.");
    if (techStack.length === 0)
      return setError("Please select at least one technology.");

    setSaving(true);
    try {
      const job = await createJob({
        title,
        roleType,
        countryCode: country.code,
        countryName: country.name,
        city: city.trim(),
        companyName: companyName.trim(),
        companyLocation: companyLocation.trim(),
        companyWebsite: companyWebsite.trim(),
        companyPhone: companyPhone.trim(),
        companyEmail: companyEmail.trim(),
        employmentType,
        workMode,
        experienceLevel,
        salary: salary.trim(),
        techStack,
        skills,
        languages,
        relocation,
        relocationDetails: relocation ? relocationDetails.trim() : "",
        visaSponsorship,
        descriptionHtml,
        questions,
      });
      router.push(`/jobs/${job.id}`);
    } catch {
      setError("Something went wrong while saving. Please try again.");
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-paper/50">
        <section className="relative overflow-hidden bg-gradient-brand">
          <div className="orb orb-a" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-6 py-14 text-center md:py-20">
            <p className="text-xs uppercase tracking-widest text-white/70">
              For employers worldwide
            </p>
            <h1 className="mt-3 font-display text-3xl text-white md:text-5xl">
              Post a job
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/75">
              Reach talented developers in every country. Style your company
              details exactly the way you like.
            </p>
          </div>
        </section>

        <form
          onSubmit={submit}
          className="mx-auto grid max-w-4xl gap-6 px-6 py-12"
        >
          <Section icon={<Briefcase className="h-4 w-4" />} title="Job details">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Role">
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                  className={input}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              {roleType === "Other" && (
                <Field label="Custom job title">
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Cloud Architect"
                    className={input}
                  />
                </Field>
              )}
              <Field label="Employment type">
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className={input}
                >
                  {EMPLOYMENT_TYPES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Work mode">
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className={input}
                >
                  {WORK_MODES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Experience">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className={input}
                >
                  {EXPERIENCE_LEVELS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Salary (optional)">
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $4,000 / month"
                  className={input}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={<Building2 className="h-4 w-4" />}
            title="Company & location"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Company name">
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className={input}
                />
              </Field>
              <Field label="Company website (optional)">
                <input
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className={input}
                />
              </Field>
              <Field label="Country">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className={input}
                >
                  <option value="">Select country</option>
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="City">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className={input}
                />
              </Field>
            </div>
            <Field label="Company location / address">
              <input
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                placeholder="Street, area, postal code"
                className={input}
              />
            </Field>
          </Section>

          <Section
            icon={<Cpu className="h-4 w-4" />}
            title="Technologies & skills"
          >
            <Field label="Technologies">
              <ChipPicker
                options={TECH_OPTIONS}
                selected={techStack}
                onToggle={toggle(techStack, setTechStack)}
                onAdd={addTo(techStack, setTechStack)}
                placeholder="Add another technology…"
              />
            </Field>
            <Field label="Other skills">
              <ChipPicker
                options={[]}
                selected={skills}
                onToggle={toggle(skills, setSkills)}
                onAdd={addTo(skills, setSkills)}
                placeholder="e.g. Teamwork, System design…"
              />
            </Field>
          </Section>

          <Section icon={<Languages className="h-4 w-4" />} title="Languages">
            <ChipPicker
              options={LANGUAGE_OPTIONS}
              selected={languages}
              onToggle={toggle(languages, setLanguages)}
              onAdd={addTo(languages, setLanguages)}
              placeholder="Add another language…"
            />
          </Section>

          <Section
            icon={<Plane className="h-4 w-4 -rotate-45" />}
            title="Relocation & visa"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  label: "Relocation package offered?",
                  val: relocation,
                  set: setRelocation,
                },
                {
                  label: "Visa sponsorship offered?",
                  val: visaSponsorship,
                  set: setVisaSponsorship,
                },
              ].map((o) => (
                <div
                  key={o.label}
                  className="flex items-center justify-between rounded-2xl border border-ink-3 p-4"
                >
                  <span className="text-sm text-[var(--foreground)]">
                    {o.label}
                  </span>
                  <div className="flex overflow-hidden rounded-full border border-ink-3 text-sm">
                    <button
                      type="button"
                      onClick={() => o.set(true)}
                      className={`px-4 py-1.5 transition-colors ${o.val ? "bg-gradient-brand text-white" : "text-mist hover:text-gold"}`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => o.set(false)}
                      className={`px-4 py-1.5 transition-colors ${!o.val ? "bg-gradient-brand text-white" : "text-mist hover:text-gold"}`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {relocation && (
              <Field label="Relocation package details">
                <textarea
                  value={relocationDetails}
                  onChange={(e) => setRelocationDetails(e.target.value)}
                  rows={3}
                  placeholder="Flight ticket, accommodation, visa costs, family support…"
                  className={`${input} h-auto py-3`}
                />
              </Field>
            )}
          </Section>

          <Section icon={<Phone className="h-4 w-4" />} title="Company contact">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Company phone">
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className={input}
                />
              </Field>
              <Field label="Company email">
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="careers@company.com"
                  className={input}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={<FileText className="h-4 w-4" />}
            title="Company & job description"
          >
            <p className="-mt-2 text-xs text-mist">
              Style it your way — change font, size, bold, colors, alignment and
              lists.
            </p>
            <RichTextEditor
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="Tell candidates about your company, the role, responsibilities and benefits…"
            />
          </Section>

          <Section
            icon={<HelpCircle className="h-4 w-4" />}
            title="Questions for applicants"
          >
            <p className="-mt-2 text-xs text-mist">
              Optional. Add any extra questions you want every applicant to
              answer (e.g. notice period, years of experience).
            </p>
            {questions.length > 0 && (
              <ul className="grid gap-2">
                {questions.map((q, i) => (
                  <li
                    key={q}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-3 bg-paper px-4 py-3 text-sm text-[var(--foreground)]"
                  >
                    <span className="min-w-0 break-words">
                      {i + 1}. {q}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove question"
                      onClick={() =>
                        setQuestions(questions.filter((x) => x !== q))
                      }
                      className="shrink-0 text-steel transition-colors hover:text-gold"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Type a question…"
                className={input}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addQuestion();
                  }
                }}
              />
              <button
                type="button"
                onClick={addQuestion}
                className="flex h-12 shrink-0 items-center gap-1 rounded-xl border border-gold px-4 text-sm text-gold transition-colors hover:bg-gold hover:text-white"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </Section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-gold/40 bg-paper px-4 py-3 text-sm text-gold"
            >
              <X className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-sheen flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-brand text-base font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {saving ? "Publishing…" : "Publish job"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
