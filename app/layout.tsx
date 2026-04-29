import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Web3Provider from "@/context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibm = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Barter x Across: Cross-Chain Swap Demo",
  description: "A partnership proposal: Across Protocol powering cross-chain swaps inside Barter's execution layer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${ibm.variable}`}>
      <body className="bg-barter-bg text-barter-text antialiased">
        <Web3Provider cookies={null}>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
