import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Table,
  Swords,
  Target,
  Shirt,
  Trophy,
  Activity,
  ArrowLeft,
  Search,
  X,
  Sparkles,
  ChevronRight,
  User,
  Layers,
  Flame,
  History,
  Trash2,
  Clock,
} from 'lucide-react';
import { AppModuleId } from '../types/football';
import { ShareButton } from './ShareButton';
import {
  EncyclopediaSearchItem,
  searchEncyclopedia,
  ENCYCLOPEDIA_SEARCH_ITEMS,
} from '../data/encyclopediaSearchIndex';

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
    id: 'tablas-historicas',
    number: '01',
    label: 'Tablas de Posiciones & Históricas',
    shortLabel: 'Tablas de Posiciones',
    badge: '1948 - 2024',
    tagline: 'Cuadrangulares, Hexagonales & Año a Año',
    icon: Table,
    description: 'Tablas de posiciones completas de torneos y fases finales: Cuadrangulares, Hexagonales, Octogonales, Play-offs y archivo año por año (1948-2024).',
    statValue: '16 Tablas',
    statLabel: 'Fases Finales Oficiales',
    accentColor: 'from-red-600/20 to-slate-900',
    borderHover: 'hover:border-red-500/50',
  },
  {
    id: 'resultados-vs-equipos',
    number: '02',
    label: 'Resultados vs Equipos',
    shortLabel: 'vs Equipos',
    badge: 'Cara a Cara',
    tagline: 'Historial vs 10 Rivales',
    icon: Swords,
    description: 'Balance oficial contra Nacional, América, Millonarios, Santa Fe, Medellín, Unión y más.',
    statValue: '10 Clásicos',
    statLabel: 'Finales & Goleadas',
    accentColor: 'from-amber-600/20 to-slate-900',
    borderHover: 'hover:border-amber-500/50',
  },
  {
    id: 'goleadores-historicos',
    number: '03',
    label: 'Goleadores Históricos',
    shortLabel: 'Goleadores',
    badge: '8 Botines de Oro',
    tagline: 'Cañoneros Rojiblancos',
    icon: Target,
    description: 'Valenciano (166), Bacca (125+), Teo (94) y el archivo de los 8 botines de oro de la liga.',
    statValue: '166 Goles',
    statLabel: 'Iván René Valenciano #1',
    accentColor: 'from-rose-600/20 to-slate-900',
    borderHover: 'hover:border-rose-500/50',
  },
  {
    id: 'uniformes',
    number: '04',
    label: 'Uniformes',
    shortLabel: 'Uniformes',
    badge: '1924 - 2024',
    tagline: 'Museo & Personalizador',
    icon: Shirt,
    description: 'Evolución de las camisetas centenarias y personalizador interactivo en tiempo real con 10 estrellas.',
    statValue: '10 Estrellas',
    statLabel: 'Personaliza tu Dorsal',
    accentColor: 'from-sky-600/20 to-slate-900',
    borderHover: 'hover:border-sky-500/50',
  },
  {
    id: 'titulos',
    number: '05',
    label: 'Títulos',
    shortLabel: 'Títulos',
    badge: '14 Campeonatos Dimayor',
    tagline: 'Vitrina de Campeones',
    icon: Trophy,
    description: 'Las 10 Estrellas de Liga detalladas, 2 Copas Colombia, 2 Superligas y normativa Dimayor.',
    statValue: '14 Títulos',
    statLabel: '10 Ligas + 4 Copas',
    accentColor: 'from-amber-500/20 to-slate-900',
    borderHover: 'hover:border-amber-400/50',
  },
  {
    id: 'actualidad',
    number: '06',
    label: 'Actualidad',
    shortLabel: 'Actualidad',
    badge: 'Plantilla Oficial',
    tagline: 'Plantilla & Liga BetPlay',
    icon: Activity,
    description: 'Nómina oficial de Los Tiburones, cuerpo técnico, fixture y tabla de posiciones de la Liga BetPlay.',
    statValue: '10 Estrellas',
    statLabel: 'Liga BetPlay Dimayor',
    accentColor: 'from-emerald-600/20 to-slate-900',
    borderHover: 'hover:border-emerald-500/50',
  },
];

interface WindowHeaderProps {
  activeModule: AppModuleId;
  onSelectModule: (moduleId: AppModuleId) => void;
  onBackToHome: () => void;
}

