import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  Trophy,
  Award,
  Star,
  User,
  Search,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Camera,
  Sparkles,
} from 'lucide-react';
import { GOLDEN_BOOT_WINNERS, LEGENDS_DATA } from '../../data/juniorData';
import {
  SCORER_ERA_FILTERS,
  TOP_50_SCORERS_DATA,
  TOP_50_SCORERS_LAST_UPDATED,
  TOP_50_SCORERS_SOURCE_URL,
} from '../../data/topScorers50Data';
import {
  GoldenBootRecord,
  PlayerLegend,
  ScorerEraBucket,
  ScorerSortKey,
  ScorerSpecialFilter,
  TopScorerProfile,
} from '../../types/football';
import {
  filterTopScorers,
  getAdjacentScorers,
  getInternationalGoals,
  getScorerEraCounts,
} from '../../utils/topScorersLogic';
import { ScorerPortrait } from '../ScorerPortrait';
import { NationalityFlag } from '../NationalityFlag';

const SPECIAL_FILTER_OPTIONS: Array<{ id: ScorerSpecialFilter; label: string }> = [
  { id: 'todos', label: 'Filtro: Todos (50)' },
  { id: 'foto-archivo', label: 'Con fotografía real de archivo' },
  { id: 'botin-oro', label: 'Ganadores de Botín de Oro' },
  { id: 'extranjeros', label: 'Artilleros extranjeros' },
  { id: 'activos', label: 'Activos en el club (2026)' },
];

const SORT_OPTIONS: Array<{ id: ScorerSortKey; label: string }> = [
  { id: 'rank', label: 'Orden: Puesto histórico (#1–#50)' },
  { id: 'liga', label: 'Orden: Más goles en Liga' },
  { id: 'internacional', label: 'Orden: Más goles CONMEBOL' },
];

