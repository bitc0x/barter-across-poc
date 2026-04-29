"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BarterLogoMark, AcrossLogoMark } from "@/components/Logos";
import {
  CHAINS, TOKENS, toUnits, fromUnits, fmtAmount,
  fetchAcrossSuggestedFees, type TokenInfo, type ChainInfo
} from "@/lib/across";

type SwapTab = "swap" | "crosschain";
type QuoteState = "idle" | "loading" | "success" | "error";
type Theme = "light" | "dark";

interface CCQuote {
  outputAmount: number;
  relayFeePct: string;
  relayFeeTotal: number;
  estimatedFillTimeSec: number;
}

const SAME_CHAIN_TOKENS = TOKENS[1];

// Token background colors matching Barter's UI exactly
const TOKEN_BG_LIGHT: Record<string, string> = {
  USDC: "#BFCFE8", WETH: "#C8D8C8", USDT: "#C8E0C8",
  DAI:  "#E8D8A0", WBTC: "#F0C890", LINK: "#B8C8E8", UNI: "#E8B8D0",
};
const TOKEN_BG_DARK: Record<string, string> = {
  USDC: "#4A6080", WETH: "#4A6050", USDT: "#3A6050",
  DAI:  "#907830", WBTC: "#905030", LINK: "#3A5070", UNI: "#703050",
};
const TOKEN_TEXT_LIGHT: Record<string, string> = {
  USDC: "#1A3A5C", WETH: "#1A3A1A", USDT: "#1A3A1A",
  DAI:  "#5A4000", WBTC: "#5A2800", LINK: "#1A3050", UNI: "#5A1040",
};

