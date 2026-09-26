"use server";

import { verifyAdminCredentials, createAdminSession } from "@/lib/auth/admin-session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { adminLoginSchema } from "@/lib/validators/admin";
import type { ActionResult } from "@/lib/action-result";

const GENERIC_ERROR = "Invalid username or password.";

export async function adminLogin(username: string, password: string): Promise<ActionResult> {
  const parsed = adminLoginSchema.safeParse({ username, password });
  if (!parsed.success) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const limit = checkRateLimit(`admin-login:${parsed.data.username}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.` };
  }

  const isValid = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
  if (!isValid) {
    return { ok: false, error: GENERIC_ERROR };
  }

  await createAdminSession();
  return { ok: true };
}
