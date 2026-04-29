"use client";
import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BarterLogoMark, AcrossLogoMark } from "@/components/Logos";
import {
  fetchChains, fetchTokensForChain, fetchSwapQuote,
  fromUnits, toUnits, fmtAmount, INTEGRATOR_ID,
  type ChainInfo, type TokenInfo, type SwapQuote,
} from "@/lib/across";

// ── Types ─────────────────────────────────────────────────────────────
type SwapTab = "swap" | "crosschain";
type QuoteState = "idle" | "loading" | "success" | "error";
type Theme = "light" | "dark";

interface CCQuote {
  outputAmount: number;
  minOutputAmount: number;
  feeTotalUsd: string;
  feePct: number;
  fillTimeSec: number;
  swapTx: SwapQuote["swapTx"];
}

// ── Token colors for Barter-style cards ──────────────────────────────
const TOKEN_BG_LIGHT: Record<string, string> = {
  USDC: "#BFCFE8", WETH: "#C8D8C8", ETH: "#C8D8C8", USDT: "#C8E0C8",
  DAI: "#E8D8A0", WBTC: "#F0C890", LINK: "#B8C8E8", UNI: "#E8B8D0",
  ACX: "#C8D8F0", ARB: "#BDD0E8",
};
const TOKEN_BG_DARK: Record<string, string> = {
  USDC: "#4A6080", WETH: "#4A6050", ETH: "#4A6050", USDT: "#3A6050",
  DAI: "#907830", WBTC: "#905030", LINK: "#3A5070", UNI: "#703050",
  ACX: "#3A5080", ARB: "#3A5070",
};
const TOKEN_TEXT_LIGHT: Record<string, string> = {
  USDC: "#1A3A5C", WETH: "#1A3A1A", ETH: "#1A3A1A", USDT: "#1A3A1A",
  DAI: "#5A4000", WBTC: "#5A2800", LINK: "#1A3050", UNI: "#5A1040",
  ACX: "#1A3060", ARB: "#1A3050",
};

function tokenBg(symbol: string, isDark: boolean) {
  return isDark ? (TOKEN_BG_DARK[symbol] || "#4A5060") : (TOKEN_BG_LIGHT[symbol] || "#C8D0D8");
}
function tokenText(symbol: string, isDark: boolean) {
  return isDark ? "#ffffff" : (TOKEN_TEXT_LIGHT[symbol] || "#1A2A3A");
}

