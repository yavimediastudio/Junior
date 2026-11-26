import {
  ClubFranchiseMetadata,
  FranchiseCrestEra,
  HeadToHeadEraBreakdown,
  HeadToHeadFranchiseSummary,
  HeadToHeadMatchRecord,
  HeadToHeadSplitStats,
  TournamentStandingsTable,
} from '../types/football';
import { RIVAL_FRANCHISES_CATALOG } from '../data/rivalFranchisesData';
import { getTournamentTeamCrest } from './footballLogic';

const JUNIOR_TEAM_NAME = 'Junior de Barranquilla';

// Build exact alias -> franchiseId lookup map (case- and accent-insensitive)
function normalizeClubKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const ALIAS_TO_FRANCHISE_ID = new Map<string, string>();
const FRANCHISE_BY_ID = new Map<string, ClubFranchiseMetadata>();

for (const franchise of RIVAL_FRANCHISES_CATALOG) {
  FRANCHISE_BY_ID.set(franchise.id, franchise);
  ALIAS_TO_FRANCHISE_ID.set(normalizeClubKey(franchise.name), franchise.id);
  for (const alias of franchise.aliases) {
    ALIAS_TO_FRANCHISE_ID.set(normalizeClubKey(alias), franchise.id);
  }
}

export function resolveClubFranchiseId(teamName: string): string | null {
  return ALIAS_TO_FRANCHISE_ID.get(normalizeClubKey(teamName)) ?? null;
}

export function getClubFranchiseById(franchiseId: string): ClubFranchiseMetadata | undefined {
  return FRANCHISE_BY_ID.get(franchiseId);
}

function isFinalStageLabel(label: string): boolean {
  const cleaned = label.toLowerCase().replace(/finalizaci[oó]n/g, '');
  return (
    cleaned.includes('cuadrangular') ||
    cleaned.includes('cuad.') ||
    cleaned.includes('semifinal') ||
    cleaned.includes('cuartos') ||
    cleaned.includes('octogonal') ||
    cleaned.includes('hexagonal') ||
    cleaned.includes('triangular') ||
    cleaned.includes('final') ||
    cleaned.includes('tercer') ||
    cleaned.includes('desempate') ||
    cleaned.includes('serie extra') ||
    cleaned.includes('bonificación') ||
    cleaned.includes('play-off')
  );
}

/**
 * Extracts 100% of verified Primera A matches played by Junior de Barranquilla
 * across all chronological tournaments (1948–2026), combining matchArchive and
 * any official playoffMatches not already present in matchArchive (such as the
 * 2 official 1968 Tercer Lugar matches vs Millonarios).
 */
export function extractAllJuniorHeadToHeadMatches(
  tables: TournamentStandingsTable[]
): Array<HeadToHeadMatchRecord & { franchiseId: string }> {
  const results: Array<HeadToHeadMatchRecord & { franchiseId: string }> = [];

  for (const table of tables) {
    const archive = table.matchArchive || [];

    const pushMatch = (
      m: {
        round: string;
        date: string;
        venue?: string;
        homeTeam: string;
        awayTeam: string;
        homeScore: number;
        awayScore: number;
        note?: string;
      },
      idx: number,
      sourceTag: 'arch' | 'po'
    ) => {
      const isHome = m.homeTeam === JUNIOR_TEAM_NAME;
      const isAway = m.awayTeam === JUNIOR_TEAM_NAME;
      if (!isHome && !isAway) return;

      const opponentName = isHome ? m.awayTeam : m.homeTeam;
      const franchiseId = resolveClubFranchiseId(opponentName);
      if (!franchiseId) {
        throw new Error(`Unmapped opponent franchise in ${table.id}: "${opponentName}"`);
      }

      const juniorScore = isHome ? m.homeScore : m.awayScore;
      const opponentScore = isHome ? m.awayScore : m.homeScore;
      const outcome: 'W' | 'D' | 'L' =
        juniorScore > opponentScore ? 'W' : juniorScore < opponentScore ? 'L' : 'D';

      results.push({
        id: `${table.id}-${sourceTag}-${idx}`,
        franchiseId,
        tournamentId: table.id,
        year: table.year,
        chronologicalOrder: table.chronologicalOrder,
        tournamentName: table.tournamentName,
        round: m.round,
        date: m.date,
        venue: m.venue || '',
        isHome,
        isFinalPhase: sourceTag === 'po' || isFinalStageLabel(m.round),
        opponentNameAtTime: opponentName,
        opponentCrest: getTournamentTeamCrest(table, opponentName),
        juniorCrest: getTournamentTeamCrest(table, JUNIOR_TEAM_NAME, true),
        juniorScore,
        opponentScore,
        outcome,
        note: m.note,
      });
    };

    archive.forEach((m, idx) => pushMatch(m, idx, 'arch'));

    // Include any verified Junior playoffMatches that are absent from matchArchive
    (table.playoffMatches || []).forEach((pm, idx) => {
      if (pm.homeTeam !== JUNIOR_TEAM_NAME && pm.awayTeam !== JUNIOR_TEAM_NAME) return;
      const alreadyInArchive = archive.some(
        (m) =>
          m.homeTeam === pm.homeTeam &&
          m.awayTeam === pm.awayTeam &&
          m.homeScore === pm.homeScore &&
          m.awayScore === pm.awayScore &&
          (m.date === pm.date || !/todos contra todos|fecha \d+ · (apertura|finalización)/i.test(m.round))
      );
      if (!alreadyInArchive) {
        pushMatch(
          {
            round: pm.stage,
            date: pm.date || table.year,
            venue: pm.venue,
            homeTeam: pm.homeTeam,
            awayTeam: pm.awayTeam,
            homeScore: pm.homeScore,
            awayScore: pm.awayScore,
            note: pm.note || pm.scorers,
          },
          idx,
          'po'
        );
      }
    });
  }

  return results;
}

