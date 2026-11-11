import React from 'react';
import { ExternalLink, Sparkles, LayoutGrid, ArrowRight, ShieldCheck } from 'lucide-react';
import { MODULE_ITEMS, ModuleItemConfig } from './ModuleNavigation';
import { AppModuleId } from '../types/football';

interface HomeWindowsGridProps {
  onOpenWindow: (moduleId: AppModuleId) => void;
}

export const HomeWindowsGrid: React.FC<HomeWindowsGridProps> = ({ onOpenWindow }) => {
  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-800/60">
            <img src="/assets/aistudio/image_82370351.png" alt="Escudo Junior" className="w-4 h-4 object-contain shrink-0" />
            <span>Enciclopedia Oficial por Ventanas</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
            Explora las 6 Ventanas del Tiburón
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            La información enciclopédica del Junior de Barranquilla está organizada en 6 ventanas temáticas independientes. Haz clic en cualquier ventana para entrar y ver su información detallada.
          </p>
        </div>

        {/* 6 Windows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULE_ITEMS.map((item: ModuleItemConfig) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => onOpenWindow(item.id)}
                className={`group relative rounded-2xl bg-gradient-to-b ${item.accentColor} border border-slate-800 ${item.borderHover} p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-950/30 cursor-pointer overflow-hidden`}
              >
                {/* Ambient glow top corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-red-600/10 transition-colors" />

                {/* Card Top: Window Number & Badge */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-slate-950/80 border border-red-500/30">
                      Ventana {item.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-red-500/60 transition-all shadow-md">
                      <Icon className="w-6 h-6 text-red-500 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">
                        {item.label}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.tagline}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    {item.description}
                  </p>

                  {/* Highlight Stat Metric Box */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between mb-6">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Dato Destacado</div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">{item.statLabel}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-black text-amber-400 font-mono">
                        {item.statValue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA Button */}
                <div className="relative z-10 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWindow(item.id);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-red-600 text-slate-200 group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-800 group-hover:border-red-500 shadow-sm"
                  >
                    <span>Abrir Ventana</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote reassurance */}
        <div className="mt-10 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-400 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Al abrir cualquier ventana podrás navegar con total profundidad y regresar al portal en un clic.</span>
          </div>
          <span className="font-mono text-amber-400 font-bold shrink-0 hidden sm:inline">★ 10 Estrellas · 14 Títulos</span>
        </div>
      </div>
    </section>
  );
};
