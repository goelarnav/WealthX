import type { Metadata } from "next";
import { getCalculator } from "@/lib/calculators";
import { CalculatorPlaceholder } from "@/components/calculators/calculator-placeholder";

const calculator = getCalculator("brokerage")!;

export const metadata: Metadata = { title: `${calculator.name} — WealthX` };

export default function BrokerageCalculatorPage() {
  return <CalculatorPlaceholder calculator={calculator} />;
}
