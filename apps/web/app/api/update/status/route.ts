import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/session";
import { normalizeVersion, isNewer } from "../../../../lib/version";

export const dynamic = "force-dynamic";

type ReleaseInfo = {
  tag: string; // normalized (no leading v)
  rawTag: string;
  name: string | null;
  notes: string | null;
  url: string | null;
  publishedAt: string | null;
};

type Cached = {
  at: number;
  current: string;
  latest: ReleaseInfo | null;
  updateAvailable: boolean;
  error: string | null;
};

let cache: Cached | null = null;
const TTL_MS = 5 * 60 * 1000;

async function fetchLatestRelease(): Promise<ReleaseInfo> {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error("GITHUB_REPO is not configured");

  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "glow-and-flow",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  }
  const data = (await res.json()) as any;
  if (!data?.tag_name) throw new Error("Release has no tag_name");
  return {
    tag: normalizeVersion(data.tag_name),
    rawTag: String(data.tag_name),
    name: data.name ?? null,
    notes: data.body ?? null,
    url: data.html_url ?? null,
    publishedAt: data.published_at ?? null,
  };
}

export async function GET(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const fresh = new URL(req.url).searchParams.get("fresh") === "1";
  const current = process.env.APP_VERSION ?? "0.1.2";

  if (!fresh && cache && Date.now() - cache.at < TTL_MS && cache.current === current) {
    return NextResponse.json({
      current: cache.current,
      latest: cache.latest,
      updateAvailable: cache.updateAvailable,
      error: cache.error,
      cached: true,
    });
  }

  let latest: ReleaseInfo | null = null;
  let error: string | null = null;
  try {
    latest = await fetchLatestRelease();
  } catch (err) {
    error = String(err);
  }

  const updateAvailable = !!latest && isNewer(latest.tag, current);

  cache = {
    at: Date.now(),
    current,
    latest,
    updateAvailable,
    error,
  };

  return NextResponse.json({
    current,
    latest,
    updateAvailable,
    error,
    cached: false,
  });
}