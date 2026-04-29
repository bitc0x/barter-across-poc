export const ACROSS_API = "https://app.across.to/api";

// ── Types ─────────────────────────────────────────────────────────────

export interface ChainInfo {
  chainId: number;
  name: string;
  shortName: string;
  logoUrl: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  logoUrl: string;
}

// Swap API response - /swap/approval
export interface SwapQuote {
  expectedOutputAmount: string;   // raw units of output token
  minOutputAmount: string;        // raw units, after slippage
  expectedFillTime: number;       // seconds
  fees: {
    total: {
      amount: string;             // raw units of input token
      amountUsd: string;
      pct: string;                // 1e18 = 100%
    };
  };
  swapTx: {
    to: string;
    data: string;
    value: string;
    from?: string;
    gas?: string;
    chainId: number;
  } | null;
  outputToken: {
    symbol: string;
    decimals: number;
    address: string;
    chainId: number;
  };
  inputToken: {
    symbol: string;
    decimals: number;
    address: string;
    chainId: number;
  };
  id: string;
  quoteExpiryTimestamp: number;
}

// ── Logo URL helpers ──────────────────────────────────────────────────

// GitHub blob URLs are not directly renderable - convert to raw
export function toRawLogoUrl(url: string): string {
  if (!url) return "";
  if (url.includes("github.com") && url.includes("/blob/")) {
    return url
      .replace("https://github.com/", "https://raw.githubusercontent.com/")
      .replace("/blob/", "/");
  }
  return url;
}

// ── Data fetchers ─────────────────────────────────────────────────────

let _chainsCache: ChainInfo[] | null = null;
export async function fetchChains(): Promise<ChainInfo[]> {
  if (_chainsCache) return _chainsCache;
  const resp = await fetch(`${ACROSS_API}/swap/chains`);
  if (!resp.ok) throw new Error(`Chains API ${resp.status}`);
  const raw: Array<{ chainId: number; name: string; logoUrl: string }> = await resp.json();

  // Exclude non-EVM (Solana has a huge chainId) and internal chains
  const EXCLUDED = [34268394551451, 1337, 2337]; // Solana, HyperCore, Lighter
  _chainsCache = raw
    .filter(c => !EXCLUDED.includes(c.chainId))
    .map(c => ({
      chainId: c.chainId,
      name: c.name,
      shortName: chainShortName(c.chainId, c.name),
      logoUrl: c.logoUrl,
    }));
  return _chainsCache;
}

const _tokensCache: Record<number, TokenInfo[]> = {};
export async function fetchTokensForChain(chainId: number): Promise<TokenInfo[]> {
  if (_tokensCache[chainId]) return _tokensCache[chainId];
  const resp = await fetch(`${ACROSS_API}/swap/tokens?chainId=${chainId}`);
  if (!resp.ok) throw new Error(`Tokens API ${resp.status}`);
  const raw: Array<{
    symbol: string; name: string; address: string;
    decimals: number; chainId: number; logoUrl: string;
  }> = await resp.json();

  _tokensCache[chainId] = raw.map(t => ({
    symbol: t.symbol,
    name: t.name,
    address: t.address,
    decimals: t.decimals,
    chainId: t.chainId,
    logoUrl: toRawLogoUrl(t.logoUrl),
  }));
  return _tokensCache[chainId];
}

// ── Swap API ──────────────────────────────────────────────────────────

export async function fetchSwapQuote(params: {
  originChainId: number;
  destinationChainId: number;
  inputToken: string;       // address on origin chain
  outputToken: string;      // address on destination chain
  amount: string;           // raw units of input token
  depositor: string;        // user wallet address (or zero address for quote-only)
  recipient?: string;       // defaults to depositor
  slippageTolerance?: number; // default 0.5 (%)
  integratorId?: string;
}): Promise<SwapQuote> {
  const url = new URL(`${ACROSS_API}/swap/approval`);
  url.searchParams.set("originChainId", String(params.originChainId));
  url.searchParams.set("destinationChainId", String(params.destinationChainId));
  url.searchParams.set("inputToken", params.inputToken);
  url.searchParams.set("outputToken", params.outputToken);
  url.searchParams.set("amount", params.amount);
  url.searchParams.set("depositor", params.depositor);
  if (params.recipient) url.searchParams.set("recipient", params.recipient);
  if (params.slippageTolerance !== undefined) {
    url.searchParams.set("slippageTolerance", String(params.slippageTolerance));
  }
  if (params.integratorId) url.searchParams.set("integratorId", params.integratorId);

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Swap API ${resp.status}`);
  }
  return resp.json();
}

// ── Utils ─────────────────────────────────────────────────────────────

export function toUnits(amount: number, decimals: number): string {
  return BigInt(Math.floor(amount * Math.pow(10, decimals))).toString();
}

export function fromUnits(raw: string, decimals: number): number {
  return parseFloat(raw) / Math.pow(10, decimals);
}

export function fmtAmount(n: number, decimals: number): string {
  if (decimals <= 6) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

// Integrator ID for Across BD tracking
export const INTEGRATOR_ID = "0x00ce";

// ── Chain short names ─────────────────────────────────────────────────
function chainShortName(chainId: number, name: string): string {
  const MAP: Record<number, string> = {
    1: "ETH", 10: "OP", 137: "POL", 324: "ZKS", 8453: "BASE",
    42161: "ARB", 59144: "LINEA", 34443: "MODE", 81457: "BLAST",
    1135: "LISK", 534352: "SCROLL", 7777777: "ZORA", 480: "WC",
    57073: "INK", 1868: "SONEIUM", 130: "UNI", 56: "BNB",
    999: "HYPE", 9745: "PLASMA", 143: "MONAD", 4217: "TEMPO",
    232: "LENS", 4326: "MEGA",
  };
  return MAP[chainId] || name.slice(0, 4).toUpperCase();
}
