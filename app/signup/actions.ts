"use server";

import { prisma } from "@/lib/db/prisma";
import { issueOtp, verifyOtp, OtpError } from "@/lib/auth/otp";
import { hashPin } from "@/lib/auth/pin";
import { createSession } from "@/lib/auth/session";
import { issueSignupToken, readSignupPhone, clearSignupToken } from "@/lib/auth/verification";
import { phoneSchema, otpCodeSchema, nameSchema, pinSchema } from "@/lib/validators/auth";
import type { ActionResult } from "@/lib/action-result";

export async function sendSignupOtp(rawPhone: string): Promise<ActionResult<{ devCode?: string }>> {
  const parsed = phoneSchema.safeParse(rawPhone);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid phone number" };
  }
  const phone = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return { ok: false, error: "This number is already registered. Try logging in instead." };
  }

  try {
    const { devCode } = await issueOtp(phone, "SIGNUP");
    return { ok: true, data: { devCode } };
  } catch (error) {
    return { ok: false, error: error instanceof OtpError ? error.message : "Could not send OTP. Please try again." };
  }
}

export async function verifySignupOtp(rawPhone: string, rawCode: string): Promise<ActionResult> {
  const phone = phoneSchema.safeParse(rawPhone);
  const code = otpCodeSchema.safeParse(rawCode);
  if (!phone.success || !code.success) {
    return { ok: false, error: "Something went wrong. Please restart signup." };
  }

  try {
    await verifyOtp(phone.data, "SIGNUP", code.data);
    await issueSignupToken(phone.data);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof OtpError ? error.message : "Verification failed." };
  }
}

export async function completeSignup(rawName: string, rawPin: string): Promise<ActionResult> {
  const phone = await readSignupPhone();
  if (!phone) {
    return { ok: false, error: "Your verification session expired. Please start signup again." };
  }

  const name = nameSchema.safeParse(rawName);
  const pin = pinSchema.safeParse(rawPin);
  if (!name.success) return { ok: false, error: name.error.issues[0]?.message ?? "Invalid name" };
  if (!pin.success) return { ok: false, error: pin.error.issues[0]?.message ?? "Invalid PIN" };

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    await clearSignupToken();
    return { ok: false, error: "This number is already registered. Try logging in instead." };
  }

  const pinHash = await hashPin(pin.data);
  const user = await prisma.user.create({
    data: { phone, name: name.data, pinHash },
  });

  await clearSignupToken();
  await createSession(user.id);
  return { ok: true };
}
