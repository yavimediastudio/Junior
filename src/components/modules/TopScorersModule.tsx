import React, { useState } from 'react';
import { Target, Trophy, Award, Flame, Star, Sparkles, User, ChevronRight } from 'lucide-react';
import { TOP_SCORERS_ALL_TIME, GOLDEN_BOOT_WINNERS, LEGENDS_DATA } from '../../data/juniorData';
import { HistoricalRankingStat, GoldenBootRecord, PlayerLegend } from '../../types/football';

export const TopScorersModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'botines' | 'detalle'>('ranking');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('valenciano');

  const selectedLegend: PlayerLegend | undefined =
    LEGENDS_DATA.find((l) => l.id === selectedPlayerId) || LEGENDS_DATA[0];

  return (
    <section id="goleadores-historicos" className="py-16 bg-slate-950 border-b border-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>Módulo 3 · Cañoneros Legendarios</span>
              <span aria-hidden="true">·</span>
              <span>Récord Histórico de Goles</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/image_82370351.png"
                alt="Escudo Oficial Junior"
                className="w-10 h-10 object-contain shrink-0 drop-shadow-md"
              />
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
                Goleadores Históricos de Junior
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Desde el bombazo imparable de Iván René Valenciano hasta el instinto matador de Carlos Bacca y la magia brasileña de Víctor Ephanor.
            </p>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full shrink-0">
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Ranking Histórico</span>
            </button>
            <button
              onClick={() => setActiveTab('botines')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'botines'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>8 Botines de Oro</span>
            </button>
            <button
              onClick={() => setActiveTab('detalle')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'detalle'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Ficha Técnica Ídolo</span>
            </button>
          </div>
        </div>

        {/* TAB 1: RANKING OFICIAL */}
        {activeTab === 'ranking' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Top 3 Podium Highlights (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    #1 Histórico Absoluto
                  </span>
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>

                <div>
                  <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight">
                    Iván René Valenciano
                  </h3>
                  <div className="text-xs text-amber-300 font-semibold mt-0.5">
                    &quot;El Bombardero de La Arenosa&quot;
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Goles Oficiales</span>
                    <div className="text-3xl font-black text-white font-display">166 Goles</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Partidos</span>
                    <div className="text-lg font-bold text-slate-300 font-mono">265 PJ</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &quot;A los arqueros no se les mira la cara, se les mira el arco y se le pega fuerte.&quot;
                </p>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  3 Botines de Oro Dimayor (1991, 1995, 1995/96) y bicampeón de liga (1993, 1995).
                </div>
              </div>

              {/* Carlos Bacca Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-red-400">#2 Histórico</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Goleador Activo</span>
                </div>
                <h4 className="font-display text-lg font-extrabold text-white uppercase">
                  Carlos Bacca
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>125+ goles oficiales</span>
                  <span className="font-mono text-amber-400 font-bold">4 Estrellas ganadas</span>
                </div>
              </div>
            </div>

            {/* Scorer Ranking Table (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Tabla de los Máximos Artilleros de la Historia
                </span>
                <span className="text-[11px] text-slate-500 font-mono">1924 - 2026</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {TOP_SCORERS_ALL_TIME.map((scorer: HistoricalRankingStat) => (
                  <div
                    key={scorer.rank}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm shrink-0 ${
                          scorer.rank === 1
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                            : scorer.rank === 2
                            ? 'bg-slate-200 text-slate-950'
                            : scorer.rank === 3
                            ? 'bg-amber-800/60 text-amber-200'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{scorer.rank}
                      </div>

                      <div>
                        <div className="text-sm font-bold text-white leading-snug">
                          {scorer.player}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{scorer.role}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{scorer.era}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-amber-400 font-display">
                        {scorer.statValue}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        {scorer.statLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOTINES DE ORO OFICIALES */}
        {activeTab === 'botines' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-white uppercase">
                  Los 8 Botines de Oro Dimayor con la Camiseta de Junior
                </h3>
                <p className="text-xs text-slate-300">
                  Delanteros que se consagraron como los máximos artilleros del fútbol profesional colombiano vistiendo la franja rojiblanca.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GOLDEN_BOOT_WINNERS.map((gb: GoldenBootRecord) => (
                <div
                  key={gb.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">{gb.year}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {gb.goals} Goles
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-base font-extrabold text-white uppercase">
                      {gb.player}
                    </h4>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">{gb.tournament}</div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed italic pt-2 border-t border-slate-800">
                    &quot;{gb.note}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FICHA TÉCNICA ÍDOLO */}
        {activeTab === 'detalle' && (
          <div className="space-y-6">
            {/* Scorer selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {LEGENDS_DATA.filter((l) => l.goals > 0).map((legend) => (
                <button
                  key={legend.id}
                  onClick={() => setSelectedPlayerId(legend.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-2 border ${
                    selectedLegend.id === legend.id
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{legend.name}</span>
                </button>
              ))}
            </div>

            {/* Detail Showcase */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                    {selectedLegend.nickname} · {selectedLegend.era}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    {selectedLegend.name}
                  </h3>
                  <span className="text-xs text-slate-400">{selectedLegend.position}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Goles</div>
                    <div className="text-2xl font-black text-amber-400 font-display">
                      {selectedLegend.goals}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Partidos</div>
                    <div className="text-2xl font-black text-white font-display">
                      {selectedLegend.matches}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedLegend.bio}
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                <span className="text-amber-400 font-bold uppercase text-[11px] block">
                  Habilidad Registrada:
                </span>
                <p className="text-slate-300">{selectedLegend.signatureSkill}</p>
              </div>

              {selectedLegend.famousQuote && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 italic">
                  {selectedLegend.famousQuote}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
