"use server";

import { prisma } from "@/lib/db/prisma";
import { issueOtp, verifyOtp, OtpError } from "@/lib/auth/otp";
import { hashPin } from "@/lib/auth/pin";
import { issuePinResetToken, readPinResetPhone, clearPinResetToken } from "@/lib/auth/verification";
import { phoneSchema, otpCodeSchema, pinSchema } from "@/lib/validators/auth";
import type { ActionResult } from "@/lib/action-result";

export async function sendResetOtp(rawPhone: string): Promise<ActionResult<{ devCode?: string }>> {
  const parsed = phoneSchema.safeParse(rawPhone);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid phone number" };
  }
  const phone = parsed.data;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return { ok: false, error: "We couldn't find an account with that number." };
  }

  try {
    const { devCode } = await issueOtp(phone, "RESET_PIN");
    return { ok: true, data: { devCode } };
  } catch (error) {
    return { ok: false, error: error instanceof OtpError ? error.message : "Could not send OTP. Please try again." };
  }
}

export async function verifyResetOtp(rawPhone: string, rawCode: string): Promise<ActionResult> {
  const phone = phoneSchema.safeParse(rawPhone);
  const code = otpCodeSchema.safeParse(rawCode);
  if (!phone.success || !code.success) {
    return { ok: false, error: "Something went wrong. Please restart." };
  }

  try {
    await verifyOtp(phone.data, "RESET_PIN", code.data);
    await issuePinResetToken(phone.data);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof OtpError ? error.message : "Verification failed." };
  }
}

export async function completeReset(rawPin: string): Promise<ActionResult> {
  const phone = await readPinResetPhone();
  if (!phone) {
    return { ok: false, error: "Your verification session expired. Please start again." };
  }

  const pin = pinSchema.safeParse(rawPin);
  if (!pin.success) {
    return { ok: false, error: pin.error.issues[0]?.message ?? "Invalid PIN" };
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    await clearPinResetToken();
    return { ok: false, error: "We couldn't find an account with that number." };
  }

  const pinHash = await hashPin(pin.data);
  await prisma.user.update({
    where: { id: user.id },
    data: { pinHash, failedPinAttempts: 0, lockedUntil: null },
  });

  await clearPinResetToken();
  return { ok: true };
}
