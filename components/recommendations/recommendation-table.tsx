"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { formatInr, formatPercent } from "@/lib/format";
import { getGainPercent, getHoldingDays, isClosed } from "@/lib/recommendations/derive";
import type { Recommendation } from "@/lib/recommendations/types";
import { StatusBadge } from "@/components/recommendations/status-badge";
import { GainPill } from "@/components/recommendations/gain-pill";

export function RecommendationTable({ recommendations }: { recommendations: Recommendation[] }) {
  const router = useRouter();

  return (
    <div className="hidden overflow-hidden rounded-xl border md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">Stock</th>
            <th className="px-4 py-3 text-right font-medium">Buy Price</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-right font-medium">Today</th>
            <th className="px-4 py-3 text-right font-medium">Gain</th>
            <th className="px-4 py-3 text-right font-medium">Entry Date</th>
            <th className="px-4 py-3 text-right font-medium">Holding</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="w-8 px-2 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {recommendations.map((rec) => {
            const closed = isClosed(rec);
            const displayPrice = closed && rec.sellPrice != null ? rec.sellPrice : rec.currentPrice;

            return (
              <tr
                key={rec.id}
                tabIndex={0}
                role="link"
                onClick={() => router.push(`/recommendations/${rec.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") router.push(`/recommendations/${rec.id}`);
                }}
                className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{rec.companyName}</p>
                  <p className="text-xs text-muted-foreground">{rec.nseCode}</p>
                </td>
                <td className="px-4 py-3 text-right text-foreground">{formatInr(rec.purchasePrice)}</td>
                <td className="px-4 py-3 text-right">
                  <p className="text-foreground">{formatInr(displayPrice)}</p>
                  <p className="text-xs text-muted-foreground">{closed ? "Sold at" : "CMP"}</p>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {rec.dayChangePercent != null ? formatPercent(rec.dayChangePercent) : "–"}
                </td>
                <td className="px-4 py-3 text-right">
                  <GainPill value={getGainPercent(rec)} className="justify-end" />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "2-digit" }).format(
                    rec.purchaseDate,
                  )}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{getHoldingDays(rec)}d</td>
                <td className="px-4 py-3">
                  <StatusBadge status={rec.status} />
                </td>
                <td className="px-2 py-3">
                  <ChevronRight className="size-4 text-muted-foreground/50" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
