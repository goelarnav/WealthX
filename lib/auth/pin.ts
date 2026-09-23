import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@prisma/client";

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export class PinLockedError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(`Account temporarily locked. Try again in ${retryAfterSeconds}s.`);
  }
}

/**
 * Verifies a PIN against the stored hash, tracking failed attempts on the
 * user row itself. A 4-digit PIN has only 10,000 possibilities, so hashing
 * alone can't make brute-forcing expensive — lockout after repeated
 * failures is the real defense here.
 */
export async function verifyPinOrThrow(user: User, pin: string): Promise<void> {
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    throw new PinLockedError(
      Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000),
    );
  }

  const isMatch = await bcrypt.compare(pin, user.pinHash);

  if (!isMatch) {
    const failedPinAttempts = user.failedPinAttempts + 1;
    const lockedUntil =
      failedPinAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_DURATION_MS)
        : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { failedPinAttempts, lockedUntil },
    });

    if (lockedUntil) {
      throw new PinLockedError(Math.ceil(LOCK_DURATION_MS / 1000));
    }

    throw new Error("Incorrect PIN.");
  }

  if (user.failedPinAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedPinAttempts: 0, lockedUntil: null },
    });
  }
}
