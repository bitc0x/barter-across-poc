"use client";
import Link from "next/link";
import { useState } from "react";

const STATS = [
  { n: "$25B+", l: "Total bridged" },
  { n: "<10s", l: "Avg settlement" },
  { n: "100+", l: "Protocol integrations" },
  { n: "$0", l: "Exploits" },
];

const PITCH = [
  {
    tag: "The gap",
    title: "Your users want to trade across chains.",
    body: "Right now, when a Barter user holds ETH on Arbitrum and wants to swap into a token on Ethereum mainnet, they leave your UI. That session is lost. Across closes that gap — keeping the user inside Barter from origin chain to final swap.",
    accent: "orange",
  },
  {
    tag: "The rails",
    title: "Intent-based. No wrapped assets. Sub-dollar fees.",
    body: "Across uses an intent architecture: relayers fund the destination instantly, UMA's optimistic oracle settles on-chain. Users get native assets in seconds. No lock-and-mint risk. No 10-minute waits. The fastest L2 bridge by settlement time.",
    accent: "green",
  },
  {
    tag: "The reciprocal deal",
    title: "Barter becomes a Swap API provider for Across.",
    body: "Across's Swap API routes through 0x, LiFi, and Uniswap today. Adding Barter's Superposition liquidity — wallet-native, exclusively accessible through Barter's router — gives every Across integrator a source of price improvement no other aggregator can touch.",
    accent: "blue",
  },
];

