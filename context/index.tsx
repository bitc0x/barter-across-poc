"use client";
import React, { type ReactNode, useEffect, useRef } from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, base, optimism, polygon } from "@reown/appkit/networks";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const PROJECT_ID = "e6ec1105c1bea07ee25e2ff2cab86514";

const networks = [mainnet, arbitrum, base, optimism, polygon] as const;

const wagmiAdapter = new WagmiAdapter({
  projectId: PROJECT_ID,
  networks,
  ssr: true,
});

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: PROJECT_ID,
  networks,
  defaultNetwork: mainnet,
  metadata: {
    name: "Barter x Across",
    description: "Cross-chain swaps powered by Across Protocol",
    url: "https://barter-across-poc.vercel.app",
    icons: ["https://barterswap.xyz/img/logo.svg"],
  },
  features: { analytics: false, email: false, socials: false },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#FF8C20",
    "--w3m-border-radius-master": "4px",
  },
});

const queryClient = new QueryClient();

export { modal };

export default function Web3Provider({ children }: { children: ReactNode }) {
  const bridged = useRef(false);

  useEffect(() => {
    if (bridged.current) return;
    bridged.current = true;

    // Expose modal on window so swap page can call open()
    (window as unknown as Record<string, unknown>).__appkit_modal = modal;

    // Listen for open requests from swap page
    window.addEventListener("open-appkit-modal", () => modal.open());

    // Forward account changes to swap page
    modal.subscribeAccount((acc: { address?: string; isConnected: boolean }) => {
      window.dispatchEvent(new CustomEvent("appkit-account-changed", { detail: acc }));
    });
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
