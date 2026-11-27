import React from 'react';

export const SUPPORTED_FLAG_COUNTRY_CODES = [
  'COL',
  'ARG',
  'BRA',
  'URU',
  'PAR',
  'VEN',
  'CHI',
] as const;

export type SupportedFlagCountryCode = (typeof SUPPORTED_FLAG_COUNTRY_CODES)[number];

interface NationalityFlagProps {
  countryCode: string;
  nationality: string;
  size?: 'sm' | 'md';
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'w-[18px] h-3',
  md: 'w-[22px] h-[15px]',
};

/**
 * Renders a crisp 3:2 inline SVG national flag so country flags display
 * consistently across all operating systems and browsers (including Linux and
 * Windows where Unicode regional-indicator flag emojis often fall back to text).
 */
export const NationalityFlag: React.FC<NationalityFlagProps> = ({
  countryCode,
  nationality,
  size = 'sm',
  className = '',
}) => {
  const code = countryCode.trim().toUpperCase();

  const renderArtwork = () => {
    switch (code) {
      case 'COL':
        return (
          <>
            <rect width="24" height="8" y="0" fill="#FCD116" />
            <rect width="24" height="4" y="8" fill="#003893" />
            <rect width="24" height="4" y="12" fill="#CE1126" />
          </>
        );
      case 'ARG':
        return (
          <>
            <rect width="24" height="5.34" y="0" fill="#74ACDF" />
            <rect width="24" height="5.32" y="5.34" fill="#FFFFFF" />
            <rect width="24" height="5.34" y="10.66" fill="#74ACDF" />
            <circle cx="12" cy="8" r="1.65" fill="#F6B40E" stroke="#B4690E" strokeWidth="0.35" />
          </>
        );
      case 'BRA':
        return (
          <>
            <rect width="24" height="16" fill="#009C3B" />
            <polygon points="12,1.6 22,8 12,14.4 2,8" fill="#FFDF00" />
            <circle cx="12" cy="8" r="3.45" fill="#002776" />
            <path
              d="M8.85 7.45 Q12 6.35 15.2 8.45"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </>
        );
      case 'URU':
        return (
          <>
            <rect width="24" height="16" fill="#FFFFFF" />
            <rect width="24" height="1.78" y="1.78" fill="#0038A8" />
            <rect width="24" height="1.78" y="5.33" fill="#0038A8" />
            <rect width="24" height="1.78" y="8.89" fill="#0038A8" />
            <rect width="24" height="1.78" y="12.44" fill="#0038A8" />
            <rect width="9.4" height="8.89" x="0" y="0" fill="#FFFFFF" />
            <circle cx="4.7" cy="4.45" r="2.05" fill="#FCD116" stroke="#B4690E" strokeWidth="0.4" />
          </>
        );
      case 'PAR':
        return (
          <>
            <rect width="24" height="5.34" y="0" fill="#D52B1E" />
            <rect width="24" height="5.32" y="5.34" fill="#FFFFFF" />
            <rect width="24" height="5.34" y="10.66" fill="#0038A8" />
            <circle cx="12" cy="8" r="1.55" fill="none" stroke="#007A3D" strokeWidth="0.55" />
            <circle cx="12" cy="8" r="0.65" fill="#FCD116" />
          </>
        );
      case 'VEN':
        return (
          <>
            <rect width="24" height="5.34" y="0" fill="#FCE300" />
            <rect width="24" height="5.32" y="5.34" fill="#00247D" />
            <rect width="24" height="5.34" y="10.66" fill="#CF142B" />
            <g fill="#FFFFFF">
              <circle cx="8.2" cy="8.9" r="0.48" />
              <circle cx="9.1" cy="7.9" r="0.48" />
              <circle cx="10.3" cy="7.2" r="0.48" />
              <circle cx="11.4" cy="6.85" r="0.48" />
              <circle cx="12.6" cy="6.85" r="0.48" />
              <circle cx="13.7" cy="7.2" r="0.48" />
              <circle cx="14.9" cy="7.9" r="0.48" />
              <circle cx="15.8" cy="8.9" r="0.48" />
            </g>
          </>
        );
      case 'CHI':
        return (
          <>
            <rect width="24" height="8" y="0" fill="#FFFFFF" />
            <rect width="24" height="8" y="8" fill="#D52B1E" />
            <rect width="8.5" height="8" x="0" y="0" fill="#0039A6" />
            <polygon
              points="4.25,1.8 4.82,3.45 6.55,3.45 5.15,4.45 5.68,6.1 4.25,5.08 2.82,6.1 3.35,4.45 1.95,3.45 3.68,3.45"
              fill="#FFFFFF"
            />
          </>
        );
      default:
        return (
          <>
            <rect width="24" height="16" fill="#334155" />
            <text
              x="12"
              y="10.8"
              textAnchor="middle"
              fill="#F8FAFC"
              fontSize="7"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              {code.slice(0, 3)}
            </text>
          </>
        );
    }
  };

  return (
    <span
      role="img"
      aria-label={`Bandera de ${nationality}`}
      title={nationality}
      data-flag-code={code}
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[2px] ring-1 ring-white/20 shadow-sm ${SIZE_CLASSES[size]} ${className}`}
    >
      <svg
        viewBox="0 0 24 16"
        className="w-full h-full block"
        aria-hidden="true"
        focusable="false"
      >
        {renderArtwork()}
      </svg>
    </span>
  );
};
