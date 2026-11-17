import { LeagueStanding, MatchFixture } from '../types/football';

/**
 * Sorts league standings according to official Dimayor tiebreaker rules:
 * 1. Points (pts) descending
 * 2. Goal Difference (dg) descending
 * 3. Goals For (gf) descending
 * 4. Alphabetical by team name
 */
export function sortLeagueStandings(standings: LeagueStanding[]): LeagueStanding[] {
  const sorted = [...standings].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });

  return sorted.map((item, index) => ({
    ...item,
    pos: index + 1,
  }));
}

export type FormationType = '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2';

export interface FormationSpot {
  index: number;
  role: string;
  defaultPosition: 'Arquero' | 'Defensa' | 'Volante' | 'Delantero';
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
}

/**
 * Provides percentage coordinates (x: 0-100%, y: 0-100%) for 11 players on a vertical pitch
 */
export function getFormationCoordinates(formation: FormationType): FormationSpot[] {
  switch (formation) {
    case '4-3-3':
      return [
        { index: 0, role: 'POR', defaultPosition: 'Arquero', x: 50, y: 88 },
        { index: 1, role: 'LI', defaultPosition: 'Defensa', x: 15, y: 70 },
        { index: 2, role: 'DFC', defaultPosition: 'Defensa', x: 38, y: 72 },
        { index: 3, role: 'DFC', defaultPosition: 'Defensa', x: 62, y: 72 },
        { index: 4, role: 'LD', defaultPosition: 'Defensa', x: 85, y: 70 },
        { index: 5, role: 'MCD', defaultPosition: 'Volante', x: 50, y: 52 },
        { index: 6, role: 'MC', defaultPosition: 'Volante', x: 28, y: 44 },
        { index: 7, role: 'MC', defaultPosition: 'Volante', x: 72, y: 44 },
        { index: 8, role: 'EI', defaultPosition: 'Delantero', x: 20, y: 22 },
        { index: 9, role: 'DC', defaultPosition: 'Delantero', x: 50, y: 18 },
        { index: 10, role: 'ED', defaultPosition: 'Delantero', x: 80, y: 22 },
      ];

    case '4-2-3-1':
      return [
        { index: 0, role: 'POR', defaultPosition: 'Arquero', x: 50, y: 88 },
        { index: 1, role: 'LI', defaultPosition: 'Defensa', x: 15, y: 70 },
        { index: 2, role: 'DFC', defaultPosition: 'Defensa', x: 38, y: 72 },
        { index: 3, role: 'DFC', defaultPosition: 'Defensa', x: 62, y: 72 },
        { index: 4, role: 'LD', defaultPosition: 'Defensa', x: 85, y: 70 },
        { index: 5, role: 'MCD', defaultPosition: 'Volante', x: 35, y: 54 },
        { index: 6, role: 'MCD', defaultPosition: 'Volante', x: 65, y: 54 },
        { index: 7, role: 'MI', defaultPosition: 'Volante', x: 20, y: 35 },
        { index: 8, role: 'MCO', defaultPosition: 'Volante', x: 50, y: 34 },
        { index: 9, role: 'MD', defaultPosition: 'Volante', x: 80, y: 35 },
        { index: 10, role: 'DC', defaultPosition: 'Delantero', x: 50, y: 18 },
      ];

    case '4-4-2':
      return [
        { index: 0, role: 'POR', defaultPosition: 'Arquero', x: 50, y: 88 },
        { index: 1, role: 'LI', defaultPosition: 'Defensa', x: 15, y: 70 },
        { index: 2, role: 'DFC', defaultPosition: 'Defensa', x: 38, y: 72 },
        { index: 3, role: 'DFC', defaultPosition: 'Defensa', x: 62, y: 72 },
        { index: 4, role: 'LD', defaultPosition: 'Defensa', x: 85, y: 70 },
        { index: 5, role: 'MI', defaultPosition: 'Volante', x: 18, y: 46 },
        { index: 6, role: 'MC', defaultPosition: 'Volante', x: 40, y: 48 },
        { index: 7, role: 'MC', defaultPosition: 'Volante', x: 60, y: 48 },
        { index: 8, role: 'MD', defaultPosition: 'Volante', x: 82, y: 46 },
        { index: 9, role: 'DC', defaultPosition: 'Delantero', x: 38, y: 20 },
        { index: 10, role: 'DC', defaultPosition: 'Delantero', x: 62, y: 20 },
      ];

    case '3-5-2':
      return [
        { index: 0, role: 'POR', defaultPosition: 'Arquero', x: 50, y: 88 },
        { index: 1, role: 'DFC', defaultPosition: 'Defensa', x: 25, y: 72 },
        { index: 2, role: 'DFC', defaultPosition: 'Defensa', x: 50, y: 74 },
        { index: 3, role: 'DFC', defaultPosition: 'Defensa', x: 75, y: 72 },
        { index: 4, role: 'CRI', defaultPosition: 'Volante', x: 12, y: 48 },
        { index: 5, role: 'MC', defaultPosition: 'Volante', x: 35, y: 52 },
        { index: 6, role: 'MC', defaultPosition: 'Volante', x: 65, y: 52 },
        { index: 7, role: 'CRD', defaultPosition: 'Volante', x: 88, y: 48 },
        { index: 8, role: 'MCO', defaultPosition: 'Volante', x: 50, y: 36 },
        { index: 9, role: 'DC', defaultPosition: 'Delantero', x: 38, y: 20 },
        { index: 10, role: 'DC', defaultPosition: 'Delantero', x: 62, y: 20 },
      ];
  }
}

