import type { Metadata } from "next";
import { getCalculator } from "@/lib/calculators";
import { CalculatorHeader } from "@/components/calculators/calculator-header";
import { CompoundingEdgeCalculator } from "@/components/calculators/compounding-edge/compounding-edge-calculator";
import { Reveal } from "@/components/motion/reveal";

const calculator = getCalculator("compounding-edge")!;

export const metadata: Metadata = { title: `${calculator.name} — WealthX` };

export default function CompoundingEdgeCalculatorPage() {
  return (
    <div className="space-y-6">
      <Reveal>
        <CalculatorHeader calculator={calculator} />
      </Reveal>
      <Reveal delay={0.05}>
        <CompoundingEdgeCalculator />
      </Reveal>
    </div>
  );
}
