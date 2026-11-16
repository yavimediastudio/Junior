import React, { useState } from 'react';
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Star,
  Calendar,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export interface HistoricalCrestEra {
  id: string;
  period: string;
  shortPeriod: string;
  eraTitle: string;
  subtitle: string;
  image: string;
  heraldicShape: string;
  stripesDetail: string;
  typographyDetail: string;
  starsInEra: string;
  description: string;
  historicalContext: string;
  keyMilestones: string[];
  centenaryNote?: string;
}

export const HISTORICAL_CRESTS_ERAS: HistoricalCrestEra[] = [
  {
    id: 'crest-1924-1947',
    period: '1924 – 1947 (y Centenario 2024)',
    shortPeriod: '1924–1947',
    eraTitle: 'La «J» Azul Fundacional',
    subtitle: 'El emblema pionero de Juventud Infantil / Juventud Junior',
    image: '/src/assets/images/crest_1924_1947_1794764921414.jpg',
    heraldicShape: 'Monograma bordado directo sobre el pecho rojiblanco',
    stripesDetail: 'Paño fundacional rojiblanco sin división de barras heráldicas',
    typographyDetail: 'Letra «J» solitaria en azul rey / marino',
    starsInEra: '0 estrellas (Era Amateur y Liga del Atlántico)',
    description:
      'El primer escudo que portó el Junior desde su fundación el 7 de agosto de 1924 y que mantuvo hasta 1947 fue simplemente la letra «J» en color azul sobre el pecho de la camiseta.',
    historicalContext:
      'Bajo esta insignia nacieron los títulos amateurs de Tercera División (1926), Segunda División (1927) y Liga de Fútbol del Atlántico (1932), además de la época gloriosa de Roberto «El Flaco» Meléndez en el Estadio Moderno.',
    keyMilestones: [
      '7 de agosto de 1924: Fundación de Juventud Infantil por Micaela Lavalle de Mejía.',
      '1926–1932: Ascenso imparable y campeón de Primera Categoría del Atlántico (1932).',
      '2024: El club recuperó oficialmente la histórica «J» azul en la camiseta conmemorativa del Centenario.',
    ],
    centenaryNote: 'Recuperado oficialmente en 2024 por los 100 años del club.',
  },
  {
    id: 'crest-1948-1950',
    period: '1948 – 1950',
    shortPeriod: '1948–1950',
    eraTitle: 'Escudo Suizo de Cuatro Franjas',
    subtitle: 'El blasón del debut profesional y el primer subcampeonato',
    image: '/src/assets/images/crest_1948_1950_1794764923304.jpg',
    heraldicShape: 'Escudo de forma suiza clásica',
    stripesDetail: 'Dividido verticalmente en 4 franjas: dos rojas y dos blancas alternadas',
    typographyDetail: 'Sin texto ni franja nominativa',
    starsInEra: '0 estrellas (Subcampeón 1948)',
    description:
      'Con el ingreso al fútbol profesional colombiano en 1948, Junior estrenó un escudo de forma suiza dividido exclusivamente en cuatro franjas verticales iguales: dos rojas y dos blancas.',
    historicalContext:
      'Fue el escudo que lució el cuadro barranquillero bajo la dirección de Roberto Meléndez en el Campeonato Inaugural de 1948 (2.º puesto detrás de Santa Fe) y en el estreno de la época de El Dorado con el «Caimán» Sánchez y los astros brasileños.',
    keyMilestones: [
      '15 de agosto de 1948: Debut profesional 2-0 ante Deportivo Cali en el Romelio Martínez.',
      '31 de octubre de 1948: Goleada histórica 8-3 a Independiente Medellín.',
      '1948: Primer Subcampeón del fútbol profesional colombiano (23 pts en 18 fechas).',
    ],
  },
  {
    id: 'crest-1951-1956',
    period: '1951 – 1956',
    shortPeriod: '1951–1956',
    eraTitle: 'Escudo Rojiblanco con Nombre «JUNIOR»',
    subtitle: 'Identidad tipográfica en plena era de El Dorado',
    image: '/src/assets/images/crest_1951_1956_1794764923806.jpg',
    heraldicShape: 'Escudo de forma suiza',
    stripesDetail: 'Franjas verticales rojas (gules) y blancas (plata) continuas',
    typographyDetail: 'Se añade en medio del escudo el nombre oficial: «JUNIOR»',
    starsInEra: '0 estrellas (Era El Dorado y Receso 1954–1965)',
    description:
      'En 1951 el club dio un salto de identidad visual al incorporar el nombre «JUNIOR» en medio del escudo suizo rojiblanco, identificando inequívocamente la divisa currambera en todo el país.',
    historicalContext:
      'Este emblema acompañó a la nómina de «Los Miuras» durante los campeonatos de 1951, 1952 (con Carlos Gambina y Raúl Di Marco) y 1953 antes de la pausa administrativa de 12 años en Primera División.',
    keyMilestones: [
      '1951: Incorporación oficial de la leyenda «JUNIOR» al centro del blasón.',
      '1952: 6.º puesto en El Dorado con Carlos Alberto Gambina Botín de Plata (18 goles).',
      '1954–1965: Permanencia de la divisa en el torneo departamental aficionado del Atlántico.',
    ],
  },
  {
    id: 'crest-1957-1979',
    period: '1957 – 1979',
    shortPeriod: '1957–1979',
    eraTitle: 'Blasón Clásico de 9 Barras y 1.ª Estrella',
    subtitle: 'Nace la arquitectura 6:8 vigente y la estrella de 1977',
    image: '/src/assets/images/crest_1957_1979_1794764923724.jpg',
    heraldicShape: 'Forma suiza en proporción 6 de ancho por 8 de alto',
    stripesDetail: 'Campo inferior con 9 barras verticales (5 gules rojas y 4 plata blancas)',
    typographyDetail: 'Jefe superior azul oscuro dedicado a las estrellas (sin banda de texto aún)',
    starsInEra: '0 estrellas (1957–1976) → 1 Estrella en 1977 ★',
    description:
      'Desde 1957 se consolidó la estructura definitiva del escudo del Junior en proporción 6:8 con jefe azul oscuro y nueve barras verticales alternadas (cinco rojas y cuatro blancas, comenzando y terminando en rojo).',
    historicalContext:
      'Con este diseño regresó Junior a Primera División en 1966 junto a Dida y Garrincha, debutó en Copa Libertadores (1971), sumó los Botines de Oro de Silva Pacheco (1973) y Ephanor (1974), y bordó su primera estrella de cinco puntas el 14 de diciembre de 1977.',
    keyMilestones: [
      '1957: Adopción de las 9 barras verticales gules y plata bajo jefe azul marino.',
      '1966: Regreso a Primera División tras 13 años con los cracks brasileños.',
      '14 de diciembre de 1977: Conquista de la 1.ª Estrella en El Campín con «La Bruja» Verón (DT).',
    ],
  },
  {
    id: 'crest-1980-2026',
    period: '1980 – 2026 (Actualidad ★12)',
    shortPeriod: '1980–2026',
    eraTitle: 'Emblema Moderno con «JUNIOR» y 12 Estrellas',
    subtitle: 'El escudo contemporáneo del Bicampeón 2025-II & 2026-I',
    image: '/src/assets/images/crest_1980_2026_1794764923697.jpg',
    heraldicShape: 'Forma suiza 6:8 con doble franja horizontal azul oscuro',
    stripesDetail: '9 barras verticales gules y plata (5 rojas, 4 blancas)',
    typographyDetail: 'Franja horizontal azul superpuesta con «JUNIOR» en blanco (desde 1980)',
    starsInEra: '2 estrellas (1980) → 12 Estrellas Oficiales (2026-I) ★★★★★★★★★★★★',
    description:
      'En 1980, año de la segunda estrella, se reincorporó la franja horizontal azul oscuro superpuesta a las barras con el nombre «JUNIOR», consolidando el escudo definitivo al que se han añadido las estrellas hasta llegar a 12 en 2026.',
    historicalContext:
      'Cada campeonato liguero ha sumado una nueva estrella plateada de cinco puntas en el jefe azul: 1980 (★2), 1993 (★3), 1995 (★4), 2004-II (★5), 2010-I (★6), 2011-II (★7), 2018-II (★8), 2019-I (★9), 2023-II (★10), 2025-II (★11) y 2026-I (★12).',
    keyMilestones: [
      '1980: Regresa el letrero «JUNIOR» en franja azul y se suma la 2.ª Estrella con Varacka.',
      '1993–2019: De la era Pibe–Valenciano al bicampeonato Comesaña (★3 a ★9).',
      '2023–2026: La Décima con Bacca y el histórico Bicampeonato 2025-II / 2026-I (★11 y ★12).',
    ],
  },
];