/**
 * Computes trivia badge, title and explanation from user score
 */
export function calculateQuizRank(score: number, total: number): {
  tier: 'oro' | 'plata' | 'bronce' | 'novato';
  title: string;
  badge: string;
  description: string;
} {
  const percentage = total > 0 ? (score / total) * 100 : 0;

  if (percentage >= 87.5) {
    return {
      tier: 'oro',
      title: 'Capitán Tiburón de Oro',
      badge: '🦈 ⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️',
      description: '¡Conocimiento enciclopédico de las 12 estrellas de Liga! Eres un currambero de pura cepa digno del banco técnico de Julio Comesaña y el Flaco Meléndez.',
    };
  }
  if (percentage >= 62.5) {
    return {
      tier: 'plata',
      title: 'Juniorista de Corazón',
      badge: '🔴⚪️ Tribuna Sur Fiel',
      description: '¡Gran memoria rojiblanca! Llevas la sangre y la historia de Los Tiburones en el pecho.',
    };
  }
  if (percentage >= 37.5) {
    return {
      tier: 'bronce',
      title: 'Hincha Fiel en Formación',
      badge: '🎟️ Boleto Oriental',
      description: 'Buen intento. Conoces las grandes gestas, pero te falta un repaso a los detalles del Romelio Martínez y las finales.',
    };
  }
  return {
    tier: 'novato',
    title: 'Pichón de Tiburón',
    badge: '🌊 Mar Caribe',
    description: 'Estás empezando a conocer la historia de Junior Tu Papá. ¡Explora las 12 estrellas y el museo de camisetas!',
  };
}

/**
 * Computes win percentage for head-to-head records
 */
export function calculateWinPercentage(wins: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((wins / total) * 100);
}

/**
 * Filters fixtures by competition
 */
export function filterFixturesByCompetition(
  fixtures: MatchFixture[],
  competition?: string
): MatchFixture[] {
  if (!competition || competition === 'Todas') return fixtures;
  return fixtures.filter((f) => f.competition === competition);
}

/**
 * Web Audio API synthesizer for authentic stadium sound effects:
 * - 'drum': Stadium bombo / repique beat
 * - 'cheer': Stadium roar / noise burst
 * - 'whistle': Referee whistle
 */
export function playStadiumAudio(type: 'drum' | 'cheer' | 'whistle'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'drum') {
      // Bass drum simulation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'cheer') {
      // Crowd cheer noise buffer
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.4));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'whistle') {
      // Dual-tone referee whistle
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(2600, ctx.currentTime);
      osc2.frequency.setValueAtTime(2800, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    }
  } catch {
    // Audio context not allowed or unsupported in some environments
  }
}

/**
 * Classifies if a tournament campaign resulted in Junior winning the championship (Estrella).
 * Resolves substring collisions where 'SUBCAMPEÓN' contains the text 'CAMPEÓN'.
 */
export function isJuniorChampionTournament(t: {
  championTeam: string;
  juniorFinish: string;
  isJuniorChampion?: boolean;
}): boolean {
  if (t.isJuniorChampion === true) return true;
  if (t.isJuniorChampion === false) return false;
  const champ = (t.championTeam || '').trim().toLowerCase();
  return champ.includes('junior');
}

/**
 * Classifies if a tournament campaign resulted in Junior being the official runner-up (Subcampeón).
 */
export function isJuniorRunnerUpTournament(t: {
  championTeam: string;
  juniorFinish: string;
  isJuniorChampion?: boolean;
  isJuniorRunnerUp?: boolean;
}): boolean {
  if (isJuniorChampionTournament(t)) return false;
  if (t.isJuniorRunnerUp === true) return true;
  if (t.isJuniorRunnerUp === false) return false;
  const finish = (t.juniorFinish || '').toUpperCase();
  return finish.includes('SUBCAMPEÓN') || finish.includes('SUBCAMPEON');
}

/**
 * Classifies row status badge styling: champion vs runner-up vs classified.
 */
export function isChampionStatusBadge(statusBadge?: string): boolean {
  if (!statusBadge) return false;
  const upper = statusBadge.toUpperCase();
  const hasChampion = upper.includes('CAMPEÓN') || upper.includes('CAMPEON');
  const hasRunnerUp = upper.includes('SUBCAMPEÓN') || upper.includes('SUBCAMPEON');
  return hasChampion && !hasRunnerUp;
}

