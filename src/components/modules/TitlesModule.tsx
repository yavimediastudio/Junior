import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  MapPin,
  Search,
  Shield,
  Star,
  Table2,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import {
  CHAMPION_PLAYERS_RANKING,
  ENRICHED_OFFICIAL_TITLES,
  TROPHY_GALLERY_IMAGES,
} from '../../data/titlesMuseumData';
import { TOP_50_SCORERS_DATA } from '../../data/topScorers50Data';
import { getTournamentTeamCrest } from '../../utils/footballLogic';
import {
  buildChampionManagersRanking,
  filterOfficialTitles,
  getAdjacentTitles,
  getTitleCategoryTotals,
  TitleCategoryFilter,
  TitleFormatFilter,
} from '../../utils/titlesLogic';
import { AppModuleId, EnrichedOfficialTitle } from '../../types/football';

interface TitlesModuleProps {
  onNavigateToModule?: (moduleId: AppModuleId) => void;
}

type TitlesModuleTab = 'vitrina' | 'catalogo' | 'campeones' | 'criterio';
type ChampionsSubTab = 'tecnicos' | 'jugadores';

const FORMAT_LABELS: Record<TitleFormatFilter, string> = {
  todos: 'Todos los formatos',
  'final-ida-vuelta': 'Final ida y vuelta',
  'final-penales': 'Definido por penales',
  'tabla-cuadrangular': 'Tabla / Cuadrangular',
};

const CATEGORY_ACCENT: Record<EnrichedOfficialTitle['category'], string> = {
  'Liga (Estrella)': 'text-amber-400',
  'Copa Colombia': 'text-red-400',
  Superliga: 'text-sky-400',
};

