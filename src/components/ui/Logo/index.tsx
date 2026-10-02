import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function AxionixLogo({ size = 16, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M10 2L17.5 6.33V13.67L10 18L2.5 13.67V6.33L10 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 2V10M10 10L17.5 13.67M10 10L2.5 13.67"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
    </svg>
  );
}
