export type InvestmentStatus = "ACTIVE" | "EXITED";

/**
 * A user's personal position in a recommendation. Plain-data shape (see
 * lib/recommendations/types.ts for why) that also carries a snapshot of
 * the parent recommendation's identifying/live-price fields, since every
 * place that renders an investment needs the company name and current
 * market price alongside it.
 */
export interface Investment {
  id: string;
  userId: string;
  recommendationId: string;
  amount: number;
  entryPrice: number;
  entryDate: Date;
  status: InvestmentStatus;
  exitPrice: number | null;
  exitDate: Date | null;
  createdAt: Date;
  recommendation: {
    companyName: string;
    nseCode: string;
    currentPrice: number;
    status: "OPEN" | "CLOSED";
  };
}
