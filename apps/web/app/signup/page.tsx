"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Signup failed");
      setInfo("We sent a one-time code. Check the server console for the OTP.");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a0c10] to-[#0f1219] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/5 bg-[#12151c] p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-cyan-400 text-black shadow-sm">
            <span className="text-lg font-bold">G</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Create account</h1>
          <p className="mt-1 text-sm text-gray-400">Sign up to get started.</p>
        </div>

        {step === "details" ? (
          <form onSubmit={submitDetails} className="mt-6 space-y-4">
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Phone (optional)">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls}
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300 disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="mt-6 space-y-4">
            {info && <p className="text-sm text-gray-400">{info}</p>}
            <Field label="Verification code">
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={inputCls + " tracking-widest"}
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-amber-300 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & create account"}
            </button>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="w-full text-sm text-gray-400 hover:text-white"
            >
              Back
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-white hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-[#12151c] px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-400">{label}</span>
      {children}
    </label>
  );
}
