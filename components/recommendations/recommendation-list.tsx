"use client";

import { useMemo, useState } from "react";
import { filterRecommendations, type StatusFilter } from "@/lib/recommendations/derive";
import type { Recommendation } from "@/lib/recommendations/types";
import { FilterBar } from "@/components/recommendations/filter-bar";
import { RecommendationTable } from "@/components/recommendations/recommendation-table";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { EmptyState } from "@/components/recommendations/empty-state";

export function RecommendationList({
  recommendations,
  investedRecommendationIds = [],
}: {
  recommendations: Recommendation[];
  investedRecommendationIds?: string[];
}) {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterRecommendations(recommendations, filter, query),
    [recommendations, filter, query],
  );
  const investedSet = useMemo(() => new Set(investedRecommendationIds), [investedRecommendationIds]);

  return (
    <div className="space-y-4">
      <FilterBar filter={filter} onFilterChange={setFilter} query={query} onQueryChange={setQuery} />

      {filtered.length === 0 ? (
        <EmptyState
          message={
            recommendations.length === 0
              ? "No recommendations available."
              : "No recommendations match your filters."
          }
        />
      ) : (
        <>
          <RecommendationTable recommendations={filtered} investedIds={investedSet} />
          <div className="space-y-3 md:hidden">
            {filtered.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} invested={investedSet.has(rec.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
