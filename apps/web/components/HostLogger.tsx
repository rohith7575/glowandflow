"use client";

import { useEffect } from "react";

// Prints the host address the app is running at, right when it starts in the
// browser (e.g. a random Cloudflare domain or localhost on local).
export default function HostLogger() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(`Host address: ${window.location.origin}`);
    }
  }, []);
  return null;
}
