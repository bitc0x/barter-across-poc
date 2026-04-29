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

interface CCQuote {
  outputAmount: number;
  relayFeePct: string;
  relayFeeTotal: number;
  estimatedFillTimeSec: number;
}

const SAME_CHAIN_TOKENS = TOKENS[1];

export default function SwapPage() {
  const [tab, setTab] = useState<SwapTab>("swap");

  // Same-chain swap state
  const [sellToken, setSellToken] = useState(SAME_CHAIN_TOKENS[0]);
  const [buyToken, setBuyToken] = useState(SAME_CHAIN_TOKENS[1]);
  const [sellAmount, setSellAmount] = useState("");

  // Cross-chain state
  const [originChain, setOriginChain] = useState<ChainInfo>(CHAINS[1]); // Arbitrum
  const [destChain, setDestChain] = useState<ChainInfo>(CHAINS[0]);     // Ethereum
  const [ccSellToken, setCcSellToken] = useState<TokenInfo>(TOKENS[42161][0]);
  const [ccBuyToken, setCcBuyToken] = useState<TokenInfo>(TOKENS[1][0]);
  const [ccAmount, setCcAmount] = useState("");
  const [ccQuote, setCcQuote] = useState<CCQuote | null>(null);
  const [ccState, setCcState] = useState<QuoteState>("idle");
  const [ccError, setCcError] = useState("");

  // Pickers
  const [showSellPicker, setShowSellPicker] = useState(false);
  const [showBuyPicker, setShowBuyPicker] = useState(false);
  const [showCcOriginChainPicker, setShowCcOriginChainPicker] = useState(false);
  const [showCcDestChainPicker, setShowCcDestChainPicker] = useState(false);
  const [showCcSellTokenPicker, setShowCcSellTokenPicker] = useState(false);
  const [showCcBuyTokenPicker, setShowCcBuyTokenPicker] = useState(false);

  const getQuote = useCallback(async () => {
    const amount = parseFloat(ccAmount);
    if (!amount || amount <= 0) return;

    setCcState("loading");
    setCcError("");
    setCcQuote(null);

    try {
      const inputAmountRaw = toUnits(amount, ccSellToken.decimals);
      const data = await fetchAcrossSuggestedFees({
        inputToken: ccSellToken.address,
        outputToken: ccBuyToken.address,
        originChainId: originChain.chainId,
        destinationChainId: destChain.chainId,
        amount: inputAmountRaw,
      });

      const relayFeeTotal = fromUnits(data.totalRelayFee.total, ccSellToken.decimals);
      const outputAmount = Math.max(amount - relayFeeTotal, 0);
      const feePct = parseFloat(data.totalRelayFee.pct) / 1e16;

      setCcQuote({
        outputAmount,
        relayFeePct: feePct.toFixed(3),
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

  // Reset token to first available when chain changes
  useEffect(() => {
    const tokens = TOKENS[originChain.chainId];
    if (tokens?.length) setCcSellToken(tokens[0]);
  }, [originChain]);

  useEffect(() => {
    const tokens = TOKENS[destChain.chainId];
    if (tokens?.length) setCcBuyToken(tokens[0]);
  }, [destChain]);

  function flipChains() {
    const prevOrigin = originChain;
    const prevDest = destChain;
    setOriginChain(prevDest);
    setDestChain(prevOrigin);
    setCcAmount("");
    setCcQuote(null);
    setCcState("idle");
  }

  return (
    <div className="min-h-screen bg-barter-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-barter-border">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BarterLogoMark size={24} />
            <span className="font-semibold text-sm text-barter-text">Barter</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 bg-barter-surface border border-barter-border rounded-lg p-1">
            {(["Swap", "Limit", "Superposition"] as const).map((item) => (
              <button
                key={item}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  item === "Swap"
                    ? "bg-barter-card text-barter-text"
                    : "text-barter-muted hover:text-barter-sub"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-barter-muted hover:text-barter-sub font-mono transition-colors hidden md:block">
            Partnership proposal
          </Link>
          <button className="bg-barter-surface border border-barter-border rounded-lg px-4 py-2 text-sm text-barter-sub hover:text-barter-text hover:border-barter-orange/40 transition-all">
            Connect wallet
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-start pt-28 pb-20 px-4">
        <div className="w-full max-w-[440px] animate-slide-up">

          {/* Tab switcher */}
          <div className="flex items-center gap-1 mb-3 bg-barter-surface border border-barter-border rounded-xl p-1">
            <TabBtn active={tab === "swap"} onClick={() => setTab("swap")}>
              Swap
            </TabBtn>
            <TabBtn active={tab === "crosschain"} onClick={() => setTab("crosschain")} accent>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-across-green inline-block" />
                Cross-chain
                <span className="text-[10px] bg-across-green/15 text-across-green px-1.5 py-0.5 rounded font-mono">
                  Across
                </span>
              </span>
            </TabBtn>
          </div>

          {/* Swap card */}
          <div className="bg-barter-card border border-barter-border rounded-2xl overflow-hidden">
            {tab === "swap" ? (
              <SameChainSwap
                sellToken={sellToken}
                buyToken={buyToken}
                sellAmount={sellAmount}
                setSellAmount={setSellAmount}
                setSellToken={setSellToken}
                setBuyToken={setBuyToken}
                showSellPicker={showSellPicker}
                showBuyPicker={showBuyPicker}
                setShowSellPicker={setShowSellPicker}
                setShowBuyPicker={setShowBuyPicker}
                tokens={SAME_CHAIN_TOKENS}
                onSwitchToCC={() => setTab("crosschain")}
              />
            ) : (
              <CrossChainSwap
                originChain={originChain}
                destChain={destChain}
                ccSellToken={ccSellToken}
                ccBuyToken={ccBuyToken}
                ccAmount={ccAmount}
                setCcAmount={setCcAmount}
                setCcSellToken={setCcSellToken}
                setCcBuyToken={setCcBuyToken}
                setOriginChain={setOriginChain}
                setDestChain={setDestChain}
                flipChains={flipChains}
                ccQuote={ccQuote}
                ccState={ccState}
                ccError={ccError}
                showCcOriginChainPicker={showCcOriginChainPicker}
                showCcDestChainPicker={showCcDestChainPicker}
                showCcSellTokenPicker={showCcSellTokenPicker}
                showCcBuyTokenPicker={showCcBuyTokenPicker}
                setShowCcOriginChainPicker={setShowCcOriginChainPicker}
                setShowCcDestChainPicker={setShowCcDestChainPicker}
                setShowCcSellTokenPicker={setShowCcSellTokenPicker}
                setShowCcBuyTokenPicker={setShowCcBuyTokenPicker}
              />
            )}
          </div>

          {/* Across attribution */}
          {tab === "crosschain" && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-barter-muted">
              <span>Cross-chain powered by</span>
              <a
                href="https://across.to"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-across-green hover:text-across-green-dim transition-colors font-medium"
              >
                <AcrossLogoMark size={14} />
                Across Protocol
              </a>
            </div>
          )}
        </div>

        {/* Info cards below swap on cross-chain tab */}
        {tab === "crosschain" && (
          <div className="w-full max-w-[440px] mt-4 space-y-2 animate-fade-in">
            <InfoCard
              icon="⚡"
              title="Under 2 seconds fill time"
              body="Relayers front capital at your destination instantly. Fastest crosschain infrastructure in production."
            />
            <InfoCard
              icon="🔒"
              title="Native assets only"
              body="You receive canonical tokens, not wrapped representations. Zero bridge-specific IOU risk."
            />
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function TabBtn({
  active, onClick, children, accent,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
        active
          ? accent
            ? "bg-barter-card text-across-green border border-across-green/20"
            : "bg-barter-card text-barter-text"
          : "text-barter-muted hover:text-barter-sub"
      }`}
    >
      {children}
    </button>
  );
}

function InfoCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="bg-barter-surface border border-barter-border rounded-xl p-4 flex gap-3">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <div className="text-sm font-medium text-barter-text mb-0.5">{title}</div>
        <div className="text-xs text-barter-muted leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

function TokenButton({ token, onClick }: { token: TokenInfo; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-barter-surface hover:bg-barter-hover border border-barter-border rounded-lg px-2.5 py-1.5 transition-all min-w-fit"
    >
      <TokenIcon symbol={token.symbol} />
      <span className="text-sm font-semibold text-barter-text">{token.symbol}</span>
      <svg className="w-3 h-3 text-barter-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

function ChainButton({ chain, onClick }: { chain: ChainInfo; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-barter-surface hover:bg-barter-hover border border-barter-border rounded-lg px-2.5 py-1.5 transition-all"
    >
      <span className="text-xs font-mono text-across-green font-medium">{chain.shortName}</span>
      <svg className="w-3 h-3 text-barter-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

function TokenIcon({ symbol }: { symbol: string }) {
  const COLORS: Record<string, string> = {
    USDC: "#2775CA", WETH: "#627EEA", USDT: "#26A17B",
    DAI: "#F5AC37", WBTC: "#F7931A", LINK: "#2A5ADA", UNI: "#FF007A",
  };
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ background: COLORS[symbol] || "#6b7280", fontSize: 8 }}
    >
      {symbol[0]}
    </div>
  );
}

function PickerClose({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} className="text-barter-muted hover:text-barter-sub p-1">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function TokenPicker({ tokens, onSelect, onClose }: {
  tokens: TokenInfo[]; onSelect: (t: TokenInfo) => void; onClose: () => void;
}) {
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-20 bg-barter-card rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-barter-text">Select token</span>
        <PickerClose onClose={onClose} />
      </div>
      <div className="space-y-1 overflow-y-auto flex-1">
        {tokens.map((t) => (
          <button
            key={t.address}
            onClick={() => { onSelect(t); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-barter-hover transition-colors"
          >
            <TokenIcon symbol={t.symbol} />
            <div className="text-left">
              <div className="text-sm font-medium text-barter-text">{t.symbol}</div>
              <div className="text-xs text-barter-muted">{t.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChainPicker({ chains, onSelect, onClose }: {
  chains: ChainInfo[]; onSelect: (c: ChainInfo) => void; onClose: () => void;
}) {
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-20 bg-barter-card rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-barter-text">Select chain</span>
        <PickerClose onClose={onClose} />
      </div>
      <div className="space-y-1">
        {chains.map((c) => (
          <button
            key={c.chainId}
            onClick={() => { onSelect(c); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-barter-hover transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-barter-surface border border-barter-border flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-mono text-across-green font-medium">{c.shortName.slice(0, 3)}</span>
            </div>
            <div className="text-sm font-medium text-barter-text">{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Same-chain swap panel ────────────────────────────────────────────
function SameChainSwap({
  sellToken, buyToken, sellAmount, setSellAmount,
  setSellToken, setBuyToken,
  showSellPicker, showBuyPicker,
  setShowSellPicker, setShowBuyPicker,
  tokens, onSwitchToCC,
}: {
  sellToken: TokenInfo; buyToken: TokenInfo;
  sellAmount: string; setSellAmount: (v: string) => void;
  setSellToken: (t: TokenInfo) => void; setBuyToken: (t: TokenInfo) => void;
  showSellPicker: boolean; showBuyPicker: boolean;
  setShowSellPicker: (v: boolean) => void; setShowBuyPicker: (v: boolean) => void;
  tokens: TokenInfo[]; onSwitchToCC: () => void;
}) {
  function flipTokens() {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    setSellAmount("");
  }

  // Placeholder output: shows UI is functional without fake price data
  const hasAmount = sellAmount && parseFloat(sellAmount) > 0;

  return (
    <div className="relative p-4 space-y-2">
      {showSellPicker && (
        <TokenPicker
          tokens={tokens.filter(t => t.symbol !== buyToken.symbol)}
          onSelect={setSellToken}
          onClose={() => setShowSellPicker(false)}
        />
      )}
      {showBuyPicker && (
        <TokenPicker
          tokens={tokens.filter(t => t.symbol !== sellToken.symbol)}
          onSelect={setBuyToken}
          onClose={() => setShowBuyPicker(false)}
        />
      )}

      {/* Sell */}
      <div className="bg-barter-surface rounded-xl p-4 border border-barter-border hover:border-barter-muted/40 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-barter-muted">You pay</span>
          <span className="text-xs text-barter-muted">Balance: 0.00</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={sellAmount}
            onChange={e => setSellAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-semibold text-barter-text outline-none placeholder:text-barter-border min-w-0"
          />
          <TokenButton token={sellToken} onClick={() => setShowSellPicker(true)} />
        </div>
      </div>

      {/* Flip */}
      <div className="flex justify-center -my-1 relative z-10">
        <button
          onClick={flipTokens}
          className="bg-barter-card border border-barter-border rounded-lg p-2 hover:bg-barter-hover hover:border-barter-orange/40 transition-all group"
        >
          <svg className="w-4 h-4 text-barter-muted group-hover:text-barter-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Receive */}
      <div className="bg-barter-surface rounded-xl p-4 border border-barter-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-barter-muted">You receive</span>
          <span className="text-xs text-barter-muted">Balance: 0.00</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex-1 text-2xl font-semibold min-w-0 ${hasAmount ? "text-barter-text animate-pulse2" : "text-barter-border"}`}>
            {hasAmount ? "..." : "0.0"}
          </div>
          <TokenButton token={buyToken} onClick={() => setShowBuyPicker(true)} />
        </div>
        {hasAmount && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-across-green font-mono">Best price via Barter</span>
            <span className="text-[10px] text-barter-muted">·</span>
            <span className="text-xs text-barter-muted font-mono">AMM + Superposition</span>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="flex items-center justify-between px-1 text-xs text-barter-muted">
        <span>Slippage: 0.5%</span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
          0.3% fee
        </span>
      </div>

      {/* CTA */}
      <button
        disabled={!hasAmount}
        className="w-full py-4 rounded-xl font-semibold text-sm transition-all mt-2 disabled:opacity-30 disabled:cursor-not-allowed bg-barter-orange hover:bg-barter-orange-dim text-white"
      >
        {hasAmount ? "Swap tokens" : "Enter an amount"}
      </button>

      {/* Cross-chain nudge */}
      <button
        onClick={onSwitchToCC}
        className="w-full text-xs text-barter-muted hover:text-across-green transition-colors flex items-center justify-center gap-1.5 py-1"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-across-green inline-block" />
        Token on a different chain? Try Cross-chain
      </button>
    </div>
  );
}

// ── Cross-chain panel ────────────────────────────────────────────────
function CrossChainSwap({
  originChain, destChain, ccSellToken, ccBuyToken,
  ccAmount, setCcAmount, setCcSellToken, setCcBuyToken,
  setOriginChain, setDestChain, flipChains,
  ccQuote, ccState, ccError,
  showCcOriginChainPicker, showCcDestChainPicker,
  showCcSellTokenPicker, showCcBuyTokenPicker,
  setShowCcOriginChainPicker, setShowCcDestChainPicker,
  setShowCcSellTokenPicker, setShowCcBuyTokenPicker,
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
}) {
  const originTokens = TOKENS[originChain.chainId] || [];
  const destTokens = TOKENS[destChain.chainId] || [];

  return (
    <div className="relative p-4 space-y-2">
      {showCcOriginChainPicker && (
        <ChainPicker
          chains={CHAINS.filter(c => c.chainId !== destChain.chainId)}
          onSelect={setOriginChain}
          onClose={() => setShowCcOriginChainPicker(false)}
        />
      )}
      {showCcDestChainPicker && (
        <ChainPicker
          chains={CHAINS.filter(c => c.chainId !== originChain.chainId)}
          onSelect={setDestChain}
          onClose={() => setShowCcDestChainPicker(false)}
        />
      )}
      {showCcSellTokenPicker && (
        <TokenPicker
          tokens={originTokens.filter(t => t.symbol !== ccBuyToken.symbol)}
          onSelect={setCcSellToken}
          onClose={() => setShowCcSellTokenPicker(false)}
        />
      )}
      {showCcBuyTokenPicker && (
        <TokenPicker
          tokens={destTokens.filter(t => t.symbol !== ccSellToken.symbol)}
          onSelect={setCcBuyToken}
          onClose={() => setShowCcBuyTokenPicker(false)}
        />
      )}

      {/* Origin */}
      <div className="bg-barter-surface rounded-xl p-4 border border-barter-border hover:border-barter-muted/40 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-barter-muted">From</span>
            <ChainButton chain={originChain} onClick={() => setShowCcOriginChainPicker(true)} />
          </div>
          <span className="text-xs text-barter-muted">Balance: 0.00</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={ccAmount}
            onChange={e => setCcAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-semibold text-barter-text outline-none placeholder:text-barter-border min-w-0"
          />
          {originTokens.length > 0 && (
            <TokenButton token={ccSellToken} onClick={() => setShowCcSellTokenPicker(true)} />
          )}
        </div>
      </div>

      {/* Chain flip */}
      <div className="flex justify-center -my-1 relative z-10">
        <button
          onClick={flipChains}
          className="bg-barter-card border border-barter-border rounded-lg p-2 hover:bg-barter-hover hover:border-across-green/40 transition-all group"
        >
          <svg className="w-4 h-4 text-barter-muted group-hover:text-across-green transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Destination */}
      <div className="bg-barter-surface rounded-xl p-4 border border-barter-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-barter-muted">To</span>
            <ChainButton chain={destChain} onClick={() => setShowCcDestChainPicker(true)} />
          </div>
          <span className="text-xs text-barter-muted">Balance: 0.00</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex-1 text-2xl font-semibold min-w-0 font-mono transition-all ${
            ccState === "loading" ? "text-barter-muted animate-pulse2"
            : ccState === "success" && ccQuote ? "text-barter-text"
            : "text-barter-border"
          }`}>
            {ccState === "loading" ? "..."
             : ccState === "success" && ccQuote ? fmtAmount(ccQuote.outputAmount, ccBuyToken.decimals)
             : "0.0"}
          </div>
          {destTokens.length > 0 && (
            <TokenButton token={ccBuyToken} onClick={() => setShowCcBuyTokenPicker(true)} />
          )}
        </div>
        {ccState === "success" && ccQuote && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-across-green font-mono">Filled via Across</span>
            <span className="text-[10px] text-barter-muted">·</span>
            <span className="text-xs text-barter-muted font-mono">~{ccQuote.estimatedFillTimeSec}s fill</span>
          </div>
        )}
      </div>

      {/* Quote details */}
      {ccState === "success" && ccQuote && (
        <div className="bg-barter-surface rounded-xl p-3 border border-barter-border space-y-2 animate-fade-in">
          <QuoteRow label="Bridge fee" value={`${ccQuote.relayFeePct}% (${fmtAmount(ccQuote.relayFeeTotal, ccSellToken.decimals)} ${ccSellToken.symbol})`} />
          <QuoteRow label="Est. fill time" value={`~${ccQuote.estimatedFillTimeSec}s`} highlight />
          <QuoteRow label="Settled via" value="Across intent protocol" />
          <QuoteRow label="Asset received" value={`Native ${ccBuyToken.symbol}`} highlight />
        </div>
      )}

      {/* Error */}
      {ccState === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 font-mono">
          {ccError || "Quote unavailable for this route. Try a different chain pair."}
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!ccAmount || ccState === "loading" || ccState !== "success"}
        className={`w-full py-4 rounded-xl font-semibold text-sm transition-all mt-2 disabled:opacity-30 disabled:cursor-not-allowed ${
          ccState === "success"
            ? "bg-across-green text-barter-bg hover:bg-across-green-dim glow-green"
            : "bg-barter-surface border border-barter-border text-barter-text"
        }`}
      >
        {!ccAmount ? "Enter an amount"
         : ccState === "loading" ? "Getting best route..."
         : ccState === "success" ? `Bridge ${originChain.shortName} to ${destChain.shortName}`
         : ccState === "error" ? "Route unavailable"
         : "Get quote"}
      </button>
    </div>
  );
}

function QuoteRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-barter-muted">{label}</span>
      <span className={`font-mono ${highlight ? "text-across-green" : "text-barter-sub"}`}>{value}</span>
    </div>
  );
}
