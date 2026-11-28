import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { playStadiumAudio } from '../utils/footballLogic';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenSearch: () => void;
  audioEnabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenSearch,
  audioEnabled = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'titulos', label: 'Títulos' },
    { id: 'historia', label: 'Historia' },
    { id: 'tablas-historicas', label: 'Tablas' },
    { id: 'resultados-vs-equipos', label: 'Clásicos' },
    { id: 'goleadores-historicos', label: 'Goleadores' },
    { id: 'uniformes', label: 'Camisetas' },
    { id: 'actualidad', label: 'Actualidad' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    if (audioEnabled) {
      playStadiumAudio('drum');
    }
  };

  const isHome = activeSection === 'inicio';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E1D8]">
      {/* Firma Rojiblanca superior del club */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#D62027] via-[#D62027] to-[#081D40]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-[68px]">
          {/* Marca del club (Escudo + Nombre limpio) */}
          <button
            type="button"
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
            aria-label="Ir a la portada de Junior de Barranquilla"
          >
            <img
              src="/assets/aistudio/image_82370351.png"
              alt="Escudo Oficial Junior de Barranquilla"
              className="w-10 h-10 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#081D40] group-hover:text-[#D62027] transition-colors uppercase leading-none">
              Junior de Barranquilla
            </span>
          </button>

          {/* Navegación editorial de una sola fila */}
          <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-sm tracking-tight transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#081D40] font-bold'
                      : 'text-[#526075] font-medium hover:text-[#081D40]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-3.5 right-3.5 -bottom-[17px] h-[2.5px] bg-[#D62027]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Lupa discreta + menú móvil */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Buscar en el archivo del club"
              title="Buscar"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#081D40] hover:text-[#D62027] hover:bg-[#F7F5F0] transition-colors"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#081D40] hover:bg-[#F7F5F0] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable móvil limpio */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5E1D8] shadow-lg">
          <nav aria-label="Navegación móvil" className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('inicio')}
              className={`block w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                isHome
                  ? 'bg-[#FEF2F2] text-[#D62027] font-bold'
                  : 'text-[#0E172A] font-medium hover:bg-[#F7F5F0]'
              }`}
            >
              Inicio
            </button>
            <div className="h-px bg-[#EFECE4] my-1.5" />
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#FEF2F2] text-[#D62027] font-bold'
                      : 'text-[#0E172A] font-medium hover:bg-[#F7F5F0]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 mt-2 border-t border-[#EFECE4]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-[#F7F5F0] text-sm font-medium text-[#081D40] hover:text-[#D62027] transition-colors"
              >
                <Search className="w-4 h-4 text-[#D62027]" />
                <span>Buscar en el archivo histórico</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
