import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";
import type { RecommendationSummary } from "@/lib/recommendations/derive";

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-semibold tracking-tight text-foreground", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export function SummaryCards({ summary }: { summary: RecommendationSummary }) {
  const gainIsPositive = summary.overallOpenGainPercent >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard label="Active Recommendations" value={String(summary.activeCount)} />
      <StatCard label="Closed Recommendations" value={String(summary.closedCount)} />
      <StatCard
        label="Overall Open Gain"
        value={formatPercent(summary.overallOpenGainPercent)}
        valueClassName={gainIsPositive ? "text-teal-700" : "text-rose-600"}
      />
      <StatCard label="Total Recommendations" value={String(summary.totalCount)} />
    </div>
  );
}
