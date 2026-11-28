import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ChevronRight,
  History,
  Clock,
  Trash2,
} from 'lucide-react';
import { AppModuleId } from '../types/football';
import {
  EncyclopediaSearchItem,
  searchEncyclopedia,
} from '../data/encyclopediaSearchIndex';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: AppModuleId) => void;
}

const SEARCH_HISTORY_KEY = 'junior_search_history_v1';
const MAX_HISTORY_ITEMS = 5;

const POPULAR_SUGGESTIONS = [
  '12ª Estrella 2026',
  'Historia 1924-2026',
  'Iván René Valenciano',
  'Carlos Bacca',
  'Teófilo Gutiérrez',
  'Alfredo Arias',
  'Sebastián Viera',
  'Insignias 1924-2026',
  'Finalización 2026-II',
];

const MODULE_SECTION_LABELS: Record<AppModuleId, string> = {
  'tablas-historicas': 'Tablas',
  'resultados-vs-equipos': 'Clásicos',
  'goleadores-historicos': 'Goleadores',
  uniformes: 'Camisetas',
  titulos: 'Títulos',
  actualidad: 'Actualidad',
  historia: 'Historia',
};

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const searchResults = useMemo(() => searchEncyclopedia(searchQuery), [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const saveToSearchHistory = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm || cleanTerm.length < 2) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const removeSearchHistoryItem = (termToRemove: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== termToRemove.toLowerCase());
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearSearchHistory = () => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // ignore
    }
    setSearchHistory([]);
  };

  const handleSelectItem = (item: EncyclopediaSearchItem) => {
    saveToSearchHistory(searchQuery.trim() || item.title);

    if (item.standingsTableId) {
      sessionStorage.setItem('junior-pending-standings-table', item.standingsTableId);
      window.dispatchEvent(
        new CustomEvent('junior-select-standings-table', {
          detail: { tableId: item.standingsTableId },
        })
      );
    }
    if (item.rivalFranchiseId) {
      sessionStorage.setItem('junior-pending-rival-franchise', item.rivalFranchiseId);
      window.dispatchEvent(
        new CustomEvent('junior-select-rival-franchise', {
          detail: { franchiseId: item.rivalFranchiseId },
        })
      );
    }
    if (item.historyTab || item.historyChapterId) {
      if (item.historyTab) {
        sessionStorage.setItem('junior-pending-history-tab', item.historyTab);
      }
      if (item.historyChapterId) {
        sessionStorage.setItem('junior-pending-history-chapter', item.historyChapterId);
      }
      window.dispatchEvent(
        new CustomEvent('junior-select-history-section', {
          detail: { tab: item.historyTab, chapterId: item.historyChapterId },
        })
      );
    }
    if (item.topScorerId) {
      sessionStorage.setItem('junior-pending-top-scorer', item.topScorerId);
      window.dispatchEvent(
        new CustomEvent('junior-select-top-scorer', {
          detail: { scorerId: item.topScorerId },
        })
      );
    }

    onSelectModule(item.moduleId);
    setSearchQuery('');
    onClose();
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
      if (searchResults.length > 0) {
        handleSelectItem(searchResults[selectedIndex] || searchResults[0]);
      } else if (searchQuery.trim()) {
        saveToSearchHistory(searchQuery.trim());
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscador del archivo histórico de Junior de Barranquilla"
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#081D40]/45 backdrop-blur-sm px-4 pt-16 sm:pt-24 pb-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-[#E5E1D8] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E1D8]">
          <Search className="w-5 h-5 text-[#D62027] shrink-0" aria-hidden="true" />
          <label htmlFor="editorial-global-search" className="sr-only">
            Buscar en el archivo de Junior de Barranquilla
          </label>
          <input
            id="editorial-global-search"
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
            placeholder="Buscar títulos, goleadores, rivales, temporadas o historia..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#0E172A] placeholder-[#64748B] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              className="p-1.5 rounded-lg text-[#526075] hover:text-[#081D40] hover:bg-[#F7F5F0] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador"
            className="px-2.5 py-1 rounded-md text-xs font-medium text-[#526075] hover:text-[#081D40] bg-[#F7F5F0] hover:bg-[#ECE8DF] border border-[#E5E1D8] transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Status Meta Strip */}
        <div className="px-5 py-2 bg-[#F7F5F0] border-b border-[#E5E1D8] flex items-center justify-between text-xs text-[#526075]">
          <span>
            {searchQuery.trim()
              ? `${searchResults.length} resultado${searchResults.length === 1 ? '' : 's'} para «${searchQuery}»`
              : 'Archivo Oficial · Junior de Barranquilla (1924 – 2026)'}
          </span>
          <span className="hidden sm:inline text-[11px] text-[#64748B]">
            Usa las flechas y Enter para abrir
          </span>
        </div>

        {/* Results / Empty Suggestions Body */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#EFECE4]">
          {searchQuery.trim() === '' ? (
            <div className="p-5 space-y-5">
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#526075]">
                      <History className="w-3.5 h-3.5 text-[#D62027]" />
                      Búsquedas recientes
                    </span>
                    <button
                      type="button"
                      onClick={clearSearchHistory}
                      className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#D62027] transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Borrar</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term) => (
                      <div
                        key={term}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F5F0] border border-[#E5E1D8] text-xs text-[#0E172A]"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1.5 hover:text-[#D62027] transition-colors font-medium"
                        >
                          <Clock className="w-3 h-3 text-[#D62027]" />
                          <span className="max-w-[160px] truncate">{term}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => removeSearchHistoryItem(term, e)}
                          aria-label={`Eliminar "${term}" del historial`}
                          className="p-0.5 text-[#64748B] hover:text-[#081D40] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#526075] mb-2.5">
                  Temas destacados
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setSearchQuery(sug);
                        saveToSearchHistory(sug);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F5F0] text-xs font-medium text-[#0E172A] hover:text-[#D62027] border border-[#E5E1D8] hover:border-[#D62027]/40 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-[#081D40]">
                No encontramos coincidencias para «{searchQuery}»
              </p>
              <p className="text-xs text-[#526075] mt-1.5">
                Prueba buscando por jugador, rival o año: Valenciano, Bacca, Teo, Verón, 1977, 2026 o Nacional.
              </p>
            </div>
          ) : (
            <ul className="p-2 space-y-1">
              {searchResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl transition-colors flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-[#FEF2F2] border border-[#FECACA]'
                          : 'bg-white hover:bg-[#F7F5F0] border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D62027]">
                            {item.categoryLabel}
                          </span>
                          <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
                          <span className="text-sm font-bold text-[#081D40] truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-xs font-semibold text-[#9A6700]">
                              ★ {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#526075] line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-[#526075]">
                        <span>{MODULE_SECTION_LABELS[item.moduleId]}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-[#D62027] translate-x-0.5' : 'text-[#94A3B8]'
                          }`}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
