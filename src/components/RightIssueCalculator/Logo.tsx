import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 24, className = '', withText = false, color }) => {
  const id = `logo-grad-${size}`;
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
          <linearGradient id={id} x1="0" y1="48" x2="48" y2="0">
            <stop offset="0%" stopColor={color || '#3b82f6'} />
            <stop offset="100%" stopColor={color || '#60a5fa'} />
          </linearGradient>
        </defs>
        {/* 3 ascending bars */}
        <rect x="6" y="30" width="8" height="14" rx="2" fill={`url(#${id})`} />
        <rect x="18" y="20" width="8" height="24" rx="2" fill={`url(#${id})`} />
        <rect x="30" y="10" width="8" height="34" rx="2" fill={`url(#${id})`} />
        {/* Arrow pointing up-right */}
        <path
          d="M32 8 L42 4 L38 14"
          stroke={color || '#60a5fa'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line
          x1="26"
          y1="18"
          x2="42"
          y2="4"
          stroke={color || '#60a5fa'}
          strokeWidth="2.5"
          strokeLinecap="round"
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