export function computeHeadToHeadSplitStats(
  matches: HeadToHeadMatchRecord[]
): HeadToHeadSplitStats {
  let pg = 0;
  let pe = 0;
  let pp = 0;
  let gf = 0;
  let gc = 0;
  let biggestWin: HeadToHeadMatchRecord | null = null;
  let biggestLoss: HeadToHeadMatchRecord | null = null;

  for (const m of matches) {
    gf += m.juniorScore;
    gc += m.opponentScore;
    const diff = m.juniorScore - m.opponentScore;

    if (m.outcome === 'W') {
      pg++;
      if (
        !biggestWin ||
        diff > biggestWin.juniorScore - biggestWin.opponentScore ||
        (diff === biggestWin.juniorScore - biggestWin.opponentScore &&
          m.juniorScore > biggestWin.juniorScore) ||
        (diff === biggestWin.juniorScore - biggestWin.opponentScore &&
          m.juniorScore === biggestWin.juniorScore &&
          m.chronologicalOrder > biggestWin.chronologicalOrder)
      ) {
        biggestWin = m;
      }
    } else if (m.outcome === 'L') {
      pp++;
      const lossMargin = m.opponentScore - m.juniorScore;
      const prevMargin = biggestLoss
        ? biggestLoss.opponentScore - biggestLoss.juniorScore
        : -1;
      if (
        !biggestLoss ||
        lossMargin > prevMargin ||
        (lossMargin === prevMargin && m.opponentScore > biggestLoss.opponentScore) ||
        (lossMargin === prevMargin &&
          m.opponentScore === biggestLoss.opponentScore &&
          m.chronologicalOrder > biggestLoss.chronologicalOrder)
      ) {
        biggestLoss = m;
      }
    } else {
      pe++;
    }
  }

  const pj = matches.length;
  const winPct = pj > 0 ? Math.round((pg / pj) * 100) : 0;
  const pointsPct = pj > 0 ? Math.round(((pg * 3 + pe) / (pj * 3)) * 100) : 0;

  return {
    pj,
    pg,
    pe,
    pp,
    gf,
    gc,
    dg: gf - gc,
    winPct,
    pointsPct,
    biggestWin,
    biggestLoss,
  };
}

