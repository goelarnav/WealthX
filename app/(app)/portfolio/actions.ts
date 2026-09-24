"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createInvestment, exitInvestment, InvestmentError } from "@/lib/investments/repository";
import { investAmountSchema, exitPriceSchema } from "@/lib/validators/investment";
import type { ActionResult } from "@/lib/action-result";

export async function invest(recommendationId: string, rawAmount: string): Promise<ActionResult> {
  const user = await requireUser();
  const amount = investAmountSchema.safeParse(rawAmount);
  if (!amount.success) {
    return { ok: false, error: amount.error.issues[0]?.message ?? "Invalid amount" };
  }

  try {
    await createInvestment(user.id, recommendationId, amount.data);
  } catch (error) {
    return { ok: false, error: error instanceof InvestmentError ? error.message : "Could not record your investment." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/recommendations/${recommendationId}`);
  revalidatePath("/portfolio");
  return { ok: true };
}

export async function exit(investmentId: string, rawExitPrice: string): Promise<ActionResult> {
  const user = await requireUser();
  const exitPrice = exitPriceSchema.safeParse(rawExitPrice);
  if (!exitPrice.success) {
    return { ok: false, error: exitPrice.error.issues[0]?.message ?? "Invalid price" };
  }

  try {
    const investment = await exitInvestment(investmentId, user.id, {
      exitPrice: exitPrice.data,
      exitDate: new Date(),
    });
    revalidatePath("/dashboard");
    revalidatePath(`/recommendations/${investment.recommendationId}`);
    revalidatePath("/portfolio");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof InvestmentError ? error.message : "Could not record your exit." };
  }
}
