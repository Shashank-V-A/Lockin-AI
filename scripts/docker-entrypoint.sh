#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy || echo "Migration skipped (DB may be unavailable at startup)"
fi

exec node server.js
