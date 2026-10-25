# Glow & Flow

A self-hosted full-stack webapp monorepo.

- **Frontend + API**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Database**: PostgreSQL via Prisma 6
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
- Docker + Docker Compose
- (for public access) a Cloudflare account + a domain on Cloudflare

## 1. First-time setup

```bash
git clone <your-repo> "glow and flow"
cd "glow and flow"
pnpm install
```

Start Postgres and push the schema:

```bash
docker compose -f infra/docker-compose.yml up -d
cp apps/web/.env.example apps/web/.env.local
# edit DATABASE_URL if needed
DATABASE_URL="postgresql://glow:glow@localhost:5432/glow" pnpm db:push
pnpm db:generate
```

Or run the helper:

```bash
bash deploy/setup-server.sh
```

## 2. Development

```bash
pnpm dev          # runs all apps via Turborepo
```

Open http://localhost:3000

## 3. Production on your device

### Option A — Docker Compose (recommended)

```bash
cp .env.production.example .env   # set POSTGRES_PASSWORD
docker compose -f infra/docker-compose.prod.yml up -d --build
```

App listens on http://localhost:3000

### Option B — systemd (native Node)

```bash
pnpm build
cp .env.production.example .env.production   # fill in DATABASE_URL etc.
sudo cp deploy/glow-and-flow.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now glow-and-flow
```

> The unit assumes the repo lives at `/home/boss/Desktop/projects/glow and flow` and Node at
> `/home/boss/.nvm/versions/node/v24.16.0/bin/node`. Adjust paths in the unit if different.

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

## 5. Updating

```bash
git pull
pnpm install
DATABASE_URL="..." pnpm db:push
pnpm build
# Docker: docker compose -f infra/docker-compose.prod.yml up -d --build
# systemd: sudo systemctl restart glow-and-flow
```

## 6. Backups

Back up Postgres:

```bash
docker exec infra-postgres-1 pg_dump -U glow glow > backup.sql
```

## Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `DATABASE_URL` | apps/web/.env.local, .env.production | Postgres connection string |
| `APP_VERSION` | apps/web/.env.local | Shown in /api/health |
| `POSTGRES_PASSWORD` | .env (prod compose) | Postgres password |

## API

- `GET /api/health` → `{ ok, uptime, timestamp, version }`
- `GET /api/users` → list users
- `POST /api/users` → `{ email, name? }` create user

## Notes

- The Next.js build uses `output: "standalone"` for a small production image.
- Prisma client is generated into the shared node_modules; run `pnpm db:generate` after schema changes.
- For ARM devices (Raspberry Pi), change the Docker base images to `arm64` variants and install the ARM cloudflared binary.