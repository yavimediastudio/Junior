import React from 'react';
import { Trophy, ChevronRight, Shield, Shirt, Users } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
      {/* Background Hero Image with Measured Gradient Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/junior_hero_stadium_1794167190681.jpg"
          alt="Estadio Metropolitano Roberto Meléndez colmado de hinchas de Junior de Barranquilla"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        {/* Subtle red/navy atmospheric gradient */}
        <div className="absolute inset-0 bg-radial-at-t from-red-600/10 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-3xl">
          {/* Clean Unboxed Metadata with Typographic Separators & Official Shield */}
          <div className="flex items-center gap-3.5 mb-4">
            <img
              src="/assets/aistudio/image_82370351.png"
              alt="Escudo Oficial Junior de Barranquilla"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-xl"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase text-red-400">
              <span>Club Deportivo Popular</span>
              <span aria-hidden="true">·</span>
              <span>Fundado el 7 de Agosto de 1924</span>
              <span aria-hidden="true">·</span>
              <span>Barranquilla, Colombia</span>
            </div>
          </div>

          {/* Athletic Display Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[0.95] mb-6">
            ¡Junior Tu Papá! <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
              Orgullo & Pasión Caribe
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
            Bienvenido a la gran enciclopedia histórica e interactiva de Los Tiburones organizada en <strong>6 ventanas oficiales independientes</strong>:
            <strong> Tablas Históricas</strong>, <strong>Resultados vs Equipos</strong>, <strong>Goleadores Históricos</strong>,
            <strong> Uniformes</strong>, <strong>Títulos</strong> y <strong>Actualidad Oficial</strong>. Abre cualquier ventana para explorar su archivo completo sin saturación.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => onNavigate('titulos')}
              className="px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white bg-[#D62027] hover:bg-red-700 rounded-lg shadow-lg shadow-red-900/40 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Ventana 05: Títulos (10★)</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('tablas-historicas')}
              className="px-5 py-3.5 text-sm font-semibold tracking-wide text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Ventana 01: Tablas Históricas</span>
            </button>

            <button
              onClick={() => onNavigate('resultados-vs-equipos')}
              className="px-5 py-3.5 text-sm font-semibold tracking-wide text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Ventana 02: vs Equipos</span>
            </button>

            <button
              onClick={() => onNavigate('goleadores-historicos')}
              className="px-5 py-3.5 text-sm font-semibold tracking-wide text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Ventana 03: Goleadores</span>
            </button>
          </div>
        </div>

        {/* 4-Metric Proof Row - Clean unboxed stats with tabular numerals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Palmarés Oficial Dimayor</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums">
              14 Títulos
            </div>
            <p className="text-xs text-slate-400 mt-1">10 Estrellas de Liga + 4 Copas/Superligas</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>Goleador Histórico</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums">
              166 Goles
            </div>
            <p className="text-xs text-slate-400 mt-1">Iván René Valenciano</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Capacidad Metro</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums">
              46.692
            </div>
            <p className="text-xs text-slate-400 mt-1">Roberto Meléndez, La Caldera</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              <Shirt className="w-3.5 h-3.5 text-amber-300" />
              <span>Historia Centenaria</span>
            </div>
            <div className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums">
              100+ Años
            </div>
            <p className="text-xs text-slate-400 mt-1">Doña Micaela Lavalle (1924)</p>
          </div>
        </div>
      </div>
    </section>
  );
};
