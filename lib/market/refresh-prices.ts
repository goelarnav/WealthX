import { prisma } from "@/lib/db/prisma";
import { getPriceProvider } from "@/lib/market/price-provider";
import { updateCurrentPrice } from "@/lib/recommendations/repository";

const CONCURRENCY = 5;

export interface RefreshSummary {
  attempted: number;
  updated: number;
  failed: string[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * Pulls a live quote for every OPEN recommendation's NSE code and writes
 * it straight to the DB. Meant to run on a schedule (see
 * app/api/market/refresh/route.ts and scripts/refresh-prices.ts) — the
 * dashboard only ever reads `currentPrice`, it never fetches live quotes
 * itself, so page loads stay fast regardless of this job's cadence.
 */
export async function refreshAllPrices(): Promise<RefreshSummary> {
  const provider = getPriceProvider();
  const openRecommendations = await prisma.stockRecommendation.findMany({
    where: { status: "OPEN" },
    select: { id: true, nseCode: true },
  });

  const summary: RefreshSummary = { attempted: openRecommendations.length, updated: 0, failed: [] };

  for (const batch of chunk(openRecommendations, CONCURRENCY)) {
    await Promise.all(
      batch.map(async (rec) => {
        const quote = await provider.getQuote(rec.nseCode);
        if (!quote) {
          summary.failed.push(rec.nseCode);
          return;
        }
        await updateCurrentPrice(rec.id, quote.price, quote.changePercent);
        summary.updated += 1;
      }),
    );
  }

  return summary;
}
