import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Web3Provider from "@/context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Barter x Across: Cross-Chain Swap Demo",
  description: "A partnership proposal: Across Protocol powering cross-chain swaps inside Barter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
