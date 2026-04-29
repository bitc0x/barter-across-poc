"use client";
import Link from "next/link";
import { useState } from "react";
import { BarterLogoMark, AcrossLogoMark } from "@/components/Logos";

const PITCH = [
  {
    tag: "The gap",
    title: "Your users want to trade across chains.",
    body: "When a Barter user holds USDC on Arbitrum and wants to swap into a token on Ethereum mainnet, they leave your UI. That session is lost. Across closes that gap by keeping the user inside Barter from origin chain through to final swap.",
    accent: "orange",
  },
  {
    tag: "The rails",
    title: "Intent-based. Native assets. Sub-dollar fees.",
    body: "Across uses an intents architecture: relayers fund the destination instantly, UMA's optimistic oracle settles on-chain. Users receive canonical tokens in seconds. No lock-and-mint risk. No wrapped asset exposure. The fastest crosschain bridge by fill time.",
    accent: "green",
  },
  {
    tag: "The reciprocal deal",
    title: "Barter becomes a Swap API provider for Across.",
    body: "Across's Swap API routes through 0x, LiFi, and Uniswap today. Adding Barter's Superposition liquidity, wallet-native and exclusively accessible through Barter's router, gives every Across integrator a source of price improvement no other aggregator can match.",
    accent: "blue",
  },
];

// Across credentials - all facts from docs.across.to, across.to, and official publications
const ACROSS_CREDENTIALS = [
  {
    stat: "$35B+",
    label: "Bridged",
    sub: "Source: docs.across.to",
    col: "green",
  },
  {
    stat: "<2s",
    label: "Fill time",
    sub: "Fastest in the category",
    col: "green",
  },
  {
    stat: "0",
    label: "Exploits",
    sub: "18 OpenZeppelin audits",
    col: "green",
  },
  {
    stat: "$41M",
    label: "Raised",
    sub: "Paradigm, Bain Capital Crypto, Coinbase Ventures, Multicoin",
    col: "blue",
  },
];

const ACROSS_PROPS = [
  {
    icon: "⚡",
    title: "Under 2 seconds fill time",
    body: "The fastest crosschain infrastructure for builders, per Across's own docs. Relayers compete to fill instantly at destination before origin chain finalises.",
  },
  {
    icon: "🔒",
    title: "Zero exploits. Ever.",
    body: "18 comprehensive audits by OpenZeppelin. Only intent bridge with a perfect security record at $35B+ volume. OpenZeppelin published a dedicated case study.",
  },
  {
    icon: "💰",
    title: "Bridge 1 ETH for under $1",
    body: "Relayer competition drives fees to their floor. Stablecoin transfers on major L2 routes clear for cents. No protocol fee on selected routes.",
  },
  {
    icon: "🔧",
    title: "Single API call, any chain",
    body: "One POST handles the full crosschain plus swap flow. Integrators include Uniswap, MetaMask, Kraken Ink, PancakeSwap, Soneium, and Hyperliquid.",
  },
  {
    icon: "📐",
    title: "ERC-7683 co-author",
    body: "Co-authored with Uniswap Labs. The emerging standard for crosschain intents already adopted by Arbitrum, Base, and Optimism. Backed by 70+ projects.",
  },
  {
    icon: "🧩",
    title: "Custom actions at destination",
    body: "MulticallHandler enables arbitrary on-destination logic: bridge and stake, bridge and swap, bridge and deposit, all in a single user transaction.",
  },
];

