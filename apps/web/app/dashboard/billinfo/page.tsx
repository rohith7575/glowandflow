"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

type BillInfo = {
  id: string;
  name: string;
  companyName: string | null;
  phone: string[];
  address: string | null;
};

export default function BillInfoPage() {
  const [items, setItems] = useState<BillInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BillInfo | null>(null);
  const [form, setForm] = useState({ name: "", companyName: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/billinfo");
    const json = await res.json();
    setItems(json.data ?? []);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing(null); setForm({ name: "", companyName: "", phone: "", address: "" }); setError(null); setOpen(true);
  }
  function startEdit(b: BillInfo) {
    setEditing(b);
    setForm({ name: b.name, companyName: b.companyName ?? "", phone: (b.phone || []).join(", "), address: b.address ?? "" });
    setError(null); setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      companyName: form.companyName || null,
      phone: form.phone.split(",").map((s) => s.trim()).filter(Boolean),
      address: form.address || null,
    };
    const url = editing ? `/api/billinfo/${editing.id}` : "/api/billinfo";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) { setError(json.error || "Failed"); return; }
    setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this bill info?")) return;
    await fetch(`/api/billinfo/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Bill Info</h1>
          <p className="mt-1 text-sm text-gray-400">Company / issuer details for bills.</p>
        </div>
        <button onClick={startCreate} className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300">
          + New bill info
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12151c] shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No bill info yet.</td></tr>
            )}
            {items.map((b) => (
              <tr key={b.id} className="transition hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white">{b.name}</td>
                <td className="px-6 py-4 text-gray-400">{b.companyName || "—"}</td>
                <td className="px-6 py-4 text-gray-400">{(b.phone || []).join(", ") || "—"}</td>
                <td className="px-6 py-4 text-gray-400">{b.address || "—"}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => startEdit(b)} className="mr-3 text-sm text-gray-400 hover:text-white">Edit</button>
                  <button onClick={() => remove(b.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit bill info" : "New bill info"}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Company name</span>
            <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Phone (comma separated)</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Address</span>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} rows={3} />
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
