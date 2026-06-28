import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/resume",
  "/mock-interview",
  "/coding",
  "/analytics",
  "/coach",
  "/settings",
];

/** Protects dashboard routes and redirects unauthenticated users. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtected) return NextResponse.next();

  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/mock-interview/:path*",
    "/coding/:path*",
    "/analytics/:path*",
    "/coach/:path*",
    "/settings/:path*",
  ],
};
