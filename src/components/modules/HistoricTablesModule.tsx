import React, { useState, useEffect } from 'react';
import {
  Table,
  Trophy,
  Globe,
  History,
  Shield,
  Flame,
  Award,
  Search,
  Filter,
  CheckCircle,
  Medal,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Calendar,
} from 'lucide-react';
import {
  ALL_TIME_DIMAYOR_TABLE,
  INTERNATIONAL_CAMPAIGNS,
  CLUB_MILESTONE_RECORDS,
  JUNIOR_YEARLY_STANDINGS,
  HISTORIC_TOURNAMENT_STANDINGS_TABLES,
} from '../../data/juniorData';
import {
  ANNUAL_RECLASSIFICATION_TABLES,
  getAnnualReclassificationByYear,
} from '../../data/annualReclassificationTables';
import { ENRICHED_OFFICIAL_TITLES } from '../../data/titlesMuseumData';
import { ShareButton } from '../ShareButton';
import {
  TournamentNavigatorSidebar,
  TableCategoryFilter,
} from './TournamentNavigatorSidebar';
import {
  HistoricAllTimeTeam,
  YearlyStandingRecord,
  TournamentStandingsTable,
  AnnualReclassificationTable,
  StandingRow,
} from '../../types/football';
import {
  isJuniorChampionTournament,
  isJuniorRunnerUpTournament,
  getJuniorChampionshipStarLabel,
  isChampionStatusBadge,
  isRunnerUpStatusBadge,
  isSinglePhaseTournament,
  getTournamentJuniorCrest,
  getTournamentTeamCrest,
  getRowStatusBadge,
  groupTournamentsByDecade,
  getAdjacentTournaments,
  computeJuniorMatchArchiveSummary,
  getTournamentPointsPerWin,
  getMatchArchiveOpponents,
  getMatchArchiveLapOptions,
  filterMatchArchiveFixtures,
  buildPlayoffKnockoutBrackets,
  MatchArchiveLapFilter,
  MatchArchiveVenueFilter,
  MatchArchiveOutcomeFilter,
} from '../../utils/footballLogic';
import { PlayoffKnockoutBracket } from './PlayoffKnockoutBracket';

