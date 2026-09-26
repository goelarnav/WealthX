import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CalcStatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: "teal" | "rose" | "amber" | "neutral";
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2.5">
        {Icon ? (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              tone === "teal" && "bg-teal-50 text-teal-600",
              tone === "rose" && "bg-rose-50 text-rose-600",
              tone === "amber" && "bg-amber-50 text-amber-600",
              tone === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={cn(
          "mt-2.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
          tone === "teal" && "text-teal-700",
          tone === "rose" && "text-rose-600",
        )}
      >
        {value}
      </p>
      {sublabel ? <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p> : null}
    </div>
  );
}
