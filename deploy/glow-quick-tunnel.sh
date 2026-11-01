#!/usr/bin/env bash

export PATH="$HOME/.local/bin:$PATH"

LOG=/tmp/opencode/cf-quick.log
mkdir -p /tmp/opencode
mkdir -p "$HOME/.cloudflared"

: > "$LOG"

cloudflared tunnel --url http://127.0.0.1:3000 > "$LOG" 2>&1 &
CFPID=$!

URL=""
for i in $(seq 1 30); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1)
  if [ -n "$URL" ]; then
    echo "PUBLIC_URL=$URL"
    echo "$(date -Is) $URL" >> "$HOME/.cloudflared/quick-url.log"
    echo "$URL" > "$HOME/.cloudflared/quick-url.txt"
    break
  fi

  echo "$URL" > "$HOME/.cloudflared/quick-url.txt"
  sleep 1
done

wait "$CFPID"
