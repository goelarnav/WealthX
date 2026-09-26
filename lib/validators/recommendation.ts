import { z } from "zod";

export const createRecommendationSchema = z.object({
  companyName: z.string().trim().min(2, "Company name is too short").max(120),
  nseCode: z
    .string()
    .trim()
    .min(1, "NSE code is required")
    .max(20)
    .transform((value) => value.toUpperCase()),
  purchasePrice: z.coerce.number().positive("Enter a valid purchase price"),
  purchaseDate: z.coerce.date(),
});

export const updateCmpSchema = z.object({
  currentPrice: z.coerce.number().positive("Enter a valid price"),
  dayChangePercent: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().optional(),
  ),
});

export const closeRecommendationSchema = z.object({
  sellPrice: z.coerce.number().positive("Enter a valid sell price"),
  sellDate: z.coerce.date(),
});
