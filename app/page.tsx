"use client";
import Link from "next/link";
import { BarterLogoMark, AcrossLogoMark } from "@/components/Logos";

// ── Data ────────────────────────────────────────────────────────────

const INTEGRATORS = [
  "Uniswap", "MetaMask", "PancakeSwap", "Kraken Ink",
  "Hyperliquid", "Soneium", "Lido", "ether.fi",
  "Coinbase", "Phantom", "Jumper", "Superbridge",
];

const STATS = [
  { n: "$35B+", l: "Bridged", sub: "docs.across.to" },
  { n: "0",     l: "Exploits", sub: "Since 2021 mainnet launch" },
  { n: "0",     l: "Downtime", sub: "Continuously operational" },
  { n: "<2s",   l: "Fill time", sub: "P50 on major L2 routes" },
];

const PATHWAYS = [
  {
    n: "01", label: "PATHWAY 01", title: "Intents",
    body: "A decentralized network of relayers competes to fill user intents on the destination chain. Capital is fronted by the relayer; settlement verified by UMA's Optimistic Oracle. No wrapped tokens, no lock-and-mint.",
    meta: [{ k: "FILL", v: "~1.2 sec" }, { k: "TOKEN", v: "Any supported" }],
    col: "#5BF3A0",
  },
  {
    n: "02", label: "PATHWAY 02", title: "CCTP V2 / CCTPFast",
    body: "Circle's native USDC mint-and-burn. Burned on origin, minted natively on destination. No relayer capital required. Activates automatically for large USDC transfers up to $10M per transaction.",
    meta: [{ k: "MAX", v: "$10M" }, { k: "TOKEN", v: "Native USDC" }],
    col: "#5BF3A0",
  },
  {
    n: "03", label: "PATHWAY 03", title: "OFT",
    body: "LayerZero's Omnichain Fungible Token standard for native USDT0 mint-and-burn. No wrapped tokens, no liquidity pools, no relayer capital required.",
    meta: [{ k: "SETTLEMENT", v: "Native" }, { k: "TOKEN", v: "USDT0" }],
    col: "#5BF3A0",
  },
];

const EXCLUSIVE_ROUTES = [
  {
    tag: "SPONSORED ROUTE",
    title: "USDC anywhere to USDH on HyperCore",
    body: "Across powers the official USDC deposit flow for Hyperliquid's USDH stablecoin. The route is sponsored: zero bridge fee for users. Barter can surface this route natively, driving HyperLiquid-native volume through your frontend at no cost to users.",
    col: "#5BF3A0",
  },
  {
    tag: "CEX-GRADE UX",
    title: "Deposit addresses: no wallet required on origin",
    body: "Counterfactual deposit addresses let users send funds to a deterministic on-chain address. No smart-contract interaction, no wallet popup on the source chain. Across handles routing automatically. In production with Coinbase, Native Markets (usdh.com), and Hyperbeat.",
    col: "#5BF3A0",
  },
  {
    tag: "COMPOSABILITY",
    title: "Embedded actions on the destination",
    body: "Every quote can carry destination-side calldata, executed atomically with the bridge fill. Bridge USDC, swap to any token, deposit into a vault, all in one signed transaction with no half-states. One Swap API call handles the entire flow.",
    col: "#5BF3A0",
  },
];

const FEE_ROWS = [
  { label: "Across protocol fee", value: "0%", note: "No protocol fee. Ever.", green: true },
  { label: "Relayer spread (stablecoin, L2)", value: "$0.80–$1.40", note: "Lowest all-in cost in category" },
  { label: "appFee parameter", value: "You set it", note: "Barter keeps 100% of app fee revenue" },
  { label: "Integration cost", value: "$0", note: "Permissionless. Public API. No contract." },
];

