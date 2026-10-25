"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

type Service = { id: string; name: string; rate: number };

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", rate: "" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/services");
    const json = await res.json();
    setItems(json.data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({ name: "", rate: "" });
    setError(null);
    setOpen(true);
  }

  function startEdit(s: Service) {
    setEditing(s);
    setForm({ name: s.name, rate: String(s.rate) });
    setError(null);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = { name: form.name, rate: Number(form.rate) };
    const url = editing ? `/api/services/${editing.id}` : "/api/services";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed");
      return;
    }
    setOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage service catalog and rates.</p>
        </div>
        <button
          onClick={startCreate}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + New service
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Rate</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                  No services yet.
                </td>
              </tr>
            )}
            {items.map((s) => (
              <tr key={s.id} className="transition hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 text-gray-600">{s.rate}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => startEdit(s)} className="mr-3 text-sm text-gray-600 hover:text-gray-900">
                    Edit
                  </button>
                  <button onClick={() => remove(s.id)} className="text-sm text-red-600 hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit service" : "New service"}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Rate</span>
            <input
              required
              type="number"
              step="0.01"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              className={inputCls}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {editing ? "Save changes" : "Create"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
