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

  const crest1948 = getTournamentJuniorCrest(t1948);
  assert.equal(crest1948.src, '/assets/aistudio/ESCUDO_JUNIOR_1948_106008e2.png');

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

test('Santa Fe 1948-1950 historical crest applies strictly to 1948-1950 tournaments', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1977 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1977-hexagonal');
  assert.ok(t1948 && t1950 && t1951 && t1977);

  assert.equal(
    getTournamentTeamCrest(t1948, 'Independiente Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_1948-1950_6d4be8eb.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1950, 'Independiente Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_1948-1950_6d4be8eb.png'
  );
  assert.equal(getTournamentTeamCrest(t1951, 'Independiente Santa Fe'), null);
  assert.equal(getTournamentTeamCrest(t1977, 'Independiente Santa Fe'), null);

  // Boca Juniors de Cali must never resolve to Junior's crest
  assert.equal(getTournamentTeamCrest(t1950, 'Boca Juniors de Cali', false), null);
  assert.equal(
    getTournamentTeamCrest(t1950, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/image_82370351.png'
  );
});

test('Deportes Caldas 1947-1950 historical crest applies strictly to 1947-1950 tournaments', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  assert.ok(t1948 && t1950 && t1951);

  assert.equal(
    getTournamentTeamCrest(t1948, 'Deportes Caldas')?.src,
    '/assets/aistudio/Escudo_Deportes_Caldas_1947-1950.svg_8c1299a8.webp'
  );
  assert.equal(
    getTournamentTeamCrest(t1950, 'Deportes Caldas')?.src,
    '/assets/aistudio/Escudo_Deportes_Caldas_1947-1950.svg_8c1299a8.webp'
  );
  assert.equal(getTournamentTeamCrest(t1951, 'Deportes Caldas'), null);
  assert.equal(getTournamentTeamCrest(t1948, 'Once Deportivo'), null);
  assert.equal(getTournamentTeamCrest(t1950, 'Once Caldas'), null);
});

test('Millonarios 1947-1955 historical crest applies to 1947-1955 tables (including 1953 receso) and not 1966+', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado', '1952-dorado', '1953-dorado', '1953-1966-receso']) {
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

test('Atlético Municipal 1947-1950 historical crest applies strictly to 1947-1950 and excludes Universidad Nacional', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  assert.ok(t1948 && t1950 && t1951);

  assert.equal(
    getTournamentTeamCrest(t1948, 'Atlético Municipal (Nacional)')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1948, 'Atlético Municipal')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1950, 'Atlético Municipal (Nacional)')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Municipal__luego__Atl_tico_Nacional___1947-1950_64e37cfb.png'
  );
  assert.equal(getTournamentTeamCrest(t1948, 'Universidad Nacional'), null);
  assert.equal(getTournamentTeamCrest(t1951, 'Atlético Nacional'), null);
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

  assert.equal(getTournamentTeamCrest(t1950, 'Huracán de Medellín'), null);
  assert.equal(getTournamentTeamCrest(t1951, 'Huracán de Medellín'), null);
  assert.equal(getTournamentTeamCrest(t1952, 'Independiente Medellín'), null);
  assert.equal(getTournamentTeamCrest(t1966, 'Independiente Medellín'), null);
});





