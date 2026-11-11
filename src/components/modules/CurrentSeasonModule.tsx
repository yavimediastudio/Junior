import React, { useState } from 'react';
import { Calendar, Users, Table, Trophy, Shield, MapPin, Clock, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { CURRENT_ROSTER, STANDINGS_DATA, FIXTURES_DATA } from '../../data/juniorData';
import { CurrentPlayer, LeagueStanding, MatchFixture } from '../../types/football';

export const CurrentSeasonModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plantilla' | 'tabla' | 'fixture' | 'cuerpo_tecnico'>('plantilla');
  const [positionFilter, setPositionFilter] = useState<'todos' | 'Arquero' | 'Defensa' | 'Volante' | 'Delantero'>('todos');

  const filteredPlayers = CURRENT_ROSTER.filter((p) => {
    if (positionFilter === 'todos') return true;
    return p.position === positionFilter;
  });

  return (
    <section id="actualidad" className="py-16 bg-slate-900/60 border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Módulo 6 · Plantilla & Actualidad</span>
              <span aria-hidden="true">·</span>
              <span>En Competencia Dimayor</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Actualidad Rojiblanca & Plantilla Oficial
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Nómina oficial de Los Tiburones, cuerpo técnico, tabla de posiciones y fixture oficial de la Liga BetPlay Dimayor.
            </p>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-w-full shrink-0">
            <button
              onClick={() => setActiveTab('plantilla')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'plantilla'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Plantilla Oficial</span>
            </button>
            <button
              onClick={() => setActiveTab('tabla')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tabla'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabla de Liga</span>
            </button>
            <button
              onClick={() => setActiveTab('fixture')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'fixture'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendario & Partidos</span>
            </button>
            <button
              onClick={() => setActiveTab('cuerpo_tecnico')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'cuerpo_tecnico'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Cuerpo Técnico</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PLANTILLA PROFESIONAL 2026 */}
        {activeTab === 'plantilla' && (
          <div className="space-y-6">
            {/* Position Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-semibold uppercase text-slate-400 mr-2 shrink-0">Filtrar por Línea:</span>
              {(['todos', 'Arquero', 'Defensa', 'Volante', 'Delantero'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    positionFilter === pos
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos === 'todos' ? 'Todos los Jugadores' : `${pos}s`}
                </button>
              ))}
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPlayers.map((player: CurrentPlayer) => (
                <div
                  key={player.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500/40 transition-all space-y-3 relative overflow-hidden group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-display font-black text-base text-red-500">
                      {player.dorsal}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {player.isCaptain && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Capitán
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-slate-400 border border-slate-800">
                        {player.position}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-bold text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">
                      {player.name}
                    </h4>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{player.nationality}</span>
                      <span aria-hidden="true">·</span>
                      <span>{player.age} años</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Partidos</span>
                      <span className="font-mono font-bold text-slate-200">{player.matchesPlayed}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Goles</span>
                      <span className="font-mono font-bold text-amber-400">{player.goals}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TABLA DE LIGA BETPLAY */}
        {activeTab === 'tabla' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase">
                  Tabla de Posiciones Liga BetPlay 2026
                </h3>
                <p className="text-xs text-slate-400">
                  Los 8 primeros clasifican a los Cuadrangulares Semifinales del Fútbol Colombiano.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                      <th className="py-3 px-3 text-center w-12">Pos</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-3 text-center">PJ</th>
                      <th className="py-3 px-3 text-center">PG</th>
                      <th className="py-3 px-3 text-center">PE</th>
                      <th className="py-3 px-3 text-center">PP</th>
                      <th className="py-3 px-3 text-center">GF</th>
                      <th className="py-3 px-3 text-center">GC</th>
                      <th className="py-3 px-3 text-center">DG</th>
                      <th className="py-3 px-3 text-center font-bold text-white">PTS</th>
                      <th className="py-3 px-4 text-center">Racha (Últimos 5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {STANDINGS_DATA.map((team: LeagueStanding) => (
                      <tr
                        key={team.team}
                        className={`transition-colors ${
                          team.isJunior
                            ? 'bg-red-950/40 hover:bg-red-950/60 font-semibold border-l-4 border-l-red-500'
                            : 'hover:bg-slate-900/40 text-slate-300'
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
                                Bicampeón
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{team.pj}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-400">{team.pg}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{team.pe}</td>
                        <td className="py-3 px-3 text-center font-mono text-rose-400">{team.pp}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-300">{team.gf}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{team.gc}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                          {team.dg > 0 ? `+${team.dg}` : team.dg}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-white bg-slate-900/40">
                          {team.pts}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {team.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                  res === 'W'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : res === 'D'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
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
          </div>
        )}

        {/* TAB 3: CALENDARIO & PARTIDOS RECIENTES */}
        {activeTab === 'fixture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FIXTURES_DATA.map((match: MatchFixture) => (
              <div
                key={match.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 hover:border-red-500/40 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-red-400 uppercase">{match.competition}</span>
                  <span className="text-[11px] font-mono text-slate-400">{match.date}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${match.homeTeam.includes('Junior') ? 'text-white' : 'text-slate-300'}`}>
                      {match.homeTeam.includes('Junior') && (
                        <img
                          src="/assets/aistudio/image_82370351.png"
                          alt="Junior"
                          className="w-4 h-4 object-contain shrink-0 drop-shadow inline-block"
                        />
                      )}
                      <span>{match.homeTeam}</span>
                    </span>
                    <span className="font-mono text-base font-black text-white">
                      {match.homeScore ?? '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${match.awayTeam.includes('Junior') ? 'text-white' : 'text-slate-300'}`}>
                      {match.awayTeam.includes('Junior') && (
                        <img
                          src="/assets/aistudio/image_82370351.png"
                          alt="Junior"
                          className="w-4 h-4 object-contain shrink-0 drop-shadow inline-block"
                        />
                      )}
                      <span>{match.awayTeam}</span>
                    </span>
                    <span className="font-mono text-base font-black text-white">
                      {match.awayScore ?? '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span className="truncate">{match.venue}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      match.status === 'played'
                        ? 'bg-slate-800 text-slate-300'
                        : match.status === 'live'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {match.status === 'played' ? 'Finalizado' : match.status === 'live' ? 'En Vivo' : match.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CUERPO TÉCNICO & SEDES */}
        {activeTab === 'cuerpo_tecnico' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 uppercase">Dirección Técnica</span>
                  <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight">
                    César Farías
                  </h3>
                  <span className="text-xs text-slate-400">Estratega internacional con amplia experiencia en selecciones y clubes de Sudamérica</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                El timonel venezolano asumió la dirección técnica del conjunto tiburón para consolidar el orden táctico, la presión tras pérdida y la contundencia ofensiva liderada por Carlos Bacca, José Enamorado y Yimmi Chará.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Asistente Técnico:</span>
                  <span className="font-semibold text-slate-200">Pedro De Pablos</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Preparador Físico:</span>
                  <span className="font-semibold text-slate-200">Isaac Ramos</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Entrenador de Arqueros:</span>
                  <span className="font-semibold text-slate-200">José María Pazo</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">Infraestructura del Club</span>
                  <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight">
                    Sede Adelita de Char
                  </h3>
                  <span className="text-xs text-slate-400">Sabanagrande, Atlántico</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Complejo deportivo de alto rendimiento con canchas de medidas reglamentarias Fifa, gimnasio de última tecnología, zona húmeda, hotel de concentración y centro médico especializado para el primer equipo y las divisiones menores.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="text-amber-400 font-bold uppercase text-[11px]">Casa de Competencia:</div>
                <div className="text-slate-200">
                  <strong>Estadio Metropolitano Roberto Meléndez</strong> (Capacidad: 46.692 espectadores).
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