export default function SwapPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [tab, setTab] = useState<SwapTab>("swap");
  const [blockNumber] = useState(24988085);

  // Same-chain swap state
  const [sellToken, setSellToken] = useState(SAME_CHAIN_TOKENS[0]);
  const [buyToken, setBuyToken]   = useState(SAME_CHAIN_TOKENS[3]); // DAI
  const [sellAmount, setSellAmount] = useState("");

  // Cross-chain state
  const [originChain, setOriginChain] = useState<ChainInfo>(CHAINS[1]);
  const [destChain, setDestChain]     = useState<ChainInfo>(CHAINS[0]);
  const [ccSellToken, setCcSellToken] = useState<TokenInfo>(TOKENS[42161][0]);
  const [ccBuyToken, setCcBuyToken]   = useState<TokenInfo>(TOKENS[1][0]);
  const [ccAmount, setCcAmount] = useState("");
  const [ccQuote, setCcQuote]   = useState<CCQuote | null>(null);
  const [ccState, setCcState]   = useState<QuoteState>("idle");
  const [ccError, setCcError]   = useState("");

  // Pickers
  const [showSellPicker, setShowSellPicker]               = useState(false);
  const [showBuyPicker, setShowBuyPicker]                 = useState(false);
  const [showCcOriginChainPicker, setShowCcOriginChainPicker] = useState(false);
  const [showCcDestChainPicker, setShowCcDestChainPicker]     = useState(false);
  const [showCcSellTokenPicker, setShowCcSellTokenPicker]     = useState(false);
  const [showCcBuyTokenPicker, setShowCcBuyTokenPicker]       = useState(false);

  const isDark = theme === "dark";

  const getQuote = useCallback(async () => {
    const amount = parseFloat(ccAmount);
    if (!amount || amount <= 0) return;
    setCcState("loading"); setCcError(""); setCcQuote(null);
    try {
      const data = await fetchAcrossSuggestedFees({
        inputToken: ccSellToken.address,
        outputToken: ccBuyToken.address,
        originChainId: originChain.chainId,
        destinationChainId: destChain.chainId,
        amount: toUnits(amount, ccSellToken.decimals),
      });
      const relayFeeTotal = fromUnits(data.totalRelayFee.total, ccSellToken.decimals);
      setCcQuote({
        outputAmount: Math.max(amount - relayFeeTotal, 0),
        relayFeePct: (parseFloat(data.totalRelayFee.pct) / 1e16).toFixed(3),
        relayFeeTotal,
        estimatedFillTimeSec: data.estimatedFillTimeSec,
      });
      setCcState("success");
    } catch (e) {
      setCcError(e instanceof Error ? e.message : "Quote failed");
      setCcState("error");
    }
  }, [ccAmount, ccSellToken, ccBuyToken, originChain, destChain]);

  useEffect(() => {
    if (parseFloat(ccAmount) > 0) {
      const t = setTimeout(getQuote, 600);
      return () => clearTimeout(t);
    }
  }, [ccAmount, ccSellToken, ccBuyToken, originChain, destChain, getQuote]);

  useEffect(() => {
    const tokens = TOKENS[originChain.chainId];
    if (tokens?.length) setCcSellToken(tokens[0]);
  }, [originChain]);

  useEffect(() => {
    const tokens = TOKENS[destChain.chainId];
    if (tokens?.length) setCcBuyToken(tokens[0]);
  }, [destChain]);

  function flipTokens() {
    setSellToken(buyToken); setBuyToken(sellToken); setSellAmount("");
  }
  function flipChains() {
    setOriginChain(destChain); setDestChain(originChain);
    setCcAmount(""); setCcQuote(null); setCcState("idle");
  }

  const sellBg    = isDark ? (TOKEN_BG_DARK[sellToken.symbol] || "#4A5060") : (TOKEN_BG_LIGHT[sellToken.symbol] || "#C8D0D8");
  const buyBg     = isDark ? (TOKEN_BG_DARK[buyToken.symbol]  || "#706040") : (TOKEN_BG_LIGHT[buyToken.symbol]  || "#E8D8A0");
  const sellText  = isDark ? "#ffffff" : (TOKEN_TEXT_LIGHT[sellToken.symbol] || "#1A2A3A");
  const buyText   = isDark ? "#ffffff" : (TOKEN_TEXT_LIGHT[buyToken.symbol]  || "#4A3000");

  const ccSellBg  = isDark ? (TOKEN_BG_DARK[ccSellToken.symbol] || "#4A5060") : (TOKEN_BG_LIGHT[ccSellToken.symbol] || "#C8D0D8");
  const ccBuyBg   = isDark ? (TOKEN_BG_DARK[ccBuyToken.symbol]  || "#706040") : (TOKEN_BG_LIGHT[ccBuyToken.symbol]  || "#E8D8A0");
  const ccSellTxt = isDark ? "#ffffff" : (TOKEN_TEXT_LIGHT[ccSellToken.symbol] || "#1A2A3A");
  const ccBuyTxt  = isDark ? "#ffffff" : (TOKEN_TEXT_LIGHT[ccBuyToken.symbol]  || "#4A3000");

  // Theme tokens
  const bg       = isDark ? "#1a1a1a" : "#F2ECE4";
  const navBg    = isDark ? "#141414" : "#FFFFFF";
  const navBorder= isDark ? "#2a2a2a" : "#E8E0D8";
  const textPri  = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMut  = isDark ? "#888888" : "#888888";
  const ctaBg    = isDark ? "#9CA3AF" : "#FF8C20";
  const ctaText  = isDark ? "#1a1a1a" : "#FFFFFF";
  const tabActive= isDark ? "#2a2a2a" : "#FFFFFF";
  const tabBg    = isDark ? "#1f1f1f" : "#EDE7DF";
  const tabBorder= isDark ? "#333333" : "#D8D0C8";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Inter', system-ui, sans-serif", color: textPri }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 60,
        background: navBg, borderBottom: `1px solid ${navBorder}`,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarterLogoMark size={22} />
          <span style={{ fontWeight: 700, fontSize: 18, color: "#FF8C20" }}>Barter</span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#FF8C20",
            background: isDark ? "#2a1a00" : "#FFF0E0",
            border: "1px solid #FF8C20", borderRadius: 4, padding: "1px 5px",
          }}>Beta</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Theme toggle */}
          <div style={{
            display: "flex", alignItems: "center",
            background: isDark ? "#2a2a2a" : "#EDE7DF",
            borderRadius: 20, padding: 3, gap: 2,
          }}>
            <button
              onClick={() => setTheme("light")}
              style={{
                width: 28, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
                background: !isDark ? "#FFFFFF" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: !isDark ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={!isDark ? "#FF8C20" : textMut} strokeWidth={2.5}>
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
            <button
              onClick={() => setTheme("dark")}
              style={{
                width: 28, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
                background: isDark ? "#3a3a3a" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.4)" : "none",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#FFFFFF" : textMut} strokeWidth={2.5}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
          </div>

          {["Swap", "Create", "Portfolio", "Stats", "Points"].map((item) => (
            <button
              key={item}
              onClick={() => item === "Swap" && setTab("swap")}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontSize: 14, fontWeight: item === "Swap" ? 600 : 400,
                color: item === "Swap" ? "#FF8C20" : textMut,
                textDecoration: item === "Swap" ? "underline" : "none",
                textDecorationColor: "#FF8C20",
              }}
            >
              {item}
            </button>
          ))}

          <button style={{
            background: ctaBg, color: ctaText,
            border: "none", borderRadius: 20, padding: "8px 20px",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>
            Connect wallet
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ paddingTop: 100, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>

        {/* Tab switcher */}
        <div style={{
          display: "flex", justifyContent: "center", marginBottom: 32,
        }}>
          <div style={{
            display: "flex", gap: 4, padding: 4,
            background: tabBg, border: `1px solid ${tabBorder}`,
            borderRadius: 12,
          }}>
            <TabPill label="Swap" active={tab === "swap"} onClick={() => setTab("swap")} isDark={isDark} tabActive={tabActive} textPri={textPri} textMut={textMut} />
            <TabPill
              label="Cross-chain"
              active={tab === "crosschain"}
              onClick={() => setTab("crosschain")}
              isDark={isDark} tabActive={tabActive} textPri={textPri} textMut={textMut}
              badge={<AcrossLogoMark size={14} />}
              badgeLabel="Across"
            />
          </div>
        </div>

        {tab === "swap" ? (
          <SameChainPanel
            sellToken={sellToken} buyToken={buyToken}
            sellAmount={sellAmount} setSellAmount={setSellAmount}
            setSellToken={setSellToken} setBuyToken={setBuyToken}
            showSellPicker={showSellPicker} showBuyPicker={showBuyPicker}
            setShowSellPicker={setShowSellPicker} setShowBuyPicker={setShowBuyPicker}
            tokens={SAME_CHAIN_TOKENS} onSwitchToCC={() => setTab("crosschain")}
            flipTokens={flipTokens}
            sellBg={sellBg} buyBg={buyBg} sellText={sellText} buyText={buyText}
            isDark={isDark} textPri={textPri} textMut={textMut}
            ctaBg={ctaBg} ctaText={ctaText}
          />
        ) : (
          <CrossChainPanel
            originChain={originChain} destChain={destChain}
            ccSellToken={ccSellToken} ccBuyToken={ccBuyToken}
            ccAmount={ccAmount} setCcAmount={setCcAmount}
            setCcSellToken={setCcSellToken} setCcBuyToken={setCcBuyToken}
            setOriginChain={setOriginChain} setDestChain={setDestChain}
            flipChains={flipChains}
            ccQuote={ccQuote} ccState={ccState} ccError={ccError}
            showCcOriginChainPicker={showCcOriginChainPicker}
            showCcDestChainPicker={showCcDestChainPicker}
            showCcSellTokenPicker={showCcSellTokenPicker}
            showCcBuyTokenPicker={showCcBuyTokenPicker}
            setShowCcOriginChainPicker={setShowCcOriginChainPicker}
            setShowCcDestChainPicker={setShowCcDestChainPicker}
            setShowCcSellTokenPicker={setShowCcSellTokenPicker}
            setShowCcBuyTokenPicker={setShowCcBuyTokenPicker}
            ccSellBg={ccSellBg} ccBuyBg={ccBuyBg}
            ccSellTxt={ccSellTxt} ccBuyTxt={ccBuyTxt}
            isDark={isDark} textPri={textPri} textMut={textMut}
          />
        )}
      </main>

      {/* Footer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "10px 24px",
        borderTop: `1px solid ${navBorder}`,
        background: navBg,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textMut} strokeWidth={2}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <span style={{ fontSize: 12, color: textMut }}>Block: {blockNumber.toLocaleString()}</span>
        <span style={{ fontSize: 12, color: textMut, marginLeft: "auto" }}>
          Cross-chain powered by{" "}
          <a href="https://across.to" target="_blank" rel="noopener noreferrer"
            style={{ color: "#5BF3A0", textDecoration: "none", fontWeight: 500 }}>
            Across Protocol
          </a>
        </span>
      </div>
    </div>
  );
}

// ── Tab pill ────────────────────────────────────────────────────────
function TabPill({ label, active, onClick, isDark, tabActive, textPri, textMut, badge, badgeLabel }: {
  label: string; active: boolean; onClick: () => void;
  isDark: boolean; tabActive: string; textPri: string; textMut: string;
  badge?: React.ReactNode; badgeLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
        background: active ? tabActive : "transparent",
        color: active ? textPri : textMut,
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        boxShadow: active ? (isDark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.1)") : "none",
        transition: "all 0.15s ease",
      }}
    >
      {label}
      {badge && (
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {badge}
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: "#5BF3A0",
            background: isDark ? "rgba(91,243,160,0.12)" : "rgba(91,243,160,0.2)",
            padding: "1px 6px", borderRadius: 4,
          }}>{badgeLabel}</span>
        </span>
      )}
    </button>
  );
}

// ── Token selector button ───────────────────────────────────────────
function TokenSelector({ token, onClick, textColor }: { token: TokenInfo; onClick: () => void; textColor: string }) {
  const ICON_COLORS: Record<string, string> = {
    USDC: "#2775CA", WETH: "#627EEA", USDT: "#26A17B",
    DAI: "#F5AC37", WBTC: "#F7931A", LINK: "#2A5ADA", UNI: "#FF007A",
  };
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 20, padding: "5px 10px 5px 6px",
        cursor: "pointer", color: textColor,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 11,
        background: ICON_COLORS[token.symbol] || "#888",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 700, color: "#fff",
      }}>
        {token.symbol[0]}
      </div>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{token.symbol}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth={2.5} style={{ opacity: 0.7 }}>
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>
  );
}

// ── Chain selector button ───────────────────────────────────────────
function ChainSelector({ chain, onClick, isDark }: { chain: ChainInfo; onClick: () => void; isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        background: isDark ? "rgba(91,243,160,0.1)" : "rgba(0,100,60,0.08)",
        border: "1px solid rgba(91,243,160,0.3)",
        borderRadius: 16, padding: "4px 10px",
        cursor: "pointer", color: "#5BF3A0",
        fontWeight: 600, fontSize: 12,
      }}
    >
      {chain.shortName}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5BF3A0" strokeWidth={2.5}>
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>
  );
}

// ── Picker overlay ──────────────────────────────────────────────────
function Picker({ title, onClose, isDark, children }: {
  title: string; onClose: () => void; isDark: boolean; children: React.ReactNode;
}) {
  const bg = isDark ? "#1f1f1f" : "#FFFFFF";
  const border = isDark ? "#333" : "#E0D8D0";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: bg, border: `1px solid ${border}`,
        borderRadius: 16, padding: 20, width: 320, maxHeight: 400,
        overflow: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: isDark ? "#fff" : "#1a1a1a" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "#888" : "#888", fontSize: 18 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TokenPickerItem({ token, onSelect, isDark }: { token: TokenInfo; onSelect: () => void; isDark: boolean }) {
  const ICON_COLORS: Record<string, string> = {
    USDC: "#2775CA", WETH: "#627EEA", USDT: "#26A17B",
    DAI: "#F5AC37", WBTC: "#F7931A", LINK: "#2A5ADA", UNI: "#FF007A",
  };
  return (
    <button onClick={onSelect} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
      background: "transparent", color: isDark ? "#fff" : "#1a1a1a",
      textAlign: "left",
    }}
    onMouseEnter={e => (e.currentTarget.style.background = isDark ? "#2a2a2a" : "#F5F0EC")}
    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 16,
        background: ICON_COLORS[token.symbol] || "#888",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
      }}>{token.symbol[0]}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{token.symbol}</div>
        <div style={{ fontSize: 11, color: isDark ? "#888" : "#888" }}>{token.name}</div>
      </div>
    </button>
  );
}

// ── Same-chain swap panel ───────────────────────────────────────────
function SameChainPanel({
  sellToken, buyToken, sellAmount, setSellAmount,
  setSellToken, setBuyToken,
  showSellPicker, showBuyPicker, setShowSellPicker, setShowBuyPicker,
  tokens, onSwitchToCC, flipTokens,
  sellBg, buyBg, sellText, buyText,
  isDark, textPri, textMut, ctaBg, ctaText,
}: {
  sellToken: TokenInfo; buyToken: TokenInfo;
  sellAmount: string; setSellAmount: (v: string) => void;
  setSellToken: (t: TokenInfo) => void; setBuyToken: (t: TokenInfo) => void;
  showSellPicker: boolean; showBuyPicker: boolean;
  setShowSellPicker: (v: boolean) => void; setShowBuyPicker: (v: boolean) => void;
  tokens: TokenInfo[]; onSwitchToCC: () => void; flipTokens: () => void;
  sellBg: string; buyBg: string; sellText: string; buyText: string;
  isDark: boolean; textPri: string; textMut: string; ctaBg: string; ctaText: string;
}) {
  const hasAmount = sellAmount && parseFloat(sellAmount) > 0;
  const cardRadius = 20;
  const cardH = 220;

  return (
    <>
      {showSellPicker && (
        <Picker title="Select token" onClose={() => setShowSellPicker(false)} isDark={isDark}>
          {tokens.filter(t => t.symbol !== buyToken.symbol).map(t => (
            <TokenPickerItem key={t.address} token={t} isDark={isDark} onSelect={() => { setSellToken(t); setShowSellPicker(false); }} />
          ))}
        </Picker>
      )}
      {showBuyPicker && (
        <Picker title="Select token" onClose={() => setShowBuyPicker(false)} isDark={isDark}>
          {tokens.filter(t => t.symbol !== sellToken.symbol).map(t => (
            <TokenPickerItem key={t.address} token={t} isDark={isDark} onSelect={() => { setBuyToken(t); setShowBuyPicker(false); }} />
          ))}
        </Picker>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Three-panel horizontal layout */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, position: "relative" }}>

          {/* Sell card */}
          <div style={{
            flex: "1 1 0", background: sellBg, borderRadius: cardRadius,
            padding: 24, minHeight: cardH,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative",
          }}>
            <TokenSelector token={sellToken} onClick={() => setShowSellPicker(true)} textColor={sellText} />
            <div>
              <input
                type="number"
                value={sellAmount}
                onChange={e => setSellAmount(e.target.value)}
                placeholder="0.0"
                style={{
                  background: "none", border: "none", outline: "none",
                  fontSize: 64, fontWeight: 700, color: sellText,
                  width: "100%", padding: 0, lineHeight: 1.1,
                  fontFamily: "inherit",
                }}
              />
              <div style={{ fontSize: 13, color: sellText, opacity: 0.6, marginTop: 4 }}>
                Balance: 0.00
              </div>
            </div>
          </div>

          {/* Swap button between cards */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 56, flexShrink: 0, position: "relative", zIndex: 2,
          }}>
            <button
              onClick={flipTokens}
              style={{
                width: 40, height: 40, borderRadius: 20,
                background: isDark ? "#2a2a2a" : "#FFFFFF",
                border: `2px solid ${isDark ? "#3a3a3a" : "#E0D8D0"}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#888" : "#666"} strokeWidth={2.5}>
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
          </div>

          {/* Buy card */}
          <div style={{
            flex: "1 1 0", background: buyBg, borderRadius: cardRadius,
            padding: 24, minHeight: cardH,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <TokenSelector token={buyToken} onClick={() => setShowBuyPicker(true)} textColor={buyText} />
              {!hasAmount && (
                <span style={{
                  fontSize: 11, color: buyText, opacity: 0.6,
                  background: "rgba(255,255,255,0.15)", borderRadius: 6,
                  padding: "2px 8px",
                }}>
                  No route
                </span>
              )}
            </div>
            <div>
              <div style={{
                fontSize: 64, fontWeight: 700, color: buyText,
                lineHeight: 1.1, minHeight: 70,
                display: "flex", alignItems: "flex-end",
              }}>
                {hasAmount ? (
                  <span style={{ opacity: 0.5 }}>...</span>
                ) : "0.0"}
              </div>
              <div style={{ fontSize: 13, color: buyText, opacity: 0.6, marginTop: 4 }}>
                Balance: 0.00
              </div>
              {hasAmount && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#5BF3A0", fontWeight: 500 }}>
                  Best price via Barter
                </div>
              )}
            </div>
          </div>

          {/* Action card */}
          <div style={{ width: 56, flexShrink: 0 }} />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: 130, background: ctaBg, borderRadius: cardRadius,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: "pointer", gap: 8,
          }} onClick={hasAmount ? undefined : undefined}>
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              border: `2px solid ${ctaText}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0.7,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ctaText} strokeWidth={2}>
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: ctaText, textAlign: "center", lineHeight: 1.2 }}>
              {hasAmount ? "Swap" : "Connect\nwallet"}
            </span>
          </div>
        </div>

        {/* Cross-chain nudge */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={onSwitchToCC}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "#5BF3A0",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <AcrossLogoMark size={14} />
            Token on a different chain? Try Cross-chain
          </button>
        </div>
      </div>
    </>
  );
}

