import React, { useState } from 'react';
import {
  Trophy,
  Globe,
  Calendar,
  Flame,
  ChevronRight,
  Shield,
  Layers,
  Award,
  ArrowRight,
} from 'lucide-react';
import {
  FIXTURES_DATA,
  HISTORIC_DERBIES,
  INTERNATIONAL_CAMPAIGNS,
  STANDINGS_DATA,
} from '../data/juniorData';
import { DerbyRecord, InternationalCampaign } from '../types/football';
import {
  calculateWinPercentage,
  filterFixturesByCompetition,
  playStadiumAudio,
  sortLeagueStandings,
} from '../utils/footballLogic';

interface ResultsSectionProps {
  audioEnabled: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ audioEnabled }) => {
  const [activeTab, setActiveTab] = useState<'clasicos' | 'internacional' | 'partidos' | 'tabla'>('clasicos');
  const [selectedDerby, setSelectedDerby] = useState<DerbyRecord>(HISTORIC_DERBIES[0]);
  const [selectedCampaign, setSelectedCampaign] = useState<InternationalCampaign>(INTERNATIONAL_CAMPAIGNS[0]);
  const [competitionFilter, setCompetitionFilter] = useState<string>('Todas');

  const sortedStandings = sortLeagueStandings(STANDINGS_DATA);
  const filteredFixtures = filterFixturesByCompetition(FIXTURES_DATA, competitionFilter);

  const handleTabChange = (tab: 'clasicos' | 'internacional' | 'partidos' | 'tabla') => {
    setActiveTab(tab);
    if (audioEnabled) {
      playStadiumAudio('drum');
    }
  };

  return (
    <section id="resultados" className="py-16 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>Enciclopedia Histórica & Archivo Real</span>
              <span aria-hidden="true">·</span>
              <span>Datos Oficiales Verificados</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Clásicos, Archivo Oficial & Estadísticas Reales
            </h2>
          </div>

          {/* Segmented Controls for 4 Encyclopedic Tabs */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full shrink-0">
            <button
              onClick={() => handleTabChange('clasicos')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'clasicos'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Clásicos del FPC</span>
            </button>

            <button
              onClick={() => handleTabChange('internacional')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'internacional'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Gestas Internacionales</span>
            </button>

            <button
              onClick={() => handleTabChange('partidos')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'partidos'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Partidos Oficiales</span>
            </button>

            <button
              onClick={() => handleTabChange('tabla')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tabla'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Tabla de Posiciones</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HISTORIAL DE CLÁSICOS DEL FPC */}
        {activeTab === 'clasicos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Clásicos List (4 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Selecciona un Clásico Histórico:
              </span>
              {HISTORIC_DERBIES.map((derby) => {
                const isSelected = selectedDerby.id === derby.id;
                const winRate = calculateWinPercentage(derby.juniorWins, derby.totalMatches);

                return (
                  <div
                    key={derby.id}
                    onClick={() => {
                      setSelectedDerby(derby);
                      if (audioEnabled) playStadiumAudio('drum');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-900 border-red-500 shadow-md ring-1 ring-red-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                        {derby.derbyName}
                      </span>
                      <h3 className="font-display text-lg font-bold uppercase text-white group-hover:text-red-400 transition-colors">
                        vs {derby.opponent}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{derby.totalMatches} partidos</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-bold">{derby.juniorWins} triunfos tiburones</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-red-400 block">
                        {winRate}% vic.
                      </span>
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isSelected ? 'text-red-400 translate-x-1' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Derby Full Encyclopedic Dossier (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                      {selectedDerby.derbyName}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                      Junior de Barranquilla vs {selectedDerby.opponent}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-slate-300">
                    {selectedDerby.rivalColors}
                  </span>
                </div>

                {/* Big Stats Row */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center mb-6">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Victorias Junior</span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                      {selectedDerby.juniorWins}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {calculateWinPercentage(selectedDerby.juniorWins, selectedDerby.totalMatches)}% efectividad
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Empates</span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-slate-300 tabular-nums">
                      {selectedDerby.draws}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {calculateWinPercentage(selectedDerby.draws, selectedDerby.totalMatches)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Victorias Rival</span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-red-400 tabular-nums">
                      {selectedDerby.opponentWins}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {calculateWinPercentage(selectedDerby.opponentWins, selectedDerby.totalMatches)}%
                    </span>
                  </div>
                </div>

                {/* Goals Comparison Bar */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-red-400 font-bold">Goles Junior: {selectedDerby.juniorGoals}</span>
                    <span className="text-slate-400 font-bold">Goles {selectedDerby.opponent}: {selectedDerby.opponentGoals}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-[#D62027] h-full"
                      style={{
                        width: `${(selectedDerby.juniorGoals / (selectedDerby.juniorGoals + selectedDerby.opponentGoals)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-slate-600 h-full"
                      style={{
                        width: `${(selectedDerby.opponentGoals / (selectedDerby.juniorGoals + selectedDerby.opponentGoals)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Historical Narrative */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Historia & Relevancia:
                    </h4>
                    <p>{selectedDerby.historicalContext}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
                      Mayor Goleada Histórica Registrada:
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {selectedDerby.biggestWin}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Historial oficial de primera división de Colombia</span>
                <span className="text-emerald-400 font-bold font-mono">Total {selectedDerby.totalMatches} clásicos</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GESTAS INTERNACIONALES */}
        {activeTab === 'internacional' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Hitos Continentales de Junior:
              </span>
              {INTERNATIONAL_CAMPAIGNS.map((camp) => {
                const isSelected = selectedCampaign.id === camp.id;
                return (
                  <div
                    key={camp.id}
                    onClick={() => {
                      setSelectedCampaign(camp);
                      if (audioEnabled) playStadiumAudio('drum');
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-slate-900 border-red-500 ring-1 ring-red-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">{camp.year}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {camp.stageReached.split('·')[0]}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold uppercase text-white group-hover:text-red-400 transition-colors">
                      {camp.tournament}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      DT: {camp.manager}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    {selectedCampaign.tournament} ({selectedCampaign.year})
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                    {selectedCampaign.stageReached}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded bg-red-950/60 border border-red-700/80 text-red-300 text-xs font-bold font-mono w-fit">
                  DT: {selectedCampaign.manager}
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div>
                  <h4 className="text-xs font-bold uppercase text-white tracking-wider mb-1">
                    Reseña de la Campaña:
                  </h4>
                  <p>{selectedCampaign.summary}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Partido Memorable del Torneo:
                  </h4>
                  <p className="text-slate-200">{selectedCampaign.memorableMatch}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Figuras Insignia de la Campaña:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.keyFigures.map((fig, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium text-xs flex items-center gap-1.5"
                      >
                        <Award className="w-3 h-3 text-red-500" />
                        <span>{fig}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Balance: {selectedCampaign.resultSummary}</span>
                  <span className="text-amber-400">Torneo Conmebol</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PARTIDOS OFICIALES REALES */}
        {activeTab === 'partidos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Filtro por Competición Oficial:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(['Todas', 'Liga BetPlay', 'Copa Libertadores', 'Superliga'] as const).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setCompetitionFilter(comp)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      competitionFilter === comp
                        ? 'bg-red-600 text-white font-semibold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFixtures.map((match) => (
                <div
                  key={match.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800/80">
                      <span className="font-semibold text-red-400 uppercase tracking-wider">
                        {match.competition} · {match.round}
                      </span>
                      <span className="font-mono text-slate-500">{match.date}</span>
                    </div>

                    <div className="grid grid-cols-5 items-center text-center my-3">
                      <div className="col-span-2 text-right">
                        <span className={`text-sm sm:text-base font-bold block truncate ${match.homeTeam.includes('Junior') ? 'text-white' : 'text-slate-300'}`}>
                          {match.homeTeam}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">Local</span>
                      </div>

                      <div className="col-span-1">
                        {match.status === 'played' ? (
                          <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-base font-mono font-black text-amber-400">
                            {match.homeScore} - {match.awayScore}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-slate-900 text-xs font-mono font-bold text-slate-400">
                            VS
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-left">
                        <span className={`text-sm sm:text-base font-bold block truncate ${match.awayTeam.includes('Junior') ? 'text-white' : 'text-slate-300'}`}>
                          {match.awayTeam}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">Visitante</span>
                      </div>
                    </div>

                    {match.scorers && match.scorers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-900 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Goleadores:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {match.scorers.map((sc, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                            >
                              ⚽ {sc.player} ({sc.minute}&apos;)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[280px]">📍 {match.venue}</span>
                    <span className="font-semibold text-slate-400">{match.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TABLA DE POSICIONES OFICIAL */}
        {activeTab === 'tabla' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Liga BetPlay Dimayor · Clasificación Oficial
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Clasifican los 8 primeros a Cuadrangulares Semifinales
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 text-center">Pos</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-3 text-center">PJ</th>
                    <th className="py-3 px-3 text-center">PG</th>
                    <th className="py-3 px-3 text-center">PE</th>
                    <th className="py-3 px-3 text-center">PP</th>
                    <th className="py-3 px-3 text-center">GF</th>
                    <th className="py-3 px-3 text-center">GC</th>
                    <th className="py-3 px-3 text-center">DG</th>
                    <th className="py-3 px-4 text-center font-bold text-white">PTS</th>
                    <th className="py-3 px-4 text-center">Forma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {sortedStandings.map((team) => (
                    <tr
                      key={team.team}
                      className={`transition-colors ${
                        team.isJunior
                          ? 'bg-red-950/30 text-white font-semibold'
                          : 'hover:bg-slate-900/50 text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                            team.pos <= 8
                              ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {team.pos}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-white flex items-center gap-2">
                        {team.isJunior && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0" />
                        )}
                        <span>{team.team}</span>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums">{team.pj}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-emerald-400">{team.pg}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-slate-400">{team.pe}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-red-400">{team.pp}</td>
                      <td className="py-3 px-3 text-center tabular-nums">{team.gf}</td>
                      <td className="py-3 px-3 text-center tabular-nums text-slate-400">{team.gc}</td>
                      <td className="py-3 px-3 text-center tabular-nums font-bold text-amber-300">{team.dg > 0 ? `+${team.dg}` : team.dg}</td>
                      <td className="py-3 px-4 text-center tabular-nums text-sm font-black text-white bg-slate-900/40">
                        {team.pts}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {team.form.map((res, idx) => (
                            <span
                              key={idx}
                              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                res === 'W'
                                  ? 'bg-emerald-600 text-white'
                                  : res === 'D'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
