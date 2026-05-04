"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAccount, useSendTransaction, useBalance, useReadContracts, useChainId } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
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
  fillTimeSec: number;
  swapTx: SwapQuote["swapTx"];
  fetchedAt: number; // ms timestamp for expiry check
}

// ── Token colors - exact match to barterswap.xyz screenshots ─────────
// Token card colors - pixel-matched to app.barterswap.xyz screenshots
const TOKEN_BG_LIGHT: Record<string, string> = {
  USDC: "#C6D2EA", WETH: "#D0CEDC", ETH:  "#D0CEDC", USDT: "#C4E8D2",
  DAI:  "#EED8A0", WBTC: "#EED0A0", LINK: "#C6D2EA", UNI:  "#EAC8D8",
  ACX:  "#C6D2EA", ARB:  "#C6D4EA",
};
const TOKEN_BG_DARK: Record<string, string> = {
  USDC: "#364470", WETH: "#46485E", ETH:  "#46485E", USDT: "#256040",
  DAI:  "#785820", WBTC: "#783C18", LINK: "#364470", UNI:  "#642848",
  ACX:  "#364470", ARB:  "#2E4470",
};
const TOKEN_TEXT_LIGHT: Record<string, string> = {
  USDC: "#18284A", WETH: "#1A1A38", ETH:  "#1A1A38", USDT: "#082E1E",
  DAI:  "#483000", WBTC: "#481E00", LINK: "#18284A", UNI:  "#38081E",
  ACX:  "#18284A", ARB:  "#182840",
};

function tokenBg(symbol: string, isDark: boolean) {
  return isDark ? (TOKEN_BG_DARK[symbol] || "#4A5060") : (TOKEN_BG_LIGHT[symbol] || "#C8D0D8");
}
function tokenText(symbol: string, isDark: boolean) {
  return isDark ? "#ffffff" : (TOKEN_TEXT_LIGHT[symbol] || "#1A2A3A");
}

