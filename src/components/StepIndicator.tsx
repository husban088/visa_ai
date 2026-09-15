const steps = ["Country & visa", "Documents", "Review & submit"];

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-3 text-xs">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const active = n === current;
        const done = n < current;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] transition-colors ${
                done
                  ? "border-gold bg-gold text-ink"
                  : active
                  ? "border-gold text-gold"
                  : "border-ink-3 text-steel"
              }`}
            >
              {n}
            </span>
            <span className={active ? "text-[var(--foreground)]" : "text-steel"}>{label}</span>
            {n !== 3 && <span className="mx-1 h-px w-8 bg-ink-3" />}
          </li>
        );
      })}
    </ol>
  );
}
