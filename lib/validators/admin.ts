import { z } from "zod";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Enter a username"),
  password: z.string().min(1, "Enter a password"),
});
