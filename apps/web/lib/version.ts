import fs from "fs";
import path from "path";

// Tiny semver helpers (no external dependency).

export function normalizeVersion(tag: string): string {
  return String(tag ?? "").trim().replace(/^v/i, "");
}

export function parseVersion(v: string): [number, number, number] {
  const m = normalizeVersion(v).match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return [0, 0, 0];
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function compareVersions(a: string, b: string): number {
  const [aM, am, ap] = parseVersion(a);
  const [bM, bm, bp] = parseVersion(b);
  if (aM !== bM) return aM - bM;
  if (am !== bm) return am - bm;
  return ap - bp;
}

export function isNewer(candidate: string, current: string): boolean {
  return compareVersions(candidate, current) > 0;
}

/**
 * Resolve the version the running app is actually on.
 *
 * In production we prefer the version from the checked-out code's package.json
 * (REPO_ROOT/package.json), which is updated atomically with the code during an
 * update and cannot drift the way an env var can. In dev (no REPO_ROOT) we fall
 * back to APP_VERSION from .env.local, then "0.1.0".
 */
export function getCurrentVersion(): string {
  const repoRoot = process.env.REPO_ROOT;
  if (repoRoot) {
    try {
      const pkgPath = path.join(repoRoot, "package.json");
      if (fs.existsSync(pkgPath)) {
        const raw = fs.readFileSync(pkgPath, "utf8");
        const parsed = JSON.parse(raw) as { version?: string };
        if (parsed?.version) return normalizeVersion(parsed.version);
      }
    } catch {
      // fall through to env fallback
    }
  }
  const envVersion = process.env.APP_VERSION;
  if (envVersion && envVersion.trim()) return normalizeVersion(envVersion);
  return "0.1.0";
}