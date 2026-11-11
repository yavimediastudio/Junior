import React, { useState } from 'react';
import { Swords, Trophy, Shield, MapPin, Search, CheckCircle, Percent, Flame } from 'lucide-react';
import { HISTORIC_DERBIES } from '../../data/juniorData';
import { DerbyRecord } from '../../types/football';
import { calculateWinPercentage, playStadiumAudio } from '../../utils/footballLogic';

interface HeadToHeadModuleProps {
  audioEnabled?: boolean;
}

export const HeadToHeadModule: React.FC<HeadToHeadModuleProps> = ({ audioEnabled = true }) => {
  const [selectedDerbyId, setSelectedDerbyId] = useState<string>('derby-nacional');
  const [searchFilter, setSearchFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState<'todos' | 'local' | 'visitante'>('todos');

  const selectedDerby: DerbyRecord =
    HISTORIC_DERBIES.find((d) => d.id === selectedDerbyId) || HISTORIC_DERBIES[0];

  const filteredDerbies = HISTORIC_DERBIES.filter((d) =>
    d.opponent.toLowerCase().includes(searchFilter.toLowerCase()) ||
    d.derbyName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelectRival = (derby: DerbyRecord) => {
    setSelectedDerbyId(derby.id);
    if (audioEnabled) {
      playStadiumAudio('whistle');
    }
  };

  const winPct = calculateWinPercentage(selectedDerby.juniorWins, selectedDerby.totalMatches);
  const goalDiff = selectedDerby.juniorGoals - selectedDerby.opponentGoals;

  return (
    <section id="resultados-vs-equipos" className="py-16 bg-slate-900/70 border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <Swords className="w-4 h-4 text-red-500" />
              <span>Módulo 2 · Cara a Cara Oficial</span>
              <span aria-hidden="true">·</span>
              <span>Historial del FPC</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Resultados Históricos vs Rival
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Selecciona un rival de la Liga colombiana para explorar el balance frente a frente, finales de campeonato disputadas, mayor goleada y anécdotas de vestuario.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar rival (ej. Nacional, Tolima)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Rival Quick Selector Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {filteredDerbies.map((derby) => (
            <button
              key={derby.id}
              onClick={() => handleSelectRival(derby)}
              className={`px-3.5 py-2.5 rounded-xl border text-left shrink-0 transition-all flex items-center gap-2.5 ${
                selectedDerby.id === derby.id
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/50 font-bold'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Shield className={`w-4 h-4 ${selectedDerby.id === derby.id ? 'text-white' : 'text-slate-400'}`} />
              <div className="whitespace-nowrap">
                <div className="text-xs font-semibold leading-tight">{derby.opponent}</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{derby.totalMatches} PJ oficiales</div>
              </div>
            </button>
          ))}
        </div>

        {/* Rival Focus Showcase Grid (7 / 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Stat Matrix & Visual Balance */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-6">
              {/* Rival Badge & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400 block">
                    {selectedDerby.derbyName}
                  </span>
                  <div className="flex items-center gap-2.5 mt-1">
                    <img
                      src="/assets/aistudio/image_82370351.png"
                      alt="Escudo Junior"
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow"
                    />
                    <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                      Junior de Barranquilla <span className="text-slate-500 font-light">vs</span> {selectedDerby.opponent}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">Colores rivales: {selectedDerby.rivalColors}</span>
                </div>

                <div className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Total Partidos</div>
                  <div className="text-xl font-black text-white font-mono">{selectedDerby.totalMatches} PJ</div>
                </div>
              </div>

              {/* 3 Outcome Stat Blocks (Junior Wins, Draws, Rival Wins) */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                  <div className="text-[11px] uppercase font-bold text-emerald-400">Triunfos Junior</div>
                  <div className="font-display text-3xl font-black text-emerald-400 mt-1">
                    {selectedDerby.juniorWins}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {winPct}% efectividad
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/50">
                  <div className="text-[11px] uppercase font-bold text-slate-300">Empates</div>
                  <div className="font-display text-3xl font-black text-slate-200 mt-1">
                    {selectedDerby.draws}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {Math.round((selectedDerby.draws / selectedDerby.totalMatches) * 100)}% empates
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30">
                  <div className="text-[11px] uppercase font-bold text-rose-400">Triunfos Rival</div>
                  <div className="font-display text-3xl font-black text-rose-400 mt-1">
                    {selectedDerby.opponentWins}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {Math.round((selectedDerby.opponentWins / selectedDerby.totalMatches) * 100)}% rival
                  </div>
                </div>
              </div>

              {/* Goal Balance Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-400">Junior: {selectedDerby.juniorGoals} Goles</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Diferencia: <strong className={goalDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{goalDiff >= 0 ? `+${goalDiff}` : goalDiff}</strong>
                  </span>
                  <span className="font-bold text-slate-300">{selectedDerby.opponent}: {selectedDerby.opponentGoals} Goles</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(selectedDerby.juniorGoals / (selectedDerby.juniorGoals + selectedDerby.opponentGoals)) * 100}%` }}
                    className="bg-red-600 transition-all duration-500"
                  />
                  <div
                    style={{ width: `${(selectedDerby.opponentGoals / (selectedDerby.juniorGoals + selectedDerby.opponentGoals)) * 100}%` }}
                    className="bg-slate-600 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Greatest Victory Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Mayor Goleada Histórica Oficial:</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-white font-mono">
                  {selectedDerby.biggestWin}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Historical Narrative & Famous Finals */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h4 className="font-display text-lg font-bold uppercase text-white">
                  Crónica & Mística del Clásico
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedDerby.historicalContext}
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Condición en Barranquilla (El Metro):</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  En el calor de la capital del Caribe, Junior históricamente supera el 60% de victorias frente a este rival, convirtiendo a Barranquilla en un verdadero fortín inexpugnable.
                </p>
              </div>

              {/* Sound Effect Button */}
              {audioEnabled && (
                <button
                  onClick={() => playStadiumAudio('cheer')}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>🔊 Alentar contra {selectedDerby.opponent}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
