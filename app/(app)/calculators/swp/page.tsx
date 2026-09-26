import type { Metadata } from "next";
import { getCalculator } from "@/lib/calculators";
import { CalculatorHeader } from "@/components/calculators/calculator-header";
import { SwpCalculator } from "@/components/calculators/swp/swp-calculator";
import { Reveal } from "@/components/motion/reveal";

const calculator = getCalculator("swp")!;

export const metadata: Metadata = { title: `${calculator.name} — WealthX` };

export default function SwpCalculatorPage() {
  return (
    <div className="space-y-6">
      <Reveal>
        <CalculatorHeader calculator={calculator} />
      </Reveal>
      <Reveal delay={0.05}>
        <SwpCalculator />
      </Reveal>
    </div>
  );
}
