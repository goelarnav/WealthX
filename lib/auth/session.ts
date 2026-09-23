import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE, signToken, verifyToken } from "@/lib/auth/jwt";

const SESSION_TTL = "30d";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
};

// Fields intentionally exclude pinHash and lockout counters — nothing in
// this shape should ever be sent to the client.
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  phone: true,
  createdAt: true,
} as const;

export async function createSession(userId: string): Promise<void> {
  const token = await signToken({ sub: userId }, SESSION_TTL);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyToken<{ sub: string }>(token);
  return payload?.sub ?? null;
}

// cache() dedupes this across the layout + page components that each
// need the current user within a single request.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });
});

/** Server Component / Server Action guard. Middleware already redirects
 * unauthenticated requests away from protected routes; this is the
 * defense-in-depth check at the data-access layer. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
