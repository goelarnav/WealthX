import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { isClosed } from "@/lib/recommendations/derive";
import type { Recommendation } from "@/lib/recommendations/types";

type StepState = "done" | "active" | "pending";

export function Timeline({ recommendation: rec }: { recommendation: Recommendation }) {
  const closed = isClosed(rec);

  const steps: { label: string; date: string; state: StepState }[] = [
    { label: "Entry", date: formatDate(rec.purchaseDate), state: "done" },
    { label: "Currently Active", date: closed ? "Completed" : "Ongoing", state: closed ? "done" : "active" },
    { label: "Exit", date: closed && rec.sellDate ? formatDate(rec.sellDate) : "Not yet", state: closed ? "done" : "pending" },
  ];

  return (
    <div className="flex items-start">
      {steps.map((step, index) => (
        <div key={step.label} className="flex flex-1 items-start last:flex-none">
          <div className="flex w-20 flex-col items-center text-center sm:w-28">
            <span
              className={cn(
                "size-3 rounded-full",
                step.state === "done" && "bg-teal-600",
                step.state === "active" && "bg-teal-600 ring-4 ring-teal-100",
                step.state === "pending" && "border-2 border-muted-foreground/30 bg-background",
              )}
            />
            <p className="mt-2 text-xs font-medium text-foreground">{step.label}</p>
            <p className="text-xs text-muted-foreground">{step.date}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={cn("mt-1.5 h-px flex-1", step.state === "done" ? "bg-teal-600" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
  );
}
