import { differenceInCalendarDays } from "date-fns";
import type { Recommendation } from "./types";

export function isOpen(rec: Recommendation): boolean {
  return rec.status === "OPEN";
}

export function isClosed(rec: Recommendation): boolean {
  return rec.status === "CLOSED";
}

/** (currentPrice - purchasePrice) / purchasePrice for OPEN, or the same
 * shape against sellPrice for CLOSED — never stored, always derived. */
export function getGainPercent(rec: Recommendation): number {
  const exitPrice = isClosed(rec) && rec.sellPrice != null ? rec.sellPrice : rec.currentPrice;
  return ((exitPrice - rec.purchasePrice) / rec.purchasePrice) * 100;
}

export function isProfitable(rec: Recommendation): boolean {
  return getGainPercent(rec) >= 0;
}

/** Days since purchase for OPEN, or the actual holding period for CLOSED. */
export function getHoldingDays(rec: Recommendation): number {
  const end = isClosed(rec) && rec.sellDate ? rec.sellDate : new Date();
  return Math.max(0, differenceInCalendarDays(end, rec.purchaseDate));
}

export type StatusFilter = "ALL" | "OPEN" | "CLOSED" | "PROFITABLE" | "LOSS";

export function filterRecommendations(
  list: Recommendation[],
  filter: StatusFilter,
  query: string,
): Recommendation[] {
  const q = query.trim().toLowerCase();

  return list.filter((rec) => {
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "OPEN"
          ? isOpen(rec)
          : filter === "CLOSED"
            ? isClosed(rec)
            : filter === "PROFITABLE"
              ? isProfitable(rec)
              : !isProfitable(rec);

    if (!matchesFilter) return false;
    if (!q) return true;

    return (
      rec.companyName.toLowerCase().includes(q) || rec.nseCode.toLowerCase().includes(q)
    );
  });
}

export interface RecommendationSummary {
  activeCount: number;
  closedCount: number;
  totalCount: number;
  /** Equal-weighted average gain % across OPEN recommendations. */
  overallOpenGainPercent: number;
}

export function summarizeRecommendations(list: Recommendation[]): RecommendationSummary {
  const open = list.filter(isOpen);
  const closed = list.filter(isClosed);
  const overallOpenGainPercent = open.length
    ? open.reduce((sum, rec) => sum + getGainPercent(rec), 0) / open.length
    : 0;

  return {
    activeCount: open.length,
    closedCount: closed.length,
    totalCount: list.length,
    overallOpenGainPercent,
  };
}
