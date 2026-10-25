"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";

type Party = { id: string; name: string; phone: string | null };
type Service = { id: string; name: string; rate: number };
type LineItem = { serviceId: string; name: string; rate: number; qty: number };
type BillData = {
  party?: { id: string; name: string; phone: string | null };
  items: LineItem[];
  total: number;
};
type Bill = { id: string; data: BillData; createdAt: string };

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [partyId, setPartyId] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [pickService, setPickService] = useState("");
  const [qty, setQty] = useState("1");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [br, pr, sr] = await Promise.all([
      fetch("/api/bills"),
      fetch("/api/parties"),
      fetch("/api/services"),
    ]);
    const [bj, pj, sj] = await Promise.all([br.json(), pr.json(), sr.json()]);
    setBills(bj.data ?? []);
    setParties(pj.data ?? []);
    setServices(sj.data ?? []);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing(null);
    setPartyId(parties[0]?.id ?? "");
    setItems([]);
    setPickService(services[0]?.id ?? "");
    setQty("1");
    setError(null);
    setOpen(true);
  }

  function startEdit(b: Bill) {
    setEditing(b);
    const p = parties.find((x) => x.id === b.data.party?.id);
    setPartyId(p?.id ?? parties[0]?.id ?? "");
    setItems(b.data.items ?? []);
    setPickService(services[0]?.id ?? "");
    setQty("1");
    setError(null);
    setOpen(true);
  }

  function addItem() {
    const s = services.find((x) => x.id === pickService);
    if (!s) return;
    const q = Number(qty) || 1;
    setItems([...items, { serviceId: s.id, name: s.name, rate: s.rate, qty: q }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  const total = items.reduce((sum, it) => sum + it.rate * it.qty, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Add at least one service item.");
      return;
    }
    const party = parties.find((p) => p.id === partyId);
    const payload = {
      data: {
        party: party ? { id: party.id, name: party.name, phone: party.phone } : null,
        items,
        total,
      },
    };
    const url = editing ? `/api/bills/${editing.id}` : "/api/bills";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!res.ok) { setError(json.error || "Failed"); return; }
    setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this bill?")) return;
    await fetch(`/api/bills/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Bills</h1>
          <p className="mt-1 text-sm text-gray-400">Create bills with a party and multiple services.</p>
        </div>
        <button onClick={startCreate} className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300">
          + New bill
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12151c] shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3">Party</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bills.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No bills yet.</td></tr>
            )}
            {bills.map((b) => (
              <tr key={b.id} className="transition hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white">{b.data.party?.name || "—"}</td>
                <td className="px-6 py-4 text-gray-400">{b.data.items?.length ?? 0}</td>
                <td className="px-6 py-4 text-gray-400">{b.data.total}</td>
                <td className="px-6 py-4 text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => startEdit(b)} className="mr-3 text-sm text-gray-400 hover:text-white">Edit</button>
                  <button onClick={() => remove(b.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit bill" : "New bill"}>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Party</span>
            <select value={partyId} onChange={(e) => setPartyId(e.target.value)} className={inputCls}>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-white/10 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Add service item</p>
            <div className="flex gap-2">
              <select value={pickService} onChange={(e) => setPickService(e.target.value)} className={inputCls + " flex-1"}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rate})</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={inputCls + " w-20"}
              />
              <button type="button" onClick={addItem} className="rounded-lg bg-gray-100 px-3 text-sm font-medium text-white hover:bg-white/10">
                Add
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Service</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2 text-right">{it.rate}</td>
                      <td className="px-3 py-2 text-right">{it.qty}</td>
                      <td className="px-3 py-2 text-right">{it.rate * it.qty}</td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-600">✕</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="px-3 py-2" colSpan={3}>Total</td>
                    <td className="px-3 py-2 text-right">{total}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300">
            {editing ? "Save changes" : "Create bill"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-[#12151c] px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";
