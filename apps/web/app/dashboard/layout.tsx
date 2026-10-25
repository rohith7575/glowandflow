"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/parties", label: "Parties" },
  { href: "/dashboard/billinfo", label: "Bill Info" },
  { href: "/dashboard/bills", label: "Bills" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j?.data) router.replace("/login");
        else setUser(j.data);
      })
      .finally(() => setReady(true));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="px-2 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Glow & Flow</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{user?.name || user?.email}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <nav className="mt-2 space-y-1">
              {nav.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