const QUICK_SUGGESTIONS = [
  'Carlos Bacca',
  'Iván René Valenciano',
  'Teófilo Gutiérrez',
  'Heleno de Freitas (1950)',
  '1948 Subcampeón',
  '10ª Estrella 2023',
  'Cuadrangulares',
  'vs Nacional',
  'Uniformes',
];

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  activeModule,
  onSelectModule,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Historial de las últimas 5 búsquedas almacenado en localStorage
  const SEARCH_HISTORY_KEY = 'junior_search_history_v1';
  const MAX_HISTORY_ITEMS = 5;

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
            .slice(0, MAX_HISTORY_ITEMS);
        }
      }
    } catch (e) {
      console.warn('Error al cargar historial de búsqueda desde localStorage:', e);
    }
    return [];
  });

  const saveToSearchHistory = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm || cleanTerm.length < 2) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error al guardar historial en localStorage:', e);
      }
      return updated;
    });
  };

  const removeSearchHistoryItem = (termToRemove: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== termToRemove.toLowerCase());
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error al eliminar término del historial:', e);
      }
      return updated;
    });
  };

  const clearSearchHistory = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {
      console.warn('Error al limpiar historial de búsqueda:', e);
    }
    setSearchHistory([]);
  };

  const handleSelectHistoryItem = (term: string) => {
    setSearchQuery(term);
    saveToSearchHistory(term);
    setIsSearchOpen(true);
    searchInputRef.current?.focus();
  };

  const currentConfig = MODULE_ITEMS.find((m) => m.id === activeModule) || MODULE_ITEMS[0];
  const CurrentIcon = currentConfig.icon;

  const searchResults = useMemo(() => {
    return searchEncyclopedia(searchQuery);
  }, [searchQuery]);

  // Manejo de atajo de teclado: Ctrl+K, Cmd+K o "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset del índice seleccionado al cambiar la consulta
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleSelectItem = (item: EncyclopediaSearchItem) => {
    if (searchQuery.trim()) {
      saveToSearchHistory(searchQuery.trim());
    } else {
      saveToSearchHistory(item.title);
    }

    if (item.standingsTableId) {
      window.dispatchEvent(
        new CustomEvent('junior-select-standings-table', {
          detail: { tableId: item.standingsTableId },
        })
      );
    }
    onSelectModule(item.moduleId);
    setSearchQuery('');
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleSelectItem(searchResults[selectedIndex]);
      } else if (searchResults.length > 0) {
        handleSelectItem(searchResults[0]);
      } else if (searchQuery.trim()) {
        saveToSearchHistory(searchQuery.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <div className="sticky top-16 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col gap-2.5">
          {/* Fila Principal: Navegación + Buscador + Switcher */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
            {/* Izquierda: Volver al Portal + Breadcrumb del módulo activo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={onBackToHome}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shrink-0 group shadow-sm"
                title="Volver al Portal Central de Ventanas"
              >
                <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Portal Principal</span>
                <span className="sm:hidden">Inicio</span>
              </button>

              <div className="h-4 w-px bg-slate-800 hidden sm:block" />

              {/* Indicador de la ventana actual con escudo oficial */}
              <div className="flex items-center gap-1.5">
                <img
                  src="/assets/aistudio/image_82370351.png"
                  alt="Escudo Oficial Junior"
                  className="w-5 h-5 object-contain shrink-0 drop-shadow"
                />
                <span className="font-mono text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded">
                  V{currentConfig.number}
                </span>
                <CurrentIcon className="w-4 h-4 text-white shrink-0 hidden md:block" />
                <span className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wide truncate max-w-[130px] sm:max-w-[200px]">
                  {currentConfig.shortLabel}
                </span>
              </div>
            </div>

            {/* Centro: CAMPO DE BÚSQUEDA RÁPIDA (Filtro por Sección, Módulo o Jugador) */}
            <div ref={searchContainerRef} className="relative flex-1 min-w-[260px] max-w-xl">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-red-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleKeyDownInput}
                  placeholder="Buscar sección o jugador (ej. Valenciano, Bacca, 1950, Títulos)..."
                  className="w-full pl-9 pr-16 py-1.5 bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500/40 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />

                <div className="absolute right-2.5 flex items-center gap-1">
                  {searchQuery ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden lg:inline-flex items-center text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>

              {/* DROPDOWN DE RESULTADOS */}
              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                  {/* Encabezado del Dropdown */}
                  <div className="px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {searchQuery.trim()
                        ? `${searchResults.length} resultado${searchResults.length === 1 ? '' : 's'} para "${searchQuery}"`
                        : 'Enciclopedia Oficial de Los Tiburones'}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      [↑↓] Navegar • [Enter] Seleccionar • [Esc] Cerrar
                    </span>
                  </div>

                  {/* Barra rápida de historial reciente cuando se está escribiendo */}
                  {searchQuery.trim() !== '' && searchHistory.length > 0 && (
                    <div className="px-3 py-1.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                        <History className="w-3 h-3 text-red-400" />
                        Historial:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {searchHistory.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleSelectHistoryItem(item)}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 hover:border-red-500/40 transition-colors shrink-0"
                            title={`Buscar rápidamente "${item}"`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resultados o Sugerencias Rápidas */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                    {searchQuery.trim() === '' ? (
                      /* Estado vacío: Historial de búsquedas recientes + Sugerencias de acceso rápido */
                      <div className="divide-y divide-slate-800/70">
                        {/* SECCIÓN 1: HISTORIAL DE LAS ÚLTIMAS 5 BÚSQUEDAS (LOCALSTORAGE) */}
                        {searchHistory.length > 0 && (
                          <div className="p-3 bg-slate-950/40">
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                <History className="w-3.5 h-3.5 text-red-400" />
                                Historial Reciente ({searchHistory.length}/5):
                              </span>
                              <button
                                type="button"
                                onClick={clearSearchHistory}
                                className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-red-950/40"
                                title="Borrar todo el historial de búsquedas"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Borrar historial</span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {searchHistory.map((item) => (
                                <div
                                  key={item}
                                  onClick={() => handleSelectHistoryItem(item)}
                                  className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-200 hover:text-white border border-slate-700 hover:border-red-500/50 cursor-pointer transition-all shadow-sm"
                                  title={`Hacer clic para buscar "${item}"`}
                                >
                                  <Clock className="w-3 h-3 text-red-400 shrink-0" />
                                  <span className="font-medium max-w-[150px] truncate">{item}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => removeSearchHistoryItem(item, e)}
                                    className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors ml-0.5"
                                    title={`Eliminar "${item}" del historial`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SECCIÓN 2: BÚSQUEDAS POPULARES EN LA ENCICLOPEDIA */}
                        <div className="p-3">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Búsquedas populares en la enciclopedia:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {QUICK_SUGGESTIONS.map((sug) => (
                              <button
                                key={sug}
                                onClick={() => {
                                  setSearchQuery(sug);
                                  saveToSearchHistory(sug);
                                  searchInputRef.current?.focus();
                                }}
                                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 hover:border-red-500/40 transition-colors flex items-center gap-1"
                              >
                                <Search className="w-3 h-3 text-red-400" />
                                <span>{sug}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      /* Sin resultados */
                      <div className="p-5 text-center">
                        <p className="text-xs text-slate-300 font-medium">
                          No se encontraron coincidencias para "{searchQuery}"
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Prueba con nombres como <strong className="text-slate-300">Valenciano, Bacca, Teo, Heleno de Freitas, Verón, 1948, 1950, Cuadrangulares o Uniformes</strong>.
                        </p>
                      </div>
                    ) : (
                      /* Lista de coincidencias */
                      searchResults.map((item, idx) => {
                        const isSelected = idx === selectedIndex;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`px-3 py-2.5 rounded-lg cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-red-950/40 border border-red-500/40'
                                : 'hover:bg-slate-800/60 border border-transparent'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${item.categoryBadgeClass}`}
                                >
                                  {item.categoryLabel}
                                </span>
                                <h4 className="text-xs font-bold text-white truncate">
                                  {item.title}
                                </h4>
                                {item.badge && (
                                  <span className="text-[10px] text-amber-400 font-mono hidden sm:inline">
                                    ★ {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">
                                {item.subtitle}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center gap-1.5 self-center">
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 group-hover:border-slate-600">
                                V{item.moduleNumber}
                              </span>
                              <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-red-400 translate-x-0.5' : 'text-slate-400'} transition-transform`} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Derecha: Pestañas de acceso directo a las 6 ventanas */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 lg:pb-0 scrollbar-none shrink-0">
              {MODULE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 border ${
                      isActive
                        ? 'bg-red-600 text-white border-red-500 font-bold shadow-md shadow-red-950/50'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                    title={item.description}
                  >
                    <span className="font-mono text-[10px] opacity-75">{item.number}</span>
                    <Icon className="w-3 h-3 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-display uppercase tracking-wide">
                      {item.shortLabel}
                    </span>
                  </button>
                );
              })}

              <div className="h-5 w-px bg-slate-800 mx-0.5 hidden sm:block" />

              {/* Botón de Compartir Módulo Actual */}
              <ShareButton
                sectionTitle={`Módulo ${currentConfig.number}: ${currentConfig.label}`}
                moduleId={activeModule}
                buttonText="Compartir"
                size="sm"
                className="shrink-0 font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
