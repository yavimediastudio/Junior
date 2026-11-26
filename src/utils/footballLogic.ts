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
 * Extracts a concise star ordinal label (e.g., "1ª Estrella", "12ª Estrella") for
 * tournament campaigns where Junior won the league championship. Returns null when
 * Junior did not win the tournament.
 */
export function getJuniorChampionshipStarLabel(t: {
  championTeam: string;
  juniorFinish: string;
  isJuniorChampion?: boolean;
}): string | null {
  if (!isJuniorChampionTournament(t)) return null;
  const finish = t.juniorFinish || '';
  const match = /(\d+)\s*[ªa°.]*\s*Estrella/i.exec(finish);
  if (match) {
    return `${match[1]}ª Estrella`;
  }
  return 'Campeón';
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
 * - 1977-1979: uses the 1977-1980 single-star blue-top shield historical crest.
 * - 1980-1993: uses the 1980-1993 two-star JUNIOR banner shield historical crest.
 * - 1994: uses the 1994 three-star JUNIOR F.B.C. shield historical crest.
 * - 1967-1976 & 1995+: uses the official Junior crest.
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
  if (startYear !== null && startYear >= 1977 && startYear <= 1979) {
    return {
      src: '/assets/aistudio/ESCUDO_JUNIOR_1977-1980_6559099c.png',
      alt: 'Escudo Histórico Junior 1977-1980',
    };
  }
  if (startYear !== null && startYear >= 1980 && startYear <= 1993) {
    return {
      src: '/assets/aistudio/ESCUDO_JUNIOR_1980-1993_13294272.png',
      alt: 'Escudo Histórico Junior 1980-1993',
    };
  }
  if (startYear === 1994) {
    return {
      src: '/assets/aistudio/ESCUDO_JUNIOR_1994_b3280916.png',
      alt: 'Escudo Histórico Junior 1994',
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
 * - Junior: uses 1946-1950 JCD crest in 1946-1949 tables (1948), 1950-1951 crest in 1950, 1951-1966 crest in 1951-1966 tables, 1977-1980 single-star crest in 1977-1979 tables, 1980-1993 two-star JUNIOR banner crest in 1980-1993 tables, 1994 three-star JUNIOR F.B.C. crest in 1994 tables, and official Junior crest in 1967-1976 and 1995+.
 * - Santa Fe: uses 1948-1950 CISF historical crest for 1948-1949 tables, 1950-1952 crest for 1950-1951 tables, 1952-1956 crest strictly for 1952-1956 tables, 1966-1967 Campeón 66 crest for 1966 tables, and 1967-2012 classic crest strictly for 1967-2012 tables.
 * - Deportes Caldas / Deportivo Manizales: uses 1947-1950 historical crest for 1947-1949 tables, and 1950-1961 crest strictly for 1950-1961 tables.
 * - Once Caldas: uses 1961-1967 tricolor-and-C historical crest for 1961-1966 tables, 1967-1971 C-rings crest strictly for 1967-1971 tables, 1972-1976 Cristal Caldas oval crest for 1972-1975 tables, 1976-1979 Cristal Caldas scalloped flower crest strictly for 1976-1979 tables, 1980 Cristal Caldas red wordmark crest strictly for 1980 tables, 1981-1983 Varta F.B.C. crest strictly for 1981-1983 tables, 1984-1986 tricolor double-C star shield crest strictly for 1984-1986 tables, 1987-1990 squared tricolor double-C star shield crest strictly for 1987-1990 tables, 1991-1993 Philips tricolor double-C star shield crest strictly for 1991-1993 tables, 1994 Philips Colombiana tricolor double-C star shield crest strictly for 1994 tables, 1995 Colombiana tricolor double-C star shield crest strictly for 1995 tables (including 1995/96), 1996 Leona Cerveza tricolor double-C star shield crest strictly for 1996 tables (including 1996/97), 1997-1999 tricolor double-C star shield crest strictly for 1997-1999 tables, and 2000-2003 tricolor interlocking-OC star shield crest strictly for 2000-2003 tables.
 * - Millonarios: uses 1947-1955 historical crest for 1947-1955 tables, 1956-1974 crest for 1956-1973 tables, 1974-1975 circular 10-star crest for 1974 tables, 1975-1976 shield 10-star crest for 1975-1976 tables, 1977-1985 classic shield crest strictly for 1977-1985 tables, 1986-1990 double-ring M shield crest strictly for 1986-1990 tables, 1991-1993 navy-and-white double-ring M shield crest strictly for 1991-1993 tables, 1994-1996 diagonal blue-and-white double-ring M shield crest strictly for 1994-1996 tables, 1997-1999 triple-bordered blue-and-white double-ring M shield crest strictly for 1997-1999 tables, and 2000-2002 gold-bordered blue-and-white double-ring M shield crest strictly for 2000-2002 tables.
 * - Atlético Municipal / Nacional: uses 1947-1950 historical crest for 1947-1949 tables, 1950-1953 crest for 1950-1953 tables, 1954-1988 crowned shield crest strictly for 1954-1988 tables, 1989-1993 five-star castle shield crest strictly for 1989-1993 tables, 1994-1995 green-and-white castle diagonal A/N shield crest strictly for 1994-1995 tables, 1996-1999 classic white-bordered castle diagonal A/N shield crest strictly for 1996-1999 tables, and 2000-present official castle diagonal A/N shield crest strictly for 2000+ tables.
 * - América de Cali: uses 1940-1961 historical crest strictly for 1940-1961 tables, 1964-1976 devil-and-ball crest for 1964-1975 tables, 1976-1977 white-shield devil crest for 1976-1977 tables, 1978-1982 crowned-stars crest for 1978-1981 tables, 1982-1983 single-star shield crest for 1982-1983 tables, 1984 two-star shield crest strictly for 1984 tables, 1985 three-star shield crest strictly for 1985 tables, 1986 four-star (3+1) shield crest strictly for 1986 tables, 1987 six-star shield crest strictly for 1987 tables, 1988 circular ADC monogram crest strictly for 1988 tables, 1989-1990 red six-star shield crest strictly for 1989-1990 tables, 1991-1992 white seven-star shield crest strictly for 1991-1992 tables, 1993-1997 eight-star devil shield crest strictly for 1993-1997 tables, 1998-2000 red-and-white devil shield crest strictly for 1998-2000 tables, and 2001-2004 white-shield arched-AMERICA devil crest strictly for 2001-2004 tables.
 * - Independiente Medellín: uses 1913-1951 FBC historical crest strictly for 1913-1951 tables, and 1966-2006 DIM diagonal crest strictly for 1966-2006 tables.
 * - Deportivo Cali: uses 1948-2012 historical crest strictly for 1948-2012 tables.
 * - Once Deportivo: uses historical D emblem in 1948-1951 tables.
 * - Universidad Nacional: uses historical crest in 1948-1952 tables.
 * - Boca Juniors de Cali: uses CABJ Cali crest across historical tables and matches.
 * - Cúcuta Deportivo: uses 1950-1971 historical CD yin-yang crest for 1950-1971 tables, and 1972-2005 red-and-black CD circle crest strictly for 1972-2005 tables.
 * - Atlético Bucaramanga: uses 1950-1957 historical AB pennant crest for 1950-1956 tables, 1957-1985 leopard crest strictly for 1957-1985 tables, 1986-1996 yellow-green A.B. leopard crest strictly for 1986-1996 tables, 1997-2000 white-and-yellow A.B. leopard crest for 1997-1999 tables, and 2000-2009 yellow-and-green black-lettered A.B. leopard crest strictly for 2000-2009 tables.
 * - Sporting de Barranquilla: uses 1950-1953 historical black-and-gold crest strictly for 1950-1953 tables, 1988-1990 tiger-and-stripes crest strictly for 1988-1990 tables, and 1991 jaguar-and-tricolor-band crest strictly for 1991 tables.
 * - Deportivo Pereira: uses 1949-1952 historical DP golden-ball crest for 1949-1951 tables, 1952-1956 yellow-chevron D.P. crest for 1952-1955 tables, 1956-1989 DP diagonal red-yellow crest strictly for 1956-1989 tables, 1990 CP ball-top diagonal crest strictly for 1990 tables, 1991-1993 black-and-yellow DP ball-top diagonal crest strictly for 1991-1993 tables, 1994-1997 Ferro Club Pereira circular crest strictly for 1994-1997 tables, and 2001-2005 La Furia Matecaña DP crest strictly for 2001-2005 tables.
 * - Huracán de Medellín: uses hot-air balloon crest across 1950-1951 tables without colliding with Independiente Medellín.
 * - Deportes Quindío: uses 1951-1967 historical DQ pennant crest for 1951-1966 tables, 1967-1986 star-and-tricolor crest strictly for 1967-1986 tables, 1987-1990 tricolor-ball DQ shield crest strictly for 1987-1990 tables, 1991-1996 Corporación Deportes Quindío crest strictly for 1991-1996 tables, and 1997-2017 red-star Corporación Deportes Quindío crest strictly for 1997-2017 tables.
 * - Deportes Tolima: uses 1966-1997 yellow-and-black DT crest strictly for 1966-1997 tables, and 1998-2003 vinotinto-and-gold DT trapezoid crest strictly for 1998-2003 tables.
 * - Deportivo Samarios: uses historical Santa Marta Samarios crest across its El Dorado tables and matches.
 * - Unión Magdalena: uses official Unión Magdalena crest across its historical and modern tables and matches.
 * - Real Cartagena: uses 1971-2013 antique shield crest strictly for 1971-2013 tables and matches.
 * - Oro Negro: uses Club Deportivo Oro Negro (Barrancabermeja) crest across its 1971 tables and matches.
 * - Envigado F.C.: uses official Envigado F.C. green-and-orange shield crest across its historical and modern tables and matches.
 * - Atlético Huila: uses official Atlético Huila yellow-and-green AH shield crest across its historical and modern tables and matches.
 * - Cortuluá: uses 1967-1999 circular Cortuluá crest strictly for tables from 1967 through 1999, and 2000-2021 glossy circular Cortuluá crest strictly for 2000-2021 tables.
 * - Deportivo Unicosta: uses 1995-1999 Corporación Costa Atlántica crest strictly for tables from 1995 through 1999.
 * - Deportivo Pasto: uses 1999 Asociación Deportivo Pasto circular crest strictly for 1999 tables, and 2000-2006 blue-bordered Asociación Deportivo Pasto circular crest strictly for 2000-2006 tables.
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
  if (isSantaFe && startYear === 1966) {
    return {
      src: '/assets/aistudio/SANTA_FE_1966-1967_a0a1e3e6.png',
      alt: 'Escudo Histórico Santa Fe 1966-1967',
    };
  }
  if (isSantaFe && startYear !== null && startYear >= 1967 && startYear <= 2012) {
    return {
      src: '/assets/aistudio/SANTA_FE_1967-2012_2ab6a468.png',
      alt: 'Escudo Histórico Santa Fe 1967-2012',
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

  const isOnceCaldas =
    lower.includes('once caldas') ||
    lower.includes('once philips') ||
    lower.includes('cristal caldas') ||
    lower.includes('varta caldas') ||
    lower.trim() === 'caldas';
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1961 &&
    startYear <= 1966
  ) {
    return {
      src: '/assets/aistudio/41396e6d-3efd-4d4c-97b6-ed027c1bfbc7_e6495777.png',
      alt: 'Escudo Histórico Once Caldas 1961-1967',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1967 &&
    startYear <= 1971
  ) {
    return {
      src: '/assets/aistudio/logo_c_anillos_transparente_2c90e2d2.png',
      alt: 'Escudo Histórico Once Caldas 1967-1971',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1972 &&
    startYear <= 1975
  ) {
    return {
      src: '/assets/aistudio/ince_caldas_de_1972-1976_0fb41669.png',
      alt: 'Escudo Histórico Once Caldas 1972-1976',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1976 &&
    startYear <= 1979
  ) {
    return {
      src: '/assets/aistudio/ince_caldas_de_1976-1979_b1634e0f.png',
      alt: 'Escudo Histórico Once Caldas 1976-1979',
    };
  }
  if (isOnceCaldas && startYear === 1980) {
    return {
      src: '/assets/aistudio/Logotipo_rojo_Cristal_Caldas_fa11a891.png',
      alt: 'Escudo Histórico Once Caldas 1980',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1981 &&
    startYear <= 1983
  ) {
    return {
      src: '/assets/aistudio/once_caldas_del_81_al_83_7a7a4a9a.png',
      alt: 'Escudo Histórico Once Caldas 1981-1983',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1984 &&
    startYear <= 1986
  ) {
    return {
      src: '/assets/aistudio/caldas_1984-1986_f5f1d42a.png',
      alt: 'Escudo Histórico Once Caldas 1984-1986',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1987 &&
    startYear <= 1990
  ) {
    return {
      src: '/assets/aistudio/once_caldas_del_87-90_530986be.png',
      alt: 'Escudo Histórico Once Caldas 1987-1990',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1991 &&
    startYear <= 1993
  ) {
    return {
      src: '/assets/aistudio/once_caldas_del_91-93_3e56fe90.png',
      alt: 'Escudo Histórico Once Caldas 1991-1993',
    };
  }
  if (isOnceCaldas && startYear === 1994) {
    return {
      src: '/assets/aistudio/once_caldas_del_94_e6cd8054.png',
      alt: 'Escudo Histórico Once Caldas 1994',
    };
  }
  if (isOnceCaldas && startYear === 1995) {
    return {
      src: '/assets/aistudio/once_caldas_del_95_d4ccc7af.png',
      alt: 'Escudo Histórico Once Caldas 1995',
    };
  }
  if (isOnceCaldas && startYear === 1996) {
    return {
      src: '/assets/aistudio/once_caldas_del_96_deca2e30.png',
      alt: 'Escudo Histórico Once Caldas 1996',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 1997 &&
    startYear <= 1999
  ) {
    return {
      src: '/assets/aistudio/once_caldas_del_97-99_c3f980e2.png',
      alt: 'Escudo Histórico Once Caldas 1997-1999',
    };
  }
  if (
    isOnceCaldas &&
    startYear !== null &&
    startYear >= 2000 &&
    startYear <= 2003
  ) {
    return {
      src: '/assets/aistudio/once_caldas_del_2000-2003_f59a376e.png',
      alt: 'Escudo Histórico Once Caldas 2000-2003',
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
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 1956 &&
    startYear <= 1973
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1956-1974_706de05d.png',
      alt: 'Escudo Histórico Millonarios 1956-1974',
    };
  }
  if (isMillonarios && startYear === 1974) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1974-1975_aad7c182.png',
      alt: 'Escudo Histórico Millonarios 1974-1975',
    };
  }
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 1975 &&
    startYear <= 1976
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1975-1976_31a73b01.png',
      alt: 'Escudo Histórico Millonarios 1975-1976',
    };
  }
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 1977 &&
    startYear <= 1985
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1977-1985_287f6a88.png',
      alt: 'Escudo Histórico Millonarios 1977-1985',
    };
  }
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 1986 &&
    startYear <= 1990
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1986-1990_bfddd8f7.png',
      alt: 'Escudo Histórico Millonarios 1986-1990',
    };
  }
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 1991 &&
    startYear <= 1993
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1991-1993_6f66335e.png',
      alt: 'Escudo Histórico Millonarios 1991-1993',
    };
  }
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 1994 &&
    startYear <= 1996
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1994-1996_2b96201e.png',
      alt: 'Escudo Histórico Millonarios 1994-1996',
    };
  }
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 1997 &&
    startYear <= 1999
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_1997-1999_224dd26f.png',
      alt: 'Escudo Histórico Millonarios 1997-1999',
    };
  }
  if (
    isMillonarios &&
    startYear !== null &&
    startYear >= 2000 &&
    startYear <= 2002
  ) {
    return {
      src: '/assets/aistudio/MILLONARIOS_2000-2002_cda26f62.png',
      alt: 'Escudo Histórico Millonarios 2000-2002',
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
  if (
    isAtleticoNacionalClub &&
    startYear !== null &&
    startYear >= 1954 &&
    startYear <= 1988
  ) {
    return {
      src: '/assets/aistudio/nacional_54-88_e08b0a06.png',
      alt: 'Escudo Histórico Atlético Nacional 1954-1988',
    };
  }
  if (
    isAtleticoNacionalClub &&
    startYear !== null &&
    startYear >= 1989 &&
    startYear <= 1993
  ) {
    return {
      src: '/assets/aistudio/nacional_89-93_64c7048e.png',
      alt: 'Escudo Histórico Atlético Nacional 1989-1993',
    };
  }
  if (
    isAtleticoNacionalClub &&
    startYear !== null &&
    startYear >= 1994 &&
    startYear <= 1995
  ) {
    return {
      src: '/assets/aistudio/nacional_94-95_6d46dd78.png',
      alt: 'Escudo Histórico Atlético Nacional 1994-1995',
    };
  }
  if (
    isAtleticoNacionalClub &&
    startYear !== null &&
    startYear >= 1996 &&
    startYear <= 1999
  ) {
    return {
      src: '/assets/aistudio/nacional_96-99_1bdc5b71.png',
      alt: 'Escudo Histórico Atlético Nacional 1996-1999',
    };
  }
  if (
    isAtleticoNacionalClub &&
    startYear !== null &&
    startYear >= 2000
  ) {
    return {
      src: '/assets/aistudio/escudo_nacional_2000-actualidad_79016b5a.png',
      alt: 'Escudo Oficial Atlético Nacional 2000-Actualidad',
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
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1964 &&
    startYear <= 1975
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1964-1976_162e4a73.png',
      alt: 'Escudo Histórico América de Cali 1964-1976',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1976 &&
    startYear <= 1977
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1976-1977_f8a3472a.png',
      alt: 'Escudo Histórico América de Cali 1976-1977',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1978 &&
    startYear <= 1981
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1978-1982_fb4dc8ad.png',
      alt: 'Escudo Histórico América de Cali 1978-1982',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1982 &&
    startYear <= 1983
  ) {
    return {
      src: '/assets/aistudio/america_82-83_5b814bd1.png',
      alt: 'Escudo Histórico América de Cali 1982-1983',
    };
  }
  if (isAmericaDeCali && startYear === 1984) {
    return {
      src: '/assets/aistudio/america_84_a2e0b5ef.png',
      alt: 'Escudo Histórico América de Cali 1984',
    };
  }
  if (isAmericaDeCali && startYear === 1985) {
    return {
      src: '/assets/aistudio/america_85_1df539ce.png',
      alt: 'Escudo Histórico América de Cali 1985',
    };
  }
  if (isAmericaDeCali && startYear === 1986) {
    return {
      src: '/assets/aistudio/america_86_30765880.png',
      alt: 'Escudo Histórico América de Cali 1986',
    };
  }
  if (isAmericaDeCali && startYear === 1987) {
    return {
      src: '/assets/aistudio/AMERICA_1987_c3e7b6ea.png',
      alt: 'Escudo Histórico América de Cali 1987',
    };
  }
  if (isAmericaDeCali && startYear === 1988) {
    return {
      src: '/assets/aistudio/AMERICA_1988_955f5918.png',
      alt: 'Escudo Histórico América de Cali 1988',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1989 &&
    startYear <= 1990
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1989-90_a4c15c3c.png',
      alt: 'Escudo Histórico América de Cali 1989-1990',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1991 &&
    startYear <= 1992
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1991-92_1e26761b.png',
      alt: 'Escudo Histórico América de Cali 1991-1992',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1993 &&
    startYear <= 1997
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1993-97_bb5c7139.png',
      alt: 'Escudo Histórico América de Cali 1993-1997',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 1998 &&
    startYear <= 2000
  ) {
    return {
      src: '/assets/aistudio/AMERICA_1998-2000_c41f8c6c.png',
      alt: 'Escudo Histórico América de Cali 1998-2000',
    };
  }
  if (
    isAmericaDeCali &&
    startYear !== null &&
    startYear >= 2001 &&
    startYear <= 2004
  ) {
    return {
      src: '/assets/aistudio/AMERICA_2001-2004_669b33f5.png',
      alt: 'Escudo Histórico América de Cali 2001-2004',
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
      lower.trim() === 'medellin' ||
      /\bdim\b/.test(lower)) &&
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
  if (
    isIndependienteMedellin &&
    startYear !== null &&
    startYear >= 1966 &&
    startYear <= 2006
  ) {
    return {
      src: '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png',
      alt: 'Escudo Histórico Independiente Medellín 1966-2006',
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
    };
  }

  if (lower.includes('universidad nacional')) {
    return {
      src: '/assets/aistudio/image_63a79417.png',
      alt: 'Escudo Histórico Universidad Nacional',
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
  if (
    isCucutaDeportivo &&
    startYear !== null &&
    startYear >= 1972 &&
    startYear <= 2005
  ) {
    return {
      src: '/assets/aistudio/cucuta_deportivo_1972-2005_570a5c06.png',
      alt: 'Escudo Histórico Cúcuta Deportivo 1972-2005',
    };
  }

  const isAtleticoBucaramanga = lower.includes('bucaramanga');
  if (
    isAtleticoBucaramanga &&
    startYear !== null &&
    startYear >= 1950 &&
    startYear <= 1956
  ) {
    return {
      src: '/assets/aistudio/bucaramanga_1950-1957_80f6c063.png',
      alt: 'Escudo Histórico Atlético Bucaramanga 1950-1957',
    };
  }
  if (
    isAtleticoBucaramanga &&
    startYear !== null &&
    startYear >= 1957 &&
    startYear <= 1985
  ) {
    return {
      src: '/assets/aistudio/bucaramanga_1957-1985_9fd1460e.png',
      alt: 'Escudo Histórico Atlético Bucaramanga 1957-1985',
    };
  }
  if (
    isAtleticoBucaramanga &&
    startYear !== null &&
    startYear >= 1986 &&
    startYear <= 1996
  ) {
    return {
      src: '/assets/aistudio/bucaramanga_1986-1996_91b42c33.png',
      alt: 'Escudo Histórico Atlético Bucaramanga 1986-1996',
    };
  }
  if (
    isAtleticoBucaramanga &&
    startYear !== null &&
    startYear >= 1997 &&
    startYear <= 1999
  ) {
    return {
      src: '/assets/aistudio/bucaramanga_1997-2000_0f96a4fa.png',
      alt: 'Escudo Histórico Atlético Bucaramanga 1997-2000',
    };
  }
  if (
    isAtleticoBucaramanga &&
    startYear !== null &&
    startYear >= 2000 &&
    startYear <= 2009
  ) {
    return {
      src: '/assets/aistudio/bucaramanga_2000-2009_d6d21063.png',
      alt: 'Escudo Histórico Atlético Bucaramanga 2000-2009',
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
  if (
    isSportingBarranquilla &&
    startYear !== null &&
    startYear >= 1988 &&
    startYear <= 1990
  ) {
    return {
      src: '/assets/aistudio/sporting_del_88_al_90_ce1415f4.png',
      alt: 'Escudo Histórico Sporting de Barranquilla 1988-1990',
    };
  }
  if (isSportingBarranquilla && startYear === 1991) {
    return {
      src: '/assets/aistudio/sporting_del_1991_ea5b0c81.png',
      alt: 'Escudo Histórico Sporting de Barranquilla 1991',
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
  if (isDeportivoPereira && startYear === 1990) {
    return {
      src: '/assets/aistudio/PEREIRA_DEL_90_c5870e7b.png',
      alt: 'Escudo Histórico Deportivo Pereira 1990',
    };
  }
  if (
    isDeportivoPereira &&
    startYear !== null &&
    startYear >= 1991 &&
    startYear <= 1993
  ) {
    return {
      src: '/assets/aistudio/PEREIRA_DEL_91-93_c728df5f.png',
      alt: 'Escudo Histórico Deportivo Pereira 1991-1993',
    };
  }
  if (
    isDeportivoPereira &&
    startYear !== null &&
    startYear >= 1994 &&
    startYear <= 1997
  ) {
    return {
      src: '/assets/aistudio/PEREIRA_DEL_94-97_f66c1f46.png',
      alt: 'Escudo Histórico Deportivo Pereira 1994-1997',
    };
  }
  if (
    isDeportivoPereira &&
    startYear !== null &&
    startYear >= 2001 &&
    startYear <= 2005
  ) {
    return {
      src: '/assets/aistudio/PEREIRA_DEL_2001-2005_2a6a9e8e.png',
      alt: 'Escudo Histórico Deportivo Pereira 2001-2005',
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
    startYear <= 1966
  ) {
    return {
      src: '/assets/aistudio/quindio_del_51_al_67_d5631340.png',
      alt: 'Escudo Histórico Deportes Quindío 1951-1967',
    };
  }
  if (
    isDeportesQuindio &&
    startYear !== null &&
    startYear >= 1967 &&
    startYear <= 1986
  ) {
    return {
      src: '/assets/aistudio/quindio_del_67_al_86_9cf838c0.png',
      alt: 'Escudo Histórico Deportes Quindío 1967-1986',
    };
  }
  if (
    isDeportesQuindio &&
    startYear !== null &&
    startYear >= 1987 &&
    startYear <= 1990
  ) {
    return {
      src: '/assets/aistudio/quindio_del_87_al_90_68f06640.png',
      alt: 'Escudo Histórico Deportes Quindío 1987-1990',
    };
  }
  if (
    isDeportesQuindio &&
    startYear !== null &&
    startYear >= 1991 &&
    startYear <= 1996
  ) {
    return {
      src: '/assets/aistudio/quindio_del_91_al_96_16f4c349.png',
      alt: 'Escudo Histórico Deportes Quindío 1991-1996',
    };
  }
  if (
    isDeportesQuindio &&
    startYear !== null &&
    startYear >= 1997 &&
    startYear <= 2017
  ) {
    return {
      src: '/assets/aistudio/quindio_del_97_al_2017_a0600b91.png',
      alt: 'Escudo Histórico Deportes Quindío 1997-2017',
    };
  }

  const isDeportesTolima = lower.includes('tolima');
  if (
    isDeportesTolima &&
    startYear !== null &&
    startYear >= 1966 &&
    startYear <= 1997
  ) {
    return {
      src: '/assets/aistudio/tolima_del_66_al_97_98e00cd9.png',
      alt: 'Escudo Histórico Deportes Tolima 1966-1997',
    };
  }
  if (
    isDeportesTolima &&
    startYear !== null &&
    startYear >= 1998 &&
    startYear <= 2003
  ) {
    return {
      src: '/assets/aistudio/tolima_del_98_al_2003_60f7af16.png',
      alt: 'Escudo Histórico Deportes Tolima 1998-2003',
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

  const isRealCartagena =
    lower.includes('real cartagena') || lower.includes('r. cartagena');
  if (
    isRealCartagena &&
    startYear !== null &&
    startYear >= 1971 &&
    startYear <= 2013
  ) {
    return {
      src: '/assets/aistudio/Escudo_Real_Cartagena__antiguo__4f756fbf.png',
      alt: 'Escudo Histórico Real Cartagena 1971-2013',
    };
  }

  if (lower.includes('oro negro')) {
    return {
      src: '/assets/aistudio/cd_oro_negro_barrancabermeja_2017-presente-AwvJV6bkxQh9lNXq_b9c7d4e1.webp',
      alt: 'Escudo Histórico Oro Negro de Barrancabermeja',
    };
  }

  if (lower.includes('envigado')) {
    return {
      src: '/assets/aistudio/escudo_envigado_9ca4099e.png',
      alt: 'Escudo Oficial Envigado F.C.',
    };
  }

  if (lower.includes('huila')) {
    return {
      src: '/assets/aistudio/Escudo_de_Atl_tico_Huila.svg_6eeb5b7d.webp',
      alt: 'Escudo Oficial Atlético Huila',
    };
  }

  const isCortulua = lower.includes('cortuluá') || lower.includes('cortulua');
  if (
    isCortulua &&
    startYear !== null &&
    startYear >= 1967 &&
    startYear <= 1999
  ) {
    return {
      src: '/assets/aistudio/cortulua-_1967-1999-m7VqpkMKwLIXBo5b_e6ef3247.webp',
      alt: 'Escudo Histórico Cortuluá 1967-1999',
    };
  }
  if (
    isCortulua &&
    startYear !== null &&
    startYear >= 2000 &&
    startYear <= 2021
  ) {
    return {
      src: '/assets/aistudio/cortulua-2000-m7VqpkMKwLIXBo5b_09dbf112.webp',
      alt: 'Escudo Histórico Cortuluá 2000-2021',
    };
  }

  if (
    lower.includes('unicosta') &&
    startYear !== null &&
    startYear >= 1995 &&
    startYear <= 1999
  ) {
    return {
      src: '/assets/aistudio/cd_unicosta_barranquilla_1995_1999-L9OGcEHewWNAN9yR_c7fc6da3.webp',
      alt: 'Escudo Histórico Deportivo Unicosta 1995-1999',
    };
  }

  if (lower.includes('pasto') && startYear === 1999) {
    return {
      src: '/assets/aistudio/deportivo_pasto_1999-2006-Aq2eW8GGN2FWMLkr_a9eeaa6f.webp',
      alt: 'Escudo Histórico Deportivo Pasto 1999',
    };
  }
  if (
    lower.includes('pasto') &&
    startYear !== null &&
    startYear >= 2000 &&
    startYear <= 2006
  ) {
    return {
      src: '/assets/aistudio/deportivo_pasto_2000-2006-Aq2eW8GGN2FWMLkr_9ef8c98d.webp',
      alt: 'Escudo Histórico Deportivo Pasto 2000-2006',
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
  | 'regularGroup'
  | 'secondaryRegular'
  | 'tertiaryRegular'
  | 'finalGroup'
  | 'finalSummary';

export interface TournamentClassificationMeta {
  id?: string;
  championTeam: string;
  runnerUpTeam?: string;
  juniorFinish?: string;
  isJuniorChampion?: boolean;
  isJuniorRunnerUp?: boolean;
  hasFinalPhase?: boolean;
  phaseType?: string;
  rows?: { pos: number; team: string; statusBadge?: string }[];
  regularRows?: { pos: number; team: string; statusBadge?: string }[];
  regularGroups?: {
    groupName: string;
    rows: { pos: number; team: string; statusBadge?: string }[];
  }[];
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

  // 0. Explicit runnerUpTeam metadata (authoritative when present)
  if (t.runnerUpTeam && t.runnerUpTeam.trim()) {
    return normalizeClubKey(t.runnerUpTeam);
  }

  // 1. Direct Gran Final / Final match between two teams (excluding round-robin group titles)
  if (t.playoffMatches && t.playoffMatches.length > 0 && championKey) {
    const finalMatches = t.playoffMatches.filter((m) => {
      const st = (m.stage || '').toLowerCase();
      const isFinalWord = /\bfinal\b/.test(st);
      const isRoundRobinOrEarly =
        st.includes('cuadrangular') ||
        st.includes('cuad.') ||
        st.includes('hexagonal') ||
        st.includes('octogonal') ||
        st.includes('triangular') ||
        st.includes('semifinal') ||
        st.includes('cuartos') ||
        st.includes('grupo') ||
        st.includes('fecha ');
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

  // Regular / Regular Groups (Finalización Grupo A y B) / Secondary & Tertiary regular phases
  if (
    context === 'regular' ||
    context === 'regularGroup' ||
    context === 'secondaryRegular' ||
    context === 'tertiaryRegular'
  ) {
    if (t.id === '2020-playoffs') {
      if (isChamp) return 'Campeón ★';
      if (isRunnerUp) return 'Subcampeón 🥈';
      if (row.pos === 1) return 'Líder · Clasificado';
      return row.pos <= 8 ? 'Clasificado' : 'Liguilla';
    }

    // Apertura table feeding directly into Finalización Grupo A (1-7) & Grupo B (8-14)
    if (context === 'regular' && t.regularGroups && t.regularGroups.length >= 2) {
      if (row.pos === 1) return 'Líder · Grupo A';
      return row.pos <= 7 ? 'Grupo A' : 'Grupo B';
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

    if (context === 'regularGroup') {
      if (row.pos === 1) {
        return didQualify ? 'Líder · Clasificado' : 'Líder Grupo';
      }
      return didQualify ? 'Clasificado' : 'Eliminado';
    }

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

export type MatchArchiveLapFilter =
  | 'all'
  | '1'
  | '2'
  | '3'
  | '4'
  | 'apertura'
  | 'finalizacion'
  | 'cuadrangular'
  | 'cuartos'
  | 'semifinal'
  | 'triangular'
  | 'hexagonal'
  | 'octogonal'
  | 'desempate'
  | 'final';
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
  if (totalMatches === 50) {
    const trimmed = (round || '').trim();
    if (/^cuadrangular[oó]n/i.test(trimmed)) {
      return 5;
    }
    if (/^copa\s+mustang\s+i\b/i.test(trimmed)) {
      const roundNum = extractMatchRoundNumber(trimmed);
      if (roundNum !== null) {
        return roundNum <= 15 ? 1 : 2;
      }
      if (index !== undefined && index >= 0 && index < 36) {
        return index < 15 ? 1 : 2;
      }
      return 1;
    }
    if (/^copa\s+mustang\s+ii\b/i.test(trimmed)) {
      return 3;
    }
    if (/^cuad(?:\.|rangular)\s+final\b/i.test(trimmed)) {
      return 5;
    }
    if (/^semif(?:inal|\.)\s*b\b/i.test(trimmed)) {
      return 7;
    }
    if (/^apertura\s*·/i.test(trimmed)) {
      return 1;
    }
    if (/^finalizaci[oó]n\s*·/i.test(trimmed)) {
      return 3;
    }
    const roundNum = extractMatchRoundNumber(round);
    if (roundNum !== null && roundNum >= 1 && roundNum <= 50) {
      if (roundNum <= 13) return 1;
      if (roundNum <= 26) return 2;
      if (roundNum <= 38) return 3;
      return 4;
    }
    if (index !== undefined && index >= 0 && index < 50) {
      if (index < 13) return 1;
      if (index < 26) return 2;
      if (index < 38) return 3;
      return 4;
    }
    return null;
  }

  if (totalMatches === 53) {
    if (/semif(?:inal|\.)|cuad(?:rangular|\.)/i.test(round || '')) {
      return 7;
    }
    const roundNum = extractMatchRoundNumber(round);
    if (roundNum !== null && roundNum >= 1 && roundNum <= 47) {
      if (roundNum <= 13) return 1;
      if (roundNum <= 26) return 2;
      if (roundNum <= 38) return 3;
      return 4;
    }
    if (index !== undefined && index >= 0 && index < 53) {
      if (index < 13) return 1;
      if (index < 26) return 2;
      if (index < 38) return 3;
      if (index < 47) return 4;
      return 7;
    }
    return null;
  }

  if (totalMatches === 57 || totalMatches === 59 || totalMatches === 61) {
    if (/desempate/i.test(round || '')) {
      return 6;
    }
    if (/semif(?:inal|\.)/i.test(round || '')) {
      return 7;
    }
    if (/hex(?:agonal|\.)|cuad(?:rangular|\.)\s*final|octog(?:onal|\.)/i.test(round || '')) {
      return 5;
    }
    const roundNum = extractMatchRoundNumber(round);
    if (roundNum !== null && roundNum >= 1 && roundNum <= 47) {
      if (roundNum <= 13) return 1;
      if (roundNum <= 26) return 2;
      if (roundNum <= 38) return 3;
      return 4;
    }
    if (index !== undefined && index >= 0 && index < totalMatches) {
      if (index < 13) return 1;
      if (index < 26) return 2;
      if (totalMatches === 61) {
        if (index < 28) return 6;
        if (index < 40) return 3;
        if (index < 49) return 4;
        if (index < 55) return 7;
        return 5;
      }
      if (totalMatches === 59) {
        if (index < 28) return 6;
        if (index < 40) return 3;
        if (index < 49) return 4;
        return 5;
      }
      if (index < 38) return 3;
      if (index < 47) return 4;
      return 5;
    }
    return null;
  }

  if (totalMatches === 52 || totalMatches === 56 || totalMatches === 58) {
    if (totalMatches === 56 && /serie\s*extra|bonificaci[oó]n|desempate/i.test(round || '')) {
      return 6;
    }
    if (totalMatches === 56 && /octog(?:onal|\.)/i.test(round || '')) {
      return 5;
    }
    if (totalMatches === 56 && /copa\s+de\s+la\s+paz/i.test(round || '')) {
      return 1;
    }
    if (totalMatches === 56 && /torneo\s+nacional/i.test(round || '')) {
      const roundNum = extractMatchRoundNumber(round);
      if (roundNum !== null && roundNum >= 1 && roundNum <= 26) {
        return roundNum <= 13 ? 3 : 4;
      }
      if (index !== undefined && index >= 16 && index < 42) {
        return index < 29 ? 3 : 4;
      }
    }
    if (totalMatches === 58 && /cuad(?:rangular|\.)/i.test(round || '')) {
      return 5;
    }
    if (totalMatches === 56 && /triang(?:ular|\.)/i.test(round || '')) {
      return 5;
    }
    const roundNum = extractMatchRoundNumber(round);
    if (roundNum !== null && roundNum >= 1 && roundNum <= 52) {
      return Math.ceil(roundNum / 13);
    }
    if (index !== undefined && index >= 0 && index < 52) {
      return Math.floor(index / 13) + 1;
    }
    if (totalMatches === 58 && index !== undefined && index >= 52 && index < 58) {
      return 5;
    }
    if (totalMatches === 56 && index !== undefined && index >= 52 && index < 56) {
      return 5;
    }
    return null;
  }

  if (totalMatches === 36) {
    if (/pent(?:agonal|\.)/i.test(round || '')) return 1;
    if (/triang(?:ular|\.)/i.test(round || '')) return 2;
    if (/finaliz(?:aci[oó]n|\.)/i.test(round || '')) return 3;
    if (/octog(?:onal|\.)/i.test(round || '')) return 5;
    if (index !== undefined && index >= 0 && index < 36) {
      if (index < 8) return 1;
      if (index < 12) return 2;
      if (index < 22) return 3;
      return 5;
    }
    return null;
  }

  if (totalMatches === 40) {
    const trimmed = (round || '').trim();
    if (/^pent(?:agonal|\.)/i.test(trimmed)) return 1;
    if (/^triang(?:ular|\.)/i.test(trimmed)) return 2;
    if (/^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test(trimmed)) {
      const fMatch = /F(\d+)|Fecha\s+(\d+)/i.exec(trimmed);
      if (fMatch) {
        const fNum = Number(fMatch[1] || fMatch[2]);
        return fNum <= 31 ? 3 : 4;
      }
      if (index !== undefined && index >= 12 && index < 40) {
        return index < 26 ? 3 : 4;
      }
      return 3;
    }
    if (index !== undefined && index >= 0 && index < 40) {
      if (index < 8) return 1;
      if (index < 12) return 2;
      if (index < 26) return 3;
      return 4;
    }
    return null;
  }

  if (totalMatches === 54) {
    const trimmed = (round || '').trim();
    if (/^(?:copa\s+mustang\s+i\b|ap(?:ertura|\.)\s*·)/i.test(trimmed)) return 1;
    if (/^(?:copa\s+mustang\s+ii\b|fin(?:alizaci[oó]n|\.)\s*·)/i.test(trimmed)) {
      const fMatch = /Fecha\s+(\d+)/i.exec(trimmed);
      if (fMatch) {
        return Number(fMatch[1]) <= 15 ? 3 : 4;
      }
      if (index !== undefined && index >= 18 && index < 48) {
        return index < 33 ? 3 : 4;
      }
      return 3;
    }
    if (/semif(?:inal|\.)|cuad(?:rangular|\.)/i.test(trimmed)) return 7;
    if (index !== undefined && index >= 0 && index < 54) {
      if (index < 18) return 1;
      if (index < 33) return 3;
      if (index < 48) return 4;
      return 7;
    }
    return null;
  }

  if (totalMatches === 46) {
    const trimmed = (round || '').trim();
    if (/^(?:copa\s+mustang\s+i\b|ap(?:ertura|\.)\s*·)/i.test(trimmed)) {
      const fMatch = /Fecha\s+(\d+)/i.exec(trimmed);
      if (fMatch) {
        return Number(fMatch[1]) <= 16 ? 1 : 2;
      }
      if (index !== undefined && index >= 0 && index < 32) {
        return index < 16 ? 1 : 2;
      }
      return 1;
    }
    if (/^(?:copa\s+mustang\s+ii\b|fin(?:alizaci[oó]n|\.)\s*·)/i.test(trimmed)) {
      return 3;
    }
  }

  if (totalMatches === 44) {
    const trimmed = (round || '').trim();
    if (/^apertura\s*·/i.test(trimmed)) return 1;
    if (/^finalizaci[oó]n\s*·/i.test(trimmed)) return 3;
    return null;
  }

  if (totalMatches === 28) {
    const trimmed = (round || '').trim();
    if (/^primera\s+fase/i.test(trimmed)) return 1;
    if (/^regional\s+d\b/i.test(trimmed)) return 3;
    if (/^semif(?:inal|\.)\s*b\b/i.test(trimmed)) return 7;
    if (/^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test(trimmed)) return 1;
    if (/^cuad(?:rangular|\.)\s*[ab]\b/i.test(trimmed)) return 7;
    if (/^gran\s+final\b/i.test(trimmed)) return 8;
  }

  if (totalMatches === 26) {
    const trimmed = (round || '').trim();
    if (/^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test(trimmed)) return 1;
    if (/^cuad(?:rangular|\.)\s*[ab]\b/i.test(trimmed)) return 7;
    if (/^cuartos\b/i.test(trimmed)) return 9;
    if (/^semif(?:inal|\.)\b/i.test(trimmed)) return 7;
    if (/^gran\s+final\b/i.test(trimmed)) return 8;
  }

  if (totalMatches === 25) {
    const trimmed = (round || '').trim();
    if (/^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test(trimmed)) return 1;
    if (/^cuad(?:rangular|\.)\s*[ab]\b/i.test(trimmed)) return 7;
    if (/^cuartos\b/i.test(trimmed)) return 9;
    if (/^semif(?:inal|\.)\b/i.test(trimmed)) return 7;
    if (/^gran\s+final\b/i.test(trimmed)) return 8;
  }

  if (totalMatches === 24) {
    const trimmed = (round || '').trim();
    if (/^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test(trimmed)) return 1;
    if (/^cuad(?:rangular|\.)\s*[ab]\b/i.test(trimmed)) return 7;
    if (/^cuartos\b/i.test(trimmed)) return 9;
    if (/^semif(?:inal|\.)\b/i.test(trimmed)) return 7;
    if (/^gran\s+final\b/i.test(trimmed)) return 8;
  }

  if (totalMatches === 22 || totalMatches === 21) {
    const trimmed = (round || '').trim();
    if (/^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test(trimmed)) return 1;
    if (/^cuartos\b/i.test(trimmed)) return 9;
    if (/^semif(?:inal|\.)\b/i.test(trimmed)) return 7;
    if (/^gran\s+final\b/i.test(trimmed)) return 8;
  }

  if (totalMatches === 34) {
    const trimmed = (round || '').trim();
    if (/^(?:apertura|ap\.)/i.test(trimmed)) return 1;
    if (/^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test(trimmed)) return 3;
    if (/cuad(?:rangular|\.)|semif(?:inal|\.)/i.test(trimmed)) return 7;
  }

  if (totalMatches === 14) {
    const trimmed = (round || '').trim();
    if (/^(?:apertura|ap\.)/i.test(trimmed)) return 1;
    if (/^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test(trimmed)) return 3;
    if (/cuad(?:rangular|\.)\s*final/i.test(trimmed)) return 5;
    if (/cuad(?:rangular|\.)\s*a|semif(?:inal|\.)/i.test(trimmed)) return 7;
    return null;
  }

  if (totalMatches === 12) {
    const trimmed = (round || '').trim();
    if (/^(?:apertura|ap\.)/i.test(trimmed)) return 1;
    if (/^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test(trimmed)) return 3;
    if (/cuad(?:rangular|\.)\s*final/i.test(trimmed)) return 5;
    if (/cuad(?:rangular|\.)\s*b|semif(?:inal|\.)/i.test(trimmed)) return 7;
    return null;
  }

  if (totalMatches === 11) {
    const trimmed = (round || '').trim();
    if (/desempate/i.test(trimmed)) return 6;
    if (/cuad(?:rangular|\.)\s*final/i.test(trimmed)) return 5;
    if (/cuad(?:rangular|\.)\s*a|semif(?:inal|\.)/i.test(trimmed)) return 7;
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
  totalMatches: number,
  matches?: Pick<MatchArchiveEntry, 'round' | 'date' | 'note'>[]
): MatchArchiveLapOption[] {
  if (totalMatches === 61) {
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    const hasDesempateTags =
      Array.isArray(matches) &&
      matches.some((m) => /desempate/i.test(m.round || ''));
    const hasSemifinalTags =
      Array.isArray(matches) &&
      matches.some((m) => /semif(?:inal|\.)/i.test(m.round || ''));
    const hasCuadrangularFinalTags =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*final/i.test(m.round || ''));
    if (hasSemesterTags && hasDesempateTags && hasSemifinalTags && hasCuadrangularFinalTags) {
      const finSlice = matches.slice(28, 49);
      const intragroupSlice = finSlice.filter(
        (m) => !/intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`)
      );
      const isGroupB = intragroupSlice.some((m) =>
        /grupo\s*b/i.test(`${m.date || ''} ${m.note || ''}`)
      );
      const groupLabel = isGroupB ? 'Grupo B' : 'Grupo A';
      const hasInterleavedFinalizacion = matches
        .slice(28, 40)
        .some((m) => /intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`));
      return [
        { id: 'all', label: 'Todas (61)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'desempate', label: 'Desempate Ap. (2)' },
        { id: 'finalizacion', label: 'Finalización (27–47)' },
        { id: 'semifinal', label: 'Cuadrangular Semif. (6)' },
        { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        {
          id: '3',
          label: hasInterleavedFinalizacion ? `Fin. ${groupLabel} (12)` : `Fin. ${groupLabel} (27–38)`,
        },
        {
          id: '4',
          label: hasInterleavedFinalizacion ? 'Fin. Intergrupos (9)' : 'Fin. Intergrupos (39–47)',
        },
      ];
    }
    const hasOctogonalTags =
      Array.isArray(matches) &&
      matches.some((m) => /octog(?:onal|\.)/i.test(m.round || ''));
    if (hasSemesterTags && hasOctogonalTags) {
      const finSlice = matches.slice(26, 47);
      const intragroupSlice = finSlice.filter(
        (m) => !/intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`)
      );
      const isGroupB = intragroupSlice.some((m) =>
        /grupo\s*b/i.test(`${m.date || ''} ${m.note || ''}`)
      );
      const groupLabel = isGroupB ? 'Grupo B' : 'Grupo A';
      const hasInterleavedFinalizacion = matches
        .slice(26, 38)
        .some((m) => /intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`));
      return [
        { id: 'all', label: 'Todas (61)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–47)' },
        { id: 'octogonal', label: 'Octogonal Final (14)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        {
          id: '3',
          label: hasInterleavedFinalizacion ? `Fin. ${groupLabel} (12)` : `Fin. ${groupLabel} (27–38)`,
        },
        {
          id: '4',
          label: hasInterleavedFinalizacion ? 'Fin. Intergrupos (9)' : 'Fin. Intergrupos (39–47)',
        },
      ];
    }
  }

  if (totalMatches === 59) {
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    const hasHexagonalTags =
      Array.isArray(matches) &&
      matches.some((m) => /hex(?:agonal|\.)/i.test(m.round || ''));
    const hasDesempateTags =
      Array.isArray(matches) &&
      matches.some((m) => /desempate/i.test(m.round || ''));
    if (hasSemesterTags && hasHexagonalTags && hasDesempateTags) {
      const hasInterleavedFinalizacion =
        Array.isArray(matches) &&
        matches
          .slice(28, 40)
          .some((m) => /intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`));
      return [
        { id: 'all', label: 'Todas (59)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'desempate', label: 'Desempate Ap. (2)' },
        { id: 'finalizacion', label: 'Finalización (27–47)' },
        { id: 'hexagonal', label: 'Hexagonal Final (10)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        {
          id: '3',
          label: hasInterleavedFinalizacion ? 'Fin. Grupo A (12)' : 'Fin. Grupo A (27–38)',
        },
        {
          id: '4',
          label: hasInterleavedFinalizacion ? 'Fin. Intergrupos (9)' : 'Fin. Intergrupos (39–47)',
        },
      ];
    }
    const hasSemifinalTags =
      Array.isArray(matches) &&
      matches.some((m) => /semif(?:inal|\.)/i.test(m.round || ''));
    const hasCuadrangularFinalTags =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*final/i.test(m.round || ''));
    if (hasSemesterTags && hasSemifinalTags && hasCuadrangularFinalTags) {
      const finSlice = matches.slice(26, 47);
      const intragroupSlice = finSlice.filter(
        (m) => !/intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`)
      );
      const isGroupB = intragroupSlice.some((m) =>
        /grupo\s*b/i.test(`${m.date || ''} ${m.note || ''}`)
      );
      const groupLabel = isGroupB ? 'Grupo B' : 'Grupo A';
      const hasInterleavedFinalizacion = matches
        .slice(26, 38)
        .some((m) => /intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`));
      return [
        { id: 'all', label: 'Todas (59)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–47)' },
        { id: 'semifinal', label: 'Cuadrangular Semif. (6)' },
        { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        {
          id: '3',
          label: hasInterleavedFinalizacion ? `Fin. ${groupLabel} (12)` : `Fin. ${groupLabel} (27–38)`,
        },
        {
          id: '4',
          label: hasInterleavedFinalizacion ? 'Fin. Intergrupos (9)' : 'Fin. Intergrupos (39–47)',
        },
      ];
    }
  }

  if (totalMatches === 53) {
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    const hasSemifinalTags =
      Array.isArray(matches) &&
      matches.some((m) => /semif(?:inal|\.)|cuad(?:rangular|\.)/i.test(m.round || ''));
    if (hasSemesterTags && hasSemifinalTags) {
      const finSlice = matches.slice(26, 38);
      const isGroupB = finSlice.some((m) => /grupo\s*b/i.test(`${m.date || ''} ${m.note || ''}`));
      const groupLabel = isGroupB ? 'Grupo B' : 'Grupo A';
      return [
        { id: 'all', label: 'Todas (53)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–47)' },
        { id: 'semifinal', label: 'Cuadrangular Semif. (6)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        { id: '3', label: `Fin. ${groupLabel} (27–38)` },
        { id: '4', label: 'Fin. Intergrupos (39–47)' },
      ];
    }
  }

  if (totalMatches === 57) {
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    const hasHexagonalTags =
      Array.isArray(matches) &&
      matches.some((m) => /hex(?:agonal|\.)/i.test(m.round || ''));
    if (hasSemesterTags && hasHexagonalTags) {
      const hasInterleavedFinalizacion =
        Array.isArray(matches) &&
        matches
          .slice(26, 38)
          .some((m) => /intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`));
      return [
        { id: 'all', label: 'Todas (57)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–47)' },
        { id: 'hexagonal', label: 'Hexagonal Final (10)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        {
          id: '3',
          label: hasInterleavedFinalizacion ? 'Fin. Grupo A (12)' : 'Fin. Grupo A (27–38)',
        },
        {
          id: '4',
          label: hasInterleavedFinalizacion ? 'Fin. Intergrupos (9)' : 'Fin. Intergrupos (39–47)',
        },
      ];
    }
  }

  if (totalMatches === 56) {
    const hasCopaPazTags =
      Array.isArray(matches) &&
      matches.some((m) => /copa\s+de\s+la\s+paz/i.test(m.round || ''));
    const hasOctogonalTags =
      Array.isArray(matches) &&
      matches.some((m) => /octog(?:onal|\.)/i.test(m.round || ''));
    if (hasCopaPazTags && hasOctogonalTags) {
      return [
        { id: 'all', label: 'Todas (56)' },
        { id: 'apertura', label: 'Copa de la Paz (14)' },
        { id: 'desempate', label: 'Serie Extra (2)' },
        { id: 'finalizacion', label: 'Torneo Nacional (26)' },
        { id: 'octogonal', label: 'Octogonal Final (14)' },
        { id: '3', label: 'Nac. 1.ª Vta (1–13)' },
        { id: '4', label: 'Nac. 2.ª Vta (14–26)' },
      ];
    }
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    const hasTriangularTags =
      Array.isArray(matches) &&
      matches.some((m) => /triang(?:ular|\.)/i.test(m.round || ''));
    if (hasSemesterTags && hasTriangularTags) {
      return [
        { id: 'all', label: 'Todas (56)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–52)' },
        { id: 'triangular', label: 'Triangular Final (4)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        { id: '3', label: 'Fin. 1.ª Vta (27–39)' },
        { id: '4', label: 'Fin. 2.ª Vta (40–52)' },
      ];
    }
  }

  if (totalMatches === 58) {
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    const hasCuadrangularTags =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)/i.test(m.round || ''));
    if (hasSemesterTags && hasCuadrangularTags) {
      return [
        { id: 'all', label: 'Todas (58)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–52)' },
        { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        { id: '3', label: 'Fin. 1.ª Vta (27–39)' },
        { id: '4', label: 'Fin. 2.ª Vta (40–52)' },
      ];
    }
  }

  if (totalMatches === 50) {
    const hasCM1 =
      Array.isArray(matches) &&
      matches.some((m) => /^copa\s+mustang\s+i\b/i.test((m.round || '').trim()));
    const hasCuadRegional =
      Array.isArray(matches) &&
      matches.some((m) => /^cuadrangular[oó]n/i.test((m.round || '').trim()));
    const hasCM2 =
      Array.isArray(matches) &&
      matches.some((m) => /^copa\s+mustang\s+ii\b/i.test((m.round || '').trim()));
    if (hasCM1 && hasCuadRegional && hasCM2) {
      return [
        { id: 'all', label: 'Todas (50)' },
        { id: 'apertura', label: 'Apertura · CM I (36)' },
        { id: 'cuadrangular', label: 'Cuadrangularón D (6)' },
        { id: 'finalizacion', label: 'Finalización · Gr. A (14)' },
        { id: '1', label: 'CM I · 1.ª Vta (1–15)' },
        { id: '2', label: 'CM I · 2.ª Vta (22–36)' },
      ];
    }
    const hasAp1999 =
      Array.isArray(matches) &&
      matches.some((m) => /^apertura\s*·/i.test((m.round || '').trim()));
    const hasFin1999 =
      Array.isArray(matches) &&
      matches.some((m) => /^finalizaci[oó]n\s*·/i.test((m.round || '').trim()));
    const hasSemi1999 =
      Array.isArray(matches) &&
      matches.some((m) => /^semif(?:inal|\.)\s*b\b/i.test((m.round || '').trim()));
    if (hasAp1999 && hasFin1999 && hasSemi1999) {
      return [
        { id: 'all', label: 'Todas (50)' },
        { id: 'apertura', label: 'Apertura (22)' },
        { id: 'finalizacion', label: 'Finalización (22)' },
        { id: 'semifinal', label: 'Cuad. Semifinal B (6)' },
      ];
    }
    const hasCuadFinal2000 =
      Array.isArray(matches) &&
      matches.some((m) => /^cuad(?:\.|rangular)\s+final\b/i.test((m.round || '').trim()));
    if (hasAp1999 && hasFin1999 && hasCuadFinal2000) {
      return [
        { id: 'all', label: 'Todas (50)' },
        { id: 'apertura', label: 'Apertura (22)' },
        { id: 'finalizacion', label: 'Finalización (22)' },
        { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
      ];
    }
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    if (hasSemesterTags) {
      return [
        { id: 'all', label: 'Todas (50)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–50)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        { id: '3', label: 'Fin. 1.ª Vta (27–38)' },
        { id: '4', label: 'Fin. 2.ª Vta (39–50)' },
      ];
    }
    return [
      { id: 'all', label: 'Todas (50)' },
      { id: '1', label: '1.ª Vuelta (1–13)' },
      { id: '2', label: '2.ª Vuelta (14–26)' },
      { id: '3', label: '3.ª Vuelta (27–38)' },
      { id: '4', label: '4.ª Vuelta (39–50)' },
    ];
  }

  if (totalMatches === 52) {
    const hasSemesterTags =
      Array.isArray(matches) &&
      matches.some((m) => /apertura|finalizaci[oó]n/i.test(m.round || ''));
    if (hasSemesterTags) {
      return [
        { id: 'all', label: 'Todas (52)' },
        { id: 'apertura', label: 'Apertura (1–26)' },
        { id: 'finalizacion', label: 'Finalización (27–52)' },
        { id: '1', label: 'Ap. 1.ª Vta (1–13)' },
        { id: '2', label: 'Ap. 2.ª Vta (14–26)' },
        { id: '3', label: 'Fin. 1.ª Vta (27–39)' },
        { id: '4', label: 'Fin. 2.ª Vta (40–52)' },
      ];
    }
    return [
      { id: 'all', label: 'Todas (52)' },
      { id: '1', label: '1.ª Vuelta (1–13)' },
      { id: '2', label: '2.ª Vuelta (14–26)' },
      { id: '3', label: '3.ª Vuelta (27–39)' },
      { id: '4', label: '4.ª Vuelta (40–52)' },
    ];
  }

  if (totalMatches === 54) {
    const hasCM1 =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:copa\s+mustang\s+i\b|ap(?:ertura|\.)\s*·)/i.test((m.round || '').trim()));
    const hasCM2 =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:copa\s+mustang\s+ii\b|fin(?:alizaci[oó]n|\.)\s*·)/i.test((m.round || '').trim()));
    const hasSemi =
      Array.isArray(matches) &&
      matches.some((m) => /semif(?:inal|\.)|cuad(?:rangular|\.)/i.test(m.round || ''));
    if (hasCM1 && hasCM2 && hasSemi) {
      return [
        { id: 'all', label: 'Todas (54)' },
        { id: 'apertura', label: 'Copa Mustang I (18)' },
        { id: 'finalizacion', label: 'Copa Mustang II (30)' },
        { id: 'semifinal', label: 'Cuad. Semifinal B (6)' },
        { id: '3', label: 'Fin. 1.ª Vta (1–15)' },
        { id: '4', label: 'Fin. 2.ª Vta (16–30)' },
      ];
    }
  }

  if (totalMatches === 46) {
    const hasCM1 =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:copa\s+mustang\s+i\b|ap(?:ertura|\.)\s*·)/i.test((m.round || '').trim()));
    const hasCM2 =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:copa\s+mustang\s+ii\b|fin(?:alizaci[oó]n|\.)\s*·)/i.test((m.round || '').trim()));
    if (hasCM1 && hasCM2) {
      return [
        { id: 'all', label: 'Todas (46)' },
        { id: 'apertura', label: 'Copa Mustang I (32)' },
        { id: 'finalizacion', label: 'Copa Mustang II (14)' },
        { id: '1', label: 'CM I · 1.ª Vta (1–16)' },
        { id: '2', label: 'CM I · 2.ª Vta (17–32)' },
      ];
    }
  }

  if (totalMatches === 44) {
    const hasAp2001 =
      Array.isArray(matches) &&
      matches.some((m) => /^apertura\s*·/i.test((m.round || '').trim()));
    const hasFin2001 =
      Array.isArray(matches) &&
      matches.some((m) => /^finalizaci[oó]n\s*·/i.test((m.round || '').trim()));
    if (hasAp2001 && hasFin2001) {
      return [
        { id: 'all', label: 'Todas (44)' },
        { id: 'apertura', label: 'Apertura (22)' },
        { id: 'finalizacion', label: 'Finalización (22)' },
      ];
    }
  }

  if (totalMatches === 28) {
    const hasPrimera =
      Array.isArray(matches) &&
      matches.some((m) => /^primera\s+fase/i.test((m.round || '').trim()));
    const hasRegional =
      Array.isArray(matches) &&
      matches.some((m) => /^regional\s+d\b/i.test((m.round || '').trim()));
    const hasSemi =
      Array.isArray(matches) &&
      matches.some((m) => /^semif(?:inal|\.)\s*b\b/i.test((m.round || '').trim()));
    if (hasPrimera && hasRegional && hasSemi) {
      return [
        { id: 'all', label: 'Todas (28)' },
        { id: 'apertura', label: 'Primera Fase (16)' },
        { id: 'finalizacion', label: 'Regional Grupo D (6)' },
        { id: 'semifinal', label: 'Cuad. Semifinal B (6)' },
      ];
    }
    if (Array.isArray(matches)) {
      const hasRegular = matches.some((m) =>
        /^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test((m.round || '').trim())
      );
      const cuadEntry = matches.find((m) => /^cuad(?:rangular|\.)\s*([ab])\b/i.test((m.round || '').trim()));
      const hasGranFinal = matches.some((m) => /^gran\s+final\b/i.test((m.round || '').trim()));
      if (hasRegular && cuadEntry && hasGranFinal) {
        const grpMatch = /^cuad(?:rangular|\.)\s*([ab])\b/i.exec((cuadEntry.round || '').trim());
        const grpLetter = grpMatch ? grpMatch[1].toUpperCase() : 'B';
        return [
          { id: 'all', label: 'Todas (28)' },
          { id: 'apertura', label: 'Todos contra Todos (20)' },
          { id: 'semifinal', label: `Cuadrangular ${grpLetter} (6)` },
          { id: 'final', label: 'Gran Final (2)' },
        ];
      }
    }
  }

  if (totalMatches === 26 && Array.isArray(matches)) {
    const hasRegular = matches.some((m) =>
      /^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test((m.round || '').trim())
    );
    const cuadEntry = matches.find((m) => /^cuad(?:rangular|\.)\s*([ab])\b/i.test((m.round || '').trim()));
    const hasGranFinal = matches.some((m) => /^gran\s+final\b/i.test((m.round || '').trim()));
    if (hasRegular && cuadEntry && hasGranFinal) {
      const grpMatch = /^cuad(?:rangular|\.)\s*([ab])\b/i.exec((cuadEntry.round || '').trim());
      const grpLetter = grpMatch ? grpMatch[1].toUpperCase() : 'B';
      return [
        { id: 'all', label: 'Todas (26)' },
        { id: 'apertura', label: 'Todos contra Todos (18)' },
        { id: 'semifinal', label: `Cuadrangular ${grpLetter} (6)` },
        { id: 'final', label: 'Gran Final (2)' },
      ];
    }
    if (hasRegular && cuadEntry && !hasGranFinal) {
      const grpMatch = /^cuad(?:rangular|\.)\s*([ab])\b/i.exec((cuadEntry.round || '').trim());
      const grpLetter = grpMatch ? grpMatch[1].toUpperCase() : 'A';
      return [
        { id: 'all', label: 'Todas (26)' },
        { id: 'apertura', label: 'Todos contra Todos (20)' },
        { id: 'semifinal', label: `Cuadrangular ${grpLetter} (6)` },
      ];
    }
    const hasCuartos = matches.some((m) => /^cuartos\b/i.test((m.round || '').trim()));
    const hasSemi = matches.some((m) => /^semif(?:inal|\.)\b/i.test((m.round || '').trim()));
    if (hasRegular && hasCuartos && hasSemi && hasGranFinal) {
      return [
        { id: 'all', label: 'Todas (26)' },
        { id: 'apertura', label: 'Todos contra Todos (20)' },
        { id: 'cuartos', label: 'Cuartos (2)' },
        { id: 'semifinal', label: 'Semifinal (2)' },
        { id: 'final', label: 'Gran Final (2)' },
      ];
    }
  }

  if (totalMatches === 25 && Array.isArray(matches)) {
    const hasRegular = matches.some((m) =>
      /^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test((m.round || '').trim())
    );
    const cuadEntry = matches.find((m) => /^cuad(?:rangular|\.)\s*([ab])\b/i.test((m.round || '').trim()));
    const hasCuartos = matches.some((m) => /^cuartos\b/i.test((m.round || '').trim()));
    const hasSemi = matches.some((m) => /^semif(?:inal|\.)\b/i.test((m.round || '').trim()));
    const hasGranFinal = matches.some((m) => /^gran\s+final\b/i.test((m.round || '').trim()));
    if (hasRegular && cuadEntry && !hasGranFinal) {
      const grpMatch = /^cuad(?:rangular|\.)\s*([ab])\b/i.exec((cuadEntry.round || '').trim());
      const grpLetter = grpMatch ? grpMatch[1].toUpperCase() : 'A';
      return [
        { id: 'all', label: 'Todas (25)' },
        { id: 'apertura', label: 'Todos contra Todos (19)' },
        { id: 'semifinal', label: `Cuadrangular ${grpLetter} (6)` },
      ];
    }
    if (hasRegular && hasCuartos && hasSemi && hasGranFinal) {
      return [
        { id: 'all', label: 'Todas (25)' },
        { id: 'apertura', label: 'Todos contra Todos (19)' },
        { id: 'cuartos', label: 'Cuartos (2)' },
        { id: 'semifinal', label: 'Semifinal (2)' },
        { id: 'final', label: 'Gran Final (2)' },
      ];
    }
  }

  if (totalMatches === 24 && Array.isArray(matches)) {
    const hasRegular = matches.some((m) =>
      /^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test((m.round || '').trim())
    );
    const cuadEntry = matches.find((m) => /^cuad(?:rangular|\.)\s*([ab])\b/i.test((m.round || '').trim()));
    if (hasRegular && cuadEntry) {
      const grpMatch = /^cuad(?:rangular|\.)\s*([ab])\b/i.exec((cuadEntry.round || '').trim());
      const grpLetter = grpMatch ? grpMatch[1].toUpperCase() : 'B';
      return [
        { id: 'all', label: 'Todas (24)' },
        { id: 'apertura', label: 'Todos contra Todos (18)' },
        { id: 'semifinal', label: `Cuadrangular ${grpLetter} (6)` },
      ];
    }
    const hasCuartos = matches.some((m) => /^cuartos\b/i.test((m.round || '').trim()));
    const hasSemi = matches.some((m) => /^semif(?:inal|\.)\b/i.test((m.round || '').trim()));
    const hasGranFinal = matches.some((m) => /^gran\s+final\b/i.test((m.round || '').trim()));
    if (hasRegular && hasCuartos && hasSemi && hasGranFinal) {
      return [
        { id: 'all', label: 'Todas (24)' },
        { id: 'apertura', label: 'Todos contra Todos (18)' },
        { id: 'cuartos', label: 'Cuartos (2)' },
        { id: 'semifinal', label: 'Semifinal (2)' },
        { id: 'final', label: 'Gran Final (2)' },
      ];
    }
    if (hasRegular && hasCuartos && hasSemi && !hasGranFinal) {
      return [
        { id: 'all', label: 'Todas (24)' },
        { id: 'apertura', label: 'Todos contra Todos (20)' },
        { id: 'cuartos', label: 'Cuartos (2)' },
        { id: 'semifinal', label: 'Semifinal (2)' },
      ];
    }
  }

  if (totalMatches === 22 && Array.isArray(matches)) {
    const hasRegular = matches.some((m) =>
      /^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test((m.round || '').trim())
    );
    const hasCuartos = matches.some((m) => /^cuartos\b/i.test((m.round || '').trim()));
    const hasSemi = matches.some((m) => /^semif(?:inal|\.)\b/i.test((m.round || '').trim()));
    const hasGranFinal = matches.some((m) => /^gran\s+final\b/i.test((m.round || '').trim()));
    if (hasRegular && hasSemi && hasGranFinal) {
      return [
        { id: 'all', label: 'Todas (22)' },
        { id: 'apertura', label: 'Todos contra Todos (18)' },
        { id: 'semifinal', label: 'Semifinal (2)' },
        { id: 'final', label: 'Gran Final (2)' },
      ];
    }
    if (hasRegular && hasCuartos && hasSemi && !hasGranFinal) {
      return [
        { id: 'all', label: 'Todas (22)' },
        { id: 'apertura', label: 'Todos contra Todos (18)' },
        { id: 'cuartos', label: 'Cuartos (2)' },
        { id: 'semifinal', label: 'Semifinal (2)' },
      ];
    }
    if (hasRegular && hasCuartos && !hasSemi && !hasGranFinal) {
      return [
        { id: 'all', label: 'Todas (22)' },
        { id: 'apertura', label: 'Todos contra Todos (20)' },
        { id: 'cuartos', label: 'Cuartos (2)' },
      ];
    }
  }

  if (totalMatches === 21 && Array.isArray(matches)) {
    const hasRegular = matches.some((m) =>
      /^(?:apertura|finalizaci[oó]n|todos\s+contra\s+todos)\s*·/i.test((m.round || '').trim())
    );
    const hasCuartos = matches.some((m) => /^cuartos\b/i.test((m.round || '').trim()));
    if (hasRegular && hasCuartos) {
      return [
        { id: 'all', label: 'Todas (21)' },
        { id: 'apertura', label: 'Todos contra Todos (19)' },
        { id: 'cuartos', label: 'Cuartos (2)' },
      ];
    }
  }

  if (totalMatches === 36) {
    const hasPent =
      Array.isArray(matches) && matches.some((m) => /pent(?:agonal|\.)/i.test(m.round || ''));
    const hasTri =
      Array.isArray(matches) && matches.some((m) => /triang(?:ular|\.)/i.test(m.round || ''));
    const hasFin =
      Array.isArray(matches) && matches.some((m) => /finaliz(?:aci[oó]n|\.)/i.test(m.round || ''));
    const hasOct =
      Array.isArray(matches) && matches.some((m) => /octog(?:onal|\.)/i.test(m.round || ''));
    if (hasPent && hasTri && hasFin && hasOct) {
      return [
        { id: 'all', label: 'Todas (36)' },
        { id: 'apertura', label: 'Apertura (12)' },
        { id: '1', label: 'Pentagonal C (8)' },
        { id: '2', label: 'Triangular D (4)' },
        { id: 'finalizacion', label: 'Finalización (10)' },
        { id: 'octogonal', label: 'Octogonal Final (14)' },
      ];
    }
  }

  if (totalMatches === 40) {
    const hasPent =
      Array.isArray(matches) && matches.some((m) => /^pent(?:agonal|\.)/i.test((m.round || '').trim()));
    const hasTri =
      Array.isArray(matches) && matches.some((m) => /^triang(?:ular|\.)/i.test((m.round || '').trim()));
    const hasFin =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test((m.round || '').trim()));
    if (hasPent && hasTri && hasFin) {
      return [
        { id: 'all', label: 'Todas (40)' },
        { id: 'apertura', label: 'Apertura (12)' },
        { id: '1', label: 'Pentagonal C (8)' },
        { id: '2', label: 'Triangular B (4)' },
        { id: 'finalizacion', label: 'Finalización (28)' },
        { id: '3', label: 'Fin. 1.ª Vta (14)' },
        { id: '4', label: 'Fin. 2.ª Vta (14)' },
      ];
    }
  }

  if (totalMatches === 34) {
    const hasAp =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:apertura|ap\.)/i.test((m.round || '').trim()));
    const hasFin =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test((m.round || '').trim()));
    const hasCuad =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)|semif(?:inal|\.)/i.test(m.round || ''));
    if (hasAp && hasFin && hasCuad) {
      return [
        { id: 'all', label: 'Todas (34)' },
        { id: 'apertura', label: 'Apertura (14)' },
        { id: 'finalizacion', label: 'Finalización (14)' },
        { id: 'semifinal', label: 'Cuadrangular A (6)' },
      ];
    }
  }

  if (totalMatches === 14) {
    const hasAp =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:apertura|ap\.)/i.test((m.round || '').trim()));
    const hasFin =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test((m.round || '').trim()));
    const hasSemi =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*a|semif(?:inal|\.)/i.test(m.round || ''));
    const hasFinal =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*final/i.test(m.round || ''));
    if (hasAp && hasFin && hasSemi && hasFinal) {
      return [
        { id: 'all', label: 'Todas (14)' },
        { id: 'apertura', label: 'Apertura (3)' },
        { id: 'finalizacion', label: 'Finalización (2)' },
        { id: 'semifinal', label: 'Cuad. Semifinal A (3)' },
        { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
      ];
    }
  }

  if (totalMatches === 12) {
    const hasAp =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:apertura|ap\.)/i.test((m.round || '').trim()));
    const hasFin =
      Array.isArray(matches) &&
      matches.some((m) => /^(?:finaliz(?:aci[oó]n|\.)|fin\.)/i.test((m.round || '').trim()));
    const hasSemi =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*b|semif(?:inal|\.)/i.test(m.round || ''));
    const hasFinal =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*final/i.test(m.round || ''));
    if (hasAp && hasFin && hasSemi && hasFinal) {
      return [
        { id: 'all', label: 'Todas (12)' },
        { id: 'apertura', label: 'Apertura (1)' },
        { id: 'finalizacion', label: 'Finalización (2)' },
        { id: 'semifinal', label: 'Cuad. Semifinal B (3)' },
        { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
      ];
    }
  }

  if (totalMatches === 11) {
    const hasDes =
      Array.isArray(matches) &&
      matches.some((m) => /desempate/i.test(m.round || ''));
    const hasSemi =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*a|semif(?:inal|\.)/i.test(m.round || ''));
    const hasFinal =
      Array.isArray(matches) &&
      matches.some((m) => /cuad(?:rangular|\.)\s*final/i.test(m.round || ''));
    if (hasDes && hasSemi && hasFinal) {
      return [
        { id: 'all', label: 'Todas (11)' },
        { id: 'desempate', label: 'Desempate Apertura (2)' },
        { id: 'semifinal', label: 'Cuad. Semifinal A (3)' },
        { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
      ];
    }
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

export function getTournamentPointsPerWin(yearOrOrder: number | string): 2 | 3 {
  if (typeof yearOrOrder === 'number') {
    const year = yearOrOrder > 9999 ? Math.floor(yearOrOrder / 100) : yearOrOrder;
    return year >= 1995 ? 3 : 2;
  }
  const match = String(yearOrOrder).match(/\d{4}/);
  const year = match ? parseInt(match[0], 10) : 0;
  return year >= 1995 ? 3 : 2;
}

export function computeJuniorMatchArchiveSummary(
  matches: MatchArchiveEntry[],
  pointsPerWin: 2 | 3 = 2
): JuniorMatchArchiveSummary {
  let pj = 0;
  let pg = 0;
  let pe = 0;
  let pp = 0;
  let gf = 0;
  let gc = 0;
  let penaltyDrawBonus = 0;

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
    else if (jg === og) {
      pe += 1;
      if (/\(2\s*pts\s*·\s*penales\s+ganados(?:\)|\s*·)/i.test(m.note || '')) {
        penaltyDrawBonus += 1;
      }
    } else pp += 1;
  }

  return {
    pj,
    pg,
    pe,
    pp,
    gf,
    gc,
    dg: gf - gc,
    pts: pg * pointsPerWin + pe + penaltyDrawBonus,
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
      if (lap === 'apertura') {
        if (
          matchLap !== 1 &&
          matchLap !== 2 &&
          !(totalMatches === 50 && matchLap === 5 && /^cuadrangular[oó]n/i.test((m.round || '').trim()))
        ) {
          return false;
        }
      } else if (lap === 'finalizacion') {
        if (matchLap !== 3 && matchLap !== 4) return false;
      } else if (lap === 'desempate') {
        if (matchLap !== 6) return false;
      } else if (lap === 'cuartos') {
        if (matchLap !== 9) return false;
      } else if (lap === 'semifinal') {
        if (matchLap !== 7) return false;
      } else if (lap === 'final') {
        if (matchLap !== 8) return false;
      } else if (
        lap === 'cuadrangular' ||
        lap === 'triangular' ||
        lap === 'hexagonal' ||
        lap === 'octogonal'
      ) {
        if (matchLap !== 5) return false;
      } else if (
        (totalMatches === 57 || totalMatches === 59 || totalMatches === 61) &&
        (lap === '3' || lap === '4') &&
        (matchLap === 3 || matchLap === 4) &&
        (() => {
          const hasDesempate = matches.some((entry) => /desempate/i.test(entry.round || ''));
          const finStart = hasDesempate ? 28 : 26;
          const finEnd = hasDesempate ? 49 : 47;
          return matches
            .slice(finStart, finEnd)
            .some((entry) => /intergrupo|pareja/i.test(`${entry.date || ''} ${entry.note || ''}`));
        })()
      ) {
        const isIntergroupOrPareja = /intergrupo|pareja/i.test(`${m.date || ''} ${m.note || ''}`);
        if (lap === '3' && isIntergroupOrPareja) return false;
        if (lap === '4' && !isIntergroupOrPareja) return false;
      } else if (String(matchLap) !== lap) {
        return false;
      }
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

export interface PlayoffMatchInput {
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date?: string;
  venue?: string;
  scorers?: string;
  note?: string;
}

export interface PlayoffKnockoutTie {
  id: string;
  stageLabel: string;
  teamA: string;
  teamB: string;
  teamAGoals: number;
  teamBGoals: number;
  winnerTeam: string | null;
  penaltiesLabel?: string;
  involvesJunior: boolean;
  isFinalTie: boolean;
  isThirdPlaceTie: boolean;
  legs: PlayoffMatchInput[];
}

export interface PlayoffKnockoutRound {
  key: string;
  label: string;
  order: number;
  isFinalRound: boolean;
  isThirdPlaceRound: boolean;
  ties: PlayoffKnockoutTie[];
}

function classifyKnockoutStage(rawStage: string): {
  key: string;
  label: string;
  order: number;
  isFinalRound: boolean;
  isThirdPlaceRound: boolean;
} | null {
  const s = (rawStage || '').trim().toLowerCase();
  if (!s) return null;
  if (
    s.includes('resultado') ||
    s.includes('estadística') ||
    s.includes('estadistica') ||
    s.includes('enfrentamientos previos') ||
    s.includes('cuadrangular') ||
    s.includes('cuad.') ||
    s.includes('fecha ') ||
    s.includes('grupo ') ||
    s.includes('hexagonal') ||
    s.includes('octagonal') ||
    s.includes('octogonal') ||
    s.includes('pentagonal') ||
    s.includes('triangular') ||
    s.includes('liguilla')
  ) {
    return null;
  }
  if (s.includes('tercer')) {
    return {
      key: 'tercer-lugar',
      label: 'Definición del 3.er Lugar',
      order: 4,
      isFinalRound: false,
      isThirdPlaceRound: true,
    };
  }
  if (s.includes('cuarto')) {
    return {
      key: 'cuartos',
      label: 'Cuartos de Final',
      order: 1,
      isFinalRound: false,
      isThirdPlaceRound: false,
    };
  }
  if (s.includes('semifinal')) {
    return {
      key: 'semifinales',
      label: 'Semifinales',
      order: 2,
      isFinalRound: false,
      isThirdPlaceRound: false,
    };
  }
  if (/\bfinal\b/.test(s)) {
    return {
      key: 'final',
      label: s.includes('gran') ? 'Gran Final Nacional' : 'Final',
      order: 3,
      isFinalRound: true,
      isThirdPlaceRound: false,
    };
  }
  return null;
}

function extractPenaltyWinner(
  legs: PlayoffMatchInput[],
  teamA: string,
  teamB: string
): { winnerTeam: string | null; penaltiesLabel?: string } {
  for (let i = legs.length - 1; i >= 0; i--) {
    const note = legs[i].note || '';
    const match =
      /penales?:?\s*(\d+)\s*[-–:]\s*(\d+)/i.exec(note) ||
      /(\d+)\s*[-–:]\s*(\d+)\s*(?:en\s*)?p(?:enales)?\.?/i.exec(note);
    if (!match) continue;
    const s1 = Number(match[1]);
    const s2 = Number(match[2]);
    if (Number.isNaN(s1) || Number.isNaN(s2) || s1 === s2) continue;

    const legHomeKey = normalizeClubKey(legs[i].homeTeam);
    const keyA = normalizeClubKey(teamA);
    const homeWon = s1 > s2;
    const legWinnerIsA = isSameClubKey(legHomeKey, keyA) ? homeWon : !homeWon;
    return {
      winnerTeam: legWinnerIsA ? teamA : teamB,
      penaltiesLabel: `Penales ${s1}-${s2}`,
    };
  }
  return { winnerTeam: null };
}

/**
 * Groups raw playoff match entries into head-to-head direct-elimination ties ("llaves"),
 * computing aggregate scores, penalty winners, and round ordering while stripping noisy league dumps.
 */
export function buildPlayoffKnockoutBrackets(
  playoffMatches: PlayoffMatchInput[] = [],
  championTeam?: string
): PlayoffKnockoutRound[] {
  if (!Array.isArray(playoffMatches) || playoffMatches.length === 0) {
    return [];
  }

  const stageCounts = new Map<string, number>();
  let hasDedicatedFinalStage = false;
  for (const m of playoffMatches) {
    const raw = (m.stage || '').trim();
    stageCounts.set(raw, (stageCounts.get(raw) || 0) + 1);
    const lower = raw.toLowerCase();
    if (
      /\bfinal\b/.test(lower) &&
      !lower.includes('gran final') &&
      !lower.includes('semifinal') &&
      !lower.includes('cuarto')
    ) {
      hasDedicatedFinalStage = true;
    }
  }

  const roundsMap = new Map<
    string,
    {
      meta: NonNullable<ReturnType<typeof classifyKnockoutStage>>;
      tiesMap: Map<string, PlayoffMatchInput[]>;
    }
  >();

  for (const m of playoffMatches) {
    const rawStage = (m.stage || '').trim();
    const rawLower = rawStage.toLowerCase();
    if (
      rawLower === 'gran final' &&
      (stageCounts.get(rawStage) || 0) > 4 &&
      hasDedicatedFinalStage
    ) {
      continue;
    }

    const meta = classifyKnockoutStage(rawStage);
    if (!meta) continue;

    let bucket = roundsMap.get(meta.key);
    if (!bucket) {
      bucket = { meta, tiesMap: new Map() };
      roundsMap.set(meta.key, bucket);
    }

    const keyH = normalizeClubKey(m.homeTeam);
    const keyA = normalizeClubKey(m.awayTeam);
    if (!keyH || !keyA) continue;
    const pairKey = [keyH, keyA].sort().join('__vs__');

    const legs = bucket.tiesMap.get(pairKey) || [];
    legs.push(m);
    bucket.tiesMap.set(pairKey, legs);
  }

  const championKey = normalizeClubKey(championTeam);
  const rounds: PlayoffKnockoutRound[] = [];

  for (const { meta, tiesMap } of roundsMap.values()) {
    const ties: PlayoffKnockoutTie[] = [];
    for (const [pairKey, legs] of tiesMap.entries()) {
      const first = legs[0];
      const teamA = first.homeTeam;
      const teamB = first.awayTeam;
      const keyA = normalizeClubKey(teamA);

      let teamAGoals = 0;
      let teamBGoals = 0;
      for (const leg of legs) {
        const legHomeKey = normalizeClubKey(leg.homeTeam);
        if (isSameClubKey(legHomeKey, keyA)) {
          teamAGoals += leg.homeScore;
          teamBGoals += leg.awayScore;
        } else {
          teamBGoals += leg.homeScore;
          teamAGoals += leg.awayScore;
        }
      }

      const keyB = normalizeClubKey(teamB);
      let winnerTeam: string | null = null;
      let penaltiesLabel: string | undefined;

      if (meta.isFinalRound && championKey) {
        if (isSameClubKey(keyA, championKey)) winnerTeam = teamA;
        else if (isSameClubKey(keyB, championKey)) winnerTeam = teamB;
      }

      const penResult = extractPenaltyWinner(legs, teamA, teamB);
      if (penResult.penaltiesLabel) {
        penaltiesLabel = penResult.penaltiesLabel;
      }

      if (!winnerTeam) {
        if (teamAGoals > teamBGoals) winnerTeam = teamA;
        else if (teamBGoals > teamAGoals) winnerTeam = teamB;
        else if (penResult.winnerTeam) winnerTeam = penResult.winnerTeam;
      }

      const involvesJunior = isJuniorClubName(teamA) || isJuniorClubName(teamB);

      ties.push({
        id: `${meta.key}-${pairKey}`,
        stageLabel: meta.label,
        teamA,
        teamB,
        teamAGoals,
        teamBGoals,
        winnerTeam,
        penaltiesLabel,
        involvesJunior,
        isFinalTie: meta.isFinalRound,
        isThirdPlaceTie: meta.isThirdPlaceRound,
        legs,
      });
    }

    if (ties.length > 0) {
      rounds.push({
        key: meta.key,
        label: meta.label,
        order: meta.order,
        isFinalRound: meta.isFinalRound,
        isThirdPlaceRound: meta.isThirdPlaceRound,
        ties,
      });
    }
  }

  const sortedRounds = rounds.sort((a, b) => a.order - b.order);

  // If a quarterfinal or semifinal tie ended level on aggregate without a penalty note,
  // infer the advancing club from who participated in the next knockout round.
  const nextAdvancingTeams = new Map<string, Set<string>>();
  for (const r of sortedRounds) {
    const teamSet = new Set<string>();
    for (const tie of r.ties) {
      teamSet.add(normalizeClubKey(tie.teamA));
      teamSet.add(normalizeClubKey(tie.teamB));
    }
    nextAdvancingTeams.set(r.key, teamSet);
  }

  for (const r of sortedRounds) {
    const nextRoundKey =
      r.key === 'cuartos'
        ? 'semifinales'
        : r.key === 'semifinales'
        ? 'final'
        : null;
    if (!nextRoundKey) continue;
    const advancingSet = nextAdvancingTeams.get(nextRoundKey);
    if (!advancingSet) continue;

    for (const tie of r.ties) {
      if (tie.winnerTeam) continue;
      const keyA = normalizeClubKey(tie.teamA);
      const keyB = normalizeClubKey(tie.teamB);
      const aAdv = advancingSet.has(keyA);
      const bAdv = advancingSet.has(keyB);
      const hasResolutionNote = tie.legs.some((leg) =>
        /resoluci[oó]n\s*\d*|dimayor/i.test(leg.note || '')
      );
      const fallbackAdvanceLabel = hasResolutionNote
        ? 'Clasificó por Resolución Dimayor'
        : 'Avanzó por penales';
      if (aAdv && !bAdv) {
        tie.winnerTeam = tie.teamA;
        if (!tie.penaltiesLabel) tie.penaltiesLabel = fallbackAdvanceLabel;
      } else if (bAdv && !aAdv) {
        tie.winnerTeam = tie.teamB;
        if (!tie.penaltiesLabel) tie.penaltiesLabel = fallbackAdvanceLabel;
      }
    }
  }

  return sortedRounds;
}


