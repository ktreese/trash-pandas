export function BaseballIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
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
        d="M18 3.5C12 7 8 13 8 24C8 35 12 41 18 44.5"
        stroke="#cc1111"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right seam — mirrored C shape */}
      <path
        d="M30 3.5C36 7 40 13 40 24C40 35 36 41 30 44.5"
        stroke="#cc1111"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left seam stitches — perpendicular to the seam curve */}
      <line x1="14.5" y1="8"  x2="17.5" y2="10"  stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11.5" y1="13" x2="14.5" y2="14.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10"   y1="19" x2="13"   y2="19.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10"   y1="24" x2="13"   y2="24"   stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10"   y1="29" x2="13"   y2="28.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11.5" y1="34" x2="14.5" y2="33"   stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14.5" y1="39" x2="17.5" y2="37.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />

      {/* Right seam stitches */}
      <line x1="33.5" y1="8"  x2="30.5" y2="10"  stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36.5" y1="13" x2="33.5" y2="14.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="38"   y1="19" x2="35"   y2="19.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="38"   y1="24" x2="35"   y2="24"   stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="38"   y1="29" x2="35"   y2="28.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="36.5" y1="34" x2="33.5" y2="33"   stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33.5" y1="39" x2="30.5" y2="37.5" stroke="#cc1111" strokeWidth="1.2" strokeLinecap="round" />
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
