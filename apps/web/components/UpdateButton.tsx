"use client";

import { useEffect, useState } from "react";

type Release = {
  tag: string;
  rawTag: string;
  name: string | null;
  notes: string | null;
  url: string | null;
  publishedAt: string | null;
};

type Status = {
  current: string;
  latest: Release | null;
  updateAvailable: boolean;
  error: string | null;
};

export default function UpdateButton() {
  const [status, setStatus] = useState<Status | null>(null);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  async function check() {
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch("/api/update/status?fresh=1");
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as Status;
      setStatus(data);
      if (data.error) setMessage(data.error);
      else if (!data.updateAvailable) setMessage("Up to date");
      else setMessage(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Check failed");
    } finally {
      setChecking(false);
    }
  }

  async function doUpdate() {
    if (!status?.latest) return;
    const ok = window.confirm(`Update to ${status.latest.rawTag}? The app will restart.`);
    if (!ok) return;
    setUpdating(true);
    setMessage("Starting update…");
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: status.latest.rawTag }),
      });
      if (res.status === 409) {
        setMessage("Update already in progress");
        setUpdating(false);
        return;
      }
      if (!res.ok) throw new Error(`update ${res.status}`);
      setMessage("Updating… do not close this tab");
      // Poll health until version changes or timeout (3 min).
      const target = status.latest.tag;
      const deadline = Date.now() + 3 * 60 * 1000;
      const poll = async () => {
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 3000));
          try {
            const hr = await fetch("/api/health", { cache: "no-store" });
            if (hr.ok) {
              const h = await hr.json();
              if (h?.version && String(h.version) === target) {
                window.location.reload();
                return;
              }
            }
          } catch {
            // ignore transient errors during restart
          }
        }
        setMessage("Update timed out — check logs");
        setUpdating(false);
      };
      poll();
    } catch (err) {
      setMessage("Update failed to start");
      setUpdating(false);
    }
  }

  useEffect(() => {
    // Clear the transient "Up to date" message after a few seconds.
    if (message === "Up to date") {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const latest = status?.latest;

  return (
    <div className="relative flex items-center gap-2">
      {updating ? (
        <span className="text-xs text-amber-300">{message}</span>
      ) : latest && status?.updateAvailable ? (
        <div className="flex items-center gap-2">
          <button
            onClick={doUpdate}
            className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
            title={latest.notes ?? undefined}
          >
            Update to {latest.rawTag}
          </button>
          {latest.notes && (
            <button
              onClick={() => setShowNotes((s) => !s)}
              className="rounded-lg border border-white/10 px-2 py-2 text-xs text-gray-300 hover:bg-white/10"
              title="Release notes"
            >
              Notes
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={check}
          disabled={checking}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          {checking ? "Checking…" : "Check for updates"}
        </button>
      )}

      {message && !updating && latest && status?.updateAvailable === false && (
        <span className="text-xs text-gray-400">{message}</span>
      )}
      {message && !updating && (!latest || !status?.updateAvailable) && message !== "Up to date" && (
        <span className="text-xs text-red-300">{message}</span>
      )}

      {showNotes && latest?.notes && (
        <div className="absolute right-0 top-12 z-50 w-80 max-h-64 overflow-auto rounded-xl border border-white/10 bg-[#12151c] p-4 text-xs text-gray-300 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-white">{latest.rawTag}</span>
            <button onClick={() => setShowNotes(false)} className="text-gray-500 hover:text-white">
              ✕
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans">{latest.notes}</pre>
        </div>
      )}
    </div>
  );
}