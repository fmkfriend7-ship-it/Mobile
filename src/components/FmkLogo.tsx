import React from 'react';

interface FmkLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export const FmkLogo: React.FC<FmkLogoProps> = ({ className = '', showWordmark = true }) => {
  return (
    <span className={`inline-flex items-center gap-3 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="8"
          fill="#09090B"
          stroke="#D4AF37"
          strokeWidth="1.5"
        />
        <path
          d="M9 11H16.5M9 11V25M9 17.5H15M18.5 25V11L23 18L27.5 11V25"
          stroke="#D4AF37"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="27.5" cy="25" r="1.4" fill="#FAFAFA" />
      </svg>
      {showWordmark && (
        <span className="font-display text-xl font-semibold tracking-wide text-[#FAFAFA]">
          FMK <span className="text-[#D4AF37]">Mobile</span>
        </span>
      )}
    </span>
  );
};
