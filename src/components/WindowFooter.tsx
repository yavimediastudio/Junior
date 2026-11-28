import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
  const prevModule =
    currentIndex > 0 ? MODULE_ITEMS[currentIndex - 1] : MODULE_ITEMS[MODULE_ITEMS.length - 1];
  const nextModule =
    currentIndex < MODULE_ITEMS.length - 1 ? MODULE_ITEMS[currentIndex + 1] : MODULE_ITEMS[0];

  return (
    <section
      aria-label="Continuar leyendo otras secciones"
      className="bg-[#F7F5F0] border-t border-[#E5E1D8] py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          {/* Sección anterior */}
          <button
            type="button"
            onClick={() => onSelectModule(prevModule.id)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-[#FFFFFF] border border-[#E5E1D8] hover:border-[#081D40]/30 text-left transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-[#D62027] shrink-0 group-hover:-translate-x-1 transition-transform" />
            <div className="min-w-0">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748B] block">
                Sección anterior
              </span>
              <span className="font-display text-lg font-bold uppercase text-[#081D40] group-hover:text-[#D62027] transition-colors truncate block leading-tight">
                {prevModule.label}
              </span>
            </div>
          </button>

          {/* Volver a portada */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onBackToHome}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#081D40] hover:text-[#D62027] border-b border-transparent hover:border-[#D62027] transition-colors"
            >
              Volver a la portada
            </button>
          </div>

          {/* Siguiente sección */}
          <button
            type="button"
            onClick={() => onSelectModule(nextModule.id)}
            className="flex items-center justify-end gap-3 px-4 py-3 rounded-xl bg-white hover:bg-[#FFFFFF] border border-[#E5E1D8] hover:border-[#081D40]/30 text-right transition-all group"
          >
            <div className="min-w-0">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748B] block">
                Siguiente sección
              </span>
              <span className="font-display text-lg font-bold uppercase text-[#081D40] group-hover:text-[#D62027] transition-colors truncate block leading-tight">
                {nextModule.label}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D62027] shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
