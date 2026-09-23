import { prisma } from "@/lib/db/prisma";
import type { StockRecommendation as PrismaRecommendation } from "@prisma/client";
import type { Recommendation, RecommendationStatus } from "./types";

function toDTO(row: PrismaRecommendation): Recommendation {
  return {
    id: row.id,
    companyName: row.companyName,
    nseCode: row.nseCode,
    purchasePrice: row.purchasePrice.toNumber(),
    currentPrice: row.currentPrice.toNumber(),
    dayChangePercent: row.dayChangePercent ? row.dayChangePercent.toNumber() : null,
    purchaseDate: row.purchaseDate,
    status: row.status,
    sellDate: row.sellDate,
    sellPrice: row.sellPrice ? row.sellPrice.toNumber() : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllRecommendations(): Promise<Recommendation[]> {
  const rows = await prisma.stockRecommendation.findMany({
    orderBy: { purchaseDate: "desc" },
  });
  return rows.map(toDTO);
}

export async function getRecommendationById(id: string): Promise<Recommendation | null> {
  const row = await prisma.stockRecommendation.findUnique({ where: { id } });
  return row ? toDTO(row) : null;
}

// --- Admin-facing writes -----------------------------------------------
// No admin UI in this MVP, but the dashboard is only ever a reader of this
// data, so these are the seams a future admin panel (or a scheduled CMP
// updater, or a CSV importer) will call into.

export interface CreateRecommendationInput {
  companyName: string;
  nseCode: string;
  purchasePrice: number;
  currentPrice: number;
  dayChangePercent?: number | null;
  purchaseDate: Date;
  status?: RecommendationStatus;
  sellDate?: Date | null;
  sellPrice?: number | null;
}

export async function createRecommendation(
  input: CreateRecommendationInput,
): Promise<Recommendation> {
  const row = await prisma.stockRecommendation.create({
    data: {
      companyName: input.companyName,
      nseCode: input.nseCode,
      purchasePrice: input.purchasePrice,
      currentPrice: input.currentPrice,
      dayChangePercent: input.dayChangePercent ?? null,
      purchaseDate: input.purchaseDate,
      status: input.status ?? "OPEN",
      sellDate: input.sellDate ?? null,
      sellPrice: input.sellPrice ?? null,
    },
  });
  return toDTO(row);
}

export async function updateCurrentPrice(
  id: string,
  currentPrice: number,
  dayChangePercent?: number | null,
): Promise<Recommendation> {
  const row = await prisma.stockRecommendation.update({
    where: { id },
    data: {
      currentPrice,
      ...(dayChangePercent !== undefined ? { dayChangePercent } : {}),
    },
  });
  return toDTO(row);
}

export interface CloseRecommendationInput {
  sellPrice: number;
  sellDate: Date;
}

export async function closeRecommendation(
  id: string,
  input: CloseRecommendationInput,
): Promise<Recommendation> {
  const row = await prisma.stockRecommendation.update({
    where: { id },
    data: {
      status: "CLOSED",
      sellPrice: input.sellPrice,
      sellDate: input.sellDate,
    },
  });
  return toDTO(row);
}

/** Funnel for a future Excel/CSV import feature: parse rows elsewhere,
 * then hand the normalized objects to this. The seed script uses the same
 * path so seed data and future imports can never drift apart. */
export async function importRecommendations(
  inputs: CreateRecommendationInput[],
): Promise<void> {
  for (const input of inputs) {
    await createRecommendation(input);
  }
}
