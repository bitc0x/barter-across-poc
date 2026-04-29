import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        barter: {
          bg: "#0a0b0d",
          surface: "#111318",
          card: "#16181f",
          border: "#1e2028",
          hover: "#1c1e27",
          orange: "#FF6B35",
          "orange-dim": "#cc5528",
          muted: "#6b7280",
          text: "#e8eaf0",
          sub: "#9ca3af",
        },
        across: {
          green: "#5BF3A0",
          "green-dim": "#3dd882",
          blue: "#3B82F6",
        },
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease",
        "slide-up": "slideUp 0.35s ease",
        pulse2: "pulse2 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulse2: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
      },
    },
  },
  plugins: [],
};
export default config;
