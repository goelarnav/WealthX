import { Activity, CheckCircle2, Layers, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";
import type { RecommendationSummary } from "@/lib/recommendations/derive";

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  valueClassName,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "teal" | "rose" | "neutral";
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tone === "teal" && "bg-teal-50 text-teal-600",
            tone === "rose" && "bg-rose-50 text-rose-600",
            tone === "neutral" && "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className={cn("mt-2.5 text-2xl font-semibold tracking-tight text-foreground", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export function SummaryCards({ summary }: { summary: RecommendationSummary }) {
  const gainIsPositive = summary.overallOpenGainPercent >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard label="Active Recommendations" value={String(summary.activeCount)} icon={Activity} tone="teal" />
      <StatCard label="Closed Recommendations" value={String(summary.closedCount)} icon={CheckCircle2} tone="neutral" />
      <StatCard
        label="Overall Open Gain"
        value={formatPercent(summary.overallOpenGainPercent)}
        icon={gainIsPositive ? TrendingUp : TrendingDown}
        tone={gainIsPositive ? "teal" : "rose"}
        valueClassName={gainIsPositive ? "text-teal-700" : "text-rose-600"}
      />
      <StatCard label="Total Recommendations" value={String(summary.totalCount)} icon={Layers} tone="neutral" />
    </div>
  );
}