// ── Main component ────────────────────────────────────────────────────
export default function SwapPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [tab, setTab] = useState<SwapTab>("swap");
  const { address, isConnected } = useAccount();

  // Live chain/token data
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [originChain, setOriginChain] = useState<ChainInfo | null>(null);
  const [destChain, setDestChain] = useState<ChainInfo | null>(null);
  const [originTokens, setOriginTokens] = useState<TokenInfo[]>([]);
  const [destTokens, setDestTokens] = useState<TokenInfo[]>([]);
  const [sellToken, setSellToken] = useState<TokenInfo | null>(null);
  const [buyToken, setBuyToken] = useState<TokenInfo | null>(null);

  // Same-chain swap
  const [sameChainTokens, setSameChainTokens] = useState<TokenInfo[]>([]);
  const [scSell, setScSell] = useState<TokenInfo | null>(null);
  const [scBuy, setScBuy] = useState<TokenInfo | null>(null);
  const [scAmount, setScAmount] = useState("");

  // CC quote
  const [ccAmount, setCcAmount] = useState("");
  const [ccQuote, setCcQuote] = useState<CCQuote | null>(null);
  const [ccState, setCcState] = useState<QuoteState>("idle");
  const [ccError, setCcError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pickers
  const [showPicker, setShowPicker] = useState<
    null | "scSell" | "scBuy" | "ccOriginChain" | "ccDestChain" | "ccSell" | "ccBuy"
  >(null);

  // Load chains on mount
  useEffect(() => {
    fetchChains().then(cs => {
      setChains(cs);
      const arb = cs.find(c => c.chainId === 42161) || cs[0];
      const eth = cs.find(c => c.chainId === 1) || cs[1];
      setOriginChain(arb);
      setDestChain(eth);
    });
    // Load Ethereum tokens for same-chain swap
    fetchTokensForChain(1).then(ts => {
      setSameChainTokens(ts);
      const usdc = ts.find(t => t.symbol === "USDC") || ts[0];
      const dai = ts.find(t => t.symbol === "DAI") || ts[1];
      setScSell(usdc);
      setScBuy(dai);
    });
  }, []);

  // Load tokens when chains change
  useEffect(() => {
    if (!originChain) return;
    fetchTokensForChain(originChain.chainId).then(ts => {
      setOriginTokens(ts);
      setSellToken(prev => ts.find(t => t.symbol === prev?.symbol) || ts.find(t => t.symbol === "USDC") || ts[0]);
    });
  }, [originChain]);

  useEffect(() => {
    if (!destChain) return;
    fetchTokensForChain(destChain.chainId).then(ts => {
      setDestTokens(ts);
      setBuyToken(prev => ts.find(t => t.symbol === prev?.symbol) || ts.find(t => t.symbol === "WETH") || ts[0]);
    });
  }, [destChain]);

  // Debounced quote fetch using Swap API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const amount = parseFloat(ccAmount);
    if (!amount || amount <= 0 || !sellToken || !buyToken || !originChain || !destChain) return;

    debounceRef.current = setTimeout(async () => {
      setCcState("loading");
      setCcError("");
      setCcQuote(null);
      try {
        const rawAmount = toUnits(amount, sellToken.decimals);
        // Use depositor = user address if connected, otherwise zero address for quote-only
        const depositor = address || "0x0000000000000000000000000000000000000001";
        const data = await fetchSwapQuote({
          originChainId: originChain.chainId,
          destinationChainId: destChain.chainId,
          inputToken: sellToken.address,
          outputToken: buyToken.address,
          amount: rawAmount,
          depositor,
          integratorId: INTEGRATOR_ID,
        });

        const outputAmount = fromUnits(data.expectedOutputAmount, buyToken.decimals);
        const minOutputAmount = fromUnits(data.minOutputAmount, buyToken.decimals);
        const feePct = parseFloat(data.fees.total.pct) / 1e16;

        setCcQuote({
          outputAmount,
          minOutputAmount,
          feeTotalUsd: parseFloat(data.fees.total.amountUsd).toFixed(4),
          feePct,
          fillTimeSec: data.expectedFillTime,
          swapTx: data.swapTx,
        });
        setCcState("success");
      } catch (e) {
        setCcError(e instanceof Error ? e.message : "Quote failed");
        setCcState("error");
      }
    }, 600);
  }, [ccAmount, sellToken, buyToken, originChain, destChain, address]);

  function flipChains() {
    const prev = originChain;
    setOriginChain(destChain);
    setDestChain(prev);
    setCcAmount("");
    setCcQuote(null);
    setCcState("idle");
  }

  function flipSameChain() {
    const prev = scSell;
    setScSell(scBuy);
    setScBuy(prev);
    setScAmount("");
  }

  const isDark = theme === "dark";

  // Theme tokens
  const bg        = isDark ? "#1a1a1a" : "#F2ECE4";
  const navBg     = isDark ? "#141414" : "#FFFFFF";
  const navBorder = isDark ? "#2a2a2a" : "#E8E0D8";
  const textPri   = isDark ? "#FFFFFF" : "#1A1A1A";
  const textMut   = isDark ? "#888888" : "#888888";
  const ctaBg     = isDark ? "#9CA3AF" : "#FF8C20";
  const ctaText   = isDark ? "#1a1a1a" : "#FFFFFF";
  const tabBg     = isDark ? "#1f1f1f" : "#EDE7DF";
  const tabBorder = isDark ? "#333333" : "#D8D0C8";
  const tabActive = isDark ? "#2a2a2a" : "#FFFFFF";
  const cardR     = 20;
  const cardH     = 220;

  const scSellBg   = scSell ? tokenBg(scSell.symbol, isDark) : (isDark ? "#4A6080" : "#BFCFE8");
  const scBuyBg    = scBuy  ? tokenBg(scBuy.symbol,  isDark) : (isDark ? "#907830" : "#E8D8A0");
  const scSellText = scSell ? tokenText(scSell.symbol, isDark) : (isDark ? "#fff" : "#1A3A5C");
  const scBuyText  = scBuy  ? tokenText(scBuy.symbol,  isDark) : (isDark ? "#fff" : "#5A4000");
  const ccSellBg   = sellToken ? tokenBg(sellToken.symbol, isDark) : (isDark ? "#4A6080" : "#BFCFE8");
  const ccBuyBg    = buyToken  ? tokenBg(buyToken.symbol,  isDark) : (isDark ? "#4A6050" : "#C8D8C8");
  const ccSellText = sellToken ? tokenText(sellToken.symbol, isDark) : (isDark ? "#fff" : "#1A3A5C");
  const ccBuyText  = buyToken  ? tokenText(buyToken.symbol,  isDark) : (isDark ? "#fff" : "#1A3A1A");

  const ccCtaBg   = ccState === "success" ? "#5BF3A0" : ctaBg;
  const ccCtaText = ccState === "success" ? "#0a1a0a" : ctaText;

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Inter', system-ui, sans-serif", color: textPri }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 60,
        background: navBg, borderBottom: `1px solid ${navBorder}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarterLogoMark size={22} />
          <span style={{ fontWeight: 700, fontSize: 18, color: "#FF8C20" }}>Barter</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#FF8C20", background: isDark ? "#2a1a00" : "#FFF0E0", border: "1px solid #FF8C20", borderRadius: 4, padding: "1px 5px" }}>Beta</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Theme toggle */}
          <div style={{ display: "flex", alignItems: "center", background: isDark ? "#2a2a2a" : "#EDE7DF", borderRadius: 20, padding: 3, gap: 2 }}>
            <ThemeBtn active={!isDark} onClick={() => setTheme("light")} isDark={isDark} icon="sun" />
            <ThemeBtn active={isDark} onClick={() => setTheme("dark")} isDark={isDark} icon="moon" />
          </div>
          {["Swap", "Create", "Portfolio", "Stats", "Points"].map(item => (
            <button key={item} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 14, fontWeight: item === "Swap" ? 600 : 400, color: item === "Swap" ? "#FF8C20" : textMut, textDecoration: item === "Swap" ? "underline" : "none", textDecorationColor: "#FF8C20" }}>
              {item}
            </button>
          ))}
          <ConnectButton
            accountStatus="address"
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </nav>

      <main style={{ paddingTop: 100, paddingBottom: 100, paddingLeft: 24, paddingRight: 24 }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 4, padding: 4, background: tabBg, border: `1px solid ${tabBorder}`, borderRadius: 12 }}>
            <TabPill label="Swap" active={tab === "swap"} onClick={() => setTab("swap")} isDark={isDark} tabActive={tabActive} textPri={textPri} textMut={textMut} />
            <TabPill
              label="Cross-chain"
              active={tab === "crosschain"}
              onClick={() => setTab("crosschain")}
              isDark={isDark} tabActive={tabActive} textPri={textPri} textMut={textMut}
              badge={<AcrossLogoMark size={14} />}
              badgeLabel="Across"
              badgeLabelColor={isDark ? "#5BF3A0" : "#0a5c35"}
              badgeLabelBg={isDark ? "rgba(91,243,160,0.12)" : "rgba(0,100,60,0.1)"}
            />
          </div>
        </div>

        {/* Three-panel layout */}
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {tab === "swap" ? (
            /* ── Same-chain ─────────────────────────────── */
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {/* Sell */}
              <div style={{ flex: "1 1 0", background: scSellBg, borderRadius: cardR, padding: 24, minHeight: cardH, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <TokenSelector token={scSell} onClick={() => setShowPicker("scSell")} textColor={scSellText} />
                <div>
                  <input
                    type="number" value={scAmount} onChange={e => setScAmount(e.target.value)}
                    placeholder="0.0"
                    style={{ background: "none", border: "none", outline: "none", fontSize: 64, fontWeight: 700, color: scSellText, width: "100%", padding: 0, lineHeight: 1.1, fontFamily: "inherit" }}
                  />
                  <div style={{ fontSize: 12, color: scSellText, opacity: 0.6, marginTop: 4 }}>Balance: 0.00</div>
                </div>
              </div>
              {/* Flip */}
              <FlipBtn onClick={flipSameChain} isDark={isDark} />
              {/* Buy */}
              <div style={{ flex: "1 1 0", background: scBuyBg, borderRadius: cardR, padding: 24, minHeight: cardH, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <TokenSelector token={scBuy} onClick={() => setShowPicker("scBuy")} textColor={scBuyText} />
                <div>
                  <div style={{ fontSize: 64, fontWeight: 700, color: scBuyText, lineHeight: 1.1, minHeight: 70 }}>
                    {scAmount && parseFloat(scAmount) > 0 ? <span style={{ opacity: 0.5 }}>...</span> : "0.0"}
                  </div>
                  <div style={{ fontSize: 12, color: scBuyText, opacity: 0.6, marginTop: 4 }}>Balance: 0.00</div>
                  {scAmount && parseFloat(scAmount) > 0 && (
                    <div style={{ fontSize: 11, color: "#5BF3A0", fontWeight: 500, marginTop: 6 }}>Best price via Barter</div>
                  )}
                </div>
              </div>
              {/* Gap */}
              <div style={{ width: 12, flexShrink: 0 }} />
              {/* Action card */}
              <ActionCard
                isDark={isDark} ctaBg={ctaBg} ctaText={ctaText} cardR={cardR} cardH={cardH}
                isConnected={isConnected} onConnect={() => {}}
                label={!isConnected ? "Connect wallet" : scAmount && parseFloat(scAmount) > 0 ? "Swap" : "Enter amount"}
              />
            </div>
          ) : (
            /* ── Cross-chain ────────────────────────────── */
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {/* Origin */}
              <div style={{ flex: "1 1 0", background: ccSellBg, borderRadius: cardR, padding: 24, minHeight: cardH + 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <TokenSelector token={sellToken} onClick={() => setShowPicker("ccSell")} textColor={ccSellText} />
                  <ChainSelector chain={originChain} onClick={() => setShowPicker("ccOriginChain")} isDark={isDark} />
                </div>
                <div>
                  <input
                    type="number" value={ccAmount} onChange={e => setCcAmount(e.target.value)}
                    placeholder="0.0"
                    style={{ background: "none", border: "none", outline: "none", fontSize: 56, fontWeight: 700, color: ccSellText, width: "100%", padding: 0, lineHeight: 1.15, fontFamily: "inherit" }}
                  />
                  <div style={{ fontSize: 12, color: ccSellText, opacity: 0.6, marginTop: 4 }}>Balance: 0.00</div>
                </div>
              </div>
              {/* Flip */}
              <FlipBtn onClick={flipChains} isDark={isDark} />
              {/* Destination */}
              <div style={{ flex: "1 1 0", background: ccBuyBg, borderRadius: cardR, padding: 24, minHeight: cardH + 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <TokenSelector token={buyToken} onClick={() => setShowPicker("ccBuy")} textColor={ccBuyText} />
                  <ChainSelector chain={destChain} onClick={() => setShowPicker("ccDestChain")} isDark={isDark} />
                </div>
                <div>
                  <div style={{ fontSize: 56, fontWeight: 700, color: ccBuyText, lineHeight: 1.15, minHeight: 66 }}>
                    {ccState === "loading" ? <span style={{ opacity: 0.4, fontSize: 36 }}>...</span>
                      : ccState === "success" && ccQuote ? fmtAmount(ccQuote.outputAmount, buyToken?.decimals ?? 18)
                      : "0.0"}
                  </div>
                  <div style={{ fontSize: 12, color: ccBuyText, opacity: 0.6, marginTop: 4 }}>Balance: 0.00</div>
                  {ccState === "success" && ccQuote && (
                    <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#5BF3A0", fontWeight: 600 }}>Via Across · ~{ccQuote.fillTimeSec}s</span>
                      <span style={{ fontSize: 11, color: ccBuyText, opacity: 0.7 }}>Fee ${ccQuote.feeTotalUsd}</span>
                      <span style={{ fontSize: 11, color: ccBuyText, opacity: 0.5 }}>Min: {fmtAmount(ccQuote.minOutputAmount, buyToken?.decimals ?? 18)}</span>
                    </div>
                  )}
                  {ccState === "error" && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#FF6060" }}>{ccError}</div>
                  )}
                </div>
              </div>
              {/* Gap */}
              <div style={{ width: 12, flexShrink: 0 }} />
              {/* Action card */}
              <ActionCard
                isDark={isDark} ctaBg={ccCtaBg} ctaText={ccCtaText} cardR={cardR} cardH={cardH + 20}
                isConnected={isConnected} onConnect={() => {}}
                label={!isConnected ? "Connect wallet"
                  : !ccAmount ? "Enter amount"
                  : ccState === "loading" ? "Routing..."
                  : ccState === "success" ? `Bridge\n${originChain?.shortName} to\n${destChain?.shortName}`
                  : ccState === "error" ? "No route"
                  : "Enter amount"}
                showAcrossLogo={ccState === "success" && isConnected}
              />
            </div>
          )}

          {/* CC nudge */}
          {tab === "swap" && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button onClick={() => setTab("crosschain")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#5BF3A0", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <AcrossLogoMark size={14} />
                Token on a different chain? Try Cross-chain
              </button>
            </div>
          )}
          {tab === "crosschain" && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 11, color: textMut }}>Cross-chain powered by{" "}
                <a href="https://across.to" target="_blank" rel="noopener noreferrer" style={{ color: isDark ? "#5BF3A0" : "#0a5c35", textDecoration: "none", fontWeight: 500 }}>Across Protocol</a>
                {" "}· Swap API · Integrator ID: {INTEGRATOR_ID}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 24px", borderTop: `1px solid ${navBorder}`, background: navBg, display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textMut} strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <span style={{ fontSize: 12, color: textMut }}>Block: 24,988,085</span>
      </div>

      {/* Pickers */}
      {showPicker === "scSell" && <TokenPickerModal tokens={sameChainTokens} current={scSell} isDark={isDark} onSelect={t => { setScSell(t); setShowPicker(null); }} onClose={() => setShowPicker(null)} />}
      {showPicker === "scBuy"  && <TokenPickerModal tokens={sameChainTokens} current={scBuy}  isDark={isDark} onSelect={t => { setScBuy(t);  setShowPicker(null); }} onClose={() => setShowPicker(null)} />}
      {showPicker === "ccSell" && <TokenPickerModal tokens={originTokens} current={sellToken} isDark={isDark} onSelect={t => { setSellToken(t); setShowPicker(null); }} onClose={() => setShowPicker(null)} />}
      {showPicker === "ccBuy"  && <TokenPickerModal tokens={destTokens}   current={buyToken}  isDark={isDark} onSelect={t => { setBuyToken(t);  setShowPicker(null); }} onClose={() => setShowPicker(null)} />}
      {showPicker === "ccOriginChain" && <ChainPickerModal chains={chains} current={originChain} isDark={isDark} onSelect={c => { setOriginChain(c); setShowPicker(null); }} onClose={() => setShowPicker(null)} />}
      {showPicker === "ccDestChain"   && <ChainPickerModal chains={chains} current={destChain}   isDark={isDark} onSelect={c => { setDestChain(c);   setShowPicker(null); }} onClose={() => setShowPicker(null)} />}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function ThemeBtn({ active, onClick, isDark, icon }: { active: boolean; onClick: () => void; isDark: boolean; icon: "sun" | "moon" }) {
  return (
    <button onClick={onClick} style={{ width: 28, height: 28, borderRadius: 14, border: "none", cursor: "pointer", background: active ? (isDark ? "#3a3a3a" : "#FFFFFF") : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? `0 1px 3px rgba(0,0,0,${isDark ? 0.4 : 0.15})` : "none" }}>
      {icon === "sun" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#FF8C20" : "#888"} strokeWidth={2.5}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? "#FFFFFF" : "#888"} strokeWidth={2.5}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      )}
    </button>
  );
}

function TabPill({ label, active, onClick, isDark, tabActive, textPri, textMut, badge, badgeLabel, badgeLabelColor, badgeLabelBg }: {
  label: string; active: boolean; onClick: () => void;
  isDark: boolean; tabActive: string; textPri: string; textMut: string;
  badge?: React.ReactNode; badgeLabel?: string; badgeLabelColor?: string; badgeLabelBg?: string;
}) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: active ? tabActive : "transparent", color: active ? textPri : textMut, fontWeight: active ? 600 : 400, fontSize: 14, boxShadow: active ? (isDark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.1)") : "none" }}>
      {label}
      {badge && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{badge}<span style={{ fontSize: 10, fontWeight: 600, color: badgeLabelColor, background: badgeLabelBg, padding: "1px 6px", borderRadius: 4 }}>{badgeLabel}</span></span>}
    </button>
  );
}

function TokenSelector({ token, onClick, textColor }: { token: TokenInfo | null; onClick: () => void; textColor: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "5px 10px 5px 6px", cursor: "pointer", color: textColor }}>
      {token ? (
        <img src={token.logoUrl} alt={token.symbol} width={22} height={22} style={{ borderRadius: 11, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <div style={{ width: 22, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
      )}
      <span style={{ fontWeight: 600, fontSize: 14 }}>{token?.symbol ?? "..."}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth={2.5} style={{ opacity: 0.7 }}><path d="M6 9l6 6 6-6"/></svg>
    </button>
  );
}

function ChainSelector({ chain, onClick, isDark }: { chain: ChainInfo | null; onClick: () => void; isDark: boolean }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, background: isDark ? "rgba(91,243,160,0.1)" : "rgba(0,100,60,0.08)", border: "1px solid rgba(91,243,160,0.3)", borderRadius: 16, padding: "4px 10px", cursor: "pointer", color: isDark ? "#5BF3A0" : "#0a5c35", fontWeight: 600, fontSize: 12 }}>
      {chain?.logoUrl && <img src={chain.logoUrl} alt={chain.shortName} width={16} height={16} style={{ borderRadius: 8 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
      {chain?.shortName ?? "..."}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#5BF3A0" : "#0a5c35"} strokeWidth={2.5}><path d="M6 9l6 6 6-6"/></svg>
    </button>
  );
}

function FlipBtn({ onClick, isDark }: { onClick: () => void; isDark: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, flexShrink: 0 }}>
      <button onClick={onClick} style={{ width: 38, height: 38, borderRadius: 19, background: isDark ? "#2a2a2a" : "#FFFFFF", border: `2px solid ${isDark ? "#3a3a3a" : "#E0D8D0"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#888" : "#666"} strokeWidth={2.5}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
      </button>
    </div>
  );
}

