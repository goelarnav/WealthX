import { Construction } from "lucide-react";
import type { CalculatorMeta } from "@/lib/calculators";
import { Reveal } from "@/components/motion/reveal";
import { CalculatorHeader } from "@/components/calculators/calculator-header";

export function CalculatorPlaceholder({ calculator }: { calculator: CalculatorMeta }) {
  return (
    <Reveal className="mx-auto max-w-lg space-y-6">
      <CalculatorHeader calculator={calculator} />

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
        <Construction className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">Coming soon</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We&rsquo;re building this calculator. It&rsquo;ll appear here once it&rsquo;s ready.
        </p>
      </div>
    </Reveal>
  );
}
