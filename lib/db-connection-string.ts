/** Normalizes Neon/pg URLs so sslmode matches pg v8+ verify-full semantics. */
export function normalizeDatabaseUrl(connectionString: string): string {
  return connectionString.replace(
    /([?&])sslmode=(prefer|require|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  );
}
