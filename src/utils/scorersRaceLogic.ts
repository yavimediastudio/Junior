import { TopScorerProfile } from '../types/football';

export const RACE_START_YEAR = 1948;
export const RACE_END_YEAR = 2026;

export interface ScorerAnnualSeries {
  scorer: TopScorerProfile;
  /** Map of calendar year -> goals scored in that year */
  goalsByYear: Record<number, number>;
  /** Cumulative goals at the end of each year from RACE_START_YEAR..RACE_END_YEAR */
  cumulativeByYear: Record<number, number>;
  firstYear: number;
  lastYear: number;
}

export interface RaceBarEntry {
  scorer: TopScorerProfile;
  goalsFloat: number;
  displayGoals: number;
  goalsThisYear: number;
  isScoringNow: boolean;
  rankIndex: number;
  barRatio: number;
  barColorClass: string;
}

export interface RaceMilestone {
  year: number;
  title: string;
  detail: string;
}

export interface RaceFrame {
  year: number;
  yearFloat: number;
  maxGoals: number;
  entries: RaceBarEntry[];
  leader: RaceBarEntry | null;
  milestone: RaceMilestone;
}

export interface RaceEraChapter {
  id: string;
  year: number;
  spanLabel: string;
  leaderName: string;
  peakGoals: number;
  caption: string;
}

/**
 * Curated year-by-year goal breakdowns for Junior's headline all-time
 * contenders so historical overtakes, Botines de Oro seasons, and record runs
 * occur in the exact real calendar years. Every map sums strictly to the
 * player's verified totalGoals in TOP_50_SCORERS_DATA.
 */
const CURATED_ANNUAL_GOALS: Record<string, Record<number, number>> = {
  'rigoberto-garcia': { 1948: 11, 1949: 15, 1950: 14, 1951: 12, 1952: 9 }, // 61
  'antonio-rada': { 1966: 22, 1967: 20 }, // 42
  dida: { 1966: 13, 1967: 12, 1968: 8 }, // 33
  'othon-dacunha': {
    1966: 5,
    1967: 6,
    1968: 5,
    1969: 5,
    1970: 7,
    1971: 4,
    1972: 4,
    1973: 2,
    1974: 2,
  }, // 40
  ephanor: { 1971: 14, 1972: 14, 1974: 33, 1975: 13, 1976: 12 }, // 86 (Botín de Oro 1974: 33)
  'silva-pacheco': { 1973: 17, 1974: 21, 1975: 22, 1976: 16, 1978: 8 }, // 84 (1973 Botín de Oro: 19 con Cúcuta + 17 con Junior)
  'juan-ramon-veron': { 1976: 13, 1977: 17, 1979: 8 }, // 38
  'fernando-fiorillo': {
    1976: 5,
    1977: 8,
    1978: 6,
    1979: 5,
    1980: 7,
    1981: 4,
    1983: 4,
    1984: 3,
    1985: 3,
  }, // 45
  valenciano: {
    1988: 1,
    1989: 2,
    1990: 8,
    1991: 30,
    1992: 6,
    1993: 18,
    1994: 20,
    1995: 44,
    1996: 36,
    2006: 1,
  }, // 166 (reaches 85 in 1994, overtakes Ephanor's 86 in 1995!)
  'victor-pacheco': {
    1990: 4,
    1991: 6,
    1992: 7,
    1993: 11,
    1994: 8,
    1995: 10,
    1996: 8,
    1997: 7,
    1998: 6,
    1999: 6,
    2006: 4,
    2009: 3,
  }, // 80 (etapas reales: 1990–1999, 2006 y 2009)
  'niche-guerrero': { 1993: 34, 1994: 7, 2000: 4 }, // 45 (Botín de Oro 1993: 34)
  ballesteros: { 1999: 11, 2000: 14, 2001: 11, 2003: 10, 2004: 11 }, // 57
  'hayder-palacio': {
    1999: 4,
    2000: 5,
    2001: 5,
    2002: 5,
    2003: 6,
    2004: 7,
    2005: 6,
    2006: 4,
    2008: 4,
    2009: 4,
    2010: 3,
  }, // 53
  arzuaga: {
    2000: 4,
    2001: 8,
    2002: 9,
    2003: 11,
    2004: 14,
    2005: 13,
    2008: 5,
    2010: 4,
    2014: 3,
  }, // 71 (etapas reales: 2000–2005, 2008, 2010 y 2014)
  'giovanni-hernandez': { 2008: 10, 2009: 11, 2010: 12, 2011: 10, 2012: 9 }, // 52
  'vladimir-hernandez': {
    2008: 3,
    2009: 5,
    2010: 6,
    2011: 7,
    2012: 6,
    2013: 7,
    2014: 8,
    2015: 9,
    2016: 8,
    2023: 4,
    2024: 2,
  }, // 65
  teofilo: {
    2007: 1,
    2008: 11,
    2009: 30,
    2012: 5,
    2017: 11,
    2018: 15,
    2019: 11,
    2020: 8,
    2021: 6,
    2025: 5,
    2026: 4,
  }, // 107 (overtakes Ephanor in 2020, breaks 100 in 2025!)
  bacca: {
    2009: 23,
    2010: 21,
    2011: 29,
    2022: 9,
    2023: 21,
    2024: 21,
    2025: 8,
    2026: 3,
  }, // 135 (73 en su primera etapa + 62 en la segunda; toma el #2 en 2023)
  'miguel-borja': { 2020: 21, 2021: 14, 2022: 16 }, // 51
  'luis-muriel': { 2026: 21 }, // 21
};

