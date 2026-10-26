"use client";

import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import SearchSelect from "../../../components/SearchSelect";

type Party = { id: string; name: string; phone: string | null };
type Service = { id: string; name: string; rate: number; unit: string };
type BillInfo = { id: string; name: string; companyName: string | null; phone: string[]; address: string | null };
type LineItem = { serviceId: string; name: string; rate: number; qty: number; unit: string };
type BillData = {
  party?: { id: string; name: string; phone: string | null };
  billInfo?: { id: string; name: string; companyName: string | null; phone: string[]; address: string | null } | null;
  items: LineItem[];
  total: number;
};
type Bill = { id: string; invoiceNumber: string | null; data: BillData; createdAt: string | null; updatedAt: string };

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [billInfos, setBillInfos] = useState<BillInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [partyId, setPartyId] = useState("");
  const [billInfoId, setBillInfoId] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [pickService, setPickService] = useState("");
  const [qty, setQty] = useState("1");
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [previewBill, setPreviewBill] = useState<Bill | null>(null);

  async function load() {
    const [br, pr, sr, bir] = await Promise.all([
      fetch("/api/bills"),
      fetch("/api/parties"),
      fetch("/api/services"),
      fetch("/api/billinfo"),
    ]);
    const [bj, pj, sj, bij] = await Promise.all([br.json(), pr.json(), sr.json(), bir.json()]);
    setBills(bj.data ?? []);
    setParties(pj.data ?? []);
    setServices(sj.data ?? []);
    setBillInfos(bij.data ?? []);
  }
  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing(null);
    setPartyId(parties[0]?.id ?? "");
    setBillInfoId(billInfos[0]?.id ?? "");
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
    const bi = billInfos.find((x) => x.id === b.data.billInfo?.id);
    setBillInfoId(bi?.id ?? billInfos[0]?.id ?? "");
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
    setItems([...items, { serviceId: s.id, name: s.name, rate: s.rate, qty: q, unit: s.unit || "piece" }]);
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
      billInfoId: billInfoId || null,
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

  async function finalise(id: string) {
    const res = await fetch(`/api/bills/${id}/finalise`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) { alert(json.error || "Finalise failed"); return; }
    if (previewBill && previewBill.id === id) setPreviewBill(json.data);
    load();
  }

  function pdfUrl(b: Bill, download = false) {
    return `/api/bills/${b.id}/pdf${download ? "?download=1" : ""}`;
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
              <th className="px-6 py-3">Invoice #</th>
              <th className="px-6 py-3">Party</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bills.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No bills yet.</td></tr>
            )}
            {bills.map((b) => (
              <tr key={b.id} className="transition hover:bg-white/5">
                <td className="px-6 py-4 font-mono text-xs text-amber-300">
                  {b.invoiceNumber || <span className="rounded bg-white/10 px-2 py-0.5 text-gray-400">Draft</span>}
                </td>
                <td className="px-6 py-4 font-medium text-white">{b.data.party?.name || "—"}</td>
                <td className="px-6 py-4 text-gray-400">{b.data.items?.length ?? 0}</td>
                <td className="px-6 py-4 text-gray-400">{b.data.total}</td>
                <td className="px-6 py-4 text-gray-400">
                  {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : <span className="text-gray-500">Draft</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button onClick={() => setPreviewBill(b)} className="text-sm text-gray-400 hover:text-white">Preview</button>
                    <button onClick={() => startEdit(b)} className="text-sm text-gray-400 hover:text-white">Edit</button>
                    {!b.createdAt && (
                      <button onClick={() => finalise(b.id)} className="rounded-md bg-amber-400 px-2.5 py-1 text-xs font-semibold text-black transition hover:bg-amber-300">
                        Finalise
                      </button>
                    )}
                    <button onClick={() => remove(b.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit bill" : "New bill"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Party</span>
            <SearchSelect
              options={parties.map((p) => ({ value: p.id, label: p.name, sublabel: p.phone ?? undefined }))}
              value={partyId}
              onChange={setPartyId}
              placeholder="Search party..."
            />
          </div>

          {billInfos.length > 0 && (
            <div className="block">
              <span className="mb-1 block text-xs font-medium text-gray-400">Bill Info (company) — optional</span>
              <SearchSelect
                options={billInfos.map((bi) => ({ value: bi.id, label: bi.companyName || bi.name, sublabel: bi.address ?? undefined }))}
                value={billInfoId}
                onChange={setBillInfoId}
                placeholder="Search company..."
              />
            </div>
          )}

          <div className="rounded-lg border border-white/10 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Add service item</p>
            <div className="flex gap-2">
              <SearchSelect
                className="min-w-0 flex-1"
                options={services.map((s) => ({
                  value: s.id,
                  label: s.name,
                  sublabel: `${s.rate} / ${s.unit || "piece"}`,
                }))}
                value={pickService}
                onChange={setPickService}
                placeholder="Search service..."
              />
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-16 shrink-0 rounded-lg border border-white/15 bg-[#12151c] px-2 py-2 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
              />
              <button
                type="button"
                onClick={addItem}
                className="shrink-0 rounded-lg bg-white px-3 text-sm font-medium text-black transition hover:bg-amber-400"
              >
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
                    <th className="px-3 py-2 text-left">Unit</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2 text-right">{it.rate}</td>
                      <td className="px-3 py-2 text-right">{it.qty}</td>
                      <td className="px-3 py-2 capitalize text-gray-400">{it.unit || "piece"}</td>
                      <td className="px-3 py-2 text-right">{it.rate * it.qty}</td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-600">✕</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="px-3 py-2" colSpan={4}>Total</td>
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

      {/* Preview modal */}
      {previewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {previewBill.invoiceNumber || "Draft invoice"}
                </p>
                <p className="text-xs text-gray-400">
                  {previewBill.data.party?.name || "—"} · {previewBill.createdAt ? new Date(previewBill.createdAt).toLocaleDateString() : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!previewBill.createdAt && (
                  <button
                    onClick={() => finalise(previewBill.id)}
                    className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
                  >
                    Finalise
                  </button>
                )}
                <a
                  href={pdfUrl(previewBill, true)}
                  download
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  Download PDF
                </a>
                <button
                  onClick={() => setPreviewBill(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              src={pdfUrl(previewBill)}
              title="Bill preview"
              className="flex-1 w-full bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-[#12151c] px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40";
