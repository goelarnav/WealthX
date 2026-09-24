import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getUserInvestments } from "@/lib/investments/repository";
import { summarizeInvestments } from "@/lib/investments/derive";
import { PortfolioSummaryCards } from "@/components/investments/portfolio-summary-cards";
import { InvestmentList } from "@/components/investments/investment-list";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "My Stocks — WealthX" };

export default async function PortfolioPage() {
  const user = await requireUser();
  const investments = await getUserInvestments(user.id);
  const summary = summarizeInvestments(investments);

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Stocks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recommendations you&rsquo;ve personally invested in, and your history.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <PortfolioSummaryCards summary={summary} />
      </Reveal>

      <Reveal delay={0.1}>
        <InvestmentList investments={investments} />
      </Reveal>
    </div>
  );
}
