"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { id: string; email: string; name: string | null; phone: string | null };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/auth/me");
    if (res.status === 401) {
      router.replace("/login");
      return;
    }
    const json = await res.json();
    const p = json.data as Profile;
    setProfile(p);
    setForm({ name: p?.name ?? "", email: p?.email ?? "", phone: p?.phone ?? "", password: "" });
  }

  useEffect(() => { load(); }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email, phone: form.phone || null };
      if (form.password) payload.password = form.password;
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setProfile(json.data);
      setForm((f) => ({ ...f, password: "" }));
      setInfo("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[#12151c] px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40";

  if (!profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-amber-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-400">Edit your account details.</p>
      </div>

      <div className="max-w-xl rounded-2xl border border-white/10 bg-[#12151c] p-6 shadow-sm">
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Email</span>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">New password (leave blank to keep)</span>
            <input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-400">{info}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300 disabled:opacity-50">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