export const TitlesModule: React.FC<TitlesModuleProps> = ({ onNavigateToModule }) => {
  const [activeTab, setActiveTab] = useState<TitlesModuleTab>('vitrina');
  const [vitrinaCategory, setVitrinaCategory] = useState<TitleCategoryFilter>('todos');
  const [selectedTitleId, setSelectedTitleId] = useState<string>(
    ENRICHED_OFFICIAL_TITLES[ENRICHED_OFFICIAL_TITLES.length - 1].id
  );
  const [catalogCategory, setCatalogCategory] = useState<TitleCategoryFilter>('todos');
  const [catalogFormat, setCatalogFormat] = useState<TitleFormatFilter>('todos');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [championsTab, setChampionsTab] = useState<ChampionsSubTab>('tecnicos');
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const totals = useMemo(() => getTitleCategoryTotals(ENRICHED_OFFICIAL_TITLES), []);
  const managersRanking = useMemo(
    () => buildChampionManagersRanking(ENRICHED_OFFICIAL_TITLES),
    []
  );
  const scorersById = useMemo(
    () => new Map(TOP_50_SCORERS_DATA.map((s) => [s.id, s])),
    []
  );
  const titlesById = useMemo(
    () => new Map(ENRICHED_OFFICIAL_TITLES.map((t) => [t.id, t])),
    []
  );

  // Sync deep-link selection via sessionStorage or custom event (#titulos?titulo=...)
  useEffect(() => {
    const applyPending = (titleId: string | null) => {
      if (!titleId) return;
      if (titlesById.has(titleId)) {
        setVitrinaCategory('todos');
        setSelectedTitleId(titleId);
        setActiveTab('vitrina');
      }
    };

    const pending = sessionStorage.getItem('junior-pending-official-title');
    if (pending) {
      sessionStorage.removeItem('junior-pending-official-title');
      applyPending(pending);
    }

    const handleCustomEvent = (event: Event) => {
      const custom = event as CustomEvent<{ titleId?: string }>;
      if (custom.detail?.titleId) {
        sessionStorage.removeItem('junior-pending-official-title');
        applyPending(custom.detail.titleId);
      }
    };

    window.addEventListener('junior-select-official-title', handleCustomEvent);
    return () => window.removeEventListener('junior-select-official-title', handleCustomEvent);
  }, [titlesById]);

  const vitrinaTitles = useMemo(
    () =>
      filterOfficialTitles(ENRICHED_OFFICIAL_TITLES, {
        category: vitrinaCategory,
        format: 'todos',
        query: '',
      }),
    [vitrinaCategory]
  );

  // Keep selectedTitleId aligned when vitrinaCategory narrows the list
  const selectedTitle = useMemo(() => {
    const inFiltered = vitrinaTitles.find((t) => t.id === selectedTitleId);
    if (inFiltered) return inFiltered;
    return vitrinaTitles[vitrinaTitles.length - 1] ?? ENRICHED_OFFICIAL_TITLES[0];
  }, [vitrinaTitles, selectedTitleId]);

  const adjacent = useMemo(
    () => getAdjacentTitles(vitrinaTitles, selectedTitle.id),
    [vitrinaTitles, selectedTitle.id]
  );

  const catalogTitles = useMemo(
    () =>
      filterOfficialTitles(ENRICHED_OFFICIAL_TITLES, {
        category: catalogCategory,
        format: catalogFormat,
        query: catalogSearch,
      }),
    [catalogCategory, catalogFormat, catalogSearch]
  );

  const openTitleInVitrina = (titleId: string) => {
    setVitrinaCategory('todos');
    setSelectedTitleId(titleId);
    setActiveTab('vitrina');
    const el = document.getElementById('titulos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navigateToStandingsTable = (tableId: string) => {
    sessionStorage.setItem('junior-pending-standings-table', tableId);
    window.dispatchEvent(
      new CustomEvent('junior-select-standings-table', {
        detail: { tableId },
      })
    );
    onNavigateToModule?.('tablas-historicas');
  };

  const navigateToRivalHistory = (franchiseId: string) => {
    sessionStorage.setItem('junior-pending-rival-franchise', franchiseId);
    window.dispatchEvent(
      new CustomEvent('junior-select-rival-franchise', {
        detail: { franchiseId },
      })
    );
    onNavigateToModule?.('resultados-vs-equipos');
  };

  const navigateToTopScorer = (scorerId: string) => {
    sessionStorage.setItem('junior-pending-top-scorer', scorerId);
    window.dispatchEvent(
      new CustomEvent('junior-select-top-scorer', {
        detail: { scorerId },
      })
    );
    onNavigateToModule?.('goleadores-historicos');
  };

  const renderEraCrest = (yearStr: string, teamName: string, isJunior = false, sizeClass = 'w-9 h-9') => {
    const crest = getTournamentTeamCrest({ year: yearStr }, teamName, isJunior);
    if (crest?.src) {
      return (
        <img
          src={crest.src}
          alt={crest.alt}
          title={crest.alt}
          referrerPolicy="no-referrer"
          className={`${sizeClass} object-contain shrink-0 drop-shadow-sm`}
        />
      );
    }
    return (
      <span
        className={`${sizeClass} rounded-md bg-slate-800 border border-slate-700 inline-flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 shrink-0`}
        title={teamName}
      >
        {teamName.slice(0, 3).toUpperCase()}
      </span>
    );
  };

  const trophyImgSrc =
    selectedTitle.championPhotoUrl ?? TROPHY_GALLERY_IMAGES[selectedTitle.category];
  const hasCustomChampionPhoto = Boolean(selectedTitle.championPhotoUrl);
  const trophyImgFailed = Boolean(imageErrorMap[selectedTitle.id]);
  const selectedYearStr = selectedTitle.shortYearLabel.replace(/^(Copa|Superliga)\s+/i, '');

  const maxManagerTitles = managersRanking[0]?.totalTitles ?? 5;
  const maxPlayerTitles = CHAMPION_PLAYERS_RANKING[0]?.totalTitles ?? 7;

  return (
    <section id="titulos" className="py-12 sm:py-16 bg-slate-950 border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Institutional Editorial Header */}
        <header className="pb-6 border-b border-slate-800 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-400 font-semibold">Sala de Trofeos</span>
                <span aria-hidden="true">·</span>
                <span>Palmarés Oficial Dimayor (1977–2026)</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance">
                Sala de Trofeos y Palmarés Oficial
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Archivo curatorial de las{' '}
                <strong className="text-white font-semibold">{totals.liga} Estrellas de Liga</strong>,{' '}
                <strong className="text-white font-semibold">{totals.copa} Copas Colombia</strong> y{' '}
                <strong className="text-white font-semibold">{totals.superliga} Superligas</strong>{' '}
                conquistadas por Junior de Barranquilla en el profesionalismo.
              </p>
            </div>

            {/* Clean Single-Line View Switcher */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full shrink-0">
              {(
                [
                  { id: 'vitrina', label: 'Vitrina y Campañas', icon: Trophy },
                  { id: 'catalogo', label: 'Catálogo de Finales', icon: Table2 },
                  { id: 'campeones', label: 'Más Campeones', icon: Users },
                  { id: 'criterio', label: 'Criterio Dimayor', icon: BookOpen },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curatorial Accession Metrics Strip (Flat hairline-divided bar, zero nested cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 border border-slate-800 rounded-lg bg-slate-900/50 divide-y sm:divide-y-0 divide-x divide-slate-800">
            <div className="px-4 py-3">
              <div className="text-[11px] text-slate-400">Estrellas de Liga</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-amber-400 mt-0.5">
                {totals.liga}
              </div>
              <div className="text-[11px] text-slate-400">Primera División</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[11px] text-slate-400">Copa Colombia</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-red-400 mt-0.5">
                {totals.copa}
              </div>
              <div className="text-[11px] text-slate-400">2015 · 2017</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[11px] text-slate-400">Superliga</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-sky-400 mt-0.5">
                {totals.superliga}
              </div>
              <div className="text-[11px] text-slate-400">2019 · 2020</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[11px] text-slate-400">Definidos en penales</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-slate-100 mt-0.5">
                {totals.shootouts}
              </div>
              <div className="text-[11px] text-slate-400">100 % ganados en final</div>
            </div>
            <div className="col-span-2 sm:col-span-1 px-4 py-3 bg-slate-900/90">
              <div className="text-[11px] text-amber-400 font-medium">Total Dimayor</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-white mt-0.5">
                {totals.total}
              </div>
              <div className="text-[11px] text-slate-400">Títulos oficiales</div>
            </div>
          </div>
        </header>

        {/* ================================================================= */}
        {/* TAB 1: VITRINA & FICHAS DE CAMPAÑA (16 TÍTULOS OFICIALES)         */}
        {/* ================================================================= */}
        {activeTab === 'vitrina' && (
          <div className="space-y-6">
            {/* Gallery Rail Toolbar: Category Filter + Prev / Next Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                {(
                  [
                    { id: 'todos', label: `Todos (${totals.total})` },
                    { id: 'liga', label: `Estrellas de Liga (${totals.liga})` },
                    { id: 'copa', label: `Copas Colombia (${totals.copa})` },
                    { id: 'superliga', label: `Superligas (${totals.superliga})` },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setVitrinaCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      vitrinaCategory === cat.id
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-mono tabular-nums text-slate-400 mr-1">
                  {adjacent.currentIndex + 1} / {vitrinaTitles.length}
                </span>
                <button
                  type="button"
                  disabled={!adjacent.prev}
                  onClick={() => adjacent.prev && setSelectedTitleId(adjacent.prev.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  disabled={!adjacent.next}
                  onClick={() => adjacent.next && setSelectedTitleId(adjacent.next.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Chronological 16-Title Interactive Gallery Rail */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {vitrinaTitles.map((item) => {
                const isSelected = item.id === selectedTitle.id;
                const isStar = item.category === 'Liga (Estrella)';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedTitleId(item.id)}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-mono tabular-nums">
                      <span className={CATEGORY_ACCENT[item.category]}>
                        {isStar ? `★ ${item.starNumber}` : item.category === 'Copa Colombia' ? 'Copa' : 'Super'}
                      </span>
                      <span className="text-slate-500">#{String(item.number).padStart(2, '0')}</span>
                    </div>
                    <div className="font-display text-base font-bold text-white mt-0.5 truncate">
                      {item.shortYearLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      vs {item.rivalDisplayName.replace(/^Independiente\s+|^Atlético\s+|^Deportes\s+|^Deportivo\s+/, '')}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Asymmetric 2-Column Editorial Trophy Showcase (5 cols Plinth / 7 cols Dossier) */}
            <article className="grid grid-cols-1 lg:grid-cols-12 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50 items-stretch">
              {/* LEFT: Museum Trophy Plinth & Era Crests Matchup (5 cols) */}
              <div className="lg:col-span-5 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950">
                {hasCustomChampionPhoto ? (
                  <div className="flex flex-col flex-1 bg-slate-950">
                    {/* Native Orientation Archival Champion Photograph Frame */}
                    <div
                      className={`relative w-full overflow-hidden bg-slate-950 ${
                        selectedTitle.championPhotoOrientation === 'portrait'
                          ? 'aspect-[3/4] max-h-[520px]'
                          : 'aspect-[3/2]'
                      }`}
                    >
                      {!trophyImgFailed ? (
                        <img
                          src={trophyImgSrc}
                          alt={
                            selectedTitle.championPhotoCaption ??
                            `Campeón ${selectedTitle.titleName}`
                          }
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setImageErrorMap((prev) => ({
                              ...prev,
                              [selectedTitle.id]: true,
                            }))
                          }
                          className={`w-full h-full ${
                            selectedTitle.championPhotoOrientation === 'portrait'
                              ? 'object-cover object-top'
                              : 'object-cover object-center'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center">
                          <Trophy className={`w-16 h-16 mb-3 ${CATEGORY_ACCENT[selectedTitle.category]}`} />
                          <span className="font-display text-2xl font-bold text-white">
                            {selectedTitle.titleName}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none" />
                    </div>

                    {/* Curatorial Plaque Below Archival Photo */}
                    <div className="p-5 space-y-1.5 border-t border-slate-800/80 bg-slate-950">
                      <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                        <div className="flex items-center gap-2 text-amber-400">
                          <span>TÍTULO #{String(selectedTitle.number).padStart(2, '0')}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {selectedTitle.starNumber
                              ? `ESTRELLA ★${selectedTitle.starNumber}`
                              : selectedTitle.category.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">Archivo Histórico</span>
                      </div>
                      <div className="font-display text-2xl font-extrabold text-white tracking-tight">
                        {selectedTitle.titleName}
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {selectedTitle.championPhotoCaption ??
                          `${selectedTitle.date} · ${selectedTitle.venue}`}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Museum Trophy Artwork Pedestal */
                  <div className="relative aspect-[4/3] lg:aspect-[3/4] w-full overflow-hidden bg-slate-950 flex-1 min-h-[300px]">
                    {!trophyImgFailed ? (
                      <img
                        src={trophyImgSrc}
                        alt={`Trofeo oficial de ${selectedTitle.titleName}`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setImageErrorMap((prev) => ({
                            ...prev,
                            [selectedTitle.id]: true,
                          }))
                        }
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center">
                        <Trophy className={`w-16 h-16 mb-3 ${CATEGORY_ACCENT[selectedTitle.category]}`} />
                        <span className="font-display text-2xl font-bold text-white">
                          {selectedTitle.titleName}
                        </span>
                      </div>
                    )}

                    {/* Measured Contrast Scrim for Curatorial Plaque */}
                    <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 p-5 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-amber-400">
                        <span>TÍTULO #{String(selectedTitle.number).padStart(2, '0')}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {selectedTitle.starNumber
                            ? `ESTRELLA ★${selectedTitle.starNumber}`
                            : selectedTitle.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-display text-2xl font-extrabold text-white tracking-tight">
                        {selectedTitle.titleName}
                      </div>
                      <div className="text-xs text-slate-300">
                        {selectedTitle.date} · {selectedTitle.venue}
                      </div>
                    </div>
                  </div>
                )}

                {/* Era-Accurate Crests Matchup Bar */}
                <div className="p-5 border-t border-slate-800 bg-slate-900/70 space-y-3 mt-auto">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Cruce histórico con escudos de época</span>
                    <span className="font-mono tabular-nums">{selectedTitle.shortYearLabel}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderEraCrest(selectedYearStr, 'Junior', true, 'w-11 h-11')}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">Junior</div>
                        <div className="text-[11px] text-amber-400">Campeón</div>
                      </div>
                    </div>

                    <div className="text-center shrink-0 px-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Final</div>
                      <div className="text-xs font-semibold text-slate-200">vs</div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 min-w-0 text-right">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate">
                          {selectedTitle.rivalDisplayName}
                        </div>
                        <div className="text-[11px] text-slate-400">Subcampeón / Rival</div>
                      </div>
                      {renderEraCrest(selectedYearStr, selectedTitle.rivalDisplayName, false, 'w-11 h-11')}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">Desenlace oficial</span>
                    <span className="font-mono font-semibold text-amber-300 tabular-nums text-right">
                      {selectedTitle.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Campaign Story, Match Legs, Shootout & Cross-Links (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  {/* Dossier Heading & Story */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className={`font-semibold ${CATEGORY_ACCENT[selectedTitle.category]}`}>
                        {selectedTitle.starNumber
                          ? `Estrella de Liga #${selectedTitle.starNumber}`
                          : selectedTitle.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{selectedTitle.shortYearLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{FORMAT_LABELS[selectedTitle.formatType]}</span>
                    </div>

                    <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
                      {selectedTitle.titleName}
                    </h3>

                    <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed max-w-prose">
                      {selectedTitle.description}
                    </p>
                  </div>

                  {/* Editorial Pull-Quote (Top/Bottom hairline dividers, no thick left bar) */}
                  <blockquote className="py-4 border-y border-slate-800 space-y-1.5">
                    <div className="text-[11px] font-semibold text-amber-400">
                      Momento inolvidable de la consagración
                    </div>
                    <p className="text-sm sm:text-base italic text-slate-100 leading-relaxed max-w-prose">
                      &ldquo;{selectedTitle.keyMoment}&rdquo;
                    </p>
                  </blockquote>

                  {/* Acta Completa de la Final (Ida, Vuelta y Penales) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        Acta de la Final y Definición
                      </h4>
                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        {selectedTitle.finalMatches.length}{' '}
                        {selectedTitle.finalMatches.length === 1 ? 'partido clave' : 'partidos'}
                      </span>
                    </div>

                    <div className="border border-slate-800 rounded-lg divide-y divide-slate-800 bg-slate-950/60 overflow-hidden">
                      {selectedTitle.finalMatches.map((leg, idx) => {
                        const homeIsJunior = leg.homeTeam.toLowerCase().includes('junior');
                        const awayIsJunior = leg.awayTeam.toLowerCase().includes('junior');
                        return (
                          <div key={`${selectedTitle.id}-leg-${idx}`} className="p-4 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-200">{leg.stage}</span>
                              <span className="font-mono tabular-nums">
                                {leg.date} · {leg.venue}
                              </span>
                            </div>

                            <div className="grid grid-cols-12 items-center gap-2">
                              <div className="col-span-5 flex items-center gap-2 min-w-0">
                                {renderEraCrest(selectedYearStr, leg.homeTeam, homeIsJunior, 'w-6 h-6')}
                                <span
                                  className={`text-xs sm:text-sm truncate ${
                                    homeIsJunior ? 'font-bold text-white' : 'font-medium text-slate-300'
                                  }`}
                                >
                                  {leg.homeTeam}
                                </span>
                              </div>

                              <div className="col-span-2 text-center font-mono text-base sm:text-lg font-bold tabular-nums text-amber-300">
                                {leg.homeScore} – {leg.awayScore}
                              </div>

                              <div className="col-span-5 flex items-center justify-end gap-2 min-w-0 text-right">
                                <span
                                  className={`text-xs sm:text-sm truncate ${
                                    awayIsJunior ? 'font-bold text-white' : 'font-medium text-slate-300'
                                  }`}
                                >
                                  {leg.awayTeam}
                                </span>
                                {renderEraCrest(selectedYearStr, leg.awayTeam, awayIsJunior, 'w-6 h-6')}
                              </div>
                            </div>

                            <div className="text-xs text-slate-400 leading-relaxed">
                              <span className="text-slate-500">Goles: </span>
                              <span className="text-slate-300">{leg.scorers}</span>
                            </div>
                          </div>
                        );
                      })}

                      {selectedTitle.penaltyShootout && (
                        <div className="p-4 bg-slate-900/70 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-amber-400">
                              Definición desde el punto penal
                            </span>
                            <span className="font-mono text-xs font-bold tabular-nums text-white">
                              {selectedTitle.penaltyShootout.scoreLabel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {selectedTitle.penaltyShootout.summary}
                          </p>
                          <p className="text-xs text-slate-400">
                            <span className="text-slate-300 font-medium">Cobro decisivo: </span>
                            {selectedTitle.penaltyShootout.keyKick}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Museum Accession Metadata Grid (<dl>) */}
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <dt className="text-slate-400">Director Técnico</dt>
                      <dd className="text-slate-100 font-semibold mt-0.5">{selectedTitle.manager}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Figuras Consagradas</dt>
                      <dd className="text-amber-300 font-semibold mt-0.5">{selectedTitle.hero}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Fecha de Consagración</dt>
                      <dd className="text-slate-200 font-medium mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span>{selectedTitle.date}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Escenario</dt>
                      <dd className="text-slate-200 font-medium mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span>{selectedTitle.venue}</span>
                      </dd>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-slate-800/70">
                      <dt className="text-slate-400">Ruta de Campaña</dt>
                      <dd className="text-slate-300 mt-0.5 leading-relaxed">
                        {selectedTitle.campaignSummary}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Direct Cross-Module Navigation Actions */}
                <div className="pt-5 border-t border-slate-800 space-y-3">
                  <div className="text-xs font-medium text-slate-400">
                    Explorar registros relacionados en la enciclopedia
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {selectedTitle.standingsTableId && onNavigateToModule && (
                      <button
                        type="button"
                        onClick={() => navigateToStandingsTable(selectedTitle.standingsTableId!)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Ver tabla histórica {selectedTitle.shortYearLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}

                    {onNavigateToModule && (
                      <button
                        type="button"
                        onClick={() => navigateToRivalHistory(selectedTitle.rivalFranchiseId)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                        <span>Historial vs {selectedTitle.rivalDisplayName}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}

                    {onNavigateToModule &&
                      selectedTitle.featuredScorerIds.slice(0, 3).map((scorerId) => {
                        const scorer = scorersById.get(scorerId);
                        if (!scorer) return null;
                        return (
                          <button
                            key={scorerId}
                            type="button"
                            onClick={() => navigateToTopScorer(scorerId)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <span>Goleador: {scorer.name}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: CATÁLOGO DE FINALES Y TÍTULOS (16 CAMPEONATOS)             */}
        {/* ================================================================= */}
        {activeTab === 'catalogo' && (
          <div className="space-y-5">
            {/* Interactive Filter Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                  {(
                    [
                      { id: 'todos', label: `Todos (${totals.total})` },
                      { id: 'liga', label: `Ligas (${totals.liga})` },
                      { id: 'copa', label: `Copas (${totals.copa})` },
                      { id: 'superliga', label: `Superligas (${totals.superliga})` },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCatalogCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        catalogCategory === cat.id
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                  {(Object.keys(FORMAT_LABELS) as TitleFormatFilter[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setCatalogFormat(fmt)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        catalogFormat === fmt
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {FORMAT_LABELS[fmt]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full lg:w-72">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar por rival, DT, año o héroe..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
                />
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {catalogTitles.length === 0 ? (
              <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-10 text-center">
                <p className="text-sm font-semibold text-slate-200">
                  No se encontraron títulos con los filtros seleccionados.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Prueba ampliando el tipo de competencia o limpiando el buscador.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogCategory('todos');
                    setCatalogFormat('todos');
                    setCatalogSearch('');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-[11px] font-semibold text-slate-400">
                        <th className="py-3 pl-4 pr-2 w-14">N.°</th>
                        <th className="py-3 px-3 w-28">Temporada</th>
                        <th className="py-3 px-3 min-w-[210px]">Campeonato</th>
                        <th className="py-3 px-3 min-w-[190px]">Rival / Subcampeón</th>
                        <th className="py-3 px-3 min-w-[200px]">Marcador oficial</th>
                        <th className="py-3 px-3 min-w-[160px]">Director Técnico</th>
                        <th className="py-3 pl-3 pr-4 text-right w-32">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-xs">
                      {catalogTitles.map((item) => {
                        const yearToken = item.shortYearLabel.replace(/^(Copa|Superliga)\s+/i, '');
                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 pl-4 pr-2 font-mono tabular-nums text-slate-400">
                              #{String(item.number).padStart(2, '0')}
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums whitespace-nowrap">
                              <div className="font-semibold text-white">{item.shortYearLabel}</div>
                              <div className={`text-[11px] ${CATEGORY_ACCENT[item.category]}`}>
                                {item.starNumber ? `Estrella ★${item.starNumber}` : item.category}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-100">{item.titleName}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                {item.hero}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                {renderEraCrest(yearToken, item.rivalDisplayName, false, 'w-6 h-6')}
                                <span className="text-slate-200 font-medium">
                                  {item.rivalDisplayName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-300">
                              <div>{item.score}</div>
                              {item.penaltyShootout && (
                                <div className="text-[11px] text-amber-400">
                                  Penales: {item.penaltyShootout.scoreLabel}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-300">{item.manager}</td>
                            <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openTitleInVitrina(item.id)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                              >
                                <span>Abrir ficha</span>
                                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: SALÓN DE LOS MÁS CAMPEONES (DTs Y JUGADORES)               */}
        {/* ================================================================= */}
        {activeTab === 'campeones' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Salón de los Más Laureados
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecciona cualquier título listado para abrir directamente su ficha de campaña en la vitrina.
                </p>
              </div>

              <div className="inline-flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChampionsTab('tecnicos')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    championsTab === 'tecnicos'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Directores Técnicos ({managersRanking.length})
                </button>
                <button
                  type="button"
                  onClick={() => setChampionsTab('jugadores')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    championsTab === 'jugadores'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Jugadores Históricos ({CHAMPION_PLAYERS_RANKING.length})
                </button>
              </div>
            </div>

            {championsTab === 'tecnicos' ? (
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 bg-slate-900/40 overflow-hidden">
                {managersRanking.map((mgr, idx) => {
                  const pct = Math.max(12, Math.round((mgr.totalTitles / maxManagerTitles) * 100));
                  return (
                    <div
                      key={mgr.name}
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2.5">
                          <span className="font-mono text-xs tabular-nums text-slate-500 w-6">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <h4 className="font-display text-xl font-bold text-white">
                            {mgr.name}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {mgr.ligaTitles > 0 ? `${mgr.ligaTitles} Liga${mgr.ligaTitles > 1 ? 's' : ''}` : ''}
                            {mgr.copaTitles > 0
                              ? `${mgr.ligaTitles > 0 ? ' · ' : ''}${mgr.copaTitles} Copa`
                              : ''}
                            {mgr.superligaTitles > 0
                              ? `${mgr.ligaTitles > 0 || mgr.copaTitles > 0 ? ' · ' : ''}${mgr.superligaTitles} Superliga`
                              : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed pl-8 max-w-2xl">
                          {mgr.highlight}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pl-8 pt-1">
                          {mgr.titleIds.map((tId) => {
                            const t = titlesById.get(tId);
                            if (!t) return null;
                            return (
                              <button
                                key={tId}
                                type="button"
                                onClick={() => openTitleInVitrina(tId)}
                                className="px-2.5 py-1 text-[11px] font-mono tabular-nums text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/60 rounded transition-colors whitespace-nowrap"
                              >
                                {t.starNumber ? `★${t.starNumber} ${t.shortYearLabel}` : t.shortYearLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pl-8 lg:pl-0 lg:w-56 shrink-0">
                        <svg
                          viewBox="0 0 100 6"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                          className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden"
                        >
                          <rect x="0" y="0" width={pct} height="6" rx="3" className="fill-amber-400" />
                        </svg>
                        <div className="text-right font-mono tabular-nums w-16 shrink-0">
                          <span className="text-xl font-bold text-white">{mgr.totalTitles}</span>
                          <span className="text-[11px] text-slate-400 ml-1">
                            {mgr.totalTitles === 1 ? 'título' : 'títulos'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 bg-slate-900/40 overflow-hidden">
                {CHAMPION_PLAYERS_RANKING.map((player, idx) => {
                  const pct = Math.max(14, Math.round((player.totalTitles / maxPlayerTitles) * 100));
                  return (
                    <div
                      key={player.id}
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2.5">
                          <span className="font-mono text-xs tabular-nums text-slate-500 w-6">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <h4 className="font-display text-xl font-bold text-white">
                            {player.name}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {player.position} · {player.era}
                          </span>
                          {player.scorerId && onNavigateToModule && (
                            <button
                              type="button"
                              onClick={() => navigateToTopScorer(player.scorerId!)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              <span>Ver ficha goleador</span>
                              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed pl-8 max-w-2xl">
                          {player.highlight}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pl-8 pt-1">
                          {player.titleIds.map((tId) => {
                            const t = titlesById.get(tId);
                            if (!t) return null;
                            return (
                              <button
                                key={tId}
                                type="button"
                                onClick={() => openTitleInVitrina(tId)}
                                className="px-2.5 py-1 text-[11px] font-mono tabular-nums text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/60 rounded transition-colors whitespace-nowrap"
                              >
                                {t.starNumber ? `★${t.starNumber} ${t.shortYearLabel}` : t.shortYearLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pl-8 lg:pl-0 lg:w-64 shrink-0">
                        <div className="flex-1 space-y-1">
                          <svg
                            viewBox="0 0 100 6"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                            className="w-full h-2 rounded-full bg-slate-800 overflow-hidden block"
                          >
                            <rect x="0" y="0" width={pct} height="6" rx="3" className="fill-amber-400" />
                          </svg>
                          <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
                            <span>L:{player.ligaTitles}</span>
                            <span>C:{player.copaTitles}</span>
                            <span>SL:{player.superligaTitles}</span>
                          </div>
                        </div>

                        <div className="text-right font-mono tabular-nums w-16 shrink-0">
                          <span className="text-xl font-bold text-white">{player.totalTitles}</span>
                          <span className="text-[11px] text-slate-400 ml-1">títulos</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: CRITERIO OFICIAL DIMAYOR (12 ESTRELLAS VS 16 TÍTULOS)      */}
        {/* ================================================================= */}
        {activeTab === 'criterio' && (
          <div className="max-w-3xl mx-auto border border-slate-800 rounded-xl bg-slate-900/50 p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-amber-400">
                Normativa y Conteo Histórico Oficial
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Las 12 Estrellas del Escudo y los 16 Títulos Dimayor
              </h3>
              <p className="text-xs text-slate-400">
                Criterio avalado por la División Mayor del Fútbol Colombiano (1948–2026)
              </p>
            </div>

            <div className="space-y-5 text-sm text-slate-300 leading-relaxed divide-y divide-slate-800">
              <div className="space-y-2">
                <h4 className="font-display text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                  <span>01. Las 12 Estrellas de Primera División</span>
                </h4>
                <p>
                  En el fútbol profesional colombiano,{' '}
                  <strong className="text-white">
                    únicamente los títulos de Liga de Primera División otorgan el derecho a bordar una estrella física en el escudo
                  </strong>
                  . Junior ha ganado 12 campeonatos de Liga (1977, 1980, 1993, 1995, 2004-II, 2010-I,
                  2011-II, 2018-II, 2019-I, 2023-II, 2025-II y 2026-I), incluidos dos bicampeonatos
                  consecutivos (2018-II/2019-I y 2025-II/2026-I).
                </p>
              </div>

              <div className="pt-5 space-y-2">
                <h4 className="font-display text-lg font-bold text-red-400 flex items-center gap-2">
                  <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>02. Los 4 Títulos Oficiales de Copas Nacionales</span>
                </h4>
                <p>
                  Además de la Liga, la Dimayor organiza dos certámenes oficiales de máxima categoría
                  que entregan trofeo oficial y suman al palmarés histórico profesional:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>
                    <strong className="text-white">Copa Colombia (2):</strong> Campeón en 2015 ante
                    Santa Fe (2-1 global) y en 2017 ante Independiente Medellín (3-1 global).
                  </li>
                  <li>
                    <strong className="text-white">Superliga de Colombia (2):</strong> Campeón en
                    2019 ante Deportes Tolima (3-0 en penales) y en 2020 ante América de Cali (3-2
                    global).
                  </li>
                </ul>
              </div>

              <div className="pt-5 space-y-3">
                <h4 className="font-display text-lg font-bold text-sky-400 flex items-center gap-2">
                  <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>03. Suma Oficial del Palmarés Profesional</span>
                </h4>
                <div className="py-4 px-4 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-sm sm:text-base font-bold tabular-nums text-amber-300">
                  12 Ligas + 2 Copas Colombia + 2 Superligas = 16 Títulos Oficiales Dimayor
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
