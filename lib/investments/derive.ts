import { differenceInCalendarDays } from "date-fns";
import type { Investment } from "./types";

export function isActive(investment: Investment): boolean {
  return investment.status === "ACTIVE";
}

/** The price to value the position at right now: the live market price
 * while ACTIVE, or the recorded exit price once EXITED. */
export function getReferencePrice(investment: Investment): number {
  if (investment.status === "EXITED") {
    return investment.exitPrice ?? investment.recommendation.currentPrice;
  }
  return investment.recommendation.currentPrice;
}

export function getGainPercent(investment: Investment): number {
  const referencePrice = getReferencePrice(investment);
  return ((referencePrice - investment.entryPrice) / investment.entryPrice) * 100;
}

/** Current mark-to-market value of the position (or its value at exit). */
export function getCurrentValue(investment: Investment): number {
  const referencePrice = getReferencePrice(investment);
  return investment.amount * (referencePrice / investment.entryPrice);
}

export function getAbsoluteGain(investment: Investment): number {
  return getCurrentValue(investment) - investment.amount;
}

export function getHoldingDays(investment: Investment): number {
  const end = investment.status === "EXITED" && investment.exitDate ? investment.exitDate : new Date();
  return Math.max(0, differenceInCalendarDays(end, investment.entryDate));
}

export interface PortfolioSummary {
  activeCount: number;
  exitedCount: number;
  totalInvested: number;
  currentValue: number;
  overallGainPercent: number;
}

export function summarizeInvestments(investments: Investment[]): PortfolioSummary {
  const active = investments.filter(isActive);
  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const currentValue = investments.reduce((sum, i) => sum + getCurrentValue(i), 0);

  return {
    activeCount: active.length,
    exitedCount: investments.length - active.length,
    totalInvested,
    currentValue,
    overallGainPercent: totalInvested ? ((currentValue - totalInvested) / totalInvested) * 100 : 0,
  };
}
