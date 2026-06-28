import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Health check endpoint for Docker and monitoring. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
