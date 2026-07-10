import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 24, className = '', withText = false, color }) => {
  const id = `logo-grad-${size}`;
  const idSoft = `logo-grad-soft-${size}`;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={id} x1="4" y1="44" x2="44" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={color || '#2563eb'} />
            <stop offset="100%" stopColor={color || '#60a5fa'} />
          </linearGradient>
          <linearGradient id={idSoft} x1="4" y1="44" x2="44" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={color || '#3b82f6'} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color || '#60a5fa'} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* Rounded squircle backdrop */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${idSoft})`} />
        {/* Ascending bars — form implicit growth chart */}
        <rect x="10" y="28" width="6" height="12" rx="1.5" fill={`url(#${id})`} />
        <rect x="21" y="22" width="6" height="18" rx="1.5" fill={`url(#${id})`} />
        <rect x="32" y="14" width="6" height="26" rx="1.5" fill={`url(#${id})`} />
        {/* Upward trend line + arrow head */}
        <path
          d="M12 26 L23 20 L34 12"
          stroke={color || '#ffffff'}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M29 10 L36 10 L36 17"
          stroke={color || '#ffffff'}
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {withText && (
        <span className="font-bold text-sm tracking-tight" style={{ color: color || 'inherit' }}>
          RI Calc
        </span>
      )}
    </span>
  );
};

export default Logo;
