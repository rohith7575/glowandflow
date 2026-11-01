#!/usr/bin/env bash
# Auto-update host script triggered by the release webhook.
# Usage: bash deploy/update.sh <tag>
set -u

TAG="${1:-${TARGET_TAG:-}}"
ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
DATA="$ROOT/data"
LOCK="$DATA/update.lock"
LOG="$DATA/updates.log"
STATUS="$DATA/update.status"
ENVFILE="$DATA/runtime.env"
SERVICE="glow-and-flow"
HEALTH_URL="http://localhost:3000/api/health"

mkdir -p "$DATA"
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "$(date -Is) update skipped: another update in progress" >>"$LOG"
  exit 0
fi

log() { echo "$(date -Is) $*" | tee -a "$LOG"; }

cd "$ROOT" || { log "cannot cd $ROOT"; exit 1; }

PREV_SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
log "=== update start (prev sha $PREV_SHA) tag=${TAG:-<latest>} ==="

# Resolve target tag
git fetch --tags --prune origin >>"$LOG" 2>&1
if [ -z "$TAG" ]; then
  TAG="$(git describe --tags --abbrev=0 origin/master 2>/dev/null || git describe --tags --abbrev=0 2>/dev/null || true)"
fi
if [ -z "$TAG" ]; then
  log "no release tag found; aborting"
  printf '{"state":"failed","error":"no tag found","finishedAt":"%s"}\n' "$(date -Is)" >"$STATUS"
  exit 1
fi
if ! git rev-parse "$TAG^{commit}" >/dev/null 2>&1; then
  log "tag $TAG not found after fetch; aborting"
  exit 1
fi
TARGET_SHA="$(git rev-parse "$TAG^{commit}")"
log "target tag=$TAG sha=$TARGET_SHA"

if [ "$PREV_SHA" = "$TARGET_SHA" ]; then
  log "already at $TARGET_SHA; nothing to do"
  printf '{"state":"up-to-date","tag":"%s","finishedAt":"%s"}\n' "$TAG" "$(date -Is)" >"$STATUS"
  exit 0
fi

# Back up DB and previous build
if [ -f "$DATA/app.db" ]; then
  cp "$DATA/app.db" "$DATA/app.db.bak.$(date +%s)" && log "db backed up"
fi
if [ -d "$ROOT/apps/web/.next" ]; then
  rm -rf "$ROOT/apps/web/.next.prev"
  cp -a "$ROOT/apps/web/.next" "$ROOT/apps/web/.next.prev" && log "previous build backed up"
fi

FAIL=0
restore_build() {
  if [ -d "$ROOT/apps/web/.next.prev" ]; then
    rm -rf "$ROOT/apps/web/.next"
    mv "$ROOT/apps/web/.next.prev" "$ROOT/apps/web/.next" && log "restored previous build"
  fi
}

# Record running status
printf '{"state":"running","tag":"%s","startedAt":"%s"}\n' "$TAG" "$(date -Is)" >"$STATUS"

# NOTE: service is NOT stopped here. Build runs while the app keeps serving
# the old build; the process is killed at the end so systemd (Restart=always)
# brings it back up with the new build. No sudo required (boss owns the proc).

# Checkout release
log "checking out $TAG"
if ! git reset --hard "$TARGET_SHA" >>"$LOG" 2>&1; then
  log "git reset failed"
  FAIL=1
fi

VERSION="${TAG#v}"

if [ "$FAIL" = "0" ]; then
  export DATABASE_URL="file:$DATA/app.db"
  export NODE_ENV=production
  export PORT=3000
  export APP_VERSION="$VERSION"
  # runtime env file for systemd
  printf 'APP_VERSION=%s\nDATABASE_URL=file:%s\nNODE_ENV=production\nPORT=3000\n' "$VERSION" "$DATA/app.db" >"$ENVFILE"

  cd "$ROOT" || FAIL=1
fi

if [ "$FAIL" = "0" ]; then
  log "pnpm install"
  if ! pnpm install >>"$LOG" 2>&1; then FAIL=1; fi
fi
if [ "$FAIL" = "0" ]; then
  log "db:generate"
  if ! pnpm db:generate >>"$LOG" 2>&1; then FAIL=1; fi
fi
if [ "$FAIL" = "0" ]; then
  log "db:push"
  if ! DATABASE_URL="file:$DATA/app.db" pnpm db:push >>"$LOG" 2>&1; then FAIL=1; fi
fi
if [ "$FAIL" = "0" ]; then
  log "build"
  if ! pnpm build >>"$LOG" 2>&1; then FAIL=1; fi
fi
if [ "$FAIL" = "0" ]; then
  log "copying static assets"
  mkdir -p "$ROOT/apps/web/.next/standalone/apps/web/.next"
  for i in $(seq 1 20); do
    [ -d "$ROOT/apps/web/.next/static" ] && break
    sleep 0.5
  done
  rm -rf "$ROOT/apps/web/.next/standalone/apps/web/.next/static"
  cp -r "$ROOT/apps/web/.next/static" "$ROOT/apps/web/.next/standalone/apps/web/.next/static"
  if [ -d "$ROOT/apps/web/public" ]; then
    rm -rf "$ROOT/apps/web/.next/standalone/apps/web/public"
    cp -r "$ROOT/apps/web/public" "$ROOT/apps/web/.next/standalone/apps/web/public"
  fi
  # Verify static assets (incl. CSS) were copied; fail loudly instead of
  # serving unstyled HTML.
  if ! ls "$ROOT/apps/web/.next/standalone/apps/web/.next/static/chunks/"*.css >/dev/null 2>&1; then
    log "WARNING: no CSS chunk found in standalone static after copy"
    FAIL=1
  fi
fi

if [ "$FAIL" = "1" ]; then
  log "build failed; restoring previous build + git sha"
  restore_build
  cd "$ROOT" && git reset --hard "$PREV_SHA" >>"$LOG" 2>&1
  VERSION="${APP_VERSION:-0.1.3}"
fi

# Trigger restart via process kill (systemd Restart=always brings it back up
# with the new build). No sudo needed: boss owns the node process.
if [ "$FAIL" = "0" ]; then
  log "triggering service restart (killing node process)"
  pkill -TERM -f "standalone/apps/web/server.js" || true
  sleep 2
fi

if [ "${FAIL:-0}" = "1" ]; then
  log "update FAILED during build; previous build restored"
  printf '{"state":"failed","tag":"%s","finishedAt":"%s"}\n' "$TAG" "$(date -Is)" >"$STATUS"
  exit 1
fi

# Health check
log "waiting for health check"
OK=0
for i in $(seq 1 60); do
  RESP="$(curl -fsS --max-time 3 "$HEALTH_URL" 2>/dev/null || true)"
  if [ -n "$RESP" ]; then
    HV="$(echo "$RESP" | sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
    if [ "$HV" = "$VERSION" ]; then
      OK=1
      break
    fi
  fi
  sleep 1
done

if [ "$OK" = "1" ]; then
  rm -rf "$ROOT/apps/web/.next.prev"
  log "update SUCCESS to $TAG ($VERSION)"
  printf '{"state":"success","tag":"%s","version":"%s","finishedAt":"%s"}\n' "$TAG" "$VERSION" "$(date -Is)" >"$STATUS"
  exit 0
else
  log "health check failed after update (expected version $VERSION)"
  printf '{"state":"failed","tag":"%s","version":"%s","finishedAt":"%s"}\n' "$TAG" "$VERSION" "$(date -Is)" >"$STATUS"
  # leave .next.prev for manual recovery
  exit 1
fi