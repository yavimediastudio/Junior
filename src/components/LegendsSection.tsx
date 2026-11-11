import React, { useState } from 'react';
import {
  Trophy,
  Search,
  Quote,
  Target,
  UserCheck,
  X,
  ArrowRightLeft,
  Shield,
  Award,
} from 'lucide-react';
import {
  CURRENT_ROSTER,
  LEGENDS_DATA,
  MOST_APPEARANCES_ALL_TIME,
  TOP_SCORERS_ALL_TIME,
} from '../data/juniorData';
import { PlayerLegend } from '../types/football';

export const LegendsSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'leyendas' | 'records' | 'plantilla'>('leyendas');
  const [posFilter, setPosFilter] = useState<'Todos' | 'Delantero' | 'Volante' | 'Arquero' | 'Director Técnico'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLegendModal, setSelectedLegendModal] = useState<PlayerLegend | null>(null);

  const filteredLegends = LEGENDS_DATA.filter((leg) => {
    const matchesPos = posFilter === 'Todos' || leg.position === posFilter;
    const matchesSearch =
      leg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leg.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  const filteredRoster = CURRENT_ROSTER.filter((p) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <section id="leyendas" className="py-16 bg-slate-900/40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & View Mode Switch */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <span>ADN Currambero</span>
              <span aria-hidden="true">·</span>
              <span>Héroes & Figuras</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Goleadores Históricos & Plantilla
            </h2>
          </div>

          {/* Segmented View Switch */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setViewMode('leyendas')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'leyendas'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ídolos & Biografías
            </button>
            <button
              onClick={() => setViewMode('records')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'records'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Récords Oficiales (Top Goles & Presencias)
            </button>
            <button
              onClick={() => setViewMode('plantilla')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'plantilla'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plantilla Actual 2025/2026
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o apodo..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {viewMode === 'leyendas' && (
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['Todos', 'Delantero', 'Volante', 'Arquero', 'Director Técnico'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    posFilter === pos
                      ? 'bg-red-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {pos === 'Director Técnico' ? 'DTs' : pos === 'Todos' ? 'Todos' : `${pos}s`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* VIEW 1: LEYENDAS & GOLEADORES */}
        {viewMode === 'leyendas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLegends.map((legend) => (
              <div
                key={legend.id}
                onClick={() => setSelectedLegendModal(legend)}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500/60 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                        &quot;{legend.nickname}&quot;
                      </span>
                      <h3 className="font-display text-xl font-bold uppercase text-white group-hover:text-red-400 transition-colors">
                        {legend.name}
                      </h3>
                      <span className="text-xs text-slate-500">{legend.era}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        {legend.position}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 my-3 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Partidos</span>
                      <span className="font-mono text-sm font-bold text-white tabular-nums">
                        {legend.matches}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Goles</span>
                      <span className="font-mono text-sm font-bold text-red-400 tabular-nums">
                        {legend.goals}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Títulos</span>
                      <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
                        {legend.titles.length}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {legend.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[200px] text-[11px] italic text-slate-400">
                    {legend.signatureSkill}
                  </span>
                  <span className="text-red-400 font-semibold text-[11px] group-hover:translate-x-0.5 transition-transform shrink-0">
                    Ver Perfil →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: PLANTILLA ACTUAL 2025/2026 */}
        {viewMode === 'plantilla' && (
          <div className="space-y-6">
            {/* Context & Transfers Callout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Dirección Técnica & Proceso</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Arturo Reyes:</strong> Campeón de la 10ª estrella (Dic 2023) y líder invicto de fase en Libertadores 2024 (1-3 a Botafogo en Río) hasta sept. 2024.<br />
                  <strong className="text-white">César Farías:</strong> Asumió en septiembre 2024 para la recta final de liga y torneos 2025, integrando el nuevo ciclo técnico con ídolos de la casa.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                  <ArrowRightLeft className="w-4 h-4 text-red-400" />
                  <span>Mercado de Fichajes Reciente (2024 - 2026)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Transferencias:</strong> Gabriel Fuentes traspasado a Fluminense (agosto 2024); Walmer Pacheco al Pereira. Edwin Herrera y Yeferson Moreno asumieron las bandas laterales.<br />
                  <strong className="text-white">Refuerzos:</strong> Regreso de Vladimir Hernández, llegada de Andrés Colorado y Nicolás Zalazar; Steven &quot;Titi&quot; Rodríguez consolidado como goleador y Carlos Bacca superando los 125 goles.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-red-500" />
                  Nómina Oficial Registrada ante Dimayor
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full w-fit">
                  22 Jugadores Inscritos · Capitán: Carlos Bacca (#70)
                </span>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 text-center">Dorsal</th>
                    <th className="py-3 px-4">Jugador</th>
                    <th className="py-3 px-3">Posición</th>
                    <th className="py-3 px-3">Nacionalidad</th>
                    <th className="py-3 px-3 text-center">Edad</th>
                    <th className="py-3 px-3 text-center">Partidos</th>
                    <th className="py-3 px-3 text-center">Goles</th>
                    <th className="py-3 px-4 text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredRoster.map((player) => (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-900/50 transition-colors text-slate-300"
                    >
                      <td className="py-3 px-4 text-center font-bold text-amber-400 tabular-nums text-sm">
                        #{player.dorsal}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-white flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.isCaptain && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-500 text-slate-950 font-sans uppercase">
                            Capitán
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-300">{player.position}</td>
                      <td className="py-3 px-3 font-sans text-slate-400">{player.nationality}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-slate-400">{player.age}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-slate-300">{player.matchesPlayed}</td>
                      <td className="py-3 px-3 text-center tabular-nums font-bold text-red-400">{player.goals}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            player.status === 'titular'
                              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {player.status === 'titular' ? 'Titular' : 'Suplente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: RÉCORDS OFICIALES DE GOLES Y PARTIDOS */}
      {viewMode === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Col 1: Máximos Goleadores Históricos */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Tabla Oficial de Todos los Tiempos
                </span>
                <h3 className="font-display text-lg font-bold uppercase text-white">
                  Máximos Goleadores Históricos
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                1924 - Presente
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {TOP_SCORERS_ALL_TIME.map((scorer) => (
                <div
                  key={scorer.rank}
                  className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-black font-mono ${
                        scorer.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/50'
                          : scorer.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : scorer.rank === 3
                          ? 'bg-amber-800 text-amber-200'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      #{scorer.rank}
                    </span>

                    <div>
                      <h4 className="font-sans text-xs sm:text-sm font-bold text-white">
                        {scorer.player}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{scorer.role}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{scorer.era}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-black text-red-400 block tabular-nums">
                      {scorer.statValue}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">{scorer.statLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Más Partidos Oficiales */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider block">
                  Fidelidad & Presencias
                </span>
                <h3 className="font-display text-lg font-bold uppercase text-white">
                  Más Partidos Oficiales con Junior
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                Récord Histórico
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {MOST_APPEARANCES_ALL_TIME.map((app) => (
                <div
                  key={app.rank}
                  className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-black font-mono ${
                        app.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/50'
                          : app.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : app.rank === 3
                          ? 'bg-amber-800 text-amber-200'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      #{app.rank}
                    </span>

                    <div>
                      <h4 className="font-sans text-xs sm:text-sm font-bold text-white">
                        {app.player}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{app.role}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{app.era}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-black text-amber-300 block tabular-nums">
                      {app.statValue}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">{app.statLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

        {/* MODAL: FICHA COMPLETA DE LEYENDA */}
        {selectedLegendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedLegendModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
                  &quot;{selectedLegendModal.nickname}&quot;
                </div>
                <h3 className="font-display text-3xl font-extrabold uppercase text-white tracking-tight">
                  {selectedLegendModal.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{selectedLegendModal.position}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedLegendModal.yearsInClub}</span>
                </div>
              </div>

              {/* Big Stats Row */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Partidos Jugados</span>
                  <span className="font-mono text-2xl font-black text-white tabular-nums">
                    {selectedLegendModal.matches}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Goles Oficiales</span>
                  <span className="font-mono text-2xl font-black text-red-500 tabular-nums">
                    {selectedLegendModal.goals}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Títulos Alzados</span>
                  <span className="font-mono text-2xl font-black text-amber-400 tabular-nums">
                    {selectedLegendModal.titles.length}
                  </span>
                </div>
              </div>

              {/* Bio & Skills */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>{selectedLegendModal.bio}</p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-bold text-red-400 text-xs mb-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>Habilidad Insignia:</span>
                  </div>
                  <p className="text-xs text-slate-200">{selectedLegendModal.signatureSkill}</p>
                </div>

                {selectedLegendModal.famousQuote && (
                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 flex items-start gap-2.5">
                    <Quote className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs italic text-red-200">
                      {selectedLegendModal.famousQuote}
                    </p>
                  </div>
                )}
              </div>

              {/* Trophies List */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                  Palmarés con Junior:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedLegendModal.titles.map((t: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
