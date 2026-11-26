import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  X,
  ExternalLink,
  Shield,
  Building2,
  BarChart3,
  Globe2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Table,
  Swords,
  Shirt,
  MapPin,
  Users,
} from 'lucide-react';
import {
  CLUB_BIGGEST_SCORES,
  CLUB_CULTURAL_TOPICS,
  CLUB_GENERAL_STATS,
  CLUB_HISTORY_CHAPTERS,
  CLUB_HISTORY_INTRO,
  CLUB_INSTITUTIONAL_FACTS,
  CLUB_LANDMARK_RECORDS,
  CLUB_STADIUMS_AND_FACILITIES,
  CLUB_SYMBOLS_DATA,
  HISTORY_ERA_GROUPS,
  WIKIPEDIA_SOURCE_URL,
} from '../../data/clubHistoryData';
import {
  AppModuleId,
  HistoryChapterCategory,
  HistoryEraGroup,
  HistoryTabId,
} from '../../types/football';
import {
  filterHistoryChapters,
  getHistoryEraCounts,
} from '../../utils/historyLogic';

interface HistoryModuleProps {
  onNavigateToModule?: (moduleId: AppModuleId) => void;
}

const SECTION_TABS: Array<{
  id: HistoryTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'cronica', label: 'Historia (1924–2026)', icon: BookOpen },
  { id: 'simbolos', label: 'Símbolos e Indumentaria', icon: Shield },
  { id: 'infraestructura', label: 'Estadios y Sedes', icon: Building2 },
  { id: 'datos', label: 'Datos y Récords', icon: BarChart3 },
  { id: 'cultura', label: 'Cultura, Filiales e Influencia', icon: Globe2 },
];

const CATEGORY_OPTIONS: Array<{ id: HistoryChapterCategory; label: string }> = [
  { id: 'todas', label: 'Categoría: Todas (23)' },
  { id: 'titulo', label: 'Títulos y Estrellas (16)' },
  { id: 'fundacion', label: 'Fundación (1924)' },
  { id: 'internacional', label: 'Hitos Internacionales' },
  { id: 'crisis', label: 'Crisis y Transición' },
  { id: 'hito', label: 'Hitos Profesionales' },
];

function getCategoryLabel(cat: Exclude<HistoryChapterCategory, 'todas'>): string {
  if (cat === 'titulo') return 'Título Oficial';
  if (cat === 'fundacion') return 'Fundación';
  if (cat === 'internacional') return 'Internacional';
  if (cat === 'crisis') return 'Transición';
  return 'Hito Histórico';
}

function getCategoryTextClass(cat: Exclude<HistoryChapterCategory, 'todas'>): string {
  if (cat === 'titulo') return 'text-amber-400';
  if (cat === 'fundacion') return 'text-red-400';
  if (cat === 'internacional') return 'text-sky-400';
  if (cat === 'crisis') return 'text-slate-400';
  return 'text-emerald-400';
}

