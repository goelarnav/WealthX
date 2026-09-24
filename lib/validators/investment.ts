import { z } from "zod";

export const investAmountSchema = z.coerce
  .number()
  .positive("Enter an amount greater than 0")
  .max(100_000_000, "That amount looks too large");

export const exitPriceSchema = z.coerce.number().positive("Enter a valid price");
