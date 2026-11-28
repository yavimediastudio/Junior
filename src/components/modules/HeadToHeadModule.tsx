import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Swords,
  Search,
  X,
  ArrowUpDown,
  MapPin,
  Calendar,
  History,
  Link2,
  Volume2,
  ChevronDown,
  RotateCcw,
  Layers,
  Award,
} from 'lucide-react';
import { CHRONOLOGICAL_STANDINGS_TABLES } from '../../data/historicStandingsChronology';
import {
  FranchiseStatus,
  HeadToHeadFranchiseSummary,
  HeadToHeadMatchRecord,
  HeadToHeadSplitStats,
} from '../../types/football';
import {
  buildAllHeadToHeadFranchises,
  filterHeadToHeadMatches,
} from '../../utils/headToHeadLogic';
import { playStadiumAudio } from '../../utils/footballLogic';

interface HeadToHeadModuleProps {
  audioEnabled?: boolean;
}

type CategoryFilter = 'todos' | FranchiseStatus | 'rebranded';
type SortMode = 'pj' | 'pointsPct' | 'alpha' | 'recent';
type VenueScope = 'todos' | 'local' | 'visitante';
type OutcomeFilter = 'todos' | 'W' | 'D' | 'L';
type PhaseFilter = 'todas' | 'regular' | 'final';

const JUNIOR_CURRENT_CREST = '/assets/aistudio/image_82370351.png';
const PAGE_SIZE = 30;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getStatusLabel(status: FranchiseStatus): string {
  if (status === 'primera-a') return 'Primera A (2026)';
  if (status === 'primera-b') return 'Primera B';
  return 'Histórico / Desaparecido';
}

function getStatusShortLabel(status: FranchiseStatus): string {
  if (status === 'primera-a') return 'Primera A';
  if (status === 'primera-b') return 'Primera B';
  return 'Desaparecido';
}

function getStatusTextClass(status: FranchiseStatus): string {
  if (status === 'primera-a') return 'text-emerald-400';
  if (status === 'primera-b') return 'text-sky-400';
  return 'text-amber-400';
}

