import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sortLeagueStandings,
  getFormationCoordinates,
  calculateQuizRank,
  calculateWinPercentage,
  filterFixturesByCompetition,
  isJuniorChampionTournament,
  isJuniorRunnerUpTournament,
  isChampionStatusBadge,
  isRunnerUpStatusBadge,
  isSinglePhaseTournament,
  getTournamentJuniorCrest,
  getTournamentTeamCrest,
  getRowStatusBadge,
  getTournamentDecadeKey,
  groupTournamentsByDecade,
  getAdjacentTournaments,
  computeJuniorMatchArchiveSummary,
  getMatchArchiveOpponents,
  getMatchArchiveLapOptions,
  filterMatchArchiveFixtures,
} from './footballLogic';
import { LeagueStanding, MatchFixture } from '../types/football';

test('sortLeagueStandings sorts by points, then goal difference, then goals for', () => {
  const mockStandings: LeagueStanding[] = [
    { pos: 0, team: 'Millonarios', pj: 10, pg: 6, pe: 2, pp: 2, gf: 15, gc: 10, dg: 5, pts: 20, form: ['W'] },
    { pos: 0, team: 'Junior de Barranquilla', pj: 10, pg: 7, pe: 2, pp: 1, gf: 22, gc: 8, dg: 14, pts: 23, form: ['W'] },
    { pos: 0, team: 'Santa Fe', pj: 10, pg: 6, pe: 2, pp: 2, gf: 18, gc: 13, dg: 5, pts: 20, form: ['W'] }, // Same pts as Millos, same DG, but more GF
  ];

  const sorted = sortLeagueStandings(mockStandings);

  assert.equal(sorted[0].team, 'Junior de Barranquilla');
  assert.equal(sorted[0].pos, 1);
  assert.equal(sorted[1].team, 'Santa Fe'); // Higher GF (18 vs 15)
  assert.equal(sorted[1].pos, 2);
  assert.equal(sorted[2].team, 'Millonarios');
  assert.equal(sorted[2].pos, 3);
});

test('getFormationCoordinates returns 11 valid positions for 4-3-3', () => {
  const spots = getFormationCoordinates('4-3-3');
  assert.equal(spots.length, 11);
  assert.equal(spots[0].role, 'POR');
  assert.equal(spots[0].defaultPosition, 'Arquero');
  // Check bounds
  for (const spot of spots) {
    assert.ok(spot.x >= 0 && spot.x <= 100, `spot.x out of bounds: ${spot.x}`);
    assert.ok(spot.y >= 0 && spot.y <= 100, `spot.y out of bounds: ${spot.y}`);
  }
});

test('getFormationCoordinates returns 11 valid positions for all supported formations', () => {
  for (const form of ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2'] as const) {
    const spots = getFormationCoordinates(form);
    assert.equal(spots.length, 11);
  }
});

test('calculateQuizRank classifies properly into tiers', () => {
  const perfect = calculateQuizRank(8, 8);
  assert.equal(perfect.tier, 'oro');
  assert.equal(perfect.title, 'Capitán Tiburón de Oro');

  const good = calculateQuizRank(6, 8);
  assert.equal(good.tier, 'plata');
  assert.equal(good.title, 'Juniorista de Corazón');

  const mid = calculateQuizRank(4, 8);
  assert.equal(mid.tier, 'bronce');

  const low = calculateQuizRank(1, 8);
  assert.equal(low.tier, 'novato');
});

test('calculateWinPercentage computes accurate rounded integer percentage', () => {
  assert.equal(calculateWinPercentage(86, 192), 45);
  assert.equal(calculateWinPercentage(0, 10), 0);
  assert.equal(calculateWinPercentage(10, 10), 100);
});

test('filterFixturesByCompetition filters properly or returns all when omitted', () => {
  const fixtures: MatchFixture[] = [
    { id: '1', round: 'Fase', date: '', time: '', homeTeam: '', awayTeam: '', competition: 'Copa Libertadores', venue: '', juniorIsHome: true, status: 'played' },
    { id: '2', round: 'Fecha 1', date: '', time: '', homeTeam: '', awayTeam: '', competition: 'Liga BetPlay', venue: '', juniorIsHome: true, status: 'played' },
  ];
  assert.equal(filterFixturesByCompetition(fixtures, 'Todas').length, 2);
  assert.equal(filterFixturesByCompetition(fixtures, 'Copa Libertadores').length, 1);
  assert.equal(filterFixturesByCompetition(fixtures, 'Copa Libertadores')[0].id, '1');
});

test('isJuniorChampionTournament avoids SUBCAMPEÓN substring collision', () => {
  // 1948: Subcampeón (NOT champion!)
  const tourney1948 = {
    championTeam: 'Independiente Santa Fe',
    juniorFinish: '2º SUBCAMPEÓN DE COLOMBIA 🥈 (23 Pts)',
    isJuniorRunnerUp: true,
  };
  assert.equal(isJuniorChampionTournament(tourney1948), false, '1948 must NOT be champion');
  assert.equal(isJuniorRunnerUpTournament(tourney1948), true, '1948 MUST be runner-up');

  // 1977: 1st Star (Champion!)
  const tourney1977 = {
    championTeam: 'Junior de Barranquilla',
    juniorFinish: '1º CAMPEÓN DE COLOMBIA ★ (1ª Estrella)',
  };
  assert.equal(isJuniorChampionTournament(tourney1977), true, '1977 MUST be champion');
  assert.equal(isJuniorRunnerUpTournament(tourney1977), false, '1977 must NOT be runner-up');

  // 1966: 8th place (Neither champion nor runner-up)
  const tourney1966 = {
    championTeam: 'Independiente Santa Fe',
    juniorFinish: '8º Puesto Oficial en el Retorno a Primera División (53 Pts)',
  };
  assert.equal(isJuniorChampionTournament(tourney1966), false, '1966 must NOT be champion');
  assert.equal(isJuniorRunnerUpTournament(tourney1966), false, '1966 must NOT be runner-up');

  // 1950: 9th place in El Dorado (Deportes Caldas champion, Millonarios runner-up)
  const tourney1950 = {
    championTeam: 'Deportes Caldas',
    juniorFinish: '9º Puesto Oficial en El Dorado (31 Pts)',
    isJuniorChampion: false,
    isJuniorRunnerUp: false,
  };
  assert.equal(isJuniorChampionTournament(tourney1950), false, '1950 must NOT be champion');
  assert.equal(isJuniorRunnerUpTournament(tourney1950), false, '1950 must NOT be runner-up');

  // 1972: 3rd place in Triangular Final (Millonarios champion, Cali runner-up)
  const tourney1972 = {
    championTeam: 'Millonarios F.C.',
    juniorFinish: '3º Puesto Nacional en Triangular Final (3 Pts)',
    isJuniorChampion: false,
    isJuniorRunnerUp: false,
  };
  assert.equal(isJuniorChampionTournament(tourney1972), false, '1972 must NOT be champion');
  assert.equal(isJuniorRunnerUpTournament(tourney1972), false, '1972 must NOT be runner-up');

  // Status badges
  assert.equal(isChampionStatusBadge('CAMPEÓN ★'), true);
  assert.equal(isChampionStatusBadge('SUBCAMPEÓN 🥈'), false);
  assert.equal(isRunnerUpStatusBadge('SUBCAMPEÓN 🥈'), true);
  assert.equal(isRunnerUpStatusBadge('CAMPEÓN ★'), false);
});

