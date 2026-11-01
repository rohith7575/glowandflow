// Runs once when the Next.js server starts. Prints the host address the app
// is reachable at (e.g. a Cloudflare Tunnel domain or localhost in dev).
export function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const host =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.HOST_ADDRESS ||
    process.env.PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

  console.log(`Host address: ${host}`);
}
