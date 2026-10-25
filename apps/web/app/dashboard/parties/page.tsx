"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

type Party = { id: string; name: string; phone: string | null };

export default function PartiesPage() {
  const [items, setItems] = useState<Party[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/parties");
    const json = await res.json();
    setItems(json.data ?? []);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing(null); setForm({ name: "", phone: "" }); setError(null); setOpen(true);
  }
  function startEdit(p: Party) {
    setEditing(p); setForm({ name: p.name, phone: p.phone ?? "" }); setError(null); setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name: form.name, phone: form.phone || null };
    const url = editing ? `/api/parties/${editing.id}` : "/api/parties";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) { setError(json.error || "Failed"); return; }
    setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this party?")) return;
    await fetch(`/api/parties/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Parties</h1>
          <p className="mt-1 text-sm text-gray-400">Manage customers / parties.</p>
        </div>
        <button onClick={startCreate} className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300">
          + New party
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12151c] shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400">No parties yet.</td></tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="transition hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                <td className="px-6 py-4 text-gray-400">{p.phone || "—"}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => startEdit(p)} className="mr-3 text-sm text-gray-400 hover:text-white">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit party" : "New party"}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300">
            {editing ? "Save changes" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-[#12151c] px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
