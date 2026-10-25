#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
pnpm install

echo "==> Generating Prisma client"
pnpm db:generate

echo "==> Syncing schema to SQLite (data/app.db)"
mkdir -p "$ROOT/data"
DATABASE_URL="file:$ROOT/data/app.db" pnpm db:push

echo "==> Building monorepo"
pnpm build

echo "==> Done. Run production with: pnpm prod"