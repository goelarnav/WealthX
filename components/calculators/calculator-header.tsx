import type { CalculatorMeta } from "@/lib/calculators";

export function CalculatorHeader({ calculator }: { calculator: CalculatorMeta }) {
  return (
    <div>
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <calculator.icon className="size-5" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{calculator.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{calculator.description}</p>
    </div>
  );
}
