import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ArrowDownUp,
  SlidersHorizontal,
} from 'lucide-react';
import { TournamentStandingsTable } from '../../types/football';
import {
  DecadeKey,
  DecadeBucket,
  getTournamentDecadeKey,
  isJuniorChampionTournament,
  isJuniorRunnerUpTournament,
} from '../../utils/footballLogic';

export type TableCategoryFilter =
  | 'todos'
  | 'estrellas'
  | 'no_campeon'
  | 'subcampeonatos'
  | 'cuadrangulares'
  | 'hexagonales'
  | 'octogonales'
  | 'playoffs'
  | 'regulares';

interface TournamentNavigatorSidebarProps {
  activeTournament: TournamentStandingsTable;
  decadeBuckets: DecadeBucket<TournamentStandingsTable>[];
  totalTournamentsCount: number;
  filteredCount: number;
  starsCount: number;
  runnerUpCount: number;
  selectedTableId: string;
  onSelectTable: (id: string) => void;
  sortOrder: 'asc' | 'desc';
  onToggleSortOrder: () => void;
  tableCategoryFilter: TableCategoryFilter;
  onChangeCategoryFilter: (filter: TableCategoryFilter) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onResetFilters: () => void;
}

function getCompactPhaseLabel(phaseType: TournamentStandingsTable['phaseType']): string {
  switch (phaseType) {
    case 'cuadrangular':
      return 'Cuadrangular';
    case 'hexagonal':
      return 'Hexagonal';
    case 'octogonal':
      return 'Octogonal';
    case 'triangular':
      return 'Triangular';
    case 'playoff':
      return 'Play-offs';
    default:
      return 'Liga Única';
  }
}

