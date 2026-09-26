import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, signToken, verifyToken } from "@/lib/auth/jwt";

const ADMIN_SESSION_TTL = "12h";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

/**
 * Checked against ADMIN_USERNAME / ADMIN_PASSWORD_HASH in the environment —
 * there's no admin row in the database, on purpose. Generate a hash with
 * scripts/hash-admin-password.ts.
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUsername || !expectedHash) {
    throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD_HASH are not configured.");
  }

  // Always run bcrypt.compare, even on a username mismatch, so a wrong
  // username doesn't return faster than a wrong password (timing tell).
  const passwordMatches = await bcrypt.compare(password, expectedHash);
  const usernameMatches = username === expectedUsername;
  return usernameMatches && passwordMatches;
}

export async function createAdminSession(): Promise<void> {
  const token = await signToken({ role: "admin" }, ADMIN_SESSION_TTL);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;

  const payload = await verifyToken<{ role: string }>(token);
  return payload?.role === "admin";
}

/** Guard for every /admin Server Action — proxy.ts already redirects
 * unauthenticated page loads to /admin/login; this is the defense-in-depth
 * check at the mutation layer, same pattern as requireUser() for customers. */
export async function requireAdminSession(): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}
