import "server-only";
import { cookies } from "next/headers";
import { PIN_RESET_COOKIE, SIGNUP_COOKIE, signToken, verifyToken } from "@/lib/auth/jwt";

/**
 * Short-lived, phone-scoped tokens issued right after an OTP is verified.
 * They let the next step of a flow (create profile / set new PIN) trust
 * that this phone was just proven, without carrying the phone number in a
 * URL query string. Each is a distinct cookie so signup and PIN-reset
 * flows can't be mixed up.
 */

async function issue(cookieName: string, phone: string, ttl: string) {
  const token = await signToken({ phone }, ttl);
  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
}

async function read(cookieName: string): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyToken<{ phone: string }>(token);
  return payload?.phone ?? null;
}

async function clear(cookieName: string) {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export const issueSignupToken = (phone: string) => issue(SIGNUP_COOKIE, phone, "15m");
export const readSignupPhone = () => read(SIGNUP_COOKIE);
export const clearSignupToken = () => clear(SIGNUP_COOKIE);

export const issuePinResetToken = (phone: string) => issue(PIN_RESET_COOKIE, phone, "10m");
export const readPinResetPhone = () => read(PIN_RESET_COOKIE);
export const clearPinResetToken = () => clear(PIN_RESET_COOKIE);
