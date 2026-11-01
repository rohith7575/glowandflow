import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/session";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

export const dynamic = "force-dynamic";

function isUpdateRunning(root: string): boolean {
  const lock = path.join(root, "data", "update.lock");
  try {
    fs.mkdirSync(path.dirname(lock), { recursive: true });
    execFileSync("flock", ["-n", lock, "true"], { stdio: "ignore" });
    return false;
  } catch {
    return true;
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req as any);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const root = process.env.REPO_ROOT || "/home/boss/Desktop/projects/glow and flow";

  if (isUpdateRunning(root)) {
    return NextResponse.json({ error: "Update already in progress" }, { status: 409 });
  }

  let tag: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.tag === "string") tag = body.tag.trim();
  } catch {
    // ignore
  }

  if (tag && !/^v?\d+\.\d+\.\d+/.test(tag)) {
    return NextResponse.json({ error: "Invalid tag format" }, { status: 400 });
  }

  try {
    fs.mkdirSync(path.join(root, "data"), { recursive: true });
    const logPath = path.join(root, "data", "update-trigger.log");
    const out = fs.openSync(logPath, "a");
    const args = [path.join(root, "deploy", "update.sh")];
    if (tag) args.push(tag);
    const child = spawn("bash", args, {
      detached: true,
      stdio: ["ignore", out, out],
      env: { ...process.env, REPO_ROOT: root, ...(tag ? { TARGET_TAG: tag } : {}) },
      cwd: root,
    });
    child.unref();
    fs.closeSync(out);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to spawn updater", detail: String(err) },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { accepted: true, tag: tag ?? "latest", message: "Update triggered" },
    { status: 202 }
  );
}