import { formatInr, formatDate } from "@/lib/format";
import { getCurrentValue, getGainPercent, getHoldingDays } from "@/lib/investments/derive";
import type { Investment } from "@/lib/investments/types";
import type { RecommendationStatus } from "@/lib/recommendations/types";
import { GainPill } from "@/components/recommendations/gain-pill";
import { InvestDialog } from "@/components/investments/invest-dialog";
import { ExitDialog } from "@/components/investments/exit-dialog";

export function InvestmentPanel({
  recommendationId,
  companyName,
  currentPrice,
  recommendationStatus,
  activeInvestment,
}: {
  recommendationId: string;
  companyName: string;
  currentPrice: number;
  recommendationStatus: RecommendationStatus;
  activeInvestment: Investment | null;
}) {
  if (!activeInvestment) {
    if (recommendationStatus === "CLOSED") {
      return (
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Your position</h2>
          <p className="text-sm text-muted-foreground">
            This recommendation is closed and no longer open to new investments.
          </p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Your position</h2>
          <p className="text-sm text-muted-foreground">You haven&rsquo;t invested in this recommendation yet.</p>
        </div>
        <InvestDialog recommendationId={recommendationId} companyName={companyName} currentPrice={currentPrice} />
      </div>
    );
  }

  const gainPercent = getGainPercent(activeInvestment);
  const currentValue = getCurrentValue(activeInvestment);

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-semibold text-foreground">Your position</h2>
        <GainPill value={gainPercent} />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Current value</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{formatInr(currentValue)}</p>
          <p className="text-sm text-muted-foreground">of {formatInr(activeInvestment.amount)} invested</p>
        </div>
      </div>

      <div className="mt-4 divide-y border-t pt-1">
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-muted-foreground">Entry price</span>
          <span className="font-medium text-foreground">{formatInr(activeInvestment.entryPrice)}</span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-muted-foreground">Entry date</span>
          <span className="font-medium text-foreground">{formatDate(activeInvestment.entryDate)}</span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-muted-foreground">Held</span>
          <span className="font-medium text-foreground">{getHoldingDays(activeInvestment)} days</span>
        </div>
      </div>

      <div className="mt-4">
        <ExitDialog
          investmentId={activeInvestment.id}
          companyName={companyName}
          currentPrice={currentPrice}
        />
      </div>
    </div>
  );
}
