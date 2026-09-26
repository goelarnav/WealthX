import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getAllRecommendations } from "@/lib/recommendations/repository";
import { adminLogout } from "@/app/admin/actions";
import { Brand } from "@/components/navigation/brand";
import { Button } from "@/components/ui/button";
import { AddRecommendationDialog } from "@/components/admin/add-recommendation-dialog";
import { AdminRecommendationTable } from "@/components/admin/admin-recommendation-table";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "Admin — WealthX" };

export default async function AdminPage() {
  await requireAdminSession();
  const recommendations = await getAllRecommendations();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Brand />
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Admin
            </span>
          </div>
          <form action={adminLogout}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Recommendations</h1>
              <p className="mt-1 text-sm text-muted-foreground">Add recommendations, update CMP, and close positions.</p>
            </div>
            <AddRecommendationDialog />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <AdminRecommendationTable recommendations={recommendations} />
        </Reveal>
      </main>
    </div>
  );
}
