#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing cloudflared (Debian/Ubuntu)"
if ! command -v cloudflared >/dev/null 2>&1; then
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o /tmp/opencode/cloudflared.deb
  sudo dpkg -i /tmp/opencode/cloudflared.deb
fi

echo "==> Login to Cloudflare (opens browser)"
cloudflared tunnel login

echo "==> Create tunnel"
cloudflared tunnel create glow-and-flow

echo "==> Route DNS (replace app.yourdomain.com)"
read -rp "Hostname (e.g. app.yourdomain.com): " HOST
cloudflared tunnel route dns glow-and-flow "$HOST"

echo "==> Copy config template and edit tunnel id + hostname"
echo "   Edit infra/cloudflare/config.yml, then run:"
echo "   sudo cloudflared service install"
echo "   sudo systemctl enable --now cloudflared"