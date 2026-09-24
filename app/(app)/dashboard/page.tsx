import type { Metadata } from "next";
import { getAllRecommendations } from "@/lib/recommendations/repository";
import { summarizeRecommendations } from "@/lib/recommendations/derive";
import { requireUser } from "@/lib/auth/session";
import { getActiveInvestmentsByRecommendation } from "@/lib/investments/repository";
import { SummaryCards } from "@/components/recommendations/summary-cards";
import { RecommendationList } from "@/components/recommendations/recommendation-list";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Recommendations — WealthX" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [recommendations, activeInvestments] = await Promise.all([
    getAllRecommendations(),
    getActiveInvestmentsByRecommendation(user.id),
  ]);
  const summary = summarizeRecommendations(recommendations);
  const investedRecommendationIds = [...activeInvestments.keys()];

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Stock Recommendations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track our active and completed stock recommendations.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <SummaryCards summary={summary} />
      </Reveal>

      <Reveal delay={0.1}>
        <RecommendationList recommendations={recommendations} investedRecommendationIds={investedRecommendationIds} />
      </Reveal>
    </div>
  );
}
