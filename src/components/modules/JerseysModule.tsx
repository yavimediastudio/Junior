import React, { useState } from 'react';
import {
  Shirt,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  RotateCw,
} from 'lucide-react';
import { KITS_DATA } from '../../data/juniorData';
import { CustomJerseyConfig, KitJersey } from '../../types/football';

export const JerseysModule: React.FC = () => {
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
    <section id="uniformes" className="py-16 bg-slate-900/60 border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <Shirt className="w-4 h-4 text-red-500" />
              <span>Módulo 4 · Indumentaria & Patrimonio</span>
              <span aria-hidden="true">·</span>
              <span>100 Años de Rojiblanco</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/image_82370351.png"
                alt="Escudo Oficial Junior"
                className="w-10 h-10 object-contain shrink-0 drop-shadow-md"
              />
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
                Uniformes Históricos & Diseñador Oficial
              </h2>
            </div>
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
                    <clipPath id="jerseyClipModule">
                      <path d="M70,30 L115,55 C125,50 140,48 150,48 C160,48 175,50 185,55 L230,30 L275,100 L240,125 L230,110 L230,335 C230,345 220,350 210,350 L90,350 C80,350 70,345 70,335 L70,110 L60,125 L25,100 Z" />
                    </clipPath>

                    <pattern
                      id="stripesPatternClassicMod"
                      width="32"
                      height="360"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width="16" height="360" fill="#D62027" />
                      <rect x="16" width="16" height="360" fill="#FFFFFF" />
                    </pattern>

                    <pattern
                      id="stripesPatternBoldMod"
                      width="50"
                      height="360"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width="25" height="360" fill="#D62027" />
                      <rect x="25" width="25" height="360" fill="#FFFFFF" />
                    </pattern>

                    <pattern
                      id="stripesPatternCentenaryMod"
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
                  <g clipPath="url(#jerseyClipModule)">
                    {config.stripesStyle === 'away_navy' ? (
                      <rect width="300" height="360" fill="#081D40" />
                    ) : config.stripesStyle === 'bold' ? (
                      <rect width="300" height="360" fill="url(#stripesPatternBoldMod)" />
                    ) : config.stripesStyle === 'centenary' ? (
                      <rect width="300" height="360" fill="url(#stripesPatternCentenaryMod)" />
                    ) : (
                      <rect width="300" height="360" fill="url(#stripesPatternClassicMod)" />
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
                          <path
                            d="M0,0 L36,0 L36,25 C36,40 18,50 18,50 C18,50 0,40 0,25 Z"
                            fill="#081D40"
                            stroke="#FFB800"
                            strokeWidth="2"
                          />
                          <g transform="translate(4, 18)">
                            <rect x="0" y="0" width="5" height="18" fill="#D62027" />
                            <rect x="5" y="0" width="5" height="18" fill="#FFFFFF" />
                            <rect x="10" y="0" width="5" height="18" fill="#D62027" />
                            <rect x="15" y="0" width="5" height="18" fill="#FFFFFF" />
                            <rect x="20" y="0" width="5" height="18" fill="#D62027" />
                            <rect x="25" y="0" width="5" height="18" fill="#FFFFFF" />
                          </g>
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
                              ★ CAMPEÓN
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
                          fill="#FFFFFF"
                          fontSize="20"
                          fontWeight="900"
                          letterSpacing="4"
                          textAnchor="middle"
                          stroke="#081D40"
                          strokeWidth="3"
                          paintOrder="stroke fill"
                          fontFamily="sans-serif"
                        >
                          {config.name.toUpperCase() || 'JUNIOR'}
                        </text>

                        {/* Player Dorsal Number */}
                        <text
                          x="150"
                          y="225"
                          fill="#081D40"
                          fontSize="105"
                          fontWeight="900"
                          textAnchor="middle"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        >
                          {config.number || '10'}
                        </text>

                        {/* 12 Golden Stars over collar */}
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
                        >
                          ÁGUILA
                        </text>
                      </>
                    )}

                    {/* V-Neck Collar */}
                    <path
                      d="M115,55 C125,75 140,82 150,82 C160,82 175,75 185,55 Z"
                      fill="#081D40"
                      stroke="#FFB800"
                      strokeWidth="3"
                    />
                    <path
                      d="M125,58 C135,72 145,76 150,76 C155,76 165,72 175,58"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Quick Presets of Club Legends */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Dorsales Legendarios de Junior:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPreset('BACCA', '70', 'classic')}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
                >
                  Bacca #70 (2023)
                </button>
                <button
                  onClick={() => applyPreset('VALENCIANO', '9', 'classic')}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
                >
                  Valenciano #9 (1993)
                </button>
                <button
                  onClick={() => applyPreset('VALDERRAMA', '10', 'bold')}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
                >
                  El Pibe #10 (1993)
                </button>
                <button
                  onClick={() => applyPreset('TEO', '29', 'bold')}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
                >
                  Teo #29 (2018)
                </button>
                <button
                  onClick={() => applyPreset('VIERA', '1', 'away_navy')}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
                >
                  Viera #1 (Capitán)
                </button>
                <button
                  onClick={() => applyPreset('DÍAZ', '23', 'classic')}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-red-500 transition-colors"
                >
                  L. Díaz #23 (2018)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Customizer Controls (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-500 block mb-1">
                Personalización
              </span>
              <h3 className="font-display text-2xl font-bold uppercase text-white tracking-tight">
                Tu Armadura Rojiblanca
              </h3>
            </div>

            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Nombre en el Dorsal
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={config.name}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))
                  }
                  placeholder="TU APELLIDO"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono font-bold tracking-wider focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Number Input */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Número de Dorsal (0 - 99)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={config.number}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 2);
                    setConfig((prev) => ({ ...prev, number: val }));
                  }}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono font-bold text-lg focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Stripes Style Switcher */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Estilo de Franjas Rojiblancas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, stripesStyle: 'classic' }))}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all text-left ${
                      config.stripesStyle === 'classic'
                        ? 'bg-red-950/60 border-red-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Clásica Tradicional
                  </button>
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, stripesStyle: 'bold' }))}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all text-left ${
                      config.stripesStyle === 'bold'
                        ? 'bg-red-950/60 border-red-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Franja Ancha Campeón
                  </button>
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, stripesStyle: 'centenary' }))}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all text-left ${
                      config.stripesStyle === 'centenary'
                        ? 'bg-red-950/60 border-red-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Línea Dorada Centenario
                  </button>
                  <button
                    onClick={() => setConfig((prev) => ({ ...prev, stripesStyle: 'away_navy' }))}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all text-left ${
                      config.stripesStyle === 'away_navy'
                        ? 'bg-blue-950/60 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Visitante Azul Caribe
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-300">
                    Brazalete de Capitán (C)
                  </span>
                  <input
                    type="checkbox"
                    checked={config.captainArmband}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, captainArmband: e.target.checked }))
                    }
                    className="accent-red-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-300">
                    Parche Oficial de Campeón Dimayor
                  </span>
                  <input
                    type="checkbox"
                    checked={config.leaguePatch}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, leaguePatch: e.target.checked }))
                    }
                    className="accent-red-600 rounded"
                  />
                </label>
              </div>

              {/* Copy / Share Action */}
              <button
                onClick={handleCopyCard}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/40"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Ficha de mi Camiseta'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Part 2: Historical Kits Gallery (Chronological Museum) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-500 block mb-1">
                Evolución Histórica (1924 - 2026)
              </span>
              <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                Museo Cronológico de Camisetas
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KITS_DATA.map((kit) => (
              <div
                key={kit.id}
                onClick={() => setSelectedKit(kit)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedKit.id === kit.id
                    ? 'bg-slate-900 border-red-500 shadow-xl shadow-red-950/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900 text-amber-400 border border-slate-800">
                      {kit.year}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      ★ {kit.starsCount} Estrellas
                    </span>
                  </div>

                  {kit.image && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900 h-36">
                      <img
                        src={kit.image}
                        alt={`Camiseta Junior ${kit.name}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <h4 className="font-display text-lg font-bold uppercase text-white tracking-tight mb-1">
                    {kit.name}
                  </h4>
                  <div className="text-xs text-red-400 font-semibold mb-2">
                    {kit.titleWon || kit.badge}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {kit.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block mb-1">
                    Jugadores Inolvidables:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {kit.famousPlayers.map((player) => (
                      <span
                        key={player}
                        className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px]"
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