import { CHRONOLOGICAL_STANDINGS_TABLES } from '../data/historicStandingsChronology';
import { JUNIOR_TIMELINE_MILESTONES } from '../data/juniorTimelineData';
import {
  ALL_14_OFFICIAL_TITLES,
  GOLDEN_BOOT_WINNERS,
  JUNIOR_YEARLY_STANDINGS,
  STARS_DATA,
} from '../data/juniorData';
import {
  ENCYCLOPEDIA_SEARCH_ITEMS,
  searchEncyclopedia,
} from '../data/encyclopediaSearchIndex';

test('dataset integrity: unique IDs, valid table cross-references, and chronological ordering', () => {
  const tableIds = new Set<string>();
  let prevOrder = -Infinity;

  for (const table of CHRONOLOGICAL_STANDINGS_TABLES) {
    assert.ok(!tableIds.has(table.id), `Duplicate standings table ID: ${table.id}`);
    tableIds.add(table.id);

    assert.ok(
      table.chronologicalOrder >= prevOrder,
      `CHRONOLOGICAL_STANDINGS_TABLES out of order at ${table.id}: ${table.chronologicalOrder} < ${prevOrder}`
    );
    prevOrder = table.chronologicalOrder;

    const checkJuniorRows = (rows: { team: string; isJunior?: boolean }[] | undefined, phaseName: string) => {
      if (!rows) return;
      const juniorRows = rows.filter((r) => r.isJunior);
      assert.ok(
        juniorRows.length <= 1,
        `Table ${table.id} (${phaseName}) has ${juniorRows.length} rows marked isJunior: true (${juniorRows.map((r) => r.team).join(', ')})`
      );
    };

    checkJuniorRows(table.rows, 'rows');
    checkJuniorRows(table.regularRows, 'regularRows');
    checkJuniorRows(table.secondaryRegularTable?.rows, 'secondaryRegularTable');
    if (table.finalGroups) {
      for (const grp of table.finalGroups) {
        checkJuniorRows(grp.rows, `finalGroups:${grp.groupName}`);
      }
    }
  }

  const timelineIds = new Set<string>();
  for (const milestone of JUNIOR_TIMELINE_MILESTONES) {
    assert.ok(!timelineIds.has(milestone.id), `Duplicate timeline ID: ${milestone.id}`);
    timelineIds.add(milestone.id);
    if (milestone.standingsTableId) {
      assert.ok(
        tableIds.has(milestone.standingsTableId),
        `Timeline ${milestone.id} links to missing standingsTableId: ${milestone.standingsTableId}`
      );
    }
  }

  for (const yr of JUNIOR_YEARLY_STANDINGS) {
    if (yr.standingsTableId) {
      assert.ok(
        tableIds.has(yr.standingsTableId),
        `Yearly standing ${yr.year} links to missing standingsTableId: ${yr.standingsTableId}`
      );
    }
  }

  const searchIds = new Set<string>();
  for (const item of ENCYCLOPEDIA_SEARCH_ITEMS) {
    assert.ok(!searchIds.has(item.id), `Duplicate search item ID: ${item.id}`);
    searchIds.add(item.id);
    if (item.standingsTableId) {
      assert.ok(
        tableIds.has(item.standingsTableId),
        `Search item ${item.id} links to missing standingsTableId: ${item.standingsTableId}`
      );
    }
  }
});

