import { Card, Button } from "@glow/ui";
import { HealthStatus } from "@glow/types";

async function getHealth(): Promise<HealthStatus | null> {
  try {
    const res = await fetch("http://localhost:3000/api/health", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as HealthStatus;
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="mt-2 text-gray-600">
          This is a self-hosted full-stack webapp running from your own device. Backend, database and
          frontend live together in one monorepo and are exposed to the internet through a Cloudflare
          Tunnel.
        </p>
        <div className="mt-4">
          <Button>Get started</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Server health</h2>
        <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
          {JSON.stringify(health, null, 2)}
        </pre>
      </Card>
    </div>
  );
}
