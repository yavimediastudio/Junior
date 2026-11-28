/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HeroSection } from './components/HeroSection';
import { HomeWindowsGrid } from './components/HomeWindowsGrid';
import { WindowHeader } from './components/ModuleNavigation';
import { WindowFooter } from './components/WindowFooter';
import { HistoricTablesModule } from './components/modules/HistoricTablesModule';
import { HeadToHeadModule } from './components/modules/HeadToHeadModule';
import { TopScorersModule } from './components/modules/TopScorersModule';
import { JerseysModule } from './components/modules/JerseysModule';
import { TitlesModule } from './components/modules/TitlesModule';
import { CurrentSeasonModule } from './components/modules/CurrentSeasonModule';
import { HistoryModule } from './components/modules/HistoryModule';
import { LineupBuilder } from './components/LineupBuilder';
import { StadiumSection } from './components/StadiumSection';
import { ChantsAndCulture } from './components/ChantsAndCulture';
import { QuizSection } from './components/QuizSection';
import { InteractiveTimeline } from './components/InteractiveTimeline';
import { Footer } from './components/Footer';
import { DeveloperDataSemaforoPanel } from './components/DeveloperDataSemaforoPanel';
import { ShareNotificationToast } from './components/ShareNotificationToast';
import { ThemeProvider } from './context/ThemeContext';
import { AppModuleId, WindowViewMode } from './types/football';
import { ChevronDown, ChevronUp } from 'lucide-react';

