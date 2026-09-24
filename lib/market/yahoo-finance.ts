export interface Quote {
  price: number;
  changePercent: number | null;
}

const FETCH_TIMEOUT_MS = 8000;

// Yahoo's unofficial chart endpoint — no API key, but it wants a
// browser-like User-Agent or some responses get rejected.
function chartUrl(nseCode: string): string {
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(nseCode)}.NS`;
}

/**
 * Fetches a single NSE quote from Yahoo Finance. This is an unofficial,
 * undocumented endpoint (no key/signup required) — it can change shape or
 * start rejecting requests without notice, so every failure mode here
 * resolves to `null` rather than throwing, and the caller just skips that
 * symbol for this refresh cycle.
 */
export async function fetchYahooQuote(nseCode: string): Promise<Quote | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(chartUrl(nseCode), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== "number") return null;

    const previousClose = meta?.previousClose ?? meta?.chartPreviousClose;
    const changePercent =
      typeof previousClose === "number" && previousClose !== 0
        ? ((price - previousClose) / previousClose) * 100
        : null;

    return { price, changePercent };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
