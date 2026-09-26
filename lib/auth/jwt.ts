import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Pure, Edge-compatible JWT helpers — no Prisma import here so this module
// can also be used from middleware.ts (which runs on the Edge runtime).

export const SESSION_COOKIE = "wealthx_session";
export const SIGNUP_COOKIE = "wealthx_signup";
export const PIN_RESET_COOKIE = "wealthx_pin_reset";

// Entirely separate from the customer session cookie above — the admin
// area has its own username/password login, not tied to any User row.
export const ADMIN_SESSION_COOKIE = "wealthx_admin_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: JWTPayload,
  expiresIn: string,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey());
}

export async function verifyToken<T extends JWTPayload>(
  token: string,
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as T;
  } catch {
    return null;
  }
}
