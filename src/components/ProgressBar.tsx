import { cn } from "@/lib/utils";

type ProgressBarProps = {
  step: number;
  total?: number;
  label: string;
  className?: string;
};

export function ProgressBar({
  step,
  total = 3,
  label,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((step / total) * 100));

  return (
    <div className={cn("w-full space-y-3", className)}>
      <p className="text-sm font-medium tracking-wide text-slate-600">
        Krok {step} z {total}{" "}
        <span className="text-slate-400">—</span> {label}
      </p>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#C0392B] to-[#A93226] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
