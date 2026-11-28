import React from 'react';
import { MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
  onOpenDevPanel?: () => void;
}

const FOOTER_LINKS = [
  { id: 'titulos', label: 'Títulos y Palmarés (12★)' },
  { id: 'historia', label: 'Historia Centenaria (1924–2026)' },
  { id: 'tablas-historicas', label: 'Tablas Históricas' },
  { id: 'resultados-vs-equipos', label: 'Clásicos y Rivales' },
  { id: 'goleadores-historicos', label: 'Goleadores Históricos' },
  { id: 'uniformes', label: 'Camisetas e Insignias' },
  { id: 'actualidad', label: 'Actualidad 2026' },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#081D40] text-slate-300 border-t-[3px] border-[#D62027]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Columna 1: Identidad Institucional */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/image_82370351.png"
                alt="Escudo Oficial Junior de Barranquilla"
                className="w-11 h-11 object-contain shrink-0"
              />
              <div>
                <span className="font-display text-2xl font-black uppercase text-white tracking-tight block leading-none">
                  Junior de Barranquilla
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400 block mt-1">
                  Club Deportivo Popular · 1924
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Fundado el 7 de agosto de 1924 por Doña Micaela Lavalle de Mejía en el histórico barrio San Roque de Barranquilla. Archivo editorial y memoria histórica de la hinchada rojiblanca.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#D62027] shrink-0" />
              <span>Estadio Metropolitano Roberto Meléndez · Barranquilla, Atlántico</span>
            </div>
          </div>

          {/* Columna 2: Secciones del Club */}
          <div className="md:col-span-4">
            <span className="font-display text-sm font-bold uppercase text-white tracking-[0.16em] block mb-4">
              Secciones
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(link.id)}
                    className="text-slate-300 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Cultura Currambera y Estrellas */}
          <div className="md:col-span-3 space-y-4">
            <span className="font-display text-sm font-bold uppercase text-white tracking-[0.16em] block">
              Orgullo Caribe
            </span>
            <p className="font-editorial italic text-sm text-slate-300 leading-relaxed">
              «Junior no es solo un equipo; es el latido, la música y la alegría del Carnaval de Barranquilla y de toda la Costa Norte colombiana.»
            </p>
            <div
              aria-label="Doce estrellas de liga colombiana"
              className="text-[#FDE047] text-sm tracking-[0.2em]"
            >
              {'★'.repeat(12)}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © 1924 – 2026 Junior de Barranquilla · Enciclopedia Histórica Rojiblanca.
          </div>
          <div>Curramba la Bella · 12 Estrellas · 16 Títulos Oficiales Dimayor</div>
        </div>
      </div>
    </footer>
  );
};