function computeCurrentStreak(matchesAsc: HeadToHeadMatchRecord[]): string {
  if (matchesAsc.length === 0) return 'Sin partidos';
  const latest = matchesAsc[matchesAsc.length - 1];

  // Check consecutive identical outcomes first
  let sameCount = 0;
  for (let i = matchesAsc.length - 1; i >= 0; i--) {
    if (matchesAsc[i].outcome === latest.outcome) sameCount++;
    else break;
  }

  if (latest.outcome === 'W') {
    if (sameCount >= 2) return `${sameCount} triunfos seguidos de Junior`;
    // Also check unbeaten streak if single win
    let unbeaten = 0;
    for (let i = matchesAsc.length - 1; i >= 0; i--) {
      if (matchesAsc[i].outcome !== 'L') unbeaten++;
      else break;
    }
    return unbeaten >= 2
      ? `${unbeaten} partidos invicto (último triunfo)`
      : 'Último partido ganado por Junior';
  }

  if (latest.outcome === 'L') {
    return sameCount >= 2
      ? `${sameCount} derrotas seguidas ante este rival`
      : 'Último partido ganado por el rival';
  }

  // Latest was draw — report unbeaten or winless context
  let unbeaten = 0;
  for (let i = matchesAsc.length - 1; i >= 0; i--) {
    if (matchesAsc[i].outcome !== 'L') unbeaten++;
    else break;
  }
  if (sameCount >= 2) return `${sameCount} empates consecutivos`;
  return unbeaten >= 2
    ? `${unbeaten} partidos sin perder (último empate)`
    : 'Último partido empatado';
}

function buildCrestGallery(matchesAsc: HeadToHeadMatchRecord[]): FranchiseCrestEra[] {
  const bySrc = new Map<
    string,
    { src: string; alt: string; firstYear: string; lastYear: string; teamName: string }
  >();

  for (const m of matchesAsc) {
    if (!m.opponentCrest) continue;
    const yr = m.year.slice(0, 4);
    const existing = bySrc.get(m.opponentCrest.src);
    if (!existing) {
      bySrc.set(m.opponentCrest.src, {
        src: m.opponentCrest.src,
        alt: m.opponentCrest.alt,
        firstYear: yr,
        lastYear: yr,
        teamName: m.opponentNameAtTime,
      });
    } else {
      existing.lastYear = yr;
      existing.teamName = m.opponentNameAtTime;
    }
  }

  return [...bySrc.values()].map((entry) => {
    // Prefer year range embedded in alt if present, otherwise use match span
    const altRangeMatch = entry.alt.match(/(\d{4}(?:-\d{4}|-Actualidad)?)/i);
    const eraLabel = altRangeMatch
      ? altRangeMatch[1]
      : entry.firstYear === entry.lastYear
      ? entry.firstYear
      : `${entry.firstYear}–${entry.lastYear}`;
    return {
      src: entry.src,
      alt: entry.alt,
      eraLabel,
      teamName: entry.teamName,
    };
  });
}

function buildEraBreakdowns(
  franchise: ClubFranchiseMetadata,
  matchesAsc: HeadToHeadMatchRecord[]
): HeadToHeadEraBreakdown[] {
  // Group matches by opponentNameAtTime (or split Sporting 1950-53 vs 1988-91)
  if (franchise.id === 'sporting-de-barranquilla') {
    const era1 = matchesAsc.filter((m) => m.chronologicalOrder < 196000);
    const era2 = matchesAsc.filter((m) => m.chronologicalOrder >= 196000);
    return [
      {
        eraName: franchise.eras[0].name,
        years: franchise.eras[0].years,
        city: franchise.eras[0].city,
        note: franchise.eras[0].note,
        ...computeHeadToHeadSplitStats(era1),
      },
      {
        eraName: franchise.eras[1].name,
        years: franchise.eras[1].years,
        city: franchise.eras[1].city,
        note: franchise.eras[1].note,
        ...computeHeadToHeadSplitStats(era2),
      },
    ];
  }

  const byAlias = new Map<string, HeadToHeadMatchRecord[]>();
  for (const m of matchesAsc) {
    const arr = byAlias.get(m.opponentNameAtTime) || [];
    arr.push(m);
    byAlias.set(m.opponentNameAtTime, arr);
  }

  // Order breakdowns chronologically by first match year
  return [...byAlias.entries()]
    .sort((a, b) => a[1][0].chronologicalOrder - b[1][0].chronologicalOrder)
    .map(([aliasName, aliasMatches]) => {
      const matchedEra = franchise.eras.find(
        (e) =>
          normalizeClubKey(e.name) === normalizeClubKey(aliasName) ||
          normalizeClubKey(e.name).includes(normalizeClubKey(aliasName))
      );
      const firstYr = aliasMatches[0].year;
      const lastYr = aliasMatches[aliasMatches.length - 1].year;
      const stats = computeHeadToHeadSplitStats(aliasMatches);
      return {
        eraName: aliasName,
        years: matchedEra?.years || (firstYr === lastYr ? firstYr : `${firstYr}–${lastYr}`),
        city: matchedEra?.city || franchise.city,
        note: matchedEra?.note,
        pj: stats.pj,
        pg: stats.pg,
        pe: stats.pe,
        pp: stats.pp,
        gf: stats.gf,
        gc: stats.gc,
      };
    });
}