export const HistoricTablesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'tablas_posiciones' | 'reclasificacion' | 'posiciones_anuales' | 'acumulada' | 'formatos' | 'internacional' | 'records'
  >('tablas_posiciones');

  // Selected tournament table in the Tablas de Posiciones tab
  const [selectedTableId, setSelectedTableId] = useState<string>('1948-inaugural');
  const [selectedReclasificacionYear, setSelectedReclasificacionYear] = useState<string>(
    ANNUAL_RECLASSIFICATION_TABLES[0]?.year || '2002'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [phaseViewMode, setPhaseViewMode] = useState<'ambas' | 'regular' | 'playoff'>('ambas');
  const [selectedFinalGroupIdx, setSelectedFinalGroupIdx] = useState<'all' | number>('all');
  const [selectedMatchStage, setSelectedMatchStage] = useState<string>('all');
  const [showAllMatches, setShowAllMatches] = useState<boolean>(false);
  const [tableCategoryFilter, setTableCategoryFilter] = useState<TableCategoryFilter>('todos');
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState('');
  const [matchLapFilter, setMatchLapFilter] = useState<MatchArchiveLapFilter>('all');
  const [matchVenueFilter, setMatchVenueFilter] = useState<MatchArchiveVenueFilter>('all');
  const [matchOutcomeFilter, setMatchOutcomeFilter] = useState<MatchArchiveOutcomeFilter>('all');
  const [matchOpponentFilter, setMatchOpponentFilter] = useState<string>('all');

  // Reset sub-filters when switching tournament
  useEffect(() => {
    setPhaseViewMode('ambas');
    setSelectedFinalGroupIdx('all');
    setSelectedMatchStage('all');
    setShowAllMatches(false);
    setMatchLapFilter('all');
    setMatchVenueFilter('all');
    setMatchOutcomeFilter('all');
    setMatchOpponentFilter('all');
  }, [selectedTableId]);

  // Sincronizar selección directa desde el buscador global o línea de tiempo
  useEffect(() => {
    const applyTableSelection = (tableId: string) => {
      if (tableId.startsWith('reclasificacion-')) {
        const targetYear = tableId.replace('reclasificacion-', '');
        setSelectedReclasificacionYear(targetYear);
        setActiveTab('reclasificacion');
        return;
      }
      setSelectedTableId(tableId);
      setActiveTab('tablas_posiciones');
      setTournamentSearchQuery('');
      setTableCategoryFilter('todos');
    };

    try {
      const pending = sessionStorage.getItem('junior-pending-standings-table');
      if (pending) {
        applyTableSelection(pending);
        sessionStorage.removeItem('junior-pending-standings-table');
      }
    } catch {}

    const handleSelectTable = (event: Event) => {
      const customEvent = event as CustomEvent<{ tableId: string }>;
      if (customEvent.detail?.tableId) {
        applyTableSelection(customEvent.detail.tableId);
      }
    };
    window.addEventListener('junior-select-standings-table', handleSelectTable);
    return () => window.removeEventListener('junior-select-standings-table', handleSelectTable);
  }, []);

  // Filters for the yearly standings table (Tab 2)
  const [yearSearch, setYearSearch] = useState('');
  const [achievementFilter, setAchievementFilter] = useState<'todos' | 'campeon' | 'subcampeon' | 'fases_finales'>('todos');
  const [phaseTypeFilter, setPhaseTypeFilter] = useState<'todos' | 'cuadrangular' | 'hexagonal' | 'octogonal' | 'playoff'>('todos');
  const [eraFilter, setEraFilter] = useState<'todas' | 'cortos' | 'largos'>('todas');
  const [expandedYearRow, setExpandedYearRow] = useState<string | null>(null);

  // Ordered full list & filtered tournament tables sorted chronologically
  const orderedTournamentTables = [...HISTORIC_TOURNAMENT_STANDINGS_TABLES].sort((a, b) => {
    const orderA = a.chronologicalOrder ?? 0;
    const orderB = b.chronologicalOrder ?? 0;
    return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
  });

  const filteredTournamentTables = orderedTournamentTables.filter((t) => {
    if (tournamentSearchQuery.trim() !== '') {
      const q = tournamentSearchQuery.toLowerCase();
      const matchYear = t.year.toLowerCase().includes(q);
      const matchTitle = t.phaseTitle.toLowerCase().includes(q);
      const matchName = t.tournamentName.toLowerCase().includes(q);
      const matchChampion = t.championTeam.toLowerCase().includes(q);
      const matchFinish = t.juniorFinish.toLowerCase().includes(q);
      if (!matchYear && !matchTitle && !matchName && !matchChampion && !matchFinish) return false;
    }

    if (tableCategoryFilter === 'estrellas') return isJuniorChampionTournament(t);
    if (tableCategoryFilter === 'no_campeon') return !isJuniorChampionTournament(t);
    if (tableCategoryFilter === 'subcampeonatos') return isJuniorRunnerUpTournament(t);
    if (tableCategoryFilter === 'cuadrangulares') return t.phaseType === 'cuadrangular';
    if (tableCategoryFilter === 'hexagonales') return t.phaseType === 'hexagonal';
    if (tableCategoryFilter === 'octogonales') return t.phaseType === 'octogonal';
    if (tableCategoryFilter === 'playoffs') return t.phaseType === 'playoff' || t.phaseType === 'triangular';
    if (tableCategoryFilter === 'regulares') return t.phaseType === 'anual';
    return true;
  });

  const decadeBuckets = groupTournamentsByDecade(filteredTournamentTables, sortOrder);
  const starsTotalCount = HISTORIC_TOURNAMENT_STANDINGS_TABLES.filter(isJuniorChampionTournament).length;
  const runnerUpTotalCount = HISTORIC_TOURNAMENT_STANDINGS_TABLES.filter(isJuniorRunnerUpTournament).length;

  const activeTournamentTable: TournamentStandingsTable =
    HISTORIC_TOURNAMENT_STANDINGS_TABLES.find((t) => t.id === selectedTableId) ||
    HISTORIC_TOURNAMENT_STANDINGS_TABLES[0];
  const adjacentTournaments = getAdjacentTournaments(
    filteredTournamentTables,
    orderedTournamentTables,
    activeTournamentTable.id
  );
  const singlePhaseTournament = isSinglePhaseTournament(activeTournamentTable);
  const isJuniorChamp = isJuniorChampionTournament(activeTournamentTable);
  const juniorChampStarLabel = getJuniorChampionshipStarLabel(activeTournamentTable);
  const juniorCrest = getTournamentJuniorCrest(activeTournamentTable);
  const championCrest = getTournamentTeamCrest(activeTournamentTable, activeTournamentTable.championTeam);
  const linkedChampionTitle = ENRICHED_OFFICIAL_TITLES.find(
    (t) => t.standingsTableId === activeTournamentTable.id && Boolean(t.championPhotoUrl)
  );
  const linkedAnnualReclassification = getAnnualReclassificationByYear(activeTournamentTable.year);
  const activeReclassificationTable: AnnualReclassificationTable | undefined =
    ANNUAL_RECLASSIFICATION_TABLES.find((t) => t.year === selectedReclasificacionYear) ||
    ANNUAL_RECLASSIFICATION_TABLES[0];

  // Filtered yearly summary (Tab 2)
  const filteredYearlyStandings = JUNIOR_YEARLY_STANDINGS.filter((item) => {
    if (yearSearch.trim() !== '') {
      const q = yearSearch.toLowerCase();
      const matchYear = item.year.toLowerCase().includes(q);
      const matchTournament = item.tournamentName.toLowerCase().includes(q);
      const matchManager = item.manager.toLowerCase().includes(q);
      const matchNote = item.keyNote.toLowerCase().includes(q);
      if (!matchYear && !matchTournament && !matchManager && !matchNote) return false;
    }

    if (achievementFilter === 'campeon' && !item.isChampion) return false;
    if (achievementFilter === 'subcampeon' && !item.isRunnerUp) return false;
    if (achievementFilter === 'fases_finales' && item.phaseType === 'regular' && !item.isChampion) return false;

    if (phaseTypeFilter !== 'todos' && item.phaseType !== phaseTypeFilter) return false;
    if (eraFilter !== 'todas' && item.era !== eraFilter) return false;

    return true;
  });

  const handleOpenStandingsTable = (tableId: string) => {
    setSelectedTableId(tableId);
    setActiveTab('tablas_posiciones');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <section id="tablas-historicas" className="py-10 bg-slate-950 border-b border-slate-800 scroll-mt-16 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-1.5">
              <Table className="w-4 h-4 text-red-500 shrink-0" />
              <span>Módulo 1 · Tablas de Posiciones Oficiales Dimayor · 1948 - 2026</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-white tracking-tight text-balance max-w-4xl">
              Tablas de Posiciones: Cuadrangulares, Hexagonales & Año a Año
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Explora por décadas las 91 tablas oficiales con escudos históricos, fases finales y archivo año por año (1948 - 2026).
            </p>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full self-start">
            <button
              onClick={() => setActiveTab('tablas_posiciones')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tablas_posiciones'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-amber-300" />
              <span>Tablas de Posiciones</span>
            </button>
            <button
              onClick={() => setActiveTab('reclasificacion')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reclasificacion'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Reclasificación Anual</span>
            </button>
            <button
              onClick={() => setActiveTab('posiciones_anuales')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'posiciones_anuales'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial Año por Año</span>
            </button>
            <button
              onClick={() => setActiveTab('acumulada')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'acumulada'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Tabla de Todos los Tiempos</span>
            </button>
            <button
              onClick={() => setActiveTab('formatos')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'formatos'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Largos vs Cortos</span>
            </button>
            <button
              onClick={() => setActiveTab('internacional')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'internacional'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Tabla Conmebol</span>
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'records'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Récords de Club</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TABLAS DE POSICIONES CRONOLÓGICAS (TODOS CONTRA TODOS + PLAY-OFFS)  */}
        {/* ========================================================================= */}
        {activeTab === 'tablas_posiciones' && (
          <div className="grid grid-cols-1 lg:grid-cols-[310px_minmax(0,1fr)] gap-6 items-start">
            {/* Master Column: Decade-Grouped Tournament Navigator */}
            <TournamentNavigatorSidebar
              activeTournament={activeTournamentTable}
              decadeBuckets={decadeBuckets}
              totalTournamentsCount={HISTORIC_TOURNAMENT_STANDINGS_TABLES.length}
              filteredCount={filteredTournamentTables.length}
              starsCount={starsTotalCount}
              runnerUpCount={runnerUpTotalCount}
              selectedTableId={activeTournamentTable.id}
              onSelectTable={setSelectedTableId}
              sortOrder={sortOrder}
              onToggleSortOrder={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              tableCategoryFilter={tableCategoryFilter}
              onChangeCategoryFilter={setTableCategoryFilter}
              searchQuery={tournamentSearchQuery}
              onChangeSearchQuery={setTournamentSearchQuery}
              onResetFilters={() => {
                setTournamentSearchQuery('');
                setTableCategoryFilter('todos');
              }}
            />

            {/* Detail Column: Active Tournament Card & Tables (Always Above the Fold) */}
            <div
              className={`min-w-0 rounded-2xl border bg-slate-900 overflow-hidden shadow-2xl ${
                isJuniorChamp ? 'border-amber-500/35' : 'border-slate-800'
              }`}
            >
              {isJuniorChamp && (
                <div
                  aria-hidden="true"
                  className="h-[2px] w-full bg-gradient-to-r from-amber-400/80 via-amber-200/40 to-transparent"
                />
              )}
              <div
                className={`p-5 border-b ${
                  isJuniorChamp
                    ? 'bg-gradient-to-r from-amber-950/25 via-slate-900 to-slate-950 border-amber-500/20'
                    : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-800'
                }`}
              >
                {/* Sequential Prev / Next Navigation Bar beside Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!adjacentTournaments.prev}
                      onClick={() =>
                        adjacentTournaments.prev && setSelectedTableId(adjacentTournaments.prev.id)
                      }
                      aria-label={
                        adjacentTournaments.prev
                          ? `Ir al torneo anterior: ${adjacentTournaments.prev.year}`
                          : 'No hay torneo anterior'
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        adjacentTournaments.prev
                          ? 'bg-slate-950 border-slate-700 text-slate-200 hover:border-red-500 hover:text-white'
                          : 'bg-slate-950/40 border-slate-800/70 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                      {adjacentTournaments.prev && (
                        <span className="font-mono tabular-nums text-[11px] text-slate-400">
                          {adjacentTournaments.prev.year}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={!adjacentTournaments.next}
                      onClick={() =>
                        adjacentTournaments.next && setSelectedTableId(adjacentTournaments.next.id)
                      }
                      aria-label={
                        adjacentTournaments.next
                          ? `Ir al torneo siguiente: ${adjacentTournaments.next.year}`
                          : 'No hay torneo siguiente'
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        adjacentTournaments.next
                          ? 'bg-slate-950 border-slate-700 text-slate-200 hover:border-red-500 hover:text-white'
                          : 'bg-slate-950/40 border-slate-800/70 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {adjacentTournaments.next && (
                        <span className="font-mono tabular-nums text-[11px] text-slate-400">
                          {adjacentTournaments.next.year}
                        </span>
                      )}
                      <span>Siguiente</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {linkedAnnualReclassification && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReclasificacionYear(linkedAnnualReclassification.year);
                          setActiveTab('reclasificacion');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/35 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors whitespace-nowrap"
                      >
                        <ListOrdered className="w-3.5 h-3.5 shrink-0" />
                        <span>Ver Reclasificación Anual {linkedAnnualReclassification.year}</span>
                      </button>
                    )}
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      Torneo {adjacentTournaments.currentIndex + 1} de {adjacentTournaments.totalCount}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-1.5">
                      <span className="font-mono tabular-nums font-bold text-red-400">
                        Año {activeTournamentTable.year}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="font-semibold text-slate-300">
                        {activeTournamentTable.phaseType === 'cuadrangular'
                          ? 'Todos contra Todos + Cuadrangulares'
                          : activeTournamentTable.phaseType === 'hexagonal'
                          ? 'Todos contra Todos + Hexagonal Final'
                          : activeTournamentTable.phaseType === 'octogonal'
                          ? 'Todos contra Todos + Octogonal Final'
                          : activeTournamentTable.phaseType === 'triangular'
                          ? 'Todos contra Todos + Triangular Final'
                          : activeTournamentTable.phaseType === 'playoff'
                          ? 'Todos contra Todos + Play-offs K.O.'
                          : 'Liga Única Corrida'}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      {isJuniorChampionTournament(activeTournamentTable) ? (
                        <span className="font-bold text-amber-400">
                          ★ Campeón de Colombia
                        </span>
                      ) : isJuniorRunnerUpTournament(activeTournamentTable) ? (
                        <span className="font-bold text-slate-200">
                          🥈 Subcampeón de Colombia
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-400">
                          Campaña oficial Dimayor
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-balance flex flex-wrap items-baseline gap-x-2.5 gap-y-1 ${
                        isJuniorChamp ? 'text-amber-50' : 'text-white'
                      }`}
                    >
                      {isJuniorChamp && (
                        <span
                          aria-hidden="true"
                          className="text-amber-400 text-xl sm:text-2xl leading-none select-none"
                        >
                          ★
                        </span>
                      )}
                      <span>{activeTournamentTable.tournamentName}</span>
                      {isJuniorChamp && (
                        <span className="inline-flex items-center gap-1.5 pl-2.5 border-l border-amber-400/35 text-xs sm:text-sm font-bold tracking-wider text-amber-300/95">
                          <span>Campeón</span>
                          {juniorChampStarLabel && juniorChampStarLabel !== 'Campeón' && (
                            <>
                              <span aria-hidden="true" className="text-amber-500/60">·</span>
                              <span className="text-amber-200">{juniorChampStarLabel}</span>
                            </>
                          )}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                      {activeTournamentTable.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end gap-2.5 shrink-0 xl:w-[270px]">
                    <div
                      className={`px-3.5 py-2.5 rounded-xl bg-slate-950 border xl:text-right flex-1 sm:flex-initial xl:w-full ${
                        isJuniorChamp ? 'border-amber-500/30' : 'border-slate-800'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                        {isJuniorChamp ? 'Campeón de Liga' : 'Campeón del Torneo'}
                      </div>
                      <div className="text-sm font-black text-amber-400 font-display mt-0.5 flex items-center xl:justify-end gap-1.5">
                        {championCrest && !isJuniorChamp && (
                          <img
                            src={championCrest.src}
                            alt={championCrest.alt}
                            className="w-4 h-4 object-contain shrink-0 drop-shadow"
                          />
                        )}
                        <span className="truncate">{activeTournamentTable.championTeam}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1 flex items-center xl:justify-end gap-1.5">
                        <img
                          src={juniorCrest.src}
                          alt={juniorCrest.alt}
                          className="w-4 h-4 object-contain shrink-0 drop-shadow"
                        />
                        <span className="truncate">
                          Junior: <strong className="text-white">{activeTournamentTable.juniorFinish}</strong>
                        </span>
                      </div>
                    </div>

                    <ShareButton
                      sectionTitle={`Campeonato ${activeTournamentTable.year} - ${activeTournamentTable.tournamentName}`}
                      customHash={`#tablas-historicas?tabla=${activeTournamentTable.id}`}
                      buttonText="Compartir"
                      size="sm"
                      className="w-full sm:w-auto xl:w-full justify-center"
                    />
                  </div>
                </div>

                {/* Fotografía Histórica del Título (cuando el campeonato tiene archivo fotográfico verificado) */}
                {linkedChampionTitle?.championPhotoUrl && (
                  <figure className="mt-4 rounded-xl overflow-hidden border border-amber-500/25 bg-slate-950">
                    {linkedChampionTitle.championPhotoOrientation === 'portrait' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-[230px_1fr] items-stretch bg-slate-950">
                        <div className="relative aspect-[3/4] sm:aspect-auto sm:h-[300px] w-full overflow-hidden bg-slate-950 border-b sm:border-b-0 sm:border-r border-slate-800/80">
                          <img
                            src={linkedChampionTitle.championPhotoUrl}
                            alt={
                              linkedChampionTitle.championPhotoCaption ??
                              `Junior Campeón ${activeTournamentTable.year}`
                            }
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <figcaption className="p-5 flex flex-col justify-between gap-4 bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                              <span className="text-amber-400 font-semibold">
                                {linkedChampionTitle.starNumber
                                  ? `★ ${linkedChampionTitle.starNumber}.ª ESTRELLA`
                                  : linkedChampionTitle.category.toUpperCase()}
                              </span>
                              <span className="text-slate-400">
                                Archivo Histórico · {activeTournamentTable.year}
                              </span>
                            </div>
                            <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                              {linkedChampionTitle.championPhotoCaption ??
                                `Junior Campeón ${activeTournamentTable.year}`}
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-amber-500/40 pl-3">
                              “{linkedChampionTitle.keyMoment}”
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div>
                              <span className="text-[11px] text-slate-400 block">Director Técnico</span>
                              <span className="font-semibold text-slate-100">
                                {linkedChampionTitle.manager}
                              </span>
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-400 block">Consagración</span>
                              <span className="font-semibold text-amber-300">
                                {linkedChampionTitle.date} · {linkedChampionTitle.venue}
                              </span>
                            </div>
                          </div>
                        </figcaption>
                      </div>
                    ) : (
                      <div className="relative aspect-[16/9] max-h-[420px] w-full overflow-hidden bg-slate-950">
                        <img
                          src={linkedChampionTitle.championPhotoUrl}
                          alt={
                            linkedChampionTitle.championPhotoCaption ??
                            `Junior Campeón ${activeTournamentTable.year}`
                          }
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-[center_18%]"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />
                        <figcaption className="absolute inset-x-0 bottom-0 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-medium text-white">
                            {linkedChampionTitle.championPhotoCaption ??
                              `Junior Campeón ${activeTournamentTable.year}`}
                          </span>
                          <span className="text-[11px] font-mono text-amber-300">
                            Archivo Histórico · {activeTournamentTable.year}
                          </span>
                        </figcaption>
                      </div>
                    )}
                  </figure>
                )}

                {/* Phase View Switcher Pills (solo para torneos con más de una fase) */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  {singlePhaseTournament ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Modalidad:</span>
                      <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-amber-300">
                        Fase Única · Todos contra Todos (Sin Play-offs)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Ver Fases:</span>
                      <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                        <button
                          onClick={() => setPhaseViewMode('ambas')}
                          className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                            phaseViewMode === 'ambas'
                              ? 'bg-red-600 text-white font-bold shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Ambas Fases (1º Todos vs Todos + 2º Play-offs)
                        </button>
                        <button
                          onClick={() => setPhaseViewMode('regular')}
                          className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                            phaseViewMode === 'regular'
                              ? 'bg-red-600 text-white font-bold shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Solo 1ª Fase (Todos contra Todos)
                        </button>
                        <button
                          onClick={() => setPhaseViewMode('playoff')}
                          className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                            phaseViewMode === 'playoff'
                              ? 'bg-red-600 text-white font-bold shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Solo 2ª Fase ({activeTournamentTable.phaseType === 'cuadrangular' ? 'Cuadrangulares' : activeTournamentTable.phaseType === 'hexagonal' ? 'Hexagonal' : activeTournamentTable.phaseType === 'octogonal' ? 'Octogonal' : activeTournamentTable.phaseType === 'triangular' ? 'Triangular' : 'Play-offs'})
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400">
                    Mostrando orden cronológico: <span className="font-mono text-amber-300 font-bold">{activeTournamentTable.year}</span>
                  </div>
                </div>
              </div>

              {/* DUAL TABLES CONTAINER */}
              <div className="p-5 space-y-8 bg-slate-950/40">
                {/* ========================================================================= */}
                {/* 1ª FASE / FASE ÚNICA: TABLA DE TODOS CONTRA TODOS                        */}
                {/* ========================================================================= */}
                {(singlePhaseTournament || phaseViewMode === 'ambas' || phaseViewMode === 'regular') && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono text-[10px] font-bold uppercase">
                            {singlePhaseTournament ? 'Fase Única Oficial' : '1ª Fase Oficial'}
                          </span>
                          <h4 className="text-sm font-bold uppercase text-white tracking-wide">
                            {activeTournamentTable.regularPhaseTitle || `Tabla de Todos contra Todos - Fase Regular ${activeTournamentTable.year}`}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeTournamentTable.regularPhaseDescription || 'Tabla clasificatoria de la fase regular de Todos contra Todos de la Dimayor.'}
                        </p>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 self-start sm:self-auto shrink-0 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        {activeTournamentTable.hasFinalPhase === false ? '★ Campeonato Corrido Sin Play-offs' : 'Clasificatorio a Fases Finales'}
                      </span>
                    </div>

                    {/* Regular Phase Table Grid */}
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                            <th className="py-2.5 px-3 text-center w-12">Pos</th>
                            <th className="py-2.5 px-4">Club</th>
                            <th className="py-2.5 px-3 text-center">PJ</th>
                            <th className="py-2.5 px-3 text-center">PG</th>
                            <th className="py-2.5 px-3 text-center">PE</th>
                            <th className="py-2.5 px-3 text-center">PP</th>
                            <th className="py-2.5 px-3 text-center">GF</th>
                            <th className="py-2.5 px-3 text-center">GC</th>
                            <th className="py-2.5 px-3 text-center">DG</th>
                            <th className="py-2.5 px-3 text-center font-bold text-white bg-slate-900/60">PTS</th>
                            <th className="py-2.5 px-4 text-center">Estado / Clasificación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {(activeTournamentTable.regularRows || activeTournamentTable.rows).map((row: StandingRow) => {
                            const isFirst = row.pos === 1;
                            const isSecond = row.pos === 2;

                            return (
                              <tr
                                key={row.team}
                                className={`transition-colors ${
                                  row.isJunior
                                    ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                                    : isFirst
                                    ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                    : 'hover:bg-slate-800/40 text-slate-300'
                                }`}
                              >
                                <td className="py-2.5 px-3 text-center font-mono font-bold">
                                  {isFirst ? (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px]">
                                      1º
                                    </span>
                                  ) : isSecond ? (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600 text-[11px]">
                                      2º
                                    </span>
                                  ) : (
                                    row.pos
                                  )}
                                </td>

                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const crest = getTournamentTeamCrest(activeTournamentTable, row.team, row.isJunior);
                                      return crest ? (
                                        <img
                                          src={crest.src}
                                          alt={crest.alt}
                                          className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                        />
                                      ) : null;
                                    })()}
                                    <span className={row.isJunior ? 'text-white font-extrabold text-sm' : 'text-slate-200'}>
                                      {row.team}
                                    </span>
                                    {row.isJunior && (
                                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                        Tu Papá
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pj}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{row.pg}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pe}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-rose-400">{row.pp}</td>

                                <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.gf}</td>
                                <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.gc}</td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-200">
                                  {row.dg > 0 ? `+${row.dg}` : row.dg}
                                </td>

                                <td className="py-2.5 px-3 text-center font-mono font-black text-white bg-slate-950/60 text-sm">
                                  {row.pts}
                                </td>

                                <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                  {(() => {
                                    const badge = getRowStatusBadge(activeTournamentTable, row, 'regular');
                                    const upper = badge.toUpperCase();
                                      return (
                                        <span
                                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            isChampionStatusBadge(badge)
                                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                              : isRunnerUpStatusBadge(badge)
                                              ? 'bg-slate-200/20 text-slate-200 border border-slate-400/40'
                                              : upper.includes('LÍDER · GRUPO A')
                                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35'
                                              : upper === 'GRUPO A'
                                              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                                              : upper === 'GRUPO B'
                                              ? 'bg-slate-800/90 text-slate-300 border border-slate-700'
                                              : upper.includes('LIBERTADORES') || upper.includes('LIB.')
                                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                              : upper.includes('CLASIFICADO')
                                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                              : upper.includes('ELIMINADO')
                                              ? 'bg-rose-950/40 text-rose-300/80 border border-rose-500/20'
                                              : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                          }`}
                                        >
                                          {badge}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                    {/* Grupos del Torneo Finalización (Grupo A y Grupo B lado a lado) */}
                    {activeTournamentTable.regularGroups && activeTournamentTable.regularGroups.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/90">
                          <div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400 font-medium">
                              <span className="text-sky-400 font-semibold">Torneo Finalización</span>
                              <span aria-hidden="true">·</span>
                              <span>21 Fechas</span>
                              <span aria-hidden="true">·</span>
                              <span>Grupo A y Grupo B</span>
                            </div>
                            <h5 className="text-sm font-bold text-white tracking-tight mt-0.5">
                              {activeTournamentTable.regularGroupsSectionTitle || `Torneo Finalización ${activeTournamentTable.year} — Grupo A y Grupo B (21 Fechas)`}
                            </h5>
                            {activeTournamentTable.regularGroupsSectionDescription && (
                              <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
                                {activeTournamentTable.regularGroupsSectionDescription}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                          {activeTournamentTable.regularGroups.map((rg) => {
                            const isGroupA = rg.groupName.toLowerCase().includes('grupo a');
                            const leaderRow = rg.rows[0];
                            const leaderBadge = leaderRow
                              ? getRowStatusBadge(activeTournamentTable, leaderRow, 'regularGroup', rg.groupName)
                              : '';
                            return (
                              <div
                                key={rg.id}
                                className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col"
                              >
                                <div className="px-3 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                      className={`text-xs font-bold tracking-tight whitespace-nowrap ${
                                        isGroupA ? 'text-sky-300' : 'text-indigo-300'
                                      }`}
                                    >
                                      {rg.groupName}
                                    </span>
                                    {rg.description && (
                                      <>
                                        <span aria-hidden="true" className="text-slate-600 text-xs">·</span>
                                        <span className="text-[11px] text-slate-400 truncate">
                                          {rg.description}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <span className="text-[11px] font-mono tabular-nums text-slate-400 whitespace-nowrap shrink-0">
                                    {rg.rows.length} clubes
                                  </span>
                                </div>

                                <div className="overflow-x-auto flex-1">
                                  <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                      <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 font-semibold text-[10px] tracking-wider uppercase">
                                        <th className="py-2 pl-2 pr-1 text-center w-8">Pos</th>
                                        <th className="py-2 px-1.5">Club</th>
                                        <th className="py-2 px-1 text-center">PJ</th>
                                        <th className="py-2 px-1 text-center">PG</th>
                                        <th className="py-2 px-1 text-center">PE</th>
                                        <th className="py-2 px-1 text-center">PP</th>
                                        <th className="py-2 px-1 text-center">GF</th>
                                        <th className="py-2 px-1 text-center">GC</th>
                                        <th className="py-2 px-1 text-center">DG</th>
                                        <th className="py-2 pl-1.5 pr-2 text-center font-bold text-white bg-slate-950/50">PTS</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                      {rg.rows.map((row: StandingRow) => {
                                        const isLeader = row.pos === 1;
                                        const badge = getRowStatusBadge(activeTournamentTable, row, 'regularGroup', rg.groupName);
                                        const isQualified = badge.toUpperCase().includes('CLASIFICADO');
                                        return (
                                          <tr
                                            key={`${rg.id}-${row.team}`}
                                            title={`${row.team} — ${badge}`}
                                            className={`transition-colors ${
                                              row.isJunior
                                                ? 'bg-red-950/45 hover:bg-red-950/65 font-semibold'
                                                : isLeader
                                                ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                                : 'hover:bg-slate-800/40 text-slate-300'
                                            }`}
                                          >
                                            <td className="py-2 pl-2 pr-1 text-center font-mono tabular-nums font-bold">
                                              {isLeader ? (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                                                  1º
                                                </span>
                                              ) : (
                                                <span
                                                  className={
                                                    row.isJunior
                                                      ? 'text-red-300'
                                                      : isQualified
                                                      ? 'text-emerald-400'
                                                      : 'text-slate-400'
                                                  }
                                                >
                                                  {row.pos}
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2 px-1.5 max-w-[148px]">
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                {(() => {
                                                  const crest = getTournamentTeamCrest(activeTournamentTable, row.team, row.isJunior);
                                                  return crest ? (
                                                    <img
                                                      src={crest.src}
                                                      alt={crest.alt}
                                                      className="w-4 h-4 object-contain shrink-0 drop-shadow"
                                                      referrerPolicy="no-referrer"
                                                    />
                                                  ) : null;
                                                })()}
                                                <span
                                                  className={`truncate ${
                                                    row.isJunior
                                                      ? 'text-white font-bold'
                                                      : 'text-slate-200'
                                                  }`}
                                                >
                                                  {row.team}
                                                </span>
                                              </div>
                                            </td>
                                            <td className="py-2 px-1 text-center font-mono tabular-nums text-slate-400">{row.pj}</td>
                                            <td className="py-2 px-1 text-center font-mono tabular-nums text-emerald-400 font-semibold">{row.pg}</td>
                                            <td className="py-2 px-1 text-center font-mono tabular-nums text-slate-400">{row.pe}</td>
                                            <td className="py-2 px-1 text-center font-mono tabular-nums text-rose-400">{row.pp}</td>
                                            <td className="py-2 px-1 text-center font-mono tabular-nums text-slate-300">{row.gf}</td>
                                            <td className="py-2 px-1 text-center font-mono tabular-nums text-slate-400">{row.gc}</td>
                                            <td className="py-2 px-1 text-center font-mono tabular-nums font-semibold text-slate-200">
                                              {row.dg > 0 ? `+${row.dg}` : row.dg}
                                            </td>
                                            <td className="py-2 pl-1.5 pr-2 text-center font-mono tabular-nums font-black text-white bg-slate-950/60 text-xs">
                                              {row.pts}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {leaderRow && (
                                  <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                                    <span className="text-slate-400 truncate">
                                      <span className="text-amber-300 font-semibold">{leaderBadge}:</span>{' '}
                                      <span className="text-slate-200 font-medium">{leaderRow.team}</span>
                                    </span>
                                    <span className="font-mono tabular-nums text-slate-300 font-semibold whitespace-nowrap shrink-0">
                                      {leaderRow.pts} pts
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Segunda Sub-Tabla Regular (Reclasificación 47 Fechas / Finalización según formato) */}
                    {activeTournamentTable.secondaryRegularTable && activeTournamentTable.secondaryRegularTable.rows.length > 0 && (
                      <div className="space-y-2.5 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-[10px] font-bold uppercase">
                                {activeTournamentTable.secondaryRegularTable.badgeLabel
                                  ? activeTournamentTable.secondaryRegularTable.badgeLabel
                                  : activeTournamentTable.regularGroups && activeTournamentTable.regularGroups.length > 0
                                  ? 'Acumulado Oficial · 47 Fechas'
                                  : 'Sub-Fase Regular Anexa'}
                              </span>
                              <h5 className="text-xs font-bold uppercase text-white tracking-wide">
                                {activeTournamentTable.secondaryRegularTable.title}
                              </h5>
                            </div>
                            {activeTournamentTable.secondaryRegularTable.description && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                {activeTournamentTable.secondaryRegularTable.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                                <th className="py-2.5 px-3 text-center w-12">Pos</th>
                                <th className="py-2.5 px-4">Club</th>
                                <th className="py-2.5 px-3 text-center">PJ</th>
                                <th className="py-2.5 px-3 text-center">PG</th>
                                <th className="py-2.5 px-3 text-center">PE</th>
                                <th className="py-2.5 px-3 text-center">PP</th>
                                <th className="py-2.5 px-3 text-center">GF</th>
                                <th className="py-2.5 px-3 text-center">GC</th>
                                <th className="py-2.5 px-3 text-center">DG</th>
                                <th className="py-2.5 px-3 text-center font-bold text-white bg-slate-900/60">PTS</th>
                                <th className="py-2.5 px-4 text-center">Estado / Clasificación</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {activeTournamentTable.secondaryRegularTable.rows.map((row: StandingRow) => {
                                const isFirst = row.pos === 1;
                                const isSecond = row.pos === 2;
                                return (
                                  <tr
                                    key={row.team}
                                    className={`transition-colors ${
                                      row.isJunior
                                        ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                                        : isFirst
                                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                        : 'hover:bg-slate-800/40 text-slate-300'
                                    }`}
                                  >
                                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                                      {isFirst ? (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px]">
                                          1º
                                        </span>
                                      ) : isSecond ? (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600 text-[11px]">
                                          2º
                                        </span>
                                      ) : (
                                        row.pos
                                      )}
                                    </td>
                                    <td className="py-2.5 px-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        {(() => {
                                          const crest = getTournamentTeamCrest(activeTournamentTable, row.team, row.isJunior);
                                          return crest ? (
                                            <img
                                              src={crest.src}
                                              alt={crest.alt}
                                              className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                              referrerPolicy="no-referrer"
                                            />
                                          ) : null;
                                        })()}
                                        <span className={row.isJunior ? 'text-white font-extrabold text-sm' : 'text-slate-200'}>
                                          {row.team}
                                        </span>
                                        {row.isJunior && (
                                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                            Tu Papá
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pj}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{row.pg}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pe}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-rose-400">{row.pp}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.gf}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.gc}</td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-200">
                                      {row.dg > 0 ? `+${row.dg}` : row.dg}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-black text-white bg-slate-950/60 text-sm">
                                      {row.pts}
                                    </td>
                                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                      {(() => {
                                        const badge = getRowStatusBadge(activeTournamentTable, row, 'secondaryRegular');
                                        const upper = badge.toUpperCase();
                                        return (
                                          <span
                                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                              isChampionStatusBadge(badge)
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                                : isRunnerUpStatusBadge(badge)
                                                ? 'bg-slate-200/20 text-slate-200 border border-slate-400/40'
                                                : upper.includes('LIBERTADORES') || upper.includes('LIB.')
                                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                                : upper.includes('CLASIFICADO')
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                : upper.includes('ELIMINADO')
                                                ? 'bg-rose-950/40 text-rose-300/80 border border-rose-500/20'
                                                : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                            }`}
                                          >
                                            {badge}
                                          </span>
                                        );
                                      })()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Tercera Sub-Tabla Regular (p. ej. Reclasificación General Oficial) */}
                    {activeTournamentTable.tertiaryRegularTable && activeTournamentTable.tertiaryRegularTable.rows.length > 0 && (
                      <div className="space-y-2.5 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono text-[10px] font-bold uppercase">
                                {activeTournamentTable.tertiaryRegularTable.badgeLabel || 'Reclasificación General'}
                              </span>
                              <h5 className="text-xs font-bold uppercase text-white tracking-wide">
                                {activeTournamentTable.tertiaryRegularTable.title}
                              </h5>
                            </div>
                            {activeTournamentTable.tertiaryRegularTable.description && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                {activeTournamentTable.tertiaryRegularTable.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                                <th className="py-2.5 px-3 text-center w-12">Pos</th>
                                <th className="py-2.5 px-4">Club</th>
                                <th className="py-2.5 px-3 text-center">PJ</th>
                                <th className="py-2.5 px-3 text-center">PG</th>
                                <th className="py-2.5 px-3 text-center">PE</th>
                                <th className="py-2.5 px-3 text-center">PP</th>
                                <th className="py-2.5 px-3 text-center">GF</th>
                                <th className="py-2.5 px-3 text-center">GC</th>
                                <th className="py-2.5 px-3 text-center">DG</th>
                                <th className="py-2.5 px-3 text-center font-bold text-white bg-slate-900/60">PTS</th>
                                <th className="py-2.5 px-4 text-center">Estado / Clasificación</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {activeTournamentTable.tertiaryRegularTable.rows.map((row: StandingRow) => {
                                const isFirst = row.pos === 1;
                                const isSecond = row.pos === 2;
                                return (
                                  <tr
                                    key={row.team}
                                    className={`transition-colors ${
                                      row.isJunior
                                        ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                                        : isFirst
                                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                        : 'hover:bg-slate-800/40 text-slate-300'
                                    }`}
                                  >
                                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                                      {isFirst ? (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px]">
                                          1º
                                        </span>
                                      ) : isSecond ? (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600 text-[11px]">
                                          2º
                                        </span>
                                      ) : (
                                        row.pos
                                      )}
                                    </td>
                                    <td className="py-2.5 px-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        {(() => {
                                          const crest = getTournamentTeamCrest(activeTournamentTable, row.team, row.isJunior);
                                          return crest ? (
                                            <img
                                              src={crest.src}
                                              alt={crest.alt}
                                              className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                              referrerPolicy="no-referrer"
                                            />
                                          ) : null;
                                        })()}
                                        <span className={row.isJunior ? 'text-white font-extrabold text-sm' : 'text-slate-200'}>
                                          {row.team}
                                        </span>
                                        {row.isJunior && (
                                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                            Tu Papá
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pj}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{row.pg}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pe}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-rose-400">{row.pp}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.gf}</td>
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.gc}</td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-200">
                                      {row.dg > 0 ? `+${row.dg}` : row.dg}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-black text-white bg-slate-950/60 text-sm">
                                      {row.pts}
                                    </td>
                                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                      {(() => {
                                        const badge = getRowStatusBadge(activeTournamentTable, row, 'tertiaryRegular');
                                        const upper = badge.toUpperCase();
                                        return (
                                          <span
                                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                              isChampionStatusBadge(badge)
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                                : isRunnerUpStatusBadge(badge)
                                                ? 'bg-slate-200/20 text-slate-200 border border-slate-400/40'
                                                : upper.includes('LIBERTADORES') || upper.includes('LIB.')
                                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                                : upper.includes('PROMOCI')
                                                ? 'bg-amber-950/50 text-amber-300 border border-amber-500/35'
                                                : upper.includes('DESCENDIDO')
                                                ? 'bg-rose-950/50 text-rose-300 border border-rose-500/35'
                                                : upper.includes('CLASIFICADO') || upper.includes('FINALISTA') || upper.includes('SEMIFINALISTA')
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                : upper.includes('ELIMINADO')
                                                ? 'bg-rose-950/40 text-rose-300/80 border border-rose-500/20'
                                                : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                            }`}
                                          >
                                            {badge}
                                          </span>
                                        );
                                      })()}
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

                {/* ========================================================================= */}
                {/* 2ª FASE: FASE FINAL / PLAY-OFFS (TRIANGULAR, CUADRANGULAR, HEXAGONAL...) */}
                {/* ========================================================================= */}
                {(phaseViewMode === 'ambas' || phaseViewMode === 'playoff') && (
                  <div className="space-y-3 pt-2">
                    {activeTournamentTable.hasFinalPhase !== false ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold uppercase">
                                2ª Fase Oficial: Play-offs
                              </span>
                              <h4 className="text-sm font-bold uppercase text-white tracking-wide">
                                {activeTournamentTable.finalPhaseTitle || activeTournamentTable.phaseTitle}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {activeTournamentTable.finalPhaseDescription || activeTournamentTable.description}
                            </p>
                          </div>

                          <span className="text-[11px] font-mono font-bold text-amber-300 self-start sm:self-auto shrink-0 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                            {activeTournamentTable.phaseType === 'cuadrangular'
                              ? 'Cuadrangular Semifinal / Final'
                              : activeTournamentTable.phaseType === 'hexagonal'
                              ? 'Hexagonal Final (6 Clubes)'
                              : activeTournamentTable.phaseType === 'octogonal'
                              ? 'Octogonal Final (8 Clubes)'
                              : activeTournamentTable.phaseType === 'triangular'
                              ? 'Triangular Final'
                              : 'Play-offs / Llaves Eliminatorias'}
                          </span>
                        </div>

                        {/* Play-off / Cuadrangulares / Hexagonales Standings Tables */}
                        {activeTournamentTable.finalGroups && activeTournamentTable.finalGroups.length > 0 ? (
                          <div className="space-y-4">
                            {activeTournamentTable.finalGroups.length > 1 && (
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Grupos / Series:</span>
                                <button
                                  onClick={() => setSelectedFinalGroupIdx('all')}
                                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                                    selectedFinalGroupIdx === 'all'
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                                  }`}
                                >
                                  Todos ({activeTournamentTable.finalGroups.length})
                                </button>
                                {activeTournamentTable.finalGroups.map((fg, gIdx) => (
                                  <button
                                    key={fg.id || gIdx}
                                    onClick={() => setSelectedFinalGroupIdx(gIdx)}
                                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                                      selectedFinalGroupIdx === gIdx
                                        ? 'bg-emerald-600 text-white font-bold'
                                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                                    }`}
                                  >
                                    {fg.groupName}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="space-y-4">
                              {activeTournamentTable.finalGroups
                                .map((fg, gIdx) => ({ fg, gIdx }))
                                .filter(({ gIdx }) => selectedFinalGroupIdx === 'all' || selectedFinalGroupIdx === gIdx)
                                .map(({ fg, gIdx }) => (
                                  <div key={fg.id || gIdx} className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                                    <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                                        {fg.groupName}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        {fg.rows.length} Clubes
                                      </span>
                                    </div>
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                                          <th className="py-2.5 px-3 text-center w-12">Pos</th>
                                          <th className="py-2.5 px-4">Club</th>
                                          <th className="py-2.5 px-3 text-center">PJ</th>
                                          <th className="py-2.5 px-3 text-center">PG</th>
                                          <th className="py-2.5 px-3 text-center">PE</th>
                                          <th className="py-2.5 px-3 text-center">PP</th>
                                          <th className="py-2.5 px-3 text-center">GF</th>
                                          <th className="py-2.5 px-3 text-center">GC</th>
                                          <th className="py-2.5 px-3 text-center">DG</th>
                                          <th className="py-2.5 px-3 text-center font-bold text-white bg-slate-900/60">PTS</th>
                                          <th className="py-2.5 px-4 text-center">Estado / Clasificación</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-800/80">
                                        {fg.rows.map((row: StandingRow) => {
                                          const isChamp = row.pos === 1;
                                          const isSub = row.pos === 2;
                                          return (
                                            <tr
                                              key={`${fg.id}-${row.team}`}
                                              className={`transition-colors ${
                                                row.isJunior
                                                  ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                                                  : isChamp
                                                  ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                                  : 'hover:bg-slate-800/40 text-slate-300'
                                              }`}
                                            >
                                              <td className="py-2.5 px-3 text-center font-mono font-bold">
                                                {isChamp ? (
                                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px]">
                                                    1º
                                                  </span>
                                                ) : isSub ? (
                                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600 text-[11px]">
                                                    2º
                                                  </span>
                                                ) : (
                                                  row.pos
                                                )}
                                              </td>
                                              <td className="py-2.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                  {(() => {
                                                    const crest = getTournamentTeamCrest(activeTournamentTable, row.team, row.isJunior);
                                                    return crest ? (
                                                      <img
                                                        src={crest.src}
                                                        alt={crest.alt}
                                                        className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                                        referrerPolicy="no-referrer"
                                                      />
                                                    ) : null;
                                                  })()}
                                                  <span className={row.isJunior ? 'text-white font-extrabold text-sm' : 'text-slate-200'}>
                                                    {row.team}
                                                  </span>
                                                  {row.isJunior && (
                                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                                      Tu Papá
                                                    </span>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pj}</td>
                                              <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{row.pg}</td>
                                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pe}</td>
                                              <td className="py-2.5 px-3 text-center font-mono text-rose-400">{row.pp}</td>
                                              <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.gf}</td>
                                              <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.gc}</td>
                                              <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-200">
                                                {row.dg > 0 ? `+${row.dg}` : row.dg}
                                              </td>
                                              <td className="py-2.5 px-3 text-center font-mono font-black text-white bg-slate-950/60 text-sm">
                                                {row.pts}
                                              </td>
                                              <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                                {(() => {
                                                  const badge = getRowStatusBadge(activeTournamentTable, row, 'finalGroup', fg.groupName);
                                                  const upper = badge.toUpperCase();
                                                  return (
                                                    <span
                                                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                        isChampionStatusBadge(badge)
                                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                                          : isRunnerUpStatusBadge(badge)
                                                          ? 'bg-slate-200/20 text-slate-200 border border-slate-400/40'
                                                          : upper.includes('CLASIFICADO')
                                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                          : upper.includes('ELIMINADO')
                                                          ? 'bg-rose-950/40 text-rose-300/80 border border-rose-500/20'
                                                          : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                                      }`}
                                                    >
                                                      {badge}
                                                    </span>
                                                  );
                                                })()}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : activeTournamentTable.phaseType === 'playoff' &&
                          buildPlayoffKnockoutBrackets(
                            activeTournamentTable.playoffMatches,
                            activeTournamentTable.championTeam
                          ).length > 0 ? (
                          <PlayoffKnockoutBracket tournament={activeTournamentTable} />
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                                  <th className="py-2.5 px-3 text-center w-12">Pos</th>
                                  <th className="py-2.5 px-4">Club</th>
                                  <th className="py-2.5 px-3 text-center">PJ</th>
                                  <th className="py-2.5 px-3 text-center">PG</th>
                                  <th className="py-2.5 px-3 text-center">PE</th>
                                  <th className="py-2.5 px-3 text-center">PP</th>
                                  <th className="py-2.5 px-3 text-center">GF</th>
                                  <th className="py-2.5 px-3 text-center">GC</th>
                                  <th className="py-2.5 px-3 text-center">DG</th>
                                  <th className="py-2.5 px-3 text-center font-bold text-white bg-slate-900/60">PTS</th>
                                  <th className="py-2.5 px-4 text-center">Estado / Clasificación</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/80">
                                {activeTournamentTable.rows.map((row: StandingRow) => {
                                  const isChamp = row.pos === 1;
                                  const isSub = row.pos === 2;

                                  return (
                                    <tr
                                      key={row.team}
                                      className={`transition-colors ${
                                        row.isJunior
                                          ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                                          : isChamp
                                          ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                          : 'hover:bg-slate-800/40 text-slate-300'
                                      }`}
                                    >
                                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                                        {isChamp ? (
                                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px]">
                                            1º
                                          </span>
                                        ) : isSub ? (
                                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600 text-[11px]">
                                            2º
                                          </span>
                                        ) : (
                                          row.pos
                                        )}
                                      </td>

                                      <td className="py-2.5 px-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          {(() => {
                                            const crest = getTournamentTeamCrest(activeTournamentTable, row.team, row.isJunior);
                                            return crest ? (
                                              <img
                                                src={crest.src}
                                                alt={crest.alt}
                                                className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                                referrerPolicy="no-referrer"
                                              />
                                            ) : null;
                                          })()}
                                          <span className={row.isJunior ? 'text-white font-extrabold text-sm' : 'text-slate-200'}>
                                            {row.team}
                                          </span>
                                          {row.isJunior && (
                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                              Tu Papá
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pj}</td>
                                      <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{row.pg}</td>
                                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.pe}</td>
                                      <td className="py-2.5 px-3 text-center font-mono text-rose-400">{row.pp}</td>

                                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.gf}</td>
                                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{row.gc}</td>
                                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-200">
                                        {row.dg > 0 ? `+${row.dg}` : row.dg}
                                      </td>

                                      <td className="py-2.5 px-3 text-center font-mono font-black text-white bg-slate-950/60 text-sm">
                                        {row.pts}
                                      </td>

                                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                                        {(() => {
                                          const badge = getRowStatusBadge(activeTournamentTable, row, 'finalSummary');
                                          const upper = badge.toUpperCase();
                                          return (
                                            <span
                                              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                isChampionStatusBadge(badge)
                                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                                  : isRunnerUpStatusBadge(badge)
                                                  ? 'bg-slate-200/20 text-slate-200 border border-slate-400/40'
                                                  : upper.includes('CLASIFICADO')
                                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                  : upper.includes('ELIMINADO')
                                                  ? 'bg-rose-950/40 text-rose-300/80 border border-rose-500/20'
                                                  : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                              }`}
                                            >
                                              {badge}
                                            </span>
                                          );
                                        })()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Play-off Finals, Cuadrangular, Hexagonal & Octogonal Matches */}
                        {activeTournamentTable.playoffMatches &&
                          activeTournamentTable.playoffMatches.length > 0 &&
                          !(
                            (!activeTournamentTable.finalGroups || activeTournamentTable.finalGroups.length === 0) &&
                            activeTournamentTable.phaseType === 'playoff' &&
                            buildPlayoffKnockoutBrackets(
                              activeTournamentTable.playoffMatches,
                              activeTournamentTable.championTeam
                            ).length > 0
                          ) &&
                          (() => {
                            const allMatches = activeTournamentTable.playoffMatches;
                            const uniqueStages = Array.from(new Set(allMatches.map((m) => m.stage)));
                            const filteredMatches =
                              selectedMatchStage === 'all'
                                ? allMatches
                                : allMatches.filter((m) => m.stage === selectedMatchStage);
                            const visibleMatches =
                              !showAllMatches && filteredMatches.length > 24
                                ? filteredMatches.slice(0, 24)
                                : filteredMatches;

                            return (
                              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                                    <Flame className="w-4 h-4 text-red-500" />
                                    <span>Partidos Oficiales de Fase Final ({allMatches.length})</span>
                                  </div>
                                  {uniqueStages.length > 1 && (
                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                      <button
                                        onClick={() => {
                                          setSelectedMatchStage('all');
                                          setShowAllMatches(false);
                                        }}
                                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                                          selectedMatchStage === 'all'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                        }`}
                                      >
                                        Todos ({allMatches.length})
                                      </button>
                                      {uniqueStages.slice(0, 10).map((stage) => (
                                        <button
                                          key={stage}
                                          onClick={() => {
                                            setSelectedMatchStage(stage);
                                            setShowAllMatches(false);
                                          }}
                                          className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                                            selectedMatchStage === stage
                                              ? 'bg-red-600 text-white'
                                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                          }`}
                                        >
                                          {stage}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {visibleMatches.map((m, idx) => {
                                    const isJuniorHome =
                                      m.homeTeam.toLowerCase().includes('junior') &&
                                      !m.homeTeam.toLowerCase().includes('boca juniors');
                                    const isJuniorAway =
                                      m.awayTeam.toLowerCase().includes('junior') &&
                                      !m.awayTeam.toLowerCase().includes('boca juniors');
                                    const homeCrest = getTournamentTeamCrest(
                                      activeTournamentTable,
                                      m.homeTeam,
                                      isJuniorHome
                                    );
                                    const awayCrest = getTournamentTeamCrest(
                                      activeTournamentTable,
                                      m.awayTeam,
                                      isJuniorAway
                                    );

                                    return (
                                      <div
                                        key={idx}
                                        className={`p-3.5 rounded-xl bg-slate-950 border space-y-1.5 ${
                                          isJuniorHome || isJuniorAway
                                            ? 'border-red-500/40'
                                            : 'border-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                                          <span className="uppercase font-bold text-amber-400 truncate">{m.stage}</span>
                                          {m.date && <span className="text-slate-400 shrink-0">{m.date}</span>}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-white">
                                          <span
                                            title={m.homeTeam}
                                            className={`min-w-0 flex-1 flex items-center justify-end gap-1.5 text-right ${
                                              isJuniorHome ? 'text-red-300' : ''
                                            }`}
                                          >
                                            <span className="truncate">{m.homeTeam.replace('de Barranquilla', '').trim()}</span>
                                            {homeCrest && (
                                              <img
                                                src={homeCrest.src}
                                                alt={homeCrest.alt}
                                                className="w-4 h-4 object-contain shrink-0 drop-shadow"
                                                referrerPolicy="no-referrer"
                                              />
                                            )}
                                          </span>
                                          <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-slate-900 text-red-400 border border-slate-700 shrink-0 tabular-nums">
                                            {m.homeScore} - {m.awayScore}
                                          </span>
                                          <span
                                            title={m.awayTeam}
                                            className={`min-w-0 flex-1 flex items-center gap-1.5 text-left ${
                                              isJuniorAway ? 'text-red-300' : ''
                                            }`}
                                          >
                                            {awayCrest && (
                                              <img
                                                src={awayCrest.src}
                                                alt={awayCrest.alt}
                                                className="w-4 h-4 object-contain shrink-0 drop-shadow"
                                                referrerPolicy="no-referrer"
                                              />
                                            )}
                                            <span className="truncate">{m.awayTeam.replace('de Barranquilla', '').trim()}</span>
                                          </span>
                                        </div>
                                        {m.venue && (
                                          <div className="text-[10px] text-slate-500 truncate">
                                            {m.venue}
                                          </div>
                                        )}
                                        {m.scorers && (
                                          <div className="text-[10px] text-emerald-300/90 leading-relaxed pt-1 border-t border-slate-800/80">
                                            {m.scorers}
                                          </div>
                                        )}
                                        {m.note && (
                                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                                            {m.note}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {filteredMatches.length > 24 && (
                                  <div className="pt-2 text-center">
                                    <button
                                      onClick={() => setShowAllMatches((prev) => !prev)}
                                      className="px-4 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-red-500 text-xs font-bold text-slate-200 transition-colors"
                                    >
                                      {showAllMatches
                                        ? 'Contraer lista de partidos'
                                        : `Mostrar todos los ${filteredMatches.length} partidos oficiales`}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                      </>
                    ) : (
                      /* Campeonato de Fase Única Corrida */
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-bold">
                          ℹ️
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase text-amber-300">
                            Campeonato de Fase Única Corrida — Sin Play-offs Posteriores
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            En la temporada <strong className="text-white">{activeTournamentTable.year}</strong> el campeonato colombiano se jugó bajo la modalidad clásica de rueda corrida de Todos contra Todos. No se disputaron fases semifinales ni play-offs posteriores: el campeón oficial y el subcampeón se consagraron directamente por el acumulado de puntos en la tabla regular mostrada arriba.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ARCHIVO COMPLETO DE PARTIDOS OFICIALES DE LA CAMPAÑA */}
                {activeTournamentTable.matchArchive && activeTournamentTable.matchArchive.length > 0 && (() => {
                  const allMatches = activeTournamentTable.matchArchive;
                  const lapOptions = getMatchArchiveLapOptions(allMatches.length, allMatches);
                  const showLapFilters = lapOptions.length > 0;
                  const showExtendedFilters = allMatches.length >= 18 || showLapFilters;
                  const summary = computeJuniorMatchArchiveSummary(
                    allMatches,
                    getTournamentPointsPerWin(activeTournamentTable.year)
                  );
                  const opponents = showExtendedFilters ? getMatchArchiveOpponents(allMatches) : [];
                  const visibleMatches = showExtendedFilters
                    ? filterMatchArchiveFixtures(allMatches, {
                        lap: showLapFilters ? matchLapFilter : 'all',
                        venue: matchVenueFilter,
                        outcome: matchOutcomeFilter,
                        opponent: matchOpponentFilter,
                      })
                    : allMatches;
                  const hasActiveFilters =
                    matchLapFilter !== 'all' ||
                    matchVenueFilter !== 'all' ||
                    matchOutcomeFilter !== 'all' ||
                    matchOpponentFilter !== 'all';

                  return (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 pt-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-500 shrink-0" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                              Campaña Oficial de Junior Partido a Partido ({allMatches.length} Fechas)
                            </h4>
                          </div>
                          {summary.pj > 0 && (
                            <p className="text-[11px] font-mono tabular-nums text-slate-400">
                              Balance: {summary.pj} PJ · {summary.pg} PG · {summary.pe} PE · {summary.pp} PP · {summary.gf}:{summary.gc} ({summary.dg >= 0 ? `+${summary.dg}` : summary.dg}) · {summary.pts} Pts
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          Fuente oficial: Archivo Histórico Dimayor & Wikipedia
                        </span>
                      </div>

                      {showExtendedFilters && (
                        <div className="flex flex-col gap-2.5 pb-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {showLapFilters && (
                              <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
                                {lapOptions.map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    aria-pressed={matchLapFilter === opt.id}
                                    onClick={() => setMatchLapFilter(opt.id)}
                                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                                      matchLapFilter === opt.id
                                        ? 'bg-red-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 max-w-full">
                                {[
                                  { id: 'all' as const, label: 'Todos' },
                                  { id: 'home' as const, label: 'Local' },
                                  { id: 'away' as const, label: 'Visitante' },
                                ].map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    aria-pressed={matchVenueFilter === opt.id}
                                    onClick={() => setMatchVenueFilter(opt.id)}
                                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                                      matchVenueFilter === opt.id
                                        ? 'bg-red-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>

                              <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 max-w-full">
                                {[
                                  { id: 'all' as const, label: 'Resultado' },
                                  { id: 'win' as const, label: `Ganados (${summary.pg})` },
                                  { id: 'draw' as const, label: `Empates (${summary.pe})` },
                                  { id: 'loss' as const, label: `Perdidos (${summary.pp})` },
                                ].map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    aria-pressed={matchOutcomeFilter === opt.id}
                                    onClick={() => setMatchOutcomeFilter(opt.id)}
                                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                                      matchOutcomeFilter === opt.id
                                        ? 'bg-red-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>

                              {opponents.length > 0 && (
                                <select
                                  aria-label="Filtrar partidos por rival"
                                  value={matchOpponentFilter}
                                  onChange={(e) => setMatchOpponentFilter(e.target.value)}
                                  className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                  <option value="all">Todos los rivales ({opponents.length})</option>
                                  {opponents.map((opp) => (
                                    <option key={opp} value={opp}>
                                      {opp}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>

                          {hasActiveFilters && (
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                              <span>
                                Mostrando {visibleMatches.length} de {allMatches.length} partidos de Junior
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setMatchLapFilter('all');
                                  setMatchVenueFilter('all');
                                  setMatchOutcomeFilter('all');
                                  setMatchOpponentFilter('all');
                                }}
                                className="text-red-400 hover:text-red-300 font-sans font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                              >
                                Limpiar filtros
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {visibleMatches.length === 0 ? (
                        <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
                          <p className="text-xs text-slate-300">
                            No hay partidos de Junior que coincidan con los filtros seleccionados.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setMatchLapFilter('all');
                              setMatchVenueFilter('all');
                              setMatchOutcomeFilter('all');
                              setMatchOpponentFilter('all');
                            }}
                            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            Ver los {allMatches.length} partidos
                          </button>
                        </div>
                      ) : (
                        <div data-testid="match-archive-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {visibleMatches.map((m, idx) => {
                            const isJuniorHome = m.homeTeam.includes('Junior');
                            const isJuniorAway = m.awayTeam.includes('Junior');
                            const homeCrest = getTournamentTeamCrest(activeTournamentTable, m.homeTeam, isJuniorHome);
                            const awayCrest = getTournamentTeamCrest(activeTournamentTable, m.awayTeam, isJuniorAway);
                            const juniorWon = (isJuniorHome && m.homeScore > m.awayScore) || (isJuniorAway && m.awayScore > m.homeScore);
                            const isDraw = m.homeScore === m.awayScore;

                            return (
                              <div
                                key={`${m.round}-${idx}`}
                                className={`p-3 rounded-lg border text-xs transition-colors ${
                                  juniorWon
                                    ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-400'
                                    : isDraw
                                    ? 'bg-slate-950 border-slate-700 hover:border-slate-600'
                                    : 'bg-slate-950 border-rose-900/40 hover:border-rose-800'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-1.5 font-mono tabular-nums">
                                  <span className="font-bold text-amber-400 truncate">{m.round}</span>
                                  <span className="whitespace-nowrap shrink-0">{m.date}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 font-semibold">
                                  <span
                                    title={m.homeTeam}
                                    className={`min-w-0 text-right flex-1 flex items-center justify-end gap-1.5 ${isJuniorHome ? 'text-red-400 font-bold' : 'text-slate-200'}`}
                                  >
                                    <span className="truncate">{m.homeTeam.replace('de Barranquilla', '').trim()}</span>
                                    {homeCrest && (
                                      <img
                                        src={homeCrest.src}
                                        alt={homeCrest.alt}
                                        className="w-4 h-4 object-contain shrink-0 drop-shadow inline-block"
                                      />
                                    )}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-slate-900 font-mono tabular-nums font-bold text-white border border-slate-700 text-xs shrink-0">
                                    {m.homeScore} - {m.awayScore}
                                  </span>
                                  <span
                                    title={m.awayTeam}
                                    className={`min-w-0 text-left flex-1 flex items-center gap-1.5 ${isJuniorAway ? 'text-red-400 font-bold' : 'text-slate-200'}`}
                                  >
                                    {awayCrest && (
                                      <img
                                        src={awayCrest.src}
                                        alt={awayCrest.alt}
                                        className="w-4 h-4 object-contain shrink-0 drop-shadow inline-block"
                                      />
                                    )}
                                    <span className="truncate">{m.awayTeam.replace('de Barranquilla', '').trim()}</span>
                                  </span>
                                </div>
                                {m.note && (
                                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] text-amber-300/90 leading-tight">
                                    ★ {m.note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB INDEPENDIENTE: RECLASIFICACIÓN ANUAL (ERA DE TORNEOS CORTOS 2002+)    */}
        {/* ========================================================================= */}
        {activeTab === 'reclasificacion' && activeReclassificationTable && (
          <div className="space-y-6">
            {/* Year Selector & Editorial Header */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Temporada:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ANNUAL_RECLASSIFICATION_TABLES.map((rec) => (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => setSelectedReclasificacionYear(rec.year)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                            activeReclassificationTable.year === rec.year
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          {rec.year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeReclassificationTable.aperturaTableId === activeReclassificationTable.finalizacionTableId ? (
                      <button
                        type="button"
                        onClick={() => handleOpenStandingsTable(activeReclassificationTable.aperturaTableId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        <Table className="w-3.5 h-3.5 text-amber-400" />
                        <span>Torneo Único {activeReclassificationTable.year}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenStandingsTable(activeReclassificationTable.aperturaTableId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                        >
                          <Table className="w-3.5 h-3.5 text-amber-400" />
                          <span>Apertura {activeReclassificationTable.year}-I</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenStandingsTable(activeReclassificationTable.finalizacionTableId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                        >
                          <Table className="w-3.5 h-3.5 text-sky-400" />
                          <span>Finalización {activeReclassificationTable.year}-II</span>
                        </button>
                      </>
                    )}
                    <ShareButton
                      sectionTitle={activeReclassificationTable.title}
                      customHash={`#tablas-historicas?tabla=${activeReclassificationTable.id}`}
                      buttonText="Compartir"
                      size="sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-1.5">
                    <span className="font-mono font-bold text-sky-400 uppercase">
                      Tabla Anual Independiente
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-semibold text-slate-300">
                      {activeReclassificationTable.subtitle}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                    {activeReclassificationTable.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 max-w-4xl leading-relaxed">
                    {activeReclassificationTable.description}
                  </p>
                </div>

                {/* 4-Card Summary Ribbon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      Líder Reclasificación {activeReclassificationTable.year}
                    </div>
                    <div className="text-sm font-black text-white font-display mt-1">
                      {activeReclassificationTable.leaderTeam}
                    </div>
                    <div className="text-[11px] font-mono text-sky-300 mt-0.5 tabular-nums">
                      {activeReclassificationTable.leaderPoints} pts acumulados · Cupo Libertadores
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {activeReclassificationTable.aperturaTableId === activeReclassificationTable.finalizacionTableId
                        ? 'Campeón del Año'
                        : 'Campeones del Año'}
                    </div>
                    <div className="text-xs font-bold text-white mt-1 space-y-0.5">
                      {activeReclassificationTable.aperturaTableId === activeReclassificationTable.finalizacionTableId ? (
                        <>
                          <div>Campeón: <span className="text-amber-300">{activeReclassificationTable.aperturaChampion}</span></div>
                          <div>Subcampeón: <span className="text-slate-300">{activeReclassificationTable.finalizacionChampion}</span></div>
                        </>
                      ) : (
                        <>
                          <div>I: <span className="text-amber-300">{activeReclassificationTable.aperturaChampion}</span></div>
                          <div>II: <span className="text-amber-300">{activeReclassificationTable.finalizacionChampion}</span></div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/35">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                      Junior en Reclasificación
                    </div>
                    <div className="text-sm font-black text-white font-display mt-1">
                      {activeReclassificationTable.juniorPosition}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {activeReclassificationTable.juniorSummary}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      Descenso a Primera B
                    </div>
                    <div className="text-sm font-black text-white font-display mt-1">
                      {activeReclassificationTable.relegatedTeam || 'Sin descenso'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {activeReclassificationTable.year === '2020'
                        ? 'Promedio aplazado a 2021-I · Cúcuta desafiliado'
                        : `Definido por tabla del promedio ${Number(activeReclassificationTable.year) - 2}–${activeReclassificationTable.year}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Independent 18-Club Reclasificación Table */}
              <div className="p-5 bg-slate-950/40 space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                        <th className="py-2.5 px-3 text-center w-12">Pos</th>
                        <th className="py-2.5 px-4">Club</th>
                        <th className="py-2.5 px-3 text-center">PJ</th>
                        <th className="py-2.5 px-3 text-center">PG</th>
                        <th className="py-2.5 px-3 text-center">PE</th>
                        <th className="py-2.5 px-3 text-center">PP</th>
                        <th className="py-2.5 px-3 text-center">GF</th>
                        <th className="py-2.5 px-3 text-center">GC</th>
                        <th className="py-2.5 px-3 text-center">DG</th>
                        <th className="py-2.5 px-3 text-center font-bold text-white bg-slate-900/60">PTS</th>
                        <th className="py-2.5 px-4 text-center">Estado / Cupos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {activeReclassificationTable.rows.map((row: StandingRow) => {
                        const isFirst = row.pos === 1;
                        const badge = row.statusBadge || 'Permanencia';
                        const upper = badge.toUpperCase();
                        const crest = getTournamentTeamCrest(
                          { year: activeReclassificationTable.year },
                          row.team,
                          row.isJunior
                        );

                        return (
                          <tr
                            key={row.team}
                            className={`transition-colors ${
                              row.isJunior
                                ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                                : isFirst
                                ? 'bg-sky-950/25 hover:bg-sky-950/35'
                                : upper.includes('DESCENDIDO')
                                ? 'bg-rose-950/15 hover:bg-rose-950/25 text-slate-300'
                                : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold">
                              {isFirst ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px]">
                                  1º
                                </span>
                              ) : (
                                row.pos
                              )}
                            </td>

                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {crest && (
                                  <img
                                    src={crest.src}
                                    alt={crest.alt}
                                    className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <span className={row.isJunior ? 'text-white font-extrabold text-sm' : 'text-slate-200'}>
                                  {row.team}
                                </span>
                                {row.isJunior && (
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                    Tu Papá
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-400">{row.pj}</td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-emerald-400 font-bold">{row.pg}</td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-400">{row.pe}</td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-rose-400">{row.pp}</td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-300">{row.gf}</td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-400">{row.gc}</td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-slate-200">
                              {row.dg > 0 ? `+${row.dg}` : row.dg}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums font-black text-white bg-slate-950/60 text-sm">
                              {row.pts}
                            </td>
                            <td className="py-2.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  upper.includes('CAMPEÓN')
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : upper.includes('LIBERTADORES')
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                    : upper.includes('SUDAMERICANA')
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : upper.includes('DESCENDIDO')
                                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/35'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                                }`}
                              >
                                {badge}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Explanatory Footnotes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                      Cupos Internacionales Conmebol
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {activeReclassificationTable.internationalSummary}
                    </p>
                  </div>
                  {activeReclassificationTable.relegationNote && (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                        Nota de Descenso ({activeReclassificationTable.relegatedTeam})
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {activeReclassificationTable.relegationNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HISTORIAL DE POSICIÓN FINAL AÑO POR AÑO (1948 - 2026)              */}
        {/* ========================================================================= */}
        {activeTab === 'posiciones_anuales' && (
          <div className="space-y-6">
            {/* 5-Metric Quick Proof Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>12 Estrellas</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">1º Campeón</div>
                <div className="text-[10px] text-slate-400">12 vueltas olímpicas</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase">
                  <Medal className="w-3.5 h-3.5 text-slate-300" />
                  <span>10 Subcampeonatos</span>
                </div>
                <div className="text-2xl font-black text-slate-200 font-display mt-1">2º Puesto</div>
                <div className="text-[10px] text-slate-400">1948, 1970, 1983, 2000...</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{JUNIOR_YEARLY_STANDINGS.filter((r) => r.phaseType === 'cuadrangular').length} Cuadrangulares</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">Cuadrangulares</div>
                <div className="text-[10px] text-slate-400">Finales y Semifinales</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Hexagonales/Octogonales</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">
                  {JUNIOR_YEARLY_STANDINGS.filter((r) => r.phaseType === 'hexagonal' || r.phaseType === 'octogonal').length} Torneos
                </div>
                <div className="text-[10px] text-slate-400">Era dorada 70s y 80s</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Play-offs</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">
                  {JUNIOR_YEARLY_STANDINGS.filter((r) => r.phaseType === 'playoff').length} Series
                </div>
                <div className="text-[10px] text-slate-400">Ida y vuelta (K.O.)</div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={yearSearch}
                    onChange={(e) => setYearSearch(e.target.value)}
                    placeholder="Filtrar por año (ej. 1977, 2023, Bacca)..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1 shrink-0">Logro:</span>
                  <button
                    onClick={() => setAchievementFilter('todos')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      achievementFilter === 'todos' ? 'bg-red-600 text-white font-bold' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Todos ({JUNIOR_YEARLY_STANDINGS.length})
                  </button>
                  <button
                    onClick={() => setAchievementFilter('campeon')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      achievementFilter === 'campeon' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    ★ Campeón ({JUNIOR_YEARLY_STANDINGS.filter((r) => r.isChampion).length})
                  </button>
                  <button
                    onClick={() => setAchievementFilter('subcampeon')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      achievementFilter === 'subcampeon' ? 'bg-slate-200 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    🥈 Subcampeón ({JUNIOR_YEARLY_STANDINGS.filter((r) => r.isRunnerUp).length})
                  </button>
                  <button
                    onClick={() => setAchievementFilter('fases_finales')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      achievementFilter === 'fases_finales' ? 'bg-red-600 text-white font-bold' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Fases Finales
                  </button>
                </div>
              </div>

              {/* Secondary Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">Fase Final:</span>
                  <button
                    onClick={() => setPhaseTypeFilter('todos')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      phaseTypeFilter === 'todos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todas las fases
                  </button>
                  <button
                    onClick={() => setPhaseTypeFilter('cuadrangular')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      phaseTypeFilter === 'cuadrangular' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cuadrangulares
                  </button>
                  <button
                    onClick={() => setPhaseTypeFilter('hexagonal')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      phaseTypeFilter === 'hexagonal' ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hexagonales
                  </button>
                  <button
                    onClick={() => setPhaseTypeFilter('octogonal')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      phaseTypeFilter === 'octogonal' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Octogonales
                  </button>
                  <button
                    onClick={() => setPhaseTypeFilter('playoff')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      phaseTypeFilter === 'playoff' ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Play-offs
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">Formato FPC:</span>
                  <button
                    onClick={() => setEraFilter('todas')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      eraFilter === 'todas' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setEraFilter('cortos')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      eraFilter === 'cortos' ? 'bg-red-600/30 text-red-300 border border-red-500/40 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cortos (2002-2026)
                  </button>
                  <button
                    onClick={() => setEraFilter('largos')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      eraFilter === 'largos' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Largos (1948-2001)
                  </button>
                </div>
              </div>
            </div>

            {/* Year-by-Year Historical Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3.5 px-4 text-center w-24">Año / Campeonato</th>
                      <th className="py-3.5 px-4">Posición Final</th>
                      <th className="py-3.5 px-4">Fase Final Disputada</th>
                      <th className="py-3.5 px-4">Director Técnico</th>
                      <th className="py-3.5 px-4">Figura / Héroe</th>
                      <th className="py-3.5 px-3 text-center">PJ</th>
                      <th className="py-3.5 px-3 text-center">PTS</th>
                      <th className="py-3.5 px-5">Crónica & Hito del Campeonato</th>
                      <th className="py-3.5 px-4 text-center">Tabla de Posiciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredYearlyStandings.map((item: YearlyStandingRecord) => {
                      const isGold = item.isChampion;
                      const isSilver = item.isRunnerUp;
                      const hasStandingTable =
                        item.standingsTableId ||
                        HISTORIC_TOURNAMENT_STANDINGS_TABLES.some(
                          (t) => t.year === item.year || t.id.startsWith(item.year)
                        );
                      const matchingTable =
                        HISTORIC_TOURNAMENT_STANDINGS_TABLES.find(
                          (t) => t.id === item.standingsTableId || t.year === item.year || t.id.startsWith(item.year)
                        );

                      return (
                        <tr
                          key={item.year}
                          className={`transition-colors ${
                            isGold
                              ? 'bg-amber-950/30 hover:bg-amber-950/50 border-l-4 border-l-amber-500'
                              : isSilver
                              ? 'bg-slate-850/40 hover:bg-slate-800/60 border-l-4 border-l-slate-400'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          {/* Año / Campeonato */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="font-mono text-xs font-black text-white block">
                              {item.year}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {item.era === 'cortos' ? 'Campeonato Corto' : 'Campeonato Largo'}
                            </span>
                          </td>

                          {/* Posición Final */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isGold ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm font-display text-xs tracking-wide">
                                <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                {item.finalPosition}
                              </span>
                            ) : isSilver ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200/20 text-slate-200 font-bold border border-slate-400/40 font-display text-xs tracking-wide">
                                <Medal className="w-3.5 h-3.5 text-slate-300" />
                                {item.finalPosition}
                              </span>
                            ) : (
                              <span className="font-display font-semibold text-slate-200 text-xs">
                                {item.finalPosition}
                              </span>
                            )}
                          </td>

                          {/* Fase Final Disputada */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.phaseType === 'cuadrangular'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : item.phaseType === 'hexagonal'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : item.phaseType === 'octogonal'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : item.phaseType === 'triangular'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : item.phaseType === 'playoff'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.finalPhase}
                            </span>
                          </td>

                          {/* Director Técnico */}
                          <td className="py-3 px-4 text-xs font-semibold text-slate-200 whitespace-nowrap">
                            {item.manager}
                          </td>

                          {/* Figura / Goleador */}
                          <td className="py-3 px-4 text-xs text-amber-300/90 whitespace-nowrap font-medium">
                            {item.topScorerOrHero || '-'}
                          </td>

                          {/* PJ & PTS */}
                          <td className="py-3 px-3 text-center font-mono text-slate-300">
                            {item.gamesPlayed ?? '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-white bg-slate-950/30">
                            {item.points ?? '-'}
                          </td>

                          {/* Crónica & Hito */}
                          <td className="py-3 px-5 text-xs text-slate-400 leading-relaxed min-w-[220px]">
                            {item.keyNote}
                          </td>

                          {/* Ver Tabla de Posiciones CTA */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {matchingTable ? (
                              <button
                                onClick={() => handleOpenStandingsTable(matchingTable.id)}
                                className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-[11px] font-bold uppercase transition-all flex items-center gap-1 mx-auto"
                                title={`Abrir tabla de posiciones de ${matchingTable.phaseTitle}`}
                              >
                                <Table className="w-3 h-3" />
                                <span>Ver Tabla</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">En archivo</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredYearlyStandings.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron campeonatos con los filtros seleccionados. Intenta restablecer los filtros.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TABLA ACUMULADA HISTÓRICA DEL FPC (TODOS LOS TIEMPOS)              */}
        {/* ========================================================================= */}
        {activeTab === 'acumulada' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white uppercase">
                    Junior en la Tabla Histórica de la Categoría Primera A
                  </h3>
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">7.º puesto histórico absoluto</strong> en Wikipedia (corte Finalización 2025, 16 dic. 2025): <strong>88 temporadas</strong>, <strong>3.149 PJ</strong>, <strong>4.676 puntos (x3)</strong> (3.977,25 históricos) y <strong>12 Estrellas</strong> tras Apertura 2026.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0 text-xs">
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  ★ 12 Estrellas · 10 Subc.
                </span>
                <span className="px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-800 font-bold">
                  +598 Dif. Gol
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                      <th className="py-3 px-3 text-center w-12">Pos</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-3 text-center">Temp.</th>
                      <th className="py-3 px-3 text-center">PJ</th>
                      <th className="py-3 px-3 text-center">PG</th>
                      <th className="py-3 px-3 text-center">PE</th>
                      <th className="py-3 px-3 text-center">PP</th>
                      <th className="py-3 px-3 text-center">GF</th>
                      <th className="py-3 px-3 text-center">GC</th>
                      <th className="py-3 px-3 text-center">DG</th>
                      <th className="py-3 px-3 text-center font-bold text-white">PTS</th>
                      <th className="py-3 px-4 text-center font-bold text-amber-400">Ligas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {ALL_TIME_DIMAYOR_TABLE.map((team: HistoricAllTimeTeam) => (
                      <tr
                        key={team.team}
                        className={`transition-colors ${
                          team.isJunior
                            ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {team.pos}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {team.isJunior ? (
                              <img
                                src="/assets/aistudio/image_82370351.png"
                                alt="Escudo Oficial Junior"
                                className="w-5 h-5 object-contain shrink-0 drop-shadow"
                              />
                            ) : null}
                            <span className={team.isJunior ? 'text-white font-bold' : 'text-slate-200'}>
                              {team.team}
                            </span>
                            {team.isJunior && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                                Tu Papá
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{team.seasons}</td>
                        <td className="py-3 px-3 text-center font-mono">{team.pj.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{team.pg.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{team.pe.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono text-rose-400">{team.pp.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{team.gf.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{team.gc.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                          {team.dg > 0 ? `+${team.dg}` : team.dg}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-white bg-slate-950/40">
                          {team.pts.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-400 font-mono">
                          ★ {team.titles}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FORMATOS: TORNEOS LARGOS VS TORNEOS CORTOS                         */}
        {/* ========================================================================= */}
        {activeTab === 'formatos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display text-lg font-bold uppercase text-white">
                    Era Campeonatos Largos (1948 - 2001)
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                  4 Estrellas
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Durante más de cinco décadas se compitió bajo el formato de campeonatos anuales y liguillas finales (Triangulares, Hexagonales y Octogonales). En esta era surgieron las primeras cuatro coronas del club con Juan Ramón Verón, Víctor Ephanor, Carlos Valderrama y el Bombardero Valenciano.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Campeonatos de Liga</div>
                  <div className="text-xl font-black text-amber-400 font-display mt-0.5">4 Títulos</div>
                  <div className="text-[10px] text-slate-400">1977, 1980, 1993, 1995</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Subcampeonatos</div>
                  <div className="text-xl font-black text-slate-200 font-display mt-0.5">4 Veces</div>
                  <div className="text-[10px] text-slate-400">1948, 1970, 1983, 2000</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Goleador de Época</div>
                  <div className="text-base font-bold text-white mt-0.5">I. Valenciano</div>
                  <div className="text-[10px] text-red-400">166 goles (3 botines de oro)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Hito Inmortal</div>
                  <div className="text-base font-bold text-white mt-0.5">Gol Mackenzie</div>
                  <div className="text-[10px] text-slate-400">Minuto 89 vs América (1993)</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  <h3 className="font-display text-lg font-bold uppercase text-white">
                    Era Campeonatos Cortos (2002 - Presente)
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-300 font-mono font-bold">
                  8 Estrellas
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Desde la instauración de los campeonatos Apertura y Finalización en 2002, Junior se convirtió en el club con mayor jerarquía en cuadrangulares y playoffs de eliminación directa, conquistando 8 estrellas ligueras adicionales y 4 copas nacionales oficiales.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Ligas en Campeonatos Cortos</div>
                  <div className="text-xl font-black text-red-400 font-display mt-0.5">8 Estrellas</div>
                  <div className="text-[10px] text-slate-400">04-II, 10-I, 11-II, 18-II, 19-I, 23-II, 25-II, 26-I</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Finales de Liga Disputadas</div>
                  <div className="text-xl font-black text-amber-400 font-display mt-0.5">14 Finales</div>
                  <div className="text-[10px] text-slate-400">8 ganadas (57% de efectividad)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Goleador de Época</div>
                  <div className="text-base font-bold text-white mt-0.5">Carlos Bacca</div>
                  <div className="text-[10px] text-amber-400">135 goles oficiales (4 botines de oro)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Bicampeonatos</div>
                  <div className="text-base font-bold text-white mt-0.5">2 Logrados</div>
                  <div className="text-[10px] text-emerald-400">2018-II/19-I (★8-9) y 2025-II/26-I (★11-12)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: TABLA INTERNACIONAL CONMEBOL                                       */}
        {/* ========================================================================= */}
        {activeTab === 'internacional' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase">
                  Campañas Históricas en Copa Libertadores & Sudamericana
                </h3>
                <p className="text-xs text-slate-300">
                  Junior ha disputado 18 ediciones de Copa Libertadores de América y 9 de Copa Sudamericana, representando a Barranquilla ante los gigantes del continente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INTERNATIONAL_CAMPAIGNS.map((camp) => (
                <div
                  key={camp.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-red-500/40 transition-colors shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">{camp.year}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/30">
                      {camp.stageReached}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-base font-extrabold text-white uppercase">
                      {camp.tournament}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {camp.summary}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                    <div className="text-slate-400 text-[11px]">
                      DT: <strong className="text-slate-200">{camp.manager}</strong>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Partido Memorable: <strong className="text-amber-300">{camp.memorableMatch}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      Figuras: {camp.keyFigures.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: RÉCORDS & HITOS INSTITUCIONALES                                    */}
        {/* ========================================================================= */}
        {activeTab === 'records' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CLUB_MILESTONE_RECORDS.map((rec, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {rec.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">{rec.yearOrEra}</span>
                </div>

                <div>
                  <h4 className="font-display text-base font-bold text-white uppercase">
                    {rec.title}
                  </h4>
                  <div className="font-display text-2xl font-black text-amber-400 tracking-tight mt-1">
                    {rec.value}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                  {rec.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
