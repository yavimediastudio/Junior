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
 * - 1946-1949 (including 1948 inaugural championship): uses the 1946-1950 JCD historical crest.
 * - 1950: uses the 1950-1951 JUNIOR three-stripe historical crest.
 * - 1951-1966 (1951-1953 El Dorado & 1966 Dimayor return): uses the 1951-1966 9-stripe shield under navy chief.
 * - 1967+: uses the official Junior crest.
 */
export function getTournamentJuniorCrest(t: { id?: string; year?: string }): {
  src: string;
  alt: string;
} {
  const startYear = extractTournamentStartYear(t.year);
  const is1946To1949 =
    t.id === '1948-inaugural' ||
    (startYear !== null && startYear >= 1946 && startYear <= 1949);
  if (is1946To1949) {
    return {
      src: '/assets/aistudio/ESCUDO_JUNIOR_1946-1950_7ea2a3f2.png',
      alt: 'Escudo Histórico Junior 1946-1950',
    };
  }
  if (startYear === 1950) {
    return {
      src: '/assets/aistudio/ESCUDO_JUNIOR_1950-51_106008e2.png',
      alt: 'Escudo Histórico Junior 1950-1951',
    };
  }
  if (startYear !== null && startYear >= 1951 && startYear <= 1966) {
    return {
      src: '/assets/aistudio/ESCUDO_JUNIOR_1951-66_e0a54e06.png',
      alt: 'Escudo Histórico Junior 1951-1966',
    };
  }
  return {
    src: '/assets/aistudio/image_82370351.png',
    alt: 'Escudo Oficial Junior',
  };
}

/**
 * Extracts the starting 4-digit calendar year from tournament year labels
 * (e.g., "1948" -> 1948, "1995/96" -> 1995, "2012-II" -> 2012, "1953-1966" -> 1953).
 */
export function extractTournamentStartYear(year?: string): number | null {
  const match = /^(\d{4})/.exec((year || '').trim());
  return match ? Number(match[1]) : null;
}

/**
 * Returns the team crest asset to display inside a specific tournament table/match card.
 * - Junior: uses 1946-1950 JCD crest in 1946-1949 tables (1948), 1950-1951 crest in 1950, 1951-1966 crest in 1951-1966 tables, and official Junior crest from 1967 onward.
 * - Santa Fe: uses 1948-1950 CISF historical crest for 1948-1949 tables, 1950-1952 crest for 1950-1951 tables, 1952-1956 crest strictly for 1952-1956 tables, and 1966-1967 Campeón 66 crest strictly for 1966-1967 tables.
 * - Deportes Caldas / Deportivo Manizales: uses 1947-1950 historical crest for 1947-1949 tables, and 1950-1961 crest strictly for 1950-1961 tables.
 * - Millonarios: uses 1947-1955 historical crest for 1947-1955 tables.
 * - Atlético Municipal / Nacional: uses 1947-1950 historical crest for 1947-1949 tables, and 1950-1953 crest strictly for 1950-1953 tables.
 * - América de Cali: uses 1940-1961 historical crest strictly for 1940-1961 tables.
 * - Independiente Medellín: uses 1913-1951 FBC historical crest strictly for 1913-1951 tables.
 * - Deportivo Cali: uses 1948-2012 historical crest strictly for 1948-2012 tables.
 * - Once Deportivo: uses historical D emblem in 1948-1951 tables.
 * - Universidad Nacional: uses historical crest in 1948-1952 tables.
 * - Boca Juniors de Cali: uses CABJ Cali crest across historical tables and matches.
 * - Cúcuta Deportivo: uses 1950-1971 historical CD yin-yang crest strictly for 1950-1971 tables.
 * - Atlético Bucaramanga: uses 1950-1957 historical AB pennant crest strictly for 1950-1957 tables.
 * - Sporting de Barranquilla: uses 1950-1953 historical black-and-gold crest strictly for 1950-1953 tables.
 * - Deportivo Pereira: uses 1949-1952 historical DP golden-ball crest for 1949-1951 tables, 1952-1956 yellow-chevron D.P. crest for 1952-1955 tables, and 1956-1989 DP diagonal red-yellow crest strictly for 1956-1989 tables.
 * - Huracán de Medellín: uses hot-air balloon crest across 1950-1951 tables without colliding with Independiente Medellín.
 * - Deportes Quindío: uses 1951-1967 historical DQ pennant crest strictly for 1951-1967 tables.
 * - Deportivo Samarios: uses historical Santa Marta Samarios crest across its El Dorado tables and matches.
 * - Unión Magdalena: uses official Unión Magdalena crest across its historical and modern tables and matches.
 */
