"use server";

import { prisma } from "@/lib/db/prisma";
import { verifyPinOrThrow, PinLockedError } from "@/lib/auth/pin";
import { createSession } from "@/lib/auth/session";
import { phoneSchema, pinSchema } from "@/lib/validators/auth";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import type { ActionResult } from "@/lib/action-result";

const GENERIC_ERROR = "Invalid phone number or PIN.";

export async function login(rawPhone: string, rawPin: string): Promise<ActionResult> {
  const phone = phoneSchema.safeParse(rawPhone);
  const pin = pinSchema.safeParse(rawPin);
  if (!phone.success || !pin.success) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const limit = checkRateLimit(`login:${phone.data}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.` };
  }

  const user = await prisma.user.findUnique({ where: { phone: phone.data } });
  if (!user) {
    return { ok: false, error: GENERIC_ERROR };
  }

  try {
    await verifyPinOrThrow(user, pin.data);
  } catch (error) {
    if (error instanceof PinLockedError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  await createSession(user.id);
  return { ok: true };
}
