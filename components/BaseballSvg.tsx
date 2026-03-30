export function BaseballIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  const s = "#cc1111";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ball body */}
      <circle cx="24" cy="24" r="22" fill="white" stroke="#e0e0e0" strokeWidth="0.5" />

      {/* Left seam — curved C shape */}
      <path
        d="M17 3C11 7.5 7.5 14 7.5 24C7.5 34 11 40.5 17 45"
        stroke={s}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right seam — mirrored C shape */}
      <path
        d="M31 3C37 7.5 40.5 14 40.5 24C40.5 34 37 40.5 31 45"
        stroke={s}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left seam V-stitches — paired lines straddling the seam */}
      {/* Each stitch is two short lines forming a V across the seam */}
      <line x1="13"  y1="6"   x2="16"  y2="7.5"  stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="13"  y1="9"   x2="16"  y2="7.5"  stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="10"  y1="11"  x2="13"  y2="12.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="10"  y1="14"  x2="13"  y2="12.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="8.5" y1="17"  x2="11.5" y2="18.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="8.5" y1="20"  x2="11.5" y2="18.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="8"   y1="22"  x2="11"  y2="24"   stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="8"   y1="26"  x2="11"  y2="24"   stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="8.5" y1="28"  x2="11.5" y2="29.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="8.5" y1="31"  x2="11.5" y2="29.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="10"  y1="34"  x2="13"  y2="35.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="10"  y1="37"  x2="13"  y2="35.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="13"  y1="39"  x2="16"  y2="40.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="13"  y1="42"  x2="16"  y2="40.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      {/* Right seam V-stitches — mirrored */}
      <line x1="35"  y1="6"   x2="32"  y2="7.5"  stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="35"  y1="9"   x2="32"  y2="7.5"  stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="38"  y1="11"  x2="35"  y2="12.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="38"  y1="14"  x2="35"  y2="12.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="39.5" y1="17" x2="36.5" y2="18.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="39.5" y1="20" x2="36.5" y2="18.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="40"  y1="22"  x2="37"  y2="24"   stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="40"  y1="26"  x2="37"  y2="24"   stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="39.5" y1="28" x2="36.5" y2="29.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="39.5" y1="31" x2="36.5" y2="29.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="38"  y1="34"  x2="35"  y2="35.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="38"  y1="37"  x2="35"  y2="35.5" stroke={s} strokeWidth="1" strokeLinecap="round" />

      <line x1="35"  y1="39"  x2="32"  y2="40.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
      <line x1="35"  y1="42"  x2="32"  y2="40.5" stroke={s} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function BaseballDiamond({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Diamond shape */}
      <path
        d="M16 2L30 16L16 30L2 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      {/* Base paths */}
      <path
        d="M16 22L22 16L16 10L10 16Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      {/* Bases */}
      <rect x="14.5" y="20.5" width="3" height="3" fill="currentColor" opacity="0.6" transform="rotate(45 16 22)" />
      <rect x="14.5" y="8.5" width="3" height="3" fill="currentColor" opacity="0.6" transform="rotate(45 16 10)" />
      <rect x="8.5" y="14.5" width="3" height="3" fill="currentColor" opacity="0.6" transform="rotate(45 10 16)" />
      <rect x="20.5" y="14.5" width="3" height="3" fill="currentColor" opacity="0.6" transform="rotate(45 22 16)" />
    </svg>
  );
}

export function BaseballSeams({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="8"
      viewBox="0 0 400 8"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 4C20 2 40 6 60 4C80 2 100 6 120 4C140 2 160 6 180 4C200 2 220 6 240 4C260 2 280 6 300 4C320 2 340 6 360 4C380 2 400 6 400 4"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
      />
      {/* Stitch marks */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={i}
          x1={i * 20 + 10}
          y1="2"
          x2={i * 20 + 10}
          y2="6"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.1"
        />
      ))}
    </svg>
  );
}
