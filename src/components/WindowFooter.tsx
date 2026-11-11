import React from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { MODULE_ITEMS } from './ModuleNavigation';
import { AppModuleId } from '../types/football';

interface WindowFooterProps {
  currentModule: AppModuleId;
  onSelectModule: (moduleId: AppModuleId) => void;
  onBackToHome: () => void;
}

export const WindowFooter: React.FC<WindowFooterProps> = ({
  currentModule,
  onSelectModule,
  onBackToHome,
}) => {
  const currentIndex = MODULE_ITEMS.findIndex((m) => m.id === currentModule);
  const prevModule = currentIndex > 0 ? MODULE_ITEMS[currentIndex - 1] : MODULE_ITEMS[MODULE_ITEMS.length - 1];
  const nextModule = currentIndex < MODULE_ITEMS.length - 1 ? MODULE_ITEMS[currentIndex + 1] : MODULE_ITEMS[0];

  return (
    <div className="bg-slate-950 border-t border-slate-800/80 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous window button */}
          <button
            onClick={() => onSelectModule(prevModule.id)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase block leading-none">Anterior</span>
              <span className="font-display uppercase">{prevModule.label}</span>
            </div>
          </button>

          {/* Return to Home portal button */}
          <button
            onClick={onBackToHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-xs font-bold text-red-300 hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4 text-red-400" />
            <span>Volver al Portal Principal</span>
          </button>

          {/* Next window button */}
          <button
            onClick={() => onSelectModule(nextModule.id)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors group"
          >
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block leading-none">Siguiente</span>
              <span className="font-display uppercase">{nextModule.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
