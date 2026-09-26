/** Compact currency for chart axes/tooltips and KPI tiles — e.g. ₹1.23 Cr. */
export function formatInrCompact(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentPrecise(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Lets someone type "1.5 Cr", "10k", "1,00,000" etc. into an amount field
 * instead of counting zeros — common shorthand in Indian rupee amounts.
 * Throws on anything that isn't a clean number (never returns NaN).
 */
export function parseAmountShorthand(value: string): number {
  let sanitized = value.replace(/₹|,|\s/g, "").toLowerCase();
  if (sanitized === "") throw new Error("Invalid input");

  let multiplier = 1;
  if (sanitized.endsWith("cr") || sanitized.endsWith("crore")) {
    multiplier = 10_000_000;
    sanitized = sanitized.replace(/cr(ore)?$/, "");
  } else if (sanitized.endsWith("lakh") || sanitized.endsWith("l")) {
    multiplier = 100_000;
    sanitized = sanitized.replace(/l(akh)?$/, "");
  } else if (sanitized.endsWith("k")) {
    multiplier = 1000;
    sanitized = sanitized.replace("k", "");
  }

  const parsed = Number(sanitized);
  if (isNaN(parsed) || !isFinite(parsed) || sanitized.startsWith("0x")) {
    throw new Error("Invalid input");
  }

  return (parsed === -0 ? 0 : parsed) * multiplier;
}
