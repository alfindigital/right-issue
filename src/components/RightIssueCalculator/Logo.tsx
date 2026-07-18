import React from "react";
import logoSrc from "../../assets/lotmetrik-logo.png";

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 24, className = "", withText = false }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <img
        src={logoSrc}
        alt="lotmetrik logo"
        width={size}
        height={size}
        className="object-contain"
        loading="eager"
      />
      {withText && (
        <span className="font-bold text-sm tracking-tight">
          RI Calc
        </span>
      )}
    </span>
  );
};

export default Logo;
