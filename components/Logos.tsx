// Barter official logo from barterswap.xyz/img/logo.svg
// Rendered as inline SVG for reliability + no external fetch
export function BarterLogoMark({ size = 28 }: { size?: number }) {
  return (
    <img
      src="https://barterswap.xyz/img/logo.svg"
      alt="Barter"
      width={size}
      height={size}
      style={{ display: "block" }}
    />
  );
}

export function BarterWordmark({ height = 20 }: { height?: number }) {
  return (
    <img
      src="https://barterswap.xyz/img/barter.svg"
      alt="Barter"
      height={height}
      style={{ display: "block", height }}
    />
  );
}

// Across official logo: teal circle with X mark
// Matches the provided brand asset exactly
export function AcrossLogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill="#5BF3A0" />
      <line x1="28" y1="28" x2="72" y2="72" stroke="#1a1a1a" strokeWidth="12" strokeLinecap="round" />
      <line x1="72" y1="28" x2="28" y2="72" stroke="#1a1a1a" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}

export function AcrossWordmarkFull({ height = 22 }: { height?: number }) {
  return (
    <div className="flex items-center gap-2">
      <AcrossLogoMark size={height} />
      <span
        className="font-semibold text-barter-text"
        style={{ fontSize: height * 0.65, lineHeight: 1 }}
      >
        Across
      </span>
    </div>
  );
}

export function BarterWordmarkFull({ height = 22 }: { height?: number }) {
  return (
    <div className="flex items-center gap-2">
      <BarterLogoMark size={height} />
      <span
        className="font-semibold text-barter-text"
        style={{ fontSize: height * 0.65, lineHeight: 1 }}
      >
        Barter
      </span>
    </div>
  );
}
