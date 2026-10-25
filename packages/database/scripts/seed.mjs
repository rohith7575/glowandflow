import crypto from "node:crypto";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import fs from "node:fs";

// Load DATABASE_URL from apps/web/.env.local if present
const envPath = path.resolve(process.cwd(), "../../apps/web/.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\\n")) {
    const m = line.match(/^\\s*([A-Z_]+)\\s*=\\s*"?([^"\\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), "../../data/app.db")}`;
}

const prisma = new PrismaClient();

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

async function main() {
  const email = process.env.SEED_EMAIL || "demo@example.com";
  const password = process.env.SEED_PASSWORD || "password123";
  const hash = await hashPassword(password);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { password: hash, token: null } });
    console.log(`Updated user ${email} (password reset)`);
  } else {
    await prisma.user.create({
      data: { email, name: "Demo User", phone: "0000000000", password: hash },
    });
    console.log(`Created user ${email} / ${password}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
