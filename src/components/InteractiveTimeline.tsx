import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Award,
  ArrowRight,
  CheckCircle2,
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
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('2026-estrella-12');
  const [categoryFilter, setCategoryFilter] = useState<'todos' | TimelineCategory>('todos');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'list'>('interactive');

  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredMilestones = useMemo(() => {
    if (categoryFilter === 'todos') return JUNIOR_TIMELINE_MILESTONES;
    return JUNIOR_TIMELINE_MILESTONES.filter((m) => m.category === categoryFilter);
  }, [categoryFilter]);

  const currentMilestone: TimelineMilestone = useMemo(() => {
    const found = filteredMilestones.find((m) => m.id === selectedMilestoneId);
    if (found) return found;
    return filteredMilestones[0] || JUNIOR_TIMELINE_MILESTONES[0];
  }, [filteredMilestones, selectedMilestoneId]);

  const currentIndex = useMemo(() => {
    return filteredMilestones.findIndex((m) => m.id === currentMilestone.id);
  }, [filteredMilestones, currentMilestone]);

  useEffect(() => {
    if (!timelineTrackRef.current) return;
    const selectedBtn = timelineTrackRef.current.querySelector(
      `[data-milestone-id="${currentMilestone.id}"]`
    ) as HTMLElement | null;

    if (selectedBtn) {
      const container = timelineTrackRef.current;
      const scrollLeft =
        selectedBtn.offsetLeft - container.offsetWidth / 2 + selectedBtn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [currentMilestone.id]);

  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setSelectedMilestoneId((prevId) => {
          const idx = filteredMilestones.findIndex((m) => m.id === prevId);
          const nextIdx = (idx + 1) % filteredMilestones.length;
          return filteredMilestones[nextIdx].id;
        });
      }, 4500);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
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
      } catch {
        // ignore
      }
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

  const filterButtons: { id: 'todos' | TimelineCategory; label: string }[] = [
    { id: 'todos', label: `Todos (${JUNIOR_TIMELINE_MILESTONES.length})` },
    {
      id: 'estrella',
      label: `Estrellas (${JUNIOR_TIMELINE_MILESTONES.filter((m) => m.category === 'estrella').length})`,
    },
    {
      id: 'copa',
      label: `Copas (${JUNIOR_TIMELINE_MILESTONES.filter((m) => m.category === 'copa').length})`,
    },
    { id: 'hito', label: 'Hitos' },
    { id: 'centenario', label: 'Centenario' },
  ];

  return (
    <section
      id="linea-tiempo"
      className={`py-14 sm:py-16 bg-[#F7F5F0] border-b border-[#E5E1D8] ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera editorial */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E5E1D8] mb-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D62027]">
              Cronología Oficial · 1924 – 2026
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#081D40] tracking-tight leading-none mt-1.5">
              Línea de Tiempo del Centenario
            </h2>
            <p className="text-sm text-[#526075] mt-2.5 leading-relaxed">
              Recorre más de un siglo de historia rojiblanca, hito por hito, con sus protagonistas, marcadores y acceso directo al archivo.
            </p>
          </div>

          {/* Controles de filtro y vista */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {filterButtons.map((btn) => {
                const isActive = categoryFilter === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setCategoryFilter(btn.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border ${
                      isActive
                        ? 'bg-[#081D40] text-white border-[#081D40]'
                        : 'bg-white text-[#526075] border-[#E5E1D8] hover:text-[#081D40] hover:border-[#081D40]/30'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-[#DFDBD0] hidden sm:block mx-1" />

            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 border ${
                isPlaying
                  ? 'bg-[#D62027] text-white border-[#D62027]'
                  : 'bg-white text-[#081D40] border-[#E5E1D8] hover:border-[#D62027]/40'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Recorrido'}</span>
            </button>

            <div className="bg-white p-0.5 rounded-lg border border-[#E5E1D8] inline-flex">
              <button
                type="button"
                onClick={() => setViewMode('interactive')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === 'interactive'
                    ? 'bg-[#081D40] text-white'
                    : 'text-[#526075] hover:text-[#081D40]'
                }`}
              >
                Línea
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#081D40] text-white'
                    : 'text-[#526075] hover:text-[#081D40]'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'interactive' ? (
          <div>
            {/* Carril horizontal cronológico */}
            <div className="relative mb-8">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#D6D1C6] -translate-y-1/2 z-0" />

              <button
                type="button"
                onClick={handlePrev}
                aria-label="Hito anterior"
                className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-[#E5E1D8] text-[#081D40] hover:bg-[#D62027] hover:text-white hover:border-[#D62027] flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente hito"
                className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-[#E5E1D8] text-[#081D40] hover:bg-[#D62027] hover:text-white hover:border-[#D62027] flex items-center justify-center shadow-sm transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div
                ref={timelineTrackRef}
                className="flex items-center gap-3 overflow-x-auto py-5 px-10 relative z-10"
              >
                {filteredMilestones.map((milestone) => {
                  const isSelected = milestone.id === currentMilestone.id;
                  const isStar = milestone.category === 'estrella';
                  const isCup = milestone.category === 'copa';

                  return (
                    <button
                      key={milestone.id}
                      type="button"
                      data-milestone-id={milestone.id}
                      onClick={() => handleSelectMilestone(milestone.id)}
                      className={`group shrink-0 flex flex-col items-center gap-2 transition-all outline-none ${
                        isSelected ? 'scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`px-3 py-1.5 rounded-lg font-display font-bold text-sm tracking-wide transition-colors border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#D62027] text-white border-[#D62027] shadow-sm'
                            : isStar
                            ? 'bg-white text-[#9A6700] border-[#E8D59B] hover:border-[#C69214]'
                            : 'bg-white text-[#081D40] border-[#E5E1D8] hover:border-[#081D40]/40'
                        }`}
                      >
                        {isStar && (
                          <Star
                            className={`w-3 h-3 fill-current shrink-0 ${
                              isSelected ? 'text-[#FDE047]' : 'text-[#C69214]'
                            }`}
                          />
                        )}
                        {isCup && (
                          <Trophy
                            className={`w-3 h-3 shrink-0 ${
                              isSelected ? 'text-[#FDE047]' : 'text-[#9A6700]'
                            }`}
                          />
                        )}
                        <span>{milestone.yearDisplay}</span>
                      </div>

                      <div
                        className={`w-3 h-3 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'bg-[#D62027] border-white ring-2 ring-[#D62027]'
                            : isStar
                            ? 'bg-[#C69214] border-[#F7F5F0]'
                            : 'bg-[#94A3B8] border-[#F7F5F0] group-hover:bg-[#081D40]'
                        }`}
                      />

                      <span
                        className={`text-[11px] max-w-[92px] truncate text-center ${
                          isSelected ? 'text-[#081D40] font-bold' : 'text-[#64748B]'
                        }`}
                      >
                        {milestone.title.replace(/^[⭐🏆🌟💯\s]+/, '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha editorial del hito activo */}
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#D62027] via-[#C69214] to-[#081D40]" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Izquierda: Año, titular y ficha técnica */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#526075]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#081D40]">
                      <Calendar className="w-3.5 h-3.5 text-[#D62027]" />
                      <span>{currentMilestone.date}</span>
                    </span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="font-bold uppercase tracking-wider text-[#D62027]">
                      {currentMilestone.categoryLabel}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-6xl sm:text-7xl font-black text-[#081D40] leading-none tabular-nums">
                      {currentMilestone.year}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9A6700] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 rounded-md">
                      {currentMilestone.statBadge}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#081D40] leading-tight">
                    {currentMilestone.title.replace(/^[⭐🏆🌟💯\s]+/, '')}
                  </h3>

                  <dl className="divide-y divide-[#EFECE4] border-y border-[#EFECE4] text-xs">
                    {currentMilestone.scoreOrRecord && (
                      <div className="py-2.5 flex items-center justify-between gap-3">
                        <dt className="text-[#64748B] font-medium">Marcador / Registro</dt>
                        <dd className="font-semibold text-[#081D40] text-right">
                          {currentMilestone.scoreOrRecord}
                        </dd>
                      </div>
                    )}
                    {currentMilestone.manager && (
                      <div className="py-2.5 flex items-center justify-between gap-3">
                        <dt className="text-[#64748B] font-medium">Director Técnico</dt>
                        <dd className="font-semibold text-[#081D40] text-right">
                          {currentMilestone.manager}
                        </dd>
                      </div>
                    )}
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <dt className="text-[#64748B] font-medium">Registro cronológico</dt>
                      <dd className="font-medium text-[#526075] tabular-nums">
                        Hito {currentIndex + 1} de {filteredMilestones.length}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#F7F5F0] hover:bg-[#ECE8DF] border border-[#E5E1D8] text-xs font-semibold text-[#081D40] transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#F7F5F0] hover:bg-[#ECE8DF] border border-[#E5E1D8] text-xs font-semibold text-[#081D40] transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Derecha: Crónica editorial, hitos y protagonistas */}
                <div className="lg:col-span-7 space-y-5 lg:border-l lg:border-[#EFECE4] lg:pl-8">
                  <p className="font-editorial text-base sm:text-lg text-[#1E293B] leading-relaxed">
                    {currentMilestone.summary}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#526075]">
                      Hechos clave de la campaña
                    </h4>
                    <ul className="space-y-2">
                      {currentMilestone.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-[#334155]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#D62027] mt-0.5 shrink-0" />
                          <span className="leading-snug">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#526075] mb-2">
                      Protagonistas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentMilestone.keyFigures.map((fig, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F5F0] border border-[#E5E1D8] text-xs font-medium text-[#081D40]"
                        >
                          <Award className="w-3 h-3 text-[#C69214]" />
                          <span>{fig}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleNavigateToModule(currentMilestone)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#081D40] hover:bg-[#D62027] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors group"
                    >
                      <span>
                        {currentMilestone.relatedModuleLabel.replace(/\s*\(Ventana\s+\d+\)/gi, '')}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Vista lista cronológica vertical limpia */
          <div className="relative border-l-2 border-[#DFDBD0] ml-3 sm:ml-6 pl-6 sm:pl-8 space-y-6">
            {filteredMilestones.map((milestone) => {
              const isStar = milestone.category === 'estrella';
              const isCup = milestone.category === 'copa';

              return (
                <article key={milestone.id} className="relative">
                  <div
                    className={`absolute -left-[35px] sm:-left-[43px] top-2 w-5 h-5 rounded-full border-2 border-[#F7F5F0] flex items-center justify-center ${
                      isStar
                        ? 'bg-[#C69214] text-white'
                        : isCup
                        ? 'bg-[#081D40] text-white'
                        : 'bg-[#D62027] text-white'
                    }`}
                  >
                    {isStar ? <Star className="w-2.5 h-2.5 fill-current" /> : null}
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-3xl font-black text-[#081D40] tabular-nums leading-none">
                          {milestone.year}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#D62027]">
                          {milestone.categoryLabel}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#9A6700] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-0.5 rounded-md">
                        {milestone.statBadge}
                      </span>
                    </div>

                    <h4 className="font-display text-xl font-extrabold uppercase text-[#081D40]">
                      {milestone.title.replace(/^[⭐🏆🌟💯\s]+/, '')}
                    </h4>

                    <p className="text-sm text-[#475569] leading-relaxed">{milestone.summary}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFECE4]">
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.keyFigures.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="text-xs text-[#526075] bg-[#F7F5F0] px-2.5 py-0.5 rounded-md border border-[#EFECE4]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleNavigateToModule(milestone)}
                        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#D62027] hover:text-[#081D40] transition-colors"
                      >
                        <span>Ver en el archivo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