export const TopScorersModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'botines' | 'detalle'>('ranking');
  const [selectedScorerId, setSelectedScorerId] = useState<string>(TOP_50_SCORERS_DATA[0].id);
  const [mobileDetailOpen, setMobileDetailOpen] = useState<boolean>(false);
  const [selectedLegendId, setSelectedLegendId] = useState<string>('valenciano');

  // Top 50 filter state
  const [eraFilter, setEraFilter] = useState<ScorerEraBucket>('todos');
  const [specialFilter, setSpecialFilter] = useState<ScorerSpecialFilter>('todos');
  const [sortBy, setSortBy] = useState<ScorerSortKey>('rank');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const eraCounts = useMemo(() => getScorerEraCounts(TOP_50_SCORERS_DATA), []);

  const filteredScorers = useMemo(
    () =>
      filterTopScorers(TOP_50_SCORERS_DATA, {
        era: eraFilter,
        special: specialFilter,
        sortBy,
        query: searchQuery,
      }),
    [eraFilter, specialFilter, sortBy, searchQuery]
  );

  const verifiedPhotosCount = useMemo(
    () => TOP_50_SCORERS_DATA.filter((s) => Boolean(s.photoUrl)).length,
    []
  );

  const selectedScorer: TopScorerProfile = useMemo(() => {
    return (
      TOP_50_SCORERS_DATA.find((s) => s.id === selectedScorerId) || TOP_50_SCORERS_DATA[0]
    );
  }, [selectedScorerId]);

  const adjacent = useMemo(() => {
    const navigationList =
      filteredScorers.some((s) => s.id === selectedScorer.id)
        ? filteredScorers
        : TOP_50_SCORERS_DATA;
    return getAdjacentScorers(navigationList, selectedScorer.id);
  }, [filteredScorers, selectedScorer.id]);

  const selectedLegend: PlayerLegend =
    LEGENDS_DATA.find((l) => l.id === selectedLegendId) || LEGENDS_DATA[0];

  const podiumTop3 = TOP_50_SCORERS_DATA.slice(0, 3);

  // Sync deep-link / global search selection (junior-select-top-scorer)
  useEffect(() => {
    const selectScorerById = (scorerId?: string | null) => {
      if (!scorerId) return;
      const found = TOP_50_SCORERS_DATA.find((s) => s.id === scorerId);
      if (!found) return;
      setActiveTab('ranking');
      setEraFilter('todos');
      setSpecialFilter('todos');
      setSortBy('rank');
      setSearchQuery('');
      setSelectedScorerId(found.id);
      window.setTimeout(() => {
        const el = document.getElementById(`scorer-row-${found.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 90);
    };

    try {
      const pending = sessionStorage.getItem('junior-pending-top-scorer');
      if (pending) {
        selectScorerById(pending);
        sessionStorage.removeItem('junior-pending-top-scorer');
      }
    } catch {
      // Ignore storage errors
    }

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ scorerId?: string }>;
      selectScorerById(custom.detail?.scorerId);
      try {
        sessionStorage.removeItem('junior-pending-top-scorer');
      } catch {
        // Ignore storage errors
      }
    };

    window.addEventListener('junior-select-top-scorer', handleCustomEvent);
    return () => {
      window.removeEventListener('junior-select-top-scorer', handleCustomEvent);
    };
  }, []);

  const handleSelectScorer = (scorer: TopScorerProfile, openMobileModal = false) => {
    setSelectedScorerId(scorer.id);
    if (openMobileModal && window.innerWidth < 1024) {
      setMobileDetailOpen(true);
    }
  };

  const handleOpenLegendProfile = (legendId: string) => {
    setSelectedLegendId(legendId);
    setActiveTab('detalle');
    setMobileDetailOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setEraFilter('todos');
    setSpecialFilter('todos');
    setSortBy('rank');
    setSearchQuery('');
  };

  const findScorerByName = (playerName: string): TopScorerProfile | undefined => {
    const clean = (val: string) =>
      val
        .replace(/"[^"]*"|«[^»]*»/g, ' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const norm = clean(playerName);
    return TOP_50_SCORERS_DATA.find((s) => {
      const sName = clean(s.name);
      const sNick = clean(s.nickname || '');
      return (
        norm.includes(sName) ||
        sName.includes(norm) ||
        (sNick.length > 4 && norm.includes(sNick))
      );
    });
  };

  const renderDossierContent = (scorer: TopScorerProfile) => {
    const intlGoals = getInternationalGoals(scorer);
    const ratio =
      scorer.matches && scorer.matches > 0
        ? (scorer.totalGoals / scorer.matches).toFixed(2)
        : null;

    return (
      <div className="space-y-5">
        {/* Top identity header */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
          <ScorerPortrait scorer={scorer} size="xl" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono tabular-nums">
              <span className="text-amber-400 font-bold">
                Puesto #{String(scorer.rank).padStart(2, '0')}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">{scorer.nationality}</span>
              {scorer.isActiveAtClub && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold">Activo 2026</span>
                </>
              )}
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-[1.06]">
              <span>{scorer.name}</span>
              <NationalityFlag
                countryCode={scorer.countryCode}
                nationality={scorer.nationality}
                size="md"
                className="ml-2 align-middle -mt-1"
              />
            </h3>

            {scorer.nickname && (
              <p className="text-xs text-amber-300 font-medium">
                «{scorer.nickname}»
              </p>
            )}

            <p className="text-xs text-slate-400 leading-snug pt-0.5">
              {scorer.position} · <span className="font-mono">{scorer.periods}</span>
            </p>
          </div>
        </div>

        {/* Photo provenance line */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            {scorer.photoUrl
              ? scorer.photoAttribution || 'Fotografía de archivo verificado'
              : 'Retrato editorial conmemorativo de archivo (sin fotografía libre verificada)'}
          </span>
        </div>

        {/* Key total metrics */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-800 text-center tabular-nums">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Goles Oficiales
            </div>
            <div className="font-display text-3xl font-black text-amber-400 mt-0.5">
              {scorer.totalGoals}
            </div>
          </div>
          <div className="border-x border-slate-800 px-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Liga Primera A
            </div>
            <div className="font-display text-2xl font-bold text-white mt-1">
              {scorer.breakdown.liga}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {ratio ? 'Promedio' : 'CONMEBOL'}
            </div>
            <div className="font-display text-2xl font-bold text-sky-400 mt-1">
              {ratio ? ratio : intlGoals}
            </div>
            {scorer.matches && (
              <div className="text-[10px] font-mono text-slate-500">
                {scorer.matches} PJ
              </div>
            )}
          </div>
        </div>

        {/* Competition breakdown table */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Desglose oficial por competencia
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs tabular-nums">
            <div className="flex items-baseline justify-between py-1.5 border-b border-slate-800/80">
              <dt className="text-slate-400">Liga</dt>
              <dd className="font-mono font-bold text-white">{scorer.breakdown.liga}</dd>
            </div>
            <div className="flex items-baseline justify-between py-1.5 border-b border-slate-800/80">
              <dt className="text-slate-400">Copa Col.</dt>
              <dd className="font-mono font-bold text-white">{scorer.breakdown.copa}</dd>
            </div>
            <div className="flex items-baseline justify-between py-1.5 border-b border-slate-800/80">
              <dt className="text-slate-400">Superliga</dt>
              <dd className="font-mono font-bold text-white">{scorer.breakdown.superliga}</dd>
            </div>
            <div className="flex items-baseline justify-between py-1.5 border-b border-slate-800/80">
              <dt className="text-slate-400">Libertadores</dt>
              <dd className="font-mono font-bold text-sky-300">{scorer.breakdown.libertadores}</dd>
            </div>
            <div className="flex items-baseline justify-between py-1.5 border-b border-slate-800/80">
              <dt className="text-slate-400">Sudamericana</dt>
              <dd className="font-mono font-bold text-sky-300">{scorer.breakdown.sudamericana}</dd>
            </div>
            <div className="flex items-baseline justify-between py-1.5 border-b border-slate-800/80">
              <dt className="text-slate-400">Conmebol</dt>
              <dd className="font-mono font-bold text-sky-300">{scorer.breakdown.conmebol}</dd>
            </div>
          </dl>
        </div>

        {/* Honors & Golden Boots */}
        {(scorer.goldenBoots || scorer.titlesNote) && (
          <div className="space-y-1.5 text-xs pt-1">
            {scorer.goldenBoots && scorer.goldenBoots.length > 0 && (
              <p className="text-amber-300 leading-relaxed">
                <span className="uppercase tracking-wider text-[10px] font-bold text-amber-400 mr-1.5">
                  Botín de Oro Dimayor:
                </span>
                {scorer.goldenBoots.join(' · ')}
              </p>
            )}
            {scorer.titlesNote && (
              <p className="text-slate-300 leading-relaxed">
                <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500 mr-1.5">
                  Palmarés / Hito:
                </span>
                {scorer.titlesNote}
              </p>
            )}
          </div>
        )}

        {/* Concise historical bio */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-prose">
          {scorer.bio}
        </p>

        {/* Link to extended Legend biography if available */}
        {scorer.legendId && (
          <button
            type="button"
            onClick={() => handleOpenLegendProfile(scorer.legendId!)}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-amber-300 hover:text-amber-200 inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver biografía extendida en Ficha Técnica Ídolo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Prev / Next Navigation */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!adjacent.prev}
            onClick={() => adjacent.prev && setSelectedScorerId(adjacent.prev.id)}
            className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>
              {adjacent.prev ? `#${adjacent.prev.rank} ${adjacent.prev.name.split(' ')[0]}` : 'Inicio'}
            </span>
          </button>

          <button
            type="button"
            disabled={!adjacent.next}
            onClick={() => adjacent.next && setSelectedScorerId(adjacent.next.id)}
            className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>
              {adjacent.next ? `#${adjacent.next.rank} ${adjacent.next.name.split(' ')[0]}` : 'Final'}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section
      id="goleadores-historicos"
      className="py-10 sm:py-14 bg-slate-950 border-b border-slate-800 scroll-mt-16 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-8 border-b border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2.5">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Módulo 03 · Cañoneros Legendarios</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Top 50 Oficial (1948–2026)</span>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <img
                src="/assets/aistudio/image_82370351.png"
                alt="Escudo Oficial Junior de Barranquilla"
                className="w-11 h-11 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-md"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-[1.04] [text-wrap:balance]">
                  Top 50 Goleadores Históricos
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                  Los 50 máximos artilleros oficiales en la historia de Junior de Barranquilla con retrato de archivo, desglose por competencia y ficha técnica interactiva.
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-mono tabular-nums">
              <span>50 artilleros verificados</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>{verifiedPhotosCount} fotografías reales + {50 - verifiedPhotosCount} retratos editoriales</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span>{TOP_50_SCORERS_LAST_UPDATED}</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <a
                href={TOP_50_SCORERS_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline underline-offset-4 font-sans"
              >
                <span>Fuente Wikipedia</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Subtabs Switcher */}
          <nav
            aria-label="Vistas del módulo Goleadores"
            className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full shrink-0"
          >
            <button
              type="button"
              onClick={() => setActiveTab('ranking')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top 50 Histórico</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('botines')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'botines'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>15 Botines de Oro</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detalle')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'detalle'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Ficha Técnica Ídolo</span>
            </button>
          </nav>
        </header>

        {/* ================================================================= */}
        {/* TAB 1: TOP 50 HISTÓRICO CON FOTOGRAFÍA Y FICHA INTERACTIVA        */}
        {/* ================================================================= */}
        {activeTab === 'ranking' && (
          <div className="space-y-8">
            {/* Curatorial Podium Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {podiumTop3.map((scorer) => {
                const isSelected = selectedScorer.id === scorer.id;
                const rankColor =
                  scorer.rank === 1
                    ? 'text-amber-400'
                    : scorer.rank === 2
                    ? 'text-slate-200'
                    : 'text-amber-600';

                return (
                  <button
                    key={scorer.id}
                    type="button"
                    onClick={() => handleSelectScorer(scorer, true)}
                    className={`text-left p-4 sm:p-5 rounded-xl bg-slate-900 border transition-colors flex items-center gap-4 min-w-0 ${
                      isSelected
                        ? 'border-amber-500/70 bg-slate-900'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <ScorerPortrait scorer={scorer} size="lg" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums">
                        <span className={`font-bold ${rankColor}`}>
                          #{scorer.rank} Histórico
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400 truncate">
                          {scorer.isActiveAtClub ? 'Activo' : scorer.countryCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="font-display text-xl font-black uppercase text-white tracking-tight leading-tight truncate">
                          {scorer.name}
                        </h2>
                        <NationalityFlag
                          countryCode={scorer.countryCode}
                          nationality={scorer.nationality}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-baseline gap-2 pt-0.5 tabular-nums">
                        <span className="font-display text-2xl font-black text-amber-400">
                          {scorer.totalGoals}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          goles · {scorer.matches} PJ
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {scorer.periods}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Filter & Search Toolbar */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search input */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar entre los 50 (ej. Ephanor, Borja, Rigoberto, Brasil)..."
                    aria-label="Buscar goleador histórico"
                    className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Limpiar búsqueda de goleador"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Special Filter */}
                <div className="md:col-span-3">
                  <select
                    value={specialFilter}
                    onChange={(e) =>
                      setSpecialFilter(e.target.value as ScorerSpecialFilter)
                    }
                    aria-label="Filtrar goleadores por criterio"
                    className="w-full py-2.5 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {SPECIAL_FILTER_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort selector */}
                <div className="md:col-span-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as ScorerSortKey)}
                    aria-label="Ordenar listado de goleadores"
                    className="w-full py-2.5 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Era Segmented Filters + Results Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {SCORER_ERA_FILTERS.map((era) => {
                    const active = eraFilter === era.id;
                    return (
                      <button
                        key={era.id}
                        type="button"
                        onClick={() => setEraFilter(era.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                          active
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{era.shortLabel}</span>{' '}
                        <span
                          className={`ml-1 font-mono text-[11px] tabular-nums ${
                            active ? 'text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          ({eraCounts[era.id]})
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 font-mono tabular-nums shrink-0">
                  <span>
                    Mostrando <strong className="text-white">{filteredScorers.length}</strong> de 50
                  </span>
                  {(eraFilter !== 'todos' ||
                    specialFilter !== 'todos' ||
                    sortBy !== 'rank' ||
                    searchQuery.trim() !== '') && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-sans font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 2-Column Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Top 50 Scorers List with Portrait Beside Each Player */}
              <div className="lg:col-span-7 min-w-0 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-slate-300">
                    Listado Oficial de los 50 Máximos Artilleros
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    Haz clic en un jugador para ver su ficha
                  </span>
                </div>

                {filteredScorers.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <p className="text-sm text-slate-200 font-medium">
                      No se encontraron goleadores que coincidan con tu búsqueda.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restablecer los 50 goleadores</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {filteredScorers.map((scorer) => {
                      const isSelected = selectedScorer.id === scorer.id;
                      const intlGoals = getInternationalGoals(scorer);

                      return (
                        <button
                          key={scorer.id}
                          id={`scorer-row-${scorer.id}`}
                          type="button"
                          onClick={() => handleSelectScorer(scorer, true)}
                          className={`w-full px-3.5 sm:px-5 py-3.5 text-left flex items-center justify-between gap-3 transition-colors scroll-mt-40 ${
                            isSelected
                              ? 'bg-slate-800/90'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                            {/* Tabular Rank Number */}
                            <span
                              className={`w-7 sm:w-8 text-center font-mono text-xs sm:text-sm font-bold tabular-nums shrink-0 ${
                                scorer.rank === 1
                                  ? 'text-amber-400'
                                  : scorer.rank === 2
                                  ? 'text-slate-100'
                                  : scorer.rank === 3
                                  ? 'text-amber-500'
                                  : isSelected
                                  ? 'text-white'
                                  : 'text-slate-400'
                              }`}
                            >
                              #{String(scorer.rank).padStart(2, '0')}
                            </span>

                            {/* Player Portrait Right Beside Name */}
                            <ScorerPortrait scorer={scorer} size="md" />

                            {/* Name & Clean Unboxed Metadata */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span
                                  className={`text-sm sm:text-[15px] font-bold leading-snug truncate ${
                                    isSelected ? 'text-amber-300' : 'text-white'
                                  }`}
                                >
                                  {scorer.name}
                                </span>
                                <NationalityFlag
                                  countryCode={scorer.countryCode}
                                  nationality={scorer.nationality}
                                  size="sm"
                                />
                                {scorer.nickname && (
                                  <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                                    «{scorer.nickname}»
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                <span>{scorer.nationality}</span>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span className="truncate">{scorer.position}</span>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span className="font-mono text-slate-400 tabular-nums">
                                  {scorer.periods}
                                </span>
                                {scorer.isActiveAtClub && (
                                  <>
                                    <span aria-hidden="true" className="text-slate-600">·</span>
                                    <span className="text-emerald-400 font-semibold">Activo</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Tabular Goals Metric */}
                          <div className="text-right shrink-0 tabular-nums pl-2">
                            <div className="font-display text-xl sm:text-2xl font-black text-amber-400 leading-none">
                              {scorer.totalGoals}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1 whitespace-nowrap">
                              {sortBy === 'internacional'
                                ? `${intlGoals} CONMEBOL`
                                : `${scorer.breakdown.liga} Liga`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Editorial Player Dossier (Desktop) */}
              <aside
                aria-label="Ficha detallada del goleador seleccionado"
                className="hidden lg:block lg:col-span-5 min-w-0 lg:sticky lg:top-44 rounded-xl bg-slate-900 border border-slate-800 p-6"
              >
                {renderDossierContent(selectedScorer)}
              </aside>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: 15 BOTINES DE ORO OFICIALES                                */}
        {/* ================================================================= */}
        {activeTab === 'botines' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">
                Los 15 Botines de Oro Dimayor con la Camiseta de Junior
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Delanteros que se consagraron máximos artilleros del fútbol profesional colombiano vistiendo la franja rojiblanca, desde Nelson Silva Pacheco (1973) hasta Luis Muriel (2026-I).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOLDEN_BOOT_WINNERS.map((gb: GoldenBootRecord) => {
                const matchedScorer = findScorerByName(gb.player);
                return (
                  <article
                    key={gb.id}
                    className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3.5">
                        {matchedScorer && (
                          <ScorerPortrait scorer={matchedScorer} size="sm" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                            <span className="font-bold text-amber-400">{gb.year}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-white font-semibold">{gb.goals} goles</span>
                          </div>
                          <h3 className="font-display text-lg font-extrabold text-white uppercase tracking-tight leading-snug mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{gb.player}</span>
                            {matchedScorer && (
                              <NationalityFlag
                                countryCode={matchedScorer.countryCode}
                                nationality={matchedScorer.nationality}
                                size="sm"
                              />
                            )}
                          </h3>
                          <div className="text-xs text-slate-400">{gb.tournament}</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pt-3 border-t border-slate-800/80">
                        {gb.note}
                      </p>
                    </div>

                    {matchedScorer && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScorerId(matchedScorer.id);
                          setActiveTab('ranking');
                          if (window.innerWidth < 1024) setMobileDetailOpen(true);
                        }}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors self-start"
                      >
                        <span>Ver puesto #{matchedScorer.rank} en el Top 50</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: FICHA TÉCNICA ÍDOLO                                        */}
        {/* ================================================================= */}
        {activeTab === 'detalle' && (
          <div className="space-y-6">
            {/* Scorer selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {LEGENDS_DATA.filter((l) => l.goals > 0).map((legend) => (
                <button
                  key={legend.id}
                  type="button"
                  onClick={() => setSelectedLegendId(legend.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-2 border ${
                    selectedLegend.id === legend.id
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{legend.name}</span>
                </button>
              ))}
            </div>

            {/* Detail Showcase */}
            {(() => {
              const matchedTopScorer = TOP_50_SCORERS_DATA.find(
                (s) => s.legendId === selectedLegend.id
              );
              return (
                <article className="p-6 sm:p-8 rounded-xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-4 min-w-0">
                      {matchedTopScorer && (
                        <ScorerPortrait scorer={matchedTopScorer} size="lg" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-mono text-amber-400 font-semibold">
                          {selectedLegend.nickname} · {selectedLegend.era}
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                          <span>{selectedLegend.name}</span>
                          {matchedTopScorer && (
                            <NationalityFlag
                              countryCode={matchedTopScorer.countryCode}
                              nationality={matchedTopScorer.nationality}
                              size="md"
                              className="ml-2.5 align-middle -mt-1"
                            />
                          )}
                        </h2>
                        <div className="text-xs text-slate-400">{selectedLegend.position}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 tabular-nums">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Goles
                        </div>
                        <div className="text-3xl font-black text-amber-400 font-display">
                          {matchedTopScorer ? matchedTopScorer.totalGoals : selectedLegend.goals}
                        </div>
                      </div>
                      <div className="pl-6 border-l border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Partidos
                        </div>
                        <div className="text-3xl font-black text-white font-display">
                          {selectedLegend.matches}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed max-w-prose">
                    {selectedLegend.bio}
                  </p>

                  <div className="pt-4 border-t border-slate-800/80 space-y-1 text-xs sm:text-sm">
                    <span className="text-amber-400 font-bold uppercase text-[11px] tracking-wider block">
                      Habilidad Registrada
                    </span>
                    <p className="text-slate-300 max-w-prose">{selectedLegend.signatureSkill}</p>
                  </div>

                  {selectedLegend.famousQuote && (
                    <blockquote className="py-4 border-y border-slate-800 text-sm text-slate-200 italic max-w-prose">
                      {selectedLegend.famousQuote}
                    </blockquote>
                  )}
                </article>
              );
            })()}
          </div>
        )}
      </div>

      {/* Mobile Detail Sheet / Modal (< lg) */}
      {mobileDetailOpen && activeTab === 'ranking' && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Ficha de ${selectedScorer.name}`}
          onClick={() => setMobileDetailOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Ficha Histórica · Top 50 Junior
              </span>
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                aria-label="Cerrar ficha de goleador"
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderDossierContent(selectedScorer)}
          </div>
        </div>
      )}
    </section>
  );
};