// ── Cross-chain panel ───────────────────────────────────────────────
function CrossChainPanel({
  originChain, destChain, ccSellToken, ccBuyToken,
  ccAmount, setCcAmount, setCcSellToken, setCcBuyToken,
  setOriginChain, setDestChain, flipChains,
  ccQuote, ccState, ccError,
  showCcOriginChainPicker, showCcDestChainPicker,
  showCcSellTokenPicker, showCcBuyTokenPicker,
  setShowCcOriginChainPicker, setShowCcDestChainPicker,
  setShowCcSellTokenPicker, setShowCcBuyTokenPicker,
  ccSellBg, ccBuyBg, ccSellTxt, ccBuyTxt,
  isDark, textPri, textMut,
}: {
  originChain: ChainInfo; destChain: ChainInfo;
  ccSellToken: TokenInfo; ccBuyToken: TokenInfo;
  ccAmount: string; setCcAmount: (v: string) => void;
  setCcSellToken: (t: TokenInfo) => void; setCcBuyToken: (t: TokenInfo) => void;
  setOriginChain: (c: ChainInfo) => void; setDestChain: (c: ChainInfo) => void;
  flipChains: () => void;
  ccQuote: CCQuote | null; ccState: QuoteState; ccError: string;
  showCcOriginChainPicker: boolean; showCcDestChainPicker: boolean;
  showCcSellTokenPicker: boolean; showCcBuyTokenPicker: boolean;
  setShowCcOriginChainPicker: (v: boolean) => void;
  setShowCcDestChainPicker: (v: boolean) => void;
  setShowCcSellTokenPicker: (v: boolean) => void;
  setShowCcBuyTokenPicker: (v: boolean) => void;
  ccSellBg: string; ccBuyBg: string; ccSellTxt: string; ccBuyTxt: string;
  isDark: boolean; textPri: string; textMut: string;
}) {
  const cardRadius = 20;
  const cardH = 240;
  const originTokens = TOKENS[originChain.chainId] || [];
  const destTokens = TOKENS[destChain.chainId] || [];

  const ctaBg    = ccState === "success" ? "#5BF3A0" : (isDark ? "#9CA3AF" : "#FF8C20");
  const ctaText  = ccState === "success" ? "#0a1a0a" : (isDark ? "#1a1a1a" : "#FFFFFF");

  return (
    <>
      {showCcOriginChainPicker && (
        <Picker title="Origin chain" onClose={() => setShowCcOriginChainPicker(false)} isDark={isDark}>
          {CHAINS.filter(c => c.chainId !== destChain.chainId).map(c => (
            <button key={c.chainId} onClick={() => { setOriginChain(c); setShowCcOriginChainPicker(false); }}
              style={{ width: "100%", padding: "10px 12px", background: "none", border: "none", cursor: "pointer",
                color: isDark ? "#fff" : "#1a1a1a", fontSize: 14, fontWeight: 500, textAlign: "left", borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "#2a2a2a" : "#F5F0EC")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >{c.name}</button>
          ))}
        </Picker>
      )}
      {showCcDestChainPicker && (
        <Picker title="Destination chain" onClose={() => setShowCcDestChainPicker(false)} isDark={isDark}>
          {CHAINS.filter(c => c.chainId !== originChain.chainId).map(c => (
            <button key={c.chainId} onClick={() => { setDestChain(c); setShowCcDestChainPicker(false); }}
              style={{ width: "100%", padding: "10px 12px", background: "none", border: "none", cursor: "pointer",
                color: isDark ? "#fff" : "#1a1a1a", fontSize: 14, fontWeight: 500, textAlign: "left", borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "#2a2a2a" : "#F5F0EC")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >{c.name}</button>
          ))}
        </Picker>
      )}
      {showCcSellTokenPicker && (
        <Picker title="Select token" onClose={() => setShowCcSellTokenPicker(false)} isDark={isDark}>
          {originTokens.filter(t => t.symbol !== ccBuyToken.symbol).map(t => (
            <TokenPickerItem key={t.address} token={t} isDark={isDark} onSelect={() => { setCcSellToken(t); setShowCcSellTokenPicker(false); }} />
          ))}
        </Picker>
      )}
      {showCcBuyTokenPicker && (
        <Picker title="Select token" onClose={() => setShowCcBuyTokenPicker(false)} isDark={isDark}>
          {destTokens.filter(t => t.symbol !== ccSellToken.symbol).map(t => (
            <TokenPickerItem key={t.address} token={t} isDark={isDark} onSelect={() => { setCcBuyToken(t); setShowCcBuyTokenPicker(false); }} />
          ))}
        </Picker>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, position: "relative" }}>

          {/* Origin card */}
          <div style={{
            flex: "1 1 0", background: ccSellBg, borderRadius: cardRadius,
            padding: 24, minHeight: cardH,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <TokenSelector token={ccSellToken} onClick={() => setShowCcSellTokenPicker(true)} textColor={ccSellTxt} />
              <ChainSelector chain={originChain} onClick={() => setShowCcOriginChainPicker(true)} isDark={isDark} />
            </div>
            <div>
              <input
                type="number"
                value={ccAmount}
                onChange={e => setCcAmount(e.target.value)}
                placeholder="0.0"
                style={{
                  background: "none", border: "none", outline: "none",
                  fontSize: 56, fontWeight: 700, color: ccSellTxt,
                  width: "100%", padding: 0, lineHeight: 1.15,
                  fontFamily: "inherit",
                }}
              />
              <div style={{ fontSize: 13, color: ccSellTxt, opacity: 0.6, marginTop: 4 }}>Balance: 0.00</div>
            </div>
          </div>

          {/* Flip button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, flexShrink: 0, zIndex: 2 }}>
            <button
              onClick={flipChains}
              style={{
                width: 40, height: 40, borderRadius: 20,
                background: isDark ? "#2a2a2a" : "#FFFFFF",
                border: `2px solid ${isDark ? "#3a3a3a" : "#E0D8D0"}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#888" : "#666"} strokeWidth={2.5}>
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </button>
          </div>

          {/* Destination card */}
          <div style={{
            flex: "1 1 0", background: ccBuyBg, borderRadius: cardRadius,
            padding: 24, minHeight: cardH,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <TokenSelector token={ccBuyToken} onClick={() => setShowCcBuyTokenPicker(true)} textColor={ccBuyTxt} />
              <ChainSelector chain={destChain} onClick={() => setShowCcDestChainPicker(true)} isDark={isDark} />
            </div>
            <div>
              <div style={{
                fontSize: 56, fontWeight: 700, color: ccBuyTxt,
                lineHeight: 1.15, minHeight: 66,
              }}>
                {ccState === "loading" ? (
                  <span style={{ opacity: 0.4, fontSize: 40 }}>...</span>
                ) : ccState === "success" && ccQuote ? (
                  fmtAmount(ccQuote.outputAmount, ccBuyToken.decimals)
                ) : "0.0"}
              </div>
              <div style={{ fontSize: 13, color: ccBuyTxt, opacity: 0.6, marginTop: 4 }}>Balance: 0.00</div>
              {ccState === "success" && ccQuote && (
                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#5BF3A0", fontWeight: 600 }}>
                    Filled via Across · ~{ccQuote.estimatedFillTimeSec}s
                  </span>
                  <span style={{ fontSize: 11, color: ccBuyTxt, opacity: 0.6 }}>
                    Fee: {ccQuote.relayFeePct}%
                  </span>
                </div>
              )}
              {ccState === "error" && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#FF6060" }}>
                  {ccError || "Route unavailable"}
                </div>
              )}
            </div>
          </div>

          {/* Action card */}
          <div style={{ width: 56, flexShrink: 0 }} />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: 130, background: ctaBg, borderRadius: cardRadius,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            cursor: !ccAmount ? "default" : "pointer", gap: 8,
            opacity: !ccAmount ? 0.5 : 1,
            transition: "all 0.2s ease",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              border: `2px solid ${ctaText}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0.7,
            }}>
              {ccState === "success" ? (
                <AcrossLogoMark size={18} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ctaText} strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: ctaText, textAlign: "center", lineHeight: 1.3, padding: "0 8px" }}>
              {!ccAmount ? "Enter\namount"
                : ccState === "loading" ? "Routing..."
                : ccState === "success" ? `Bridge\n${originChain.shortName} to ${destChain.shortName}`
                : "Connect\nwallet"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
