import { cn } from "@/lib/utils";
import { formatInr, formatPercent } from "@/lib/format";
import type { PortfolioSummary } from "@/lib/investments/derive";

function StatCard({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-semibold tracking-tight text-foreground", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export function PortfolioSummaryCards({ summary }: { summary: PortfolioSummary }) {
  const gainIsPositive = summary.overallGainPercent >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard label="Active Positions" value={String(summary.activeCount)} />
      <StatCard label="Total Invested" value={formatInr(summary.totalInvested)} />
      <StatCard label="Current Value" value={formatInr(summary.currentValue)} />
      <StatCard
        label="Overall Gain"
        value={formatPercent(summary.overallGainPercent)}
        valueClassName={gainIsPositive ? "text-teal-700" : "text-rose-600"}
      />
    </div>
  );
}
