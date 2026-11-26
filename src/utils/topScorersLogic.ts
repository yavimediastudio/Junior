import {
  ScorerEraBucket,
  ScorerSortKey,
  ScorerSpecialFilter,
  TopScorerProfile,
} from '../types/football';

export interface TopScorersFilterOptions {
  era: ScorerEraBucket;
  special: ScorerSpecialFilter;
  sortBy: ScorerSortKey;
  query: string;
}

export function normalizeScorerQuery(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getInternationalGoals(scorer: TopScorerProfile): number {
  return (
    scorer.breakdown.libertadores +
    scorer.breakdown.sudamericana +
    scorer.breakdown.conmebol
  );
}

export function getBreakdownSum(scorer: TopScorerProfile): number {
  return (
    scorer.breakdown.liga +
    scorer.breakdown.copa +
    scorer.breakdown.superliga +
    scorer.breakdown.libertadores +
    scorer.breakdown.sudamericana +
    scorer.breakdown.conmebol
  );
}

export function getScorerInitials(name: string): string {
  const parts = name
    .replace(/[«»""']/g, '')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !['de', 'del', 'la', 'los', 'las', 'da', 'do'].includes(w.toLowerCase()));
  if (parts.length === 0) return 'JR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getScorerEraCounts(
  scorers: TopScorerProfile[]
): Record<ScorerEraBucket, number> {
  const counts: Record<ScorerEraBucket, number> = {
    todos: scorers.length,
    '1948-1979': 0,
    '1980-1999': 0,
    '2000-2014': 0,
    '2015-2026': 0,
  };
  for (const s of scorers) {
    counts[s.eraBucket] += 1;
  }
  return counts;
}

export function filterTopScorers(
  scorers: TopScorerProfile[],
  options: TopScorersFilterOptions
): TopScorerProfile[] {
  const cleanQuery = normalizeScorerQuery(options.query);

  const filtered = scorers.filter((s) => {
    if (options.era !== 'todos' && s.eraBucket !== options.era) {
      return false;
    }
    if (options.special === 'foto-archivo' && !s.photoUrl) {
      return false;
    }
    if (options.special === 'botin-oro' && (!s.goldenBoots || s.goldenBoots.length === 0)) {
      return false;
    }
    if (options.special === 'extranjeros' && s.countryCode === 'COL') {
      return false;
    }
    if (options.special === 'activos' && !s.isActiveAtClub) {
      return false;
    }

    if (!cleanQuery) return true;

    const haystack = normalizeScorerQuery(
      [
        `#${s.rank}`,
        String(s.rank),
        s.name,
        s.nickname || '',
        s.nationality,
        s.countryCode,
        s.position,
        s.periods,
        s.titlesNote || '',
        s.bio,
      ].join(' ')
    );

    const tokens = cleanQuery.split(' ').filter(Boolean);
    return tokens.every((tok) => haystack.includes(tok));
  });

  const sorted = [...filtered];
  if (options.sortBy === 'liga') {
    sorted.sort((a, b) => b.breakdown.liga - a.breakdown.liga || a.rank - b.rank);
  } else if (options.sortBy === 'internacional') {
    sorted.sort(
      (a, b) => getInternationalGoals(b) - getInternationalGoals(a) || a.rank - b.rank
    );
  } else {
    sorted.sort((a, b) => a.rank - b.rank);
  }

  return sorted;
}

export function getAdjacentScorers(
  list: TopScorerProfile[],
  currentId: string
): { prev: TopScorerProfile | null; next: TopScorerProfile | null } {
  const idx = list.findIndex((s) => s.id === currentId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  };
}