test('Wikipedia Historia del Junior audit invariants: zero raw citation tags and verified historical facts', () => {
  const citationRegex = /\[\d+\]/;

  for (const m of JUNIOR_TIMELINE_MILESTONES) {
    const combined = `${m.title} ${m.summary} ${m.details.join(' ')} ${m.scoreOrRecord ?? ''}`;
    assert.equal(citationRegex.test(combined), false, `Raw citation tag found in timeline ${m.id}`);
  }

  for (const yr of JUNIOR_YEARLY_STANDINGS) {
    const combined = `${yr.finalPosition} ${yr.finalPhase} ${yr.keyNote}`;
    assert.equal(citationRegex.test(combined), false, `Raw citation tag found in yearly standing ${yr.year}`);
  }

  for (const item of ENCYCLOPEDIA_SEARCH_ITEMS) {
    const combined = `${item.title} ${item.subtitle}`;
    assert.equal(citationRegex.test(combined), false, `Raw citation tag found in search item ${item.id}`);
  }

  for (const table of CHRONOLOGICAL_STANDINGS_TABLES) {
    const combined = `${table.description} ${table.regularPhaseDescription ?? ''} ${table.finalPhaseDescription ?? ''}`;
    assert.equal(citationRegex.test(combined), false, `Raw citation tag found in table ${table.id}`);
  }

  // Verified 1948 record: 11 PG, 1 PE, 6 PP, 48 GF = 23 pts
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  assert.ok(t1948);
  const jr1948 = (t1948.regularRows ?? t1948.rows).find((r) => r.isJunior);
  assert.ok(jr1948);
  assert.equal(jr1948.pg, 11);
  assert.equal(jr1948.pe, 1);
  assert.equal(jr1948.pp, 6);
  assert.equal(jr1948.gf, 48);
  assert.equal(jr1948.pts, 23);

  // Verified 1983 Copa de la Paz Serie Extra: Once Caldas 2-2 & 0-2 (NOT 2-1)
  const m1983 = JUNIOR_TIMELINE_MILESTONES.find((m) => m.id === '1983-subcampeon');
  assert.ok(m1983);
  assert.ok(m1983.summary.includes('0-2'), '1983 milestone must reflect 0-2 Serie Extra vs Once Caldas');
  assert.equal(m1983.summary.includes('2-1 en Barranquilla'), false);

  // Verified 1953 table: Junior 8th (-15 DG), Union 9th (-23 DG), Sporting 10th (-30 DG)
  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  assert.ok(t1953);
  const jr1953 = (t1953.regularRows ?? t1953.rows).filter((r) => r.isJunior);
  assert.equal(jr1953.length, 1);
  assert.equal(jr1953[0].team, 'Junior de Barranquilla');
  assert.equal(jr1953[0].pos, 8);

  // Palmarés counts & Golden Boots remain intact (12 stars, 16 official titles, 15 golden boots, 10 runner-ups)
  assert.equal(STARS_DATA.length, 12);
  assert.equal(ALL_14_OFFICIAL_TITLES.length, 16);
  assert.equal(GOLDEN_BOOT_WINNERS.length, 15);
  assert.equal(CHRONOLOGICAL_STANDINGS_TABLES.filter(isJuniorChampionTournament).length, 12);
  assert.equal(CHRONOLOGICAL_STANDINGS_TABLES.filter(isJuniorRunnerUpTournament).length, 10);

  // Newly added Wikipedia milestones exist & are searchable
  for (const requiredId of [
    '1924-fundacion',
    '1932-1940-era-amateur',
    '1945-sudamericano',
    '1949-sudamericano-sancion',
    '1997-copa-reebok',
    '2026-estrella-12',
  ]) {
    assert.ok(
      JUNIOR_TIMELINE_MILESTONES.some((m) => m.id === requiredId),
      `Missing required milestone: ${requiredId}`
    );
  }

  assert.ok(searchEncyclopedia('los miuras 1948').some((i) => i.id === 'torneo-1948'));
  assert.ok(searchEncyclopedia('copa reebok 1997').some((i) => i.id === 'hito-1997-copa-reebok'));
  assert.ok(searchEncyclopedia('sudamericano 1945').some((i) => i.id === 'hito-1945-sudamericano'));
});

test('1948 tournament single-phase flag and historical crest resolution', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1977 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1977-hexagonal');
  assert.ok(t1948);
  assert.ok(t1977);

  assert.equal(isSinglePhaseTournament(t1948), true, '1948 must be single-phase');
  assert.equal(isSinglePhaseTournament(t1977), false, '1977 must be multi-phase');

  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t1967 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1967-campeonato');
  assert.ok(t1950 && t1951 && t1952 && t1953 && t1966 && t1967);

  const crest1948 = getTournamentJuniorCrest(t1948);
  assert.equal(crest1948.src, '/assets/aistudio/ESCUDO_JUNIOR_1946-1950_7ea2a3f2.png');
  assert.equal(
    getTournamentJuniorCrest({ id: 'custom-1946', year: '1946' }).src,
    '/assets/aistudio/ESCUDO_JUNIOR_1946-1950_7ea2a3f2.png'
  );
  assert.equal(
    getTournamentJuniorCrest(t1950).src,
    '/assets/aistudio/ESCUDO_JUNIOR_1950-51_106008e2.png'
  );
  for (const tbl of [t1951, t1952, t1953, t1966]) {
    assert.equal(
      getTournamentJuniorCrest(tbl).src,
      '/assets/aistudio/ESCUDO_JUNIOR_1951-66_e0a54e06.png',
      `Expected Junior 1951-1966 crest for ${tbl.id}`
    );
  }

  assert.equal(getTournamentJuniorCrest(t1967).src, '/assets/aistudio/image_82370351.png');

  const crest1977 = getTournamentJuniorCrest(t1977);
  assert.equal(crest1977.src, '/assets/aistudio/image_82370351.png');

  // Verify 1948 also has 18 matchArchive fixtures involving Junior
  assert.equal(t1948.matchArchive?.length, 18);
  for (const match of t1948.matchArchive ?? []) {
    assert.ok(
      match.homeTeam.includes('Junior') || match.awayTeam.includes('Junior'),
      `1948 match missing Junior: ${match.homeTeam} vs ${match.awayTeam}`
    );
  }
});

test('Santa Fe 1948-1949, 1950-1951, 1952-1956, and 1966-1967 historical crests apply strictly to their respective tournaments', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t1967 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1967-campeonato');
  const t1968 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1968-campeonato');
  const t1977 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1977-hexagonal');
  assert.ok(t1948 && t1950 && t1951 && t1952 && t1953 && t1966 && t1967 && t1968 && t1977);

  assert.equal(
    getTournamentTeamCrest(t1948, 'Independiente Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_1948-1950_6d4be8eb.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Independiente Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_1948-1950_6d4be8eb.png'
  );
  for (const tbl of [t1950, t1951]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Independiente Santa Fe')?.src,
      '/assets/aistudio/SANTA_FE_1950-1952_88ef6caa.png',
      `Expected Santa Fe 1950-1952 crest for ${tbl.id}`
    );
  }
  for (const tbl of [t1952, t1953, { id: 'custom-1954', year: '1954' }, { id: 'custom-1956', year: '1956' }]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Independiente Santa Fe')?.src,
      '/assets/aistudio/SANTA_FE_1952-1956_f7f7b9c3.png',
      `Expected Santa Fe 1952-1956 crest for ${tbl.id}`
    );
  }
  for (const tbl of [t1966, t1967]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Independiente Santa Fe')?.src,
      '/assets/aistudio/SANTA_FE_1966-1967_a0a1e3e6.png',
      `Expected Santa Fe 1966-1967 crest for ${tbl.id}`
    );
  }
  assert.equal(getTournamentTeamCrest({ id: 'custom-1957', year: '1957' }, 'Independiente Santa Fe'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1965', year: '1965' }, 'Independiente Santa Fe'), null);
  assert.equal(getTournamentTeamCrest(t1968, 'Independiente Santa Fe'), null);
  assert.equal(getTournamentTeamCrest(t1977, 'Independiente Santa Fe'), null);

  // Boca Juniors de Cali must never resolve to Junior's crest
  assert.equal(
    getTournamentTeamCrest(t1950, 'Boca Juniors de Cali', false)?.src,
    '/assets/aistudio/image_7a8c8dde.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1950, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/ESCUDO_JUNIOR_1950-51_106008e2.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1952, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/ESCUDO_JUNIOR_1951-66_e0a54e06.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1966, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/ESCUDO_JUNIOR_1951-66_e0a54e06.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1977, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/image_82370351.png'
  );
});

