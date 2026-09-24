import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getRecommendationById } from "@/lib/recommendations/repository";
import { getGainPercent, getHoldingDays, isClosed } from "@/lib/recommendations/derive";
import { formatInr, formatPercent, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/auth/session";
import { getActiveInvestmentFor } from "@/lib/investments/repository";
import { StatusBadge } from "@/components/recommendations/status-badge";
import { GainPill } from "@/components/recommendations/gain-pill";
import { Timeline } from "@/components/recommendations/timeline";
import { InvestmentPanel } from "@/components/investments/investment-panel";
import { Reveal } from "@/components/motion/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const rec = await getRecommendationById(id);
  return { title: rec ? `${rec.companyName} — WealthX` : "Recommendation — WealthX" };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function RecommendationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const rec = await getRecommendationById(id);
  if (!rec) notFound();

  const activeInvestment = await getActiveInvestmentFor(user.id, id);
  const closed = isClosed(rec);
  const exitPrice = closed && rec.sellPrice != null ? rec.sellPrice : rec.currentPrice;
  const gainPercent = getGainPercent(rec);
  const holdingDays = getHoldingDays(rec);

  return (
    <div className="space-y-6 pb-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to recommendations
      </Link>

      <Reveal>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{rec.companyName}</h1>
              <p className="text-sm text-muted-foreground">{rec.nseCode}</p>
            </div>
            <StatusBadge status={rec.status} />
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{closed ? "Sold at" : "Current price"}</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{formatInr(exitPrice)}</p>
              <p className="text-sm text-muted-foreground">from {formatInr(rec.purchasePrice)} buy price</p>
            </div>
            <div className="text-right">
              <GainPill value={gainPercent} className="text-base" />
              {!closed && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Today: {rec.dayChangePercent != null ? formatPercent(rec.dayChangePercent) : "–"}
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <InvestmentPanel
          recommendationId={rec.id}
          companyName={rec.companyName}
          currentPrice={rec.currentPrice}
          recommendationStatus={rec.status}
          activeInvestment={activeInvestment}
        />
      </Reveal>

      <Reveal delay={0.1}>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Recommendation Timeline</h2>
          <p className="mb-5 text-xs text-muted-foreground">
            {closed ? "This recommendation has been closed." : "This recommendation is currently open."}
          </p>
          <Timeline recommendation={rec} />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Details</h2>
          <div className="divide-y">
            <DetailRow label="Purchase price" value={formatInr(rec.purchasePrice)} />
            <DetailRow label={closed ? "Sell price" : "Current price"} value={formatInr(exitPrice)} />
            <DetailRow
              label="Day change"
              value={rec.dayChangePercent != null ? formatPercent(rec.dayChangePercent) : "–"}
            />
            <DetailRow label={closed ? "Final gain" : "Current gain"} value={formatPercent(gainPercent)} />
            <DetailRow label="Purchase date" value={formatDate(rec.purchaseDate)} />
            {closed ? (
              <>
                <DetailRow label="Sell date" value={rec.sellDate ? formatDate(rec.sellDate) : "–"} />
                <DetailRow label="Days held" value={`${holdingDays} days`} />
              </>
            ) : (
              <DetailRow label="Days since recommendation" value={`${holdingDays} days`} />
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