export function getTournamentTeamCrest(
  t: { id?: string; year?: string },
  teamName: string,
  isJuniorRow?: boolean
): { src: string; alt: string; needsLightBackdrop?: boolean } | null {
  const lower = (teamName || '').toLowerCase();
  const isJunior =
    isJuniorRow === true || (lower.includes('junior') && !lower.includes('boca juniors'));
  if (isJunior) {
    return getTournamentJuniorCrest(t);
  }

  if (!lower || lower.includes(',')) {
    return null;
  }

  if (lower.includes('boca juniors') && lower.includes('cali')) {
    return {
      src: '/assets/aistudio/image_7a8c8dde.png',
      alt: 'Escudo Oficial Boca Juniors de Cali',
    };
  }

  const isSantaFe = lower.includes('santa fe');
  const year = (t.year || '').trim();
  const numericYear = /^\d{4}$/.test(year) ? Number(year) : null;
  const startYear = extractTournamentStartYear(year);

  if (isSantaFe && (year === '1948' || year === '1949')) {
    return {
      src: '/assets/aistudio/SANTA_FE_1948-1950_6d4be8eb.png',
      alt: 'Escudo Histórico Santa Fe 1948-1950',
    };
  }
  if (isSantaFe && (year === '1950' || year === '1951')) {
    return {
      src: '/assets/aistudio/SANTA_FE_1950-1952_88ef6caa.png',
      alt: 'Escudo Histórico Santa Fe 1950-1952',
    };
  }
  if (isSantaFe && startYear !== null && startYear >= 1952 && startYear <= 1956) {
    return {
      src: '/assets/aistudio/SANTA_FE_1952-1956_f7f7b9c3.png',
      alt: 'Escudo Histórico Santa Fe 1952-1956',
    };
  }
  if (isSantaFe && startYear !== null && startYear >= 1966 && startYear <= 1967) {
    return {
      src: '/assets/aistudio/SANTA_FE_1966-1967_a0a1e3e6.png',
      alt: 'Escudo Histórico Santa Fe 1966-1967',
    };
  }

  const isDeportesCaldas =
    lower.includes('deportes caldas') ||
    lower.includes('deportivo manizales') ||
    lower.includes('dep. manizales');
  if (
    isDeportesCaldas &&
    (year === '1947' || year === '1948' || year === '1949')
  ) {
    return {
      src: '/assets/aistudio/Escudo_Deportes_Caldas_1947-1950.svg_8c1299a8.webp',
      alt: 'Escudo Histórico Deportes Caldas 1947-1950',
    };
  }
  if (
    isDeportesCaldas &&
    startYear !== null &&
    startYear >= 1950 &&
    startYear <= 1961
  ) {
    return {
      src: '/assets/aistudio/DEPORTES_CLADA_50-61_6bc0153b.png',
      alt: 'Escudo Histórico Deportes Caldas 1950-1961',
    };
  }

  const isMillonarios = lower.includes('millonarios');
  if (
    isMillonarios &&
    numericYear !== null &&
    numericYear >= 1947 &&
    numericYear <= 1955
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1947-1955_a27e65ae.png',
      alt: 'Escudo Histórico Millonarios 1947-1955',
    };
  }

  const isAtleticoNacionalClub =
    lower.includes('atlético municipal') ||
    lower.includes('atletico municipal') ||
    lower.includes('atlético nacional') ||
    lower.includes('atletico nacional') ||
    lower.includes('atl. nacional') ||
    (lower.trim() === 'nacional' && !lower.includes('universidad'));
  if (
    isAtleticoNacionalClub &&
    (year === '1947' || year === '1948' || year === '1949')
  ) {
    return {
      src: '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png',
      alt: 'Escudo Histórico Atlético Municipal 1947-1950',
    };
  }
  if (
    isAtleticoNacionalClub &&
    startYear !== null &&
    startYear >= 1950 &&
    startYear <= 1953
  ) {
    return {
      src: '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1950-1953_896fee19.png',
      alt: 'Escudo Histórico Atlético Nacional 1950-1953',
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

  const isDeportivoCali =
    (lower.includes('deportivo cali') || lower.includes('dep. cali')) &&
    !lower.includes('américa') &&
    !lower.includes('america') &&
    !lower.includes('boca juniors');
  if (
    isDeportivoCali &&
    startYear !== null &&
    startYear >= 1948 &&
    startYear <= 2012
  ) {
    return {
      src: '/assets/aistudio/deportivo_cali_1948-2012_35d865b2.png',
      alt: 'Escudo Histórico Deportivo Cali 1948-2012',
    };
  }

  if (lower.includes('once deportivo')) {
    return {
      src: '/assets/aistudio/image_93c1f912.png',
      alt: 'Escudo Histórico Once Deportivo',
      needsLightBackdrop: true,
    };
  }

  if (lower.includes('universidad nacional')) {
    return {
      src: '/assets/aistudio/image_63a79417.png',
      alt: 'Escudo Histórico Universidad Nacional',
      needsLightBackdrop: true,
    };
  }

  const isCucutaDeportivo = lower.includes('cúcuta') || lower.includes('cucuta');
  if (
    isCucutaDeportivo &&
    startYear !== null &&
    startYear >= 1950 &&
    startYear <= 1971
  ) {
    return {
      src: '/assets/aistudio/cucuta_deportivo_1950-1971_b12221f4.png',
      alt: 'Escudo Histórico Cúcuta Deportivo 1950-1971',
    };
  }

  const isAtleticoBucaramanga = lower.includes('bucaramanga');
  if (
    isAtleticoBucaramanga &&
    startYear !== null &&
    startYear >= 1950 &&
    startYear <= 1957
  ) {
    return {
      src: '/assets/aistudio/bucaramanga_1950-1957_80f6c063.png',
      alt: 'Escudo Histórico Atlético Bucaramanga 1950-1957',
    };
  }

  const isSportingBarranquilla =
    lower.includes('sporting') && !lower.includes('cristal');
  if (
    isSportingBarranquilla &&
    startYear !== null &&
    startYear >= 1950 &&
    startYear <= 1953
  ) {
    return {
      src: '/assets/aistudio/sporting_1950-1953_871e9ddd.png',
      alt: 'Escudo Histórico Sporting de Barranquilla 1950-1953',
    };
  }

  const isDeportivoPereira =
    lower.includes('deportivo pereira') ||
    lower.includes('dep. pereira') ||
    lower.trim() === 'pereira';
  if (
    isDeportivoPereira &&
    startYear !== null &&
    startYear >= 1949 &&
    startYear <= 1951
  ) {
    return {
      src: '/assets/aistudio/PEREIRA_DEL_49_al_52_17730967.png',
      alt: 'Escudo Histórico Deportivo Pereira 1949-1952',
    };
  }
  if (
    isDeportivoPereira &&
    startYear !== null &&
    startYear >= 1952 &&
    startYear <= 1955
  ) {
    return {
      src: '/assets/aistudio/PEREIRA_DEL_52_al_56_ef90fe97.png',
      alt: 'Escudo Histórico Deportivo Pereira 1952-1956',
    };
  }
  if (
    isDeportivoPereira &&
    startYear !== null &&
    startYear >= 1956 &&
    startYear <= 1989
  ) {
    return {
      src: '/assets/aistudio/PEREIRA_DEL_56_al_89_eb282c12.png',
      alt: 'Escudo Histórico Deportivo Pereira 1956-1989',
    };
  }

  const isHuracanDeMedellin =
    (lower.includes('huracán') || lower.includes('huracan')) &&
    (lower.includes('medellín') || lower.includes('medellin'));
  if (isHuracanDeMedellin) {
    return {
      src: '/assets/aistudio/huracan_de_medellin_534acebd.png',
      alt: 'Escudo Histórico Huracán de Medellín',
    };
  }

  const isDeportesQuindio = lower.includes('quindío') || lower.includes('quindio');
  if (
    isDeportesQuindio &&
    startYear !== null &&
    startYear >= 1951 &&
    startYear <= 1967
  ) {
    return {
      src: '/assets/aistudio/quindio_del_51_al_67_d5631340.png',
      alt: 'Escudo Histórico Deportes Quindío 1951-1967',
    };
  }

  if (lower.includes('samarios')) {
    return {
      src: '/assets/aistudio/SAMARIOS_50-51_fd182237.png',
      alt: 'Escudo Histórico Deportivo Samarios',
    };
  }

  const isUnionMagdalena =
    lower.includes('unión magdalena') ||
    lower.includes('union magdalena') ||
    lower.includes('u. magdalena');
  if (isUnionMagdalena) {
    return {
      src: '/assets/aistudio/image_83f09d09.png',
      alt: 'Escudo Oficial Unión Magdalena',
    };
  }

  return null;
}

function normalizeClubKey(name?: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\./g, '')
    .replace(/\bf\s*c\b/g, ' ')
    .replace(/\bdep\b/g, 'deportivo')
    .replace(/\batl\b/g, 'atletico')
    .replace(/\bindep\b|\bind\b/g, 'independiente')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSameClubKey(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  if ((a === 'chico' && b === 'boyaca chico') || (b === 'chico' && a === 'boyaca chico')) {
    return true;
  }
  return false;
}

export type StandingRowTableContext =
  | 'regular'
  | 'secondaryRegular'
  | 'finalGroup'
  | 'finalSummary';

export interface TournamentClassificationMeta {
  id?: string;
  championTeam: string;
  juniorFinish?: string;
  isJuniorChampion?: boolean;
  isJuniorRunnerUp?: boolean;
  hasFinalPhase?: boolean;
  phaseType?: string;
  rows?: { pos: number; team: string; statusBadge?: string }[];
  regularRows?: { pos: number; team: string; statusBadge?: string }[];
  finalGroups?: {
    groupName: string;
    rows: { pos: number; team: string; statusBadge?: string }[];
  }[];
  playoffMatches?: {
    stage: string;
    homeTeam: string;
    awayTeam: string;
  }[];
}

function resolveRunnerUpKey(
  t: TournamentClassificationMeta,
  championKey: string,
  isNoChampionTourney: boolean
): string {
  if (isNoChampionTourney) return '';

  // 1. Direct Gran Final / Final match between two teams (excluding round-robin group titles)
  if (t.playoffMatches && t.playoffMatches.length > 0 && championKey) {
    const finalMatches = t.playoffMatches.filter((m) => {
      const st = (m.stage || '').toLowerCase();
      const isFinalWord = /\bfinal\b/.test(st);
      const isRoundRobinOrEarly =
        st.includes('cuadrangular') ||
        st.includes('hexagonal') ||
        st.includes('octogonal') ||
        st.includes('triangular') ||
        st.includes('semifinal') ||
        st.includes('cuartos') ||
        st.includes('grupo');
      return isFinalWord && !isRoundRobinOrEarly;
    });
    for (let i = finalMatches.length - 1; i >= 0; i--) {
      const m = finalMatches[i];
      const homeK = normalizeClubKey(m.homeTeam);
      const awayK = normalizeClubKey(m.awayTeam);
      if (isSameClubKey(homeK, championKey) && awayK && !isSameClubKey(awayK, championKey)) {
        return awayK;
      }
      if (isSameClubKey(awayK, championKey) && homeK && !isSameClubKey(homeK, championKey)) {
        return homeK;
      }
    }
  }

  // 2. Single-phase championship: 2nd place in standings
  if (t.hasFinalPhase === false) {
    const second = (t.rows || t.regularRows || []).find((r) => r.pos === 2);
    if (second) return normalizeClubKey(second.team);
  }

  // 3. Final round-robin group (Triangular / Cuadrangular Final / Hexagonal / Octogonal)
  if (t.finalGroups && t.finalGroups.length > 0) {
    const finalGroup = t.finalGroups.find((g) => {
      const gn = (g.groupName || '').toLowerCase();
      return (
        gn.includes('triangular final') ||
        gn.includes('cuadrangular final') ||
        gn.includes('hexagonal final') ||
        gn.includes('octogonal final')
      );
    });
    if (finalGroup && finalGroup.rows.length >= 2) {
      const firstK = normalizeClubKey(finalGroup.rows[0].team);
      if (!championKey || isSameClubKey(firstK, championKey)) {
        return normalizeClubKey(finalGroup.rows[1].team);
      }
    }
  }

  // 4. Summary rows where 1st place matches championTeam
  if (t.rows && t.rows.length >= 2 && championKey) {
    const firstK = normalizeClubKey(t.rows[0].team);
    if (isSameClubKey(firstK, championKey)) {
      return normalizeClubKey(t.rows[1].team);
    }
  }

  // 5. Runner-up flag fallback for Junior
  if (isJuniorRunnerUpTournament({ championTeam: t.championTeam, juniorFinish: t.juniorFinish || '', isJuniorChampion: t.isJuniorChampion, isJuniorRunnerUp: t.isJuniorRunnerUp })) {
    return 'junior de barranquilla';
  }

  return '';
}

/**
 * Resolves the status/classification badge for a standings table row.
 * Uses explicit `row.statusBadge` when provided, and otherwise derives the
 * historically accurate classification from tournament phase & final outcomes.
 */
export function getRowStatusBadge(
  t: TournamentClassificationMeta,
  row: { pos: number; team: string; statusBadge?: string },
  context: StandingRowTableContext,
  groupName?: string
): string {
  const explicit = (row.statusBadge || '').trim();
  if (explicit && explicit !== '-') {
    return explicit;
  }

  const champLower = (t.championTeam || '').toLowerCase();
  const isDesierto = champLower.includes('desierto');
  const isInProgress = champLower.includes('en disputa');
  const isAficionado = champLower.includes('aficionado');
  const isNoChampion = isDesierto || isInProgress || isAficionado;

  const championKey = isNoChampion ? '' : normalizeClubKey(t.championTeam);
  const runnerUpKey = resolveRunnerUpKey(t, championKey, isNoChampion);
  const rowKey = normalizeClubKey(row.team);

  const isChamp = Boolean(championKey && isSameClubKey(rowKey, championKey));
  const isRunnerUp = !isChamp && Boolean(runnerUpKey && isSameClubKey(rowKey, runnerUpKey));

  // Single-phase tournaments (e.g. 1948, 1950-1953, 1966, 1967, 1995)
  if (t.hasFinalPhase === false) {
    if (isDesierto) return 'Torneo Desierto';
    if (isInProgress) return `${row.pos}º Puesto`;
    if (isChamp) return 'Campeón ★';
    if (isRunnerUp) return 'Subcampeón 🥈';
    return `${row.pos}º Puesto`;
  }

  // Regular / Secondary regular phases of multi-phase tournaments
  if (context === 'regular' || context === 'secondaryRegular') {
    if (t.id === '2020-playoffs') {
      if (isChamp) return 'Campeón ★';
      if (isRunnerUp) return 'Subcampeón 🥈';
      if (row.pos === 1) return 'Líder · Clasificado';
      return row.pos <= 8 ? 'Clasificado' : 'Liguilla';
    }

    const qualifiedKeys = new Set<string>();
    if (t.finalGroups && t.finalGroups.length > 0) {
      for (const fg of t.finalGroups) {
        const gn = (fg.groupName || '').toLowerCase();
        if (gn.includes('segundos lugares')) continue;
        for (const r of fg.rows) {
          qualifiedKeys.add(normalizeClubKey(r.team));
        }
      }
    } else if (t.rows && t.rows.length > 0) {
      for (const r of t.rows) {
        qualifiedKeys.add(normalizeClubKey(r.team));
      }
    }

    const didQualify = qualifiedKeys.has(rowKey) || isChamp || isRunnerUp;
    if (isChamp) return 'Campeón ★';
    if (isRunnerUp) return 'Subcampeón 🥈';
    if (didQualify) {
      return row.pos === 1 ? 'Líder · Clasificado' : 'Clasificado';
    }
    return 'Eliminado';
  }

  // Final Groups (Cuadrangulares, Triangulares, Hexagonales, Octogonales)
  if (context === 'finalGroup') {
    const gn = (groupName || '').toLowerCase();
    if (isInProgress) {
      return 'Por Disputar';
    }
    if (isDesierto) {
      if (gn.includes('final')) return 'Torneo Desierto';
      return row.pos <= 2 ? 'Clasificado Final' : 'Eliminado';
    }
    if (t.id === '2020-playoffs') {
      if (gn.includes('segundos lugares')) {
        return row.pos === 1 ? 'Clasificado' : `${row.pos}º Lugar`;
      }
      return row.pos === 1 ? 'Clasificado Semifinal' : `${row.pos}º Liguilla`;
    }
    if (gn.includes('desempate')) {
      return row.pos === 1 ? 'Ganador Desempate' : `${row.pos}º Desempate`;
    }

    if (isChamp) return 'Campeón ★';
    if (isRunnerUp) return 'Subcampeón 🥈';

    const hasSeparateCuadrangularFinal = (t.finalGroups || []).some((g) =>
      (g.groupName || '').toLowerCase().includes('cuadrangular final')
    );
    const isSemifinalSubgroup =
      (gn.includes('grupo a') || gn.includes('grupo b')) && !gn.includes('final');

    if (isSemifinalSubgroup) {
      if (hasSeparateCuadrangularFinal) {
        return row.pos <= 2 ? 'Clasificado Final' : 'Eliminado';
      }
      return row.pos === 1 ? 'Clasificado Final' : `${row.pos}º Grupo`;
    }

    return `${row.pos}º Puesto`;
  }

  // Final Summary (`t.rows`)
  if (isDesierto) return 'Torneo Desierto';
  if (isInProgress) return 'Clasificado';
  if (t.id === '2020-playoffs') {
    return row.pos === 1 ? 'Ganador Grupo' : `${row.pos}º Liguilla`;
  }
  if (isChamp) return 'Campeón ★';
  if (isRunnerUp) return 'Subcampeón 🥈';
  return `${row.pos}º Puesto`;
}

export type DecadeKey =
  | '1948-1953'
  | '1966-1969'
  | '1970s'
  | '1980s'
  | '1990s'
  | '2000s'
  | '2010s'
  | '2020s';

export interface DecadeMeta {
  key: DecadeKey;
  label: string;
  subtitle: string;
}

export const DECADE_METADATA: DecadeMeta[] = [
  { key: '1948-1953', label: '1948 – 1953', subtitle: 'Inicios y El Dorado' },
  { key: '1966-1969', label: '1966 – 1969', subtitle: 'Reingreso Dimayor' },
  { key: '1970s', label: '1970 – 1979', subtitle: '1ª Estrella ★' },
  { key: '1980s', label: '1980 – 1989', subtitle: '2ª Estrella ★' },
  { key: '1990s', label: '1990 – 1999', subtitle: '3ª y 4ª Estrella ★' },
  { key: '2000s', label: '2000 – 2009', subtitle: '5ª Estrella ★' },
  { key: '2010s', label: '2010 – 2019', subtitle: 'Era Dorada ★6–★9' },
  { key: '2020s', label: '2020 – 2026', subtitle: 'Centenario ★10–★12' },
];

export function getTournamentDecadeKey(t: { year?: string }): DecadeKey {
  const startYear = extractTournamentStartYear(t.year);
  if (startYear === null || startYear < 1960) return '1948-1953';
  if (startYear < 1970) return '1966-1969';
  if (startYear < 1980) return '1970s';
  if (startYear < 1990) return '1980s';
  if (startYear < 2000) return '1990s';
  if (startYear < 2010) return '2000s';
  if (startYear < 2020) return '2010s';
  return '2020s';
}

export interface DecadeBucket<T> {
  key: DecadeKey;
  label: string;
  subtitle: string;
  items: T[];
  starCount: number;
  runnerUpCount: number;
}

export function groupTournamentsByDecade<
  T extends {
    id: string;
    year: string;
    championTeam: string;
    juniorFinish: string;
    isJuniorChampion?: boolean;
    isJuniorRunnerUp?: boolean;
  }
>(tournaments: T[], sortOrder: 'asc' | 'desc'): DecadeBucket<T>[] {
  const byKey = new Map<DecadeKey, T[]>();
  for (const t of tournaments) {
    const key = getTournamentDecadeKey(t);
    const list = byKey.get(key) || [];
    list.push(t);
    byKey.set(key, list);
  }

  const orderedMeta = sortOrder === 'asc' ? DECADE_METADATA : [...DECADE_METADATA].reverse();
  const buckets: DecadeBucket<T>[] = [];

  for (const meta of orderedMeta) {
    const items = byKey.get(meta.key);
    if (!items || items.length === 0) continue;
    let starCount = 0;
    let runnerUpCount = 0;
    for (const item of items) {
      if (isJuniorChampionTournament(item)) starCount += 1;
      else if (isJuniorRunnerUpTournament(item)) runnerUpCount += 1;
    }
    buckets.push({
      key: meta.key,
      label: meta.label,
      subtitle: meta.subtitle,
      items,
      starCount,
      runnerUpCount,
    });
  }

  return buckets;
}

export function getAdjacentTournaments<T extends { id: string }>(
  filteredList: T[],
  fullOrderedList: T[],
  selectedId: string
): {
  prev: T | null;
  next: T | null;
  currentIndex: number;
  totalCount: number;
} {
  const filteredIdx = filteredList.findIndex((item) => item.id === selectedId);
  const activeList = filteredIdx >= 0 ? filteredList : fullOrderedList;
  const idx = activeList.findIndex((item) => item.id === selectedId);

  if (idx < 0) {
    return {
      prev: null,
      next: null,
      currentIndex: -1,
      totalCount: activeList.length,
    };
  }

  return {
    prev: idx > 0 ? activeList[idx - 1] : null,
    next: idx < activeList.length - 1 ? activeList[idx + 1] : null,
    currentIndex: idx,
    totalCount: activeList.length,
  };
}

export interface MatchArchiveEntry {
  round: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  note?: string;
}

export type MatchArchiveLapFilter = 'all' | '1' | '2' | '3' | '4';
export type MatchArchiveVenueFilter = 'all' | 'home' | 'away';
export type MatchArchiveOutcomeFilter = 'all' | 'win' | 'draw' | 'loss';

export interface MatchArchiveFilterOptions {
  lap?: MatchArchiveLapFilter;
  venue?: MatchArchiveVenueFilter;
  outcome?: MatchArchiveOutcomeFilter;
  opponent?: string;
}

export interface JuniorMatchArchiveSummary {
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

export interface MatchArchiveLapOption {
  id: MatchArchiveLapFilter;
  label: string;
}

const TWO_LAP_MATCH_TOTALS = new Set([18, 22, 28, 30, 34]);

function isJuniorClubName(teamName: string): boolean {
  const lower = (teamName || '').toLowerCase();
  return lower.includes('junior') && !lower.includes('boca juniors');
}

export function extractMatchRoundNumber(round: string): number | null {
  const m = /^fecha\s+(\d+)/i.exec((round || '').trim());
  return m ? Number(m[1]) : null;
}

export function getMatchLapNumber(
  round: string,
  totalMatches: number,
  index?: number
): number | null {
  if (totalMatches === 52) {
    const roundNum = extractMatchRoundNumber(round);
    if (roundNum !== null && roundNum >= 1 && roundNum <= 52) {
      return Math.ceil(roundNum / 13);
    }
    if (index !== undefined && index >= 0 && index < 52) {
      return Math.floor(index / 13) + 1;
    }
    return null;
  }

  if (TWO_LAP_TOURNAMENT_VALID(totalMatches)) {
    const half = totalMatches / 2;
    const roundNum = extractMatchRoundNumber(round);
    if (roundNum !== null && roundNum >= 1 && roundNum <= totalMatches) {
      return roundNum <= half ? 1 : 2;
    }
    if (index !== undefined && index >= 0 && index < totalMatches) {
      return index < half ? 1 : 2;
    }
    return null;
  }

  return null;
}

function TWO_LAP_TOURNAMENT_VALID(totalMatches: number): boolean {
  return TWO_LAP_MATCH_TOTALS.has(totalMatches);
}

export function getMatchArchiveLapOptions(
  totalMatches: number
): MatchArchiveLapOption[] {
  if (totalMatches === 52) {
    return [
      { id: 'all', label: 'Todas (52)' },
      { id: '1', label: '1.ª Vuelta (1–13)' },
      { id: '2', label: '2.ª Vuelta (14–26)' },
      { id: '3', label: '3.ª Vuelta (27–39)' },
      { id: '4', label: '4.ª Vuelta (40–52)' },
    ];
  }

  if (TWO_LAP_MATCH_TOTALS.has(totalMatches)) {
    const half = totalMatches / 2;
    return [
      { id: 'all', label: `Todas (${totalMatches})` },
      { id: '1', label: `1.ª Vuelta (1–${half})` },
      { id: '2', label: `2.ª Vuelta (${half + 1}–${totalMatches})` },
    ];
  }

  return [];
}

export function computeJuniorMatchArchiveSummary(
  matches: MatchArchiveEntry[]
): JuniorMatchArchiveSummary {
  let pj = 0;
  let pg = 0;
  let pe = 0;
  let pp = 0;
  let gf = 0;
  let gc = 0;

  for (const m of matches) {
    const isHome = isJuniorClubName(m.homeTeam);
    const isAway = isJuniorClubName(m.awayTeam);
    if (!isHome && !isAway) continue;

    pj += 1;
    const jg = isHome ? m.homeScore : m.awayScore;
    const og = isHome ? m.awayScore : m.homeScore;
    gf += jg;
    gc += og;
    if (jg > og) pg += 1;
    else if (jg === og) pe += 1;
    else pp += 1;
  }

  return {
    pj,
    pg,
    pe,
    pp,
    gf,
    gc,
    dg: gf - gc,
    pts: pg * 2 + pe,
  };
}

export function getMatchArchiveOpponents(matches: MatchArchiveEntry[]): string[] {
  const opponents = new Set<string>();
  for (const m of matches) {
    const isHome = isJuniorClubName(m.homeTeam);
    const isAway = isJuniorClubName(m.awayTeam);
    if (!isHome && !isAway) continue;
    const opp = isHome ? m.awayTeam : m.homeTeam;
    if (opp) opponents.add(opp);
  }
  return Array.from(opponents).sort((a, b) => a.localeCompare(b, 'es'));
}

export function filterMatchArchiveFixtures(
  matches: MatchArchiveEntry[],
  filters: MatchArchiveFilterOptions
): MatchArchiveEntry[] {
  const totalMatches = matches.length;
  const {
    lap = 'all',
    venue = 'all',
    outcome = 'all',
    opponent = 'all',
  } = filters;

  return matches.filter((m, index) => {
    const isHome = isJuniorClubName(m.homeTeam);
    const isAway = isJuniorClubName(m.awayTeam);
    if (!isHome && !isAway) return false;

    if (lap !== 'all') {
      const matchLap = getMatchLapNumber(m.round, totalMatches, index);
      if (String(matchLap) !== lap) return false;
    }

    if (venue === 'home' && !isHome) return false;
    if (venue === 'away' && !isAway) return false;

    if (outcome !== 'all') {
      const jg = isHome ? m.homeScore : m.awayScore;
      const og = isHome ? m.awayScore : m.homeScore;
      if (outcome === 'win' && !(jg > og)) return false;
      if (outcome === 'draw' && !(jg === og)) return false;
      if (outcome === 'loss' && !(jg < og)) return false;
    }

    if (opponent !== 'all') {
      const opp = isHome ? m.awayTeam : m.homeTeam;
      if (opp !== opponent) return false;
    }

    return true;
  });
}


