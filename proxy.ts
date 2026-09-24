import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth/jwt";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/recommendations", "/calculators", "/portfolio"];
const AUTH_ENTRY_PREFIXES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken<{ sub: string }>(token) : null;
  const isAuthenticated = Boolean(session);

  if (pathname === "/") {
    const destination = isAuthenticated ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthEntry = AUTH_ENTRY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAuthEntry && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/recommendations/:path*",
    "/calculators/:path*",
    "/portfolio/:path*",
    "/login/:path*",
    "/signup/:path*",
  ],
};
