"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { type ReactNode, useEffect } from "react";

const PROJECT_ID = "e6ec1105c1bea07ee25e2ff2cab86514";

export default function Web3Provider({ children, cookies: _ }: { children: ReactNode; cookies: string | null }) {
  useEffect(() => {
    async function init() {
      try {
        // Dynamic imports - modules installed by Vercel at build time
        const [appkitReact, appkitWagmi, wagmiPkg, appkitNetworks] = await Promise.all([
          import(/* webpackIgnore: true */ "@reown/appkit/react" as any),
          import(/* webpackIgnore: true */ "@reown/appkit-adapter-wagmi" as any),
          import(/* webpackIgnore: true */ "wagmi" as any),
          import(/* webpackIgnore: true */ "@reown/appkit/networks" as any),
        ]);

        const { createAppKit } = appkitReact;
        const { WagmiAdapter } = appkitWagmi;
        const { cookieStorage, createStorage } = wagmiPkg;
        const networks = appkitNetworks;

        const netList = [networks.mainnet, networks.arbitrum, networks.base, networks.optimism, networks.polygon];

        const wagmiAdapter = new WagmiAdapter({
          storage: createStorage({ storage: cookieStorage }),
          ssr: false,
          projectId: PROJECT_ID,
          networks: netList,
        });

        const modal = createAppKit({
          adapters: [wagmiAdapter],
          projectId: PROJECT_ID,
          networks: netList,
          defaultNetwork: networks.mainnet,
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

        (window as any).__appkit_modal = modal;
        window.addEventListener("open-appkit-modal", () => modal.open());
        modal.subscribeAccount((acc: { address?: string; isConnected: boolean }) => {
          window.dispatchEvent(new CustomEvent("appkit-account-changed", { detail: acc }));
        });
      } catch (e) {
        console.warn("AppKit init failed:", e);
      }
    }
    init();
  }, []);

  return <>{children}</>;
}
