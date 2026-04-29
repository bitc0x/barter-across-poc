export const ACROSS_API = "https://app.across.to/api";

export interface AcrossQuote {
  inputAmount: string;
  outputAmount: string;
  totalRelayFee: { total: string; pct: string };
  estimatedFillTimeSec: number;
  spokePoolAddress: string;
  depositId?: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface ChainInfo {
  chainId: number;
  name: string;
  shortName: string;
  logoURI?: string;
}

export const CHAINS: ChainInfo[] = [
  { chainId: 1, name: "Ethereum", shortName: "ETH" },
  { chainId: 42161, name: "Arbitrum", shortName: "ARB" },
  { chainId: 8453, name: "Base", shortName: "BASE" },
  { chainId: 10, name: "Optimism", shortName: "OP" },
  { chainId: 137, name: "Polygon", shortName: "MATIC" },
];

export const TOKENS: Record<number, TokenInfo[]> = {
  1: [
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, chainId: 1 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, chainId: 1 },
    { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, chainId: 1 },
    { symbol: "DAI", name: "Dai", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18, chainId: 1 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, chainId: 1 },
  ],
  42161: [
    { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, chainId: 42161 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18, chainId: 42161 },
    { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, chainId: 42161 },
    { symbol: "DAI", name: "Dai", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, chainId: 42161 },
  ],
  8453: [
    { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, chainId: 8453 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18, chainId: 8453 },
    { symbol: "DAI", name: "Dai", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, chainId: 8453 },
  ],
  10: [
    { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6, chainId: 10 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18, chainId: 10 },
    { symbol: "DAI", name: "Dai", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, chainId: 10 },
  ],
  137: [
    { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, chainId: 137 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, chainId: 137 },
    { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, chainId: 137 },
  ],
};

export function toUnits(amount: number, decimals: number): string {
  return Math.floor(amount * Math.pow(10, decimals)).toString();
}

export function fromUnits(raw: string, decimals: number): number {
  return parseFloat(raw) / Math.pow(10, decimals);
}

export function fmtAmount(n: number, decimals: number): string {
  if (decimals <= 6) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export async function fetchAcrossSuggestedFees(params: {
  inputToken: string;
  outputToken: string;
  originChainId: number;
  destinationChainId: number;
  amount: string;
}): Promise<AcrossQuote> {
  const url = new URL(`${ACROSS_API}/suggested-fees`);
  url.searchParams.set("inputToken", params.inputToken);
  url.searchParams.set("outputToken", params.outputToken);
  url.searchParams.set("originChainId", String(params.originChainId));
  url.searchParams.set("destinationChainId", String(params.destinationChainId));
  url.searchParams.set("amount", params.amount);

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Across API error ${resp.status}`);
  return resp.json();
}
