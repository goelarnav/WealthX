import type { Metadata } from "next";
import { getCalculator } from "@/lib/calculators";
import { CalculatorPlaceholder } from "@/components/calculators/calculator-placeholder";

const calculator = getCalculator("swp")!;

export const metadata: Metadata = { title: `${calculator.name} — WealthX` };

export default function SwpCalculatorPage() {
  return <CalculatorPlaceholder calculator={calculator} />;
}
