import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: string;
  trend: string;
  trendVariant?: "success" | "muted" | "warning" | "error";
};

const trendClass: Record<NonNullable<Props["trendVariant"]>, string> = {
  success: "text-tl-success",
  muted: "text-tl-text-muted",
  warning: "text-tl-warning",
  error: "text-tl-error",
};

export function MetricCard({
  label,
  value,
  trend,
  trendVariant = "success",
}: Props) {
  return (
    <div className="rounded-lg border border-tl-border bg-tl-card p-5">
      <p className="text-xs font-medium uppercase tracking-[0.05em] text-tl-text-secondary">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold leading-none text-tl-text-primary sm:text-[28px]">
        {value}
      </p>
      <p className={cn("mt-2 text-xs", trendClass[trendVariant])}>{trend}</p>
    </div>
  );
}
