import React from 'react';
import { Heart, MapPin, Trophy, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Club Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/image_82370351.png"
                alt="Escudo Oficial Junior de Barranquilla"
                className="w-9 h-9 object-contain shrink-0 drop-shadow"
              />
              <span className="font-display text-xl font-black uppercase text-white tracking-wide">
                Junior de Barranquilla
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Club Deportivo Popular Junior F.C. S.A. Fundado el 7 de agosto de 1924 por Doña Micaela Lavalle de Meza en el histórico barrio San Roque de Barranquilla.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-xs pt-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Estadio Metropolitano Roberto Meléndez · Barranquilla, Atlántico</span>
            </div>
          </div>

          {/* Col 2: Secciones Rápidas */}
          <div>
            <span className="font-display text-sm font-bold uppercase text-white tracking-wider block mb-3">
              Los 6 Módulos Oficiales
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('tablas-historicas')}
                  className="hover:text-white transition-colors"
                >
                  Módulo 1: Tablas Históricas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('resultados-vs-equipos')}
                  className="hover:text-white transition-colors"
                >
                  Módulo 2: Resultados vs Equipos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('goleadores-historicos')}
                  className="hover:text-white transition-colors"
                >
                  Módulo 3: Goleadores Históricos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('uniformes')}
                  className="hover:text-white transition-colors"
                >
                  Módulo 4: Uniformes & Museo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('titulos')}
                  className="hover:text-white transition-colors"
                >
                  Módulo 5: Títulos (10★ & 14 Títulos Oficiales)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('actualidad')}
                  className="hover:text-white transition-colors"
                >
                  Módulo 6: Actualidad & Plantilla Oficial
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Orgullo Caribe */}
          <div>
            <span className="font-display text-sm font-bold uppercase text-white tracking-wider block mb-3">
              Cultura Currambera
            </span>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              &quot;Junior no es solo un equipo; es el latido, la música y la alegría del Carnaval de Barranquilla y de toda la Costa Norte colombiana.&quot;
            </p>
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              {'★ '.repeat(10)}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 1924 - 2026 Junior de Barranquilla. Tributo interactivo para toda la hinchada rojiblanca.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Hecho con orgullo y pasión por Curramba la Bella</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
