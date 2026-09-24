import { NextResponse, type NextRequest } from "next/server";
import { refreshAllPrices } from "@/lib/market/refresh-prices";

/**
 * System-to-system endpoint for a scheduler (cron, GitHub Actions, Vercel
 * Cron, ...) to hit periodically during market hours — not something a
 * logged-in user calls, so it's gated by a shared secret instead of a
 * user session.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.MARKET_REFRESH_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await refreshAllPrices();
  return NextResponse.json(summary);
}
