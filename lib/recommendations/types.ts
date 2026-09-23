export type RecommendationStatus = "OPEN" | "CLOSED";

/**
 * Client-safe, plain-data shape for a recommendation. Prices arrive as
 * `number` (converted from Prisma `Decimal` in the repository) so this can
 * cross the Server -> Client Component boundary without extra work.
 *
 * Only source-of-truth facts live here. Anything derivable (gain %, days
 * held, profit/loss) is computed on demand in lib/recommendations/derive.ts
 * instead of being duplicated as stored/passed state.
 */
export interface Recommendation {
  id: string;
  companyName: string;
  nseCode: string;
  purchasePrice: number;
  currentPrice: number;
  dayChangePercent: number | null;
  purchaseDate: Date;
  status: RecommendationStatus;
  sellDate: Date | null;
  sellPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}
