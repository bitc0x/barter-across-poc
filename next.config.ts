import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // These packages are installed at Vercel deploy time and should not be bundled
  serverExternalPackages: [
    "@reown/appkit",
    "@reown/appkit-adapter-wagmi",
    "wagmi",
    "viem",
    "@tanstack/react-query",
  ],
};
export default nextConfig;
