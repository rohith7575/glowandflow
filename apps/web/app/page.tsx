"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroCanvas from "../components/landing/HeroCanvas";
import Reveal from "../components/landing/Reveal";
import Counter from "../components/landing/Counter";

const services = [
  {
    title: "Electrical Works",
    kicker: "01",
    desc: "From new builds to rewires, panels, lighting and fault finding — wired to code, built to last.",
    items: ["New installations & rewiring", "Distribution boards & MCB upgrades", "Indoor / outdoor lighting design", "Fault tracing & repairs", "Earthing & surge protection"],
    accent: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/20",
  },
  {
    title: "CCTV & Security",
    kicker: "02",
    desc: "Crystal-clear surveillance, smart alerts and remote viewing — keep every corner in sight.",
    items: ["HD / 4K camera installation", "DVR / NVR setup & config", "Night vision & PTZ cameras", "Remote mobile viewing", "Maintenance & upgrades"],
    accent: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/20",
  },
];

const steps = [
  { n: "01", t: "Survey", d: "We inspect the site, understand the load and plan the cleanest route." },
  { n: "02", t: "Quote", d: "Clear, itemised pricing — no surprises, no hidden costs." },
  { n: "03", t: "Install", d: "Neat, code-compliant work done on schedule by our own team." },
  { n: "04", t: "Handover", d: "Tested, documented and handed over with a warranty." },
];

