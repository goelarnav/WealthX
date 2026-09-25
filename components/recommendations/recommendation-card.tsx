import Link from "next/link";
import { ChevronRight, Briefcase } from "lucide-react";
import { formatInr, formatPercent, formatDate } from "@/lib/format";
import { getGainPercent, getHoldingDays, isClosed } from "@/lib/recommendations/derive";
import type { Recommendation } from "@/lib/recommendations/types";
import { StatusBadge } from "@/components/recommendations/status-badge";
import { GainPill } from "@/components/recommendations/gain-pill";

export function RecommendationCard({
  recommendation: rec,
  invested,
}: {
  recommendation: Recommendation;
  invested?: boolean;
}) {
  const closed = isClosed(rec);
  const displayPrice = closed && rec.sellPrice != null ? rec.sellPrice : rec.currentPrice;

  return (
    <Link
      href={`/recommendations/${rec.id}`}
      className="block rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
            {rec.companyName}
            {invested ? (
              <Briefcase className="size-3.5 shrink-0 text-teal-600" aria-label="You've invested in this" />
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">{rec.nseCode}</p>
        </div>
        <StatusBadge status={rec.status} className="shrink-0" />
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">
          {formatInr(rec.purchasePrice)} <span className="mx-1">→</span>
          <span className="font-medium text-foreground">{formatInr(displayPrice)}</span>
        </p>
        <GainPill value={getGainPercent(rec)} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        {closed ? (
          <span>
            Held: {getHoldingDays(rec)} days · Sold: {rec.sellDate ? formatDate(rec.sellDate) : "–"}
          </span>
        ) : (
          <span>
            Today: {rec.dayChangePercent != null ? formatPercent(rec.dayChangePercent) : "–"} · Held:{" "}
            {getHoldingDays(rec)} days
          </span>
        )}
        <span className="flex items-center gap-0.5 font-medium text-teal-700">
          Details <ChevronRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
