import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "__Host-authjs.session-token",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/resume",
  "/mock-interview",
  "/coding",
  "/coach",
  "/settings",
  "/analytics",
];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

/** Edge-safe route protection via session cookie (no Prisma). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSessionCookie(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/mock-interview/:path*",
    "/coding/:path*",
    "/coach/:path*",
    "/settings/:path*",
    "/analytics/:path*",
  ],
};