const STAR_PROGRESSION = [
  { star: 1, year: '1977', detail: 'Hexagonal Final · DT Juan Ramón Verón' },
  { star: 2, year: '1980', detail: 'Cuadrangular Final · DT José Varacka (Estreno franja «JUNIOR»)' },
  { star: 3, year: '1993', detail: '3-2 vs América (min. 89) · DT Julio Comesaña' },
  { star: 4, year: '1995', detail: 'Torneo Nivelación 62 pts · DT «Piscis» Restrepo' },
  { star: 5, year: '2004-II', detail: '5-5 global, 5-4 penales en Medellín · DT «Zurdo» López' },
  { star: 6, year: '2010-I', detail: '3-2 global vs La Equidad · DT Diego Umaña' },
  { star: 7, year: '2011-II', detail: '4-4 global, 4-2 penales en Manizales · DT «Cheché» Hernández' },
  { star: 8, year: '2018-II', detail: '5-4 global vs Medellín · DT Julio Comesaña' },
  { star: 9, year: '2019-I', detail: '1-1 global, 5-4 penales en Bogotá vs Pasto · Bicampeón' },
  { star: 10, year: '2023-II', detail: '4-4 global, 5-3 penales en Medellín · DT Arturo Reyes' },
  { star: 11, year: '2025-II', detail: '4-0 global vs Deportes Tolima · DT Alfredo Arias' },
  { star: 12, year: '2026-I', detail: '3-1 global vs Atlético Nacional · Bicampeón ★12' },
];

