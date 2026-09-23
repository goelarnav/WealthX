import type { Metadata } from "next";
import { getCalculator } from "@/lib/calculators";
import { CalculatorPlaceholder } from "@/components/calculators/calculator-placeholder";

const calculator = getCalculator("credit")!;

export const metadata: Metadata = { title: `${calculator.name} — WealthX` };

export default function CreditCalculatorPage() {
  return <CalculatorPlaceholder calculator={calculator} />;
}