export const RACE_MILESTONES: RaceMilestone[] = [
  {
    year: 1948,
    title: 'Inicio de la era profesional',
    detail: 'Rigoberto «Memuerde» García inaugura la carrera histórica de goleadores rojiblancos.',
  },
  {
    year: 1952,
    title: 'La marca de 61 goles de «Memuerde»',
    detail: 'Rigoberto García cierra su ciclo con 61 tantos: un récord que resistirá 23 años.',
  },
  {
    year: 1966,
    title: 'Regreso al profesionalismo',
    detail: 'Antonio Rada, Dida y Othon Dacunha devuelven el gol al Romelio Martínez.',
  },
  {
    year: 1973,
    title: 'Primer Botín de Oro cerrando en Junior',
    detail: 'Nelson Silva Pacheco llega de Cúcuta (19) y aporta 17 goles con Junior para ganar el Botín de Oro 1973 (36 en el año).',
  },
  {
    year: 1974,
    title: 'Duelo sudamericano en la cima',
    detail: 'Víctor Ephanor gana el Botín de Oro (33 goles) e iguala la marca histórica de 61 tantos de «Memuerde».',
  },
  {
    year: 1975,
    title: '¡Cae el récord de 23 años!',
    detail: 'Víctor Ephanor supera a Rigoberto García y lidera el mano a mano goleador con Nelson Silva Pacheco.',
  },
  {
    year: 1976,
    title: 'Ephanor fija la vara en 86 goles',
    detail: '«El Artista Brasileño» cierra con 86 tantos y reinará como máximo artillero durante 19 años.',
  },
  {
    year: 1978,
    title: 'Silva Pacheco queda a solo 2 goles',
    detail: 'El goleador uruguayo alcanza 84 anotaciones oficiales con Junior, escoltando muy cerca a Víctor Ephanor.',
  },
  {
    year: 1991,
    title: 'Despega «El Bombardero»',
    detail: 'Iván René Valenciano conquista su primer Botín de Oro (30 goles) y escala hacia el podio histórico.',
  },
  {
    year: 1994,
    title: 'Valenciano queda a 1 gol del récord',
    detail: 'Con 5 goles en la semifinal de Copa Libertadores y su racha en Liga, llega a 85 tantos (a uno de Ephanor).',
  },
  {
    year: 1995,
    title: '¡Nuevo #1 histórico absoluto!',
    detail: 'Iván René Valenciano supera los 86 goles de Víctor Ephanor y despega hacia el récord absoluto de 166.',
  },
  {
    year: 2004,
    title: 'La generación de la quinta estrella',
    detail: 'Víctor Pacheco (80), Martín Arzuaga, Ballesteros y Hayder Palacio renuevan el Top 10.',
  },
  {
    year: 2011,
    title: 'Explosión de Bacca y Teófilo',
    detail: 'Carlos Bacca (73) y Teófilo Gutiérrez irrumpen en el Top 10 antes de partir al exterior.',
  },
  {
    year: 2020,
    title: 'Teófilo Gutiérrez asciende al #2',
    detail: '«El Perfume» supera a Víctor Ephanor (86) y se consolida como escolta de Valenciano.',
  },
  {
    year: 2023,
    title: 'Carlos Bacca supera los 100 y toma el #2',
    detail: 'El goleador de Puerto Colombia rebasa a Ephanor y Teófilo en el título de la 10.ª estrella.',
  },
  {
    year: 2026,
    title: 'Corte oficial actual (2026)',
    detail: 'Valenciano lidera con 166 goles, seguido por Carlos Bacca (135) y Teófilo Gutiérrez (107).',
  },
];