const features = [
  { t: "Licensed & insured", d: "Every job certified and backed by warranty." },
  { t: "Clean workmanship", d: "Concealed runs, labelled panels, zero mess left behind." },
  { t: "On-time delivery", d: "We respect your schedule and show up when promised." },
  { t: "Transparent pricing", d: "Itemised quotes you can actually read and trust." },
  { t: "24/7 support", d: "Emergency callouts for faults and security issues." },
  { t: "Future-ready", d: "Conduit and capacity planned for tomorrow's loads." },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0c10] text-gray-100">
      {/* Top nav */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0a0c10]/70 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-cyan-400 text-black font-bold shadow-lg shadow-amber-500/20">
              G
            </span>
            <span className="font-display text-xl tracking-tight">Glow &amp; Flow</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <a href="#services" className="hover:text-white transition">Services</a>
            <a href="#process" className="hover:text-white transition">Process</a>
            <a href="#why" className="hover:text-white transition">Why us</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm text-gray-300 hover:text-white sm:inline">
              Log in
            </Link>
            <a
              href="#contact"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
            >
              Get a quote
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative flex min-h-screen items-center overflow-hidden">
        <HeroCanvas />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0c10]/30 to-[#0a0c10]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 pb-20">
          <Reveal>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gray-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Electrical &amp; CCTV specialists
            </p>
          </Reveal>

          <h1 className="font-display text-[clamp(3rem,11vw,9rem)] leading-[0.9] tracking-tight">
            <Reveal variant="left" delay={100}>
              <span className="block">Make it</span>
            </Reveal>
            <Reveal variant="left" delay={220}>
              <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-cyan-300 bg-clip-text text-transparent animate-shimmer">
                Glow &amp; Flow.
              </span>
            </Reveal>
          </h1>

          <Reveal delay={400}>
            <p className="mt-8 max-w-xl text-lg text-gray-300/90 md:text-xl">
              Premium electrical installations and CCTV security systems — engineered clean, wired to code,
              and built to keep your spaces bright and safe.
            </p>
          </Reveal>

          <Reveal delay={520}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Start a project
                <span className="transition group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Explore services
              </a>
            </div>
          </Reveal>

          <Reveal delay={640}>
            <div className="mt-16 flex items-center gap-6 text-xs text-gray-400">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-[#0a0c10] bg-gradient-to-br from-amber-400 to-cyan-400"
                    style={{ filter: `hue-rotate(${i * 40}deg)` }}
                  />
                ))}
              </div>
              <span>Trusted by 200+ homes &amp; businesses</span>
            </div>
          </Reveal>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float">
          <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
            <span className="uppercase tracking-[0.3em]">Scroll</span>
            <span className="block h-10 w-px bg-gradient-to-b from-gray-400 to-transparent" />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="relative border-y border-white/5 bg-white/[0.02] py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0 items-center gap-12 px-6">
              {["Electrical Installations", "CCTV Systems", "Smart Lighting", "Fault Repair", "Security Audits", "Panel Upgrades", "Remote Monitoring", "Emergency Callouts"].map((s) => (
                <span key={s} className="font-display text-2xl text-white/30">
                  {s} <span className="text-amber-400/60">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="relative mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">What we do</p>
          <h2 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl">
            Two crafts. One standard of perfection.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 120} variant={i === 0 ? "left" : "right"}>
              <div
                className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 transition duration-500 hover:border-white/20 hover:shadow-2xl ${s.glow}`}
              >
                <div className={`absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br ${s.accent} opacity-20 blur-3xl transition duration-700 group-hover:opacity-40`} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-gray-500">{s.kicker}</span>
                    <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${s.accent} animate-spark`} />
                  </div>
                  <h3 className="mt-6 font-display text-3xl tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-gray-400">{s.desc}</p>
                  <ul className="mt-6 space-y-2.5">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-center gap-3 text-sm text-gray-300">
                        <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${s.accent}`} />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:gap-3"
                  >
                    Request this service <span>→</span>
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-20 md:grid-cols-4">
          {[
            { to: 200, suffix: "+", label: "Projects completed" },
            { to: 8, suffix: " yrs", label: "In the field" },
            { to: 24, suffix: "/7", label: "Emergency support" },
            { to: 100, suffix: "%", label: "Code compliant" },
          ].map((s) => (
            <Reveal key={s.label}>
              <div className="text-center">
                <div className="font-display text-5xl md:text-6xl tracking-tight bg-gradient-to-r from-amber-300 to-cyan-300 bg-clip-text text-transparent">
                  <Counter to={s.to} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-sm text-gray-400">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="process" className="relative mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">How we work</p>
          <h2 className="mt-4 font-display text-5xl md:text-6xl tracking-tight max-w-2xl">
            A clean process, from first call to final switch-on.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-400/30">
                <span className="font-mono text-xs text-amber-400">{s.n}</span>
                <h3 className="mt-4 font-display text-2xl tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm text-gray-400">{s.d}</p>
                {i < steps.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-gray-600 md:block">→</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section id="why" className="relative mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal variant="left">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400">Why Glow &amp; Flow</p>
            <h2 className="mt-4 font-display text-5xl md:text-6xl tracking-tight">
              Details you notice. Standards you can trust.
            </h2>
            <p className="mt-6 text-gray-400 max-w-md">
              We treat every cable, conduit and camera like it's our own home. The result is work that looks
              as good behind the wall as it does in front of it.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.t} delay={i * 80} variant="right">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]">
                  <h3 className="font-semibold text-white">{f.t}</h3>
                  <p className="mt-1 text-sm text-gray-400">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="relative px-6 py-28">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-cyan-500/10 p-10 md:p-16">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <Reveal>
            <h2 className="relative font-display text-4xl md:text-6xl tracking-tight max-w-2xl">
              Ready to light it up?
            </h2>
            <p className="relative mt-4 max-w-xl text-gray-300">
              Tell us about your space and we'll get back within one business day with a clear, itemised quote.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative mt-10 grid gap-4 md:grid-cols-2"
            >
              <input
                placeholder="Your name"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-amber-400/60 focus:bg-white/10"
              />
              <input
                placeholder="Phone or email"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-amber-400/60 focus:bg-white/10"
              />
              <textarea
                placeholder="Tell us about the project"
                rows={4}
                className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-amber-400/60 focus:bg-white/10"
              />
              <button
                type="submit"
                className="md:col-span-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Send enquiry
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-gray-500 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-cyan-400 text-black font-bold text-xs">
              G
            </span>
            <span>Glow &amp; Flow © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#services" className="hover:text-white transition">Services</a>
            <a href="#process" className="hover:text-white transition">Process</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