export default function Home() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-barter-bg">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-barter-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarterLogoMark size={24} />
            <span className="font-semibold text-sm text-barter-text">Barter</span>
          </div>
          <span className="text-barter-muted text-sm font-mono px-1">x</span>
          <div className="flex items-center gap-2">
            <AcrossLogoMark size={24} />
            <span className="font-semibold text-sm text-barter-text">Across</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href="#pitch" className="text-sm text-barter-sub hover:text-barter-text transition-colors hidden md:block">The Deal</a>
          <a href="#across" className="text-sm text-barter-sub hover:text-barter-text transition-colors hidden md:block">Why Across</a>
          <Link href="/swap" className="text-sm bg-barter-orange text-white font-medium px-4 py-2 rounded-lg hover:bg-barter-orange-dim transition-colors">
            Live Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-barter-surface border border-barter-border rounded-full px-4 py-1.5 text-xs font-mono text-across-green mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-across-green animate-pulse2 inline-block" />
          Partnership proposal by Across Protocol BD
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
          <span className="text-barter-text">Barter, but</span>
          <br />
          <span className="text-barter-orange">cross-chain.</span>
        </h1>
        <p className="text-xl text-barter-sub max-w-2xl mb-4 leading-relaxed">
          Barter has the best same-chain execution on Ethereum. Across has the fastest, cheapest crosschain rails on L2s. This is what they look like together.
        </p>
        <p className="text-sm text-barter-muted max-w-2xl mb-12 font-mono">
          Functional proof of concept by Across Protocol BD. The cross-chain tab in the swap interface is wired to the live Across API.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/swap" className="inline-flex items-center gap-2 bg-barter-orange text-white font-semibold px-6 py-3 rounded-xl hover:bg-barter-orange-dim transition-all glow-orange">
            Open swap demo
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="#pitch" className="inline-flex items-center gap-2 bg-barter-surface border border-barter-border text-barter-text font-medium px-6 py-3 rounded-xl hover:bg-barter-hover transition-all">
            Read the pitch
          </a>
        </div>
      </section>



      {/* The pitch */}
      <section id="pitch" className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono text-barter-orange tracking-widest uppercase mb-3">The partnership</div>
          <h2 className="text-4xl font-bold text-barter-text mb-4">Two-sided. Structural. Exclusive.</h2>
          <p className="text-barter-sub text-lg max-w-2xl">
            Not a generic bridge widget. A mutual infrastructure deal where both protocols gain something no competitor can replicate.
          </p>
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

      {/* Across credentials - the selling section */}
      <section id="across" className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="text-xs font-mono text-across-green tracking-widest uppercase mb-3">Why Across</div>
          <h2 className="text-4xl font-bold text-barter-text mb-3">
            $35B bridged. Under 2 seconds. Zero exploits.
          </h2>
          <p className="text-barter-sub text-lg max-w-2xl">
            The only crosschain intents protocol in production. The fastest crosschain infrastructure for builders.
          </p>
          <p className="text-xs text-barter-muted font-mono mt-2">All metrics from docs.across.to</p>
        </div>

        {/* Large stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {ACROSS_CREDENTIALS.map((c) => (
            <div key={c.stat} className={`bg-barter-card border rounded-xl p-5 ${c.col === "green" ? "border-across-green/30" : "border-across-blue/30"}`}>
              <div className={`text-4xl font-bold font-mono mb-1 ${c.col === "green" ? "text-across-green" : "text-across-blue"}`}>{c.stat}</div>
              <div className="text-sm font-medium text-barter-text mb-1">{c.label}</div>
              <div className="text-xs text-barter-muted leading-relaxed">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Properties grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACROSS_PROPS.map((p, i) => (
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
          <h2 className="text-4xl font-bold text-barter-text mb-4">The demo is live. The integration is ready.</h2>
          <p className="text-barter-sub mb-8 max-w-xl mx-auto">
            The cross-chain tab in the swap interface hits the real Across API. One call to enable it in Barter's production frontend.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/swap" className="inline-flex items-center gap-2 bg-across-green text-barter-bg font-bold px-8 py-3.5 rounded-xl hover:bg-across-green-dim transition-all">
              Try the live demo
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="https://across.to" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-barter-surface border border-barter-border text-barter-text font-medium px-8 py-3.5 rounded-xl hover:bg-barter-hover transition-all">
              Across Protocol
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-barter-border px-6 py-8 text-center text-xs text-barter-muted font-mono">
        Built by Across Protocol BD · victorb@umaproject.org · Proof of concept, not affiliated with Barter
      </footer>
    </div>
  );
}
