import { formatInr, formatPercent, formatDate } from "@/lib/format";
import { getGainPercent, isClosed } from "@/lib/recommendations/derive";
import type { Recommendation } from "@/lib/recommendations/types";
import { StatusBadge } from "@/components/recommendations/status-badge";
import { GainPill } from "@/components/recommendations/gain-pill";
import { UpdateCmpDialog } from "@/components/admin/update-cmp-dialog";
import { CloseRecommendationDialog } from "@/components/admin/close-recommendation-dialog";

export function AdminRecommendationTable({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
            <th className="px-4 py-3 text-left font-medium">Stock</th>
            <th className="px-4 py-3 text-right font-medium">Buy Price</th>
            <th className="px-4 py-3 text-right font-medium">CMP</th>
            <th className="px-4 py-3 text-right font-medium">Gain</th>
            <th className="px-4 py-3 text-right font-medium">Purchase Date</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {recommendations.map((rec) => {
            const closed = isClosed(rec);
            return (
              <tr key={rec.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{rec.companyName}</p>
                  <p className="text-xs text-muted-foreground">{rec.nseCode}</p>
                </td>
                <td className="px-4 py-3 text-right text-foreground">{formatInr(rec.purchasePrice)}</td>
                <td className="px-4 py-3 text-right">
                  <p className="text-foreground">{formatInr(rec.currentPrice)}</p>
                  <p className="text-xs text-muted-foreground">
                    {rec.dayChangePercent != null ? formatPercent(rec.dayChangePercent) : "–"}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <GainPill value={getGainPercent(rec)} className="justify-end" />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(rec.purchaseDate)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={rec.status} />
                  {closed && rec.sellDate ? (
                    <p className="mt-1 text-xs text-muted-foreground">Sold {formatDate(rec.sellDate)}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {!closed && (
                      <>
                        <UpdateCmpDialog
                          recommendationId={rec.id}
                          companyName={rec.companyName}
                          currentPrice={rec.currentPrice}
                          dayChangePercent={rec.dayChangePercent}
                        />
                        <CloseRecommendationDialog
                          recommendationId={rec.id}
                          companyName={rec.companyName}
                          currentPrice={rec.currentPrice}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
