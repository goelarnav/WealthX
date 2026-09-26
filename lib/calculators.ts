import { PiggyBank, Wallet, Receipt, Scale, CreditCard, Tag, Target, type LucideIcon } from "lucide-react";

export interface CalculatorMeta {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

// Single source of truth for the "More" menu, the /calculators overview,
// and each calculator's own page — add a calculator by adding one entry
// here plus its app/calculators/<slug>/page.tsx.
export const CALCULATORS: CalculatorMeta[] = [
  {
    slug: "sip",
    name: "SIP Calculator",
    description: "Find the monthly SIP needed to hit a target corpus by retirement.",
    icon: PiggyBank,
  },
  {
    slug: "swp",
    name: "SWP Calculator",
    description: "See how long your corpus lasts against retirement withdrawals.",
    icon: Wallet,
  },
  {
    slug: "brokerage",
    name: "Brokerage Calculator",
    description: "Estimate brokerage and transaction charges on your trades.",
    icon: Receipt,
  },
  {
    slug: "margin",
    name: "Margin Calculator",
    description: "Check margin requirements for intraday and F&O trades.",
    icon: Scale,
  },
  {
    slug: "credit",
    name: "Loan / Credit Calculator",
    description: "Calculate EMIs and total interest payable on a loan.",
    icon: CreditCard,
  },
  {
    slug: "pricing",
    name: "Pricing / Charges Calculator",
    description: "Break down platform fees and other charges.",
    icon: Tag,
  },
  {
    slug: "required-corpus",
    name: "Required Corpus Calculator",
    description: "Work out the retirement corpus your expenses will need.",
    icon: Target,
  },
];

export function getCalculator(slug: string): CalculatorMeta | undefined {
  return CALCULATORS.find((calculator) => calculator.slug === slug);
}