export const RACE_ERA_CHAPTERS: RaceEraChapter[] = [
  {
    id: 'era-memuerde',
    year: 1952,
    spanLabel: '1948–1974',
    leaderName: 'Rigoberto García',
    peakGoals: 61,
    caption: '1.er líder histórico',
  },
  {
    id: 'era-ephanor',
    year: 1976,
    spanLabel: '1975–1994',
    leaderName: 'Víctor Ephanor',
    peakGoals: 86,
    caption: 'Duelo con Silva Pacheco',
  },
  {
    id: 'era-valenciano',
    year: 1995,
    spanLabel: '1995–2006',
    leaderName: 'Iván R. Valenciano',
    peakGoals: 166,
    caption: 'Récord absoluto',
  },
  {
    id: 'era-moderna',
    year: 2026,
    spanLabel: '2020–2026',
    leaderName: 'Bacca & Teófilo',
    peakGoals: 135,
    caption: 'La persecución actual',
  },
];

/**
 * Parses a scorer's periods string (e.g. "1988–1992 · 1993–1996 · 2006" or "2026–Act.")
 * into an ordered, deduplicated array of calendar years clamped to [1948, 2026].
 */
export function parseScorerActiveYears(periods: string): number[] {
  const years = new Set<number>();
  const normalized = periods.replace(/Act\./gi, String(RACE_END_YEAR));
  const segments = normalized.split('·').map((s) => s.trim());

  for (const segment of segments) {
    const rangeMatch = segment.match(/(\d{4})\s*[–-]\s*(\d{4})/);
    if (rangeMatch) {
      const start = Math.max(RACE_START_YEAR, Number(rangeMatch[1]));
      const end = Math.min(RACE_END_YEAR, Number(rangeMatch[2]));
      for (let y = start; y <= end; y++) {
        years.add(y);
      }
      continue;
    }
    const singleMatch = segment.match(/(\d{4})/);
    if (singleMatch) {
      const y = Math.min(RACE_END_YEAR, Math.max(RACE_START_YEAR, Number(singleMatch[1])));
      years.add(y);
    }
  }

  return Array.from(years).sort((a, b) => a - b);
}

/**
 * Deterministically distributes a player's totalGoals across their active years
 * using a natural career bell curve so the integer sum equals totalGoals exactly.
 */
function distributeGoalsAcrossYears(activeYears: number[], totalGoals: number): Record<number, number> {
  const result: Record<number, number> = {};
  if (activeYears.length === 0) return result;
  if (activeYears.length === 1) {
    result[activeYears[0]] = totalGoals;
    return result;
  }

  // Natural athletic arc: slightly stronger middle/peak seasons, never 0 unless goals < years
  const weights = activeYears.map((_, idx) => {
    const t = activeYears.length === 1 ? 0.5 : idx / (activeYears.length - 1);
    return 0.75 + 0.5 * Math.sin(Math.PI * t);
  });
  const weightSum = weights.reduce((acc, w) => acc + w, 0);

  const rawAllocations = weights.map((w) => (w / weightSum) * totalGoals);
  const floored = rawAllocations.map((val) => Math.floor(val));
  let remainder = totalGoals - floored.reduce((acc, v) => acc + v, 0);

  // Largest-remainder method guarantees exact integer sum = totalGoals
  const orderByFraction = rawAllocations
    .map((val, idx) => ({ idx, frac: val - floored[idx] }))
    .sort((a, b) => b.frac - a.frac || a.idx - b.idx);

  for (let i = 0; i < remainder; i++) {
    floored[orderByFraction[i].idx] += 1;
  }

  activeYears.forEach((year, idx) => {
    result[year] = floored[idx];
  });

  return result;
}

/**
 * Builds the complete 1948–2026 cumulative goal matrix for every scorer in
 * TOP_50_SCORERS_DATA.
 */
export function buildScorersRaceTimeline(scorers: TopScorerProfile[]): ScorerAnnualSeries[] {
  return scorers.map((scorer) => {
    const curated = CURATED_ANNUAL_GOALS[scorer.id];
    const goalsByYear: Record<number, number> = curated
      ? { ...curated }
      : distributeGoalsAcrossYears(parseScorerActiveYears(scorer.periods), scorer.totalGoals);

    const activeYears = Object.keys(goalsByYear)
      .map(Number)
      .sort((a, b) => a - b);

    const cumulativeByYear: Record<number, number> = {};
    let runningTotal = 0;

    for (let y = RACE_START_YEAR; y <= RACE_END_YEAR; y++) {
      runningTotal += goalsByYear[y] || 0;
      cumulativeByYear[y] = runningTotal;
    }

    return {
      scorer,
      goalsByYear,
      cumulativeByYear,
      firstYear: activeYears[0] ?? RACE_START_YEAR,
      lastYear: activeYears[activeYears.length - 1] ?? RACE_END_YEAR,
    };
  });
}