export const HistoryModule: React.FC<HistoryModuleProps> = ({
  onNavigateToModule,
}) => {
  const [activeTab, setActiveTab] = useState<HistoryTabId>('cronica');
  const [eraFilter, setEraFilter] = useState<HistoryEraGroup>('todos');
  const [categoryFilter, setCategoryFilter] = useState<HistoryChapterCategory>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFoundersList, setShowFoundersList] = useState(false);

  const eraCounts = useMemo(
    () => getHistoryEraCounts(CLUB_HISTORY_CHAPTERS),
    []
  );

  const filteredChapters = useMemo(
    () =>
      filterHistoryChapters(CLUB_HISTORY_CHAPTERS, {
        eraGroup: eraFilter,
        category: categoryFilter,
        query: searchQuery,
      }),
    [eraFilter, categoryFilter, searchQuery]
  );

  // Sync deep-link / global search navigation (?seccion= or CustomEvent)
  useEffect(() => {
    const applySectionSelection = (tab?: HistoryTabId, chapterId?: string) => {
      if (tab && SECTION_TABS.some((t) => t.id === tab)) {
        setActiveTab(tab);
      }
      if (chapterId) {
        setActiveTab('cronica');
        setEraFilter('todos');
        setCategoryFilter('todas');
        setSearchQuery('');
        window.setTimeout(() => {
          const el = document.getElementById(chapterId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      }
    };

    try {
      const pendingTab = sessionStorage.getItem('junior-pending-history-tab') as HistoryTabId | null;
      const pendingChapter = sessionStorage.getItem('junior-pending-history-chapter');
      if (pendingTab || pendingChapter) {
        applySectionSelection(pendingTab || undefined, pendingChapter || undefined);
        sessionStorage.removeItem('junior-pending-history-tab');
        sessionStorage.removeItem('junior-pending-history-chapter');
      }
    } catch {
      // Ignore storage access errors
    }

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ tab?: HistoryTabId; chapterId?: string }>;
      applySectionSelection(custom.detail?.tab, custom.detail?.chapterId);
      try {
        sessionStorage.removeItem('junior-pending-history-tab');
        sessionStorage.removeItem('junior-pending-history-chapter');
      } catch {
        // Ignore storage access errors
      }
    };

    window.addEventListener('junior-select-history-section', handleCustomEvent);
    return () => {
      window.removeEventListener('junior-select-history-section', handleCustomEvent);
    };
  }, []);

  const handleJumpToChapter = (chapterId: string) => {
    const el = document.getElementById(chapterId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenStandingsTable = (tableId: string) => {
    try {
      sessionStorage.setItem('junior-pending-standings-table', tableId);
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(
      new CustomEvent('junior-select-standings-table', { detail: { tableId } })
    );
    onNavigateToModule?.('tablas-historicas');
  };

  const handleOpenRivalFranchise = (franchiseId: string) => {
    try {
      sessionStorage.setItem('junior-pending-rival-franchise', franchiseId);
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(
      new CustomEvent('junior-select-rival-franchise', { detail: { franchiseId } })
    );
    onNavigateToModule?.('resultados-vs-equipos');
  };

  const resetChronicleFilters = () => {
    setEraFilter('todos');
    setCategoryFilter('todas');
    setSearchQuery('');
  };

  const stadiums = useMemo(
    () => CLUB_STADIUMS_AND_FACILITIES.filter((f) => f.type === 'estadio'),
    []
  );
  const facilities = useMemo(
    () => CLUB_STADIUMS_AND_FACILITIES.filter((f) => f.type === 'sede'),
    []
  );

  return (
    <section
      id="historia"
      className="py-10 sm:py-14 bg-slate-950 border-b border-slate-800 scroll-mt-16 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Institutional Editorial Header */}
        <header className="pb-8 mb-8 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-3">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Módulo 07 · Historia Institucional</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">7 de agosto de 1924 – 2026</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">102 años de historia</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 min-w-0 space-y-4">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <img
                  src="/assets/aistudio/image_82370351.png"
                  alt="Escudo Oficial Junior de Barranquilla"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="font-display text-2xl sm:text-5xl font-black uppercase text-white tracking-tight leading-[1.04] [text-wrap:balance]">
                    Historia de Junior de Barranquilla
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                    {CLUB_HISTORY_INTRO.officialName} · Conocido históricamente como{' '}
                    {CLUB_HISTORY_INTRO.formerName}
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-w-prose text-sm sm:text-[15px] text-slate-300 leading-relaxed pt-1">
                {CLUB_HISTORY_INTRO.leadParagraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                <a
                  href={WIKIPEDIA_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-medium underline underline-offset-4 transition-colors"
                >
                  <span>Artículo de referencia en Wikipedia (es.wikipedia.org)</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span className="font-mono tabular-nums">
                  23 capítulos históricos · 16 títulos oficiales · 1924–2026
                </span>
              </div>
            </div>

            {/* Institutional Summary Accession Block */}
            <aside className="lg:col-span-4 rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white pb-3 mb-3 border-b border-slate-800">
                Ficha Institucional
              </h3>
              <dl className="divide-y divide-slate-800/80 text-xs">
                {CLUB_INSTITUTIONAL_FACTS.slice(0, 7).map((fact) => (
                  <div key={fact.label} className="py-2 flex flex-col gap-0.5">
                    <dt className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                      {fact.label}
                    </dt>
                    <dd className="text-slate-100 font-medium leading-snug">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>

          {/* 5 Functional Section Tabs */}
          <nav
            aria-label="Secciones de la historia de Junior de Barranquilla"
            className="mt-8 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          >
            {SECTION_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-2 transition-colors border ${
                    isActive
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* ================================================================= */}
        {/* TAB 1: CRÓNICA HISTÓRICA COMPLETA (23 CAPÍTULOS: 1924 – 2026)     */}
        {/* ================================================================= */}
        {activeTab === 'cronica' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sticky Index & Era Filters */}
            <aside className="lg:col-span-4 min-w-0 lg:sticky lg:top-36 space-y-4">
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-200">
                    Índice Histórico (1924–2026)
                  </span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {filteredChapters.length} / {CLUB_HISTORY_CHAPTERS.length}
                  </span>
                </div>

                {/* Search chapters */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar año, jugador o hito (ej. Garrincha, 1977)..."
                    aria-label="Buscar en capítulos de historia"
                    className="w-full pl-8 pr-8 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Limpiar búsqueda histórica"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Era buttons */}
                <div className="space-y-1">
                  {HISTORY_ERA_GROUPS.map((era) => {
                    const active = eraFilter === era.id;
                    return (
                      <button
                        key={era.id}
                        type="button"
                        onClick={() => setEraFilter(era.id)}
                        className={`w-full px-3 py-1.5 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors ${
                          active
                            ? 'bg-red-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{era.label}</span>
                        <span
                          className={`font-mono text-[10px] tabular-nums shrink-0 ${
                            active ? 'text-red-100' : 'text-slate-500'
                          }`}
                        >
                          {era.years} ({eraCounts[era.id]})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Category filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as HistoryChapterCategory)
                  }
                  aria-label="Filtrar capítulos por categoría"
                  className="w-full py-2 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Scrollable Chapter Jump List */}
                <div className="pt-2 border-t border-slate-800 max-h-64 lg:max-h-[38vh] overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin">
                  {filteredChapters.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleJumpToChapter(ch.id)}
                      className="w-full py-2 px-1.5 text-left hover:bg-slate-800/50 rounded transition-colors flex items-baseline gap-2 group"
                    >
                      <span className="font-mono text-[10px] text-red-400 font-bold tabular-nums shrink-0">
                        {ch.number}
                      </span>
                      <span className="text-xs text-slate-300 group-hover:text-white truncate flex-1">
                        {ch.yearLabel}: {ch.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Editorial Chronicle Column */}
            <div className="lg:col-span-8 min-w-0 space-y-6">
              {/* Collapsible 1924 Founders Roster */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
                <button
                  type="button"
                  onClick={() => setShowFoundersList((prev) => !prev)}
                  aria-expanded={showFoundersList}
                  className="w-full flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">
                        Nómina Fundacional del 7 de agosto de 1924 (Juventud Infantil)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {CLUB_HISTORY_INTRO.foundedPlace} · 20 pioneros registrados
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                    <span>{showFoundersList ? 'Ocultar' : 'Ver fundadores'}</span>
                    {showFoundersList ? (
                      <ChevronUp className="w-4 h-4 text-red-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-red-400" />
                    )}
                  </span>
                </button>

                {showFoundersList && (
                  <ul className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5 text-xs text-slate-300">
                    {CLUB_HISTORY_INTRO.founders.map((founder, i) => (
                      <li key={founder} className="flex items-baseline gap-2">
                        <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={i === 0 ? 'font-semibold text-white' : ''}>
                          {founder}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Chapters List */}
              {filteredChapters.length === 0 ? (
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-10 text-center space-y-3">
                  <p className="text-sm text-slate-200 font-medium">
                    No se encontraron capítulos históricos para los filtros seleccionados.
                  </p>
                  <button
                    type="button"
                    onClick={resetChronicleFilters}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer filtros</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredChapters.map((chapter) => (
                    <article
                      key={chapter.id}
                      id={chapter.id}
                      className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-7 scroll-mt-36 space-y-4"
                    >
                      {/* Chapter Header */}
                      <div className="pb-4 border-b border-slate-800 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
                          <span className="text-red-400 font-bold">
                            Capítulo {chapter.number}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-white font-semibold">
                            {chapter.yearLabel}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className={getCategoryTextClass(chapter.category)}>
                            {getCategoryLabel(chapter.category)}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-slate-400 font-sans">
                            {chapter.eraLabel}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight [text-wrap:balance]">
                          {chapter.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-prose">
                          {chapter.summary}
                        </p>
                      </div>

                      {/* Narrative Prose */}
                      <div className="space-y-3.5 max-w-prose text-sm sm:text-[15px] text-slate-200 leading-relaxed">
                        {chapter.paragraphs.map((para, pIdx) => (
                          <p
                            key={pIdx}
                            className={
                              chapter.number === '01' && pIdx === 0
                                ? 'first-letter:text-4xl first-letter:font-display first-letter:font-black first-letter:text-red-500 first-letter:float-left first-letter:mr-2.5 first-letter:leading-none'
                                : ''
                            }
                          >
                            {para}
                          </p>
                        ))}
                      </div>

                      {/* Figures & Cross-Module Actions */}
                      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-slate-400 leading-relaxed">
                          <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500 mr-2">
                            Protagonistas:
                          </span>
                          <span className="text-slate-300">
                            {chapter.keyFigures.join(' · ')}
                          </span>
                        </div>

                        {(chapter.standingsTableId || chapter.rivalFranchiseId) && (
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {chapter.standingsTableId && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenStandingsTable(chapter.standingsTableId!)
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                              >
                                <Table className="w-3.5 h-3.5 text-red-400" />
                                <span>Tabla oficial</span>
                              </button>
                            )}
                            {chapter.rivalFranchiseId && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenRivalFranchise(chapter.rivalFranchiseId!)
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                              >
                                <Swords className="w-3.5 h-3.5 text-amber-400" />
                                <span>Historial rival</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SÍMBOLOS E INDUMENTARIA                                    */}
        {/* ================================================================= */}
        {activeTab === 'simbolos' && (
          <div className="space-y-6">
            {CLUB_SYMBOLS_DATA.map((symbol) => (
              <article
                key={symbol.id}
                className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-7 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-slate-800">
                  <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                    {symbol.title}
                  </h3>
                  <span className="text-xs font-mono text-red-400 tabular-nums shrink-0">
                    {symbol.period}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div
                    className={`${
                      symbol.id === 'sym-bandera' ? 'lg:col-span-8' : 'lg:col-span-12'
                    } space-y-3 max-w-prose text-sm sm:text-[15px] text-slate-200 leading-relaxed`}
                  >
                    {symbol.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                    {symbol.highlight && (
                      <p className="text-xs font-mono text-amber-300 pt-1">
                        {symbol.highlight}
                      </p>
                    )}
                  </div>

                  {/* Official Geometric Flag Representation */}
                  {symbol.id === 'sym-bandera' && (
                    <figure className="lg:col-span-4 flex flex-col items-center">
                      <svg
                        viewBox="0 0 360 225"
                        role="img"
                        aria-label="Bandera oficial de Junior de Barranquilla con nueve franjas rojas y blancas y triángulo azul"
                        className="w-full max-w-[300px] rounded-lg border border-slate-800 shadow-lg"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((stripe) => (
                          <rect
                            key={stripe}
                            x="0"
                            y={stripe * 25}
                            width="360"
                            height="25"
                            fill={stripe % 2 === 0 ? '#D62027' : '#F8FAFC'}
                          />
                        ))}
                        <polygon points="0,0 165,112.5 0,225" fill="#0B2E6B" />
                        {[
                          [28, 62],
                          [52, 78],
                          [76, 94],
                          [100, 112],
                          [28, 112],
                          [52, 112],
                          [76, 112],
                          [28, 162],
                          [52, 146],
                          [76, 130],
                          [38, 88],
                          [38, 136],
                        ].map(([cx, cy], idx) => (
                          <circle key={idx} cx={cx} cy={cy} r="4.5" fill="#FFFFFF" />
                        ))}
                      </svg>
                      <figcaption className="text-[11px] text-slate-400 mt-2 text-center">
                        Bandera institucional: 5 franjas rojas, 4 blancas y triángulo azul
                      </figcaption>
                    </figure>
                  )}
                </div>

                {/* Historical Shield Gallery for Escudos */}
                {symbol.crestImages && symbol.crestImages.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                        Evolución visual en el archivo oficial del club
                      </span>
                      {onNavigateToModule && (
                        <button
                          type="button"
                          onClick={() => onNavigateToModule('uniformes')}
                          className="text-xs font-semibold text-red-400 hover:text-red-300 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Shirt className="w-3.5 h-3.5" />
                          <span>Abrir Museo de Uniformes e Insignias</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {symbol.crestImages.map((img) => (
                        <figure
                          key={img.src}
                          className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center text-center gap-2"
                        >
                          <div className="w-14 h-14 flex items-center justify-center">
                            <img
                              src={img.src}
                              alt={img.caption}
                              loading="lazy"
                              className="max-w-full max-h-full object-contain drop-shadow"
                            />
                          </div>
                          <figcaption className="text-[10px] text-slate-400 leading-snug">
                            {img.caption}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: ESTADIOS E INFRAESTRUCTURA                                 */}
        {/* ================================================================= */}
        {activeTab === 'infraestructura' && (
          <div className="space-y-8">
            {/* Estadios Históricos */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800 flex items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                  Evolución de Estadios (1924–Actualidad)
                </h3>
                <span className="text-xs font-mono text-slate-400">3 escenarios históricos</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {stadiums.map((est) => (
                  <article
                    key={est.id}
                    className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-3"
                  >
                    <div className="pb-3 border-b border-slate-800 space-y-1">
                      <div className="text-xs font-mono text-red-400 font-semibold tabular-nums">
                        {est.period}
                      </div>
                      <h4 className="font-display text-xl font-bold uppercase text-white leading-tight">
                        {est.name}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>
                          {est.location} ·{' '}
                          <strong className="text-slate-200 font-mono tabular-nums">
                            {est.capacityOrScope}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {est.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sedes Deportivas y Administrativas */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-800 flex items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                  Sedes Deportivas y Administrativas
                </h3>
                <span className="text-xs font-mono text-slate-400">Complejos institucionales</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {facilities.map((sede) => (
                  <article
                    key={sede.id}
                    className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-3"
                  >
                    <div className="pb-3 border-b border-slate-800 space-y-1">
                      <div className="text-xs font-mono text-amber-400 font-semibold">
                        {sede.period}
                      </div>
                      <h4 className="font-display text-xl font-bold uppercase text-white leading-tight">
                        {sede.name}
                      </h4>
                      <div className="text-[11px] text-slate-400">
                        {sede.location} · <span className="text-slate-200">{sede.capacityOrScope}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {sede.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: DATOS DEL CLUB Y RÉCORDS HISTÓRICOS                        */}
        {/* ================================================================= */}
        {activeTab === 'datos' && (
          <div className="space-y-8">
            {/* General Statistical Sheet */}
            <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6">
              <div className="pb-3 mb-4 border-b border-slate-800 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                  Datos Históricos del Club
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Registro Primera A Dimayor y Competencias Oficiales
                </span>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-slate-800/70 text-xs sm:text-sm tabular-nums">
                {CLUB_GENERAL_STATS.map((row) => (
                  <div
                    key={row.label}
                    className="py-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-slate-800/70"
                  >
                    <dt className="text-slate-400 font-medium">{row.label}</dt>
                    <dd className="text-white font-semibold sm:text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            {/* Biggest Wins & Losses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                <h4 className="font-display text-lg font-bold uppercase text-emerald-400 pb-2 border-b border-slate-800">
                  Mayores Goleadas Nacionales
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200 tabular-nums">
                  {CLUB_BIGGEST_SCORES.nationalWins.map((score) => (
                    <li key={score} className="leading-snug">
                      {score}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                <h4 className="font-display text-lg font-bold uppercase text-sky-400 pb-2 border-b border-slate-800">
                  Mayores Goleadas Internacionales
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200 tabular-nums">
                  {CLUB_BIGGEST_SCORES.internationalWins.map((score) => (
                    <li key={score} className="leading-snug">
                      {score}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                <h4 className="font-display text-lg font-bold uppercase text-rose-400 pb-2 border-b border-slate-800">
                  Mayores Goleadas en Contra
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300 tabular-nums">
                  {CLUB_BIGGEST_SCORES.defeats.map((score) => (
                    <li key={score} className="leading-snug">
                      {score}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            {/* 7 Historical Landmark Records */}
            <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6">
              <div className="pb-3 mb-4 border-b border-slate-800">
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                  Récords Históricos Verificados (1975–2017)
                </h3>
              </div>

              <div className="divide-y divide-slate-800/80">
                {CLUB_LANDMARK_RECORDS.map((rec) => (
                  <div
                    key={rec.year + rec.title}
                    className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-baseline"
                  >
                    <div className="sm:col-span-2 font-mono text-xs font-bold text-red-400 tabular-nums">
                      {rec.year}
                    </div>
                    <div className="sm:col-span-10 space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {rec.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-prose">
                        {rec.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: CULTURA, FILIALES, MONUMENTO E INFLUENCIA INTERNACIONAL    */}
        {/* ================================================================= */}
        {activeTab === 'cultura' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CLUB_CULTURAL_TOPICS.map((topic) => (
              <article
                key={topic.id}
                className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="pb-3 border-b border-slate-800">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-semibold">
                      {topic.subtitle}
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-tight mt-0.5">
                      {topic.title}
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {topic.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>

                {(topic.highlights || topic.rivalFranchiseId) && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    {topic.highlights && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {topic.highlights.join(' · ')}
                      </p>
                    )}
                    {topic.rivalFranchiseId && (
                      <button
                        type="button"
                        onClick={() => handleOpenRivalFranchise(topic.rivalFranchiseId!)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 text-xs font-semibold text-slate-200 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Swords className="w-3.5 h-3.5 text-red-400" />
                        <span>Explorar el Clásico Costeño en Resultados vs Equipos</span>
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