// ── Main component ────────────────────────────────────────────────────
export default function SwapPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [tab, setTab] = useState<SwapTab>("swap");
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();

  const { sendTransaction, reset: resetTx, isPending: isTxPending, isSuccess: isTxSuccess, error: txError } = useSendTransaction();
  const [txHash, setTxHash] = useState<string | null>(null);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── Balance fetching ───────────────────────────────────────────────
  // Native ETH - fetch on chain 1 (Ethereum) always for same-chain tab,
  // and also on the origin chain for cross-chain tab
  const { data: ethBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: 1,
    query: { enabled: !!address, refetchInterval: 12000 },
  });
  const { data: nativeOriginBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: originChain?.chainId,
    query: { enabled: !!address && !!originChain, refetchInterval: 12000 },
  });

  // Stable list of unique ERC20 tokens to query - memoized so contracts array
  // identity is stable and useReadContracts doesn't re-fire on every render
  const uniqueErc20 = useMemo(() => {
    const all = [scSell, scBuy, sellToken, buyToken].filter(
      (t): t is import("@/lib/across").TokenInfo =>
        !!t && t.address !== "0x0000000000000000000000000000000000000000"
    );
    return all.filter(
      (t, i, arr) =>
        arr.findIndex(
          x => x.address.toLowerCase() === t.address.toLowerCase() && x.chainId === t.chainId
        ) === i
    ).slice(0, 8);
  }, [scSell, scBuy, sellToken, buyToken]);

  const { data: erc20Results } = useReadContracts({
    contracts: uniqueErc20.map(t => ({
      address: t.address as `0x${string}`,
      abi: [{
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      }] as const,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
      chainId: t.chainId,
    })),
    query: { enabled: !!address && uniqueErc20.length > 0, refetchInterval: 12000 },
  });

  // Format a balance value cleanly
  function fmtBal(val: number): string {
    if (val === 0) return "0.00";
    if (val < 0.0001) return "<0.0001";
    if (val >= 1000) return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (val >= 1) return val.toFixed(4);
    return val.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  }

  // Get formatted balance for any token
  function getTokenBalance(token: import("@/lib/across").TokenInfo | null): string {
    if (!address || !token) return "0.00";
    const isNative = token.address === "0x0000000000000000000000000000000000000000";
    if (isNative) {
      const bal = token.chainId === 1 ? ethBalance
        : token.chainId === originChain?.chainId ? nativeOriginBalance
        : null;
      if (!bal) return "0.00";
      return fmtBal(parseFloat(bal.formatted));
    }
    const idx = uniqueErc20.findIndex(
      u => u.address.toLowerCase() === token.address.toLowerCase() && u.chainId === token.chainId
    );
    if (idx === -1) return "0.00";
    const result = erc20Results?.[idx];
    if (!result || result.status !== "success" || result.result == null) return "0.00";
    const raw = result.result as bigint;
    // Safe decimal conversion avoiding float precision issues
    const divisor = BigInt(10 ** Math.min(token.decimals, 15));
    const whole = raw / divisor;
    const val = Number(whole) / Math.pow(10, Math.min(token.decimals, 15));
    return fmtBal(val);
  }

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
      setOriginChain(eth);
      setDestChain(arb);
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
      setSellToken(prev => ts.find(t => t.symbol === prev?.symbol) || ts.find(t => t.symbol === "ETH") || ts.find(t => t.symbol === "WETH") || ts[0]);
    });
  }, [originChain]);

  useEffect(() => {
    if (!destChain) return;
    fetchTokensForChain(destChain.chainId).then(ts => {
      setDestTokens(ts);
      setBuyToken(prev => ts.find(t => t.symbol === prev?.symbol) || ts.find(t => t.symbol === "USDC") || ts[0]);
    });
  }, [destChain]);

  // Debounced quote fetch using Swap API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    resetTx(); // clear Rejected/Success state when user edits amount
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
        setCcQuote({
          outputAmount,
          minOutputAmount,
          feeTotalUsd: parseFloat(data.fees.total.amountUsd).toFixed(2),
          fillTimeSec: data.expectedFillTime,
          swapTx: data.swapTx,
          fetchedAt: Date.now(),
        });
        setCcState("success");
      } catch (e) {
        setCcError(
          e instanceof Error
            ? e.message.includes("too low") ? "Amount too low for this route. Try a larger amount."
              : e.message.includes("not supported") ? "Route not supported."
              : e.message.includes("400") ? "Route unavailable. Try a different token or chain."
              : "Quote failed. Please try again."
            : "Quote failed."
        );
        setCcState("error");
      }
    }, 600);
  }, [ccAmount, sellToken, buyToken, originChain, destChain, address]);

  function executeSwap() {
    if (!ccQuote?.swapTx || !isConnected) return;
    // Quotes expire - refresh if older than 25 seconds
    if (Date.now() - ccQuote.fetchedAt > 25000) {
      setCcState("idle");
      setCcQuote(null);
      setCcError("Quote expired. Enter amount again for a fresh quote.");
      return;
    }
    const tx = ccQuote.swapTx;
    sendTransaction({
      to: tx.to as `0x${string}`,
      data: tx.data as `0x${string}`,
      value: BigInt(tx.value || "0"),
      chainId: tx.chainId,
    }, {
      onSuccess: (hash) => {
        setTxHash(hash);
        // Auto-clear after 6 seconds - clean UX, user can click the link before it goes
        if (clearRef.current) clearTimeout(clearRef.current);
        clearRef.current = setTimeout(() => {
          setTxHash(null);
          setCcAmount("");
          setCcQuote(null);
          setCcState("idle");
          resetTx();
        }, 6000);
      },
    });
  }

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
  const bg        = isDark ? "#18181C" : "#EDE7DE";
  const navBg     = isDark ? "#1E1E24" : "#FFFFFF";
  const navBorder = isDark ? "#2A2A34" : "#E4DDD4";
  const textPri   = isDark ? "#FFFFFF" : "#111111";
  const textMut   = isDark ? "#7A7A8A" : "#888888";
  const ctaBg     = isDark ? "#72728A" : "#FF8C20";
  const ctaText   = isDark ? "#FFFFFF" : "#FFFFFF";
  const tabBg     = isDark ? "#24242C" : "#E8E2D8";
  const tabBorder = isDark ? "#34343E" : "#CCC6BC";
  const tabActive = isDark ? "#2E2E38" : "#FFFFFF";
  const tabActiveBorder = isDark ? "#4A4A5A" : "#FF8C20";
  const cardR     = 20;
  const cardH     = 260;

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
          <span style={{ fontWeight: 800, fontSize: 20, color: "#FF8C20", letterSpacing: "-0.5px" }}>Barter</span>
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
          <a href="/" style={{
            fontSize: 13,
            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: 5,
            transition: "color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)")}
            onMouseLeave={e => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)")}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to pitch
          </a>
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
            <TabPill label="Swap" active={tab === "swap"} onClick={() => setTab("swap")} isDark={isDark} tabActive={tabActive} tabActiveBorder={tabActiveBorder} textPri={textPri} textMut={textMut} prominent />
            <TabPill label="Cross-chain" active={tab === "crosschain"} onClick={() => setTab("crosschain")} isDark={isDark} tabActive={tabActive} tabActiveBorder={tabActiveBorder} textPri={textPri} textMut={textMut} />
          </div>
        </div>

        {/* Three-panel layout */}
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {tab === "swap" ? (
            /* ── Same-chain ─────────────────────────────── */
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {/* Sell */}
              <div style={{ flex: "1 1 0", background: scSellBg, borderRadius: cardR, padding: 24, minHeight: cardH, display: "flex", flexDirection: "column", justifyContent: "space-between", border: isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid rgba(255,255,255,0.85)", boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.07)" }}>
                <div><TokenSelector token={scSell} onClick={() => setShowPicker("scSell")} textColor={scSellText} /></div>
                <div>
                  <input
                    type="number" value={scAmount} onChange={e => setScAmount(e.target.value)}
                    placeholder="0.0"
                    style={{ background: "none", border: "none", outline: "none", fontSize: 88, fontWeight: 800, color: scSellText, width: "100%", padding: 0, lineHeight: 1.0, fontFamily: "inherit", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}
                  />
                  <div style={{ fontSize: 13, color: scSellText, opacity: 0.55, marginTop: 6 }}>Balance: {getTokenBalance(scSell)}</div>
                </div>
              </div>
              {/* Flip */}
              <FlipBtn onClick={flipSameChain} isDark={isDark} />
              {/* Buy */}
              <div style={{ flex: "1 1 0", background: scBuyBg, borderRadius: cardR, padding: 24, minHeight: cardH, display: "flex", flexDirection: "column", justifyContent: "space-between", border: isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid rgba(255,255,255,0.85)", boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.07)" }}>
                <div><TokenSelector token={scBuy} onClick={() => setShowPicker("scBuy")} textColor={scBuyText} /></div>
                <div>
                  <div style={{ fontSize: 88, fontWeight: 800, color: scBuyText, lineHeight: 1.0, minHeight: 90, letterSpacing: "-2px", fontVariantNumeric: "tabular-nums", opacity: scAmount && parseFloat(scAmount) > 0 ? 1 : 0.22 }}>
                    {scAmount && parseFloat(scAmount) > 0 ? <span style={{ opacity: 0.5 }}>...</span> : "0.0"}
                  </div>
                  <div style={{ fontSize: 13, color: scBuyText, opacity: 0.55, marginTop: 6 }}>Balance: {getTokenBalance(scBuy)}</div>
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
                isConnected={isConnected} onConnect={() => openConnectModal?.()}
                label={!isConnected ? "Connect wallet" : scAmount && parseFloat(scAmount) > 0 ? "Swap" : "Enter amount"}
              />
            </div>
          ) : (
            /* ── Cross-chain ────────────────────────────── */
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {/* Origin */}
              <div style={{ flex: "1 1 0", background: ccSellBg, borderRadius: cardR, padding: 24, minHeight: cardH, display: "flex", flexDirection: "column", justifyContent: "space-between", border: isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid rgba(255,255,255,0.85)", boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <TokenSelector token={sellToken} onClick={() => setShowPicker("ccSell")} textColor={ccSellText} />
                  <ChainSelector chain={originChain} onClick={() => setShowPicker("ccOriginChain")} isDark={isDark} />
                </div>
                <div>
                  <input
                    type="number" value={ccAmount} onChange={e => setCcAmount(e.target.value)}
                    placeholder="0.0"
                    style={{ background: "none", border: "none", outline: "none", fontSize: 88, fontWeight: 800, color: ccSellText, width: "100%", padding: 0, lineHeight: 1.0, fontFamily: "inherit", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums" }}
                  />
                  <div style={{ fontSize: 13, color: ccSellText, opacity: 0.55, marginTop: 6 }}>Balance: {getTokenBalance(sellToken)}</div>
                </div>
              </div>
              {/* Flip */}
              <FlipBtn onClick={flipChains} isDark={isDark} />
              {/* Destination */}
              <div style={{ flex: "1 1 0", background: ccBuyBg, borderRadius: cardR, padding: 24, minHeight: cardH, display: "flex", flexDirection: "column", justifyContent: "space-between", border: isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid rgba(255,255,255,0.85)", boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <TokenSelector token={buyToken} onClick={() => setShowPicker("ccBuy")} textColor={ccBuyText} />
                  <ChainSelector chain={destChain} onClick={() => setShowPicker("ccDestChain")} isDark={isDark} />
                </div>
                <div>
                  <div style={{ fontSize: 88, fontWeight: 800, color: ccBuyText, lineHeight: 1.0, minHeight: 90, letterSpacing: "-2px", fontVariantNumeric: "tabular-nums", opacity: ccState === "success" ? 1 : 0.22 }}>
                    {ccState === "loading" ? <span style={{ opacity: 0.4, fontSize: 36 }}>...</span>
                      : ccState === "success" && ccQuote ? fmtAmount(ccQuote.outputAmount, buyToken?.decimals ?? 18)
                      : "0.0"}
                  </div>
                  <div style={{ fontSize: 13, color: ccBuyText, opacity: 0.55, marginTop: 6 }}>Balance: {getTokenBalance(buyToken)}</div>
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
                isDark={isDark} ctaBg={
                  isTxSuccess ? "#22c55e"
                  : isTxPending ? "#3a8a60"
                  : ccCtaBg
                }
                ctaText={ccCtaText} cardR={cardR} cardH={cardH}
                isConnected={isConnected}
                onConnect={() => openConnectModal?.()}
                onExecute={ccState === "success" && !isTxPending && !isTxSuccess ? executeSwap : undefined}
                label={
                  isTxSuccess ? "Success!"
                  : isTxPending ? "Confirm in wallet..."
                  : txError ? "Rejected"
                  : !isConnected ? "Connect wallet"
                  : !ccAmount ? "Enter amount"
                  : ccState === "loading" ? "Routing..."
                  : ccState === "success" ? `Bridge\n${originChain?.shortName} to\n${destChain?.shortName}`
                  : ccState === "error" ? "No route"
                  : "Enter amount"
                }
                showAcrossLogo={ccState === "success" && !isTxPending && !isTxSuccess}
                disabled={isTxPending}
              />
            </div>
          )}

          {/* Tx hash confirmation */}
          {txHash && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: "#5BF3A0", fontFamily: "monospace", textDecoration: "none" }}
              >
                Tx submitted: {txHash.slice(0, 10)}...{txHash.slice(-8)} (view on Etherscan)
              </a>
            </div>
          )}


          {tab === "crosschain" && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 11, color: textMut, display: "inline-flex", alignItems: "center", gap: 5 }}>
                Cross-chain powered by{" "}
                <a href="https://across.to" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: isDark ? "#5BF3A0" : "#0a5c35", textDecoration: "none", fontWeight: 500 }}>
                  <AcrossLogoMark size={12} />
                  Across
                </a>
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 24px", borderTop: `1px solid ${navBorder}`, background: navBg, display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textMut} strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <span style={{ fontSize: 12, color: textMut }}>Ethereum Mainnet</span>
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

function TabPill({ label, active, onClick, isDark, tabActive, tabActiveBorder, textPri, textMut, badge, badgeLabel, badgeLabelColor, badgeLabelBg, prominent }: {
  label: string; active: boolean; onClick: () => void;
  isDark: boolean; tabActive: string; tabActiveBorder?: string; textPri: string; textMut: string;
  badge?: React.ReactNode; badgeLabel?: string; badgeLabelColor?: string; badgeLabelBg?: string;
  prominent?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "7px 18px", borderRadius: 9,
      border: active ? `1.5px solid ${tabActiveBorder || "#FF8C20"}` : "1.5px solid transparent",
      cursor: "pointer",
      background: active ? tabActive : "transparent",
      color: active ? textPri : prominent ? (isDark ? "#cccccc" : "#666666") : textMut,
      fontWeight: active ? 700 : prominent ? 500 : 400,
      fontSize: prominent ? 14 : 13,
      boxShadow: active ? (isDark ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 6px rgba(0,0,0,0.08)") : "none",
      transition: "all 0.15s ease",
    }}>
      {label}
      {badge && <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{badge}<span style={{ fontSize: 10, fontWeight: 600, color: badgeLabelColor, background: badgeLabelBg, padding: "1px 6px", borderRadius: 4 }}>{badgeLabel}</span></span>}
    </button>
  );
}

function TokenSelector({ token, onClick, textColor }: { token: TokenInfo | null; onClick: () => void; textColor: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 20, padding: "5px 10px 5px 6px", cursor: "pointer", color: textColor, fontFamily: "inherit", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
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

function ActionCard({ ctaBg, ctaText, cardR, cardH, isConnected, onConnect, onExecute, label, showAcrossLogo, disabled }: {
  isDark?: boolean; ctaBg: string; ctaText: string; cardR: number; cardH: number;
  isConnected: boolean; onConnect: () => void; onExecute?: () => void;
  label: string; showAcrossLogo?: boolean; disabled?: boolean;
}) {
  const clickable = !isConnected || !!onExecute;
  return (
    <div
      onClick={disabled ? undefined : !isConnected ? onConnect : onExecute}
      style={{
        width: 130, flexShrink: 0, background: ctaBg, borderRadius: cardR, minHeight: cardH,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : clickable ? "pointer" : "default",
        opacity: disabled ? 0.7 : 1,
        transition: "all 0.2s ease", gap: 8,
      }}
    >
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