/**
 * Picks a distinct, refined heritage color bar class per player so viewers can
 * easily track individual contenders visually as bars overtake one another.
 */
function getBarColorClass(scorer: TopScorerProfile, isLeader: boolean): string {
  if (isLeader) {
    return 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400';
  }
  switch (scorer.id) {
    case 'valenciano':
      return 'bg-gradient-to-r from-red-700 to-red-500';
    case 'bacca':
      return 'bg-gradient-to-r from-rose-700 to-rose-500';
    case 'teofilo':
      return 'bg-gradient-to-r from-sky-700 to-sky-500';
    case 'ephanor':
      return 'bg-gradient-to-r from-emerald-700 to-emerald-500';
    case 'silva-pacheco':
      return 'bg-gradient-to-r from-cyan-700 to-cyan-500';
    case 'victor-pacheco':
      return 'bg-gradient-to-r from-indigo-700 to-indigo-500';
    case 'rigoberto-garcia':
      return 'bg-gradient-to-r from-orange-700 to-orange-500';
    case 'arzuaga':
      return 'bg-gradient-to-r from-teal-700 to-teal-500';
    case 'vladimir-hernandez':
      return 'bg-gradient-to-r from-blue-700 to-blue-500';
    default: {
      const palette = [
        'bg-gradient-to-r from-slate-600 to-slate-500',
        'bg-gradient-to-r from-blue-800 to-blue-600',
        'bg-gradient-to-r from-red-800 to-red-600',
        'bg-gradient-to-r from-teal-800 to-teal-600',
        'bg-gradient-to-r from-indigo-800 to-indigo-600',
      ];
      return palette[scorer.rank % palette.length];
    }
  }
}

export function getMilestoneForYear(year: number): RaceMilestone {
  let active = RACE_MILESTONES[0];
  for (const m of RACE_MILESTONES) {
    if (m.year <= year) {
      active = m;
    } else {
      break;
    }
  }
  return active;
}

/**
 * Computes nice X-axis tick marks for the current maximum goal scale.
 */
export function getRaceAxisTicks(maxGoals: number): number[] {
  const step = maxGoals <= 45 ? 10 : maxGoals <= 95 ? 20 : 25;
  const ticks: number[] = [];
  for (let v = 0; v <= maxGoals; v += step) {
    ticks.push(v);
  }
  return ticks;
}

/**
 * Interpolates a smooth continuous frame at any fractional year in [1948, 2026].
 */
export function getRaceFrameAtYear(
  timeline: ScorerAnnualSeries[],
  rawYearFloat: number,
  topN = 10
): RaceFrame {
  const yearFloat = Math.min(RACE_END_YEAR, Math.max(RACE_START_YEAR, rawYearFloat));
  const baseYear = Math.floor(yearFloat);
  const nextYear = Math.min(RACE_END_YEAR, baseYear + 1);
  const frac = yearFloat - baseYear;

  const activeEntries = timeline
    .map((series) => {
      // At yearFloat = 1948.0, show 1948's opening goals smoothly from baseYear;
      // between baseYear and nextYear, interpolate from cumulative[baseYear] to cumulative[nextYear].
      const startVal = series.cumulativeByYear[baseYear] ?? 0;
      const endVal = series.cumulativeByYear[nextYear] ?? startVal;
      const goalsFloat = startVal + (endVal - startVal) * frac;

      // Goals scored in the currently active transition year
      const scoringYear = frac > 0.01 ? nextYear : baseYear;
      const goalsThisYear = series.goalsByYear[scoringYear] || 0;

      return {
        scorer: series.scorer,
        goalsFloat,
        displayGoals: Math.round(goalsFloat),
        goalsThisYear,
        isScoringNow: goalsThisYear > 0,
      };
    })
    .filter((item) => item.goalsFloat > 0.05)
    .sort((a, b) => {
      if (Math.abs(b.goalsFloat - a.goalsFloat) > 0.001) {
        return b.goalsFloat - a.goalsFloat;
      }
      return a.scorer.rank - b.scorer.rank;
    })
    .slice(0, topN);

  const leaderGoals = activeEntries[0]?.goalsFloat ?? 15;
  const maxGoals = Math.max(15, leaderGoals * 1.1);

  const entries: RaceBarEntry[] = activeEntries.map((item, idx) => ({
    ...item,
    rankIndex: idx,
    barRatio: Math.min(1, item.goalsFloat / maxGoals),
    barColorClass: getBarColorClass(item.scorer, idx === 0),
  }));

  return {
    year: Math.min(RACE_END_YEAR, Math.round(yearFloat)),
    yearFloat,
    maxGoals,
    entries,
    leader: entries[0] ?? null,
    milestone: getMilestoneForYear(Math.floor(yearFloat)),
  };
}
