import crypto from "node:crypto";
import { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getOtpProvider, isMockOtpProvider } from "@/lib/auth/otp-provider";
import { checkRateLimit } from "@/lib/auth/rate-limit";

const OTP_TTL_MS = Number(process.env.OTP_TTL_SECONDS ?? 300) * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_SENDS_PER_WINDOW = 3;
const SEND_WINDOW_MS = 10 * 60 * 1000;

export class OtpError extends Error {}

function generateCode(): string {
  // Not derived from Math.random(): OTPs guard account access, so use a
  // CSPRNG and reject via modulo bias-free bounding.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashCode(phone: string, code: string): string {
  return crypto.createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export interface IssueOtpResult {
  expiresAt: Date;
  /** Only set when OTP_PROVIDER=mock outside production, for on-screen testing. */
  devCode?: string;
}

export async function issueOtp(
  phone: string,
  purpose: OtpPurpose,
): Promise<IssueOtpResult> {
  const rateLimit = checkRateLimit(
    `otp-send:${phone}:${purpose}`,
    MAX_SENDS_PER_WINDOW,
    SEND_WINDOW_MS,
  );
  if (!rateLimit.ok) {
    throw new OtpError(
      `Too many OTP requests. Try again in ${rateLimit.retryAfterSeconds}s.`,
    );
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpChallenge.create({
    data: {
      phone,
      purpose,
      codeHash: hashCode(phone, code),
      expiresAt,
    },
  });

  await getOtpProvider().send(phone, code);

  const devCode =
    isMockOtpProvider() && process.env.NODE_ENV !== "production"
      ? code
      : undefined;

  return { expiresAt, devCode };
}

export async function verifyOtp(
  phone: string,
  purpose: OtpPurpose,
  code: string,
): Promise<void> {
  const verifyLimit = checkRateLimit(`otp-verify:${phone}:${purpose}`, 10, SEND_WINDOW_MS);
  if (!verifyLimit.ok) {
    throw new OtpError(
      `Too many attempts. Try again in ${verifyLimit.retryAfterSeconds}s.`,
    );
  }

  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    throw new OtpError("No pending code for this number. Request a new one.");
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    throw new OtpError("This code has expired. Request a new one.");
  }

  if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
    throw new OtpError("Too many incorrect attempts. Request a new code.");
  }

  const isMatch = challenge.codeHash === hashCode(phone, code);

  if (!isMatch) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    throw new OtpError("Incorrect code. Please try again.");
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
}