export default function Home() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-barter-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-barter-border">
        <div className="flex items-center gap-3">
          <BarterLogo />
          <span className="text-barter-muted text-sm font-mono">×</span>
          <AcrossLogo />
        </div>
        <div className="flex items-center gap-6">
          <a href="#pitch" className="text-sm text-barter-sub hover:text-barter-text transition-colors">The Deal</a>
          <a href="#why-across" className="text-sm text-barter-sub hover:text-barter-text transition-colors">Why Across</a>
          <Link
            href="/swap"
            className="text-sm bg-barter-orange text-white font-medium px-4 py-2 rounded-lg hover:bg-barter-orange-dim transition-colors"
          >
            Live Demo →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-barter-surface border border-barter-border rounded-full px-4 py-1.5 text-xs font-mono text-across-green mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-across-green animate-pulse2 inline-block" />
          Partnership proposal — Across Protocol BD
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
          <span className="text-barter-text">Barter, but</span>
          <br />
          <span className="text-barter-orange">cross-chain.</span>
        </h1>

        <p className="text-xl text-barter-sub max-w-2xl mb-4 leading-relaxed">
          Barter has the best same-chain execution on Ethereum. Across has the fastest, cheapest cross-chain rails on L2s.
          This is what they look like together.
        </p>
        <p className="text-sm text-barter-muted max-w-2xl mb-12 font-mono">
          This demo is a functional proof of concept built by Across Protocol BD. The cross-chain tab in the swap interface is live and wired to the Across API.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/swap"
            className="inline-flex items-center gap-2 bg-barter-orange text-white font-semibold px-6 py-3 rounded-xl hover:bg-barter-orange-dim transition-all glow-orange"
          >
            Open swap demo
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a
            href="#pitch"
            className="inline-flex items-center gap-2 bg-barter-surface border border-barter-border text-barter-text font-medium px-6 py-3 rounded-xl hover:bg-barter-hover transition-all"
          >
            Read the pitch
          </a>
        </div>
      </section>

      {/* Stats row */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.n} className="bg-barter-surface border border-barter-border rounded-xl p-5">
              <div className="text-3xl font-bold font-mono text-across-green mb-1">{s.n}</div>
              <div className="text-sm text-barter-muted">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pitch */}
      <section id="pitch" className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono text-barter-orange tracking-widest uppercase mb-3">The partnership</div>
          <h2 className="text-4xl font-bold text-barter-text mb-4">Two-sided. Structural. Exclusive.</h2>
          <p className="text-barter-sub text-lg max-w-2xl">Not a generic bridge widget. A mutual infrastructure deal where both protocols gain something no competitor can replicate.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PITCH.map((p, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`bg-barter-card border rounded-2xl p-6 transition-all duration-200 cursor-default ${
                hovered === i
                  ? p.accent === "orange" ? "border-barter-orange glow-orange"
                  : p.accent === "green" ? "border-across-green glow-green"
                  : "border-across-blue"
                  : "border-barter-border"
              }`}
            >
              <div className={`text-xs font-mono tracking-widest uppercase mb-4 ${
                p.accent === "orange" ? "text-barter-orange"
                : p.accent === "green" ? "text-across-green"
                : "text-across-blue"
              }`}>{p.tag}</div>
              <h3 className="text-lg font-semibold text-barter-text mb-3 leading-snug">{p.title}</h3>
              <p className="text-sm text-barter-sub leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Across */}
      <section id="why-across" className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono text-across-green tracking-widest uppercase mb-3">Why Across</div>
          <h2 className="text-4xl font-bold text-barter-text mb-4">The intent bridge built for integrators.</h2>
          <p className="text-barter-sub text-lg max-w-2xl">Not a UI play. An infrastructure layer designed from day one for protocols like Barter to embed.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {WHY_PROPS.map((p, i) => (
            <div key={i} className="bg-barter-surface border border-barter-border rounded-xl p-5 hover:border-across-green/40 transition-colors">
              <div className="text-2xl mb-3">{p.icon}</div>
              <div className="font-semibold text-barter-text mb-2 text-sm">{p.title}</div>
              <div className="text-xs text-barter-muted leading-relaxed">{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32 max-w-6xl mx-auto">
        <div className="bg-barter-card border border-across-green/20 rounded-3xl p-10 text-center glow-green">
          <div className="text-xs font-mono text-across-green tracking-widest uppercase mb-4">Ready to ship</div>
          <h2 className="text-4xl font-bold text-barter-text mb-4">This demo is live. The integration is ready.</h2>
          <p className="text-barter-sub mb-8 max-w-xl mx-auto">The cross-chain tab in the swap interface below hits the real Across API. One call to enable it in Barter's production frontend.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/swap"
              className="inline-flex items-center gap-2 bg-across-green text-barter-bg font-bold px-8 py-3.5 rounded-xl hover:bg-across-green-dim transition-all"
            >
              Try the live demo
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a
              href="https://across.to"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-barter-surface border border-barter-border text-barter-text font-medium px-8 py-3.5 rounded-xl hover:bg-barter-hover transition-all"
            >
              Across Protocol
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-barter-border px-6 py-8 text-center text-xs text-barter-muted font-mono">
        <span>Built by Across Protocol BD · victorb@umaproject.org · This is a proof of concept, not affiliated with Barter</span>
      </footer>
    </div>
  );
}

const WHY_PROPS = [
  { icon: "⚡", title: "Sub-10s settlement on L2s", body: "Relayers fill instantly at destination. Users receive native assets before origin chain finalises." },
  { icon: "🔒", title: "No wrapped asset risk", body: "Intent-based: no lock-and-mint. Relayers fund from inventory. UMA oracle handles settlement." },
  { icon: "💰", title: "Sub-dollar stablecoin fees", body: "Relayer competition drives fees to their floor. USDC Arbitrum → Base consistently under $0.50." },
  { icon: "🔧", title: "API-first, one call", body: "POST /swap/approval handles the full cross-chain + swap flow. Live in 100+ protocol integrations." },
  { icon: "🧩", title: "Custom actions", body: "Bridge and stake, bridge and swap, bridge and deposit — arbitrary on-destination logic in one tx." },
  { icon: "🏆", title: "$25B+ bridged, zero exploits", body: "Largest intent bridge by volume. OpenZeppelin audited. Best security track record in the category." },
];

function BarterLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-7 h-7 rounded-lg bg-barter-orange flex items-center justify-center">
        <span className="text-white font-bold text-xs font-mono">B</span>
      </div>
      <span className="font-semibold text-sm text-barter-text">Barter</span>
    </div>
  );
}

function AcrossLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-7 h-7 rounded-lg bg-across-green flex items-center justify-center">
        <span className="text-barter-bg font-bold text-xs font-mono">A</span>
      </div>
      <span className="font-semibold text-sm text-barter-text">Across</span>
    </div>
  );
}