export function isRunnerUpStatusBadge(statusBadge?: string): boolean {
  if (!statusBadge) return false;
  const upper = statusBadge.toUpperCase();
  return upper.includes('SUBCAMPEÓN') || upper.includes('SUBCAMPEON');
}

/**
 * Returns whether a tournament only had a single regular phase (no final phase / play-offs).
 */
export function isSinglePhaseTournament(t: { hasFinalPhase?: boolean }): boolean {
  return t.hasFinalPhase === false;
}

/**
 * Returns the Junior crest image asset path to display for a given tournament table.
 * Uses the 1948 historical crest exclusively for the 1948 inaugural championship.
 */
export function getTournamentJuniorCrest(t: { id?: string; year?: string }): {
  src: string;
  alt: string;
} {
  const is1948 = t.id === '1948-inaugural' || t.year === '1948';
  if (is1948) {
    return {
      src: '/assets/aistudio/ESCUDO_JUNIOR_1948_106008e2.png',
      alt: 'Escudo Histórico Junior 1948',
    };
  }
  return {
    src: '/assets/aistudio/image_82370351.png',
    alt: 'Escudo Oficial Junior',
  };
}

/**
 * Returns the team crest asset to display inside a specific tournament table/match card.
 * - Junior: uses 1948 crest in 1948, and official Junior crest across all tournaments.
 * - Santa Fe: uses 1948-1950 CISF historical crest strictly for 1948-1950 tables.
 * - Deportes Caldas: uses 1947-1950 historical crest strictly for 1947-1950 tables.
 * - Millonarios: uses 1947-1955 historical crest for 1947-1955 tables (including 1953 table in receso).
 * - Atlético Municipal: uses 1947-1950 historical crest strictly for 1947-1950 tables.
 * - América de Cali: uses 1940-1961 historical crest strictly for 1940-1961 tables.
 * - Independiente Medellín: uses 1913-1951 FBC historical crest strictly for 1913-1951 tables.
 */
export function getTournamentTeamCrest(
  t: { id?: string; year?: string },
  teamName: string,
  isJuniorRow?: boolean
): { src: string; alt: string } | null {
  const lower = (teamName || '').toLowerCase();
  const isJunior =
    isJuniorRow === true || (lower.includes('junior') && !lower.includes('boca juniors'));
  if (isJunior) {
    return getTournamentJuniorCrest(t);
  }

  if (!lower || lower.includes(',')) {
    return null;
  }

  const isSantaFe = lower.includes('santa fe');
  const year = (t.year || '').trim();
  if (isSantaFe && (year === '1948' || year === '1949' || year === '1950')) {
    return {
      src: '/assets/aistudio/SANTA_FE_1948-1950_6d4be8eb.png',
      alt: 'Escudo Histórico Santa Fe 1948-1950',
    };
  }

  const isDeportesCaldas = lower.includes('deportes caldas');
  if (
    isDeportesCaldas &&
    (year === '1947' || year === '1948' || year === '1949' || year === '1950')
  ) {
    return {
      src: '/assets/aistudio/Escudo_Deportes_Caldas_1947-1950.svg_8c1299a8.webp',
      alt: 'Escudo Histórico Deportes Caldas 1947-1950',
    };
  }

  const isMillonarios = lower.includes('millonarios');
  const numericYear = /^\d{4}$/.test(year) ? Number(year) : null;
  if (
    isMillonarios &&
    ((numericYear !== null && numericYear >= 1947 && numericYear <= 1955) ||
      t.id === '1953-1966-receso')
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1947-1955_a27e65ae.png',
      alt: 'Escudo Histórico Millonarios 1947-1955',
    };
  }

  const isAtleticoMunicipal =
    lower.includes('atlético municipal') || lower.includes('atletico municipal');
  if (
    isAtleticoMunicipal &&
    (year === '1947' || year === '1948' || year === '1949' || year === '1950')
  ) {
    return {
      src: '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png',
      alt: 'Escudo Histórico Atlético Municipal 1947-1950',
    };
  }

  const isAmericaDeCali =
    (lower.includes('américa') || lower.includes('america')) &&
    !lower.includes('copa');
  if (
    isAmericaDeCali &&
    numericYear !== null &&
    numericYear >= 1940 &&
    numericYear <= 1961
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1940-1961_e9be8b73.png',
      alt: 'Escudo Histórico América de Cali 1940-1961',
    };
  }

  const isIndependienteMedellin =
    (lower.includes('independiente medellín') ||
      lower.includes('independiente medellin') ||
      lower.includes('ind. medellín') ||
      lower.includes('ind. medellin') ||
      lower.includes('indep. medellín') ||
      lower.includes('indep. medellin') ||
      lower.trim() === 'medellín' ||
      lower.trim() === 'medellin') &&
    !lower.includes('huracán') &&
    !lower.includes('huracan');
  if (
    isIndependienteMedellin &&
    numericYear !== null &&
    numericYear >= 1913 &&
    numericYear <= 1951
  ) {
    return {
      src: '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png',
      alt: 'Escudo Histórico Independiente Medellín 1913-1951',
    };
  }

  return null;
}
