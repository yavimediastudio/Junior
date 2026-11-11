import React, { useState } from 'react';
import {
  Shirt,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  RotateCw,
} from 'lucide-react';
import { KITS_DATA } from '../data/juniorData';
import { CustomJerseyConfig, KitJersey } from '../types/football';

export const JerseysSection: React.FC = () => {
  const [selectedKit, setSelectedKit] = useState<KitJersey>(KITS_DATA[5]); // Default to 2023 La Décima
  const [copied, setCopied] = useState(false);

  // Customizer state
  const [config, setConfig] = useState<CustomJerseyConfig>({
    name: 'BACCA',
    number: '70',
    stripesStyle: 'classic',
    starsCount: 12,
    view: 'back',
    captainArmband: true,
    leaguePatch: true,
    collarStyle: 'v-neck',
  });

  const applyPreset = (name: string, number: string, style: 'classic' | 'thin' | 'bold' | 'centenary' | 'away_navy') => {
    setConfig((prev) => ({
      ...prev,
      name,
      number,
      stripesStyle: style,
    }));
  };

  const handleCopyCard = () => {
    navigator.clipboard?.writeText(
      `Mi Camiseta Oficial de Junior de Barranquilla: ${config.name} #${config.number} - 10 Estrellas Doradas ⭐`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="camisetas" className="py-16 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <span>Indumentaria & Patrimonio</span>
              <span aria-hidden="true">·</span>
              <span>100 Años de Rojiblanco</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Museo de Camisetas & Personalizador
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Desde el viejo Romelio Martínez en 1977 hasta la Doceava Estrella de 2026.
            Personaliza tu dorsal rojiblanco con tu nombre y número.
          </p>
        </div>

        {/* 2-Column Split: Customizer Studio (Left/Main) + Historical Gallery (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Interactive Kit Customizer Preview (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col shadow-2xl relative overflow-hidden">
            {/* Ambient lighting glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Customizer Sub-header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-red-500" />
                <span className="font-display text-lg font-bold uppercase text-white tracking-wide">
                  Taller de Diseño Rojiblanco
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      view: prev.view === 'front' ? 'back' : 'front',
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ver {config.view === 'front' ? 'Dorsal (Espalda)' : 'Frente'}</span>
                </button>
              </div>
            </div>

            {/* Dynamic SVG / Canvas Jersey Visual */}
            <div className="flex-1 flex items-center justify-center py-6">
              <div className="relative w-72 sm:w-80 h-80 sm:h-96 flex items-center justify-center drop-shadow-[0_20px_35px_rgba(214,32,39,0.18)]">
                {/* SVG Soccer Jersey */}
                <svg
                  viewBox="0 0 300 360"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <clipPath id="jerseyClip">
                      {/* Authentic soccer jersey silhouette */}
                      <path d="M70,30 L115,55 C125,50 140,48 150,48 C160,48 175,50 185,55 L230,30 L275,100 L240,125 L230,110 L230,335 C230,345 220,350 210,350 L90,350 C80,350 70,345 70,335 L70,110 L60,125 L25,100 Z" />
                    </clipPath>

                    {/* Gradient patterns for stripes */}
                    <pattern
                      id="stripesPatternClassic"
                      width="32"
                      height="360"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width="16" height="360" fill="#D62027" />
                      <rect x="16" width="16" height="360" fill="#FFFFFF" />
                    </pattern>

                    <pattern
                      id="stripesPatternBold"
                      width="50"
                      height="360"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width="25" height="360" fill="#D62027" />
                      <rect x="25" width="25" height="360" fill="#FFFFFF" />
                    </pattern>

                    <pattern
                      id="stripesPatternCentenary"
                      width="34"
                      height="360"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width="17" height="360" fill="#D62027" />
                      <rect x="17" width="17" height="360" fill="#FFFFFF" />
                      <line x1="17" y1="0" x2="17" y2="360" stroke="#FFB800" strokeWidth="2" />
                    </pattern>
                  </defs>

                  {/* Jersey Body Fill based on selected style */}
                  <g clipPath="url(#jerseyClip)">
                    {config.stripesStyle === 'away_navy' ? (
                      <rect width="300" height="360" fill="#081D40" />
                    ) : config.stripesStyle === 'bold' ? (
                      <rect width="300" height="360" fill="url(#stripesPatternBold)" />
                    ) : config.stripesStyle === 'centenary' ? (
                      <rect width="300" height="360" fill="url(#stripesPatternCentenary)" />
                    ) : (
                      <rect width="300" height="360" fill="url(#stripesPatternClassic)" />
                    )}

                    {/* Sleeves Accents */}
                    <path
                      d="M25,100 L70,30 L115,55 L80,120 Z"
                      fill={config.stripesStyle === 'away_navy' ? '#081D40' : '#D62027'}
                      opacity="0.95"
                    />
                    <path
                      d="M275,100 L230,30 L185,55 L220,120 Z"
                      fill={config.stripesStyle === 'away_navy' ? '#081D40' : '#D62027'}
                      opacity="0.95"
                    />

                    {/* Sleeve Cuffs */}
                    <path d="M25,100 L60,125" stroke="#081D40" strokeWidth="10" />
                    <path d="M275,100 L240,125" stroke="#081D40" strokeWidth="10" />

                    {/* Captain Armband on left arm if enabled */}
                    {config.captainArmband && (
                      <g>
                        <rect x="35" y="80" width="30" height="18" fill="#FFB800" rx="3" transform="rotate(35 50 90)" />
                        <text x="47" y="93" fill="#081D40" fontSize="13" fontWeight="900" textAnchor="middle" transform="rotate(35 50 90)">
                          C
                        </text>
                      </g>
                    )}

                    {/* FRONT VIEW ELEMENTS */}
                    {config.view === 'front' && (
                      <>
                        {/* Junior Crest on Chest */}
                        <g transform="translate(190, 85)">
                          {/* Crest Base Shield */}
                          <path
                            d="M0,0 L36,0 L36,25 C36,40 18,50 18,50 C18,50 0,40 0,25 Z"
                            fill="#081D40"
                            stroke="#FFB800"
                            strokeWidth="2"
                          />
                          {/* Mini Stripes in crest */}
                          <g transform="translate(4, 18)">
                            <rect x="0" y="0" width="5" height="18" fill="#D62027" />
                            <rect x="5" y="0" width="5" height="18" fill="#FFFFFF" />
                            <rect x="10" y="0" width="5" height="18" fill="#D62027" />
                            <rect x="15" y="0" width="5" height="18" fill="#FFFFFF" />
                            <rect x="20" y="0" width="5" height="18" fill="#D62027" />
                            <rect x="25" y="0" width="5" height="18" fill="#FFFFFF" />
                          </g>
                          {/* Stars above crest */}
                          <text x="18" y="-5" fill="#FFB800" fontSize="9" fontWeight="900" textAnchor="middle">
                            {'★'.repeat(Math.min(5, config.starsCount))}
                          </text>
                        </g>

                        {/* Sponsor Banner */}
                        <g transform="translate(150, 195)">
                          <rect
                            x="-65"
                            y="-16"
                            width="130"
                            height="32"
                            rx="5"
                            fill="#081D40"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                          <text
                            x="0"
                            y="5"
                            fill="#FFFFFF"
                            fontSize="14"
                            fontWeight="900"
                            letterSpacing="2"
                            textAnchor="middle"
                            fontFamily="sans-serif"
                          >
                            OLÍMPICA
                          </text>
                        </g>

                        {/* Secondary sponsor */}
                        <text
                          x="150"
                          y="245"
                          fill={config.stripesStyle === 'away_navy' ? '#FFFFFF' : '#081D40'}
                          fontSize="10"
                          fontWeight="800"
                          letterSpacing="3"
                          textAnchor="middle"
                        >
                          TECNOGLASS
                        </text>

                        {/* League Patch */}
                        {config.leaguePatch && (
                          <g transform="translate(236, 105)">
                            <circle cx="10" cy="10" r="11" fill="#FFB800" stroke="#FFFFFF" strokeWidth="1.5" />
                            <text x="10" y="14" fill="#081D40" fontSize="8" fontWeight="bold" textAnchor="middle">
                              CAMPEÓN
                            </text>
                          </g>
                        )}
                      </>
                    )}

                    {/* BACK VIEW ELEMENTS */}
                    {config.view === 'back' && (
                      <>
                        {/* Player Name */}
                        <text
                          x="150"
                          y="110"
                          fill={config.stripesStyle === 'away_navy' ? '#FFFFFF' : '#081D40'}
                          fontSize="22"
                          fontWeight="900"
                          letterSpacing="4"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                          stroke="#FFFFFF"
                          strokeWidth="1"
                        >
                          {config.name.toUpperCase() || 'JUNIOR'}
                        </text>

                        {/* Big Dorsal Number */}
                        <text
                          x="150"
                          y="225"
                          fill={config.stripesStyle === 'away_navy' ? '#FFFFFF' : '#081D40'}
                          fontSize="92"
                          fontWeight="900"
                          textAnchor="middle"
                          fontFamily="'Barlow Condensed', sans-serif"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        >
                          {config.number || '10'}
                        </text>

                        {/* 10 Golden Stars over collar */}
                        <text
                          x="150"
                          y="78"
                          fill="#FFB800"
                          fontSize="10"
                          fontWeight="900"
                          letterSpacing="1"
                          textAnchor="middle"
                        >
                          {'★ '.repeat(config.starsCount).trim()}
                        </text>

                        {/* Subtle bottom sponsor */}
                        <text
                          x="150"
                          y="320"
                          fill={config.stripesStyle === 'away_navy' ? '#FFFFFF' : '#081D40'}
                          fontSize="9"
                          fontWeight="800"
                          letterSpacing="3"
                          textAnchor="middle"
                          opacity="0.8"
                        >
                          CERVEZA ÁGUILA
                        </text>
                      </>
                    )}

                    {/* Collar Trim */}
                    <path
                      d="M115,55 C125,75 140,82 150,82 C160,82 175,75 185,55 Z"
                      fill="#081D40"
                    />
                    <path
                      d="M125,58 C135,72 145,76 150,76 C155,76 165,72 175,58"
                      stroke="#FFB800"
                      strokeWidth="3"
                      fill="none"
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Customizer Interactive Form Controls */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              {/* Presets Quick Pick */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Atajos de Leyendas:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('BACCA', '70', 'classic')}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                  >
                    Bacca #70 (La Décima)
                  </button>
                  <button
                    onClick={() => applyPreset('VALDERRAMA', '10', 'bold')}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                  >
                    El Pibe #10 (1993)
                  </button>
                  <button
                    onClick={() => applyPreset('VALENCIANO', '9', 'bold')}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                  >
                    El Bombardero #9 (166 Goles)
                  </button>
                  <button
                    onClick={() => applyPreset('TEO', '29', 'classic')}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                  >
                    Teófilo #29 (El Perfume)
                  </button>
                </div>
              </div>

              {/* Name & Number Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jersey-name" className="text-xs font-medium text-slate-300 block mb-1">
                    Nombre en Espalda
                  </label>
                  <input
                    id="jersey-name"
                    type="text"
                    maxLength={14}
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="TU APELLIDO"
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="jersey-number" className="text-xs font-medium text-slate-300 block mb-1">
                    Dorsal (Número)
                  </label>
                  <input
                    id="jersey-number"
                    type="text"
                    maxLength={2}
                    value={config.number}
                    onChange={(e) => setConfig({ ...config, number: e.target.value.replace(/\D/g, '') })}
                    placeholder="10"
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Stripes Style Selector */}
              <div>
                <span className="text-xs font-medium text-slate-300 block mb-1">
                  Estilo de Bastones / Color
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'classic', label: 'Clásica (9)' },
                    { id: 'bold', label: 'Ancha (1993)' },
                    { id: 'centenary', label: 'Centenario' },
                    { id: 'away_navy', label: 'Azul Visitante' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setConfig({ ...config, stripesStyle: s.id as any })}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        config.stripesStyle === s.id
                          ? 'border-red-500 bg-red-950/40 text-white font-semibold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.captainArmband}
                    onChange={(e) => setConfig({ ...config, captainArmband: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0"
                  />
                  <span>Brazalete Capitán (C)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.leaguePatch}
                    onChange={(e) => setConfig({ ...config, leaguePatch: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0"
                  />
                  <span>Parche de Campeón</span>
                </label>

                <button
                  onClick={handleCopyCard}
                  className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Compartir Camiseta'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Historical Kits Catalog (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                    Reliquias & Camisetas de Título
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">{KITS_DATA.length} Modelos</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Selecciona una camiseta histórica para descubrir los detalles del torneo que conquistó y los héroes que sudaron sus franjas.
              </p>
            </div>

            {/* Selected Kit Showcase Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-red-400">
                    Temporada {selectedKit.year}
                  </div>
                  <h4 className="font-display text-xl font-bold text-white uppercase mt-0.5">
                    {selectedKit.name}
                  </h4>
                </div>
                {selectedKit.titleWon && (
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
                    ★ {selectedKit.titleWon}
                  </span>
                )}
              </div>

              {selectedKit.image && (
                <div className="rounded-xl overflow-hidden border border-slate-800 max-h-48">
                  <img
                    src={selectedKit.image}
                    alt={selectedKit.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {selectedKit.description}
              </p>

              <div className="pt-3 border-t border-slate-800/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Patrocinador Épico:</span>
                  <span className="font-medium text-slate-200">{selectedKit.sponsor}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Héroes Insignia:</span>
                  <span className="font-medium text-slate-200">
                    {selectedKit.famousPlayers.slice(0, 2).join(', ')}
                  </span>
                </div>
                <div className="pt-2 text-[11px] text-slate-400 italic">
                  &quot;{selectedKit.historicalNotes}&quot;
                </div>
              </div>
            </div>

            {/* Thumbnails List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              {KITS_DATA.map((kit) => (
                <button
                  key={kit.id}
                  onClick={() => setSelectedKit(kit)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedKit.id === kit.id
                      ? 'bg-red-950/50 border-red-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="font-mono text-[11px] font-bold text-red-400">{kit.year}</div>
                  <div className="font-display text-xs font-bold uppercase truncate mt-0.5 text-slate-200">
                    {kit.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-1">
                    {kit.titleWon ? '🏆 Campeón' : kit.type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
