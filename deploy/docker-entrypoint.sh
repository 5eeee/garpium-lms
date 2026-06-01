#!/bin/sh
set -eu

echo "[lms] Running database migrations..."
./node_modules/.bin/prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[lms] Seeding database..."
  ./node_modules/.bin/prisma db seed
fi

echo "[lms] Starting Next.js..."
exec node server.js
