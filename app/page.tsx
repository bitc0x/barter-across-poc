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
    tag: "The moat",
    title: "A security story your competitors cannot replicate.",
    body: "Relay and other bridges have lock-and-mint exposure and a combined $2.9B in industry exploits. Across has never been exploited across $35B+ bridged. Adding Across gives Barter a verifiable, differentiated security guarantee built into the product.",
    accent: "blue",
  },
];

// All stats from docs.across.to (verified April 2026)
const ACROSS_CREDENTIALS = [
  { stat: "$35B+", label: "Bridged", sub: "Source: docs.across.to", col: "green" },
  { stat: "<2s",   label: "Fill time", sub: "Fastest in the category", col: "green" },
  { stat: "0",     label: "Exploits", sub: "18 OpenZeppelin audits", col: "green" },
  { stat: "$41M",  label: "Raised", sub: "Paradigm, Bain Capital Crypto, Coinbase Ventures, Multicoin", col: "blue" },
];

// 6 cards: clean 2x3 grid on desktop, no orphan
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
    icon: "🏛️",
    title: "Fully decentralized. Non-custodial.",
    body: "No locked funds, no admin keys, no multisig honeypot. Relayers front their own capital per transfer. Users never give up custody of assets at any point.",
  },
  {
    icon: "💰",
    title: "Bridge 1 ETH for under $1",
    body: "Relayer competition drives fees to their floor. Stablecoin transfers on major L2 routes clear for cents. Confirmed on Across's own homepage.",
  },
  {
    icon: "🔧",
    title: "Single API call, any chain",
    body: "One POST handles the full crosschain plus swap flow. Live integrators include Uniswap, MetaMask, Kraken Ink, PancakeSwap, Soneium, and Hyperliquid.",
  },
  {
    icon: "📐",
    title: "ERC-7683 co-author",
    body: "Co-authored with Uniswap Labs. The standard for crosschain intents, already adopted by Arbitrum, Base, and Optimism as major L2s.",
  },
];

const SECURITY_ROWS = [
  { label: "Custody model",  across: "Non-custodial always",    others: "Funds locked in contract" },
  { label: "Admin control",  across: "None. Permissionless",    others: "Multisig or admin keys" },
  { label: "Asset type",     across: "Canonical tokens only",   others: "Wrapped representations" },
  { label: "Failure model",  across: "1-of-N honest relayer",   others: "M-of-N validators" },
  { label: "Exploit history",across: "Zero across $35B+",       others: "$2.9B lost industry-wide" },
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
          <a href="#why-across" className="text-sm text-barter-sub hover:text-barter-text transition-colors hidden md:block">Why Across</a>
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
          Barter has the best same-chain execution on Ethereum. Across has the fastest, safest crosschain rails on L2s. This is what they look like together.
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
          <h2 className="text-4xl font-bold text-barter-text mb-4">Three reasons. One integration.</h2>
          <p className="text-barter-sub text-lg max-w-2xl">
            Barter becomes the only DEX aggregator where users can source, bridge, and execute across any chain without leaving the interface.
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

      {/* Security architecture callout */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="bg-barter-card border border-barter-border rounded-2xl p-8 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="text-xs font-mono text-across-green tracking-widest uppercase mb-3">Security architecture</div>
            <h2 className="text-2xl font-bold text-barter-text mb-4 leading-snug">
              No locked funds.<br />No admin keys.<br />No honeypot.
            </h2>
            <p className="text-barter-sub text-sm leading-relaxed mb-4">
              Most bridges lock user funds in smart contracts, creating a single target worth hundreds of millions. Across has no locked funds. Relayers front their own capital for each transfer, eliminating the honeypot entirely.
            </p>
            <p className="text-barter-sub text-sm leading-relaxed">
              No multisig that can be compromised. No validators that can collude. No wrapped assets that can be minted to zero. Users stay in full custody throughout. Security through architecture, not through trust.
            </p>
          </div>
          <div>
            <div className="space-y-0 divide-y divide-barter-border">
              <div className="grid grid-cols-3 gap-3 py-2.5 text-[11px] font-mono text-barter-muted">
                <span></span>
                <span className="text-across-green font-semibold">Across</span>
                <span>Industry</span>
              </div>
              {SECURITY_ROWS.map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-3 py-2.5 text-xs items-start">
                  <span className="text-barter-muted font-mono text-[11px] pt-0.5">{row.label}</span>
                  <span className="text-across-green font-medium leading-tight">{row.across}</span>
                  <span className="text-barter-muted line-through leading-tight">{row.others}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-barter-muted font-mono mt-3">
              Sources: across.to/blog/why-across-has-never-been-hacked · defillama.com/hacks
            </p>
          </div>
        </div>
      </section>

      {/* Why Across */}
      <section id="why-across" className="px-6 pb-24 max-w-6xl mx-auto">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {ACROSS_CREDENTIALS.map((c) => (
            <div key={c.stat} className={`bg-barter-card border rounded-xl p-5 ${c.col === "green" ? "border-across-green/30" : "border-across-blue/30"}`}>
              <div className={`text-4xl font-bold font-mono mb-1 ${c.col === "green" ? "text-across-green" : "text-across-blue"}`}>{c.stat}</div>
              <div className="text-sm font-medium text-barter-text mb-1">{c.label}</div>
              <div className="text-xs text-barter-muted leading-relaxed">{c.sub}</div>
            </div>
          ))}
        </div>

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
