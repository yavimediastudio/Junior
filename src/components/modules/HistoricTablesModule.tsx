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
import { ShareButton } from '../ShareButton';
import {
  HistoricAllTimeTeam,
  YearlyStandingRecord,
  TournamentStandingsTable,
  StandingRow,
} from '../../types/football';
import {
  isJuniorChampionTournament,
  isJuniorRunnerUpTournament,
  isChampionStatusBadge,
  isRunnerUpStatusBadge,
} from '../../utils/footballLogic';

export const HistoricTablesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'tablas_posiciones' | 'posiciones_anuales' | 'acumulada' | 'formatos' | 'internacional' | 'records'
  >('tablas_posiciones');

  // Selected tournament table in the Tablas de Posiciones tab
  const [selectedTableId, setSelectedTableId] = useState<string>('1948-inaugural');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [phaseViewMode, setPhaseViewMode] = useState<'ambas' | 'regular' | 'playoff'>('ambas');
  const [tableCategoryFilter, setTableCategoryFilter] = useState<
    'todos' | 'estrellas' | 'no_campeon' | 'subcampeonatos' | 'cuadrangulares' | 'hexagonales' | 'octogonales' | 'playoffs' | 'regulares'
  >('todos');
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState('');

  // Sincronizar selección directa desde el buscador global o línea de tiempo
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('junior-pending-standings-table');
      if (pending) {
        setSelectedTableId(pending);
        setActiveTab('tablas_posiciones');
        setTournamentSearchQuery('');
        setTableCategoryFilter('todos');
        sessionStorage.removeItem('junior-pending-standings-table');
      }
    } catch {}

    const handleSelectTable = (event: Event) => {
      const customEvent = event as CustomEvent<{ tableId: string }>;
      if (customEvent.detail?.tableId) {
        setSelectedTableId(customEvent.detail.tableId);
        setActiveTab('tablas_posiciones');
        setTournamentSearchQuery('');
        setTableCategoryFilter('todos');
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

  // Filtered tournament tables list sorted chronologically
  const filteredTournamentTables = [...HISTORIC_TOURNAMENT_STANDINGS_TABLES]
    .sort((a, b) => {
      const orderA = a.chronologicalOrder ?? 0;
      const orderB = b.chronologicalOrder ?? 0;
      return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
    })
    .filter((t) => {
      // Text search query
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

  const activeTournamentTable: TournamentStandingsTable =
    HISTORIC_TOURNAMENT_STANDINGS_TABLES.find((t) => t.id === selectedTableId) ||
    HISTORIC_TOURNAMENT_STANDINGS_TABLES[0];

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
    <section id="tablas-historicas" className="py-16 bg-slate-950 border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <Table className="w-4 h-4 text-red-500" />
              <span>Módulo 1 · Tablas de Posiciones Oficiales Dimayor</span>
              <span aria-hidden="true">·</span>
              <span>1948 - 2024</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Tablas de Posiciones: Cuadrangulares, Hexagonales & Año a Año
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Consulta las tablas de posiciones completas con todos los equipos, puntos y goles en los Cuadrangulares Finales, Hexagonales, Octogonales, Play-offs y el historial completo año por año (1948 - 2024).
            </p>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full shrink-0">
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
          <div className="space-y-6">
            {/* Header Proof Banner with Chronological Direction Selector */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <ListOrdered className="w-4 h-4 text-amber-400" />
                  <span>Tablas Oficiales en Orden Cronológico (1948 - 2024)</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">1º Todos contra Todos + 2º Play-offs</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Lista cronológica oficial de campeonatos de la Dimayor. Para cada certamen se detalla primero la <strong className="text-white">1ª Fase de Todos contra Todos (Fase Regular)</strong> y a continuación la <strong className="text-white">2ª Fase de Play-offs</strong> (Cuadrangular, Hexagonal, Octogonal, Triangular o Play-offs K.O.).
                </p>
              </div>

              {/* Quick Summary Badges & Chronological Order Direction Button */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-xs font-bold text-amber-300 transition-colors shadow-sm"
                  title="Haz clic para invertir el orden cronológico"
                >
                  <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Orden: </span>
                  <span className="text-white">
                    {sortOrder === 'asc' ? '1948 ➔ 2024 (Antiguo a Reciente)' : '2024 ➔ 1948 (Reciente a Antiguo)'}
                  </span>
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold">
                  ★ 10 Estrellas
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold">
                  🥈 10 Subcampeonatos Oficiales
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1 shrink-0">Filtro:</span>
              <button
                onClick={() => setTableCategoryFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'todos' ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Todas las Tablas ({HISTORIC_TOURNAMENT_STANDINGS_TABLES.length})
              </button>
              <button
                onClick={() => setTableCategoryFilter('no_campeon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  tableCategoryFilter === 'no_campeon' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🚫 Años sin Título (No Campeón)</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({HISTORIC_TOURNAMENT_STANDINGS_TABLES.filter((t) => !isJuniorChampionTournament(t)).length})
                </span>
              </button>
              <button
                onClick={() => setTableCategoryFilter('estrellas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'estrellas' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                ★ Campeón ({HISTORIC_TOURNAMENT_STANDINGS_TABLES.filter(isJuniorChampionTournament).length} Estrellas)
              </button>
              <button
                onClick={() => setTableCategoryFilter('subcampeonatos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'subcampeonatos' ? 'bg-slate-200 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                🥈 Subcampeonatos ({HISTORIC_TOURNAMENT_STANDINGS_TABLES.filter(isJuniorRunnerUpTournament).length})
              </button>
              <button
                onClick={() => setTableCategoryFilter('cuadrangulares')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'cuadrangulares' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Cuadrangulares
              </button>
              <button
                onClick={() => setTableCategoryFilter('hexagonales')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'hexagonales' ? 'bg-sky-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Hexagonales
              </button>
              <button
                onClick={() => setTableCategoryFilter('octogonales')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'octogonales' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Octogonales
              </button>
              <button
                onClick={() => setTableCategoryFilter('playoffs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'playoffs' ? 'bg-purple-600 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Play-offs / K.O.
              </button>
              <button
                onClick={() => setTableCategoryFilter('regulares')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  tableCategoryFilter === 'regulares' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Fases Regulares Únicas
              </button>
            </div>

            {/* Quick Search & Direct Dropdown Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tournamentSearchQuery}
                  onChange={(e) => setTournamentSearchQuery(e.target.value)}
                  placeholder="Buscar campeonato cronológico (ej. 1948, 1952, 1977, 1980, 1993, 2004, 2023, Santa Fe, Nacional)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase whitespace-nowrap">Seleccionar Campeonato:</span>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="text-xs bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-red-500 max-w-xs truncate"
                >
                  <optgroup label="⭐ Años Campeón (10 Estrellas Oficiales)">
                    {HISTORIC_TOURNAMENT_STANDINGS_TABLES.filter(isJuniorChampionTournament).map((t) => (
                      <option key={t.id} value={t.id}>{t.year} - {t.tournamentName} (★ CAMPEÓN)</option>
                    ))}
                  </optgroup>
                  <optgroup label="🚫 Años sin Título (No Campeón - Subcampeonatos & Fases Finales)">
                    {HISTORIC_TOURNAMENT_STANDINGS_TABLES.filter((t) => !isJuniorChampionTournament(t)).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.year} - {t.tournamentName} ({isJuniorRunnerUpTournament(t) ? '🥈 Subcampeón' : 'No campeón'})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Tournament Selector Grid (Chronologically Ordered) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredTournamentTables.map((t) => {
                const isSelected = t.id === selectedTableId;
                const isChampion = isJuniorChampionTournament(t);
                const isSilver = isJuniorRunnerUpTournament(t);

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTableId(t.id)}
                    className={`p-3 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/60 ring-2 ring-red-400/50'
                        : isChampion
                        ? 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-amber-500/40 ring-1 ring-amber-500/20'
                        : isSilver
                        ? 'bg-slate-900 hover:bg-slate-850 text-slate-200 border-slate-600'
                        : 'bg-slate-900/60 hover:bg-slate-850 text-slate-300 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-black block">{t.year}</span>
                      {isChampion ? (
                        <span className="text-[10px] font-bold text-amber-300">★ Campeón</span>
                      ) : isSilver ? (
                        <span className="text-[10px] font-bold text-slate-300">🥈 Subcampeón</span>
                      ) : (
                        <span className="text-[9px] font-semibold text-rose-400">No campeón</span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold truncate leading-tight">
                      {t.phaseType === 'cuadrangular'
                        ? 'Cuadrangular'
                        : t.phaseType === 'hexagonal'
                        ? 'Hexagonal Final'
                        : t.phaseType === 'octogonal'
                        ? 'Octogonal Final'
                        : t.phaseType === 'triangular'
                        ? 'Triangular Final'
                        : t.phaseType === 'playoff'
                        ? 'Play-offs K.O.'
                        : 'Campeonato Corrido'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 truncate">
                      {t.tournamentName}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTournamentTables.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-900 rounded-xl border border-slate-800">
                No se encontraron tablas de posiciones con el filtro o búsqueda actual. Restablece la categoría o búsqueda.
              </div>
            )}

            {/* Active Tournament Detail Header Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-2.5 py-0.5 rounded">
                        Año {activeTournamentTable.year}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          activeTournamentTable.phaseType === 'cuadrangular'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : activeTournamentTable.phaseType === 'hexagonal'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : activeTournamentTable.phaseType === 'octogonal'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : activeTournamentTable.phaseType === 'triangular'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : activeTournamentTable.phaseType === 'playoff'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Formato: {activeTournamentTable.phaseType === 'cuadrangular' ? 'Todos contra Todos + Cuadrangulares' : activeTournamentTable.phaseType === 'hexagonal' ? 'Todos contra Todos + Hexagonal Final' : activeTournamentTable.phaseType === 'octogonal' ? 'Todos contra Todos + Octogonal Final' : activeTournamentTable.phaseType === 'triangular' ? 'Todos contra Todos + Triangular Final' : activeTournamentTable.phaseType === 'playoff' ? 'Todos contra Todos + Play-offs K.O.' : 'Liga Única Corrida'}
                      </span>
                      {isJuniorChampionTournament(activeTournamentTable) ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ★ Campeón de Colombia (Estrella Oficial)
                        </span>
                      ) : isJuniorRunnerUpTournament(activeTournamentTable) ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/20 text-slate-200 border border-slate-400/40">
                          🥈 Subcampeón de Colombia (Estrella de Plata)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                          🚫 No Campeón
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                      {activeTournamentTable.tournamentName}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                      {activeTournamentTable.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end gap-2.5 shrink-0 self-start md:self-auto">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-right w-full sm:w-auto">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">
                        {isJuniorChampionTournament(activeTournamentTable) ? 'Campeón de Liga' : 'Campeón del Campeonato'}
                      </div>
                      <div className="text-sm font-black text-amber-400 font-display mt-0.5">
                        {activeTournamentTable.championTeam}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-end gap-1.5">
                        <img
                          src="/assets/aistudio/image_82370351.png"
                          alt="Escudo Junior"
                          className="w-4 h-4 object-contain shrink-0 drop-shadow"
                        />
                        <span>Junior: <strong className="text-white">{activeTournamentTable.juniorFinish}</strong></span>
                      </div>
                    </div>

                    <ShareButton
                      sectionTitle={`Campeonato ${activeTournamentTable.year} - ${activeTournamentTable.tournamentName}`}
                      customHash={`#tablas-historicas?tabla=${activeTournamentTable.id}`}
                      buttonText="Compartir Campeonato"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                    />
                  </div>
                </div>

                {/* Phase View Switcher Pills */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
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
                      {activeTournamentTable.hasFinalPhase !== false && (
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
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Mostrando orden cronológico: <span className="font-mono text-amber-300 font-bold">{activeTournamentTable.year}</span>
                  </div>
                </div>
              </div>

              {/* DUAL TABLES CONTAINER */}
              <div className="p-5 space-y-8 bg-slate-950/40">
                {/* ========================================================================= */}
                {/* 1ª FASE: TABLA DE TODOS CONTRA TODOS (FASE REGULAR)                       */}
                {/* ========================================================================= */}
                {(phaseViewMode === 'ambas' || phaseViewMode === 'regular') && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono text-[10px] font-bold uppercase">
                            1ª Fase Oficial
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
                                    {row.isJunior ? (
                                      <img
                                        src="/assets/aistudio/image_82370351.png"
                                        alt="Escudo Oficial Junior"
                                        className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                      />
                                    ) : null}
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
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                      isChampionStatusBadge(row.statusBadge)
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                        : isRunnerUpStatusBadge(row.statusBadge)
                                        ? 'bg-slate-200/20 text-slate-200 border border-slate-400/40'
                                        : row.statusBadge?.toUpperCase().includes('CLASIFICADO')
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {row.statusBadge || '-'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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

                        {/* Play-off Standings Table */}
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
                                        {row.isJunior ? (
                                          <img
                                            src="/assets/aistudio/image_82370351.png"
                                            alt="Escudo Oficial Junior"
                                            className="w-5 h-5 object-contain shrink-0 drop-shadow"
                                          />
                                        ) : null}
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
                                      <span
                                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                          isChampionStatusBadge(row.statusBadge)
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                            : isRunnerUpStatusBadge(row.statusBadge)
                                            ? 'bg-slate-200/20 text-slate-200 border border-slate-400/40'
                                            : row.statusBadge?.toUpperCase().includes('CLASIFICADO')
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                            : 'bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        {row.statusBadge || '-'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Play-off Finals and Knockout matches */}
                        {activeTournamentTable.playoffMatches && activeTournamentTable.playoffMatches.length > 0 && (
                          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                              <Flame className="w-4 h-4 text-red-500" />
                              <span>Gran Final / Definición Directa de la Fase de Play-offs</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {activeTournamentTable.playoffMatches.map((m, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                                >
                                  <div className="text-[10px] uppercase font-mono font-bold text-amber-400">
                                    {m.stage}
                                  </div>
                                  <div className="flex items-center justify-between text-xs font-bold text-white">
                                    <span>{m.homeTeam}</span>
                                    <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-slate-900 text-red-400 border border-slate-700">
                                      {m.homeScore} - {m.awayScore}
                                    </span>
                                    <span>{m.awayTeam}</span>
                                  </div>
                                  {m.note && (
                                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 leading-relaxed">
                                      {m.note}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                {activeTournamentTable.matchArchive && activeTournamentTable.matchArchive.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Campaña Oficial Partido a Partido ({activeTournamentTable.matchArchive.length} Fechas)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-400">
                        Fuente oficial: Archivo Histórico Dimayor & Wikipedia
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {activeTournamentTable.matchArchive.map((m, idx) => {
                        const isJuniorHome = m.homeTeam.includes('Junior');
                        const isJuniorAway = m.awayTeam.includes('Junior');
                        const juniorWon = (isJuniorHome && m.homeScore > m.awayScore) || (isJuniorAway && m.awayScore > m.homeScore);
                        const isDraw = m.homeScore === m.awayScore;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              juniorWon
                                ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-400'
                                : isDraw
                                ? 'bg-slate-950 border-slate-700 hover:border-slate-600'
                                : 'bg-slate-950 border-rose-900/40 hover:border-rose-800'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
                              <span className="font-bold text-amber-400">{m.round}</span>
                              <span>{m.date}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 font-semibold">
                              <span className={`truncate text-right flex-1 flex items-center justify-end gap-1.5 ${isJuniorHome ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                                <span>{m.homeTeam.replace('de Barranquilla', '').trim()}</span>
                                {isJuniorHome && (
                                  <img
                                    src="/assets/aistudio/image_82370351.png"
                                    alt="Junior"
                                    className="w-4 h-4 object-contain shrink-0 drop-shadow inline-block"
                                  />
                                )}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 font-mono font-bold text-white border border-slate-700 text-xs shrink-0">
                                {m.homeScore} - {m.awayScore}
                              </span>
                              <span className={`truncate text-left flex-1 flex items-center gap-1.5 ${isJuniorAway ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                                {isJuniorAway && (
                                  <img
                                    src="/assets/aistudio/image_82370351.png"
                                    alt="Junior"
                                    className="w-4 h-4 object-contain shrink-0 drop-shadow inline-block"
                                  />
                                )}
                                <span>{m.awayTeam.replace('de Barranquilla', '').trim()}</span>
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
                  </div>
                )}
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
                  <span>10 Estrellas</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">1º Campeón</div>
                <div className="text-[10px] text-slate-400">10 vueltas olímpicas</div>
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
                  <span>26+ Cuadrangulares</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">Cuadrangulares</div>
                <div className="text-[10px] text-slate-400">Finales y Semifinales</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Hexagonales/Octogonales</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">10 Campeonatos</div>
                <div className="text-[10px] text-slate-400">Era dorada 70s y 80s</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Play-offs</span>
                </div>
                <div className="text-2xl font-black text-white font-display mt-1">14 Series</div>
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
                    ★ Campeón (12)
                  </button>
                  <button
                    onClick={() => setAchievementFilter('subcampeon')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      achievementFilter === 'subcampeon' ? 'bg-slate-200 text-slate-950 font-bold' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    🥈 Subcampeón (11)
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
                    Junior en el Olimpo del FPC
                  </h3>
                  <p className="text-xs text-slate-300">
                    6º puesto histórico absoluto de la Primera División Dimayor con más de <strong>3.400 partidos</strong>, <strong>4.120 puntos</strong> y <strong>10 Estrellas de Liga</strong>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs">
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  ★ 10 Estrellas
                </span>
                <span className="px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-800 font-bold">
                  +750 Dif. Gol
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
                  <div className="text-xl font-black text-amber-400 font-display mt-0.5">15 Finales</div>
                  <div className="text-[10px] text-slate-400">Efectividad de más del 53%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Goleador de Época</div>
                  <div className="text-base font-bold text-white mt-0.5">Carlos Bacca</div>
                  <div className="text-[10px] text-amber-400">125+ goles (3 botines de oro)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Bicampeonatos</div>
                  <div className="text-base font-bold text-white mt-0.5">2 Logrados</div>
                  <div className="text-[10px] text-emerald-400">2018-II/2019-I y 2025-II/2026-I</div>
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
