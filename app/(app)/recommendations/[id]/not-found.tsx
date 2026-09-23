import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function RecommendationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-20 text-center">
      <SearchX className="size-8 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">Recommendation not found</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        It may have been removed, or the link is incorrect.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        <ArrowLeft className="size-4" />
        Back to recommendations
      </Link>
    </div>
  );
}