test('Deportes Caldas 1947-1949 and 1950-1961 historical crests apply strictly to their respective tournaments', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  assert.ok(t1948 && t1950 && t1951);

  assert.equal(
    getTournamentTeamCrest(t1948, 'Deportes Caldas')?.src,
    '/assets/aistudio/Escudo_Deportes_Caldas_1947-1950.svg_8c1299a8.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Deportes Caldas')?.src,
    '/assets/aistudio/Escudo_Deportes_Caldas_1947-1950.svg_8c1299a8.webp'
  );
  assert.equal(
    getTournamentTeamCrest(t1950, 'Deportes Caldas')?.src,
    '/assets/aistudio/DEPORTES_CLADA_50-61_6bc0153b.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1951, 'Deportes Caldas')?.src,
    '/assets/aistudio/DEPORTES_CLADA_50-61_6bc0153b.png'
  );
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  assert.ok(t1952);
  assert.equal(
    getTournamentTeamCrest(t1952, 'Deportivo Manizales')?.src,
    '/assets/aistudio/DEPORTES_CLADA_50-61_6bc0153b.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1961', year: '1961' }, 'Deportes Caldas')?.src,
    '/assets/aistudio/DEPORTES_CLADA_50-61_6bc0153b.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'custom-1962', year: '1962' }, 'Deportes Caldas'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1962', year: '1962' }, 'Deportivo Manizales'), null);
  assert.equal(
    getTournamentTeamCrest(t1948, 'Once Deportivo')?.src,
    '/assets/aistudio/image_93c1f912.png'
  );
  assert.equal(getTournamentTeamCrest(t1950, 'Once Caldas'), null);
  assert.equal(getTournamentTeamCrest(t1951, 'Once Caldas'), null);
});

test('Millonarios 1947-1955 historical crest applies to 1947-1955 tables and not 1966+', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado', '1952-dorado', '1953-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Millonarios F.C.')?.src,
      '/assets/aistudio/MILLONARIOS_1947-1955_a27e65ae.png',
      `Expected Millonarios 1947-1955 crest for ${id}`
    );
  }

  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t1966 && t2023);
  assert.equal(getTournamentTeamCrest(t1966, 'Millonarios F.C.'), null);
  assert.equal(getTournamentTeamCrest(t2023, 'Millonarios F.C.'), null);
});

test('Atlético Municipal / Nacional 1947-1949 and 1950-1953 historical crests apply strictly and exclude Universidad Nacional', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1948 && t1950 && t1951 && t1952 && t1953 && t1966);

  assert.equal(
    getTournamentTeamCrest(t1948, 'Atlético Municipal (Nacional)')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1948, 'Atlético Municipal')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Atlético Municipal')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1950, 'Atlético Municipal (Nacional)')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1950-1953_896fee19.png'
  );
  for (const tbl of [t1951, t1952, t1953]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Atlético Nacional')?.src,
      '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1950-1953_896fee19.png',
      `Expected Atlético Nacional 1950-1953 crest for ${tbl.id}`
    );
  }
  assert.equal(
    getTournamentTeamCrest(t1948, 'Universidad Nacional')?.src,
    '/assets/aistudio/image_63a79417.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1951, 'Universidad Nacional')?.src,
    '/assets/aistudio/image_63a79417.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'custom-1954', year: '1954' }, 'Atlético Nacional'), null);
  assert.equal(getTournamentTeamCrest(t1966, 'Atlético Nacional'), null);
});

test('América de Cali 1940-1961 historical crest applies strictly to 1940-1961 and excludes 1966+', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado', '1952-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'América de Cali')?.src,
      '/assets/aistudio/AMERICA_1940-1961_e9be8b73.png',
      `Expected América 1940-1961 crest for ${id}`
    );
  }

  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t1948 && t1966 && t2023);

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1961', year: '1961' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1940-1961_e9be8b73.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'custom-1962', year: '1962' }, 'América de Cali'), null);
  assert.equal(getTournamentTeamCrest(t1966, 'América de Cali'), null);
  assert.equal(getTournamentTeamCrest(t2023, 'América de Cali'), null);
  assert.equal(getTournamentTeamCrest(t1948, 'Nacional, América y Santa Fe'), null);
});

test('Independiente Medellín 1913-1951 historical crest applies strictly to 1913-1951 and excludes Huracán de Medellín', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Independiente Medellín')?.src,
      '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png',
      `Expected Independiente Medellín 1913-1951 crest for ${id}`
    );
  }

  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1950 && t1951 && t1952 && t1966);

  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Huracán de Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1951, 'Huracán de Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png'
  );
  assert.equal(getTournamentTeamCrest(t1952, 'Independiente Medellín'), null);
  assert.equal(getTournamentTeamCrest(t1966, 'Independiente Medellín'), null);
});

test('Deportivo Cali 1948-2012 historical crest applies strictly to 1948-2012 and excludes América/Boca/2013+', () => {
  for (const id of ['1948-inaugural', '1967-campeonato', '1995-96-cuadrangular', '2004-II-cuadrangular', '2012-II-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportivo Cali')?.src,
      '/assets/aistudio/deportivo_cali_1948-2012_35d865b2.png',
      `Expected Deportivo Cali 1948-2012 crest for ${id}`
    );
    assert.equal(
      getTournamentTeamCrest(tbl, 'Dep. Cali')?.src,
      '/assets/aistudio/deportivo_cali_1948-2012_35d865b2.png',
      `Expected Dep. Cali 1948-2012 crest for ${id}`
    );
  }

  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t2013 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2013-I-regular');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t1950 && t1966 && t2013 && t2023);

  assert.equal(
    getTournamentTeamCrest(t1950, 'Boca Juniors de Cali')?.src,
    '/assets/aistudio/image_7a8c8dde.png'
  );
  assert.equal(getTournamentTeamCrest(t1966, 'América de Cali'), null);
  assert.equal(getTournamentTeamCrest(t2013, 'Deportivo Cali'), null);
  assert.equal(getTournamentTeamCrest(t2023, 'Deportivo Cali'), null);
});

