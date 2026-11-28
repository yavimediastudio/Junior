import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { TopScorerProfile } from '../types/football';
import {
  RACE_END_YEAR,
  RACE_ERA_CHAPTERS,
  RACE_START_YEAR,
  buildScorersRaceTimeline,
  getRaceAxisTicks,
  getRaceFrameAtYear,
} from '../utils/scorersRaceLogic';
import { ScorerPortrait } from './ScorerPortrait';
import { NationalityFlag } from './NationalityFlag';

interface ScorersRaceChartProps {
  scorers: TopScorerProfile[];
  autoPlayOnMount?: boolean;
  onSelectScorer?: (scorer: TopScorerProfile) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;
type SpeedMultiplier = (typeof SPEED_OPTIONS)[number];

const VISIBLE_COUNT_OPTIONS = [8, 10, 12] as const;
type VisibleCount = (typeof VISIBLE_COUNT_OPTIONS)[number];

const ROW_HEIGHT = 40;
const BASE_YEARS_PER_SECOND = 2.4;
const SCRUBBER_MARKERS = [1948, 1966, 1975, 1985, 1995, 2005, 2015, 2026];

export const ScorersRaceChart: React.FC<ScorersRaceChartProps> = ({
  scorers,
  autoPlayOnMount = true,
  onSelectScorer,
}) => {
  const timeline = useMemo(() => buildScorersRaceTimeline(scorers), [scorers]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [yearFloat, setYearFloat] = useState<number>(
    prefersReducedMotion ? RACE_END_YEAR : RACE_START_YEAR
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(
    autoPlayOnMount && !prefersReducedMotion
  );
  const [speed, setSpeed] = useState<SpeedMultiplier>(1);
  const [visibleCount, setVisibleCount] = useState<VisibleCount>(10);

  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSeconds = Math.min(0.1, (timestamp - lastTimestampRef.current) / 1000);
      lastTimestampRef.current = timestamp;

      setYearFloat((prev) => {
        // Gentle cruise across Junior's 1954–1965 non-Dimayor hiatus so the race keeps momentum
        const hiatusBoost = prev >= 1953.4 && prev < 1965.4 ? 3.2 : 1;
        const next = prev + deltaSeconds * BASE_YEARS_PER_SECOND * speed * hiatusBoost;
        if (next >= RACE_END_YEAR) {
          setIsPlaying(false);
          return RACE_END_YEAR;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [isPlaying, speed]);

  const frame = useMemo(
    () => getRaceFrameAtYear(timeline, yearFloat, visibleCount),
    [timeline, yearFloat, visibleCount]
  );

  const axisTicks = useMemo(() => getRaceAxisTicks(frame.maxGoals), [frame.maxGoals]);

  const isFinished = yearFloat >= RACE_END_YEAR - 0.01;
  const totalYearsSpan = RACE_END_YEAR - RACE_START_YEAR + 1;
  const elapsedYearsCount = Math.min(
    totalYearsSpan,
    Math.max(1, frame.year - RACE_START_YEAR + 1)
  );

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (isFinished) {
      setYearFloat(RACE_START_YEAR);
    }
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setYearFloat(RACE_START_YEAR);
  };

  const handleStepYear = (delta: number) => {
    setIsPlaying(false);
    setYearFloat((prev) =>
      Math.min(RACE_END_YEAR, Math.max(RACE_START_YEAR, Math.round(prev) + delta))
    );
  };

  const handleJumpToYear = (targetYear: number) => {
    setIsPlaying(false);
    setYearFloat(Math.min(RACE_END_YEAR, Math.max(RACE_START_YEAR, targetYear)));
  };

  const stageHeight = visibleCount * ROW_HEIGHT;

  return (
    <div
      id="scorers-race-console"
      className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden scroll-mt-44"
      data-testid="scorers-race-chart"
      data-race-year={frame.year}
      data-race-playing={isPlaying ? 'true' : 'false'}
    >
      {/* Unified Compact Broadcast Header: Narrative + Playback Controls + Tabular Year Counter */}
      <div className="px-4 sm:px-6 py-4 bg-slate-950/60 border-b border-slate-800 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-mono text-amber-400">
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold uppercase tracking-wider">
                Carrera Histórica por el #1 · 1948–2026
              </span>
              {frame.leader && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-200 font-sans font-semibold">
                    Líder: {frame.leader.scorer.name} ({frame.leader.displayGoals} goles)
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-tight leading-tight">
                {frame.milestone.title}
              </h2>
              <span className="text-xs text-slate-400 leading-snug">
                {frame.milestone.detail}
              </span>
            </div>
          </div>

          {/* Dedicated High-Contrast Tabular Year Counter */}
          <div className="shrink-0 flex items-center gap-3.5 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 leading-tight">
                Temporada
              </div>
              <div className="text-[10px] font-mono text-slate-500 tabular-nums mt-0.5">
                Año {elapsedYearsCount}/{totalYearsSpan}
              </div>
            </div>
            <div
              className="font-display text-4xl sm:text-5xl font-black text-amber-400 tabular-nums leading-none tracking-tight"
              aria-live="off"
              data-testid="race-year-display"
            >
              {frame.year}
            </div>
          </div>
        </div>

        {/* Inline Playback, Speed & Top-N Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isFinished ? 'Repetir desde 1948' : 'Reproducir'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>

            <div className="inline-flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => handleStepYear(-1)}
                disabled={frame.year <= RACE_START_YEAR}
                aria-label="Retroceder un año"
                className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleStepYear(1)}
                disabled={frame.year >= RACE_END_YEAR}
                aria-label="Avanzar un año"
                className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400">Velocidad</span>
              <div
                className="inline-flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg"
                role="group"
                aria-label="Velocidad de reproducción"
              >
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSpeed(opt)}
                    className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-md transition-colors whitespace-nowrap ${
                      speed === opt
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt}×
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400">Barras</span>
              <div
                className="inline-flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg"
                role="group"
                aria-label="Cantidad de goleadores visibles"
              >
                {VISIBLE_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setVisibleCount(count)}
                    className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-md transition-colors whitespace-nowrap ${
                      visibleCount === count
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Top {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Bar Chart Stage */}
      <div className="px-4 sm:px-6 pt-3 pb-3.5">
        {/* Top X-axis Scale Header */}
        <div className="flex items-center gap-3 pb-2 mb-0.5 border-b border-slate-800/90">
          <div className="w-[172px] sm:w-[244px] shrink-0 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Puesto · Artillero
          </div>
          <div className="flex-1 min-w-0 pr-20 sm:pr-24">
            <div className="relative h-3.5">
              {axisTicks.map((tick) => {
                const pct = (tick / frame.maxGoals) * 100;
                if (pct > 100) return null;
                return (
                  <span
                    key={tick}
                    style={{ left: `${pct}%` }}
                    className="absolute top-0 -translate-x-1/2 text-[10px] font-mono text-slate-500 tabular-nums select-none"
                  >
                    {tick}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Racing Stage Container */}
        <div
          className="relative w-full"
          style={{ height: `${stageHeight}px` }}
          aria-label={`Ranking animado de goleadores en el año ${frame.year}`}
        >
          {/* Background Vertical Axis Gridlines aligned strictly to bar track */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex pointer-events-none gap-3"
          >
            <div className="w-[172px] sm:w-[244px] shrink-0" />
            <div className="flex-1 min-w-0 pr-20 sm:pr-24">
              <div className="relative w-full h-full">
                {axisTicks.map((tick) => {
                  const pct = (tick / frame.maxGoals) * 100;
                  if (pct > 100) return null;
                  return (
                    <div
                      key={tick}
                      style={{ left: `${pct}%` }}
                      className="absolute top-0 bottom-0 w-px bg-slate-800/70"
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Animated Bars (Compositor-only translateY reordering) */}
          {frame.entries.map((entry) => {
            const isLeader = entry.rankIndex === 0;
            const barWidthPct = Math.max(1.5, entry.barRatio * 100);

            return (
              <button
                key={entry.scorer.id}
                type="button"
                onClick={() => onSelectScorer?.(entry.scorer)}
                style={{
                  height: `${ROW_HEIGHT}px`,
                  transform: `translateY(${entry.rankIndex * ROW_HEIGHT}px)`,
                }}
                aria-label={`Puesto ${entry.rankIndex + 1}: ${entry.scorer.name}, ${entry.displayGoals} goles en ${frame.year}. Ver ficha técnica`}
                className="group absolute left-0 right-0 top-0 flex items-center gap-3 rounded-md hover:bg-slate-800/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-transform duration-300 ease-out text-left px-1"
              >
                {/* Left Identity Block */}
                <div className="w-[172px] sm:w-[244px] shrink-0 flex items-center gap-2 min-w-0">
                  <span
                    className={`w-6 text-right font-mono text-[11px] font-bold tabular-nums shrink-0 ${
                      isLeader
                        ? 'text-amber-400'
                        : entry.rankIndex === 1
                        ? 'text-slate-100'
                        : entry.rankIndex === 2
                        ? 'text-amber-500'
                        : 'text-slate-500'
                    }`}
                  >
                    #{String(entry.rankIndex + 1).padStart(2, '0')}
                  </span>

                  <ScorerPortrait
                    scorer={entry.scorer}
                    size="sm"
                    className="!w-7 !h-7 !rounded-md shrink-0"
                  />

                  <div className="min-w-0 flex-1 flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-[13px] font-bold truncate leading-tight transition-colors ${
                        isLeader
                          ? 'text-amber-300'
                          : 'text-slate-100 group-hover:text-white'
                      }`}
                    >
                      {entry.scorer.name}
                    </span>
                    <NationalityFlag
                      countryCode={entry.scorer.countryCode}
                      nationality={entry.scorer.nationality}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Right Bar Track + Leading-Edge Tabular Counter */}
                <div className="flex-1 min-w-0 pr-20 sm:pr-24 flex items-center h-full">
                  <div className="relative w-full h-6 flex items-center">
                    <div
                      style={{ width: `${barWidthPct}%` }}
                      className={`h-full rounded-r-md ${entry.barColorClass} relative overflow-hidden`}
                    >
                      {isLeader && (
                        <div
                          aria-hidden="true"
                          className="absolute inset-y-0 right-0 w-1.5 bg-white/50"
                        />
                      )}
                    </div>

                    {/* Numeric Goal Readout anchored immediately after bar edge */}
                    <div
                      style={{ left: `${barWidthPct}%` }}
                      className="absolute top-1/2 -translate-y-1/2 pl-2 flex items-baseline gap-1.5 whitespace-nowrap tabular-nums"
                    >
                      <span
                        className={`font-display text-sm sm:text-base font-black leading-none ${
                          isLeader ? 'text-amber-400' : 'text-white'
                        }`}
                      >
                        {entry.displayGoals}
                      </span>
                      {entry.isScoringNow && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          +{entry.goalsThisYear}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Integrated Interactive Timeline Scrubber & Era Jump Chapters */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <label
              htmlFor="scorers-race-scrubber"
              className="text-slate-400"
            >
              Arrastra la línea de tiempo o haz clic en una barra para abrir la ficha técnica
            </label>
            <span className="font-mono text-emerald-400 hidden sm:inline">
              +N = goles en la temporada · {frame.year}
            </span>
          </div>

          <input
            id="scorers-race-scrubber"
            type="range"
            min={RACE_START_YEAR}
            max={RACE_END_YEAR}
            step={0.1}
            value={yearFloat}
            aria-label="Seleccionar año en la carrera de goleadores"
            onChange={(e) => {
              setIsPlaying(false);
              setYearFloat(Number(e.target.value));
            }}
            className="w-full h-1.5 rounded-lg bg-slate-800 accent-amber-500 cursor-pointer"
          />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 tabular-nums select-none">
            {SCRUBBER_MARKERS.map((marker) => (
              <button
                key={marker}
                type="button"
                onClick={() => handleJumpToYear(marker)}
                className={`hover:text-amber-400 transition-colors ${
                  Math.abs(frame.year - marker) <= 1 ? 'text-amber-400 font-bold' : ''
                }`}
              >
                {marker}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Historical Era Jump Chapters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {RACE_ERA_CHAPTERS.map((chapter) => {
            const isNearChapter =
              (chapter.id === 'era-memuerde' && frame.year <= 1974) ||
              (chapter.id === 'era-ephanor' && frame.year >= 1975 && frame.year <= 1993) ||
              (chapter.id === 'era-valenciano' && frame.year >= 1994 && frame.year <= 2019) ||
              (chapter.id === 'era-moderna' && frame.year >= 2020);

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => handleJumpToYear(chapter.year)}
                className={`text-left px-3 py-2 rounded-lg border transition-colors ${
                  isNearChapter
                    ? 'bg-slate-900 border-amber-500/70'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono tabular-nums">
                  <span className={isNearChapter ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {chapter.spanLabel}
                  </span>
                  <span className="text-slate-500">{chapter.peakGoals} goles</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">
                  {chapter.leaderName}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