export const HistoricalCrestGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(4); // Default 1980-2026 ★12 or click any stage
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedStarCount, setSelectedStarCount] = useState<number>(12);

  const activeEra = HISTORICAL_CRESTS_ERAS[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? HISTORICAL_CRESTS_ERAS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === HISTORICAL_CRESTS_ERAS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      id="galeria-insignias"
      className="py-14 sm:py-16 bg-slate-950 border-b border-slate-800 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>Archivo Heráldico · 1924 – 2026</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">5 Etapas Oficiales</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Evolución Histórica de las Insignias del Junior
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Desde la solitaria «J» azul bordada en 1924 hasta el escudo suizo de nueve barras con las 12 estrellas plateadas de campeón en 2026, reconstruido con fidelidad documental.
          </p>
        </div>

        {/* Chronological Stage Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {HISTORICAL_CRESTS_ERAS.map((era, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={era.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`text-left px-3.5 py-2.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-950/30'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`font-mono text-[11px] font-bold tabular-nums ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    0{idx + 1} · {era.shortPeriod}
                  </span>
                </div>
                <div className="text-xs font-bold truncate">{era.eraTitle}</div>
              </button>
            );
          })}
        </div>

        {/* Main Museum Stage (12 cols) */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Showcase Image Stage (5 cols) */}
            <div className="lg:col-span-5 bg-[#091124] border-b lg:border-b-0 lg:border-r border-slate-800 p-6 sm:p-8 flex flex-col justify-between relative">
              {/* Top stage bar */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 tabular-nums">
                  Etapa {activeIndex + 1} / {HISTORICAL_CRESTS_ERAS.length} · {activeEra.period}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                  title="Ampliar insignia en alta resolución"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ampliar</span>
                </button>
              </div>

              {/* Crest Frame */}
              <div
                onClick={() => setLightboxOpen(true)}
                className="group relative aspect-square w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden border border-slate-800/90 bg-[#091124] shadow-[0_20px_50px_rgba(0,0,0,0.65)] cursor-zoom-in"
              >
                <img
                  key={activeEra.image}
                  src={activeEra.image}
                  alt={`Insignia histórica Junior de Barranquilla ${activeEra.period}: ${activeEra.eraTitle}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-200 tabular-nums">
                    {activeEra.shortPeriod}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                    Clic para inspeccionar
                  </span>
                </div>
              </div>

              {/* Prev / Next Navigation Controls */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-red-400" />
                  <span>Etapa anterior</span>
                </button>
                <div className="flex items-center gap-1.5">
                  {HISTORICAL_CRESTS_ERAS.map((era, idx) => (
                    <button
                      key={era.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Ver etapa ${era.period}`}
                      className={`h-2 rounded-full transition-all ${
                        idx === activeIndex
                          ? 'w-6 bg-red-500'
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Siguiente etapa</span>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {/* Right Documentary Panel (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{activeEra.period}</span>
                  </span>
                  {activeEra.centenaryNote && (
                    <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{activeEra.centenaryNote}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  {activeEra.eraTitle}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-red-400 mt-1">
                  {activeEra.subtitle}
                </p>

                <p className="text-sm text-slate-200 leading-relaxed mt-4">
                  {activeEra.description}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2">
                  {activeEra.historicalContext}
                </p>

                {/* Technical Heraldic Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                      Forma Heráldica
                    </div>
                    <div className="text-xs font-semibold text-slate-100">
                      {activeEra.heraldicShape}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                      Barras & Esmaltes
                    </div>
                    <div className="text-xs font-semibold text-slate-100">
                      {activeEra.stripesDetail}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                      Tipografía & Banda
                    </div>
                    <div className="text-xs font-semibold text-slate-100">
                      {activeEra.typographyDetail}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                      Estrellas en la Insignia
                    </div>
                    <div className="text-xs font-semibold text-amber-400">
                      {activeEra.starsInEra}
                    </div>
                  </div>
                </div>

                {/* Era Milestones */}
                <div className="mt-5 pt-5 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-red-400" />
                    <span>Hitos Documentados de Esta Insignia</span>
                  </div>
                  <ul className="space-y-1.5">
                    {activeEra.keyMilestones.map((m) => (
                      <li key={m} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-0.5">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Star Addition Tracker (1 to 12 Stars) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Progresión de las 12 Estrellas en el Jefe Azul (1977–2026)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                    ★ {selectedStarCount} / 12
                  </span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-3">
                  {STAR_PROGRESSION.map((item) => {
                    const active = item.star <= selectedStarCount;
                    const isExact = item.star === selectedStarCount;
                    return (
                      <button
                        key={item.star}
                        type="button"
                        onClick={() => setSelectedStarCount(item.star)}
                        className={`py-1.5 rounded-lg border text-center transition-all ${
                          isExact
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : active
                            ? 'bg-slate-900 border-amber-500/40 text-amber-400'
                            : 'bg-slate-900/40 border-slate-800 text-slate-600 hover:text-slate-300'
                        }`}
                        title={`${item.star}ª Estrella (${item.year})`}
                      >
                        <Star className={`w-3 h-3 mx-auto ${active ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span className="block font-mono text-[10px] font-bold mt-0.5 tabular-nums">
                          {item.star}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between gap-2 bg-slate-900/70 px-3 py-2 rounded-lg border border-slate-800/80">
                  <span className="font-mono font-bold text-amber-400 shrink-0 tabular-nums">
                    ★{selectedStarCount} · {STAR_PROGRESSION[selectedStarCount - 1].year}
                  </span>
                  <span className="text-slate-300 text-right">
                    {STAR_PROGRESSION[selectedStarCount - 1].detail}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 5-Era Visual Comparison Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {HISTORICAL_CRESTS_ERAS.map((era, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={era.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-slate-900 border-red-500 shadow-lg shadow-red-950/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-800 bg-[#091124] shrink-0">
                  <img
                    src={era.image}
                    alt={era.eraTitle}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-bold text-amber-400 tabular-nums">
                    {era.shortPeriod}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {era.eraTitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* High-Resolution Inspection Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                  {activeEra.period}
                </span>
                <h4 className="font-display text-lg font-black uppercase text-white">
                  {activeEra.eraTitle}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                aria-label="Cerrar vista ampliada"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#091124] p-6 flex items-center justify-center">
              <img
                src={activeEra.image}
                alt={`Insignia Junior ${activeEra.period}`}
                className="w-full max-w-[420px] aspect-square object-cover rounded-xl border border-slate-800 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>{activeEra.heraldicShape}</span>
              <span className="font-mono text-amber-400 font-bold">{activeEra.shortPeriod}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
