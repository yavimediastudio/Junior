/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
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
import { LineupBuilder } from './components/LineupBuilder';
import { StadiumSection } from './components/StadiumSection';
import { ChantsAndCulture } from './components/ChantsAndCulture';
import { QuizSection } from './components/QuizSection';
import { InteractiveTimeline } from './components/InteractiveTimeline';
import { Footer } from './components/Footer';
import { ShareNotificationToast } from './components/ShareNotificationToast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppModuleId, WindowViewMode } from './types/football';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

function AppContent() {
  const [currentWindow, setCurrentWindow] = useState<WindowViewMode>('inicio');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showExtras, setShowExtras] = useState(false);
  const { theme } = useTheme();

  // Parse initial URL hash or sync on back/forward (supports query parameters like ?tabla=...)
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
      ];

      if (validModules.includes(moduleHash as AppModuleId)) {
        setCurrentWindow(moduleHash as AppModuleId);
      } else if (moduleHash === 'inicio' || moduleHash === '') {
        setCurrentWindow('inicio');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const normalizeModuleId = (id: string): AppModuleId | null => {
    if (id === 'tablas-historicas' || id === 'tablas') return 'tablas-historicas';
    if (id === 'resultados-vs-equipos' || id === 'resultados') return 'resultados-vs-equipos';
    if (id === 'goleadores-historicos' || id === 'leyendas' || id === 'goleadores') return 'goleadores-historicos';
    if (id === 'uniformes' || id === 'camisetas') return 'uniformes';
    if (id === 'titulos' || id === 'estrellas') return 'titulos';
    if (id === 'actualidad') return 'actualidad';
    return null;
  };

  const openWindow = (windowId: WindowViewMode) => {
    setCurrentWindow(windowId);
    window.location.hash = windowId === 'inicio' ? '' : windowId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'inicio') {
      openWindow('inicio');
      return;
    }

    const matched = normalizeModuleId(sectionId);
    if (matched) {
      openWindow(matched);
      return;
    }

    // Anchor navigation if target is on current view
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleAudio = () => {
    setAudioEnabled((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors duration-150 ${
        theme === 'light'
          ? 'bg-slate-50 text-slate-900 light'
          : 'bg-slate-950 text-slate-100 dark'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        activeSection={currentWindow}
        onNavigate={handleNavigate}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />

      {/* Floating Share Link Confirmation Toast Notification */}
      <ShareNotificationToast />

      {/* RENDER VIEW: HOME PORTAL VS DEDICATED WINDOW */}
      {currentWindow === 'inicio' ? (
        /* PORTAL PRINCIPAL (HOME VIEW) */
        <main className="flex-1">
          {/* Hero Section */}
          <HeroSection onNavigate={handleNavigate} />

          {/* 6 Independent Windows Grid */}
          <HomeWindowsGrid onOpenWindow={openWindow} />

          {/* Línea de Tiempo Interactiva del Centenario (1924 - 2024) */}
          <InteractiveTimeline onSelectModule={openWindow} />

          {/* Collapsible Interactive Extras Zone */}
          <div className="bg-slate-950 border-b border-slate-800 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setShowExtras(!showExtras)}
                className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-left transition-colors group shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold uppercase text-white tracking-wide group-hover:text-amber-400 transition-colors">
                      Zona Currambera & Herramientas Interactivas
                    </h3>
                    <p className="text-xs text-slate-400">
                      Pizarra táctica (Arma tu 11), historia de El Metro y el Romelio, cánticos de la barra y trivia rojiblanca.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 shrink-0">
                  <span>{showExtras ? 'Ocultar zona' : 'Explorar herramientas'}</span>
                  {showExtras ? (
                    <ChevronUp className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </button>

              {showExtras && (
                <div className="pt-8 space-y-12 animate-in fade-in duration-300">
                  {/* Arma tu Once Ideal */}
                  <LineupBuilder />

                  {/* Estadio Metropolitano Roberto Meléndez & Sedes */}
                  <StadiumSection />

                  {/* Cánticos de Tribuna Sur & Fiesta Currambera */}
                  <ChantsAndCulture audioEnabled={audioEnabled} />

                  {/* Trivia Histórica de Junior */}
                  <QuizSection audioEnabled={audioEnabled} />
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* DEDICATED INDEPENDENT WINDOW VIEW */
        <main className="flex-1 animate-in fade-in duration-200">
          {/* Sticky Window Header with Back to Home & Window Switcher */}
          <WindowHeader
            activeModule={currentWindow}
            onSelectModule={openWindow}
            onBackToHome={() => openWindow('inicio')}
          />

          {/* Render ONLY the selected window */}
          <div className="min-h-[70vh]">
            {currentWindow === 'tablas-historicas' && <HistoricTablesModule />}
            {currentWindow === 'resultados-vs-equipos' && (
              <HeadToHeadModule audioEnabled={audioEnabled} />
            )}
            {currentWindow === 'goleadores-historicos' && <TopScorersModule />}
            {currentWindow === 'uniformes' && <JerseysModule />}
            {currentWindow === 'titulos' && <TitlesModule />}
            {currentWindow === 'actualidad' && <CurrentSeasonModule />}
          </div>

          {/* Bottom Window Footer (Previous / Home / Next) */}
          <WindowFooter
            currentModule={currentWindow}
            onSelectModule={openWindow}
            onBackToHome={() => openWindow('inicio')}
          />
        </main>
      )}

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
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
