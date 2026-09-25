import { Briefcase, TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInr, formatPercent } from "@/lib/format";
import type { PortfolioSummary } from "@/lib/investments/derive";

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

export function PortfolioSummaryCards({ summary }: { summary: PortfolioSummary }) {
  const gainIsPositive = summary.overallGainPercent >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <StatCard label="Active Positions" value={String(summary.activeCount)} icon={Briefcase} tone="teal" />
      <StatCard label="Total Invested" value={formatInr(summary.totalInvested)} icon={Wallet} tone="neutral" />
      <StatCard label="Current Value" value={formatInr(summary.currentValue)} icon={Wallet} tone="neutral" />
      <StatCard
        label="Overall Gain"
        value={formatPercent(summary.overallGainPercent)}
        icon={gainIsPositive ? TrendingUp : TrendingDown}
        tone={gainIsPositive ? "teal" : "rose"}
        valueClassName={gainIsPositive ? "text-teal-700" : "text-rose-600"}
      />
    </div>
  );
}
