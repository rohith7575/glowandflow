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