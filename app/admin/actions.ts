"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession, destroyAdminSession } from "@/lib/auth/admin-session";
import {
  createRecommendation,
  updateCurrentPrice,
  closeRecommendation,
} from "@/lib/recommendations/repository";
import {
  createRecommendationSchema,
  updateCmpSchema,
  closeRecommendationSchema,
} from "@/lib/validators/recommendation";
import type { ActionResult } from "@/lib/action-result";

function revalidateRecommendationPaths(id?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  if (id) revalidatePath(`/recommendations/${id}`);
}

export async function addRecommendation(input: {
  companyName: string;
  nseCode: string;
  purchasePrice: string;
  purchaseDate: string;
}): Promise<ActionResult> {
  await requireAdminSession();

  const parsed = createRecommendationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await createRecommendation({
    companyName: parsed.data.companyName,
    nseCode: parsed.data.nseCode,
    purchasePrice: parsed.data.purchasePrice,
    currentPrice: parsed.data.purchasePrice,
    purchaseDate: parsed.data.purchaseDate,
  });

  revalidateRecommendationPaths();
  return { ok: true };
}

export async function updateCmp(
  recommendationId: string,
  input: { currentPrice: string; dayChangePercent: string },
): Promise<ActionResult> {
  await requireAdminSession();

  const parsed = updateCmpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await updateCurrentPrice(recommendationId, parsed.data.currentPrice, parsed.data.dayChangePercent ?? null);
  revalidateRecommendationPaths(recommendationId);
  return { ok: true };
}

export async function closeRecommendationAction(
  recommendationId: string,
  input: { sellPrice: string; sellDate: string },
): Promise<ActionResult> {
  await requireAdminSession();

  const parsed = closeRecommendationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await closeRecommendation(recommendationId, { sellPrice: parsed.data.sellPrice, sellDate: parsed.data.sellDate });
  revalidateRecommendationPaths(recommendationId);
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