test('getRowStatusBadge derives non-empty Estado / Clasificación across all 91 historical tables', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t2003I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2003-I-cuadrangular');
  const t2019II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2019-II-cuadrangular');
  assert.ok(t1948 && t2003I && t2019II);

  assert.equal(getRowStatusBadge(t1948, t1948.regularRows![0], 'regular'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1948, t1948.regularRows![1], 'regular'), 'Subcampeón 🥈');
  assert.equal(getRowStatusBadge(t1948, t1948.regularRows![2], 'regular'), '3º Puesto');

  // Runner-up resolved via Final match even when champion won the other semifinal group
  assert.equal(getRowStatusBadge(t2003I, t2003I.rows[0], 'finalSummary'), 'Subcampeón 🥈');
  assert.equal(getRowStatusBadge(t2019II, t2019II.rows[0], 'finalSummary'), 'Subcampeón 🥈');

  // Zero empty or '-' badges across all 91 tournaments
  for (const t of CHRONOLOGICAL_STANDINGS_TABLES) {
    for (const r of t.regularRows || []) {
      const badge = getRowStatusBadge(t, r, 'regular');
      assert.ok(badge && badge !== '-', `Empty badge in ${t.id} regularRows for ${r.team}`);
    }
    for (const r of t.secondaryRegularTable?.rows || []) {
      const badge = getRowStatusBadge(t, r, 'secondaryRegular');
      assert.ok(badge && badge !== '-', `Empty badge in ${t.id} secondaryRegularTable for ${r.team}`);
    }
    for (const g of t.finalGroups || []) {
      for (const r of g.rows) {
        const badge = getRowStatusBadge(t, r, 'finalGroup', g.groupName);
        assert.ok(badge && badge !== '-', `Empty badge in ${t.id} finalGroup ${g.groupName} for ${r.team}`);
      }
    }
    for (const r of t.rows || []) {
      const badge = getRowStatusBadge(t, r, 'finalSummary');
      assert.ok(badge && badge !== '-', `Empty badge in ${t.id} rows for ${r.team}`);
    }
  }
});

test('Once Deportivo historical crest applies to Once Deportivo without colliding with Once Caldas or Deportes Caldas', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Once Deportivo');
    assert.equal(crest?.src, '/assets/aistudio/image_93c1f912.png');
    assert.equal(crest?.needsLightBackdrop, true);
  }

  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1952 && t1966);
  assert.notEqual(
    getTournamentTeamCrest(t1952, 'Deportivo Manizales')?.src,
    '/assets/aistudio/image_93c1f912.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1952, 'Deportivo Manizales')?.src,
    '/assets/aistudio/DEPORTES_CLADA_50-61_6bc0153b.png'
  );
  assert.equal(getTournamentTeamCrest(t1966, 'Once Caldas'), null);
});

test('Universidad Nacional historical crest applies across 1948-1952 without colliding with Atlético Nacional or Atlético Municipal', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado', '1952-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Universidad Nacional');
    assert.equal(crest?.src, '/assets/aistudio/image_63a79417.png');
    assert.equal(crest?.needsLightBackdrop, true);
  }

  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1948 && t1951 && t1966);
  assert.notEqual(
    getTournamentTeamCrest(t1948, 'Atlético Municipal (Nacional)')?.src,
    '/assets/aistudio/image_63a79417.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1951, 'Atlético Nacional')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1950-1953_896fee19.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1951, 'Atlético Nacional')?.src,
    '/assets/aistudio/image_63a79417.png'
  );
  assert.equal(getTournamentTeamCrest(t1966, 'Atlético Nacional'), null);
});

test('groupTournamentsByDecade groups all 91 tournaments chronologically with accurate star and runner-up counts', () => {
  assert.equal(CHRONOLOGICAL_STANDINGS_TABLES.length, 91);
  assert.equal(
    CHRONOLOGICAL_STANDINGS_TABLES.some((t) => t.id === '1953-1966-receso'),
    false
  );
  assert.equal(getTournamentDecadeKey({ year: '1948' }), '1948-1953');
  assert.equal(getTournamentDecadeKey({ year: '1953' }), '1948-1953');
  assert.equal(getTournamentDecadeKey({ year: '1966' }), '1966-1969');
  assert.equal(getTournamentDecadeKey({ year: '1977' }), '1970s');
  assert.equal(getTournamentDecadeKey({ year: '1995/96' }), '1990s');
  assert.equal(getTournamentDecadeKey({ year: '2025-II' }), '2020s');

  const ascBuckets = groupTournamentsByDecade(CHRONOLOGICAL_STANDINGS_TABLES, 'asc');
  assert.equal(ascBuckets.length, 8);
  assert.equal(ascBuckets[0].key, '1948-1953');
  assert.equal(ascBuckets[0].label, '1948 – 1953');
  assert.equal(ascBuckets[0].subtitle, 'Inicios y El Dorado');
  assert.equal(ascBuckets[0].items.length, 5);
  assert.equal(ascBuckets[1].key, '1966-1969');
  assert.equal(ascBuckets[1].label, '1966 – 1969');
  assert.equal(ascBuckets[1].subtitle, 'Reingreso Dimayor');
  assert.equal(ascBuckets[ascBuckets.length - 1].key, '2020s');

  const totalItems = ascBuckets.reduce((acc, b) => acc + b.items.length, 0);
  const totalStars = ascBuckets.reduce((acc, b) => acc + b.starCount, 0);
  assert.equal(totalItems, CHRONOLOGICAL_STANDINGS_TABLES.length);
  assert.equal(totalStars, 12);

  const descBuckets = groupTournamentsByDecade([...CHRONOLOGICAL_STANDINGS_TABLES].reverse(), 'desc');
  assert.equal(descBuckets[0].key, '2020s');
  assert.equal(descBuckets[descBuckets.length - 1].key, '1948-1953');

  // Adjacent tournaments respect filtered list and fall back to full list when active item is filtered out
  const starsOnly = CHRONOLOGICAL_STANDINGS_TABLES.filter(isJuniorChampionTournament);
  assert.equal(starsOnly.length, 12);
  const adjStar2 = getAdjacentTournaments(starsOnly, CHRONOLOGICAL_STANDINGS_TABLES, starsOnly[1].id);
  assert.equal(adjStar2.prev?.id, starsOnly[0].id);
  assert.equal(adjStar2.next?.id, starsOnly[2].id);
  assert.equal(adjStar2.currentIndex, 1);
  assert.equal(adjStar2.totalCount, 12);

  const adjFallback = getAdjacentTournaments(starsOnly, CHRONOLOGICAL_STANDINGS_TABLES, '1948-inaugural');
  assert.equal(adjFallback.prev, null);
  assert.equal(adjFallback.next?.id, '1950-dorado');
});