// ── Component ────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0E14", fontFamily: "'Inter', system-ui, sans-serif", color: "#FFFFFF" }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 56,
        background: "rgba(10,14,20,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarterLogoMark size={20} />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#FF8C20" }}>Barter</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, margin: "0 4px" }}>×</span>
          <AcrossLogoMark size={20} />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#5BF3A0" }}>Across</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Security", "Speed", "Architecture", "Revenue", "Exclusive Routes"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >{l}</a>
          ))}
          <Link href="/swap" style={{ background: "#5BF3A0", color: "#0A0E14", fontWeight: 700, fontSize: 13, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>
            Live demo
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 140, paddingBottom: 120, paddingLeft: 48, paddingRight: 48, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(91,243,160,0.08)", border: "1px solid rgba(91,243,160,0.2)", borderRadius: 100, padding: "5px 14px", marginBottom: 48 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: "#5BF3A0", display: "inline-block" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 2 }}>ACROSS PROTOCOL · BD PROPOSAL · 2026</span>
        </div>

        <h1 style={{ fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-2px", margin: "0 0 8px 0" }}>
          Never hacked.
        </h1>
        <h1 style={{ fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-2px", margin: "0 0 8px 0" }}>
          Never down.
        </h1>
        <h1 style={{ fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-2px", color: "#5BF3A0", margin: "0 0 48px 0" }}>
          Now in Barter.
        </h1>

        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 620, lineHeight: 1.7, marginBottom: 16 }}>
          Across has moved $35B+ across 23+ chains since 2021 with zero exploits and zero downtime. One API call adds cross-chain execution to Barter's frontend. Zero protocol fee. Zero integration cost.
        </p>
        <p style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(91,243,160,0.7)", marginBottom: 52 }}>
          The cross-chain tab below is live, wired to the Across Swap API, running on mainnet.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/swap" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5BF3A0", color: "#0A0E14", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
            Open swap demo
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="#security" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontWeight: 500, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
            Read the pitch
          </a>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, marginTop: 80, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: "28px 24px", background: "rgba(255,255,255,0.02)", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: "#5BF3A0", letterSpacing: "-1px", lineHeight: 1, marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>{s.n}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE COST OF INACTION ── */}
      <section style={{ padding: "0 48px 120px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ padding: "64px 56px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24 }}>

          {/* The scenario */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,140,32,0.8)", letterSpacing: 3, marginBottom: 24 }}>THE GAP</div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 300, letterSpacing: "-1px", lineHeight: 1.2, margin: "0 0 36px 0" }}>
                Every day without cross-chain,<br />
                <span style={{ fontWeight: 700, color: "#FF8C20" }}>Barter loses users to competitors.</span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 24px 0" }}>
                They hold ETH on Ethereum. They want to buy a token on Arbitrum. Barter cannot execute that trade today. So they open a separate app, bridge manually, and complete the swap somewhere else.
              </p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: 0 }}>
                That session is gone. That user associated the friction with Barter's product. Some percentage of them do not come back.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  n: "~40%",
                  label: "of DeFi users hold assets on a different chain from where they want to trade",
                  src: "Across internal data",
                  orange: true,
                },
                {
                  n: "0",
                  label: "cross-chain routes available in Barter's UI today",
                  src: "Observed",
                  orange: false,
                },
                {
                  n: "1",
                  label: "API call to close that gap permanently",
                  src: "docs.across.to",
                  orange: false,
                  green: true,
                },
              ].map((s, i) => (
                <div key={i} style={{ padding: "20px 24px", background: "rgba(255,255,255,0.03)", border: `1px solid ${s.orange ? "rgba(255,140,32,0.2)" : s.green ? "rgba(91,243,160,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: s.orange ? "#FF8C20" : s.green ? "#5BF3A0" : "rgba(255,255,255,0.25)", letterSpacing: "-1px", fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 10 }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: s.orange ? "rgba(255,255,255,0.8)" : s.green ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: 1 }}>{s.src}</div>
                </div>
              ))}
            </div>
          </div>

          {/* The punchline */}
          <div style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, maxWidth: 800, margin: "0 0 8px 0" }}>
              This is not a future problem. It is happening on every session where a Barter user's assets are on the wrong chain. Adding Across does not require a roadmap item, a new product, or a new team. It requires <strong style={{ color: "#fff" }}>one API call and a new tab in the swap interface.</strong> The demo below already shows exactly what that looks like: built in a single session, running live on mainnet.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROOF: WE ALREADY BUILT IT ── */}
      <section style={{ padding: "0 48px 120px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 32 }}>PROOF OF WORK</div>
        <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 300, letterSpacing: "-1px", lineHeight: 1.15, margin: "0 0 12px 0" }}>
          We did not send a deck.
        </h2>
        <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, fontStyle: "italic", letterSpacing: "-1px", lineHeight: 1.15, color: "#5BF3A0", margin: "0 0 32px 0" }}>
          We built the integration first.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 680, lineHeight: 1.75, marginBottom: 48 }}>
          This is a working fork of Barter's own frontend with Across cross-chain swaps fully wired in. The quote in the demo below comes from the live Across Swap API. The transaction that executes goes on-chain. We shipped this before the first conversation, so you can see exactly what your users would experience, not a mockup of it.
        </p>

        {/* Demo card */}
        <div style={{ position: "relative", border: "1px solid rgba(91,243,160,0.15)", borderRadius: 20, overflow: "hidden", background: "rgba(91,243,160,0.03)" }}>
          {/* Simulated browser chrome */}
          <div style={{ padding: "12px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c, opacity: 0.6 }} />)}
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
              barter-across-poc.vercel.app/swap
            </div>
          </div>

          {/* Demo preview content */}
          <div style={{ padding: "40px 40px 48px" }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 24 }}>LIVE DEMO · CROSS-CHAIN TAB · ARBITRUM TO ETHEREUM</div>

            {/* Mock of the swap UI */}
            <div style={{ display: "flex", gap: 8, alignItems: "stretch", maxWidth: 780 }}>
              {/* Sell card - ETH on Ethereum */}
              <div style={{ flex: 1, background: "#46485E", borderRadius: 16, padding: "20px 24px", border: "2px solid rgba(255,255,255,0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "4px 10px 4px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 9, background: "#627EEA", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff" }}>E</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>ETH</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>▾</span>
                  </div>
                  <div style={{ background: "rgba(91,243,160,0.12)", border: "1px solid rgba(91,243,160,0.25)", borderRadius: 10, padding: "3px 8px", fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", fontWeight: 600 }}>ETH</div>
                </div>
                <div style={{ fontSize: 64, fontWeight: 800, color: "#fff", letterSpacing: "-2px", lineHeight: 1, marginBottom: 8 }}>0.5</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Balance: 1.24</div>
              </div>

              {/* Arrow */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "#1a1f2a", border: "2px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth={2.5}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                </div>
              </div>

              {/* Buy card - USDC on Arbitrum */}
              <div style={{ flex: 1, background: "#364470", borderRadius: 16, padding: "20px 24px", border: "2px solid rgba(255,255,255,0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "4px 10px 4px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 9, background: "#2775CA", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff" }}>U</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>USDC</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>▾</span>
                  </div>
                  <div style={{ background: "rgba(91,243,160,0.12)", border: "1px solid rgba(91,243,160,0.25)", borderRadius: 10, padding: "3px 8px", fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", fontWeight: 600 }}>ARB</div>
                </div>
                <div style={{ fontSize: 64, fontWeight: 800, color: "#fff", letterSpacing: "-2px", lineHeight: 1, marginBottom: 4 }}>1,243.18</div>
                <div style={{ fontSize: 11, color: "#5BF3A0", fontWeight: 600, marginBottom: 4 }}>Via Across · ~2s · Fee $0.24</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Min: 1,230.00</div>
              </div>

              {/* CTA */}
              <div style={{ width: 110, flexShrink: 0, background: "#5BF3A0", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <div style={{ width: 20, height: 20 }}><AcrossLogoMark size={20} /></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0a1a0a", textAlign: "center", lineHeight: 1.3 }}>Bridge ETH to ARB</span>
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "#5BF3A0" }} />
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>Cross-chain powered by Across Protocol · Swap API · live on Ethereum mainnet</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link href="/swap" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5BF3A0", color: "#0A0E14", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
            Open live demo
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="https://etherscan.io/tx/0xfc1977fe5c69b2886f0c9480aa24cdf1af3ac4b62ba283c079ef79cfda69cfa1" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 13, padding: "12px 24px", borderRadius: 10, fontFamily: "monospace", textDecoration: "none", overflow: "hidden", maxWidth: "100%" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(91,243,160,0.3)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          >
            Confirmed on-chain · tx: 0xfc1977fe...cfa1 ↗
          </a>
        </div>
      </section>

      {/* ── 01 SECURITY ── */}
      <section id="security" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 24 }}>01 / SECURITY & RELIABILITY</div>
        <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 200, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 8px 0" }}>
          While bridges burn,
        </h2>
        <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 700, fontStyle: "italic", letterSpacing: "-1.5px", lineHeight: 1.1, color: "#5BF3A0", margin: "0 0 40px 0" }}>
          Across stays boring.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 720, lineHeight: 1.75, marginBottom: 72 }}>
          Cross-chain bridges have absorbed roughly half of every dollar stolen in Web3 since 2021. The attack surface is architectural: bridges concentrate value into a small number of contracts and a small number of keys. Across eliminates that surface entirely. There is no honeypot to attack, no multisig to bribe, no admin key to compromise. Through every market cycle and every wave of attacks, <strong style={{ color: "#fff", fontWeight: 600 }}>Across has moved $35B+ with zero exploits and zero downtime.</strong>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", marginBottom: 40 }}>
          {[
            { k: "CUSTODY MODEL", v: "Non-custodial smart-contract escrow.", detail: "User funds never leave Across contracts until the fill is verified on-chain." },
            { k: "VERIFICATION", v: "UMA Optimistic Oracle + Succinct ZK proofs.", detail: "V4 adds SP1 zero-knowledge proofs for trustless verification on non-EVM destinations." },
            { k: "SINGLE POINT OF FAILURE", v: "None.", detail: "One honest disputer is sufficient to reject a malicious bundle. No quorum assumption." },
            { k: "SOLVER MODEL", v: "Decentralized relayer network.", detail: "Permissionless to join, competitive on price. No single operator can halt the protocol." },
          ].map((row, i) => (
            <div key={i} style={{ padding: "28px 32px", background: i % 2 === 0 ? "rgba(91,243,160,0.03)" : "rgba(255,255,255,0.01)", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 10 }}>{row.k}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#5BF3A0", marginBottom: 6 }}>{row.v}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{row.detail}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { title: "10+ OpenZeppelin audits", body: "Continuous adversarial review since V2. Each major upgrade ships with a published audit report." },
            { title: "UMA's Optimistic Oracle", body: "Bundle proposers stake economic bonds. A single honest disputer is enough to reject a malicious bundle. No multisig, no validator quorum to corrupt." },
            { title: "Active bug bounty", body: "An ongoing program rewards responsible disclosure. Combined with continuous audit cadence, the protocol is under permanent adversarial pressure." },
          ].map((c, i) => (
            <div key={i} style={{ padding: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(91,243,160,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5BF3A0" strokeWidth={2}><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 02 SPEED & SLA ── */}
      <section id="speed" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 24 }}>02 / SPEED & RELIABILITY</div>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 200, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 8px 0" }}>
          The fastest crosschain
        </h2>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 700, fontStyle: "italic", letterSpacing: "-1.5px", lineHeight: 1.1, color: "#5BF3A0", margin: "0 0 40px 0" }}>
          infrastructure in production.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 680, lineHeight: 1.75, marginBottom: 64 }}>
          Relayer competition drives fills to their execution floor. There is no sequencer queue, no messaging delay, no waiting for validator confirmation. The relayer funds the destination the moment the intent is submitted. P50 fill time on major L2 routes is under 2 seconds.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", marginBottom: 40 }}>
          {[
            { label: "MEDIAN FILL TIME", value: "<2", unit: "sec", note: "P50 on major L2 routes. Relayer funds destination before origin chain confirms." },
            { label: "PROTOCOL UPTIME", value: "99.99", unit: "%", note: "Maintained since 2021 mainnet launch. Continuously operational through every market event." },
            { label: "API RESPONSE · P90", value: "<650", unit: "ms", note: "90% of API calls served under 650ms. Sub-second quote-to-fill for real-time UX." },
          ].map((m, i) => (
            <div key={i} style={{ padding: "32px 28px", background: "rgba(255,255,255,0.02)", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 20 }}>{m.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                <span style={{ fontSize: 48, fontWeight: 700, color: "#5BF3A0", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{m.value}</span>
                <span style={{ fontSize: 18, color: "#5BF3A0", fontWeight: 400 }}>{m.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{m.note}</div>
            </div>
          ))}
        </div>

        {/* SLA callout */}
        <div style={{ padding: "28px 32px", background: "rgba(91,243,160,0.04)", border: "1px solid rgba(91,243,160,0.12)", borderRadius: 14 }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 12 }}>ENTERPRISE SLAS</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>
            Across operates against strict service-level commitments for its largest integrators, including dedicated engineering response under one hour for P1 incidents and committed uptime guarantees in writing. The same standards are available to Barter from day one.
          </p>
        </div>
      </section>

      {/* ── 03 ARCHITECTURE ── */}
      <section id="architecture" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 24 }}>03 / ARCHITECTURE</div>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 200, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 8px 0" }}>
          Three settlement mechanisms.
        </h2>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 700, fontStyle: "italic", letterSpacing: "-1.5px", lineHeight: 1.1, color: "#5BF3A0", margin: "0 0 40px 0" }}>
          One unified API.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 680, lineHeight: 1.75, marginBottom: 64 }}>
          Across is not a single-mechanism bridge. It intelligently routes through three independent settlement pathways, automatically selecting the optimal path based on token, amount, and route. Builders integrate one endpoint. The protocol handles mechanism selection internally.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 40 }}>
          {PATHWAYS.map((p, i) => (
            <div key={i} style={{ padding: "28px 24px", background: "rgba(91,243,160,0.03)", border: "1px solid rgba(91,243,160,0.12)", borderRadius: 14 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(91,243,160,0.5)", letterSpacing: 2, marginBottom: 16 }}>{p.label}</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: "#fff", marginBottom: 16, letterSpacing: "-0.5px" }}>{p.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.7, marginBottom: 24 }}>{p.body}</div>
              <div style={{ display: "flex", gap: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                {p.meta.map(m => (
                  <div key={m.k}>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 4 }}>{m.k}</div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", color: "#5BF3A0" }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
          Builders never choose the mechanism. A single call to{" "}
          <code style={{ background: "rgba(91,243,160,0.1)", color: "#5BF3A0", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>/swap/approval</code>
          {" "}returns the optimal path, executable calldata, and a quote. The Swap API decides intents vs CCTP V2 vs OFT internally based on token, amount, and route.
        </div>
      </section>

      {/* ── 03 REVENUE ── */}
      <section id="revenue" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 24 }}>04 / REVENUE & COST & COST</div>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 200, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 8px 0" }}>
          Free to integrate.
        </h2>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 700, fontStyle: "italic", letterSpacing: "-1.5px", lineHeight: 1.1, color: "#5BF3A0", margin: "0 0 40px 0" }}>
          Built to monetize.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 680, lineHeight: 1.75, marginBottom: 64 }}>
          Across charges zero protocol fee. The integration is permissionless: no contract, no approval, no commercial negotiation required to go live. And once live, Barter keeps 100% of any app fee set via the <code style={{ background: "rgba(91,243,160,0.1)", color: "#5BF3A0", padding: "1px 6px", borderRadius: 4, fontSize: 13 }}>appFee</code> parameter. Every cross-chain swap Barter enables is a new revenue stream Barter currently has no access to.
        </p>

        <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", marginBottom: 48 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 240px", padding: "12px 24px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>ITEM</div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>AMOUNT</div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}>NOTE</div>
          </div>
          {FEE_ROWS.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 160px 240px", padding: "18px 24px", borderBottom: i < FEE_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: row.green ? "rgba(91,243,160,0.03)" : "transparent" }}>
              <div style={{ fontSize: 14, color: row.green ? "#fff" : "rgba(255,255,255,0.6)", fontWeight: row.green ? 600 : 400 }}>{row.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: row.green ? "#5BF3A0" : "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px" }}>{row.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: row.green ? "monospace" : "inherit" }}>{row.note}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "28px 32px", background: "rgba(91,243,160,0.05)", border: "1px solid rgba(91,243,160,0.15)", borderRadius: 14 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 2, marginBottom: 10 }}>HOW appFee WORKS</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>
            Pass <code style={{ background: "rgba(91,243,160,0.1)", color: "#5BF3A0", padding: "1px 6px", borderRadius: 4 }}>appFee</code> and <code style={{ background: "rgba(91,243,160,0.1)", color: "#5BF3A0", padding: "1px 6px", borderRadius: 4 }}>appFeeRecipient</code> in the Swap API call. The fee is deducted from the user's input amount and sent to Barter's wallet at settlement. Barter sets the rate. Across takes no cut. No approval or registration required. Live on all routes today.
          </p>
        </div>
      </section>

      {/* ── 04 EXCLUSIVE ROUTES ── */}
      <section id="exclusive-routes" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 24 }}>05 / EXCLUSIVE ROUTES</div>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 200, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 8px 0" }}>
          Routes no other aggregator
        </h2>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 700, fontStyle: "italic", letterSpacing: "-1.5px", lineHeight: 1.1, color: "#5BF3A0", margin: "0 0 40px 0" }}>
          can offer.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 680, lineHeight: 1.75, marginBottom: 64 }}>
          Some routes are only available through Across. Sponsored flows, novel deposit primitives, and atomic destination-side actions that no other bridge exposes as a standard API.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {EXCLUSIVE_ROUTES.map((r, i) => (
            <div key={i} style={{ padding: "28px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 16 }}>{r.tag}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", lineHeight: 1.3, marginBottom: 16 }}>{r.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, flex: 1 }}>{r.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 05 SOCIAL PROOF ── */}
      <section style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 40, textAlign: "center" }}>TRUSTED BY TOP-TIER APPLICATIONS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          {INTEGRATORS.map(name => (
            <div key={name} style={{ padding: "8px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* ── 05 THE INTEGRATION ── */}
      <section style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 24 }}>06 / THE INTEGRATION</div>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 200, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "0 0 8px 0" }}>
          One API call.
        </h2>
        <h2 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 700, fontStyle: "italic", letterSpacing: "-1.5px", lineHeight: 1.1, color: "#5BF3A0", margin: "0 0 40px 0" }}>
          Go live in under an hour.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 680, lineHeight: 1.75, marginBottom: 48 }}>
          The entire cross-chain plus swap flow is a single GET to{" "}
          <code style={{ background: "rgba(91,243,160,0.1)", color: "#5BF3A0", padding: "1px 6px", borderRadius: 4 }}>/swap/approval</code>.
          {" "}It returns a quote, an executable transaction, and a fill-time estimate. Barter's frontend calls it, shows the user the output, and submits. That is the full integration surface. No smart-contract deployment, no SDK install, no approval process. Public API, permissionless, live today.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 40 }}>
          {[
            { label: "Integration surface", value: "1 endpoint", note: "GET /swap/approval handles the full cross-chain + swap flow" },
            { label: "Typical time to production", value: "<1hr", note: "Per docs.across.to: go live in under an hour. Most teams ship same day." },
            { label: "Prerequisites", value: "None", note: "No SDK, no contract deployment, no registration. Public API." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "24px 28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 12 }}>{item.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#5BF3A0", letterSpacing: "-0.5px", marginBottom: 10 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{item.note}</div>
            </div>
          ))}
        </div>

        <a href="https://docs.across.to/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(91,243,160,0.06)", border: "1px solid rgba(91,243,160,0.2)", color: "#5BF3A0", fontWeight: 600, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
          Read the integration docs
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
        </a>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 48px 140px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ padding: "64px 48px", background: "rgba(91,243,160,0.04)", border: "1px solid rgba(91,243,160,0.15)", borderRadius: 24, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#5BF3A0", letterSpacing: 3, marginBottom: 24 }}>READY TO SHIP</div>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 300, letterSpacing: "-1px", lineHeight: 1.15, margin: "0 0 20px 0" }}>
            The demo is live.<br />
            <span style={{ fontWeight: 700, color: "#5BF3A0" }}>The integration is ready.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
            The cross-chain tab in the demo below hits the live Across Swap API. It is a working fork of Barter's own UI. One call to enable it in production.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/swap" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#5BF3A0", color: "#0A0E14", fontWeight: 700, fontSize: 14, padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}>
              Try the live demo
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="https://across.to" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontWeight: 500, fontSize: 14, padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}>
              across.to
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AcrossLogoMark size={16} />
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>Across Protocol BD · victorb@umaproject.org</span>
        </div>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.15)" }}>Proof of concept · Not affiliated with Barter</span>
      </footer>
    </div>
  );
}
