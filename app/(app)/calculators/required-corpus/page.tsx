import type { Metadata } from "next";
import { getCalculator } from "@/lib/calculators";
import { CalculatorHeader } from "@/components/calculators/calculator-header";
import { RequiredCorpusCalculator } from "@/components/calculators/required-corpus/required-corpus-calculator";
import { Reveal } from "@/components/motion/reveal";

const calculator = getCalculator("required-corpus")!;

export const metadata: Metadata = { title: `${calculator.name} — WealthX` };

export default function RequiredCorpusCalculatorPage() {
  return (
    <div className="space-y-6">
      <Reveal>
        <CalculatorHeader calculator={calculator} />
      </Reveal>
      <Reveal delay={0.05}>
        <RequiredCorpusCalculator />
      </Reveal>
    </div>
  );
}
