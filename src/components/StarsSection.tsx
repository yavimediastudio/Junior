import React, { useState } from 'react';
import { Trophy, Star, Calendar, MapPin, Award, CheckCircle2, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { STARS_DATA, ALL_16_OFFICIAL_TITLES } from '../data/juniorData';
import { ChampionshipStar, OfficialTitleItem } from '../types/football';

export const StarsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'estrellas' | 'palmares_completo' | 'explicacion'>('estrellas');
  const [selectedStar, setSelectedStar] = useState<ChampionshipStar>(STARS_DATA[9]); // Default to 10th star (2023-II)
  const [selectedTitleCategory, setSelectedTitleCategory] = useState<'todos' | 'liga' | 'copa' | 'superliga'>('todos');

  const filteredTitles = ALL_16_OFFICIAL_TITLES.filter((t) => {
    if (selectedTitleCategory === 'liga') return t.category === 'Liga (Estrella)';
    if (selectedTitleCategory === 'copa') return t.category === 'Copa Colombia';
    if (selectedTitleCategory === 'superliga') return t.category === 'Superliga';
    return true;
  });

  return (
    <section id="estrellas" className="py-16 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Palmarés Oficial DIMAYOR</span>
              <span aria-hidden="true">·</span>
              <span>14 Títulos en el Profesionalismo</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Palmarés Oficial: Las 10 Estrellas & 14 Títulos Dimayor
            </h2>
          </div>

          {/* Segmented Controls */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto max-w-full shrink-0">
            <button
              onClick={() => setActiveTab('estrellas')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'estrellas'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>10 Estrellas de Liga</span>
            </button>

            <button
              onClick={() => setActiveTab('palmares_completo')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'palmares_completo'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>14 Títulos Oficiales (Listado Completo)</span>
            </button>

            <button
              onClick={() => setActiveTab('explicacion')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'explicacion'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>¿10 Estrellas o 14 Títulos? (Aclaratoria)</span>
            </button>
          </div>
        </div>

        {/* Highlight Callout: 10 Stars and 14 Dimayor Titles */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Palmarés Actualizado Dimayor: 10 Estrellas de Liga y 14 Títulos Oficiales
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Junior ostenta <strong>10 Estrellas bordadas en el pecho</strong> correspondientes a sus títulos de Primera División de Liga colombiana (1977, 1980, 1993, 1995, 2004-II, 2010-I, 2011-II, 2018-II, 2019-I y 2023-II). Sumando las <strong>2 Copas Colombia</strong> (2015, 2017) y las <strong>2 Superligas</strong> (2019, 2020), el Tiburón acumula <strong>14 títulos oficiales Dimayor</strong> en su historia profesional.
                </p>
              </div>
            </div>

            <div className="md:col-span-4 grid grid-cols-3 gap-2 text-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-xl font-black text-amber-400 font-display">10</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Ligas (Estrellas)</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-xl font-black text-red-400 font-display">4</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Copas/Superligas</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-amber-500/40 ring-1 ring-amber-500/30">
                <div className="text-xl font-black text-white font-display">14</div>
                <div className="text-[10px] text-amber-400 uppercase font-semibold">Total Dimayor</div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: LAS 10 ESTRELLAS DE LIGA */}
        {activeTab === 'estrellas' && (
          <div>
            {/* 10 Stars Ribbon */}
            <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-8">
              {STARS_DATA.map((star) => (
                <button
                  key={star.starNumber}
                  onClick={() => setSelectedStar(star)}
                  className={`p-3 rounded-xl border text-center transition-all group ${
                    selectedStar.starNumber === star.starNumber
                      ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-1">
                    <Star
                      className={`w-4 h-4 ${
                        selectedStar.starNumber === star.starNumber
                          ? 'fill-amber-400'
                          : 'group-hover:fill-amber-400/30'
                      }`}
                    />
                  </div>
                  <div className="font-display text-sm font-black text-white">
                    ★ {star.starNumber}
                  </div>
                  <div className="font-mono text-[11px] text-amber-400/90 font-bold mt-0.5">
                    {star.year}
                  </div>
                </button>
              ))}
            </div>

            {/* Detailed Star Showcase (2 Columns Split) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">
              {/* Main Star Story (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                        Estrella de Liga #{selectedStar.starNumber} ({selectedStar.year})
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                        {selectedStar.tournament}
                      </h3>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800 text-xs font-bold text-red-300">
                    {selectedStar.aggregateScore}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {selectedStar.description}
                </p>

                {/* Unforgettable Moment Highlight */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Momento Clave Inolvidable:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                    &quot;{selectedStar.keyMoment}&quot;
                  </p>
                </div>

                {/* Facts Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Rival en la Final:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedStar.opponent}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Héroe Consagrado:</span>
                    <span className="font-semibold text-amber-300 mt-0.5 block">{selectedStar.hero}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Director Técnico:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedStar.manager}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Escenario de Vuelta:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">{selectedStar.venue}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] uppercase tracking-wider">Fecha de Consagración:</span>
                    <span className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>{selectedStar.date}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Trophy Visual & Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative max-h-72">
                  <img
                    src="/src/assets/images/junior_legends_trophy_1794167192174.jpg"
                    alt="Celebración del título de campeón de Junior de Barranquilla"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-xs text-white font-medium">
                    La gloria rojiblanca: 10 vueltas olímpicas de Primera División y 14 títulos oficiales.
                  </div>
                </div>

                {/* Additional Honors in Trophy Room */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-red-400" />
                      <h4 className="font-display text-base font-bold uppercase text-white tracking-wide">
                        Copas & Superligas Oficiales
                      </h4>
                    </div>
                    <span className="text-xs text-amber-400 font-bold">4 Títulos</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">Copa Colombia 2015</div>
                        <div className="text-[11px] text-slate-400">vs Santa Fe (2-0 global)</div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">DT: Alexis Mendoza</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">Copa Colombia 2017</div>
                        <div className="text-[11px] text-slate-400">vs Independiente Medellín (3-1)</div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">DT: Julio Comesaña</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">Superliga 2019</div>
                        <div className="text-[11px] text-slate-400">vs Deportes Tolima (penales)</div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">DT: Luis F. Suárez</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">Superliga 2020</div>
                        <div className="text-[11px] text-slate-400">vs América de Cali (3-2 global)</div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">DT: Julio Comesaña</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PALMARÉS COMPLETO (16 TÍTULOS OFICIALES DIMAYOR) */}
        {activeTab === 'palmares_completo' && (
          <div className="space-y-6">
            {/* Filter buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-semibold uppercase text-slate-400 mr-2 shrink-0">Filtrar por Competencia:</span>
              <button
                onClick={() => setSelectedTitleCategory('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedTitleCategory === 'todos' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Todos los 14 Títulos (100%)
              </button>
              <button
                onClick={() => setSelectedTitleCategory('liga')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedTitleCategory === 'liga' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                12 Ligas de Primera División (Estrellas)
              </button>
              <button
                onClick={() => setSelectedTitleCategory('copa')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedTitleCategory === 'copa' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                2 Copas Colombia
              </button>
              <button
                onClick={() => setSelectedTitleCategory('superliga')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedTitleCategory === 'superliga' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                2 Superligas de Colombia
              </button>
            </div>

            {/* Cards Grid of all 16 official championships */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTitles.map((item: OfficialTitleItem) => (
                <div
                  key={item.number}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-display font-black text-xs">
                        #{item.number}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">{item.year}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.category === 'Liga (Estrella)'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.category === 'Copa Colombia'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {item.category === 'Liga (Estrella)' ? `Estrella #${item.starNumber} de Liga` : item.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-lg font-extrabold text-white uppercase tracking-tight">
                      {item.titleName}
                    </h4>
                    <div className="text-xs text-slate-400 mt-1">vs {item.opponent}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Marcador / Final:</span>
                      <span className="font-semibold text-amber-300">{item.score}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Director Técnico:</span>
                      <span className="font-semibold text-slate-200">{item.manager}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Figura Consagrada:</span>
                      <span className="font-semibold text-slate-200">{item.hero}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    &quot;{item.keyNote}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ACLARATORIA PEDAGÓGICA (¿12 ESTRELLAS O 16 TÍTULOS?) */}
        {activeTab === 'explicacion' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight">
                  Guía Oficial Dimayor: Las 10 Estrellas y los 14 Títulos Oficiales
                </h3>
                <span className="text-xs text-slate-400">Normativa, tradición y conteo avalado por la División Mayor del Fútbol Colombiano</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-display text-base font-bold text-amber-400 uppercase">
                  1. Las 10 Estrellas del Escudo (Liga de Primera División)
                </h4>
                <p>
                  En Colombia, según la tradición del FPC y las directrices institucionales de los clubes, <strong>solamente los torneos de Liga de Primera División dan derecho a bordar una estrella física en el escudo de la camiseta</strong>. Junior de Barranquilla ha sido 10 veces campeón de Liga (1977, 1980, 1993, 1995, 2004-II, 2010-I, 2011-II, 2018-II, 2019-I y 2023-II). Por esta razón, el hincha y la prensa deportiva celebran con orgullo las <strong>10 Estrellas</strong> del escudo rojiblanco.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-display text-base font-bold text-red-400 uppercase">
                  2. Los 4 Títulos Oficiales de Copas Nacionales Dimayor
                </h4>
                <p>
                  Además de la Liga, la Dimayor organiza dos certámenes oficiales de máxima categoría que otorgan título y trofeo oficial:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li><strong>Copa Colombia (2 títulos):</strong> Campeón en 2015 (frente a Santa Fe) y 2017 (frente al Medellín).</li>
                  <li><strong>Superliga de Colombia (2 títulos):</strong> Campeón en 2019 (frente al Deportes Tolima) y 2020 (frente al América de Cali).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-display text-base font-bold text-sky-400 uppercase">
                  3. El Conteo Total Oficial: 14 Campeonatos en el Profesionalismo
                </h4>
                <p>
                  Cuando se evalúa el <strong>palmarés histórico total del club en la época profesional</strong> (a partir de 1948), la suma matemática oficial Dimayor es:
                </p>
                <div className="text-center py-3 font-mono font-bold text-base text-amber-300 bg-slate-900 rounded-lg border border-slate-800">
                  10 Ligas + 2 Copas Colombia + 2 Superligas = 14 Títulos Oficiales Dimayor
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Junior ostenta <strong>10 Estrellas de Liga</strong> y un total de <strong>14 Títulos Oficiales Dimayor</strong> en sus vitrinas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
