import { fetchYahooQuote, type Quote } from "@/lib/market/yahoo-finance";

/**
 * Abstraction over "where do live prices come from" — mirrors
 * lib/auth/otp-provider.ts so a paid vendor (Kite Connect, Upstox,
 * TrueData, ...) can be swapped in later without touching the refresh
 * job or anything that calls it.
 */
export interface PriceProvider {
  getQuote(nseCode: string): Promise<Quote | null>;
}

class YahooFinanceProvider implements PriceProvider {
  getQuote(nseCode: string): Promise<Quote | null> {
    return fetchYahooQuote(nseCode);
  }
}

let cachedProvider: PriceProvider | undefined;

export function getPriceProvider(): PriceProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.MARKET_DATA_PROVIDER ?? "yahoo";
  if (providerName !== "yahoo") {
    throw new Error(
      `Market data provider "${providerName}" is not implemented yet. Set MARKET_DATA_PROVIDER=yahoo.`,
    );
  }

  cachedProvider = new YahooFinanceProvider();
  return cachedProvider;
}
