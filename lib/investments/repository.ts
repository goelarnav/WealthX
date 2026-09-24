import { prisma } from "@/lib/db/prisma";
import type { Investment as PrismaInvestment, StockRecommendation } from "@prisma/client";
import type { Investment } from "./types";

type PrismaInvestmentWithRecommendation = PrismaInvestment & {
  recommendation: Pick<StockRecommendation, "companyName" | "nseCode" | "currentPrice" | "status">;
};

const RECOMMENDATION_SELECT = {
  companyName: true,
  nseCode: true,
  currentPrice: true,
  status: true,
} as const;

function toDTO(row: PrismaInvestmentWithRecommendation): Investment {
  return {
    id: row.id,
    userId: row.userId,
    recommendationId: row.recommendationId,
    amount: row.amount.toNumber(),
    entryPrice: row.entryPrice.toNumber(),
    entryDate: row.entryDate,
    status: row.status,
    exitPrice: row.exitPrice ? row.exitPrice.toNumber() : null,
    exitDate: row.exitDate,
    createdAt: row.createdAt,
    recommendation: {
      companyName: row.recommendation.companyName,
      nseCode: row.recommendation.nseCode,
      currentPrice: row.recommendation.currentPrice.toNumber(),
      status: row.recommendation.status,
    },
  };
}

export async function getUserInvestments(userId: string): Promise<Investment[]> {
  const rows = await prisma.investment.findMany({
    where: { userId },
    include: { recommendation: { select: RECOMMENDATION_SELECT } },
    orderBy: { entryDate: "desc" },
  });
  return rows.map(toDTO);
}

/** Keyed by recommendationId, ACTIVE positions only — what the dashboard
 * and recommendation detail page need to decide "Invest" vs "Invested". */
export async function getActiveInvestmentsByRecommendation(
  userId: string,
): Promise<Map<string, Investment>> {
  const rows = await prisma.investment.findMany({
    where: { userId, status: "ACTIVE" },
    include: { recommendation: { select: RECOMMENDATION_SELECT } },
  });
  return new Map(rows.map((row) => [row.recommendationId, toDTO(row)]));
}

export async function getActiveInvestmentFor(
  userId: string,
  recommendationId: string,
): Promise<Investment | null> {
  const row = await prisma.investment.findFirst({
    where: { userId, recommendationId, status: "ACTIVE" },
    include: { recommendation: { select: RECOMMENDATION_SELECT } },
  });
  return row ? toDTO(row) : null;
}

export async function getInvestmentById(id: string): Promise<Investment | null> {
  const row = await prisma.investment.findUnique({
    where: { id },
    include: { recommendation: { select: RECOMMENDATION_SELECT } },
  });
  return row ? toDTO(row) : null;
}

export class InvestmentError extends Error {}

export async function createInvestment(
  userId: string,
  recommendationId: string,
  amount: number,
): Promise<Investment> {
  const recommendation = await prisma.stockRecommendation.findUnique({
    where: { id: recommendationId },
  });
  if (!recommendation) {
    throw new InvestmentError("Recommendation not found.");
  }
  if (recommendation.status !== "OPEN") {
    throw new InvestmentError("This recommendation is closed and no longer open to new investments.");
  }

  const existingActive = await prisma.investment.findFirst({
    where: { userId, recommendationId, status: "ACTIVE" },
  });
  if (existingActive) {
    throw new InvestmentError("You already have an active investment in this recommendation.");
  }

  const row = await prisma.investment.create({
    data: {
      userId,
      recommendationId,
      amount,
      entryPrice: recommendation.currentPrice,
    },
    include: { recommendation: { select: RECOMMENDATION_SELECT } },
  });
  return toDTO(row);
}

export async function exitInvestment(
  investmentId: string,
  userId: string,
  input: { exitPrice: number; exitDate: Date },
): Promise<Investment> {
  const existing = await prisma.investment.findUnique({ where: { id: investmentId } });
  if (!existing || existing.userId !== userId) {
    throw new InvestmentError("Investment not found.");
  }
  if (existing.status !== "ACTIVE") {
    throw new InvestmentError("This investment has already been exited.");
  }

  const row = await prisma.investment.update({
    where: { id: investmentId },
    data: { status: "EXITED", exitPrice: input.exitPrice, exitDate: input.exitDate },
    include: { recommendation: { select: RECOMMENDATION_SELECT } },
  });
  return toDTO(row);
}
