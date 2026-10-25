import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });
  const hashBuf = Buffer.from(hash, "hex");
  if (hashBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(hashBuf, derived);
}

function base64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function signToken(payload: { sub: string; sid: string }): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + TOKEN_TTL_SECONDS };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(body));
  const sig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${h}.${p}`)
    .digest();
  return `${h}.${p}.${base64url(sig)}`;
}

export type TokenPayload = { sub: string; sid: string; iat: number; exp: number };

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${h}.${p}`).digest();
  const sig = Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()) as TokenPayload;
    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) return null;
    if (!payload.sub || !payload.sid) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export function generateSessionId(): string {
  return crypto.randomBytes(24).toString("hex");
}
