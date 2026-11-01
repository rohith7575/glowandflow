# Glow & Flow

A self-hosted full-stack webapp monorepo.

- **Frontend + API**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Database**: SQLite via Prisma 6 (file-based, no server, survives restarts)
- **Monorepo**: pnpm workspaces + Turborepo
- **Hosting**: your own Linux device
- **Public access**: Cloudflare Tunnel (no port forwarding required)

## Repository layout

```
.
├── apps/
│   └── web/                 # Next.js app (UI + API routes)
├── packages/
│   ├── config/              # shared tsconfig/eslint
│   ├── database/            # Prisma schema + client
│   ├── types/               # shared TypeScript types
│   └── ui/                  # shared React components
├── infra/
│   ├── docker-compose.yml       # dev: Postgres only
│   ├── docker-compose.prod.yml  # prod: Postgres + web
│   └── cloudflare/              # tunnel config template
├── deploy/
│   ├── setup-server.sh
│   ├── setup-tunnel.sh
│   └── glow-and-flow.service    # systemd unit
└── turbo.json
```

## Prerequisites (on the host device)

- Node.js >= 20 (this project uses v24)
- pnpm >= 9
- (for public access) a Cloudflare account + a domain on Cloudflare

No database server or Docker required — data is stored in a local SQLite file.

## 1. First-time setup

```bash
git clone <your-repo> "glow and flow"
cd "glow and flow"
pnpm install
```

SQLite needs no server. Generate the client and create the DB file:

```bash
pnpm db:generate
DATABASE_URL="file:$PWD/data/app.db" pnpm db:push
```

## 2. Development

```bash
cp apps/web/.env.example apps/web/.env.local   # DATABASE_URL="file:./data/app.db"
pnpm dev          # runs all apps via Turborepo
```

Open http://localhost:3000

## 3. Production on your device — one command

```bash
pnpm prod
```

That single command installs deps, generates the Prisma client, syncs the SQLite schema, builds the monorepo, and starts the production server on http://localhost:3000. Data persists in `data/app.db` and survives restarts.

### Run as a background service (systemd)

```bash
sudo cp deploy/glow-and-flow.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now glow-and-flow
```

> The unit assumes the repo lives at `/home/boss/Desktop/projects/glow and flow` and Node at
> `/home/boss/.nvm/versions/node/v24.16.0/bin/node`. Adjust paths in the unit if different.
> It runs `deploy/run.sh`, which uses an absolute path to `data/app.db`.

## 4. Make it accessible from anywhere (Cloudflare Tunnel)

Cloudflare Tunnel gives you a public HTTPS URL without opening firewall ports or needing a static IP. It works behind NAT/CGNAT.

```bash
bash deploy/setup-tunnel.sh
```

Manual steps:

1. Install cloudflared:
   ```bash
   curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
   sudo dpkg -i cloudflared.deb
   ```
2. Authenticate: `cloudflared tunnel login`
3. Create tunnel: `cloudflared tunnel create glow-and-flow`
4. Route DNS: `cloudflared tunnel route dns glow-and-flow app.yourdomain.com`
5. Edit `infra/cloudflare/config.yml` with your `<TUNNEL_ID>` and hostname.
6. Install as a service:
   ```bash
   sudo cp infra/cloudflare/config.yml /etc/cloudflared/config.yml
   sudo cloudflared service install
   sudo systemctl enable --now cloudflared
   ```

Your app is now reachable at `https://app.yourdomain.com`.

### Keep the host awake

For 24/7 availability, disable sleep/suspend on the host:

```bash
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

## 5. Updating (in-app "Check for updates" button)

The app can update itself from a GitHub Release without any inbound webhook (works even with a changing quick-tunnel URL).

### How it works
1. You publish a release (e.g. `v0.2.0`) on GitHub.
2. In the dashboard, click **"Check for updates"**. The app queries the GitHub Releases API and, if a newer release exists, the button becomes **"Update to v0.2.0"**.
3. Clicking it spawns `deploy/update.sh` in the background (detached), which checks out the release tag, backs up the DB + previous build, rebuilds, restarts the systemd service, and health-checks `/api/health`.
4. The button shows "Updating… do not close this tab" and reloads the page once the new version is live.
5. On failure the previous build and git SHA are restored.

### One-time setup
1. Set the repo (and optional token) in the host env:
   ```bash
   # data/runtime.env (or .env.production)
   GITHUB_REPO=yourname/glow-and-flow
   # GITHUB_TOKEN=ghp_xxx   # optional, raises rate limit / needed for private repos
   REPO_ROOT=/home/boss/Desktop/projects/glow and flow
   ```
   Reload the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart glow-and-flow
   ```
2. Allow the `boss` user to restart the service without a password (for the updater):
   ```bash
   sudo visudo -f /etc/sudoers.d/glow-and-flow
   # add: boss ALL=(ALL) NOPASSWD: /bin/systemctl restart glow-and-flow, /bin/systemctl stop glow-and-flow, /bin/systemctl start glow-and-flow
   ```

No GitHub-side configuration is required.

### Manual update (fallback)
```bash
git fetch --tags && git checkout v0.2.0
pnpm prod
# systemd: sudo systemctl restart glow-and-flow
```

### Logs
Update attempts are logged to `data/updates.log` and trigger events to `data/update-trigger.log`. Status is tracked in `data/update.status`.

## 6. Backups

Data lives in a single SQLite file. Back up by copying it (while the app is stopped for consistency):

```bash
cp data/app.db backups/app-$(date +%F).db
```

## Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `DATABASE_URL` | apps/web/.env.local | SQLite file path, e.g. `file:./data/app.db` |
| `APP_VERSION` | apps/web/.env.local | Shown in /api/health |

## API

- `GET /api/health` → `{ ok, uptime, timestamp, version }`
- `GET /api/update/status` → check GitHub Releases for a newer version (auth required)
- `POST /api/update` → trigger an update to a release tag (auth required)
- `GET /api/users` → list users
- `POST /api/users` → `{ email, name? }` create user

## Notes

- The Next.js build uses `output: "standalone"` for a small production image.
- Prisma client is generated into the shared node_modules; run `pnpm db:generate` after schema changes.
- For ARM devices (Raspberry Pi), change the Docker base images to `arm64` variants and install the ARM cloudflared binary.