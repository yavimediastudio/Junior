import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Trophy,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Award,
  Users,
  Shield,
  ArrowRight,
  ListFilter,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { AppModuleId } from '../types/football';
import {
  JUNIOR_TIMELINE_MILESTONES,
  TimelineMilestone,
  TimelineCategory,
} from '../data/juniorTimelineData';

interface InteractiveTimelineProps {
  onSelectModule?: (moduleId: AppModuleId) => void;
  className?: string;
}

export const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({
  onSelectModule,
  className = '',
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('2023-estrella-10');
  const [categoryFilter, setCategoryFilter] = useState<'todos' | TimelineCategory>('todos');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'list'>('interactive');

  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered milestones based on category
  const filteredMilestones = useMemo(() => {
    if (categoryFilter === 'todos') return JUNIOR_TIMELINE_MILESTONES;
    return JUNIOR_TIMELINE_MILESTONES.filter((m) => m.category === categoryFilter);
  }, [categoryFilter]);

  // Current active milestone
  const currentMilestone: TimelineMilestone = useMemo(() => {
    const found = filteredMilestones.find((m) => m.id === selectedMilestoneId);
    if (found) return found;
    return filteredMilestones[0] || JUNIOR_TIMELINE_MILESTONES[0];
  }, [filteredMilestones, selectedMilestoneId]);

  // Current index in filtered list
  const currentIndex = useMemo(() => {
    return filteredMilestones.findIndex((m) => m.id === currentMilestone.id);
  }, [filteredMilestones, currentMilestone]);

  // Center the selected year pill in the horizontal track
  useEffect(() => {
    if (!timelineTrackRef.current) return;
    const selectedBtn = timelineTrackRef.current.querySelector(
      `[data-milestone-id="${currentMilestone.id}"]`
    ) as HTMLElement;

    if (selectedBtn) {
      const container = timelineTrackRef.current;
      const scrollLeft =
        selectedBtn.offsetLeft - container.offsetWidth / 2 + selectedBtn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentMilestone.id]);

  // Auto-play slideshow tour
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setSelectedMilestoneId((prevId) => {
          const idx = filteredMilestones.findIndex((m) => m.id === prevId);
          const nextIdx = (idx + 1) % filteredMilestones.length;
          return filteredMilestones[nextIdx].id;
        });
      }, 4500);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, filteredMilestones]);

  const handleSelectMilestone = (id: string) => {
    setSelectedMilestoneId(id);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentIndex < filteredMilestones.length - 1) {
      setSelectedMilestoneId(filteredMilestones[currentIndex + 1].id);
    } else {
      setSelectedMilestoneId(filteredMilestones[0].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedMilestoneId(filteredMilestones[currentIndex - 1].id);
    } else {
      setSelectedMilestoneId(filteredMilestones[filteredMilestones.length - 1].id);
    }
  };

  const handleNavigateToModule = (milestone: TimelineMilestone) => {
    if (milestone.standingsTableId) {
      try {
        sessionStorage.setItem('junior-pending-standings-table', milestone.standingsTableId);
      } catch {}
      window.dispatchEvent(
        new CustomEvent('junior-select-standings-table', {
          detail: { tableId: milestone.standingsTableId },
        })
      );
    }
    if (onSelectModule) {
      onSelectModule(milestone.relatedModuleId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="linea-tiempo" className={`py-12 bg-slate-950 relative overflow-hidden ${className}`}>
      {/* Decorative gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/80 text-red-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <img src="/assets/aistudio/image_82370351.png" alt="Escudo Junior" className="w-4 h-4 object-contain shrink-0" />
            <span>Línea de Tiempo del Centenario (1924 - 2024)</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Hitos <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">Inmortales</span> de Junior
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400">
            100 años de gloria, estrellas y hazañas. Haz clic en cualquier año o hito para ver el <strong className="text-slate-200">resumen rápido oficial</strong>, sus protagonistas y acceder a la enciclopedia.
          </p>
        </div>

        {/* Filters and View Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl mb-8 backdrop-blur-md shadow-xl">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden md:inline">Filtrar:</span>
            
            <button
              onClick={() => setCategoryFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                categoryFilter === 'todos'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Todos ({JUNIOR_TIMELINE_MILESTONES.length})
            </button>

            <button
              onClick={() => setCategoryFilter('estrella')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'estrella'
                  ? 'bg-yellow-500 text-slate-950 font-bold shadow-md shadow-yellow-950'
                  : 'bg-slate-800/80 text-yellow-400 hover:bg-slate-800'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>10 Estrellas</span>
            </button>

            <button
              onClick={() => setCategoryFilter('copa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'copa'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950'
                  : 'bg-slate-800/80 text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-3 h-3" />
              <span>Copas (4)</span>
            </button>

            <button
              onClick={() => setCategoryFilter('hito')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'hito'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-950'
                  : 'bg-slate-800/80 text-blue-300 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Hitos Históricos (1948, 1950...)</span>
            </button>

            <button
              onClick={() => setCategoryFilter('centenario')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                categoryFilter === 'centenario'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950'
                  : 'bg-slate-800/80 text-rose-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Centenario 100</span>
            </button>
          </div>

          {/* Action buttons: Auto-tour and View toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isPlaying
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
              }`}
              title={isPlaying ? 'Pausar recorrido automático' : 'Reproducir recorrido automático hito por hito'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar Tour' : 'Auto Tour'}</span>
            </button>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="bg-slate-800 p-0.5 rounded-xl border border-slate-700 flex items-center">
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'interactive'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Línea
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'interactive' ? (
          <div>
            {/* HORIZONTAL INTERACTIVE TIMELINE TRACK */}
            <div className="relative mb-8">
              {/* Central horizontal line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-red-600/40 via-amber-500/40 to-red-600/40 -translate-y-1/2 z-0 rounded-full" />

              {/* Scroll buttons for the track */}
              <button
                onClick={handlePrev}
                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/95 border border-slate-700 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all shadow-xl group"
                title="Hito anterior"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleNext}
                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/95 border border-slate-700 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all shadow-xl group"
                title="Siguiente hito"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Scrollable Years Container */}
              <div
                ref={timelineTrackRef}
                className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-6 px-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50 relative z-10"
              >
                {filteredMilestones.map((milestone) => {
                  const isSelected = milestone.id === currentMilestone.id;
                  const isStar = milestone.category === 'estrella';
                  const isCup = milestone.category === 'copa';

                  return (
                    <button
                      key={milestone.id}
                      data-milestone-id={milestone.id}
                      onClick={() => handleSelectMilestone(milestone.id)}
                      className={`group shrink-0 flex flex-col items-center gap-2 transition-all duration-200 outline-none ${
                        isSelected ? 'scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Year Node Badge */}
                      <div
                        className={`relative px-3 py-1.5 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wide transition-all border shadow-lg flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-400 ring-4 ring-red-500/20 shadow-red-950'
                            : isStar
                            ? 'bg-slate-900 text-yellow-400 border-yellow-500/50 hover:border-yellow-400'
                            : isCup
                            ? 'bg-slate-900 text-amber-300 border-amber-500/50 hover:border-amber-400'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {isStar && <Star className="w-3 h-3 fill-current text-yellow-400 shrink-0" />}
                        {isCup && <Trophy className="w-3 h-3 text-amber-400 shrink-0" />}
                        <span>{milestone.yearDisplay}</span>
                      </div>

                      {/* Dot on the central line */}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'bg-white border-red-500 ring-4 ring-red-500/40 scale-125'
                            : isStar
                            ? 'bg-yellow-400 border-slate-950'
                            : 'bg-slate-600 border-slate-950 group-hover:bg-slate-400'
                        }`}
                      />

                      {/* Mini Title Preview */}
                      <span className={`text-[10px] font-medium tracking-tight max-w-[85px] truncate text-center transition-colors ${
                        isSelected ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-300'
                      }`}>
                        {milestone.title.replace(/^[⭐🏆🌟💯\s]+/, '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DETAILED QUICK SUMMARY CARD (ACTIVE MILESTONE) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Year Hero Badge, Title, Category and Stats */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs uppercase font-extrabold px-3 py-1 rounded-full border bg-slate-950 text-slate-300 border-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-red-400" />
                      <span>{currentMilestone.date}</span>
                    </span>

                    <span className={`text-xs font-mono uppercase font-bold px-3 py-1 rounded-full border ${currentMilestone.categoryColor}`}>
                      {currentMilestone.categoryLabel}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400">
                      {currentMilestone.year}
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg">
                      {currentMilestone.statBadge}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">
                    {currentMilestone.title}
                  </h3>

                  {/* Highlight Metrics */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    {currentMilestone.scoreOrRecord && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Marcador / Registro:</span>
                        <span className="font-mono font-bold text-amber-300">{currentMilestone.scoreOrRecord}</span>
                      </div>
                    )}
                    {currentMilestone.manager && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Director Técnico:</span>
                        <span className="font-semibold text-white">{currentMilestone.manager}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Hito #{currentIndex + 1} de {filteredMilestones.length}</span>
                      <span className="text-slate-400 font-mono">1924 - 2024</span>
                    </div>
                  </div>

                  {/* Previous / Next buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handlePrev}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Narrative Quick Summary, Key Figures and Direct Module Jump */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Summary Card Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Resumen Rápido Oficial</span>
                    </div>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                      {currentMilestone.summary}
                    </p>
                  </div>

                  {/* Detailed Key Bullets */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hechos Clave de la Campaña:</span>
                    </h4>
                    <div className="space-y-2">
                      {currentMilestone.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                          <span className="leading-snug">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Protagonistas y Leyendas Clave */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-rose-400" />
                      <span>Protagonistas & Leyendas:</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentMilestone.keyFigures.map((fig, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-200 font-medium border border-slate-700/80 flex items-center gap-1.5"
                        >
                          <Award className="w-3 h-3 text-yellow-400" />
                          <span>{fig}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Direct Action: Jump to Encyclopedia Module */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleNavigateToModule(currentMilestone)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 group"
                    >
                      <span>{currentMilestone.relatedModuleLabel}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LIST VIEW: COMPLETE CHRONOLOGICAL VERTICAL TIMELINE */
          <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-8">
            {filteredMilestones.map((milestone) => {
              const isStar = milestone.category === 'estrella';
              const isCup = milestone.category === 'copa';

              return (
                <div key={milestone.id} className="relative group">
                  {/* Node icon on line */}
                  <div
                    className={`absolute -left-[35px] sm:-left-[51px] top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center shadow-md transition-transform group-hover:scale-125 ${
                      isStar
                        ? 'bg-yellow-500 border-slate-950 text-slate-950'
                        : isCup
                        ? 'bg-amber-400 border-slate-950 text-slate-950'
                        : 'bg-red-600 border-slate-950 text-white'
                    }`}
                  >
                    {isStar ? (
                      <Star className="w-3 h-3 fill-current" />
                    ) : isCup ? (
                      <Trophy className="w-3 h-3" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Milestone Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-2xl sm:text-3xl font-black text-white">
                          {milestone.year}
                        </span>
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${milestone.categoryColor}`}>
                          {milestone.categoryLabel}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                        {milestone.statBadge}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {milestone.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {milestone.summary}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                      <div className="flex flex-wrap gap-1">
                        {milestone.keyFigures.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleNavigateToModule(milestone)}
                        className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                      >
                        <span>Explorar en Enciclopedia</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