function ActionCard({ isDark: _isDark, ctaBg, ctaText, cardR, cardH, isConnected, onConnect, label, showAcrossLogo }: {
  isDark: boolean; ctaBg: string; ctaText: string; cardR: number; cardH: number;
  isConnected: boolean; onConnect: () => void; label: string; showAcrossLogo?: boolean;
}) {
  return (
    <div onClick={!isConnected ? onConnect : undefined} style={{ width: 130, flexShrink: 0, background: ctaBg, borderRadius: cardR, minHeight: cardH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: !isConnected ? "pointer" : "default", transition: "all 0.2s ease", gap: 8 }}>
      {showAcrossLogo && <AcrossLogoMark size={24} />}
      <span style={{ fontSize: 15, fontWeight: 700, color: ctaText, textAlign: "center", lineHeight: 1.35, padding: "0 12px", whiteSpace: "pre-line" }}>{label}</span>
    </div>
  );
}

function PickerShell({ title, onClose, isDark, children }: { title: string; onClose: () => void; isDark: boolean; children: React.ReactNode }) {
  const bg = isDark ? "#1f1f1f" : "#FFFFFF";
  const border = isDark ? "#333" : "#E0D8D0";
  const text = isDark ? "#fff" : "#1a1a1a";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 20, width: 340, maxHeight: 480, overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TokenPickerModal({ tokens, current, isDark, onSelect, onClose }: { tokens: TokenInfo[]; current: TokenInfo | null; isDark: boolean; onSelect: (t: TokenInfo) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const filtered = tokens.filter(t => t.symbol.toLowerCase().includes(q.toLowerCase()) || t.name.toLowerCase().includes(q.toLowerCase())).slice(0, 50);
  const text = isDark ? "#fff" : "#1a1a1a";
  return (
    <PickerShell title="Select token" onClose={onClose} isDark={isDark}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${isDark ? "#333" : "#ddd"}`, background: isDark ? "#2a2a2a" : "#f8f6f4", color: text, fontSize: 13, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
      {filtered.map(t => (
        <button key={`${t.chainId}-${t.address}`} onClick={() => onSelect(t)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: current?.address === t.address ? (isDark ? "#2a3a4a" : "#e8f0f8") : "transparent", color: text, textAlign: "left" }}
          onMouseEnter={e => { if (current?.address !== t.address) (e.currentTarget as HTMLElement).style.background = isDark ? "#2a2a2a" : "#F5F0EC"; }}
          onMouseLeave={e => { if (current?.address !== t.address) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <img src={t.logoUrl} alt={t.symbol} width={32} height={32} style={{ borderRadius: 16, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>{t.symbol}</div><div style={{ fontSize: 11, color: "#888" }}>{t.name}</div></div>
        </button>
      ))}
      {filtered.length === 0 && <div style={{ color: "#888", fontSize: 13, textAlign: "center", padding: 16 }}>No tokens found</div>}
    </PickerShell>
  );
}

function ChainPickerModal({ chains, current, isDark, onSelect, onClose }: { chains: ChainInfo[]; current: ChainInfo | null; isDark: boolean; onSelect: (c: ChainInfo) => void; onClose: () => void }) {
  const text = isDark ? "#fff" : "#1a1a1a";
  return (
    <PickerShell title="Select chain" onClose={onClose} isDark={isDark}>
      {chains.map(c => (
        <button key={c.chainId} onClick={() => onSelect(c)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, border: "none", cursor: "pointer", background: current?.chainId === c.chainId ? (isDark ? "#2a3a4a" : "#e8f0f8") : "transparent", color: text, textAlign: "left" }}
          onMouseEnter={e => { if (current?.chainId !== c.chainId) (e.currentTarget as HTMLElement).style.background = isDark ? "#2a2a2a" : "#F5F0EC"; }}
          onMouseLeave={e => { if (current?.chainId !== c.chainId) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <img src={c.logoUrl} alt={c.name} width={28} height={28} style={{ borderRadius: 14, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#888" }}>{c.shortName}</div>
        </button>
      ))}
    </PickerShell>
  );
}
