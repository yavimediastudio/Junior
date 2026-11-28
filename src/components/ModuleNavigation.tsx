import React from 'react';
import {
  Table,
  Swords,
  Target,
  Shirt,
  Trophy,
  Activity,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { AppModuleId } from '../types/football';
import { ShareButton } from './ShareButton';

export interface ModuleItemConfig {
  id: AppModuleId;
  number: string;
  label: string;
  shortLabel: string;
  badge: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  statValue: string;
  statLabel: string;
  accentColor: string;
  borderHover: string;
}

export const MODULE_ITEMS: ModuleItemConfig[] = [
  {
    id: 'titulos',
    number: '01',
    label: 'Títulos y Palmarés',
    shortLabel: 'Títulos',
    badge: '16 Campeonatos Dimayor',
    tagline: 'Sala de Trofeos y Archivo Fotográfico',
    icon: Trophy,
    description:
      'Las 12 Estrellas de Liga, 2 Copas Colombia y 2 Superligas con fotografías históricas, finales y planteles campeones.',
    statValue: '16 Títulos',
    statLabel: '12 Ligas · 2 Copas · 2 Superligas',
    accentColor: 'from-amber-50 to-white',
    borderHover: 'hover:border-[#D62027]/40',
  },
  {
    id: 'historia',
    number: '02',
    label: 'Historia Centenaria',
    shortLabel: 'Historia',
    badge: '1924 – 2026',
    tagline: 'Crónica, Símbolos, Sedes y Cultura',
    icon: BookOpen,
    description:
      'Más de un siglo de historia rojiblanca en 23 capítulos: desde San Roque en 1924 hasta el bicampeonato reciente.',
    statValue: '102 Años',
    statLabel: '23 Capítulos Documentados',
    accentColor: 'from-red-50 to-white',
    borderHover: 'hover:border-[#D62027]/40',
  },
  {
    id: 'tablas-historicas',
    number: '03',
    label: 'Tablas Históricas',
    shortLabel: 'Tablas',
    badge: '1948 – 2026',
    tagline: 'Posiciones, Cuadrangulares y Play-offs',
    icon: Table,
    description:
      'Archivo oficial año por año de la era profesional colombiana: fase regular, cuadrangulares, hexagonales y llaves finales.',
    statValue: '91 Tablas',
    statLabel: 'Torneos Oficiales 1948–2026',
    accentColor: 'from-slate-50 to-white',
    borderHover: 'hover:border-[#081D40]/40',
  },
  {
    id: 'resultados-vs-equipos',
    number: '04',
    label: 'Clásicos y Rivales',
    shortLabel: 'Clásicos',
    badge: '1948 – 2026',
    tagline: 'Historial Frente a Frente',
    icon: Swords,
    description:
      'Balance verificado contra 40 franquicias de Primera A, evolución de escudos y registro de enfrentamientos históricos.',
    statValue: '40 Rivales',
    statLabel: 'Historial Verificado FPC',
    accentColor: 'from-slate-50 to-white',
    borderHover: 'hover:border-[#081D40]/40',
  },
  {
    id: 'goleadores-historicos',
    number: '05',
    label: 'Goleadores Históricos',
    shortLabel: 'Goleadores',
    badge: 'Top 50 · 15 Botines',
    tagline: 'Cañoneros Legendarios',
    icon: Target,
    description:
      'Los 50 máximos artilleros de Junior (Valenciano 166, Bacca 135, Teófilo 107) con desglose por torneo y botines de oro.',
    statValue: 'Top 50',
    statLabel: 'Valenciano #1 · 166 Goles',
    accentColor: 'from-rose-50 to-white',
    borderHover: 'hover:border-[#D62027]/40',
  },
  {
    id: 'uniformes',
    number: '06',
    label: 'Camisetas e Insignias',
    shortLabel: 'Camisetas',
    badge: '1924 – 2026',
    tagline: 'Museo de Indumentaria y Escudos',
    icon: Shirt,
    description:
      'Evolución de los escudos institucionales, camisetas icónicas del centenario y dorsal personalizado con las 12 estrellas.',
    statValue: '5 Escudos',
    statLabel: 'Colección 1924–2026',
    accentColor: 'from-sky-50 to-white',
    borderHover: 'hover:border-[#081D40]/40',
  },
  {
    id: 'actualidad',
    number: '07',
    label: 'Actualidad 2026',
    shortLabel: 'Actualidad',
    badge: 'Temporada 2026',
    tagline: 'Plantilla y Liga BetPlay',
    icon: Activity,
    description:
      'Nómina oficial 2026-II, cuerpo técnico, repaso del bicampeonato ★11–★12 y tabla de la temporada en curso.',
    statValue: '★ 12',
    statLabel: 'Temporada Oficial 2026',
    accentColor: 'from-emerald-50 to-white',
    borderHover: 'hover:border-[#081D40]/40',
  },
];

interface WindowHeaderProps {
  activeModule: AppModuleId;
  onSelectModule?: (moduleId: AppModuleId) => void;
  onBackToHome: () => void;
}

/**
 * Cabecera editorial no fija con migas de pan limpias (reemplaza la antigua barra apilada de ventanas).
 */
export const WindowHeader: React.FC<WindowHeaderProps> = ({
  activeModule,
  onBackToHome,
}) => {
  const currentConfig = MODULE_ITEMS.find((m) => m.id === activeModule) || MODULE_ITEMS[0];

  return (
    <div className="bg-[#F7F5F0] border-b border-[#E5E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Migas de pan web limpias */}
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={onBackToHome}
              className="text-[#526075] hover:text-[#D62027] font-medium transition-colors"
            >
              Inicio
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
            <span className="font-semibold text-[#081D40]">{currentConfig.label}</span>
            <span className="hidden md:inline text-[#CBD5E1]" aria-hidden="true">·</span>
            <span className="hidden md:inline text-xs text-[#64748B]">{currentConfig.badge}</span>
          </nav>

          {/* Acción discreta para compartir enlace directo */}
          <ShareButton
            sectionTitle={currentConfig.label}
            moduleId={activeModule}
            buttonText="Compartir"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};
