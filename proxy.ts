import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

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

const PROTECTED_API_PREFIXES = ["/api/coach", "/api/resume"];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

function isProtectedPage(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isProtectedApi(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/** Edge-safe route protection via session cookie (no Prisma). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();

  if (isProtectedPage(pathname) && !hasSessionCookie(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedApi(pathname) && !hasSessionCookie(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.next();
  response.headers.set("X-Request-Id", requestId);
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
    "/api/coach/:path*",
    "/api/resume/:path*",
  ],
};
