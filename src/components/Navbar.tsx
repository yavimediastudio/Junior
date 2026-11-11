import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, X, LayoutGrid, Home, Clock, Sun, Moon } from 'lucide-react';
import { playStadiumAudio } from '../utils/footballLogic';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  audioEnabled,
  onToggleAudio,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'tablas-historicas', label: 'Tablas de Posiciones' },
    { id: 'resultados-vs-equipos', label: 'Resultados vs Equipos' },
    { id: 'goleadores-historicos', label: 'Goleadores Históricos' },
    { id: 'uniformes', label: 'Uniformes' },
    { id: 'titulos', label: 'Títulos' },
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
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Brand Wordmark & Shield */}
          <button
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-2.5 text-left focus:outline-none group whitespace-nowrap shrink-0"
            title="Ir al Portal Principal de Ventanas"
          >
            {/* Junior Official Shield Logo */}
            <img
              src="/assets/aistudio/image_82370351.png"
              alt="Escudo Oficial Junior de Barranquilla"
              className="w-10 h-10 object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow"
            />
            <div>
              <span className="font-display text-lg sm:text-xl font-black tracking-wide text-white group-hover:text-red-500 transition-colors uppercase block leading-none">
                Junior de Barranquilla
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block mt-0.5">
                {isHome ? 'Portal de Ventanas' : 'Enciclopedia Oficial'}
              </span>
            </div>
          </button>

          {/* Clean 6-Window Navigation Links */}
          <nav className="hidden xl:flex items-center gap-3 text-xs font-medium text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1.5 px-2.5 rounded-md border-b-2 ${
                  activeSection === item.id
                    ? 'text-white border-red-500 bg-red-950/40 font-bold'
                    : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action + Utility Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Home Portal Button if inside a window */}
            {!isHome ? (
              <button
                onClick={() => handleNavClick('inicio')}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                title="Volver a la vista principal de las 6 ventanas"
              >
                <Home className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Portal Principal</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const el = document.getElementById('linea-tiempo');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hidden lg:flex px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/80 rounded-lg transition-colors items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Línea de Tiempo</span>
                </button>

                <button
                  onClick={() => handleNavClick('titulos')}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>10★ Títulos</span>
                </button>
              </div>
            )}

            {/* Theme Toggle (Claro / Oscuro) */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 hover:text-indigo-300" />
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={onToggleAudio}
              title={audioEnabled ? 'Efectos sonoros activados' : 'Activar efectos sonoros'}
              aria-label={audioEnabled ? 'Silenciar efectos sonoros' : 'Activar efectos sonoros'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 text-red-500" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de ventanas"
              className="xl:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tema de visualización
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => handleNavClick('inicio')}
            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
              isHome ? 'bg-red-950/60 text-red-400 font-bold' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            🏠 Portal Principal (Inicio)
          </button>
          <div className="h-px bg-slate-800 my-1" />
          {navItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activeSection === item.id
                  ? 'bg-red-950/60 text-red-400 font-bold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              Ventana 0{idx + 1}: {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
