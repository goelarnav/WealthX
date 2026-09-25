import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-sm shadow-teal-900/20">
        <TrendingUp className="size-4" strokeWidth={2.5} />
      </span>
      <span className="text-[17px] text-foreground">WealthX</span>
    </span>
  );
}