test('Boca Juniors de Cali crest applies across 1950-1953 tables without colliding with Junior, Deportivo Cali, or Boca (ARG)', () => {
  for (const id of ['1950-dorado', '1951-dorado', '1952-dorado', '1953-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Boca Juniors de Cali');
    assert.equal(crest?.src, '/assets/aistudio/image_7a8c8dde.png');
  }

  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  assert.ok(t1950);
  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Deportivo Cali')?.src,
    '/assets/aistudio/image_7a8c8dde.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/image_7a8c8dde.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'lib-2001', year: '2001' }, 'Boca Juniors'), null);
});

test('Cúcuta Deportivo 1950-1971 historical crest applies strictly to 1950-1971 tables and excludes 1972+', () => {
  for (const id of [
    '1950-dorado',
    '1951-dorado',
    '1952-dorado',
    '1953-dorado',
    '1966-reingreso',
    '1967-campeonato',
    '1968-campeonato',
    '1969-campeonato',
    '1970-cuadrangular',
    '1971-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Cúcuta Deportivo');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cucuta_deportivo_1950-1971_b12221f4.png',
      `Expected Cúcuta Deportivo 1950-1971 crest for ${id}`
    );
    assert.equal(crest?.needsLightBackdrop, undefined);
  }

  assert.equal(getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Cúcuta Deportivo'), null);
  const t1972 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1972-triangular');
  const t2006 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2006-II-regular');
  assert.ok(t1972 && t2006);
  assert.equal(getTournamentTeamCrest(t1972, 'Cúcuta Deportivo'), null);
  assert.equal(getTournamentTeamCrest(t2006, 'Cúcuta Deportivo'), null);
});

test('Atlético Bucaramanga 1950-1957 historical crest applies strictly to 1950-1957 tables and excludes 1958+', () => {
  for (const id of [
    '1950-dorado',
    '1951-dorado',
    '1952-dorado',
    '1953-dorado',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Atlético Bucaramanga')?.src,
      '/assets/aistudio/bucaramanga_1950-1957_80f6c063.png',
      `Expected Atlético Bucaramanga 1950-1957 crest for ${id}`
    );
  }

  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  assert.ok(t1953);
  assert.equal(
    getTournamentTeamCrest(t1953, 'Atlético Bucaramanga (Retirado)')?.src,
    '/assets/aistudio/bucaramanga_1950-1957_80f6c063.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1957', year: '1957' }, 'Atlético Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_1950-1957_80f6c063.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Atlético Bucaramanga'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1958', year: '1958' }, 'Atlético Bucaramanga'), null);

  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t2024 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2024-I-cuadrangular');
  assert.ok(t1966 && t2024);
  assert.equal(getTournamentTeamCrest(t1966, 'Atlético Bucaramanga'), null);
  assert.equal(getTournamentTeamCrest(t2024, 'Atlético Bucaramanga'), null);
});

test('Sporting de Barranquilla 1950-1953 historical crest applies strictly to 1950-1953 tables and excludes 1954+/1988+', () => {
  for (const id of [
    '1950-dorado',
    '1951-dorado',
    '1952-dorado',
    '1953-dorado',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Sporting de Barranquilla')?.src,
      '/assets/aistudio/sporting_1950-1953_871e9ddd.png',
      `Expected Sporting 1950-1953 crest for ${id}`
    );
  }

  assert.equal(getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Sporting de Barranquilla'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1954', year: '1954' }, 'Sporting de Barranquilla'), null);
  const t1988 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1988-octogonal');
  if (t1988) {
    assert.equal(getTournamentTeamCrest(t1988, 'Sporting de Barranquilla'), null);
    assert.equal(getTournamentTeamCrest(t1988, 'Sporting Club'), null);
  }
  assert.equal(getTournamentTeamCrest({ id: 'lib-1953', year: '1953' }, 'Sporting Cristal'), null);
});

