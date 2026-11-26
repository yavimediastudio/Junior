import React, { useState, useEffect } from 'react';
import { TopScorerProfile } from '../types/football';
import { getScorerInitials } from '../utils/topScorersLogic';

interface ScorerPortraitProps {
  scorer: Pick<
    TopScorerProfile,
    'id' | 'rank' | 'name' | 'countryCode' | 'eraBucket' | 'photoUrl'
  >;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ScorerPortraitProps['size']>, string> = {
  sm: 'w-11 h-11 rounded-lg',
  md: 'w-13 h-13 sm:w-14 sm:h-14 rounded-xl',
  lg: 'w-20 h-24 rounded-xl',
  xl: 'w-28 h-32 sm:w-32 sm:h-36 rounded-xl',
};

const ERA_PALETTE: Record<
  TopScorerProfile['eraBucket'],
  { bgFrom: string; bgTo: string; stripeA: string; stripeB: string; accent: string }
> = {
  '1948-1979': {
    bgFrom: '#1f1b18',
    bgTo: '#0f1116',
    stripeA: '#991b1b',
    stripeB: '#e7e5e4',
    accent: '#d97706',
  },
  '1980-1999': {
    bgFrom: '#171c2b',
    bgTo: '#0b0f19',
    stripeA: '#b91c1c',
    stripeB: '#f1f5f9',
    accent: '#f59e0b',
  },
  '2000-2014': {
    bgFrom: '#181826',
    bgTo: '#090d16',
    stripeA: '#dc2626',
    stripeB: '#f8fafc',
    accent: '#ef4444',
  },
  '2015-2026': {
    bgFrom: '#1a1423',
    bgTo: '#090d16',
    stripeA: '#e11d48',
    stripeB: '#ffffff',
    accent: '#fbbf24',
  },
};

export const ScorerPortrait: React.FC<ScorerPortraitProps> = ({
  scorer,
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [scorer.photoUrl, scorer.id]);

  const showPhoto = Boolean(scorer.photoUrl) && !imgFailed;
  const initials = getScorerInitials(scorer.name);
  const palette = ERA_PALETTE[scorer.eraBucket];
  const gradId = `portrait-bg-${scorer.id}-${size}`;
  const clipId = `portrait-jersey-${scorer.id}-${size}`;

  if (showPhoto && scorer.photoUrl) {
    return (
      <div
        className={`relative overflow-hidden shrink-0 bg-slate-900 border border-slate-700/80 ${SIZE_CLASSES[size]} ${className}`}
      >
        <img
          src={scorer.photoUrl}
          alt={`Fotografía de ${scorer.name}`}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-[50%_20%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none"
        />
      </div>
    );
  }

  // Museum-grade Editorial Archival Portrait (SVG) for players without public photo
  return (
    <div
      className={`relative overflow-hidden shrink-0 border border-slate-700/80 select-none ${SIZE_CLASSES[size]} ${className}`}
      role="img"
      aria-label={`Retrato editorial de archivo de ${scorer.name}`}
    >
      <svg
        viewBox="0 0 120 140"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.bgFrom} />
            <stop offset="100%" stopColor={palette.bgTo} />
          </linearGradient>
          <clipPath id={clipId}>
            <path d="M18 140 C20 104 38 92 60 92 C82 92 100 104 102 140 Z" />
          </clipPath>
        </defs>

        {/* Archival dark backdrop */}
        <rect width="120" height="140" fill={`url(#${gradId})`} />

        {/* Subtle curatorial framing border */}
        <rect
          x="5"
          y="5"
          width="110"
          height="130"
          rx="6"
          fill="none"
          stroke={palette.accent}
          strokeOpacity="0.22"
          strokeWidth="1"
        />

        {/* Soft studio halo behind bust */}
        <circle cx="60" cy="54" r="32" fill={palette.stripeA} fillOpacity="0.14" />

        {/* Classic athlete head & neck silhouette */}
        <circle cx="60" cy="50" r="20" fill="#cbd5e1" fillOpacity="0.20" />
        <rect x="52" y="68" width="16" height="24" rx="5" fill="#cbd5e1" fillOpacity="0.18" />

        {/* Rojiblanco striped jersey torso */}
        <g clipPath={`url(#${clipId})`}>
          <rect x="16" y="90" width="88" height="52" fill={palette.stripeB} fillOpacity="0.82" />
          {[22, 38, 54, 70, 86].map((x) => (
            <rect
              key={x}
              x={x}
              y="90"
              width="8"
              height="52"
              fill={palette.stripeA}
              fillOpacity="0.90"
            />
          ))}
          {/* Navy collar V-accent */}
          <polygon points="48,92 60,104 72,92" fill="#0f172a" />
        </g>

        {/* Monogram initials centered over archival bust */}
        <text
          x="60"
          y="57"
          textAnchor="middle"
          fill="#f8fafc"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="800"
          fontSize="22"
          letterSpacing="1.5"
        >
          {initials}
        </text>

        {/* Top-left rank stamp & top-right country code for larger portrait slots */}
        {(size === 'lg' || size === 'xl') && (
          <>
            <text
              x="12"
              y="20"
              fill={palette.accent}
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              fontSize="10"
            >
              #{String(scorer.rank).padStart(2, '0')}
            </text>
            <text
              x="108"
              y="20"
              textAnchor="end"
              fill="#94a3b8"
              fontFamily="ui-monospace, monospace"
              fontWeight="600"
              fontSize="9"
            >
              {scorer.countryCode}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};
