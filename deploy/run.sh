#!/usr/bin/env bash
# One command to run the whole production app (SQLite, no Postgres/Docker required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export DATABASE_URL="file:$ROOT/data/app.db"
export JWT_SECRET="${JWT_SECRET:-change-this-to-a-long-random-secret-in-production}"
mkdir -p "$ROOT/data"

cd "$ROOT"

echo "==> Installing dependencies"
pnpm install

echo "==> Generating Prisma client"
pnpm db:generate

echo "==> Syncing database schema (SQLite: $ROOT/data/app.db)"
pnpm db:push

echo "==> Building monorepo"
pnpm build

echo "==> Starting production server on http://localhost:3000"
PORT=3000 node "$ROOT/apps/web/.next/standalone/apps/web/server.js"