import type { Metadata } from "next";
import "./globals.css";
import { Heading } from "@glow/ui";

export const metadata: Metadata = {
  title: "Glow & Flow",
  description: "Self-hosted full-stack webapp monorepo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Heading>Glow & Flow</Heading>
            <nav className="flex gap-4 text-sm text-gray-600">
              <a href="/" className="hover:text-gray-900">
                Home
              </a>
              <a href="/users" className="hover:text-gray-900">
                Users
              </a>
              <a href="/api/health" className="hover:text-gray-900">
                Health
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
