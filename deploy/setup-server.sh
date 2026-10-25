#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
pnpm install

echo "==> Starting Postgres (dev compose)"
docker compose -f infra/docker-compose.yml up -d

echo "==> Waiting for Postgres"
sleep 5

echo "==> Generating Prisma client"
pnpm db:generate

echo "==> Pushing schema to database"
DATABASE_URL="postgresql://glow:glow@localhost:5432/glow" pnpm db:push

echo "==> Building monorepo"
pnpm build

echo "==> Done. Start dev with: pnpm dev"
echo "    or production with: pnpm --filter @glow/web start"