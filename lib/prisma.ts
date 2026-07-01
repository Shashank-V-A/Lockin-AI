import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { normalizeDatabaseUrl } from "@/lib/db-connection-string";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

/** Creates a PostgreSQL connection pool tuned for Neon serverless. */
function createPool() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set.");
  }

  return new Pool({
    connectionString: normalizeDatabaseUrl(raw),
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 20_000,
    allowExitOnIdle: true,
  });
}

/** Delegates that must exist — used to detect stale cached clients after schema changes. */
const REQUIRED_DELEGATES = ["codingBookmark", "codingDraft"] as const;

function clientHasRequiredDelegates(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.every((key) => key in client);
}

/** Singleton Prisma client for server-side database access. */
function createPrismaClient() {
  const pool = globalForPrisma.pool ?? createPool();
  const adapter = new PrismaPg(pool);

  globalForPrisma.pool = pool;

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && clientHasRequiredDelegates(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
