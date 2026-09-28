import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bordered, tinted wrapper that visually groups one scenario's own
 * assumptions — the accent color is the only thing that ties a panel's
 * inputs back to its bars/lines in the charts below. */
export function ScenarioPanel({
  accent,
  label,
  children,
}: {
  accent: "slate" | "teal";
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm sm:p-6",
        accent === "teal" ? "border-teal-200 bg-teal-50/30" : "border-slate-200 bg-slate-50/40",
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className={cn("size-2.5 rounded-full", accent === "teal" ? "bg-teal-600" : "bg-slate-500")} />
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
