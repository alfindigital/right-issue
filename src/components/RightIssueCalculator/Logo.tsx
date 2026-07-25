import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  color?: string;
  /** Show branded rounded backdrop behind the mark (primary palette). */
  badge?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 24,
  className = "",
  withText = false,
  color,
  badge = false,
}) => {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lotmetrik logo"
      className="shrink-0 block"
    >
      {/* Three ascending bars — lot + metric */}
      <rect x="2" y="15" width="4" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="10" width="4" height="11" rx="1" fill="currentColor" />
      {/* Tallest bar + upward arrow */}
      <path d="M14 10 H16 V21 H20 V10 H22 L18 2 L14 10 Z" fill="currentColor" />
    </svg>
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 leading-none align-middle ${
        color ? "" : "text-primary dark:text-white"
      } ${className}`}
      style={color ? { color } : undefined}
    >
      {badge ? (
        <span
          className="inline-flex items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/25 backdrop-blur-sm"
          style={{ width: size + 10, height: size + 10 }}
        >
          {mark}
        </span>
      ) : (
        mark
      )}
      {withText && (
        <span className="font-bold text-sm tracking-tight leading-none">
          Lotmetrik
        </span>
      )}
    </span>
  );
};

export default Logo;
