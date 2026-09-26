import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ phase }: { phase: "Accumulation" | "Drawdown" }) {
  const isDrawdown = phase === "Drawdown";
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-none font-medium",
        isDrawdown ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground",
      )}
    >
      {phase}
    </Badge>
  );
}