interface ClubEmblemProps {
  crest: { src: string; alt: string } | null;
  monogram: string;
  primaryHex: string;
  secondaryHex: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const ClubEmblem: React.FC<ClubEmblemProps> = ({
  crest,
  monogram,
  primaryHex,
  secondaryHex,
  size = 'md',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [crest?.src]);

  const dimClass =
    size === 'xs'
      ? 'w-5 h-5 text-[8px]'
      : size === 'sm'
      ? 'w-7 h-7 text-[10px]'
      : size === 'lg'
      ? 'w-12 h-12 sm:w-14 sm:h-14 text-sm'
      : 'w-9 h-9 text-[11px]';

  if (crest && !imgFailed) {
    return (
      <div
        className={`${dimClass} shrink-0 flex items-center justify-center rounded-lg bg-slate-900/60 border border-slate-800/80 p-1`}
      >
        <img
          src={crest.src}
          alt={crest.alt}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain drop-shadow-sm"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dimClass} shrink-0 flex items-center justify-center rounded-lg font-mono font-black tracking-tighter border select-none`}
      style={{
        backgroundColor: primaryHex,
        color: secondaryHex,
        borderColor: `${secondaryHex}44`,
      }}
      aria-label={`Monograma ${monogram}`}
    >
      {monogram}
    </div>
  );
};

function formatMatchHeadline(match: HeadToHeadMatchRecord | null): string {
  if (!match) return 'Sin registro';
  return match.isHome
    ? `Junior ${match.juniorScore}-${match.opponentScore} ${match.opponentNameAtTime}`
    : `${match.opponentNameAtTime} ${match.opponentScore}-${match.juniorScore} Junior`;
}

export const HeadToHeadModule: React.FC<HeadToHeadModuleProps> = ({
  audioEnabled = true,
}) => {
  const allFranchises = useMemo<HeadToHeadFranchiseSummary[]>(
    () => buildAllHeadToHeadFranchises(CHRONOLOGICAL_STANDINGS_TABLES),
    []
  );

  const franchiseById = useMemo(() => {
    const map = new Map<string, HeadToHeadFranchiseSummary>();
    for (const f of allFranchises) {
      map.set(f.franchise.id, f);
    }
    return map;
  }, [allFranchises]);

  const archiveTotals = useMemo(() => {
    let totalMatches = 0;
    let totalNames = 0;
    let primeraA = 0;
    let primeraB = 0;
    let desaparecidos = 0;
    let rebranded = 0;
    for (const item of allFranchises) {
      totalMatches += item.overall.pj;
      totalNames += item.franchise.aliases.length;
      if (item.franchise.status === 'primera-a') primeraA++;
      else if (item.franchise.status === 'primera-b') primeraB++;
      else desaparecidos++;
      if (item.franchise.hasIdentityChange) rebranded++;
    }
    return {
      totalFranchises: allFranchises.length,
      totalNames,
      totalMatches,
      primeraA,
      primeraB,
      desaparecidos,
      rebranded,
    };
  }, [allFranchises]);

  const [selectedId, setSelectedId] = useState<string>(
    () => allFranchises[0]?.franchise.id || 'atletico-nacional'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('todos');
  const [sortMode, setSortMode] = useState<SortMode>('pj');

  // Detail dossier controls
  const [venueScope, setVenueScope] = useState<VenueScope>('todos');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('todos');
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('todas');
  const [eraFilter, setEraFilter] = useState<string>('todos');
  const [matchSortOrder, setMatchSortOrder] = useState<'desc' | 'asc'>('desc');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const dossierTopRef = useRef<HTMLDivElement>(null);

  // Sync deep-link / global search navigation (?rival= or CustomEvent)
  useEffect(() => {
    const applyFranchiseSelection = (franchiseId: string | null) => {
      if (!franchiseId || !franchiseById.has(franchiseId)) return;
      setSelectedId(franchiseId);
      setCategoryFilter('todos');
      setSearchQuery('');
      setVenueScope('todos');
      setOutcomeFilter('todos');
      setPhaseFilter('todas');
      setEraFilter('todos');
      setVisibleCount(PAGE_SIZE);
    };

    try {
      const pending = sessionStorage.getItem('junior-pending-rival-franchise');
      if (pending) {
        applyFranchiseSelection(pending);
        sessionStorage.removeItem('junior-pending-rival-franchise');
      }
    } catch {
      // Ignore storage access errors
    }

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ franchiseId?: string }>;
      if (custom.detail?.franchiseId) {
        applyFranchiseSelection(custom.detail.franchiseId);
        try {
          sessionStorage.removeItem('junior-pending-rival-franchise');
        } catch {
          // Ignore storage access errors
        }
      }
    };

    window.addEventListener('junior-select-rival-franchise', handleCustomEvent);
    return () => {
      window.removeEventListener('junior-select-rival-franchise', handleCustomEvent);
    };
  }, [franchiseById]);

  const selectedSummary = useMemo<HeadToHeadFranchiseSummary>(
    () => franchiseById.get(selectedId) || allFranchises[0],
    [franchiseById, selectedId, allFranchises]
  );

  // Filter & sort left directory
  const filteredFranchises = useMemo(() => {
    const cleanQuery = normalizeText(searchQuery);

    const list = allFranchises.filter((item) => {
      const f = item.franchise;
      if (categoryFilter === 'rebranded') {
        if (!f.hasIdentityChange) return false;
      } else if (categoryFilter !== 'todos' && f.status !== categoryFilter) {
        return false;
      }

      if (!cleanQuery) return true;

      const haystack = normalizeText(
        [
          f.name,
          f.shortName,
          ...f.aliases,
          f.city,
          f.department,
          f.derbyName,
          ...f.eras.map((e) => `${e.name} ${e.city}`),
        ].join(' ')
      );
      return haystack.includes(cleanQuery);
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'pj') {
        if (b.overall.pj !== a.overall.pj) return b.overall.pj - a.overall.pj;
        return a.franchise.name.localeCompare(b.franchise.name, 'es');
      }
      if (sortMode === 'pointsPct') {
        if (b.overall.pointsPct !== a.overall.pointsPct) {
          return b.overall.pointsPct - a.overall.pointsPct;
        }
        return b.overall.pj - a.overall.pj;
      }
      if (sortMode === 'recent') {
        const aOrder = a.lastMatch?.chronologicalOrder || 0;
        const bOrder = b.lastMatch?.chronologicalOrder || 0;
        if (bOrder !== aOrder) return bOrder - aOrder;
        return b.overall.pj - a.overall.pj;
      }
      return a.franchise.name.localeCompare(b.franchise.name, 'es');
    });
  }, [allFranchises, categoryFilter, searchQuery, sortMode]);