test('Deportivo Pereira 1949-1951, 1952-1955, and 1956-1989 historical crests apply strictly to their respective ranges and exclude 1948, 1990+, and Águilas Pereira', () => {
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Deportivo Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_49_al_52_17730967.png'
  );
  for (const id of ['1950-dorado', '1951-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportivo Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_49_al_52_17730967.png',
      `Expected Deportivo Pereira 1949-1952 crest for ${id}`
    );
  }

  for (const tbl of [
    ...['1952-dorado', '1953-dorado'].map((id) => {
      const found = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
      assert.ok(found, `Missing table ${id}`);
      return found;
    }),
    { id: 'custom-1954', year: '1954' },
    { id: 'custom-1955', year: '1955' },
  ]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportivo Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_52_al_56_ef90fe97.png',
      `Expected Deportivo Pereira 1952-1956 crest for ${tbl.id}`
    );
  }

  for (const tbl of [
    { id: 'custom-1956', year: '1956' },
    ...['1966-reingreso', '1974-hexagonal', '1982-octogonal', '1989-desierto'].map((id) => {
      const found = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
      assert.ok(found, `Missing table ${id}`);
      return found;
    }),
  ]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportivo Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_56_al_89_eb282c12.png',
      `Expected Deportivo Pereira 1956-1989 crest for ${tbl.id}`
    );
  }

  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1990 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1990-reclasificacion');
  const t2022 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2022-II-cuadrangular');
  assert.ok(t1948 && t1990 && t2022);
  assert.equal(getTournamentTeamCrest(t1948, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest(t1990, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest(t2022, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1953', year: '1953' }, 'Águilas Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1970', year: '1970' }, 'Águilas Pereira'), null);
});

test('Huracán de Medellín crest applies across 1950-1951 tables and excludes non-Medellín Huracán', () => {
  for (const id of ['1950-dorado', '1951-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Huracán de Medellín')?.src,
      '/assets/aistudio/huracan_de_medellin_534acebd.png',
      `Expected Huracán de Medellín crest for ${id}`
    );
  }

  assert.equal(getTournamentTeamCrest({ id: 'lib-1974', year: '1974' }, 'Huracán'), null);
  assert.equal(
    getTournamentTeamCrest({ id: '1950-dorado', year: '1950' }, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png'
  );
});

test('Deportes Quindío 1951-1967 historical crest applies strictly to 1951-1967 tables and excludes 1950/1968+', () => {
  for (const id of [
    '1951-dorado',
    '1952-dorado',
    '1953-dorado',
    '1966-reingreso',
    '1967-campeonato',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportes Quindío')?.src,
      '/assets/aistudio/quindio_del_51_al_67_d5631340.png',
      `Expected Deportes Quindío 1951-1967 crest for ${id}`
    );
  }

  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  assert.ok(t1953);
  assert.equal(
    getTournamentTeamCrest(t1953, 'Deportes Quindío (Subcampeón 1953)')?.src,
    '/assets/aistudio/quindio_del_51_al_67_d5631340.png'
  );

  assert.equal(getTournamentTeamCrest({ id: '1950-dorado', year: '1950' }, 'Deportes Quindío'), null);
  const t1968 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1968-campeonato');
  if (t1968) {
    assert.equal(getTournamentTeamCrest(t1968, 'Deportes Quindío'), null);
  }
  assert.equal(getTournamentTeamCrest({ id: 'custom-1968', year: '1968' }, 'Deportes Quindío'), null);
});

test('Deportivo Samarios historical crest applies across 1951-1952 tables without colliding with Unión Magdalena', () => {
  for (const id of ['1951-dorado', '1952-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportivo Samarios')?.src,
      '/assets/aistudio/SAMARIOS_50-51_fd182237.png',
      `Expected Deportivo Samarios crest for ${id}`
    );
  }

  const crest1953 = getTournamentTeamCrest({ id: '1953-dorado', year: '1953' }, 'Unión Magdalena');
  assert.notEqual(crest1953?.src, '/assets/aistudio/SAMARIOS_50-51_fd182237.png');
  assert.equal(crest1953?.src, '/assets/aistudio/image_83f09d09.png');
});

test('Unión Magdalena crest applies across historical and modern tables without colliding with Deportivo Samarios', () => {
  for (const id of ['1953-dorado', '1966-reingreso', '1968-campeonato', '2025-I-regular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    if (!tbl) continue;
    assert.equal(
      getTournamentTeamCrest(tbl, 'Unión Magdalena')?.src,
      '/assets/aistudio/image_83f09d09.png',
      `Expected Unión Magdalena crest for ${id}`
    );
  }

  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1968 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1968-campeonato');
  assert.ok(t1951 && t1968);
  assert.equal(
    getTournamentTeamCrest(t1968, t1968.championTeam)?.src,
    '/assets/aistudio/image_83f09d09.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1998-reclasificacion', year: '1998' }, 'U. Magdalena')?.src,
    '/assets/aistudio/image_83f09d09.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1951, 'Deportivo Samarios')?.src,
    '/assets/aistudio/SAMARIOS_50-51_fd182237.png'
  );
});

test('1966 Campeonato Colombiano matchArchive contains all 52 Junior matches and reconciles strictly with official standings', () => {
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1966 && t1966.matchArchive);

  const matches = t1966.matchArchive;
  assert.equal(matches.length, 52, 'Expected exact 52 Junior matches for 1966');

  for (const m of matches) {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1966: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('goles') && !m.awayTeam.includes('goles'));
  }

  const summary = computeJuniorMatchArchiveSummary(matches);
  const juniorRow = t1966.rows.find((r) => r.isJunior);
  assert.ok(juniorRow);
  assert.deepEqual(summary, {
    pj: juniorRow.pj,
    pg: juniorRow.pg,
    pe: juniorRow.pe,
    pp: juniorRow.pp,
    gf: juniorRow.gf,
    gc: juniorRow.gc,
    dg: juniorRow.dg,
    pts: juniorRow.pts,
  });

  const opponents = getMatchArchiveOpponents(matches);
  assert.equal(opponents.length, 13, 'Expected 13 distinct league rivals in 1966');
  for (const opp of opponents) {
    const vsOpp = filterMatchArchiveFixtures(matches, { opponent: opp });
    const homeVsOpp = filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'home' });
    const awayVsOpp = filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'away' });
    assert.equal(vsOpp.length, 4, `Expected 4 matches vs ${opp}`);
    assert.equal(homeVsOpp.length, 2, `Expected 2 home matches vs ${opp}`);
    assert.equal(awayVsOpp.length, 2, `Expected 2 away matches vs ${opp}`);
  }
});

test('filterMatchArchiveFixtures filters 1966 matches accurately by lap, venue, outcome, and opponent', () => {
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1966 && t1966.matchArchive);
  const matches = t1966.matchArchive;

  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { venue: 'home' }).length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { venue: 'away' }).length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { outcome: 'win' }).length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { outcome: 'draw' }).length, 11);
  assert.equal(filterMatchArchiveFixtures(matches, { outcome: 'loss' }).length, 20);
  assert.equal(
    filterMatchArchiveFixtures(matches, { lap: '3', outcome: 'win', opponent: 'Deportes Quindío' })[0]?.homeScore,
    7
  );
});