function AppContent() {
  const [currentWindow, setCurrentWindow] = useState<WindowViewMode>('inicio');
  const [showExtras, setShowExtras] = useState(false);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sincronización con hash de URL y parámetros profundos (?tabla=, ?rival=, ?titulo=, ?goleador=, etc.)
  useEffect(() => {
    const parseHash = () => {
      const rawHash = window.location.hash.replace('#', '');
      const [moduleHash, queryStr] = rawHash.split('?');

      if (queryStr) {
        try {
          const params = new URLSearchParams(queryStr);
          const tableId = params.get('tabla');
          if (tableId) {
            sessionStorage.setItem('junior-pending-standings-table', tableId);
            window.dispatchEvent(
              new CustomEvent('junior-select-standings-table', {
                detail: { tableId },
              })
            );
          }
          const rivalId = params.get('rival');
          if (rivalId) {
            sessionStorage.setItem('junior-pending-rival-franchise', rivalId);
            window.dispatchEvent(
              new CustomEvent('junior-select-rival-franchise', {
                detail: { franchiseId: rivalId },
              })
            );
          }
          const historyTab = params.get('seccion');
          const historyChapter = params.get('capitulo');
          if (historyTab || historyChapter) {
            if (historyTab) {
              sessionStorage.setItem('junior-pending-history-tab', historyTab);
            }
            if (historyChapter) {
              sessionStorage.setItem('junior-pending-history-chapter', historyChapter);
            }
            window.dispatchEvent(
              new CustomEvent('junior-select-history-section', {
                detail: {
                  tab: historyTab || undefined,
                  chapterId: historyChapter || undefined,
                },
              })
            );
          }
          const scorerId = params.get('goleador');
          if (scorerId) {
            sessionStorage.setItem('junior-pending-top-scorer', scorerId);
            window.dispatchEvent(
              new CustomEvent('junior-select-top-scorer', {
                detail: { scorerId },
              })
            );
          }
          const titleId = params.get('titulo');
          if (titleId) {
            sessionStorage.setItem('junior-pending-official-title', titleId);
            window.dispatchEvent(
              new CustomEvent('junior-select-official-title', {
                detail: { titleId },
              })
            );
          }
        } catch (e) {
          console.warn('Error parsing hash query:', e);
        }
      }

      const validModules: AppModuleId[] = [
        'tablas-historicas',
        'resultados-vs-equipos',
        'goleadores-historicos',
        'uniformes',
        'titulos',
        'actualidad',
        'historia',
      ];

      if (moduleHash === 'dev-panel' || moduleHash === 'semaforo-datos') {
        setDevPanelOpen(true);
      } else if (validModules.includes(moduleHash as AppModuleId)) {
        setCurrentWindow(moduleHash as AppModuleId);
      } else if (moduleHash === 'inicio' || moduleHash === '') {
        setCurrentWindow('inicio');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Atajos silenciosos de teclado: Ctrl+Shift+D (panel técnico interno) y Ctrl/Cmd+K o "/" (buscador)
  useEffect(() => {
    const handleShortcuts = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setDevPanelOpen((prev) => !prev);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      } else if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  const normalizeModuleId = (id: string): AppModuleId | null => {
    if (id === 'tablas-historicas' || id === 'tablas') return 'tablas-historicas';
    if (id === 'resultados-vs-equipos' || id === 'resultados' || id === 'clasicos')
      return 'resultados-vs-equipos';
    if (id === 'goleadores-historicos' || id === 'leyendas' || id === 'goleadores')
      return 'goleadores-historicos';
    if (id === 'uniformes' || id === 'camisetas') return 'uniformes';
    if (id === 'titulos' || id === 'estrellas') return 'titulos';
    if (id === 'actualidad') return 'actualidad';
    if (id === 'historia') return 'historia';
    return null;
  };

  const openSection = (sectionId: WindowViewMode) => {
    setCurrentWindow(sectionId);
    window.location.hash = sectionId === 'inicio' ? '' : sectionId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTitle = (titleId: string) => {
    sessionStorage.setItem('junior-pending-official-title', titleId);
    setCurrentWindow('titulos');
    window.location.hash = `titulos?titulo=${encodeURIComponent(titleId)}`;
    window.dispatchEvent(
      new CustomEvent('junior-select-official-title', {
        detail: { titleId },
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'inicio') {
      openSection('inicio');
      return;
    }

    const matched = normalizeModuleId(sectionId);
    if (matched) {
      openSection(matched);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCloseDevPanel = () => {
    setDevPanelOpen(false);
    const cleanHash = window.location.hash.replace('#', '').split('?')[0];
    if (cleanHash === 'dev-panel' || cleanHash === 'semaforo-datos') {
      window.location.hash = currentWindow === 'inicio' ? '' : currentWindow;
    }
  };

  const handleJumpToScorerFromDevPanel = (scorerId: string) => {
    setDevPanelOpen(false);
    sessionStorage.setItem('junior-pending-top-scorer', scorerId);
    setCurrentWindow('goleadores-historicos');
    window.location.hash = `goleadores-historicos?goleador=${encodeURIComponent(scorerId)}`;
    window.dispatchEvent(
      new CustomEvent('junior-select-top-scorer', {
        detail: { scorerId },
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0E172A] font-sans selection:bg-[#D62027] selection:text-white">
      {/* Barra de navegación única limpia */}
      <Navbar
        activeSection={currentWindow}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Buscador editorial disparado desde la lupa del menú */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={openSection}
      />

      {/* Notificación de enlace compartido */}
      <ShareNotificationToast />

      {currentWindow === 'inicio' ? (
        <main className="flex-1">
          {/* Hero Editorial con Fotografía Oficial */}
          <HeroSection onNavigate={handleNavigate} onOpenTitle={handleOpenTitle} />

          {/* Portada Editorial: Vitrina Fotográfica, Historias y Directorio */}
          <HomeWindowsGrid
            onOpenWindow={openSection}
            onOpenTitle={handleOpenTitle}
          />

          {/* Cronología del Centenario */}
          <InteractiveTimeline onSelectModule={openSection} />

          {/* Zona Currambera interactiva (desplegable editorial limpia) */}
          <section className="bg-white py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setShowExtras((prev) => !prev)}
                aria-expanded={showExtras}
                className="w-full px-6 py-5 rounded-2xl bg-[#F7F5F0] hover:bg-[#EFECE4] border border-[#E5E1D8] flex items-center justify-between gap-4 text-left transition-colors group"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D62027] block">
                    Experiencias para la Hinchada
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#081D40] group-hover:text-[#D62027] transition-colors leading-tight mt-0.5">
                    Zona Currambera: Arma tu 11, El Metro, Cánticos y Trivia
                  </h3>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#081D40] shrink-0">
                  <span className="hidden sm:inline">{showExtras ? 'Ocultar' : 'Explorar'}</span>
                  {showExtras ? (
                    <ChevronUp className="w-5 h-5 text-[#D62027]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#D62027]" />
                  )}
                </div>
              </button>

              {showExtras && (
                <div className="editorial-module-surface pt-8 space-y-12">
                  <LineupBuilder />
                  <StadiumSection />
                  <ChantsAndCulture audioEnabled={true} />
                  <QuizSection audioEnabled={true} />
                </div>
              )}
            </div>
          </section>
        </main>
      ) : (
        <main className="flex-1 bg-white">
          {/* Migas de pan limpias no fijas */}
          <WindowHeader
            activeModule={currentWindow}
            onSelectModule={openSection}
            onBackToHome={() => openSection('inicio')}
          />

          {/* Contenido enciclopédico armonizado en identidad rojiblanca clara */}
          <div className="editorial-module-surface min-h-[70vh]">
            {currentWindow === 'tablas-historicas' && <HistoricTablesModule />}
            {currentWindow === 'resultados-vs-equipos' && (
              <HeadToHeadModule audioEnabled={true} />
            )}
            {currentWindow === 'goleadores-historicos' && <TopScorersModule />}
            {currentWindow === 'uniformes' && <JerseysModule />}
            {currentWindow === 'titulos' && (
              <TitlesModule onNavigateToModule={openSection} />
            )}
            {currentWindow === 'actualidad' && <CurrentSeasonModule />}
            {currentWindow === 'historia' && (
              <HistoryModule onNavigateToModule={openSection} />
            )}
          </div>

          {/* Navegación editorial entre secciones */}
          <WindowFooter
            currentModule={currentWindow}
            onSelectModule={openSection}
            onBackToHome={() => openSection('inicio')}
          />
        </main>
      )}

      {/* Pie de página institucional azul marino */}
      <Footer onNavigate={handleNavigate} />

      {/* Panel interno oculto accesible solo vía atajo Ctrl+Shift+D */}
      <DeveloperDataSemaforoPanel
        isOpen={devPanelOpen}
        onClose={handleCloseDevPanel}
        onJumpToScorer={handleJumpToScorerFromDevPanel}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
