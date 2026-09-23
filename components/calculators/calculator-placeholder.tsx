import { Construction } from "lucide-react";
import type { CalculatorMeta } from "@/lib/calculators";
import { Reveal } from "@/components/motion/reveal";

export function CalculatorPlaceholder({ calculator }: { calculator: CalculatorMeta }) {
  return (
    <Reveal className="mx-auto max-w-lg space-y-6">
      <div>
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <calculator.icon className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{calculator.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{calculator.description}</p>
      </div>

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
