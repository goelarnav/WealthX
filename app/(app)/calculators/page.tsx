import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { CALCULATORS } from "@/lib/calculators";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Calculators — WealthX" };

export default function CalculatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calculators</h1>
        <p className="mt-1 text-sm text-muted-foreground">Handy financial tools, right alongside your recommendations.</p>
      </div>

      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2">
          {CALCULATORS.map((calculator) => (
            <Link
              key={calculator.slug}
              href={`/calculators/${calculator.slug}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <calculator.icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{calculator.name}</p>
                <p className="truncate text-xs text-muted-foreground">{calculator.description}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
