import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 24,
  className = "",
  withText = false,
  color,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={color ? { color } : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Lotmetrik logo"
        className="shrink-0"
      >
        {/* Three ascending bars — lot + metric */}
        <rect
          x="2"
          y="15"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
        />
        <rect
          x="9"
          y="10"
          width="4"
          height="11"
          rx="1"
          fill="currentColor"
        />
        {/* Tallest bar + upward arrow */}
        <path
          d="M14 10 H16 V21 H20 V10 H22 L18 2 L14 10 Z"
          fill="currentColor"
        />
      </svg>
      {withText && (
        <span className="font-bold text-sm tracking-tight">
          RI Calc
        </span>
      )}
    </span>
  );
};

export default Logo;
