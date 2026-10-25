"use client";

import { useEffect, useState } from "react";

export default function OverviewPage() {
  const [counts, setCounts] = useState({ services: 0, parties: 0, bills: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/parties").then((r) => r.json()),
      fetch("/api/bills").then((r) => r.json()),
    ]).then(([s, p, bl]) => {
      setCounts({
        services: s.data?.length ?? 0,
        parties: p.data?.length ?? 0,
        bills: bl.data?.length ?? 0,
      });
    });
  }, []);

  const cards = [
    { label: "Services", value: counts.services, href: "/dashboard/services" },
    { label: "Parties", value: counts.parties, href: "/dashboard/parties" },
    { label: "Bills", value: counts.bills, href: "/dashboard/bills" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">Manage your services, parties, bill info and bills.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="group rounded-2xl border border-white/10 bg-[#12151c] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{c.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{c.value}</p>
            <p className="mt-2 text-sm text-gray-400 group-hover:text-white">View →</p>
          </a>
        ))}
      </div>
    </div>
  );
}