test('1948-1953 Campeonato Colombiano matchArchive datasets are chronological, complete, and strictly reconcile with official standings', () => {
  const expectedCounts: Record<string, { total: number; rivals: number }> = {
    '1948-inaugural': { total: 18, rivals: 9 },
    '1950-dorado': { total: 30, rivals: 15 },
    '1951-dorado': { total: 34, rivals: 17 },
    '1952-dorado': { total: 28, rivals: 14 },
    '1953-dorado': { total: 22, rivals: 11 },
  };

  for (const [id, spec] of Object.entries(expectedCounts)) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl && tbl.matchArchive, `Missing table or matchArchive for ${id}`);
    const matches = tbl.matchArchive;
    assert.equal(matches.length, spec.total, `Expected ${spec.total} matches for ${id}`);

    // Chronological Fecha 1..N ordering and Junior involvement
    matches.forEach((m, idx) => {
      assert.equal(m.round, `Fecha ${idx + 1}`, `Unexpected round order at ${id} index ${idx}: ${m.round}`);
      assert.ok(
        m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
        `Unexpected non-Junior fixture in ${id}: ${m.homeTeam} vs ${m.awayTeam}`
      );
      assert.ok(m.date.trim().length >= 4, `Missing date label in ${id} ${m.round}`);
    });

    // Strict reconciliation with Junior's official standings row
    const summary = computeJuniorMatchArchiveSummary(matches);
    const juniorRow = tbl.rows.find((r) => r.isJunior);
    assert.ok(juniorRow, `Missing Junior standings row for ${id}`);
    assert.deepEqual(
      summary,
      {
        pj: juniorRow.pj,
        pg: juniorRow.pg,
        pe: juniorRow.pe,
        pp: juniorRow.pp,
        gf: juniorRow.gf,
        gc: juniorRow.gc,
        dg: juniorRow.dg,
        pts: juniorRow.pts,
      },
      `Match archive tally does not match official standings in ${id}`
    );

    // Rival symmetry: 1 home + 1 away against each rival, 1 meeting per vuelta
    const opponents = getMatchArchiveOpponents(matches);
    assert.equal(opponents.length, spec.rivals, `Expected ${spec.rivals} rivals in ${id}`);
    for (const opp of opponents) {
      const vsOpp = filterMatchArchiveFixtures(matches, { opponent: opp });
      const homeVsOpp = filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'home' });
      const awayVsOpp = filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'away' });
      assert.equal(vsOpp.length, 2, `Expected 2 matches vs ${opp} in ${id}`);
      assert.equal(homeVsOpp.length, 1, `Expected 1 home match vs ${opp} in ${id}`);
      assert.equal(awayVsOpp.length, 1, `Expected 1 away match vs ${opp} in ${id}`);
    }

    // 2-lap filtering splits evenly and matches unique rivals in each half
    const lapOpts = getMatchArchiveLapOptions(matches.length);
    assert.deepEqual(
      lapOpts.map((o) => o.id),
      ['all', '1', '2'],
      `Expected 2-lap options for ${id}`
    );
    const lap1 = filterMatchArchiveFixtures(matches, { lap: '1' });
    const lap2 = filterMatchArchiveFixtures(matches, { lap: '2' });
    assert.equal(lap1.length, spec.rivals, `Expected ${spec.rivals} matches in 1st vuelta for ${id}`);
    assert.equal(lap2.length, spec.rivals, `Expected ${spec.rivals} matches in 2nd vuelta for ${id}`);
    assert.equal(getMatchArchiveOpponents(lap1).length, spec.rivals, `Duplicate rival in 1st vuelta for ${id}`);
    assert.equal(getMatchArchiveOpponents(lap2).length, spec.rivals, `Duplicate rival in 2nd vuelta for ${id}`);
  }

  // Specific historical spot-checks for 1951 fix and 1953 calendar dates
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado')!;
  assert.equal(filterMatchArchiveFixtures(t1951.matchArchive!, { outcome: 'win' }).length, 14);
  assert.equal(filterMatchArchiveFixtures(t1951.matchArchive!, { outcome: 'draw' }).length, 8);
  assert.equal(filterMatchArchiveFixtures(t1951.matchArchive!, { outcome: 'loss' }).length, 12);
  const samariosHome1951 = t1951.matchArchive!.find(
    (m) => m.homeTeam === 'Junior de Barranquilla' && m.awayTeam === 'Deportivo Samarios'
  );
  assert.equal(samariosHome1951?.round, 'Fecha 32');
  assert.equal(samariosHome1951?.awayScore, 4);

  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado')!;
  assert.equal(t1953.matchArchive![0].date, '19 de abril de 1953');
  assert.equal(t1953.matchArchive![21].date, '11 de octubre de 1953');
});

test('1967 Campeonato Colombiano matchArchive contains all 52 Junior matches, chronological rounds, and strictly reconciles with official standings', () => {
  const t1967 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1967-campeonato');
  assert.ok(t1967 && t1967.matchArchive);

  const matches = t1967.matchArchive;
  assert.equal(matches.length, 52, 'Expected exact 52 Junior matches for 1967');

  matches.forEach((m, idx) => {
    assert.equal(m.round, `Fecha ${idx + 1}`, `Unexpected round order at 1967 index ${idx}: ${m.round}`);
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1967: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Dida') && !m.awayTeam.includes('Fútbol Colombiano'));
    assert.ok(m.date.includes('1967'), `Missing 1967 calendar date in ${m.round}: ${m.date}`);
  });

  const summary = computeJuniorMatchArchiveSummary(matches);
  const juniorRow = t1967.rows.find((r) => r.isJunior);
  assert.ok(juniorRow);
  assert.deepEqual(summary, {
    pj: juniorRow.pj,
    pg: juniorRow.pg,
    pe: juniorRow.pe,
    pp: juniorRow.pp,
    gf: juniorRow.gf,
    gc: juniorRow.gc,
    dg: juniorRow.dg,
    pts: juniorRow.pts,
  });

  const opponents = getMatchArchiveOpponents(matches);
  assert.equal(opponents.length, 13, 'Expected 13 distinct league rivals in 1967');
  for (const opp of opponents) {
    const vsOpp = filterMatchArchiveFixtures(matches, { opponent: opp });
    const homeVsOpp = filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'home' });
    const awayVsOpp = filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'away' });
    assert.equal(vsOpp.length, 4, `Expected 4 matches vs ${opp} in 1967`);
    assert.equal(homeVsOpp.length, 2, `Expected 2 home matches vs ${opp} in 1967`);
    assert.equal(awayVsOpp.length, 2, `Expected 2 away matches vs ${opp} in 1967`);
  }

  assert.deepEqual(
    getMatchArchiveLapOptions(matches.length).map((o) => o.id),
    ['all', '1', '2', '3', '4']
  );
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { venue: 'home' }).length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { venue: 'away' }).length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { outcome: 'win' }).length, 24);
  assert.equal(filterMatchArchiveFixtures(matches, { outcome: 'draw' }).length, 11);
  assert.equal(filterMatchArchiveFixtures(matches, { outcome: 'loss' }).length, 17);

  const caliTitleDraw = matches.find((m) => m.round === 'Fecha 49');
  assert.equal(caliTitleDraw?.date, '19 de noviembre de 1967');
  assert.equal(caliTitleDraw?.homeTeam, 'Deportivo Cali');
  assert.equal(caliTitleDraw?.homeScore, 0);
  assert.equal(caliTitleDraw?.awayScore, 0);
});