/**
 * Builds the complete, deterministic list of all 40 unified Head-to-Head franchises
 * faced by Junior de Barranquilla in Primera A (1948–2026), ordered by total matches descending.
 */
export function buildAllHeadToHeadFranchises(
  tables: TournamentStandingsTable[]
): HeadToHeadFranchiseSummary[] {
  const allMatches = extractAllJuniorHeadToHeadMatches(tables);
  const grouped = new Map<string, HeadToHeadMatchRecord[]>();

  for (const m of allMatches) {
    const { franchiseId, ...record } = m;
    const list = grouped.get(franchiseId) || [];
    list.push(record);
    grouped.set(franchiseId, list);
  }

  const summaries: HeadToHeadFranchiseSummary[] = RIVAL_FRANCHISES_CATALOG.map((franchise) => {
    const matchesAsc = grouped.get(franchise.id) || [];
    const homeMatches = matchesAsc.filter((m) => m.isHome);
    const awayMatches = matchesAsc.filter((m) => !m.isHome);

    const overall = computeHeadToHeadSplitStats(matchesAsc);
    const home = computeHeadToHeadSplitStats(homeMatches);
    const away = computeHeadToHeadSplitStats(awayMatches);
    const crestGallery = buildCrestGallery(matchesAsc);
    const primaryCrest =
      crestGallery.length > 0
        ? {
            src: crestGallery[crestGallery.length - 1].src,
            alt: crestGallery[crestGallery.length - 1].alt,
          }
        : null;

    return {
      franchise,
      matches: matchesAsc,
      overall,
      home,
      away,
      eraBreakdowns: buildEraBreakdowns(franchise, matchesAsc),
      crestGallery,
      primaryCrest,
      firstYear: matchesAsc.length > 0 ? matchesAsc[0].year : '',
      lastYear: matchesAsc.length > 0 ? matchesAsc[matchesAsc.length - 1].year : '',
      currentStreak: computeCurrentStreak(matchesAsc),
      lastMatch: matchesAsc.length > 0 ? matchesAsc[matchesAsc.length - 1] : null,
    };
  });

  return summaries.sort((a, b) => {
    if (b.overall.pj !== a.overall.pj) return b.overall.pj - a.overall.pj;
    return a.franchise.name.localeCompare(b.franchise.name, 'es');
  });
}

export interface HeadToHeadMatchFilterOptions {
  venue: 'todos' | 'local' | 'visitante';
  outcome: 'todos' | 'W' | 'D' | 'L';
  phase: 'todas' | 'regular' | 'final';
  eraName: string; // 'todos' or exact opponentNameAtTime
  sortOrder: 'desc' | 'asc';
}

export function filterHeadToHeadMatches(
  matchesAsc: HeadToHeadMatchRecord[],
  options: HeadToHeadMatchFilterOptions
): HeadToHeadMatchRecord[] {
  const filtered = matchesAsc.filter((m) => {
    if (options.venue === 'local' && !m.isHome) return false;
    if (options.venue === 'visitante' && m.isHome) return false;
    if (options.outcome !== 'todos' && m.outcome !== options.outcome) return false;
    if (options.phase === 'regular' && m.isFinalPhase) return false;
    if (options.phase === 'final' && !m.isFinalPhase) return false;
    if (options.eraName !== 'todos') {
      if (options.eraName === 'Sporting de Barranquilla (Primera Era)') {
        if (m.chronologicalOrder >= 196000) return false;
      } else if (options.eraName === 'Sporting de Barranquilla (Segunda Era)') {
        if (m.chronologicalOrder < 196000) return false;
      } else if (m.opponentNameAtTime !== options.eraName) {
        return false;
      }
    }
    return true;
  });

  return options.sortOrder === 'desc' ? [...filtered].reverse() : filtered;
}
