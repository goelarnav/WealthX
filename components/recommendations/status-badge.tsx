import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecommendationStatus } from "@/lib/recommendations/types";

export function StatusBadge({ status, className }: { status: RecommendationStatus; className?: string }) {
  const isOpen = status === "OPEN";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-none font-medium",
        isOpen ? "bg-teal-50 text-teal-700" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", isOpen ? "bg-teal-600" : "bg-muted-foreground/60")} />
      {isOpen ? "OPEN" : "CLOSED"}
    </Badge>
  );
}
