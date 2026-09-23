import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

/** Small +/- percent indicator. Used deliberately sparingly (gain/loss
 * figures only) rather than tinting the whole UI red/green. */
export function GainPill({ value, className }: { value: number; className?: string }) {
  const isPositive = value >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-medium",
        isPositive ? "text-teal-700" : "text-rose-600",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {formatPercent(value)}
    </span>
  );
}
