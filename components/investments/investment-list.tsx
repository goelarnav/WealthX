"use client";

import { useMemo, useState } from "react";
import { isActive } from "@/lib/investments/derive";
import type { Investment } from "@/lib/investments/types";
import { InvestmentCard } from "@/components/investments/investment-card";
import { EmptyState } from "@/components/recommendations/empty-state";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "ACTIVE" | "EXITED";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXITED", label: "Exited" },
];

export function InvestmentList({ investments }: { investments: Investment[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return investments;
    return investments.filter((investment) => (filter === "ACTIVE" ? isActive(investment) : !isActive(investment)));
  }, [investments, filter]);

  if (investments.length === 0) {
    return <EmptyState message="You haven't invested in any recommendations yet." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === item.value
                ? "bg-teal-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No investments match this filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </div>
      )}
    </div>
  );
}