  const handleSelectFranchise = (franchiseId: string, scrollOnMobile = false) => {
    setSelectedId(franchiseId);
    setVenueScope('todos');
    setOutcomeFilter('todos');
    setPhaseFilter('todas');
    setEraFilter('todos');
    setVisibleCount(PAGE_SIZE);
    if (audioEnabled) {
      playStadiumAudio('whistle');
    }
    if (scrollOnMobile && window.innerWidth < 1024 && dossierTopRef.current) {
      dossierTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Active split stats driven by venueScope
  const activeStats: HeadToHeadSplitStats =
    venueScope === 'local'
      ? selectedSummary.home
      : venueScope === 'visitante'
      ? selectedSummary.away
      : selectedSummary.overall;

  const drawPct =
    activeStats.pj > 0 ? Math.round((activeStats.pe / activeStats.pj) * 100) : 0;
  const lossPct =
    activeStats.pj > 0 ? Math.round((activeStats.pp / activeStats.pj) * 100) : 0;
  const totalGoalsInScope = activeStats.gf + activeStats.gc;
  const juniorGoalShare =
    totalGoalsInScope > 0 ? (activeStats.gf / totalGoalsInScope) * 100 : 50;

  // Filtered match archive for selected franchise
  const filteredMatches = useMemo(
    () =>
      filterHeadToHeadMatches(selectedSummary.matches, {
        venue: venueScope,
        outcome: outcomeFilter,
        phase: phaseFilter,
        eraName: eraFilter,
        sortOrder: matchSortOrder,
      }),
    [selectedSummary.matches, venueScope, outcomeFilter, phaseFilter, eraFilter, matchSortOrder]
  );

  const visibleMatches = useMemo(
    () => filteredMatches.slice(0, visibleCount),
    [filteredMatches, visibleCount]
  );

  const hasActiveArchiveFilters =
    venueScope !== 'todos' ||
    outcomeFilter !== 'todos' ||
    phaseFilter !== 'todas' ||
    eraFilter !== 'todos';

  const resetArchiveFilters = () => {
    setVenueScope('todos');
    setOutcomeFilter('todos');
    setPhaseFilter('todas');
    setEraFilter('todos');
    setVisibleCount(PAGE_SIZE);
  };

  const relatedFranchises = useMemo(() => {
    const ids = selectedSummary.franchise.relatedFranchiseIds || [];
    return ids
      .map((id) => franchiseById.get(id))
      .filter((x): x is HeadToHeadFranchiseSummary => Boolean(x));
  }, [selectedSummary, franchiseById]);

  const formerAliases = selectedSummary.franchise.aliases.filter(
    (a) => a !== selectedSummary.franchise.name
  );

  const categoryButtons: Array<{ id: CategoryFilter; label: string; count: number }> = [
    { id: 'todos', label: 'Todos', count: archiveTotals.totalFranchises },
    { id: 'primera-a', label: 'Primera A', count: archiveTotals.primeraA },
    { id: 'primera-b', label: 'Primera B', count: archiveTotals.primeraB },
    { id: 'desaparecido', label: 'Desaparecidos', count: archiveTotals.desaparecidos },
    { id: 'rebranded', label: 'Cambio de nombre', count: archiveTotals.rebranded },
  ];

  return (
    <section
      id="resultados-vs-equipos"
      className="py-10 sm:py-14 bg-slate-950 border-b border-slate-800 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Archival Module Header */}
        <header className="pb-6 mb-6 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
            <Swords className="w-4 h-4 shrink-0" />
            <span>Archivo Frente a Frente</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Primera A Dimayor 1948–2026</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
                Resultados Históricos vs Equipos
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
                Registro verificado contra los {archiveTotals.totalFranchises} clubes enfrentados por Junior en Primera División —activos, en Primera B y desaparecidos—, unificando franquicias que cambiaron de nombre, sede o escudo.
              </p>
            </div>

            {/* Unboxed Archival Summary */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-300 tabular-nums shrink-0">
              <span>
                <strong className="text-white font-bold">{archiveTotals.totalFranchises}</strong> franquicias
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>
                <strong className="text-white font-bold">{archiveTotals.totalNames}</strong> nombres históricos
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>
                <strong className="text-red-400 font-bold">{archiveTotals.totalMatches.toLocaleString('es-CO')}</strong> partidos verificados
              </span>
            </div>
          </div>

          {/* Search + Category Filter + Sort Bar */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search by current name, former alias, city */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre actual, antiguo o ciudad (ej. La Equidad, Itagüí, Alianza Petrolera, Sporting, Oro Negro)..."
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  aria-label="Ordenar rivales"
                  className="py-2 pl-2.5 pr-7 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="pj">Orden: Más partidos</option>
                  <option value="pointsPct">Orden: Efectividad Junior</option>
                  <option value="recent">Orden: Más reciente</option>
                  <option value="alpha">Orden: Alfabético (A–Z)</option>
                </select>
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {categoryButtons.map((cat) => {
                const active = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors border tabular-nums ${
                      active
                        ? 'bg-red-600 text-white border-red-500 font-semibold'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {cat.label} <span className="opacity-75 ml-0.5">({cat.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Master-Detail Layout: Directory (4 cols) + Archival Dossier (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT DIRECTORY RAIL */}
          <aside className="lg:col-span-4 lg:sticky lg:top-36">
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  Directorio de Rivales
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {filteredFranchises.length} de {archiveTotals.totalFranchises}
                </span>
              </div>

              {filteredFranchises.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs text-slate-300 font-medium">
                    Ningún equipo coincide con "{searchQuery}".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('todos');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                  >
                    Mostrar las 40 franquicias
                  </button>
                </div>
              ) : (
                <div className="max-h-[340px] lg:max-h-[calc(100vh-14rem)] overflow-y-auto divide-y divide-slate-800/80 scrollbar-thin">
                  {filteredFranchises.map((item) => {
                    const isSelected = item.franchise.id === selectedSummary.franchise.id;
                    const aliasesSub = item.franchise.aliases.filter(
                      (a) => a !== item.franchise.name
                    );
                    return (
                      <button
                        key={item.franchise.id}
                        type="button"
                        onClick={() => handleSelectFranchise(item.franchise.id, true)}
                        className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center gap-3 ${
                          isSelected
                            ? 'bg-red-600/15 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <ClubEmblem
                          crest={item.primaryCrest}
                          monogram={item.franchise.monogram}
                          primaryHex={item.franchise.primaryHex}
                          secondaryHex={item.franchise.secondaryHex}
                          size="sm"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs sm:text-sm font-semibold truncate ${
                                isSelected ? 'text-white' : 'text-slate-100'
                              }`}
                            >
                              {item.franchise.name}
                            </span>
                            {isSelected && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            <span className={getStatusTextClass(item.franchise.status)}>
                              {getStatusShortLabel(item.franchise.status)}
                            </span>
                            <span aria-hidden="true" className="mx-1 text-slate-600">·</span>
                            <span>
                              {item.firstYear === item.lastYear
                                ? item.firstYear
                                : `${item.firstYear}–${item.lastYear}`}
                            </span>
                            {aliasesSub.length > 0 && (
                              <>
                                <span aria-hidden="true" className="mx-1 text-slate-600">·</span>
                                <span className="text-slate-400">
                                  ex {aliasesSub[0]}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono tabular-nums">
                          <div
                            className={`text-xs font-bold ${
                              isSelected ? 'text-red-400' : 'text-white'
                            }`}
                          >
                            {item.overall.pj} PJ
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.overall.pg}-{item.overall.pe}-{item.overall.pp}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT ARCHIVAL DOSSIER */}
          <div ref={dossierTopRef} className="lg:col-span-8 space-y-6 scroll-mt-32">
            {/* 1. Dossier Header & Balance Core */}
            <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6">
              {/* Identity Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-950 border border-slate-800 p-1.5 flex items-center justify-center">
                      <img
                        src={JUNIOR_CURRENT_CREST}
                        alt="Escudo Junior de Barranquilla"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">VS</span>
                    <ClubEmblem
                      crest={selectedSummary.primaryCrest}
                      monogram={selectedSummary.franchise.monogram}
                      primaryHex={selectedSummary.franchise.primaryHex}
                      secondaryHex={selectedSummary.franchise.secondaryHex}
                      size="lg"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-red-400">
                      {selectedSummary.franchise.derbyName}
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight mt-0.5">
                      {selectedSummary.franchise.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      <span className={getStatusTextClass(selectedSummary.franchise.status)}>
                        {getStatusLabel(selectedSummary.franchise.status)}
                      </span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-600">·</span>
                      <span>
                        {selectedSummary.franchise.city}, {selectedSummary.franchise.department}
                      </span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-600">·</span>
                      <span className="font-mono tabular-nums">
                        {selectedSummary.firstYear === selectedSummary.lastYear
                          ? selectedSummary.firstYear
                          : `${selectedSummary.firstYear}–${selectedSummary.lastYear}`}
                      </span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-600">·</span>
                      <span>{selectedSummary.franchise.colors}</span>
                    </p>
                    {formerAliases.length > 0 && (
                      <p className="text-xs text-amber-300/90 mt-1">
                        También enfrentado como:{' '}
                        <strong className="font-semibold text-amber-200">
                          {formerAliases.join(' · ')}
                        </strong>
                      </p>
                    )}
                  </div>
                </div>

                {audioEnabled && (
                  <button
                    type="button"
                    onClick={() => playStadiumAudio('cheer')}
                    className="self-start px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    title={`Alentar contra ${selectedSummary.franchise.shortName}`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Alentar</span>
                  </button>
                )}
              </div>

              {/* Live Condition Switch: Todos | Local en Barranquilla | Visitante */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-1 w-full sm:w-auto">
                  {(
                    [
                      {
                        id: 'todos' as VenueScope,
                        label: `General (${selectedSummary.overall.pj})`,
                      },
                      {
                        id: 'local' as VenueScope,
                        label: `Local en Barranquilla (${selectedSummary.home.pj})`,
                      },
                      {
                        id: 'visitante' as VenueScope,
                        label: `Visitante (${selectedSummary.away.pj})`,
                      },
                    ]
                  ).map((tab) => {
                    const active = venueScope === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setVenueScope(tab.id);
                          setVisibleCount(PAGE_SIZE);
                        }}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors tabular-nums ${
                          active
                            ? 'bg-red-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-mono text-slate-400 tabular-nums">
                  Efectividad en puntos:{' '}
                  <strong className="text-white">{activeStats.pointsPct}%</strong>
                </div>
              </div>

              {/* Unboxed KPI Grid (PJ / PG / PE / PP) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-800 tabular-nums">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Partidos
                  </div>
                  <div className="font-display text-3xl font-black text-white mt-0.5">
                    {activeStats.pj}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {venueScope === 'todos'
                      ? `${selectedSummary.home.pj} L · ${selectedSummary.away.pj} V`
                      : venueScope === 'local'
                      ? 'En Barranquilla'
                      : 'Fuera de casa'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                    Triunfos Junior
                  </div>
                  <div className="font-display text-3xl font-black text-emerald-400 mt-0.5">
                    {activeStats.pg}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {activeStats.winPct}% victorias
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                    Empates
                  </div>
                  <div className="font-display text-3xl font-black text-slate-200 mt-0.5">
                    {activeStats.pe}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {drawPct}% empates
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold">
                    Triunfos Rival
                  </div>
                  <div className="font-display text-3xl font-black text-rose-400 mt-0.5">
                    {activeStats.pp}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {lossPct}% derrotas
                  </div>
                </div>
              </div>

              {/* Goal Balance Bar */}
              <div className="space-y-2 tabular-nums">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-red-400">
                    Junior: <strong className="font-mono text-white">{activeStats.gf}</strong> goles
                  </span>
                  <span className="font-mono text-slate-400">
                    Diferencia:{' '}
                    <strong
                      className={
                        activeStats.dg > 0
                          ? 'text-emerald-400'
                          : activeStats.dg < 0
                          ? 'text-rose-400'
                          : 'text-slate-200'
                      }
                    >
                      {activeStats.dg > 0 ? `+${activeStats.dg}` : activeStats.dg}
                    </strong>
                  </span>
                  <span className="font-semibold text-slate-300">
                    {selectedSummary.franchise.shortName}:{' '}
                    <strong className="font-mono text-white">{activeStats.gc}</strong> goles
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${juniorGoalShare}%` }}
                    className="bg-red-600 transition-all duration-300"
                  />
                  <div
                    style={{ width: `${100 - juniorGoalShare}%` }}
                    className="bg-slate-600 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Three Key Archival Benchmarks (Biggest Win, Biggest Loss, Streak/Last Match) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
                    Mayor victoria de Junior
                  </div>
                  {activeStats.biggestWin ? (
                    <>
                      <div className="font-mono font-bold text-white tabular-nums">
                        {formatMatchHeadline(activeStats.biggestWin)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {activeStats.biggestWin.date} · {activeStats.biggestWin.tournamentName}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">Sin victorias en esta condición</div>
                  )}
                </div>

                <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-rose-400">
                    Mayor derrota de Junior
                  </div>
                  {activeStats.biggestLoss ? (
                    <>
                      <div className="font-mono font-bold text-white tabular-nums">
                        {formatMatchHeadline(activeStats.biggestLoss)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {activeStats.biggestLoss.date} · {activeStats.biggestLoss.tournamentName}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">Invicto en esta condición</div>
                  )}
                </div>

                <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-4">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-400">
                    Racha y último partido
                  </div>
                  <div className="font-semibold text-white">
                    {selectedSummary.currentStreak}
                  </div>
                  {selectedSummary.lastMatch && (
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      Último: {formatMatchHeadline(selectedSummary.lastMatch)} (
                      {selectedSummary.lastMatch.year})
                    </div>
                  )}
                </div>
              </div>
            </article>

            {/* 2. Evolución de Identidad, Nombres y Escudos Históricos */}
            <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-red-400 shrink-0" />
                  <h4 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                    Evolución de Nombres, Sedes y Escudos
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {selectedSummary.eraBreakdowns.length}{' '}
                  {selectedSummary.eraBreakdowns.length === 1 ? 'etapa' : 'etapas'} ·{' '}
                  {selectedSummary.crestGallery.length}{' '}
                  {selectedSummary.crestGallery.length === 1
                    ? 'escudo archivado'
                    : 'escudos archivados'}
                </span>
              </div>

              {/* Chronological Eras Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      <th className="py-2 pr-3">Denominación histórica</th>
                      <th className="py-2 px-2 whitespace-nowrap">Años</th>
                      <th className="py-2 px-2 whitespace-nowrap">Sede</th>
                      <th className="py-2 px-2 text-right whitespace-nowrap">PJ</th>
                      <th className="py-2 px-2 text-right whitespace-nowrap">V-E-D</th>
                      <th className="py-2 pl-2 text-right whitespace-nowrap">GF:GC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {selectedSummary.eraBreakdowns.map((era) => {
                      const isEraFiltered = eraFilter === era.eraName;
                      const canFilterByEra = selectedSummary.eraBreakdowns.length > 1;
                      return (
                        <tr
                          key={era.eraName}
                          onClick={
                            canFilterByEra
                              ? () => {
                                  setEraFilter(isEraFiltered ? 'todos' : era.eraName);
                                  setVisibleCount(PAGE_SIZE);
                                }
                              : undefined
                          }
                          className={`${
                            canFilterByEra
                              ? 'cursor-pointer hover:bg-slate-800/50 transition-colors'
                              : ''
                          } ${isEraFiltered ? 'bg-red-600/10' : ''}`}
                        >
                          <td className="py-2.5 pr-3">
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{era.eraName}</span>
                              {canFilterByEra && (
                                <span className="text-[10px] font-mono text-red-400 font-normal">
                                  {isEraFiltered ? '(filtrado)' : 'ver partidos'}
                                </span>
                              )}
                            </div>
                            {era.note && (
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                {era.note}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-slate-300 whitespace-nowrap tabular-nums align-top">
                            {era.years}
                          </td>
                          <td className="py-2.5 px-2 text-slate-400 whitespace-nowrap align-top">
                            {era.city}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-white tabular-nums align-top">
                            {era.pj}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-300 whitespace-nowrap tabular-nums align-top">
                            <span className="text-emerald-400">{era.pg}</span>-
                            <span>{era.pe}</span>-
                            <span className="text-rose-400">{era.pp}</span>
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono text-slate-300 whitespace-nowrap tabular-nums align-top">
                            {era.gf}:{era.gc}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Historical Crests Gallery */}
              {selectedSummary.crestGallery.length > 0 ? (
                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    Escudos oficiales enfrentados por época
                  </div>
                  <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {selectedSummary.crestGallery.map((crest) => (
                      <figure
                        key={crest.src}
                        className="w-28 shrink-0 flex flex-col items-center text-center p-2.5 rounded-lg bg-slate-950 border border-slate-800/90"
                      >
                        <div className="w-14 h-14 flex items-center justify-center mb-2">
                          <img
                            src={crest.src}
                            alt={crest.alt}
                            loading="lazy"
                            className="max-w-full max-h-full object-contain drop-shadow"
                          />
                        </div>
                        <figcaption className="space-y-0.5">
                          <div className="text-[11px] font-mono font-bold text-white tabular-nums">
                            {crest.eraLabel}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                            {crest.teamName}
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                  <ClubEmblem
                    crest={null}
                    monogram={selectedSummary.franchise.monogram}
                    primaryHex={selectedSummary.franchise.primaryHex}
                    secondaryHex={selectedSummary.franchise.secondaryHex}
                    size="md"
                  />
                  <p className="leading-relaxed">
                    Identificado en el archivo con su monograma heráldico ({selectedSummary.franchise.monogram}) y colores históricos ({selectedSummary.franchise.colors}).
                  </p>
                </div>
              )}
            </article>

            {/* 3. Crónica Histórica & Predecesores Relacionados */}
            <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                  Crónica Histórica del Enfrentamiento
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedSummary.franchise.historicalContext}
              </p>

              {relatedFranchises.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-amber-400">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Clubes Históricos Relacionados (Criterio Dimayor)</span>
                  </div>
                  {selectedSummary.franchise.relatedNote && (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {selectedSummary.franchise.relatedNote}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {relatedFranchises.map((rel) => (
                      <button
                        key={rel.franchise.id}
                        type="button"
                        onClick={() => handleSelectFranchise(rel.franchise.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 text-xs text-slate-200 hover:text-white transition-colors"
                      >
                        <ClubEmblem
                          crest={rel.primaryCrest}
                          monogram={rel.franchise.monogram}
                          primaryHex={rel.franchise.primaryHex}
                          secondaryHex={rel.franchise.secondaryHex}
                          size="xs"
                        />
                        <span className="font-semibold">{rel.franchise.name}</span>
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          ({rel.overall.pj} PJ)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* 4. Archivo Completo de Partidos (1948–2026) */}
            <article className="rounded-xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-400 shrink-0" />
                  <h4 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                    Archivo de Partidos ({selectedSummary.firstYear}–{selectedSummary.lastYear})
                  </h4>
                </div>
                <div className="text-xs font-mono text-slate-400 tabular-nums">
                  Mostrando <strong className="text-white">{visibleMatches.length}</strong> de{' '}
                  <strong className="text-white">{filteredMatches.length}</strong>{' '}
                  {filteredMatches.length === 1 ? 'partido' : 'partidos'}
                </div>
              </div>

              {/* Compact Filter Toolbar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Result filter */}
                <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
                  {(
                    [
                      { id: 'todos' as OutcomeFilter, label: 'Todos' },
                      { id: 'W' as OutcomeFilter, label: 'V' },
                      { id: 'D' as OutcomeFilter, label: 'E' },
                      { id: 'L' as OutcomeFilter, label: 'D' },
                    ]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setOutcomeFilter(opt.id);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className={`px-2.5 py-1 rounded-md font-mono font-semibold transition-colors ${
                        outcomeFilter === opt.id
                          ? 'bg-red-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Phase filter */}
                <select
                  value={phaseFilter}
                  onChange={(e) => {
                    setPhaseFilter(e.target.value as PhaseFilter);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  aria-label="Filtrar por fase"
                  className="py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="todas">Fase: Todas</option>
                  <option value="regular">Fase: Regular</option>
                  <option value="final">Fase: Finales / Cuadrangulares</option>
                </select>

                {/* Era filter (only when club has >1 historical name/era) */}
                {selectedSummary.eraBreakdowns.length > 1 && (
                  <select
                    value={eraFilter}
                    onChange={(e) => {
                      setEraFilter(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    aria-label="Filtrar por denominación histórica"
                    className="py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="todos">Etapa: Todas ({selectedSummary.eraBreakdowns.length})</option>
                    {selectedSummary.eraBreakdowns.map((era) => (
                      <option key={era.eraName} value={era.eraName}>
                        {era.eraName} ({era.pj})
                      </option>
                    ))}
                  </select>
                )}

                {/* Chronological sort */}
                <button
                  type="button"
                  onClick={() =>
                    setMatchSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                  }
                  className="py-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{matchSortOrder === 'desc' ? 'Más recientes' : 'Desde 1948'}</span>
                </button>

                {hasActiveArchiveFilters && (
                  <button
                    type="button"
                    onClick={resetArchiveFilters}
                    className="py-1.5 px-2.5 text-red-400 hover:text-red-300 inline-flex items-center gap-1 whitespace-nowrap transition-colors ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar filtros</span>
                  </button>
                )}
              </div>

              {/* Match List */}
              {filteredMatches.length === 0 ? (
                <div className="py-10 text-center space-y-2 border-t border-slate-800">
                  <p className="text-sm text-slate-300 font-medium">
                    No hay partidos registrados con la combinación de filtros actual.
                  </p>
                  <button
                    type="button"
                    onClick={resetArchiveFilters}
                    className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                  >
                    Restablecer todos los filtros
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 border-t border-slate-800">
                  {visibleMatches.map((m) => {
                    const outcomeColor =
                      m.outcome === 'W'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : m.outcome === 'L'
                        ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                        : 'text-slate-300 border-slate-700 bg-slate-800/60';
                    const outcomeLetter = m.outcome === 'W' ? 'V' : m.outcome === 'L' ? 'D' : 'E';

                    const homeName = m.isHome ? 'Junior de Barranquilla' : m.opponentNameAtTime;
                    const awayName = m.isHome ? m.opponentNameAtTime : 'Junior de Barranquilla';
                    const homeScore = m.isHome ? m.juniorScore : m.opponentScore;
                    const awayScore = m.isHome ? m.opponentScore : m.juniorScore;

                    return (
                      <div key={m.id} className="py-3 flex flex-col gap-1.5">
                        {/* Top metadata row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono font-semibold text-slate-300 tabular-nums">
                              {m.date}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-slate-300">{m.tournamentName}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className={m.isFinalPhase ? 'text-amber-400 font-medium' : ''}>
                              {m.round}
                            </span>
                          </div>

                          <span
                            className={`w-5 h-5 rounded inline-flex items-center justify-center font-mono text-[10px] font-bold border shrink-0 ${outcomeColor}`}
                            title={
                              m.outcome === 'W'
                                ? 'Victoria de Junior'
                                : m.outcome === 'L'
                                ? 'Derrota de Junior'
                                : 'Empate'
                            }
                          >
                            {outcomeLetter}
                          </span>
                        </div>

                        {/* Scoreline row */}
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center justify-end gap-2 min-w-0">
                            <span
                              className={`truncate text-right ${
                                m.isHome ? 'font-bold text-white' : 'text-slate-300'
                              }`}
                            >
                              {homeName}
                            </span>
                            {m.isHome ? (
                              <img
                                src={m.juniorCrest?.src || JUNIOR_CURRENT_CREST}
                                alt="Junior"
                                className="w-5 h-5 object-contain shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <ClubEmblem
                                crest={m.opponentCrest ?? null}
                                monogram={selectedSummary.franchise.monogram}
                                primaryHex={selectedSummary.franchise.primaryHex}
                                secondaryHex={selectedSummary.franchise.secondaryHex}
                                size="xs"
                              />
                            )}
                          </div>

                          <div className="px-2.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono font-black text-sm text-white tabular-nums tracking-wider">
                            {homeScore} – {awayScore}
                          </div>

                          <div className="flex items-center justify-start gap-2 min-w-0">
                            {!m.isHome ? (
                              <img
                                src={m.juniorCrest?.src || JUNIOR_CURRENT_CREST}
                                alt="Junior"
                                className="w-5 h-5 object-contain shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <ClubEmblem
                                crest={m.opponentCrest ?? null}
                                monogram={selectedSummary.franchise.monogram}
                                primaryHex={selectedSummary.franchise.primaryHex}
                                secondaryHex={selectedSummary.franchise.secondaryHex}
                                size="xs"
                              />
                            )}
                            <span
                              className={`truncate text-left ${
                                !m.isHome ? 'font-bold text-white' : 'text-slate-300'
                              }`}
                            >
                              {awayName}
                            </span>
                          </div>
                        </div>

                        {/* Stadium & Note */}
                        {(m.venue || m.note) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                            {m.venue && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{m.venue}</span>
                              </span>
                            )}
                            {m.note && (
                              <span className="text-slate-400 italic">{m.note}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Progressive Pagination */}
              {filteredMatches.length > visibleCount && (
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors tabular-nums"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-red-400" />
                    <span>
                      Mostrar {Math.min(PAGE_SIZE, filteredMatches.length - visibleCount)} partidos más
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(filteredMatches.length)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors tabular-nums"
                  >
                    Ver todos ({filteredMatches.length})
                  </button>
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};
