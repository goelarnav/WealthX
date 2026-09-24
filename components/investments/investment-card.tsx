import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatInr, formatDate } from "@/lib/format";
import { getCurrentValue, getGainPercent, getHoldingDays, isActive } from "@/lib/investments/derive";
import type { Investment } from "@/lib/investments/types";
import { GainPill } from "@/components/recommendations/gain-pill";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function InvestmentCard({ investment }: { investment: Investment }) {
  const active = isActive(investment);
  const gainPercent = getGainPercent(investment);
  const currentValue = getCurrentValue(investment);

  return (
    <Link
      href={`/recommendations/${investment.recommendationId}`}
      className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{investment.recommendation.companyName}</p>
          <p className="text-xs text-muted-foreground">{investment.recommendation.nseCode}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1.5 border-none font-medium",
            active ? "bg-teal-50 text-teal-700" : "bg-muted text-muted-foreground",
          )}
        >
          <span className={cn("size-1.5 rounded-full", active ? "bg-teal-600" : "bg-muted-foreground/60")} />
          {active ? "ACTIVE" : "EXITED"}
        </Badge>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">
          Invested <span className="font-medium text-foreground">{formatInr(investment.amount)}</span>
        </p>
        <div className="text-right">
          <p className="font-medium text-foreground">{formatInr(currentValue)}</p>
          <GainPill value={gainPercent} className="justify-end" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        {active ? (
          <span>
            Entry {formatInr(investment.entryPrice)} · {getHoldingDays(investment)} days
          </span>
        ) : (
          <span>
            {formatInr(investment.entryPrice)} → {formatInr(investment.exitPrice ?? 0)} · Exited{" "}
            {investment.exitDate ? formatDate(investment.exitDate) : "–"}
          </span>
        )}
        <span className="flex items-center gap-0.5 font-medium text-teal-700">
          Details <ChevronRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