export const TournamentNavigatorSidebar: React.FC<TournamentNavigatorSidebarProps> = ({
  activeTournament,
  decadeBuckets,
  totalTournamentsCount,
  filteredCount,
  starsCount,
  runnerUpCount,
  selectedTableId,
  onSelectTable,
  sortOrder,
  onToggleSortOrder,
  tableCategoryFilter,
  onChangeCategoryFilter,
  searchQuery,
  onChangeSearchQuery,
  onResetFilters,
}) => {
  const activeDecadeKey = getTournamentDecadeKey(activeTournament);
  const [expandedDecades, setExpandedDecades] = useState<Record<DecadeKey, boolean>>({
    '1948-1953': activeDecadeKey === '1948-1953',
    '1966-1969': activeDecadeKey === '1966-1969',
    '1970s': activeDecadeKey === '1970s',
    '1980s': activeDecadeKey === '1980s',
    '1990s': activeDecadeKey === '1990s',
    '2000s': activeDecadeKey === '2000s',
    '2010s': activeDecadeKey === '2010s',
    '2020s': activeDecadeKey === '2020s',
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const activeItemDesktopRef = useRef<HTMLButtonElement | null>(null);

  // Automatically expand the decade of the currently selected tournament
  useEffect(() => {
    setExpandedDecades((prev) => {
      if (prev[activeDecadeKey]) return prev;
      return { ...prev, [activeDecadeKey]: true };
    });
  }, [activeDecadeKey]);

  // Keep active tournament visible inside the desktop sidebar scroll container
  useEffect(() => {
    if (activeItemDesktopRef.current) {
      activeItemDesktopRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedTableId]);

  const hasActiveSearchOrFilter =
    searchQuery.trim() !== '' || tableCategoryFilter !== 'todos';

  const toggleDecade = (key: DecadeKey) => {
    setExpandedDecades((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectItem = (id: string) => {
    onSelectTable(id);
    setMobileDrawerOpen(false);
  };

  const renderNavigatorBody = (isMobileContext: boolean) => (
    <div className="flex flex-col h-full min-h-0">
      {/* Top Controls: Title, Sort, Search & Quick Filters */}
      <div className="p-3.5 border-b border-slate-800 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-white leading-none">
              Archivo de Torneos
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
              {filteredCount} de {totalTournamentsCount} tablas oficiales
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleSortOrder}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
            title="Invertir orden cronológico"
            aria-label={`Invertir orden cronológico, actual ${sortOrder === 'asc' ? '1948 a 2026' : '2026 a 1948'}`}
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tabular-nums">
              {sortOrder === 'asc' ? '1948➔26' : '2026➔48'}
            </span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Buscar año, torneo o campeón..."
            aria-label="Buscar torneo por año, nombre o campeón"
            className="w-full pl-8 pr-8 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          {searchQuery.trim() !== '' && (
            <button
              type="button"
              onClick={() => onChangeSearchQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Achievement Filters */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => onChangeCategoryFilter('todos')}
            className={`px-2 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap truncate ${
              tableCategoryFilter === 'todos'
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({totalTournamentsCount})
          </button>
          <button
            type="button"
            onClick={() => onChangeCategoryFilter('estrellas')}
            className={`px-2 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap truncate ${
              tableCategoryFilter === 'estrellas'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            ★ {starsCount}
          </button>
          <button
            type="button"
            onClick={() => onChangeCategoryFilter('subcampeonatos')}
            className={`px-2 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap truncate ${
              tableCategoryFilter === 'subcampeonatos'
                ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🥈 {runnerUpCount}
          </button>
        </div>

        {/* Optional Format / Outcome Sub-filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor={isMobileContext ? 'format-filter-mobile' : 'format-filter-desktop'}
            className="text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Fase / Tipo:</span>
          </label>
          <select
            id={isMobileContext ? 'format-filter-mobile' : 'format-filter-desktop'}
            value={tableCategoryFilter}
            onChange={(e) => onChangeCategoryFilter(e.target.value as TableCategoryFilter)}
            className="flex-1 min-w-0 text-xs bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="todos">Todos los torneos ({totalTournamentsCount})</option>
            <option value="estrellas">★ Solo Estrellas de Junior ({starsCount})</option>
            <option value="subcampeonatos">🥈 Subcampeonatos ({runnerUpCount})</option>
            <option value="no_campeon">Años sin título</option>
            <option value="cuadrangulares">Cuadrangulares</option>
            <option value="hexagonales">Hexagonales</option>
            <option value="octogonales">Octogonales</option>
            <option value="playoffs">Play-offs / Triangulares</option>
            <option value="regulares">Liga única corrida</option>
          </select>
        </div>
      </div>

      {/* Scrollable Decade Accordion List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0">
        {decadeBuckets.length === 0 ? (
          <div className="p-5 text-center space-y-3">
            <p className="text-xs text-slate-400">
              No se encontraron torneos con este filtro o búsqueda.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          decadeBuckets.map((bucket) => {
            const isExpanded = hasActiveSearchOrFilter || Boolean(expandedDecades[bucket.key]);
            const containsActive = bucket.items.some((t) => t.id === selectedTableId);

            return (
              <div
                key={bucket.key}
                className="rounded-xl border border-slate-800/90 bg-slate-950/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleDecade(bucket.key)}
                  aria-expanded={isExpanded}
                  className={`w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left transition-colors ${
                    containsActive && !isExpanded
                      ? 'bg-red-950/30 text-white'
                      : 'hover:bg-slate-900/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono tabular-nums text-xs font-bold text-white">
                          {bucket.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                          ({bucket.items.length})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {bucket.subtitle}
                      </div>
                    </div>
                  </div>

                  {bucket.starCount > 0 && (
                    <span className="text-[11px] font-mono tabular-nums font-bold text-amber-400 shrink-0">
                      ★ {bucket.starCount}
                    </span>
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-1.5 space-y-1 bg-slate-950/40">
                    {bucket.items.map((t) => {
                      const isSelected = t.id === selectedTableId;
                      const isChampion = isJuniorChampionTournament(t);
                      const isSilver = isJuniorRunnerUpTournament(t);

                      return (
                        <button
                          key={t.id}
                          ref={!isMobileContext && isSelected ? activeItemDesktopRef : undefined}
                          type="button"
                          onClick={() => handleSelectItem(t.id)}
                          aria-current={isSelected ? 'true' : undefined}
                          className={`w-full px-2.5 py-2 rounded-lg text-left transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-red-600 text-white font-semibold shadow-sm'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`font-mono tabular-nums text-xs font-bold shrink-0 w-14 ${
                                isSelected ? 'text-white' : 'text-slate-200'
                              }`}
                            >
                              {t.year}
                            </span>
                            <span
                              className={`text-[11px] truncate ${
                                isSelected ? 'text-red-50' : 'text-slate-400'
                              }`}
                            >
                              {getCompactPhaseLabel(t.phaseType)}
                            </span>
                          </div>

                          <span className="text-[11px] shrink-0">
                            {isChampion ? (
                              <span
                                className={isSelected ? 'text-amber-200 font-bold' : 'text-amber-400 font-bold'}
                                title="Campeón"
                              >
                                ★
                              </span>
                            ) : isSilver ? (
                              <span title="Subcampeón">🥈</span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (lg+) */}
      <aside
        aria-label="Navegador de torneos por décadas"
        className="hidden lg:flex flex-col rounded-2xl border border-slate-800 bg-slate-900 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] overflow-hidden"
      >
        {renderNavigatorBody(false)}
      </aside>

      {/* Mobile / Tablet Compact Selector Bar (< lg) */}
      <div className="lg:hidden rounded-xl border border-slate-800 bg-slate-900 p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-slate-400">
            Torneo seleccionado · {activeTournament.year}
          </div>
          <div className="text-xs font-bold text-white truncate">
            {activeTournament.tournamentName}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold whitespace-nowrap shrink-0 transition-colors"
        >
          Explorar {totalTournamentsCount} Torneos
        </button>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Explorador de torneos por décadas"
        >
          <button
            type="button"
            aria-label="Cerrar selector de torneos"
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-sm h-full bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
              <span className="font-display text-sm font-bold uppercase text-white">
                Seleccionar Campeonato
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Cerrar panel de torneos"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0">{renderNavigatorBody(true)}</div>
          </div>
        </div>
      )}
    </>
  );
};
