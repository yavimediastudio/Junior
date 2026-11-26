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
  getJuniorChampionshipStarLabel,
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
  getTournamentPointsPerWin,
  getMatchArchiveOpponents,
  getMatchArchiveLapOptions,
  filterMatchArchiveFixtures,
  buildPlayoffKnockoutBrackets,
} from './footballLogic';
import { LeagueStanding, MatchFixture } from '../types/football';
import { RIVAL_FRANCHISES_CATALOG } from '../data/rivalFranchisesData';
import {
  buildAllHeadToHeadFranchises,
  filterHeadToHeadMatches,
  resolveClubFranchiseId,
} from './headToHeadLogic';
import {
  WIKIPEDIA_SOURCE_URL,
  CLUB_HISTORY_INTRO,
  CLUB_INSTITUTIONAL_FACTS,
  CLUB_HISTORY_CHAPTERS,
  CLUB_SYMBOLS_DATA,
  CLUB_STADIUMS_AND_FACILITIES,
  CLUB_GENERAL_STATS,
  CLUB_BIGGEST_SCORES,
  CLUB_LANDMARK_RECORDS,
  CLUB_CULTURAL_TOPICS,
} from '../data/clubHistoryData';
import fs from 'node:fs';
import path from 'node:path';
import {
  filterHistoryChapters,
  getHistoryEraCounts,
} from './historyLogic';
import {
  TOP_50_SCORERS_DATA,
  SCORER_ERA_FILTERS,
  TOP_50_SCORERS_SOURCE_URL,
} from '../data/topScorers50Data';
import {
  getBreakdownSum,
  getInternationalGoals,
  getScorerEraCounts,
  getScorerInitials,
  filterTopScorers,
  getAdjacentScorers,
} from './topScorersLogic';
import { LEGENDS_DATA } from '../data/juniorData';

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
import {
  ANNUAL_RECLASSIFICATION_TABLES,
  getAnnualReclassificationByYear,
} from '../data/annualReclassificationTables';
import { JUNIOR_TIMELINE_MILESTONES } from '../data/juniorTimelineData';
import {
  ALL_14_OFFICIAL_TITLES,
  ALL_TIME_DIMAYOR_TABLE,
  GOLDEN_BOOT_WINNERS,
  HISTORIC_DERBIES,
  JUNIOR_YEARLY_STANDINGS,
  STANDINGS_2026_II_DATA,
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

  const reclasIds = new Set(ANNUAL_RECLASSIFICATION_TABLES.map((t) => t.id));
  const searchIds = new Set<string>();
  for (const item of ENCYCLOPEDIA_SEARCH_ITEMS) {
    assert.ok(!searchIds.has(item.id), `Duplicate search item ID: ${item.id}`);
    searchIds.add(item.id);
    if (item.standingsTableId) {
      assert.ok(
        tableIds.has(item.standingsTableId) || reclasIds.has(item.standingsTableId),
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

  const t1976 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1976-hexagonal');
  const t1978 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1978-semifinal');
  const t1979 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1979-cuadrangular');
  const t1980 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1980-cuadrangular');
  const t1981 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1981-cuadrangular');
  const t1993 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '1993');
  const t1994 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '1994');
  const t1995 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '1995');
  assert.ok(t1976 && t1978 && t1979 && t1980 && t1981 && t1993 && t1994 && t1995);

  assert.equal(getTournamentJuniorCrest(t1967).src, '/assets/aistudio/image_82370351.png');
  assert.equal(getTournamentJuniorCrest(t1976).src, '/assets/aistudio/image_82370351.png');

  for (const tbl of [t1977, t1978, t1979]) {
    const crest = getTournamentJuniorCrest(tbl);
    assert.equal(
      crest.src,
      '/assets/aistudio/ESCUDO_JUNIOR_1977-1980_6559099c.png',
      `Expected Junior 1977-1980 crest for ${tbl.id}`
    );
    assert.equal(crest.alt, 'Escudo Histórico Junior 1977-1980');
  }

  for (const tbl of [t1980, t1981, t1993]) {
    const crest = getTournamentJuniorCrest(tbl);
    assert.equal(
      crest.src,
      '/assets/aistudio/ESCUDO_JUNIOR_1980-1993_13294272.png',
      `Expected Junior 1980-1993 crest for ${tbl.id}`
    );
    assert.equal(crest.alt, 'Escudo Histórico Junior 1980-1993');
  }

  const crest1994 = getTournamentJuniorCrest(t1994);
  assert.equal(crest1994.src, '/assets/aistudio/ESCUDO_JUNIOR_1994_b3280916.png');
  assert.equal(crest1994.alt, 'Escudo Histórico Junior 1994');
  assert.equal(getTournamentJuniorCrest(t1995).src, '/assets/aistudio/image_82370351.png');

  // Verify 1948 also has 18 matchArchive fixtures involving Junior
  assert.equal(t1948.matchArchive?.length, 18);
  for (const match of t1948.matchArchive ?? []) {
    assert.ok(
      match.homeTeam.includes('Junior') || match.awayTeam.includes('Junior'),
      `1948 match missing Junior: ${match.homeTeam} vs ${match.awayTeam}`
    );
  }
});

test('Santa Fe 1948-1949, 1950-1951, 1952-1956, 1966, 1967-2012, and 2013-2016 historical crests apply strictly to their respective tournaments', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t1967 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1967-campeonato');
  const t1968 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1968-campeonato');
  const t1977 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1977-hexagonal');
  const t2012II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2012-II-cuadrangular');
  const t2013I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2013-I-regular');
  const t2017I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2017-I');
  assert.ok(t1948 && t1950 && t1951 && t1952 && t1953 && t1966 && t1967 && t1968 && t1977 && t2012II && t2013I && t2017I);

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
  assert.equal(
    getTournamentTeamCrest(t1966, 'Independiente Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_1966-1967_a0a1e3e6.png',
    'Expected Santa Fe 1966-1967 crest for 1966-reingreso'
  );
  for (const tbl of [t1967, t1968, t1977, t2012II]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Independiente Santa Fe')?.src,
      '/assets/aistudio/SANTA_FE_1967-2012_2ab6a468.png',
      `Expected Santa Fe 1967-2012 crest for ${tbl.id}`
    );
  }
  const santaFe2013To2016 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) =>
    /^201[3-6]\b/.test(t.year)
  );
  assert.equal(santaFe2013To2016.length, 8, 'Expected 8 tournaments from 2013-I to 2016-II');
  for (const tbl of santaFe2013To2016) {
    const crest = getTournamentTeamCrest(tbl, 'Independiente Santa Fe');
    assert.equal(
      crest?.src,
      '/assets/aistudio/SANTA_FE_2013-2016_26e4f7e3.png',
      `Expected Santa Fe 2013-2016 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Santa Fe 2013-2016');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2013' }, 'Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_2013-2016_26e4f7e3.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2016' }, 'Independiente Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_2013-2016_26e4f7e3.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'custom-1957', year: '1957' }, 'Independiente Santa Fe'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1965', year: '1965' }, 'Independiente Santa Fe'), null);
  const santaFe2017Plus = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2017;
  });
  assert.ok(santaFe2017Plus.length >= 18, `Expected >=18 tournaments from 2017+, got ${santaFe2017Plus.length}`);
  for (const tbl of santaFe2017Plus) {
    const crest = getTournamentTeamCrest(tbl, 'Independiente Santa Fe');
    assert.equal(
      crest?.src,
      '/assets/aistudio/SANTA_FE_2017_en_adelante_cc4f4a7c.png',
      `Expected Santa Fe 2017+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Santa Fe 2017-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2017' }, 'Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_2017_en_adelante_cc4f4a7c.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Independiente Santa Fe')?.src,
    '/assets/aistudio/SANTA_FE_2017_en_adelante_cc4f4a7c.png'
  );


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
    '/assets/aistudio/ESCUDO_JUNIOR_1977-1980_6559099c.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1980-cuadrangular', year: '1980' }, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/ESCUDO_JUNIOR_1980-1993_13294272.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1993-cuadrangular', year: '1993' }, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/ESCUDO_JUNIOR_1980-1993_13294272.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1994-cuadrangular', year: '1994' }, 'Junior de Barranquilla', true)?.src,
    '/assets/aistudio/ESCUDO_JUNIOR_1994_b3280916.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1995-nivelacion', year: '1995' }, 'Junior de Barranquilla', true)?.src,
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

test('Millonarios 1947-1955, 1956-1973, 1974-1975, 1975-1976, 1977-1985, 1986-1990, 1991-1993, 1994-1996, 1997-1999, 2000-2002, 2003-2006, and 2007-2010 historical crests apply strictly to their respective ranges and exclude 2011+', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado', '1952-dorado', '1953-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Millonarios F.C.')?.src,
      '/assets/aistudio/MILLONARIOS_1947-1955_a27e65ae.png',
      `Expected Millonarios 1947-1955 crest for ${id}`
    );
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1955' }, 'Millonarios F.C')?.src,
    '/assets/aistudio/MILLONARIOS_1947-1955_a27e65ae.png'
  );

  for (const id of [
    '1966-reingreso',
    '1967-campeonato',
    '1968-campeonato',
    '1970-cuadrangular',
    '1972-triangular',
    '1973-triangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Millonarios F.C.')?.src,
      '/assets/aistudio/MILLONARIOS_1956-1974_706de05d.png',
      `Expected Millonarios 1956-1974 crest for ${id}`
    );
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1956' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_1956-1974_706de05d.png'
  );

  const t1974 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1974-hexagonal');
  assert.ok(t1974, 'Missing table 1974-hexagonal');
  assert.equal(
    getTournamentTeamCrest(t1974, 'Millonarios F.C.')?.src,
    '/assets/aistudio/MILLONARIOS_1974-1975_aad7c182.png',
    'Expected Millonarios 1974-1975 crest for 1974-hexagonal'
  );

  for (const id of ['1975-hexagonal', '1976-hexagonal']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Millonarios F.C.')?.src,
      '/assets/aistudio/MILLONARIOS_1975-1976_31a73b01.png',
      `Expected Millonarios 1975-1976 crest for ${id}`
    );
  }

  for (const id of ['1977-hexagonal', '1978-semifinal', '1980-cuadrangular', '1985-octogonal']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Millonarios F.C.')?.src,
      '/assets/aistudio/MILLONARIOS_1977-1985_287f6a88.png',
      `Expected Millonarios 1977-1985 crest for ${id}`
    );
  }

  for (const id of [
    '1986-octogonal',
    '1987-octogonal',
    '1988-octogonal',
    '1989-desierto',
    '1990-reclasificacion',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Millonarios F.C.')?.src,
      '/assets/aistudio/MILLONARIOS_1986-1990_bfddd8f7.png',
      `Expected Millonarios 1986-1990 crest for ${id}`
    );
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1988' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_1986-1990_bfddd8f7.png'
  );

  for (const id of ['1991-cuadrangular', '1992-cuadrangular', '1993-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_1991-1993_6f66335e.png',
      `Expected Millonarios 1991-1993 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 1991-1993');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1992' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_1991-1993_6f66335e.png'
  );

  for (const id of [
    '1994-cuadrangular',
    '1995-nivelacion',
    '1995-96-cuadrangular',
    '1996-97-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_1994-1996_2b96201e.png',
      `Expected Millonarios 1994-1996 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 1994-1996');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1996' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_1994-1996_2b96201e.png'
  );

  for (const id of ['1997-adecuacion', '1998-reclasificacion', '1999-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_1997-1999_224dd26f.png',
      `Expected Millonarios 1997-1999 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 1997-1999');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1998' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_1997-1999_224dd26f.png'
  );

  for (const id of [
    '2000-cuadrangular',
    '2001-reclasificacion',
    '2002-I-regular',
    '2002-II-regular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_2000-2002_cda26f62.png',
      `Expected Millonarios 2000-2002 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 2000-2002');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2001' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_2000-2002_cda26f62.png'
  );

  for (const id of [
    '2003-I-cuadrangular',
    '2003-II-cuadrangular',
    '2004-I-cuadrangular',
    '2004-II-cuadrangular',
    '2005-I-regular',
    '2005-II-cuadrangular',
    '2006-I-regular',
    '2006-II-regular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_2003-2006_67afa5b8.png',
      `Expected Millonarios 2003-2006 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 2003-2006');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2003' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_2003-2006_67afa5b8.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2006' }, 'Millonarios F.C.')?.src,
    '/assets/aistudio/MILLONARIOS_2003-2006_67afa5b8.png'
  );

  for (const id of [
    '2007-I-regular',
    '2007-II-regular',
    '2008-I-regular',
    '2008-II-cuadrangular',
    '2009-I-cuadrangular',
    '2009-II-cuadrangular',
    '2010-I-semifinal',
    '2010-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_2007-2010_1ed3e19b.png',
      `Expected Millonarios 2007-2010 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 2007-2010');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2007' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_2007-2010_1ed3e19b.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2010' }, 'Millonarios F.C.')?.src,
    '/assets/aistudio/MILLONARIOS_2007-2010_1ed3e19b.png'
  );

  const t2011I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-I-regular');
  const t2011II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-II-playoffs');
  const t2015I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2015-I');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t2011I && t2011II && t2015I && t2023);
  for (const tbl of [t2011I, t2011II]) {
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_2011_e6634bf9.png',
      `Expected Millonarios 2011 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 2011');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2011' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_2011_e6634bf9.png'
  );
  const millo2012To2014 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) =>
    /^201[2-4]\b/.test(t.year)
  );
  assert.equal(millo2012To2014.length, 6, 'Expected 6 tournaments from 2012-I to 2014-II');
  for (const tbl of millo2012To2014) {
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_2012-2014_0c884f38.png',
      `Expected Millonarios 2012-2014 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Millonarios 2012-2014');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2012' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_2012-2014_0c884f38.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2014' }, 'Millonarios F.C.')?.src,
    '/assets/aistudio/MILLONARIOS_2012-2014_0c884f38.png'
  );
  for (const tbl of [t2015I, t2023]) {
    const crest = getTournamentTeamCrest(tbl, 'Millonarios F.C.');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MILLONARIOS_2015_hasta_hoy_8e029042.png',
      `Expected Millonarios 2015+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Millonarios 2015-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2015' }, 'Millonarios')?.src,
    '/assets/aistudio/MILLONARIOS_2015_hasta_hoy_8e029042.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Millonarios F.C.')?.src,
    '/assets/aistudio/MILLONARIOS_2015_hasta_hoy_8e029042.png'
  );
});

test('Atlético Municipal / Nacional 1947-1949, 1950-1953, 1954-1988, 1989-1993, 1994-1995, 1996-1999, and 2000-present crests apply strictly and exclude Universidad Nacional', () => {
  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  const t1953 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1953-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t1967 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1967-campeonato');
  const t1976 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1976-hexagonal');
  const t1988 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1988-octogonal');
  const t1989 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1989-desierto');
  const t1990 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1990-reclasificacion');
  const t1991 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1991-cuadrangular');
  const t1992 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1992-cuadrangular');
  const t1993 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1993-cuadrangular');
  const t1994 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1994-cuadrangular');
  const t1995 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-nivelacion');
  const t199596 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-96-cuadrangular');
  const t199697 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1996-97-cuadrangular');
  const t1997 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1997-adecuacion');
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  const t1999 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1999-cuadrangular');
  const t2000 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2000-cuadrangular');
  assert.ok(
    t1948 &&
      t1950 &&
      t1951 &&
      t1952 &&
      t1953 &&
      t1966 &&
      t1967 &&
      t1976 &&
      t1988 &&
      t1989 &&
      t1990 &&
      t1991 &&
      t1992 &&
      t1993 &&
      t1994 &&
      t1995 &&
      t199596 &&
      t199697 &&
      t1997 &&
      t1998 &&
      t1999 &&
      t2000
  );

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
  for (const tbl of [{ id: 'custom-1954', year: '1954' }, t1966, t1967, t1976, t1988]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Atlético Nacional')?.src,
      '/assets/aistudio/nacional_54-88_e08b0a06.png',
      `Expected Atlético Nacional 1954-1988 crest for ${tbl.id}`
    );
  }
  for (const tbl of [t1989, t1990, t1991, t1992, t1993]) {
    const crest = getTournamentTeamCrest(tbl, 'Atlético Nacional');
    assert.equal(
      crest?.src,
      '/assets/aistudio/nacional_89-93_64c7048e.png',
      `Expected Atlético Nacional 1989-1993 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Atlético Nacional 1989-1993');
  }
  for (const tbl of [t1994, t1995, t199596]) {
    const crest = getTournamentTeamCrest(tbl, 'Atlético Nacional');
    assert.equal(
      crest?.src,
      '/assets/aistudio/nacional_94-95_6d46dd78.png',
      `Expected Atlético Nacional 1994-1995 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Atlético Nacional 1994-1995');
  }
  for (const tbl of [t199697, t1997, t1998, t1999]) {
    const crest = getTournamentTeamCrest(tbl, 'Atlético Nacional');
    assert.equal(
      crest?.src,
      '/assets/aistudio/nacional_96-99_1bdc5b71.png',
      `Expected Atlético Nacional 1996-1999 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Atlético Nacional 1996-1999');
  }
  assert.equal(
    getTournamentTeamCrest(t1948, 'Universidad Nacional')?.src,
    '/assets/aistudio/image_63a79417.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1951, 'Universidad Nacional')?.src,
    '/assets/aistudio/image_63a79417.png'
  );
  assert.equal(
    getTournamentTeamCrest(t2000, 'Universidad Nacional')?.src,
    '/assets/aistudio/image_63a79417.png'
  );

  for (const id of [
    '2000-cuadrangular',
    '2001-reclasificacion',
    '2002-I-regular',
    '2023-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Atlético Nacional');
    assert.equal(
      crest?.src,
      '/assets/aistudio/escudo_nacional_2000-actualidad_79016b5a.png',
      `Expected Atlético Nacional 2000-present crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Atlético Nacional 2000-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2000' }, 'Atl. Nacional')?.src,
    '/assets/aistudio/escudo_nacional_2000-actualidad_79016b5a.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Nacional')?.src,
    '/assets/aistudio/escudo_nacional_2000-actualidad_79016b5a.png'
  );
});

test('América de Cali 1940-1961, 1964-1975, 1976-1977, 1978-1981, 1982-1983, 1984, 1985, 1986, 1987, 1988, 1989-1990, 1991-1992, 1993-1997, 1998-2000, and 2001-2004 historical crests apply strictly to their respective ranges and exclude 1962-1963 and 2005+', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado', '1952-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'América de Cali')?.src,
      '/assets/aistudio/AMERICA_1940-1961_e9be8b73.png',
      `Expected América 1940-1961 crest for ${id}`
    );
  }

  for (const id of [
    '1966-reingreso',
    '1967-campeonato',
    '1968-campeonato',
    '1970-cuadrangular',
    '1974-hexagonal',
    '1975-hexagonal',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'América de Cali')?.src,
      '/assets/aistudio/AMERICA_1964-1976_162e4a73.png',
      `Expected América 1964-1976 crest for ${id}`
    );
  }

  for (const id of ['1976-hexagonal', '1977-hexagonal']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'América de Cali')?.src,
      '/assets/aistudio/AMERICA_1976-1977_f8a3472a.png',
      `Expected América 1976-1977 crest for ${id}`
    );
  }

  for (const id of [
    '1978-semifinal',
    '1979-cuadrangular',
    '1980-cuadrangular',
    '1981-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'América de Cali')?.src,
      '/assets/aistudio/AMERICA_1978-1982_fb4dc8ad.png',
      `Expected América 1978-1982 crest for ${id}`
    );
  }

  for (const id of ['1982-octogonal', '1983-octogonal']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'América de Cali')?.src,
      '/assets/aistudio/america_82-83_5b814bd1.png',
      `Expected América 1982-1983 crest for ${id}`
    );
    assert.equal(
      getTournamentTeamCrest(tbl, 'América de Cali')?.alt,
      'Escudo Histórico América de Cali 1982-1983'
    );
  }

  const t1948 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1948-inaugural');
  const t1984 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1984-octogonal');
  const t1985 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1985-octogonal');
  const t1986 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1986-octogonal');
  const t1987 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1987-octogonal');
  const t1988 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1988-octogonal');
  const t1989 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1989-desierto');
  const t1990 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1990-reclasificacion');
  const t1991 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1991-cuadrangular');
  const t1992 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1992-cuadrangular');
  const t1993 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1993-cuadrangular');
  const t1994 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1994-cuadrangular');
  const t1995 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-nivelacion');
  const t199596 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-96-cuadrangular');
  const t199697 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1996-97-cuadrangular');
  const t1997 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1997-adecuacion');
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(
    t1948 &&
      t1984 &&
      t1985 &&
      t1986 &&
      t1987 &&
      t1988 &&
      t1989 &&
      t1990 &&
      t1991 &&
      t1992 &&
      t1993 &&
      t1994 &&
      t1995 &&
      t199596 &&
      t199697 &&
      t1997 &&
      t1998 &&
      t2023
  );

  assert.equal(
    getTournamentTeamCrest(t1984, 'América de Cali')?.src,
    '/assets/aistudio/america_84_a2e0b5ef.png',
    'Expected América 1984 crest for 1984-octogonal'
  );
  assert.equal(
    getTournamentTeamCrest(t1984, 'América de Cali')?.alt,
    'Escudo Histórico América de Cali 1984'
  );

  assert.equal(
    getTournamentTeamCrest(t1985, 'América de Cali')?.src,
    '/assets/aistudio/america_85_1df539ce.png',
    'Expected América 1985 crest for 1985-octogonal'
  );
  assert.equal(
    getTournamentTeamCrest(t1985, 'América de Cali')?.alt,
    'Escudo Histórico América de Cali 1985'
  );

  assert.equal(
    getTournamentTeamCrest(t1986, 'América de Cali')?.src,
    '/assets/aistudio/america_86_30765880.png',
    'Expected América 1986 crest for 1986-octogonal'
  );
  assert.equal(
    getTournamentTeamCrest(t1986, 'América de Cali')?.alt,
    'Escudo Histórico América de Cali 1986'
  );

  assert.equal(
    getTournamentTeamCrest(t1987, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1987_c3e7b6ea.png',
    'Expected América 1987 crest for 1987-octogonal'
  );
  assert.equal(
    getTournamentTeamCrest(t1987, 'América de Cali')?.alt,
    'Escudo Histórico América de Cali 1987'
  );

  assert.equal(
    getTournamentTeamCrest(t1988, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1988_955f5918.png',
    'Expected América 1988 crest for 1988-octogonal'
  );
  assert.equal(
    getTournamentTeamCrest(t1988, 'América de Cali')?.alt,
    'Escudo Histórico América de Cali 1988'
  );

  for (const tbl of [t1989, t1990]) {
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_1989-90_a4c15c3c.png',
      `Expected América 1989-1990 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 1989-1990');
  }

  for (const tbl of [t1991, t1992]) {
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_1991-92_1e26761b.png',
      `Expected América 1991-1992 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 1991-1992');
  }

  for (const tbl of [t1993, t1994, t1995, t199596, t199697, t1997]) {
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_1993-97_bb5c7139.png',
      `Expected América 1993-1997 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 1993-1997');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1997' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1993-97_bb5c7139.png'
  );

  const t1999 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1999-cuadrangular');
  const t2000 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2000-cuadrangular');
  const t2001 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2001');
  assert.ok(t1999 && t2000 && t2001);

  for (const tbl of [t1998, t1999, t2000]) {
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_1998-2000_c41f8c6c.png',
      `Expected América 1998-2000 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 1998-2000');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2000' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1998-2000_c41f8c6c.png'
  );

  for (const id of [
    '2001-reclasificacion',
    '2002-I-regular',
    '2002-II-regular',
    '2003-I-cuadrangular',
    '2003-II-cuadrangular',
    '2004-I-cuadrangular',
    '2004-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_2001-2004_669b33f5.png',
      `Expected América 2001-2004 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 2001-2004');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2001' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2001-2004_669b33f5.png'
  );

  for (const id of [
    '2005-I-regular',
    '2005-II-cuadrangular',
    '2006-I-regular',
    '2006-II-regular',
    '2007-I-regular',
    '2007-II-regular',
    '2008-I-regular',
    '2008-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_2005-2008_6f584edc.png',
      `Expected América 2005-2008 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 2005-2008');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2005' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2005-2008_6f584edc.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2008' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2005-2008_6f584edc.png'
  );

  for (const id of [
    '2009-I-cuadrangular',
    '2009-II-cuadrangular',
    '2010-I-semifinal',
    '2010-II-cuadrangular',
    '2011-I-regular',
    '2011-II-playoffs',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_2009-2012_44002d9e.png',
      `Expected América 2009-2011 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 2009-2012');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2009' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2009-2012_44002d9e.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2011' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2009-2012_44002d9e.png'
  );

  // 2009-I and 2009-II are now 100% complete with historical crests
  for (const id of ['2009-I-cuadrangular', '2009-II-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const rows = tbl.regularRows || tbl.rows || [];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }

  const america2012To2019 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2012 && yr <= 2019;
  });
  assert.ok(america2012To2019.length >= 16, `Expected >=16 tournaments from 2012-2019, got ${america2012To2019.length}`);
  for (const tbl of america2012To2019) {
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_2012-2020_6cd4b171.png',
      `Expected América 2012-2019 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 2012-2020');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2012' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2012-2020_6cd4b171.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2019' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2012-2020_6cd4b171.png'
  );

  const america2020To2022 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2020 && yr <= 2022;
  });
  assert.equal(america2020To2022.length, 5, 'Expected 5 tournaments from 2020 through 2022-II');
  for (const tbl of america2020To2022) {
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/AMERICA_2020-2022_2bd9bfcd.png',
      `Expected América 2020-2022 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico América de Cali 2020-2022');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2020' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2020-2022_2bd9bfcd.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2022' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_2020-2022_2bd9bfcd.png'
  );

  // Tigres F.C. official crest and 100% completion of 2017-I & 2017-II
  const t2017I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2017-I-regular');
  const t2017II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2017-II-playoffs');
  assert.ok(t2017I && t2017II);
  for (const tbl of [t2017I, t2017II]) {
    const tigresCrest = getTournamentTeamCrest(tbl, 'Tigres F.C');
    assert.equal(
      tigresCrest?.src,
      '/assets/aistudio/tigres_fc_bogota_presente-YrDLRPlj0Mtr6M3M_e69a883b.webp',
      `Expected Tigres F.C. crest for ${tbl.id}`
    );
    assert.equal(tigresCrest?.alt, 'Escudo Oficial Tigres F.C.');
    const rows = [
      ...(tbl.regularRows || []),
      ...(tbl.rows || []),
      ...(tbl.finalGroups || []).flatMap((g) => g.rows),
    ];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2017' }, 'Tigres F.C')?.src,
    '/assets/aistudio/tigres_fc_bogota_presente-YrDLRPlj0Mtr6M3M_e69a883b.webp'
  );

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1961', year: '1961' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1940-1961_e9be8b73.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1964', year: '1964' }, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1964-1976_162e4a73.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'custom-1962', year: '1962' }, 'América de Cali'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1963', year: '1963' }, 'América de Cali'), null);
  const america2023Plus = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2023;
  });
  assert.equal(america2023Plus.length, 8, 'Expected 8 tournaments from 2023-I through 2026-II');
  for (const tbl of america2023Plus) {
    const crest = getTournamentTeamCrest(tbl, 'América de Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/escudo_america_2023_en_adel_ante_1884f5e3.webp',
      `Expected América 2023+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial América de Cali 2023-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2023' }, 'América de Cali')?.src,
    '/assets/aistudio/escudo_america_2023_en_adel_ante_1884f5e3.webp'
  );
  assert.equal(
    getTournamentTeamCrest(t2023, 'América de Cali')?.src,
    '/assets/aistudio/escudo_america_2023_en_adel_ante_1884f5e3.webp'
  );
  assert.equal(getTournamentTeamCrest(t1948, 'Nacional, América y Santa Fe'), null);
});

test('Independiente Medellín 1913-1951, 1966-2006, 2007-2009, and 2010 historical crests apply strictly to their respective ranges and exclude Huracán de Medellín and 2011+', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Independiente Medellín')?.src,
      '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png',
      `Expected Independiente Medellín 1913-1951 crest for ${id}`
    );
  }

  for (const id of [
    '1966-reingreso',
    '1967-campeonato',
    '1975-finalizacion',
    '1989-desierto',
    '1995-96-cuadrangular',
    '1996-97-cuadrangular',
    '1997-adecuacion',
    '1998-reclasificacion',
    '1999-cuadrangular',
    '2000-cuadrangular',
    '2002-I-regular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    if (!tbl) continue;
    const crest = getTournamentTeamCrest(tbl, 'Independiente Medellín');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png',
      `Expected Independiente Medellín 1966-2006 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Independiente Medellín 1966-2006');
  }

  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t1967 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1967-campeonato');
  const t1995 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-96-cuadrangular');
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  const t2006II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2006-II');
  const t2007I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2007-I');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t1966 && t1967 && t1995 && t1998 && t2006II && t2007I && t2023);

  assert.equal(
    getTournamentTeamCrest(t1966, 'Indep. Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1967, 'DIM')?.src,
    '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1995, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1998, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png'
  );
  assert.equal(
    getTournamentTeamCrest(t2006II, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png'
  );

  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado');
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-dorado');
  assert.ok(t1950 && t1951 && t1952);

  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Huracán de Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1951, 'Huracán de Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1913-1951_1abd4262.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '1967' }, 'Huracán de Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png'
  );
  for (const id of [
    '2007-I-regular',
    '2007-II-regular',
    '2008-I-regular',
    '2008-II-cuadrangular',
    '2009-I-cuadrangular',
    '2009-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Independiente Medellín');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MEDELLIN_2007-2009_631a4ab0.png',
      `Expected Independiente Medellín 2007-2009 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Independiente Medellín 2007-2009');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2007' }, 'DIM')?.src,
    '/assets/aistudio/MEDELLIN_2007-2009_631a4ab0.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2009' }, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_2007-2009_631a4ab0.png'
  );

  const t2010I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2010-I-semifinal');
  const t2010II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2010-II-cuadrangular');
  const t2011I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-I-regular');
  const t2011II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-II-playoffs');
  assert.ok(t2010I && t2010II && t2011I && t2011II);

  for (const tbl of [t2010I, t2010II]) {
    const crest = getTournamentTeamCrest(tbl, 'Independiente Medellín');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MEDELLIN_2010_a68a7a10.png',
      `Expected Independiente Medellín 2010 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Independiente Medellín 2010');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2010' }, 'DIM')?.src,
    '/assets/aistudio/MEDELLIN_2010_a68a7a10.png'
  );

  const dimTables2011To2019 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) =>
    /^201[1-9]\b/.test(t.year)
  );
  assert.equal(dimTables2011To2019.length, 18, 'Expected 18 tournaments from 2011-I to 2019-II');
  for (const tbl of dimTables2011To2019) {
    const crest = getTournamentTeamCrest(tbl, 'Independiente Medellín');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MEDELLIN_2011-2019_fcd3602a.png',
      `Expected Independiente Medellín 2011-2019 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Independiente Medellín 2011-2019');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2011' }, 'DIM')?.src,
    '/assets/aistudio/MEDELLIN_2011-2019_fcd3602a.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2019' }, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_2011-2019_fcd3602a.png'
  );

  const dimTables2020To2025 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2020 && yr <= 2025;
  });
  assert.equal(dimTables2020To2025.length, 11, 'Expected 11 tournaments from 2020 through 2025-II');
  for (const tbl of dimTables2020To2025) {
    const crest = getTournamentTeamCrest(tbl, 'Independiente Medellín');
    assert.equal(
      crest?.src,
      '/assets/aistudio/MEDELLIN_2020-2025_644e57ef.png',
      `Expected Independiente Medellín 2020-2025 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Independiente Medellín 2020-2025');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2020' }, 'DIM')?.src,
    '/assets/aistudio/MEDELLIN_2020-2025_644e57ef.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2025' }, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_2020-2025_644e57ef.png'
  );

  assert.equal(getTournamentTeamCrest(t1952, 'Independiente Medellín'), null);
  assert.equal(getTournamentTeamCrest({ year: '1965' }, 'Independiente Medellín'), null);
  assert.equal(getTournamentTeamCrest({ year: '2026-I' }, 'Independiente Medellín'), null);
  assert.equal(getTournamentTeamCrest({ year: '2026' }, 'Independiente Medellín'), null);
});

test('Deportivo Cali 1948-2011 and 2012-present crests apply strictly to their respective ranges and exclude América/Boca', () => {
  for (const id of ['1948-inaugural', '1967-campeonato', '1995-96-cuadrangular', '2004-II-cuadrangular', '2011-II-playoffs']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportivo Cali')?.src,
      '/assets/aistudio/deportivo_cali_1948-2012_35d865b2.png',
      `Expected Deportivo Cali 1948-2011 crest for ${id}`
    );
    assert.equal(
      getTournamentTeamCrest(tbl, 'Dep. Cali')?.src,
      '/assets/aistudio/deportivo_cali_1948-2012_35d865b2.png',
      `Expected Dep. Cali 1948-2011 crest for ${id}`
    );
  }

  for (const id of ['2012-I-regular', '2012-II-cuadrangular', '2013-I-regular', '2013-II-cuadrangular', '2023-II-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Cali');
    assert.equal(
      crest?.src,
      '/assets/aistudio/deportivo_cali_2012-en_adelante_fe6382ad.png',
      `Expected Deportivo Cali 2012+ crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Deportivo Cali 2012-Actualidad');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Dep. Cali')?.src,
      '/assets/aistudio/deportivo_cali_2012-en_adelante_fe6382ad.png',
      `Expected Dep. Cali 2012+ crest for ${id}`
    );
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Deportivo Cali')?.src,
    '/assets/aistudio/deportivo_cali_2012-en_adelante_fe6382ad.png'
  );

  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1950 && t1966);

  assert.equal(
    getTournamentTeamCrest(t1950, 'Boca Juniors de Cali')?.src,
    '/assets/aistudio/image_7a8c8dde.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1966, 'América de Cali')?.src,
    '/assets/aistudio/deportivo_cali_1948-2012_35d865b2.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1966, 'América de Cali')?.src,
    '/assets/aistudio/AMERICA_1964-1976_162e4a73.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '2012' }, 'América de Cali')?.src,
    '/assets/aistudio/deportivo_cali_2012-en_adelante_fe6382ad.png'
  );
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
    for (const rg of t.regularGroups || []) {
      for (const r of rg.rows) {
        const badge = getRowStatusBadge(t, r, 'regularGroup', rg.groupName);
        assert.ok(badge && badge !== '-', `Empty badge in ${t.id} regularGroup ${rg.groupName} for ${r.team}`);
      }
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
  assert.notEqual(
    getTournamentTeamCrest(t1966, 'Once Caldas')?.src,
    '/assets/aistudio/image_93c1f912.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1966, 'Once Caldas')?.src,
    '/assets/aistudio/41396e6d-3efd-4d4c-97b6-ed027c1bfbc7_e6495777.png'
  );
});

test('Once Caldas 1961-2018 historical crests apply strictly to their respective ranges and exclude 1960/2019+, Once Deportivo, and Deportes Caldas', () => {
  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  assert.ok(t1966);
  assert.equal(
    getTournamentTeamCrest(t1966, 'Once Caldas')?.src,
    '/assets/aistudio/41396e6d-3efd-4d4c-97b6-ed027c1bfbc7_e6495777.png',
    'Expected Once Caldas 1961-1967 crest for 1966-reingreso'
  );

  for (const yr of ['1961', '1962', '1965']) {
    assert.equal(
      getTournamentTeamCrest({ year: yr }, 'Once Caldas')?.src,
      '/assets/aistudio/41396e6d-3efd-4d4c-97b6-ed027c1bfbc7_e6495777.png'
    );
  }

  for (const id of [
    '1967-campeonato',
    '1968-campeonato',
    '1969-campeonato',
    '1970-cuadrangular',
    '1971-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    if (!tbl) continue;
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/logo_c_anillos_transparente_2c90e2d2.png',
      `Expected Once Caldas 1967-1971 crest for ${id}`
    );
  }

  for (const id of [
    '1972-triangular',
    '1973-triangular',
    '1974-hexagonal',
    '1975-hexagonal',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/ince_caldas_de_1972-1976_0fb41669.png',
      `Expected Once Caldas 1972-1976 crest for ${id}`
    );
  }

  for (const id of [
    '1976-hexagonal',
    '1977-hexagonal',
    '1978-semifinal',
    '1979-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/ince_caldas_de_1976-1979_b1634e0f.png',
      `Expected Once Caldas 1976-1979 crest for ${id}`
    );
  }

  assert.equal(
    getTournamentTeamCrest({ id: '1973-triangular', year: '1973' }, 'Caldas')?.src,
    '/assets/aistudio/ince_caldas_de_1972-1976_0fb41669.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1975-hexagonal', year: '1975' }, 'Cristal Caldas')?.src,
    '/assets/aistudio/ince_caldas_de_1972-1976_0fb41669.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1976-hexagonal', year: '1976' }, 'Cristal Caldas')?.src,
    '/assets/aistudio/ince_caldas_de_1976-1979_b1634e0f.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: '1979-cuadrangular', year: '1979' }, 'Caldas')?.src,
    '/assets/aistudio/ince_caldas_de_1976-1979_b1634e0f.png'
  );

  const t1950 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1950-dorado');
  const t1980 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1980-cuadrangular');
  const t1981 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1981-cuadrangular');
  const t1982 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1982-octogonal');
  const t1983 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1983-octogonal');
  const t1984 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1984-octogonal');
  const t1985 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1985-octogonal');
  const t1986 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1986-octogonal');
  const t1987 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1987-octogonal');
  const t1988 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1988-octogonal');
  const t1989 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1989-desierto');
  const t1990 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1990-reclasificacion');
  const t1991 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1991-cuadrangular');
  const t1992 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1992-cuadrangular');
  const t1993 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1993-cuadrangular');
  const t1994 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1994-cuadrangular');
  const t1995 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-nivelacion');
  const t199596 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-96-cuadrangular');
  const t199697 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1996-97-cuadrangular');
  const t1997 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1997-adecuacion');
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  const t1999 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1999-cuadrangular');
  const t2000 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2000-cuadrangular');
  assert.ok(
    t1950 &&
      t1980 &&
      t1981 &&
      t1982 &&
      t1983 &&
      t1984 &&
      t1985 &&
      t1986 &&
      t1987 &&
      t1988 &&
      t1989 &&
      t1990 &&
      t1991 &&
      t1992 &&
      t1993 &&
      t1994 &&
      t1995 &&
      t199596 &&
      t199697 &&
      t1997 &&
      t1998 &&
      t1999 &&
      t2000
  );

  assert.equal(
    getTournamentTeamCrest(t1980, 'Once Caldas')?.src,
    '/assets/aistudio/Logotipo_rojo_Cristal_Caldas_fa11a891.png',
    'Expected Cristal Caldas 1980 crest for 1980-cuadrangular'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '1980' }, 'Once Caldas')?.src,
    '/assets/aistudio/Logotipo_rojo_Cristal_Caldas_fa11a891.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1980, 'Cristal Caldas')?.src,
    '/assets/aistudio/Logotipo_rojo_Cristal_Caldas_fa11a891.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1980, 'Caldas')?.src,
    '/assets/aistudio/Logotipo_rojo_Cristal_Caldas_fa11a891.png'
  );

  for (const tbl of [t1981, t1982, t1983]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Once Caldas')?.src,
      '/assets/aistudio/once_caldas_del_81_al_83_7a7a4a9a.png',
      `Expected Once Caldas 1981-1983 crest for ${tbl.id}`
    );
  }
  assert.equal(
    getTournamentTeamCrest(t1981, 'Varta Caldas')?.src,
    '/assets/aistudio/once_caldas_del_81_al_83_7a7a4a9a.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1983, 'Caldas')?.src,
    '/assets/aistudio/once_caldas_del_81_al_83_7a7a4a9a.png'
  );

  for (const tbl of [t1984, t1985, t1986]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Once Caldas')?.src,
      '/assets/aistudio/caldas_1984-1986_f5f1d42a.png',
      `Expected Once Caldas 1984-1986 crest for ${tbl.id}`
    );
  }
  assert.equal(
    getTournamentTeamCrest(t1984, 'Cristal Caldas')?.src,
    '/assets/aistudio/caldas_1984-1986_f5f1d42a.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1986, 'Caldas')?.src,
    '/assets/aistudio/caldas_1984-1986_f5f1d42a.png'
  );

  for (const tbl of [t1987, t1988, t1989, t1990]) {
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_del_87-90_530986be.png',
      `Expected Once Caldas 1987-1990 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 1987-1990');
  }
  assert.equal(
    getTournamentTeamCrest(t1987, 'Cristal Caldas')?.src,
    '/assets/aistudio/once_caldas_del_87-90_530986be.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1990, 'Caldas')?.src,
    '/assets/aistudio/once_caldas_del_87-90_530986be.png'
  );

  for (const tbl of [t1991, t1992, t1993]) {
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_del_91-93_3e56fe90.png',
      `Expected Once Caldas 1991-1993 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 1991-1993');
  }
  assert.equal(
    getTournamentTeamCrest(t1992, 'Once Philips')?.src,
    '/assets/aistudio/once_caldas_del_91-93_3e56fe90.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1993, 'Caldas')?.src,
    '/assets/aistudio/once_caldas_del_91-93_3e56fe90.png'
  );

  const crest1994 = getTournamentTeamCrest(t1994, 'Once Caldas');
  assert.equal(
    crest1994?.src,
    '/assets/aistudio/once_caldas_del_94_e6cd8054.png',
    'Expected Once Caldas 1994 crest for 1994-cuadrangular'
  );
  assert.equal(crest1994?.alt, 'Escudo Histórico Once Caldas 1994');
  assert.equal(
    getTournamentTeamCrest(t1994, 'Once Philips')?.src,
    '/assets/aistudio/once_caldas_del_94_e6cd8054.png'
  );

  for (const tbl of [t1995, t199596]) {
    const crest1995 = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest1995?.src,
      '/assets/aistudio/once_caldas_del_95_d4ccc7af.png',
      `Expected Once Caldas 1995 crest for ${tbl.id}`
    );
    assert.equal(crest1995?.alt, 'Escudo Histórico Once Caldas 1995');
  }
  assert.equal(
    getTournamentTeamCrest(t1995, 'Caldas')?.src,
    '/assets/aistudio/once_caldas_del_95_d4ccc7af.png'
  );

  const crest1996 = getTournamentTeamCrest(t199697, 'Once Caldas');
  assert.equal(
    crest1996?.src,
    '/assets/aistudio/once_caldas_del_96_deca2e30.png',
    'Expected Once Caldas 1996 crest for 1996-97-cuadrangular'
  );
  assert.equal(crest1996?.alt, 'Escudo Histórico Once Caldas 1996');
  assert.equal(
    getTournamentTeamCrest({ year: '1996' }, 'Caldas')?.src,
    '/assets/aistudio/once_caldas_del_96_deca2e30.png'
  );

  for (const tbl of [t1997, t1998, t1999]) {
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_del_97-99_c3f980e2.png',
      `Expected Once Caldas 1997-1999 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 1997-1999');
  }
  assert.equal(
    getTournamentTeamCrest(t1998, 'Caldas')?.src,
    '/assets/aistudio/once_caldas_del_97-99_c3f980e2.png'
  );

  for (const id of [
    '2000-cuadrangular',
    '2001-reclasificacion',
    '2002-I-regular',
    '2002-II-regular',
    '2003-I-cuadrangular',
    '2003-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_del_2000-2003_f59a376e.png',
      `Expected Once Caldas 2000-2003 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 2000-2003');
  }
  assert.equal(
    getTournamentTeamCrest(t2000, 'Caldas')?.src,
    '/assets/aistudio/once_caldas_del_2000-2003_f59a376e.png'
  );

  const t2004I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2004-I-cuadrangular');
  const t2004II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2004-II-cuadrangular');
  const t2005I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2005-I-regular');
  const t2005II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2005-II-cuadrangular');
  assert.ok(t2004I && t2004II && t2005I && t2005II);
  assert.equal(getTournamentTeamCrest({ year: '1960' }, 'Once Caldas'), null);
  for (const tbl of [t2004I, t2004II]) {
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(crest?.src, '/assets/aistudio/once_caldas_del_2003-2004_99540100.png');
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 2004');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2004' }, 'Once Caldas')?.src,
    '/assets/aistudio/once_caldas_del_2003-2004_99540100.png'
  );
  for (const id of [
    '2005-I-regular',
    '2005-II-cuadrangular',
    '2006-I-regular',
    '2006-II-regular',
    '2007-I-regular',
    '2007-II-regular',
    '2008-I-regular',
    '2008-II-cuadrangular',
    '2009-I-cuadrangular',
    '2009-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_2005-2009_4722779a.png',
      `Expected Once Caldas 2005-2009 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 2005-2009');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2005' }, 'Once Caldas')?.src,
    '/assets/aistudio/once_caldas_2005-2009_4722779a.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2009' }, 'Once Caldas')?.src,
    '/assets/aistudio/once_caldas_2005-2009_4722779a.png'
  );
  // 2005-I and 2005-II are now 100% complete with historical crests
  for (const tbl of [t2005I, t2005II]) {
    const rows = tbl.regularRows || tbl.rows || [];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
  const t2010I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2010-I-semifinal');
  const t2010II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2010-II-cuadrangular');
  const t2011I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-I-regular');
  const t2011II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-II-playoffs');
  assert.ok(t2010I && t2010II && t2011I && t2011II);
  for (const tbl of [t2010I, t2010II]) {
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_del_2010_a0f5c76f.png',
      `Expected Once Caldas 2010 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 2010');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2010' }, 'Once Caldas')?.src,
    '/assets/aistudio/once_caldas_del_2010_a0f5c76f.png'
  );
  // 2010-I and 2010-II are now 100% complete with historical crests
  for (const tbl of [t2010I, t2010II]) {
    const rows = tbl.regularRows || tbl.rows || [];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
  const tables2011To2018 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) =>
    /^201[1-8]\b/.test(t.year)
  );
  assert.equal(tables2011To2018.length, 16, 'Expected 16 tournaments from 2011-I to 2018-II');
  for (const tbl of tables2011To2018) {
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_del_2010-2018_d05d4ed7.png',
      `Expected Once Caldas 2010-2018 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Once Caldas 2010-2018');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2011' }, 'Once Caldas')?.src,
    '/assets/aistudio/once_caldas_del_2010-2018_d05d4ed7.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2018' }, 'Once Caldas')?.src,
    '/assets/aistudio/once_caldas_del_2010-2018_d05d4ed7.png'
  );
  const t2019I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2019-I');
  const t2019II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2019-II-cuadrangular');
  const t2026I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2026-I');
  assert.ok(t2019I && t2019II && t2026I);
  for (const tbl of [t2019I, t2019II, t2026I]) {
    const crest = getTournamentTeamCrest(tbl, 'Once Caldas');
    assert.equal(
      crest?.src,
      '/assets/aistudio/once_caldas_del_2019-actualidad_f4d4e1e9.png',
      `Expected Once Caldas 2019+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Once Caldas 2019-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2019' }, 'Once Caldas')?.src,
    '/assets/aistudio/once_caldas_del_2019-actualidad_f4d4e1e9.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Once Deportivo')?.src,
    '/assets/aistudio/41396e6d-3efd-4d4c-97b6-ed027c1bfbc7_e6495777.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '1961' }, 'Deportes Caldas')?.src,
    '/assets/aistudio/41396e6d-3efd-4d4c-97b6-ed027c1bfbc7_e6495777.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Once Deportivo')?.src,
    '/assets/aistudio/logo_c_anillos_transparente_2c90e2d2.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Once Deportivo')?.src,
    '/assets/aistudio/ince_caldas_de_1972-1976_0fb41669.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Once Deportivo')?.src,
    '/assets/aistudio/ince_caldas_de_1976-1979_b1634e0f.png'
  );
  assert.notEqual(
    getTournamentTeamCrest(t1950, 'Once Deportivo')?.src,
    '/assets/aistudio/Logotipo_rojo_Cristal_Caldas_fa11a891.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '1980' }, 'Deportes Caldas')?.src,
    '/assets/aistudio/Logotipo_rojo_Cristal_Caldas_fa11a891.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '1982' }, 'Deportes Caldas')?.src,
    '/assets/aistudio/once_caldas_del_81_al_83_7a7a4a9a.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '1982' }, 'Once Deportivo')?.src,
    '/assets/aistudio/once_caldas_del_81_al_83_7a7a4a9a.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '1985' }, 'Deportes Caldas')?.src,
    '/assets/aistudio/caldas_1984-1986_f5f1d42a.png'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '1985' }, 'Once Deportivo')?.src,
    '/assets/aistudio/caldas_1984-1986_f5f1d42a.png'
  );
});

test('Universidad Nacional historical crest applies across 1948-1952 without colliding with Atlético Nacional or Atlético Municipal', () => {
  for (const id of ['1948-inaugural', '1950-dorado', '1951-dorado', '1952-dorado']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Universidad Nacional');
    assert.equal(crest?.src, '/assets/aistudio/image_63a79417.png');
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
  assert.notEqual(
    getTournamentTeamCrest(t1966, 'Atlético Nacional')?.src,
    '/assets/aistudio/image_63a79417.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1966, 'Atlético Nacional')?.src,
    '/assets/aistudio/nacional_54-88_e08b0a06.png'
  );
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

test('Cúcuta Deportivo 1950-1971, 1972-2005, 2006-2008, and 2009-2014 historical crests apply strictly to their respective ranges and exclude 1949/2015+', () => {
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
  }

  for (const id of [
    '1972-triangular',
    '1973-triangular',
    '1989-desierto',
    '1995-96-cuadrangular',
    '1996-97-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    if (!tbl) continue;
    const crest = getTournamentTeamCrest(tbl, 'Cúcuta Deportivo');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cucuta_deportivo_1972-2005_570a5c06.png',
      `Expected Cúcuta Deportivo 1972-2005 crest for ${id}`
    );
  }

  for (const id of [
    '2006-I-regular',
    '2006-II-regular',
    '2007-I-regular',
    '2007-II-regular',
    '2008-I-regular',
    '2008-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Cúcuta Deportivo');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cucuta_deportivo_2006-2008_b56c9c96.png',
      `Expected Cúcuta Deportivo 2006-2008 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Cúcuta Deportivo 2006-2008');
  }

  for (const id of [
    '2009-I-cuadrangular',
    '2009-II-cuadrangular',
    '2010-I-semifinal',
    '2010-II-cuadrangular',
    '2011-I-regular',
    '2011-II-playoffs',
    '2012-I-regular',
    '2012-II-cuadrangular',
    '2013-I-regular',
    '2013-II-cuadrangular',
    '2014-I-playoffs',
    '2014-II-regular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Cúcuta Deportivo');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cucuta_deportivo_2009-2014_38fe25fc.png',
      `Expected Cúcuta Deportivo 2009-2014 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Cúcuta Deportivo 2009-2014');
  }

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2005', year: '2005' }, 'Cúcuta Deportivo')?.src,
    '/assets/aistudio/cucuta_deportivo_1972-2005_570a5c06.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2006', year: '2006' }, 'Cúcuta Deportivo')?.src,
    '/assets/aistudio/cucuta_deportivo_2006-2008_b56c9c96.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2008', year: '2008' }, 'Cúcuta Deportivo')?.src,
    '/assets/aistudio/cucuta_deportivo_2006-2008_b56c9c96.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2009', year: '2009' }, 'Cúcuta Deportivo')?.src,
    '/assets/aistudio/cucuta_deportivo_2009-2014_38fe25fc.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2014', year: '2014' }, 'Cúcuta Deportivo')?.src,
    '/assets/aistudio/cucuta_deportivo_2009-2014_38fe25fc.png'
  );
  assert.equal(getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Cúcuta Deportivo'), null);
  const t2015I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-I-playoffs');
  const t2015II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-II-playoffs');
  const t2020 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2020-playoffs');
  assert.ok(t2015I && t2015II && t2020);
  for (const tbl of [t2015I, t2015II, t2020]) {
    const crest = getTournamentTeamCrest(tbl, 'Cúcuta Deportivo');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cucuta_deportivo_2015-actualidad_f02aa3c3.png',
      `Expected Cúcuta Deportivo 2015+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Cúcuta Deportivo 2015-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2015', year: '2015' }, 'Cúcuta Deportivo')?.src,
    '/assets/aistudio/cucuta_deportivo_2015-actualidad_f02aa3c3.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2026', year: '2026-I' }, 'Cúcuta Deportivo')?.src,
    '/assets/aistudio/cucuta_deportivo_2015-actualidad_f02aa3c3.png'
  );
});

test('Atlético Bucaramanga 1950-1956, 1957-1985, 1986-1996, 1997-1999, and 2000-2009 historical crests apply strictly to their respective ranges and exclude 1949/2010+', () => {
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
    getTournamentTeamCrest({ id: 'custom-1956', year: '1956' }, 'Atlético Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_1950-1957_80f6c063.png'
  );

  for (const tbl of [
    { id: 'custom-1957', year: '1957' },
    ...['1966-reingreso', '1967-campeonato', '1974-hexagonal', '1982-octogonal', '1985-octogonal'].map((id) => {
      const found = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
      assert.ok(found, `Missing table ${id}`);
      return found;
    }),
  ]) {
    assert.equal(
      getTournamentTeamCrest(tbl, 'Atlético Bucaramanga')?.src,
      '/assets/aistudio/bucaramanga_1957-1985_9fd1460e.png',
      `Expected Atlético Bucaramanga 1957-1985 crest for ${tbl.id}`
    );
  }

  for (const id of [
    '1986-octogonal',
    '1987-octogonal',
    '1988-octogonal',
    '1989-desierto',
    '1990-reclasificacion',
    '1993-cuadrangular',
    '1995-96-cuadrangular',
    '1996-97-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Atlético Bucaramanga')?.src,
      '/assets/aistudio/bucaramanga_1986-1996_91b42c33.png',
      `Expected Atlético Bucaramanga 1986-1996 crest for ${id}`
    );
    assert.equal(
      getTournamentTeamCrest(tbl, 'Atlético Bucaramanga')?.alt,
      'Escudo Histórico Atlético Bucaramanga 1986-1996'
    );
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1996' }, 'Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_1986-1996_91b42c33.png'
  );

  for (const id of [
    '1997-adecuacion',
    '1998-reclasificacion',
    '1999-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Atlético Bucaramanga');
    assert.equal(
      crest?.src,
      '/assets/aistudio/bucaramanga_1997-2000_0f96a4fa.png',
      `Expected Atlético Bucaramanga 1997-1999 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Atlético Bucaramanga 1997-2000');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '1999' }, 'Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_1997-2000_0f96a4fa.png'
  );

  for (const id of [
    '2000-cuadrangular',
    '2001-reclasificacion',
    '2002-I-regular',
    '2005-I-regular',
    '2008-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Atlético Bucaramanga');
    assert.equal(
      crest?.src,
      '/assets/aistudio/bucaramanga_2000-2009_d6d21063.png',
      `Expected Atlético Bucaramanga 2000-2008 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Atlético Bucaramanga 2000-2009');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2000' }, 'Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_2000-2009_d6d21063.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2008' }, 'Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_2000-2009_d6d21063.png'
  );

  assert.equal(getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Atlético Bucaramanga'), null);
  const t2009II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2009-II-cuadrangular');
  const t2010I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2010-I-semifinal');
  const t2016I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-I-playoffs');
  const t2016II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-II-regular');
  const t2024 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2024-I-cuadrangular');
  assert.ok(t2009II && t2010I && t2016I && t2016II && t2024);
  for (const tbl of [t2009II, t2010I, t2016I, t2016II, t2024]) {
    const crest = getTournamentTeamCrest(tbl, 'Atlético Bucaramanga');
    assert.equal(
      crest?.src,
      '/assets/aistudio/bucaramanga_2009-em_adelante_62fa2b37.png',
      `Expected Atlético Bucaramanga 2009+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Atlético Bucaramanga 2009-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2009' }, 'Atlético Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_2009-em_adelante_62fa2b37.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Atlético Bucaramanga')?.src,
    '/assets/aistudio/bucaramanga_2009-em_adelante_62fa2b37.png'
  );
});

test('Sporting de Barranquilla 1950-1953, 1988-1990, and 1991 historical crests apply strictly to their respective ranges and exclude 1954-1987, 1992+, and Sporting Cristal', () => {
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

  for (const id of [
    '1988-octogonal',
    '1989-desierto',
    '1990-reclasificacion',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Sporting de Barranquilla');
    assert.equal(
      crest?.src,
      '/assets/aistudio/sporting_del_88_al_90_ce1415f4.png',
      `Expected Sporting 1988-1990 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Sporting de Barranquilla 1988-1990');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Sporting Club')?.src,
      '/assets/aistudio/sporting_del_88_al_90_ce1415f4.png'
    );
  }

  const t1991 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1991-cuadrangular');
  const t1992 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1992-cuadrangular');
  assert.ok(t1991 && t1992);
  const crest1991 = getTournamentTeamCrest(t1991, 'Sporting de Barranquilla');
  assert.equal(
    crest1991?.src,
    '/assets/aistudio/sporting_del_1991_ea5b0c81.png',
    'Expected Sporting 1991 crest for 1991-cuadrangular'
  );
  assert.equal(crest1991?.alt, 'Escudo Histórico Sporting de Barranquilla 1991');
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1991', year: '1991' }, 'Sporting Club')?.src,
    '/assets/aistudio/sporting_del_1991_ea5b0c81.png'
  );

  assert.equal(getTournamentTeamCrest({ id: 'custom-1949', year: '1949' }, 'Sporting de Barranquilla'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1954', year: '1954' }, 'Sporting de Barranquilla'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1987', year: '1987' }, 'Sporting de Barranquilla'), null);
  assert.equal(getTournamentTeamCrest(t1992, 'Sporting de Barranquilla'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1992', year: '1992' }, 'Sporting de Barranquilla'), null);
  assert.equal(getTournamentTeamCrest({ id: 'lib-1953', year: '1953' }, 'Sporting Cristal'), null);
  assert.equal(getTournamentTeamCrest({ id: 'lib-1989', year: '1989' }, 'Sporting Cristal'), null);
  assert.equal(getTournamentTeamCrest({ id: 'lib-1991', year: '1991' }, 'Sporting Cristal'), null);
});

test('Deportivo Pereira 1949-1951, 1952-1955, 1956-1989, 1990, 1991-1993, 1994-1997, 2001-2005, and 2006-2013 historical crests apply strictly to their respective ranges and exclude 1948, 1998-2000, 2014+, and Águilas Pereira', () => {
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
  const t1991 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1991-cuadrangular');
  const t1992 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1992-cuadrangular');
  const t1993 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1993-cuadrangular');
  const t1994 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1994-cuadrangular');
  const t1995 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-nivelacion');
  const t199596 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-96-cuadrangular');
  const t199697 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1996-97-cuadrangular');
  const t1997 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1997-adecuacion');
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  const t2022 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2022-II-cuadrangular');
  assert.ok(
    t1948 &&
      t1990 &&
      t1991 &&
      t1992 &&
      t1993 &&
      t1994 &&
      t1995 &&
      t199596 &&
      t199697 &&
      t1997 &&
      t1998 &&
      t2022
  );

  const crest1990 = getTournamentTeamCrest(t1990, 'Deportivo Pereira');
  assert.equal(
    crest1990?.src,
    '/assets/aistudio/PEREIRA_DEL_90_c5870e7b.png',
    'Expected Deportivo Pereira 1990 crest for 1990-reclasificacion'
  );
  assert.equal(crest1990?.alt, 'Escudo Histórico Deportivo Pereira 1990');
  assert.equal(
    getTournamentTeamCrest(t1990, 'Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_90_c5870e7b.png'
  );

  for (const tbl of [t1991, t1992, t1993]) {
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pereira');
    assert.equal(
      crest?.src,
      '/assets/aistudio/PEREIRA_DEL_91-93_c728df5f.png',
      `Expected Deportivo Pereira 1991-1993 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportivo Pereira 1991-1993');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_91-93_c728df5f.png'
    );
  }

  for (const tbl of [t1994, t1995, t199596, t199697, t1997]) {
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pereira');
    assert.equal(
      crest?.src,
      '/assets/aistudio/PEREIRA_DEL_94-97_f66c1f46.png',
      `Expected Deportivo Pereira 1994-1997 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportivo Pereira 1994-1997');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_94-97_f66c1f46.png'
    );
  }

  for (const id of [
    '2001-reclasificacion',
    '2002-I-regular',
    '2002-II-regular',
    '2003-I-cuadrangular',
    '2003-II-cuadrangular',
    '2004-I-cuadrangular',
    '2004-II-cuadrangular',
    '2005-I-regular',
    '2005-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pereira');
    assert.equal(
      crest?.src,
      '/assets/aistudio/PEREIRA_DEL_2001-2005_2a6a9e8e.png',
      `Expected Deportivo Pereira 2001-2005 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportivo Pereira 2001-2005');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_2001-2005_2a6a9e8e.png'
    );
  }

  for (const id of [
    '2006-I-regular',
    '2006-II-regular',
    '2007-I-regular',
    '2007-II-regular',
    '2008-I-regular',
    '2008-II-cuadrangular',
    '2009-I-cuadrangular',
    '2009-II-cuadrangular',
    '2010-I-semifinal',
    '2010-II-cuadrangular',
    '2011-I-regular',
    '2011-II-playoffs',
    '2012-I-regular',
    '2012-II-cuadrangular',
    '2013-I-regular',
    '2013-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pereira');
    assert.equal(
      crest?.src,
      '/assets/aistudio/PEREIRA_DEL_2006-2013_10428c9e.png',
      `Expected Deportivo Pereira 2006-2013 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportivo Pereira 2006-2013');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_2006-2013_10428c9e.png'
    );
  }

  for (const id of ['2006-I-regular', '2006-II-regular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const missing = (tbl.regularRows || []).filter(
      (r) => !getTournamentTeamCrest(tbl, r.team, r.isJunior)
    );
    assert.deepEqual(missing, [], `Expected 100% crests in ${id}`);
  }

  assert.equal(
    getTournamentTeamCrest({ year: '2006' }, 'Deportivo Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_2006-2013_10428c9e.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2013' }, 'Deportivo Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_2006-2013_10428c9e.png'
  );

  const pereira2018To2022 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2018 && yr <= 2022;
  });
  assert.equal(pereira2018To2022.length, 9, 'Expected 9 tournaments from 2018-I through 2022-II');
  for (const tbl of pereira2018To2022) {
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pereira');
    assert.equal(
      crest?.src,
      '/assets/aistudio/PEREIRA_DEL_2018-2022_ffe8075e.png',
      `Expected Deportivo Pereira 2018-2022 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportivo Pereira 2018-2022');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_2018-2022_ffe8075e.png'
    );
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2018' }, 'Deportivo Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_2018-2022_ffe8075e.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2022' }, 'Deportivo Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_2018-2022_ffe8075e.png'
  );

  const pereira2023Plus = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2023;
  });
  assert.equal(pereira2023Plus.length, 8, 'Expected 8 tournaments from 2023-I through 2026-II');
  for (const tbl of pereira2023Plus) {
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pereira');
    assert.equal(
      crest?.src,
      '/assets/aistudio/PEREIRA_DEL_2023_en_adelante_82d25c28.png',
      `Expected Deportivo Pereira 2023+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Deportivo Pereira 2023-Actualidad');
    assert.equal(
      getTournamentTeamCrest(tbl, 'Pereira')?.src,
      '/assets/aistudio/PEREIRA_DEL_2023_en_adelante_82d25c28.png'
    );
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2023' }, 'Deportivo Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_2023_en_adelante_82d25c28.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-II' }, 'Deportivo Pereira')?.src,
    '/assets/aistudio/PEREIRA_DEL_2023_en_adelante_82d25c28.png'
  );

  // 2020 through 2023-II are now 100% complete with historical crests
  for (const id of [
    '2020-playoffs',
    '2021-I-playoffs',
    '2021-II-cuadrangular',
    '2022-I-cuadrangular',
    '2022-II-cuadrangular',
    '2023-I-regular',
    '2023-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const rows = [
      ...(tbl.regularRows || []),
      ...(tbl.rows || []),
      ...(tbl.finalGroups || []).flatMap((g) => g.rows),
    ];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }

  const t2014I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-I-playoffs');
  const t2014II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-II-regular');
  assert.ok(t2014I && t2014II);

  assert.equal(getTournamentTeamCrest(t1948, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest(t1998, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest({ year: '1998' }, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest({ year: '2000' }, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest(t2014I, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest(t2014II, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest({ year: '2017' }, 'Deportivo Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1953', year: '1953' }, 'Águilas Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1970', year: '1970' }, 'Águilas Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1990', year: '1990' }, 'Águilas Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1992', year: '1992' }, 'Águilas Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-1995', year: '1995' }, 'Águilas Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-2003', year: '2003' }, 'Águilas Pereira'), null);
  assert.equal(getTournamentTeamCrest({ id: 'custom-2008', year: '2008' }, 'Águilas Pereira'), null);
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

test('Deportes Quindío 1951-1966, 1967-1986, 1987-1990, 1991-1996, and 1997-2017 historical crests apply strictly to their respective ranges and exclude 1950/2018+', () => {
  for (const id of [
    '1951-dorado',
    '1952-dorado',
    '1953-dorado',
    '1966-reingreso',
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

  for (const id of [
    '1967-campeonato',
    '1968-campeonato',
    '1974-hexagonal',
    '1981-cuadrangular',
    '1985-octogonal',
    '1986-octogonal',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    if (!tbl) continue;
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportes Quindío')?.src,
      '/assets/aistudio/quindio_del_67_al_86_9cf838c0.png',
      `Expected Deportes Quindío 1967-1986 crest for ${id}`
    );
  }

  for (const id of [
    '1987-octogonal',
    '1988-octogonal',
    '1989-desierto',
    '1990-reclasificacion',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportes Quindío')?.src,
      '/assets/aistudio/quindio_del_87_al_90_68f06640.png',
      `Expected Deportes Quindío 1987-1990 crest for ${id}`
    );
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportes Quindío')?.alt,
      'Escudo Histórico Deportes Quindío 1987-1990'
    );
  }

  for (const id of [
    '1991-cuadrangular',
    '1992-cuadrangular',
    '1993-cuadrangular',
    '1994-cuadrangular',
    '1995-nivelacion',
    '1995-96-cuadrangular',
    '1996-97-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportes Quindío');
    assert.equal(
      crest?.src,
      '/assets/aistudio/quindio_del_91_al_96_16f4c349.png',
      `Expected Deportes Quindío 1991-1996 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportes Quindío 1991-1996');
  }

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1986', year: '1986' }, 'Deportes Quindío')?.src,
    '/assets/aistudio/quindio_del_67_al_86_9cf838c0.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1990', year: '1990' }, 'Deportes Quindío')?.src,
    '/assets/aistudio/quindio_del_87_al_90_68f06640.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1996', year: '1996' }, 'Deportes Quindío')?.src,
    '/assets/aistudio/quindio_del_91_al_96_16f4c349.png'
  );
  for (const id of [
    '1997-adecuacion',
    '1998-reclasificacion',
    '1999-cuadrangular',
    '2000-cuadrangular',
    '2002-I-regular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportes Quindío');
    assert.equal(
      crest?.src,
      '/assets/aistudio/quindio_del_97_al_2017_a0600b91.png',
      `Expected Deportes Quindío 1997-2017 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportes Quindío 1997-2017');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2013-II' }, 'Quindío')?.src,
    '/assets/aistudio/quindio_del_97_al_2017_a0600b91.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2016-II' }, 'Deportes Quindío')?.src,
    '/assets/aistudio/quindio_del_97_al_2017_a0600b91.png'
  );

  const t2017I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2017-I');
  const t2018I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2018-I');
  const t2021II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2021-II');
  assert.ok(t2017I && t2018I && t2021II);
  for (const tbl of [t2017I, t2018I, t2021II]) {
    const crest = getTournamentTeamCrest(tbl, 'Deportes Quindío');
    assert.equal(
      crest?.src,
      '/assets/aistudio/deportes_quindao_s.a.-Aq200r85QbhRaev3_8847a0a1.webp',
      `Expected Deportes Quindío 2017+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Deportes Quindío 2017-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2017' }, 'Quindío')?.src,
    '/assets/aistudio/deportes_quindao_s.a.-Aq200r85QbhRaev3_8847a0a1.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Deportes Quindío')?.src,
    '/assets/aistudio/deportes_quindao_s.a.-Aq200r85QbhRaev3_8847a0a1.webp'
  );

  assert.equal(getTournamentTeamCrest({ id: '1950-dorado', year: '1950' }, 'Deportes Quindío'), null);
});

test('Deportes Tolima 1966-1997 and 1998-2003 historical crests apply strictly to their ranges and exclude 1965/2004+', () => {
  for (const id of [
    '1966-reingreso',
    '1967-campeonato',
    '1974-hexagonal',
    '1981-cuadrangular',
    '1995-96-cuadrangular',
    '1996-97-cuadrangular',
    '1997-adecuacion',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    if (!tbl) continue;
    assert.equal(
      getTournamentTeamCrest(tbl, 'Deportes Tolima')?.src,
      '/assets/aistudio/tolima_del_66_al_97_98e00cd9.png',
      `Expected Deportes Tolima 1966-1997 crest for ${id}`
    );
  }

  for (const id of [
    '1998-reclasificacion',
    '1999-cuadrangular',
    '2000-cuadrangular',
    '2001-reclasificacion',
    '2002-I-regular',
    '2002-II-regular',
    '2003-I-cuadrangular',
    '2003-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportes Tolima');
    assert.equal(
      crest?.src,
      '/assets/aistudio/tolima_del_98_al_2003_60f7af16.png',
      `Expected Deportes Tolima 1998-2003 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportes Tolima 1998-2003');
  }

  const t1966 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1966-reingreso');
  const t1997 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1997-adecuacion');
  const t2004I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2004-I-cuadrangular');
  const t2004II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2004-II-cuadrangular');
  const t2018I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2018-I-playoffs');
  const t2018II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2018-II-playoffs');
  const t2019I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2019-I-cuadrangular');
  const t2019II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2019-II-cuadrangular');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t1966 && t1997 && t2004I && t2004II && t2018I && t2018II && t2019I && t2019II && t2023);

  assert.equal(
    getTournamentTeamCrest(t1966, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_66_al_97_98e00cd9.png'
  );
  assert.equal(
    getTournamentTeamCrest(t1997, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_66_al_97_98e00cd9.png'
  );
  for (const tbl of [t2004I, t2004II, t2018I, t2018II]) {
    const crest = getTournamentTeamCrest(tbl, 'Deportes Tolima');
    assert.equal(
      crest?.src,
      '/assets/aistudio/tolima_del_2004_al_2018_75092ea1.png',
      `Expected Deportes Tolima 2004-2018 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportes Tolima 2004-2018');
  }
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2004', year: '2004' }, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_2004_al_2018_75092ea1.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2018', year: '2018' }, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_2004_al_2018_75092ea1.png'
  );
  // 2004-I and 2004-II are now 100% complete with historical crests
  for (const tbl of [t2004I, t2004II]) {
    const rows = tbl.regularRows || tbl.rows || [];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
  assert.equal(getTournamentTeamCrest({ id: 'custom-1965', year: '1965' }, 'Deportes Tolima'), null);
  const tolima2019To2021 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2019 && yr <= 2021;
  });
  assert.equal(tolima2019To2021.length, 5, 'Expected 5 tournaments from 2019-I to 2021-II');
  for (const tbl of tolima2019To2021) {
    const crest = getTournamentTeamCrest(tbl, 'Deportes Tolima');
    assert.equal(
      crest?.src,
      '/assets/aistudio/tolima_del_2019_al_2021_8e1bbb2b.png',
      `Expected Deportes Tolima 2019-2021 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportes Tolima 2019-2021');
  }
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2019', year: '2019' }, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_2019_al_2021_8e1bbb2b.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2021', year: '2021' }, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_2019_al_2021_8e1bbb2b.png'
  );
  // 2019-I and 2019-II are now 100% complete with historical crests
  for (const tbl of [t2019I, t2019II]) {
    const rows = [
      ...(tbl.regularRows || []),
      ...(tbl.rows || []),
      ...(tbl.finalGroups || []).flatMap((g) => g.rows),
    ];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
  const tolima2022Plus = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2022;
  });
  assert.equal(tolima2022Plus.length, 10, 'Expected 10 tournaments from 2022-I through 2026-II');
  for (const tbl of tolima2022Plus) {
    const crest = getTournamentTeamCrest(tbl, 'Deportes Tolima');
    assert.equal(
      crest?.src,
      '/assets/aistudio/tolima_del_2022en_adelante_7da7eadc.png',
      `Expected Deportes Tolima 2022+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Deportes Tolima 2022-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2022', year: '2022' }, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_2022en_adelante_7da7eadc.png'
  );
  assert.equal(
    getTournamentTeamCrest(t2023, 'Deportes Tolima')?.src,
    '/assets/aistudio/tolima_del_2022en_adelante_7da7eadc.png'
  );
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

test('Real Cartagena 1971-2013 historical crest applies strictly to 1971-2013 tables and excludes 1970/2014+', () => {
  for (const id of [
    '1971-cuadrangular',
    '1992-cuadrangular',
    '2000-cuadrangular',
    '2005-II-cuadrangular',
    '2009-II-cuadrangular',
    '2012-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Expected tournament ${id}`);
    assert.equal(
      getTournamentTeamCrest(tbl, 'Real Cartagena')?.src,
      '/assets/aistudio/Escudo_Real_Cartagena__antiguo__4f756fbf.png',
      `Expected Real Cartagena historical crest for ${id}`
    );
  }

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2013', year: '2013' }, 'R. Cartagena')?.src,
    '/assets/aistudio/Escudo_Real_Cartagena__antiguo__4f756fbf.png'
  );
  assert.equal(getTournamentTeamCrest({ id: '1970-cuadrangular', year: '1970' }, 'Real Cartagena'), null);
  assert.equal(getTournamentTeamCrest({ id: '2014-I-playoffs', year: '2014-I' }, 'Real Cartagena'), null);
});

test('Oro Negro crest applies to Oro Negro in 1971 tables and matches without colliding with Independiente Medellín', () => {
  const t1971 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1971-cuadrangular');
  assert.ok(t1971, 'Expected 1971-cuadrangular tournament');
  assert.equal(
    getTournamentTeamCrest(t1971, 'Oro Negro')?.src,
    '/assets/aistudio/cd_oro_negro_barrancabermeja_2017-presente-AwvJV6bkxQh9lNXq_b9c7d4e1.webp'
  );
  assert.equal(
    getTournamentTeamCrest(t1971, 'Oro Negro de Barrancabermeja')?.src,
    '/assets/aistudio/cd_oro_negro_barrancabermeja_2017-presente-AwvJV6bkxQh9lNXq_b9c7d4e1.webp'
  );

  // Independiente Medellín in 1970 and 1972 still receives its own 1966-1997 DIM crest
  const t1970 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1970-cuadrangular');
  assert.ok(t1970);
  assert.equal(
    getTournamentTeamCrest(t1970, 'Independiente Medellín')?.src,
    '/assets/aistudio/MEDELLIN_1966-1997_7d6775c6.png'
  );
});

test('Envigado F.C. official crest applies across historical and modern tables and matches', () => {
  for (const id of [
    '1992-cuadrangular',
    '1993-cuadrangular',
    '1999-reclasificacion',
    '2002-I-cuadrangular',
    '2025-I-regular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    if (!tbl) continue;
    const crest = getTournamentTeamCrest(tbl, 'Envigado F.C');
    assert.equal(
      crest?.src,
      '/assets/aistudio/escudo_envigado_9ca4099e.png',
      `Expected Envigado F.C. crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Envigado F.C.');
  }

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2026', year: '2026-I' }, 'Envigado F.C.')?.src,
    '/assets/aistudio/escudo_envigado_9ca4099e.png'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1992', year: '1992' }, 'Envigado')?.src,
    '/assets/aistudio/escudo_envigado_9ca4099e.png'
  );
});

test('Atlético Huila official crest applies across historical and modern tables and matches', () => {
  for (const id of [
    '1993-cuadrangular',
    '1994-cuadrangular',
    '1995-nivelacion',
    '1995-96-cuadrangular',
    '1999-cuadrangular',
    '2002-I-regular',
    '2023-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Atlético Huila');
    assert.equal(
      crest?.src,
      '/assets/aistudio/Escudo_de_Atl_tico_Huila.svg_6eeb5b7d.webp',
      `Expected Atlético Huila crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Atlético Huila');
  }

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1993', year: '1993' }, 'Atletico Huila')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Huila.svg_6eeb5b7d.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2009', year: '2009-II' }, 'Huila')?.src,
    '/assets/aistudio/Escudo_de_Atl_tico_Huila.svg_6eeb5b7d.webp'
  );
});

test('Cortuluá 1967-1999 and 2000-2021 historical crests apply strictly to their ranges and exclude 1966/2022+', () => {
  for (const id of [
    '1994-cuadrangular',
    '1995-nivelacion',
    '1995-96-cuadrangular',
    '1996-97-cuadrangular',
    '1997-adecuacion',
    '1998-reclasificacion',
    '1999-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Cortuluá');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cortulua-_1967-1999-m7VqpkMKwLIXBo5b_e6ef3247.webp',
      `Expected Cortuluá 1967-1999 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Cortuluá 1967-1999');
  }

  for (const id of [
    '2000-cuadrangular',
    '2001-reclasificacion',
    '2002-I-regular',
    '2004-II-cuadrangular',
    '2010-I-semifinal',
    '2016-I-playoffs',
    '2017-II-playoffs',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Cortuluá');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cortulua-2000-m7VqpkMKwLIXBo5b_09dbf112.webp',
      `Expected Cortuluá 2000-2021 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Cortuluá 2000-2021');
  }

  assert.equal(
    getTournamentTeamCrest({ id: 'custom-1999', year: '1999' }, 'Cortulua')?.src,
    '/assets/aistudio/cortulua-_1967-1999-m7VqpkMKwLIXBo5b_e6ef3247.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ id: 'custom-2021', year: '2021-II' }, 'Cortulua')?.src,
    '/assets/aistudio/cortulua-2000-m7VqpkMKwLIXBo5b_09dbf112.webp'
  );
  assert.equal(getTournamentTeamCrest({ year: '1966' }, 'Cortuluá'), null);
  const t2022I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2022-I-cuadrangular');
  const t2022II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2022-II-cuadrangular');
  assert.ok(t2022I && t2022II);
  for (const tbl of [t2022I, t2022II]) {
    const crest = getTournamentTeamCrest(tbl, 'Cortuluá');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cortulua-2022-m7VqpkMKwLIXBo5b_4a5cea20.webp',
      `Expected Cortuluá 2022+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Cortuluá 2022-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2022' }, 'Cortuluá')?.src,
    '/assets/aistudio/cortulua-2022-m7VqpkMKwLIXBo5b_4a5cea20.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Cortulua')?.src,
    '/assets/aistudio/cortulua-2022-m7VqpkMKwLIXBo5b_4a5cea20.webp'
  );
});

test('Deportivo Unicosta 1995-1999 historical crest applies strictly through 1999 and excludes 2000+', () => {
  for (const id of ['1997-adecuacion', '1998-reclasificacion', '1999-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Unicosta');
    assert.equal(
      crest?.src,
      '/assets/aistudio/cd_unicosta_barranquilla_1995_1999-L9OGcEHewWNAN9yR_c7fc6da3.webp',
      `Expected Deportivo Unicosta 1995-1999 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportivo Unicosta 1995-1999');
  }

  assert.equal(
    getTournamentTeamCrest({ year: '1995' }, 'Unicosta')?.src,
    '/assets/aistudio/cd_unicosta_barranquilla_1995_1999-L9OGcEHewWNAN9yR_c7fc6da3.webp'
  );
  assert.equal(getTournamentTeamCrest({ year: '1994' }, 'Deportivo Unicosta'), null);
  const t2000 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2000');
  assert.ok(t2000);
  assert.equal(getTournamentTeamCrest(t2000, 'Deportivo Unicosta'), null);
  assert.equal(getTournamentTeamCrest({ year: '2000' }, 'Deportivo Unicosta'), null);
});

test('Deportivo Pasto 1999, 2000-2006, and 2007-present crests apply strictly to their ranges, exclude 1998, and complete 100% of 2007 crests', () => {
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  const t1999 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1999-cuadrangular');
  const t2007I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2007-I-regular');
  const t2007II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2007-II-regular');
  const t2023 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t1998 && t1999 && t2007I && t2007II && t2023);

  const crest1999 = getTournamentTeamCrest(t1999, 'Deportivo Pasto');
  assert.equal(
    crest1999?.src,
    '/assets/aistudio/deportivo_pasto_1999-2006-Aq2eW8GGN2FWMLkr_a9eeaa6f.webp'
  );
  assert.equal(crest1999?.alt, 'Escudo Histórico Deportivo Pasto 1999');

  assert.equal(
    getTournamentTeamCrest({ year: '1999' }, 'Pasto')?.src,
    '/assets/aistudio/deportivo_pasto_1999-2006-Aq2eW8GGN2FWMLkr_a9eeaa6f.webp'
  );

  for (const id of [
    '2000-cuadrangular',
    '2001-reclasificacion',
    '2002-II-regular',
    '2005-I-regular',
    '2006-I-regular',
    '2006-II-regular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pasto');
    assert.equal(
      crest?.src,
      '/assets/aistudio/deportivo_pasto_2000-2006-Aq2eW8GGN2FWMLkr_9ef8c98d.webp',
      `Expected Deportivo Pasto 2000-2006 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Deportivo Pasto 2000-2006');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2006-I' }, 'Pasto')?.src,
    '/assets/aistudio/deportivo_pasto_2000-2006-Aq2eW8GGN2FWMLkr_9ef8c98d.webp'
  );

  for (const id of [
    '2007-I-regular',
    '2007-II-regular',
    '2012-II-cuadrangular',
    '2023-II-cuadrangular',
    '2026-I-playoffs',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Deportivo Pasto');
    assert.equal(
      crest?.src,
      '/assets/aistudio/deportivo_pasto_2007_en_adelante_664c78b7.webp',
      `Expected Deportivo Pasto 2007-Actualidad crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Deportivo Pasto 2007-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2007' }, 'Deportivo Pasto')?.src,
    '/assets/aistudio/deportivo_pasto_2007_en_adelante_664c78b7.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026' }, 'Pasto')?.src,
    '/assets/aistudio/deportivo_pasto_2007_en_adelante_664c78b7.webp'
  );

  for (const tbl of [t2007I, t2007II]) {
    const missing = (tbl.regularRows || []).filter(
      (r) => !getTournamentTeamCrest(tbl, r.team, r.isJunior)
    );
    assert.deepEqual(missing, [], `Expected 100% crests in ${tbl.id}`);
  }

  assert.equal(getTournamentTeamCrest(t1998, 'Deportivo Pasto'), null);
});

test('Centauros Villavicencio crest applies across 2003-I, 2003-II, Reclasificación 2003, and completes 100% of 2003 crests', () => {
  const t2003I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2003-I-cuadrangular');
  const t2003II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2003-II-cuadrangular');
  assert.ok(t2003I && t2003II);

  for (const tbl of [t2003I, t2003II]) {
    const crest = getTournamentTeamCrest(tbl, 'Centauros Villavicencio');
    assert.equal(crest?.src, '/assets/aistudio/escudo_centauros_7278fc5e.png');
    assert.equal(crest?.alt, 'Escudo Oficial Centauros Villavicencio');

    const rows = tbl.regularRows || tbl.rows || [];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }

  assert.equal(
    getTournamentTeamCrest({ year: '2003' }, 'Centauros')?.src,
    '/assets/aistudio/escudo_centauros_7278fc5e.png'
  );
});

test('Boyacá Chicó / Chicó F.C. 2002-2007 and 2008-present crests apply strictly to their ranges and complete 100% of 2008 crests', () => {
  for (const [id, teamName] of [
    ['2004-I-cuadrangular', 'Chicó F.C'],
    ['2004-II-cuadrangular', 'Chicó F.C'],
    ['2005-I-regular', 'Boyacá Chicó'],
    ['2005-II-cuadrangular', 'Boyacá Chicó'],
    ['2006-I-regular', 'Boyacá Chicó'],
    ['2006-II-regular', 'Boyacá Chicó'],
    ['2007-I-regular', 'Boyacá Chicó'],
    ['2007-II-regular', 'Boyacá Chicó'],
  ] as const) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, teamName);
    assert.equal(
      crest?.src,
      '/assets/aistudio/boyaca_chico_fc_2002-2004-mv0xzGVJnPSDk7QB_26acf480.webp',
      `Expected Boyacá Chicó 2002-2007 crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Boyacá Chicó 2002-2007');
  }

  assert.equal(
    getTournamentTeamCrest({ year: '2004' }, 'Chicó F.C')?.src,
    '/assets/aistudio/boyaca_chico_fc_2002-2004-mv0xzGVJnPSDk7QB_26acf480.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2007' }, 'Boyacá Chicó')?.src,
    '/assets/aistudio/boyaca_chico_fc_2002-2004-mv0xzGVJnPSDk7QB_26acf480.webp'
  );

  for (const id of [
    '2008-I-regular',
    '2008-II-cuadrangular',
    '2014-II-regular',
    '2023-II-cuadrangular',
    '2026-I-playoffs',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'Boyacá Chicó');
    assert.equal(
      crest?.src,
      '/assets/aistudio/boyaca_chico_fc_2008_en_adelante_0f60033d.webp',
      `Expected Boyacá Chicó 2008-Actualidad crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Boyacá Chicó 2008-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2008' }, 'Boyacá Chicó')?.src,
    '/assets/aistudio/boyaca_chico_fc_2008_en_adelante_0f60033d.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026' }, 'Boyacá Chicó')?.src,
    '/assets/aistudio/boyaca_chico_fc_2008_en_adelante_0f60033d.webp'
  );

  for (const id of ['2008-I-regular', '2008-II-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const missing = (tbl.regularRows || []).filter(
      (r) => !getTournamentTeamCrest(tbl, r.team, r.isJunior)
    );
    assert.deepEqual(missing, [], `Expected 100% crests in ${id}`);
  }
});

test('La Equidad official crest applies across all La Equidad tables and matches (2007-2025) and excludes Internacional de Bogotá', () => {
  for (const id of [
    '2007-I-regular',
    '2007-II-regular',
    '2010-I-semifinal',
    '2020-playoffs',
    '2025-II-cuadrangular',
  ]) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const crest = getTournamentTeamCrest(tbl, 'La Equidad');
    assert.equal(
      crest?.src,
      '/assets/aistudio/La_Equidad_Seguros_logo.svg_cbed76e9.webp',
      `Expected La Equidad crest for ${id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial La Equidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2010' }, 'La Equidad')?.src,
    '/assets/aistudio/La_Equidad_Seguros_logo.svg_cbed76e9.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Internacional de Bogotá'),
    null
  );
});

test('Águilas Doradas / Itagüí Ditaires 2011, 2012-2013, and 2014-2015 crests apply strictly, exclude Itagüí Leones and 2016+, and complete 100% of 2011 crests', () => {
  const t2011I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-I-regular');
  const t2011II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-II-playoffs');
  const t2012I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2012-I-regular');
  const t2012II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2012-II-cuadrangular');
  const t2013I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2013-I-regular');
  const t2013II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2013-II-cuadrangular');
  const t2014I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-I-playoffs');
  const t2014II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-II-regular');
  const t2015I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-I-playoffs');
  const t2015II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-II-playoffs');
  const t2016I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-I-playoffs');
  assert.ok(t2011I && t2011II && t2012I && t2012II && t2013I && t2013II && t2014I && t2014II && t2015I && t2015II && t2016I);

  for (const tbl of [t2011I, t2011II]) {
    for (const alias of ['Águilas Doradas', 'Itagüí Ditaires', 'Itagüí F.C']) {
      const crest = getTournamentTeamCrest(tbl, alias);
      assert.equal(
        crest?.src,
        '/assets/aistudio/aguilas_dordas_2011_2133b75d.webp',
        `Expected Itagüí Ditaires 2011 crest for ${alias} in ${tbl.id}`
      );
      assert.equal(crest?.alt, 'Escudo Histórico Itagüí Ditaires (Águilas Doradas) 2011');
    }
    // 2011-I and 2011-II are 100% complete with historical crests
    const rows = tbl.regularRows || tbl.rows || [];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
  for (const tbl of [t2012I, t2012II, t2013I, t2013II]) {
    for (const alias of ['Águilas Doradas', 'Itagüí Ditaires', 'Itagüí F.C']) {
      const crest = getTournamentTeamCrest(tbl, alias);
      assert.equal(
        crest?.src,
        '/assets/aistudio/aguilas_dordas_2012-2013_35eb5333.webp',
        `Expected Águilas Doradas 2012-2013 crest for ${alias} in ${tbl.id}`
      );
      assert.equal(crest?.alt, 'Escudo Histórico Águilas Doradas 2012-2013');
    }
  }
  for (const tbl of [t2014I, t2014II, t2015I, t2015II]) {
    for (const alias of ['Itagüí F.C', 'Águilas Pereira', 'Águilas Doradas']) {
      const crest = getTournamentTeamCrest(tbl, alias);
      assert.equal(
        crest?.src,
        '/assets/aistudio/aguilas_dordas_2014-2015_1cc4f92e.webp',
        `Expected Águilas 2014-2015 crest for ${alias} in ${tbl.id}`
      );
      assert.equal(crest?.alt, 'Escudo Histórico Águilas Pereira / Águilas Doradas 2014-2015');
    }
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2011' }, 'Águilas Doradas')?.src,
    '/assets/aistudio/aguilas_dordas_2011_2133b75d.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2012' }, 'Itagüí Ditaires')?.src,
    '/assets/aistudio/aguilas_dordas_2012-2013_35eb5333.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2013' }, 'Itagüí F.C')?.src,
    '/assets/aistudio/aguilas_dordas_2012-2013_35eb5333.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2014' }, 'Águilas Pereira')?.src,
    '/assets/aistudio/aguilas_dordas_2014-2015_1cc4f92e.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2015' }, 'Águilas Doradas')?.src,
    '/assets/aistudio/aguilas_dordas_2014-2015_1cc4f92e.webp'
  );
  // Itagüí Leones resolves to its own official crest (never Águilas Doradas) and completes 100% of 2018-I & 2018-II
  for (const yr of ['2011', '2014', '2018']) {
    const leonesCrest = getTournamentTeamCrest({ year: yr }, 'Itagüí Leones');
    assert.equal(leonesCrest?.src, '/assets/aistudio/itagui_leones_a791aa99.png');
    assert.equal(leonesCrest?.alt, 'Escudo Oficial Itagüí Leones');
  }
  for (const id of ['2018-I-playoffs', '2018-II-playoffs']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const rows = [
      ...(tbl.regularRows || []),
      ...(tbl.rows || []),
      ...(tbl.finalGroups || []).flatMap((g) => g.rows),
    ];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
  assert.equal(getTournamentTeamCrest({ year: '2010' }, 'Águilas Doradas'), null);

  const t2016II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-II-regular');
  const t2023II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular');
  assert.ok(t2016II && t2023II);
  for (const tbl of [t2016I, t2016II, t2023II]) {
    for (const alias of ['Águilas Doradas', 'Rionegro Águilas']) {
      const crest = getTournamentTeamCrest(tbl, alias);
      assert.equal(
        crest?.src,
        '/assets/aistudio/aguilas_dordas_2016-en_adelante_a149315f.webp',
        `Expected Águilas Doradas 2016+ crest for ${alias} in ${tbl.id}`
      );
      assert.equal(crest?.alt, 'Escudo Oficial Águilas Doradas 2016-Actualidad');
    }
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2016' }, 'Águilas Doradas')?.src,
    '/assets/aistudio/aguilas_dordas_2016-en_adelante_a149315f.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Águilas Doradas')?.src,
    '/assets/aistudio/aguilas_dordas_2016-en_adelante_a149315f.webp'
  );
});

test('Patriotas Boyacá 2010-2014 historical crest applies strictly to 2010-2014, excludes Boyacá Chicó and 2015+, and completes 100% of 2012 crests', () => {
  const tables2012To2014 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) =>
    /^201[2-4]\b/.test(t.year)
  );
  assert.equal(tables2012To2014.length, 6, 'Expected 6 tournaments from 2012-I to 2014-II');
  for (const tbl of tables2012To2014) {
    const crest = getTournamentTeamCrest(tbl, 'Patriotas Boyacá');
    assert.equal(
      crest?.src,
      '/assets/aistudio/patriotas_boyaca-_fc_2010-2014-d95EEkep0qSOnwvl_054d5f08.webp',
      `Expected Patriotas Boyacá 2010-2014 crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Patriotas Boyacá 2010-2014');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2010' }, 'Patriotas Boyacá')?.src,
    '/assets/aistudio/patriotas_boyaca-_fc_2010-2014-d95EEkep0qSOnwvl_054d5f08.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2014' }, 'Patriotas')?.src,
    '/assets/aistudio/patriotas_boyaca-_fc_2010-2014-d95EEkep0qSOnwvl_054d5f08.webp'
  );
  assert.equal(getTournamentTeamCrest({ year: '2009' }, 'Patriotas Boyacá'), null);
  const t2015I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-I-playoffs');
  const t2015II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-II-playoffs');
  const t2024I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2024-I-cuadrangular');
  assert.ok(t2015I && t2015II && t2024I);
  for (const tbl of [t2015I, t2015II, t2024I]) {
    const crest = getTournamentTeamCrest(tbl, 'Patriotas Boyacá');
    assert.equal(
      crest?.src,
      '/assets/aistudio/patriotas_boyaca-_fc_2015-presente-dOqXXBQWrqCD2ran_f6b4bade.webp',
      `Expected Patriotas Boyacá 2015+ crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Oficial Patriotas Boyacá 2015-Actualidad');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2015' }, 'Patriotas Boyacá')?.src,
    '/assets/aistudio/patriotas_boyaca-_fc_2015-presente-dOqXXBQWrqCD2ran_f6b4bade.webp'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '2012' }, 'Boyacá Chicó')?.src,
    '/assets/aistudio/patriotas_boyaca-_fc_2010-2014-d95EEkep0qSOnwvl_054d5f08.webp'
  );
  assert.notEqual(
    getTournamentTeamCrest({ year: '2015' }, 'Boyacá Chicó')?.src,
    '/assets/aistudio/patriotas_boyaca-_fc_2015-presente-dOqXXBQWrqCD2ran_f6b4bade.webp'
  );

  // Jaguares de Córdoba official crest across 2015+ and 100% completion of 2015-I & 2015-II
  for (const tbl of [t2015I, t2015II, t2024I]) {
    const jCrest = getTournamentTeamCrest(tbl, 'Jaguares de Córdoba');
    assert.equal(
      jCrest?.src,
      '/assets/aistudio/jaguares-de-cordoba-logo-footylogos-1200_35e582b7.webp',
      `Expected Jaguares de Córdoba crest for ${tbl.id}`
    );
    assert.equal(jCrest?.alt, 'Escudo Oficial Jaguares de Córdoba');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2026-I' }, 'Jaguares de Córdoba')?.src,
    '/assets/aistudio/jaguares-de-cordoba-logo-footylogos-1200_35e582b7.webp'
  );
  for (const tbl of [t2015I, t2015II]) {
    const rows = [
      ...(tbl.regularRows || []),
      ...(tbl.rows || []),
      ...(tbl.finalGroups || []).flatMap((g) => g.rows),
    ];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }

  // 2012-I and 2012-II are now 100% complete with historical crests
  for (const id of ['2012-I-regular', '2012-II-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const rows = tbl.regularRows || tbl.rows || [];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
});

test('Alianza Petrolera (<=2023) historical crest applies strictly through 2023, excludes Alianza F.C / Valledupar (2024+), and completes 100% of 2013 crests', () => {
  const tables2013To2023 = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => {
    const yr = Number(/^(\d{4})/.exec(t.year)?.[1] || 0);
    return yr >= 2013 && yr <= 2023;
  });
  assert.ok(tables2013To2023.length >= 20, `Expected >=20 tournaments from 2013-2023, got ${tables2013To2023.length}`);
  for (const tbl of tables2013To2023) {
    const crest = getTournamentTeamCrest(tbl, 'Alianza Petrolera');
    assert.equal(
      crest?.src,
      '/assets/aistudio/EscudoAlianzaPetrolera._hasta_2023_a876b379.png',
      `Expected Alianza Petrolera crest for ${tbl.id}`
    );
    assert.equal(crest?.alt, 'Escudo Histórico Alianza Petrolera (hasta 2023)');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2013' }, 'Alianza Petrolera')?.src,
    '/assets/aistudio/EscudoAlianzaPetrolera._hasta_2023_a876b379.png'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2023' }, 'Alianza Petrolera')?.src,
    '/assets/aistudio/EscudoAlianzaPetrolera._hasta_2023_a876b379.png'
  );
  const t2024I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2024-I-cuadrangular');
  assert.ok(t2024I);
  assert.equal(getTournamentTeamCrest(t2024I, 'Alianza Petrolera'), null);
  assert.equal(getTournamentTeamCrest(t2024I, 'Alianza F.C'), null);
  assert.equal(getTournamentTeamCrest({ year: '2024' }, 'Alianza F.C'), null);
  assert.equal(getTournamentTeamCrest({ year: '2025' }, 'Alianza Valledupar'), null);

  // 2013-I and 2013-II are now 100% complete with historical crests
  for (const id of ['2013-I-regular', '2013-II-cuadrangular']) {
    const tbl = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === id);
    assert.ok(tbl, `Missing table ${id}`);
    const rows = [
      ...(tbl.regularRows || []),
      ...(tbl.rows || []),
      ...(tbl.finalGroups || []).flatMap((g) => g.rows),
    ];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
});

test('Fortaleza F.C. (<=2014) and Uniautónoma F.C. (<=2015) historical crests apply strictly, exclude 2015+/2016+, and complete 100% of 2014 crests', () => {
  const t2014I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-I-playoffs');
  const t2014II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-II-regular');
  const t2015I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-I-playoffs');
  const t2015II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-II-playoffs');
  const t2016I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-I-playoffs');
  assert.ok(t2014I && t2014II && t2015I && t2015II && t2016I);

  for (const tbl of [t2014I, t2014II]) {
    const fCrest = getTournamentTeamCrest(tbl, 'Fortaleza F.C');
    assert.equal(
      fCrest?.src,
      '/assets/aistudio/fortaleza_fc_2010-2014-dJoGO5JaQZfV9aka_e79387fb.webp',
      `Expected Fortaleza F.C. <=2014 crest for ${tbl.id}`
    );
    assert.equal(fCrest?.alt, 'Escudo Histórico Fortaleza F.C. (hasta 2014)');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2014' }, 'Fortaleza F.C')?.src,
    '/assets/aistudio/fortaleza_fc_2010-2014-dJoGO5JaQZfV9aka_e79387fb.webp'
  );
  const t2016II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-II-regular');
  const t2024I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2024-I-cuadrangular');
  const t2025II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2025-II');
  const t2026I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.year === '2026-I');
  assert.ok(t2016II && t2024I && t2025II && t2026I);
  for (const tbl of [t2015I, t2016I, t2016II, t2024I, t2025II]) {
    const fCrest = getTournamentTeamCrest(tbl, 'Fortaleza CEIF');
    assert.equal(
      fCrest?.src,
      '/assets/aistudio/fortaleza_ceif_bogota-_2015-2025-Yyvk5ZoplbHRr8V5_e2d1629f.webp',
      `Expected Fortaleza CEIF 2015-2025 crest for ${tbl.id}`
    );
    assert.equal(fCrest?.alt, 'Escudo Histórico Fortaleza CEIF 2015-2025');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2015' }, 'Fortaleza F.C')?.src,
    '/assets/aistudio/fortaleza_ceif_bogota-_2015-2025-Yyvk5ZoplbHRr8V5_e2d1629f.webp'
  );
  assert.equal(
    getTournamentTeamCrest({ year: '2025' }, 'Fortaleza CEIF')?.src,
    '/assets/aistudio/fortaleza_ceif_bogota-_2015-2025-Yyvk5ZoplbHRr8V5_e2d1629f.webp'
  );
  assert.equal(getTournamentTeamCrest(t2026I, 'Fortaleza CEIF'), null);
  assert.equal(getTournamentTeamCrest({ year: '2026' }, 'Fortaleza CEIF'), null);

  for (const tbl of [t2014I, t2014II, t2015I, t2015II]) {
    const uCrest = getTournamentTeamCrest(tbl, 'Uniautónoma F.C');
    assert.equal(
      uCrest?.src,
      '/assets/aistudio/uniautonoma_fc_barranquilla_2010-2015-YKbaaLLg2bueg9qo_25547c6c.webp',
      `Expected Uniautónoma F.C. <=2015 crest for ${tbl.id}`
    );
    assert.equal(uCrest?.alt, 'Escudo Histórico Uniautónoma F.C. (hasta 2015)');
  }
  assert.equal(
    getTournamentTeamCrest({ year: '2015' }, 'Uniautonoma')?.src,
    '/assets/aistudio/uniautonoma_fc_barranquilla_2010-2015-YKbaaLLg2bueg9qo_25547c6c.webp'
  );
  assert.equal(getTournamentTeamCrest(t2016I, 'Uniautónoma F.C'), null);
  assert.equal(getTournamentTeamCrest({ year: '2016' }, 'Uniautónoma F.C'), null);

  // 2014-I, 2014-II, 2016-I, and 2016-II are now 100% complete with historical crests
  for (const tbl of [t2014I, t2014II, t2016I, t2016II]) {
    const rows = [
      ...(tbl.regularRows || []),
      ...(tbl.rows || []),
      ...(tbl.finalGroups || []).flatMap((g) => g.rows),
    ];
    for (const row of rows) {
      assert.ok(
        getTournamentTeamCrest(tbl, row.team, row.isJunior),
        `Expected crest for ${row.team} in ${tbl.id}`
      );
    }
  }
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

test('1968 Campeonato Colombiano matchArchive covers Apertura + Finalización (52 Junior matches) and reconciles strictly with both regular tables', () => {
  const t1968 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1968-campeonato');
  assert.ok(t1968 && t1968.matchArchive && t1968.regularRows && t1968.secondaryRegularTable);

  const matches = t1968.matchArchive;
  assert.equal(matches.length, 52, 'Expected exact 52 Junior regular-season matches for 1968');

  matches.forEach((m, idx) => {
    const expectedTorneo = idx < 26 ? 'Apertura' : 'Finalización';
    assert.equal(
      m.round,
      `Fecha ${idx + 1} · ${expectedTorneo}`,
      `Unexpected round label at 1968 index ${idx}: ${m.round}`
    );
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1968: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Fútbol Colombiano') && !m.awayTeam.includes('Fútbol Colombiano'));
    assert.ok(m.date.includes('1968'), `Missing 1968 calendar date in ${m.round}: ${m.date}`);
  });

  // Semester lap filter options
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  const aperturaSummary = computeJuniorMatchArchiveSummary(aperturaMatches);
  const juniorAperturaRow = t1968.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(aperturaSummary, {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (26 PJ)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 26);
  const finalizacionSummary = computeJuniorMatchArchiveSummary(finalizacionMatches);
  const juniorFinalizacionRow = t1968.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(finalizacionSummary, {
    pj: juniorFinalizacionRow.pj,
    pg: juniorFinalizacionRow.pg,
    pe: juniorFinalizacionRow.pe,
    pp: juniorFinalizacionRow.pp,
    gf: juniorFinalizacionRow.gf,
    gc: juniorFinalizacionRow.gc,
    dg: juniorFinalizacionRow.dg,
    pts: juniorFinalizacionRow.pts,
  });

  // 13 distinct rivals: 4 matches each (2 home, 2 away)
  const opponents = getMatchArchiveOpponents(matches);
  assert.equal(opponents.length, 13);
  for (const opp of opponents) {
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp }).length, 4);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'home' }).length, 2);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'away' }).length, 2);
  }
});

test('1968 playoffs and buildPlayoffKnockoutBrackets produce direct Final & 3rd-place ties with crests and strip noisy league dumps', () => {
  const t1968 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1968-campeonato')!;
  assert.equal(t1968.phaseType, 'playoff');
  assert.equal(t1968.playoffMatches?.length, 4);

  const rounds = buildPlayoffKnockoutBrackets(t1968.playoffMatches, t1968.championTeam);
  assert.equal(rounds.length, 2);
  assert.equal(rounds[0].key, 'final');
  assert.equal(rounds[0].ties.length, 1);
  assert.equal(rounds[0].ties[0].winnerTeam, 'Unión Magdalena');
  assert.equal(rounds[0].ties[0].teamAGoals, 2);
  assert.equal(rounds[0].ties[0].teamBGoals, 3);

  assert.equal(rounds[1].key, 'tercer-lugar');
  assert.equal(rounds[1].ties.length, 1);
  assert.equal(rounds[1].ties[0].winnerTeam, 'Millonarios F.C');
  assert.equal(rounds[1].ties[0].teamAGoals, 6);
  assert.equal(rounds[1].ties[0].teamBGoals, 5);

  // All 4 clubs in 1968 playoff ties resolve historical crests
  for (const r of rounds) {
    for (const tie of r.ties) {
      assert.ok(getTournamentTeamCrest(t1968, tie.teamA), `Missing crest for ${tie.teamA}`);
      assert.ok(getTournamentTeamCrest(t1968, tie.teamB), `Missing crest for ${tie.teamB}`);
    }
  }

  // Modern playoff tournament filters out bloated Gran Final table dump and infers penalty advancers
  const t2015II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-II-playoffs')!;
  const rounds2015 = buildPlayoffKnockoutBrackets(t2015II.playoffMatches, t2015II.championTeam);
  assert.equal(rounds2015.length, 3);
  assert.equal(rounds2015[0].ties.length, 4);
  assert.equal(rounds2015[1].ties.length, 2);
  assert.equal(rounds2015[2].ties.length, 1);
  assert.equal(rounds2015[2].ties[0].winnerTeam, 'Atlético Nacional');

  const t2026I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2026-I-playoffs')!;
  const rounds2026 = buildPlayoffKnockoutBrackets(t2026I.playoffMatches, t2026I.championTeam);
  const semiJunior = rounds2026[1].ties.find((tie) => tie.involvesJunior);
  assert.equal(semiJunior?.winnerTeam, 'Junior de Barranquilla');
});

test('1969 Campeonato Colombiano matchArchive covers Apertura + Finalización (52 Junior matches) and Triangular Final keeps only champion and table without playoff matches', () => {
  const t1969 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1969-campeonato');
  assert.ok(t1969 && t1969.matchArchive && t1969.regularRows && t1969.secondaryRegularTable && t1969.finalGroups);

  const matches = t1969.matchArchive;
  assert.equal(matches.length, 52, 'Expected exact 52 Junior regular-season matches for 1969');

  matches.forEach((m, idx) => {
    const expectedTorneo = idx < 26 ? 'Apertura' : 'Finalización';
    assert.equal(
      m.round,
      `Fecha ${idx + 1} · ${expectedTorneo}`,
      `Unexpected round label at 1969 index ${idx}: ${m.round}`
    );
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1969: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Fútbol Colombiano') && !m.awayTeam.includes('Fútbol Colombiano'));
  });

  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  const aperturaSummary = computeJuniorMatchArchiveSummary(aperturaMatches);
  const juniorAperturaRow = t1969.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(aperturaSummary, {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (26 PJ)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 26);
  const finalizacionSummary = computeJuniorMatchArchiveSummary(finalizacionMatches);
  const juniorFinalizacionRow = t1969.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(finalizacionSummary, {
    pj: juniorFinalizacionRow.pj,
    pg: juniorFinalizacionRow.pg,
    pe: juniorFinalizacionRow.pe,
    pp: juniorFinalizacionRow.pp,
    gf: juniorFinalizacionRow.gf,
    gc: juniorFinalizacionRow.gc,
    dg: juniorFinalizacionRow.dg,
    pts: juniorFinalizacionRow.pts,
  });

  // Combined 52-match Reclasificación total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 52,
    pg: 20,
    pe: 17,
    pp: 15,
    gf: 87,
    gc: 81,
    dg: 6,
    pts: 57,
  });

  // Each of the 13 league rivals appears once per lap and 4 times total (2 home, 2 away)
  const opponents = getMatchArchiveOpponents(matches);
  assert.equal(opponents.length, 13);
  for (const lapId of ['1', '2', '3', '4'] as const) {
    const lapMatches = filterMatchArchiveFixtures(matches, { lap: lapId });
    assert.equal(lapMatches.length, 13);
    assert.equal(getMatchArchiveOpponents(lapMatches).length, 13);
  }
  for (const opp of opponents) {
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp }).length, 4);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'home' }).length, 2);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'away' }).length, 2);
  }

  // Triangular Final: only champion + 3-team standings table (no Junior, no playoff matches)
  assert.equal(t1969.phaseType, 'triangular');
  assert.equal(t1969.championTeam, 'Deportivo Cali');
  assert.equal(t1969.playoffMatches?.length, 0);
  assert.equal(t1969.finalGroups.length, 1);
  assert.equal(t1969.finalGroups[0].groupName, 'Triangular final');
  assert.deepEqual(
    t1969.finalGroups[0].rows.map((r) => ({ pos: r.pos, team: r.team, pts: r.pts })),
    [
      { pos: 1, team: 'Deportivo Cali', pts: 7 },
      { pos: 2, team: 'América de Cali', pts: 3 },
      { pos: 3, team: 'Millonarios F.C', pts: 2 },
    ]
  );
  assert.ok(!t1969.finalGroups[0].rows.some((r) => r.isJunior || r.team.includes('Junior')));
});

test('1970 Campeonato Colombiano matchArchive covers Apertura + Finalización + Cuadrangular Final (58 Junior matches) and reconciles strictly with all three phases', () => {
  const t1970 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1970-cuadrangular');
  assert.ok(t1970 && t1970.matchArchive && t1970.regularRows && t1970.secondaryRegularTable && t1970.finalGroups);

  const matches = t1970.matchArchive;
  assert.equal(matches.length, 58, 'Expected exact 58 Junior matches (26 Apertura + 26 Finalización + 6 Cuadrangular Final)');

  matches.forEach((m, idx) => {
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
    } else if (idx < 52) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
    } else {
      assert.equal(m.round, `Cuad. Fecha ${idx - 51}`);
      assert.ok(m.date.includes('diciembre de 1970'), `Expected December 1970 date in ${m.round}: ${m.date}`);
      assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in matchArchive note: ${m.note}`);
    }
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1970: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Fútbol Colombiano') && !m.awayTeam.includes('Fútbol Colombiano'));
    assert.ok(m.homeTeam !== 'SAN' && m.awayTeam !== 'SAN');
    assert.ok(getTournamentTeamCrest(t1970, m.homeTeam), `Missing crest for ${m.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1970, m.awayTeam), `Missing crest for ${m.awayTeam}`);
  });

  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'cuadrangular', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  const juniorAperturaRow = t1970.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (26 PJ + corrected Pos 9 Junior & Pos 10 Bucaramanga)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 26);
  const juniorFinalizacionRow = t1970.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinalizacionRow.pj,
    pg: juniorFinalizacionRow.pg,
    pe: juniorFinalizacionRow.pe,
    pp: juniorFinalizacionRow.pp,
    gf: juniorFinalizacionRow.gf,
    gc: juniorFinalizacionRow.gc,
    dg: juniorFinalizacionRow.dg,
    pts: juniorFinalizacionRow.pts,
  });
  const bucaramangaFinRow = t1970.secondaryRegularTable.rows.find((r) => r.team === 'Atlético Bucaramanga')!;
  assert.equal(bucaramangaFinRow.pts, 23);
  assert.equal(bucaramangaFinRow.gf, 27);
  assert.equal(bucaramangaFinRow.gc, 34);

  // Cuadrangular Final reconciliation (6 PJ)
  const cuadrangularMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(cuadrangularMatches.length, 6);
  const juniorCuadRow = t1970.finalGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(cuadrangularMatches), {
    pj: juniorCuadRow.pj,
    pg: juniorCuadRow.pg,
    pe: juniorCuadRow.pe,
    pp: juniorCuadRow.pp,
    gf: juniorCuadRow.gf,
    gc: juniorCuadRow.gc,
    dg: juniorCuadRow.dg,
    pts: juniorCuadRow.pts,
  });

  // Combined 58-match campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 58,
    pg: 22,
    pe: 19,
    pp: 17,
    gf: 94,
    gc: 82,
    dg: 12,
    pts: 63,
  });

  // All 4 regular laps have 13 matches across 13 distinct rivals
  for (const lapId of ['1', '2', '3', '4'] as const) {
    const lapMatches = filterMatchArchiveFixtures(matches, { lap: lapId });
    assert.equal(lapMatches.length, 13);
    assert.equal(getMatchArchiveOpponents(lapMatches).length, 13);
  }

  // Cuadrangular playoffMatches contains strictly the 12 official Cuadrangular Final matches without noisy league dump
  assert.equal(t1970.phaseType, 'cuadrangular');
  assert.equal(t1970.championTeam, 'Deportivo Cali');
  assert.equal(t1970.playoffMatches?.length, 12);
  for (const pm of t1970.playoffMatches || []) {
    assert.ok(pm.stage.startsWith('Fecha '), `Unexpected stage in 1970 playoffMatches: ${pm.stage}`);
    assert.ok(pm.homeTeam !== 'SAN' && pm.awayTeam !== 'SAN');
    assert.ok(getTournamentTeamCrest(t1970, pm.homeTeam), `Missing playoff crest for ${pm.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1970, pm.awayTeam), `Missing playoff crest for ${pm.awayTeam}`);
  }
});

test('1971 Campeonato Colombiano matchArchive covers Apertura + Finalización (52 Junior matches) and Cuadrangular Final keeps only champion and table without Junior', () => {
  const t1971 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1971-cuadrangular');
  assert.ok(t1971 && t1971.matchArchive && t1971.regularRows && t1971.secondaryRegularTable && t1971.finalGroups);

  const matches = t1971.matchArchive;
  assert.equal(matches.length, 52, 'Expected exact 52 Junior regular-season matches for 1971');

  matches.forEach((m, idx) => {
    assert.equal(
      m.round,
      idx < 26 ? `Fecha ${idx + 1} · Apertura` : `Fecha ${idx + 1} · Finalización`,
      `Unexpected round label at 1971 index ${idx}: ${m.round}`
    );
    if (idx < 26) {
      assert.ok(m.date.includes('1971'), `Expected explicit 1971 Apertura date at index ${idx}: ${m.date}`);
    } else {
      assert.ok(
        m.date === (idx < 39 ? 'Finalización · 1.ª Vuelta · 1971' : 'Finalización · 2.ª Vuelta · 1971'),
        `Unexpected Finalización lap date at index ${idx}: ${m.date}`
      );
    }
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1971: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Fútbol Colombiano') && !m.awayTeam.includes('Fútbol Colombiano'));
    assert.ok(!m.homeTeam.includes('Fase de Grupos') && !m.awayTeam.includes('Fase de Grupos'));
    assert.ok(m.homeTeam !== 'SAN' && m.awayTeam !== 'SAN');
    assert.ok(m.homeTeam !== 'REA' && m.awayTeam !== 'REA');
    assert.ok(getTournamentTeamCrest(t1971, m.homeTeam), `Missing crest for ${m.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1971, m.awayTeam), `Missing crest for ${m.awayTeam}`);
  });

  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  const juniorAperturaRow = t1971.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (26 PJ)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 26);
  const juniorFinalizacionRow = t1971.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinalizacionRow.pj,
    pg: juniorFinalizacionRow.pg,
    pe: juniorFinalizacionRow.pe,
    pp: juniorFinalizacionRow.pp,
    gf: juniorFinalizacionRow.gf,
    gc: juniorFinalizacionRow.gc,
    dg: juniorFinalizacionRow.dg,
    pts: juniorFinalizacionRow.pts,
  });

  // Combined 52-match Reclasificación total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 52,
    pg: 9,
    pe: 19,
    pp: 24,
    gf: 50,
    gc: 78,
    dg: -28,
    pts: 37,
  });

  // Each of the 13 league rivals appears once per lap and 4 times total (2 home, 2 away)
  const opponents = getMatchArchiveOpponents(matches);
  assert.equal(opponents.length, 13);
  for (const lapId of ['1', '2', '3', '4'] as const) {
    const lapMatches = filterMatchArchiveFixtures(matches, { lap: lapId });
    assert.equal(lapMatches.length, 13);
    assert.equal(getMatchArchiveOpponents(lapMatches).length, 13);
  }
  for (const opp of opponents) {
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp }).length, 4);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'home' }).length, 2);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'away' }).length, 2);
  }

  // Cuadrangular Final: only champion + 4-team standings table (no Junior, no non-Junior playoff matches)
  assert.equal(t1971.phaseType, 'cuadrangular');
  assert.equal(t1971.championTeam, 'Independiente Santa Fe');
  assert.equal(t1971.playoffMatches?.length, 0);
  assert.equal(t1971.finalGroups.length, 1);
  assert.equal(t1971.finalGroups[0].groupName, 'Cuadrangular final');
  assert.deepEqual(
    t1971.finalGroups[0].rows.map((r) => ({ pos: r.pos, team: r.team, pts: r.pts })),
    [
      { pos: 1, team: 'Independiente Santa Fe', pts: 7 },
      { pos: 2, team: 'Atlético Nacional', pts: 7 },
      { pos: 3, team: 'Millonarios F.C', pts: 6 },
      { pos: 4, team: 'Deportivo Cali', pts: 4 },
    ]
  );
  assert.ok(!t1971.finalGroups[0].rows.some((r) => r.isJunior || r.team.includes('Junior')));
});

test('1972 Campeonato Colombiano matchArchive covers Apertura + Finalización + Triangular Final (56 Junior matches) and reconciles strictly with all three phases', () => {
  const t1972 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1972-triangular');
  assert.ok(t1972 && t1972.matchArchive && t1972.regularRows && t1972.secondaryRegularTable && t1972.finalGroups);

  const matches = t1972.matchArchive;
  assert.equal(matches.length, 56, 'Expected exact 56 Junior matches (26 Apertura + 26 Finalización + 4 Triangular Final)');

  matches.forEach((m, idx) => {
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
      assert.equal(m.date, idx < 13 ? 'Apertura · 1.ª Vuelta · 1972' : 'Apertura · 2.ª Vuelta · 1972');
    } else if (idx < 52) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
      assert.equal(m.date, idx < 39 ? 'Finalización · 1.ª Vuelta · 1972' : 'Finalización · 2.ª Vuelta · 1972');
    } else {
      assert.equal(m.round, `Triang. Fecha ${idx - 51}`);
      assert.ok(m.date.includes('enero de 1973'), `Expected January 1973 date in ${m.round}: ${m.date}`);
      assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in matchArchive note: ${m.note}`);
    }
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1972: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Ataque') && !m.awayTeam.includes('Ataque'));
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(m.homeTeam !== 'SAN' && m.awayTeam !== 'SAN');
  });

  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'triangular', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  const juniorAperturaRow = t1972.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (26 PJ)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 26);
  const juniorFinalizacionRow = t1972.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinalizacionRow.pj,
    pg: juniorFinalizacionRow.pg,
    pe: juniorFinalizacionRow.pe,
    pp: juniorFinalizacionRow.pp,
    gf: juniorFinalizacionRow.gf,
    gc: juniorFinalizacionRow.gc,
    dg: juniorFinalizacionRow.dg,
    pts: juniorFinalizacionRow.pts,
  });

  // Triangular Final reconciliation (4 PJ)
  const triangularMatches = filterMatchArchiveFixtures(matches, { lap: 'triangular' });
  assert.equal(triangularMatches.length, 4);
  const triangularGroup = t1972.finalGroups.find((g) => g.groupName === 'Triangular final')!;
  const juniorTriangularRow = triangularGroup.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(triangularMatches), {
    pj: juniorTriangularRow.pj,
    pg: juniorTriangularRow.pg,
    pe: juniorTriangularRow.pe,
    pp: juniorTriangularRow.pp,
    gf: juniorTriangularRow.gf,
    gc: juniorTriangularRow.gc,
    dg: juniorTriangularRow.dg,
    pts: juniorTriangularRow.pts,
  });

  // Combined 56-match campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 56,
    pg: 22,
    pe: 24,
    pp: 10,
    gf: 68,
    gc: 55,
    dg: 13,
    pts: 68,
  });

  // All 4 regular laps have 13 matches across 13 distinct rivals, and each rival appears 4 regular times (2H / 2A)
  const regularMatches = matches.slice(0, 52);
  const opponents = getMatchArchiveOpponents(regularMatches);
  assert.equal(opponents.length, 13);
  for (const lapId of ['1', '2', '3', '4'] as const) {
    const lapMatches = filterMatchArchiveFixtures(matches, { lap: lapId });
    assert.equal(lapMatches.length, 13);
    assert.equal(getMatchArchiveOpponents(lapMatches).length, 13);
  }
  for (const opp of opponents) {
    assert.equal(filterMatchArchiveFixtures(regularMatches, { opponent: opp }).length, 4);
    assert.equal(filterMatchArchiveFixtures(regularMatches, { opponent: opp, venue: 'home' }).length, 2);
    assert.equal(filterMatchArchiveFixtures(regularMatches, { opponent: opp, venue: 'away' }).length, 2);
  }

  // Triangular Final playoffMatches contains strictly the 6 official Triangular Final matches without noisy league dump
  assert.equal(t1972.phaseType, 'triangular');
  assert.equal(t1972.championTeam, 'Millonarios F.C');
  assert.equal(t1972.playoffMatches?.length, 6);
  for (const pm of t1972.playoffMatches || []) {
    assert.ok(pm.stage.startsWith('Fecha '), `Unexpected stage in 1972 playoffMatches: ${pm.stage}`);
    assert.ok(pm.date?.includes('enero de 1973'), `Expected Jan 1973 date in 1972 playoffMatches: ${pm.date}`);
    assert.ok(pm.homeTeam !== 'SAN' && pm.awayTeam !== 'SAN');
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    assert.ok(getTournamentTeamCrest(t1972, pm.homeTeam), `Missing playoff crest for ${pm.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1972, pm.awayTeam), `Missing playoff crest for ${pm.awayTeam}`);
  }
});

test('1973 Campeonato Colombiano matchArchive covers Apertura (26) + Finalización (24) = 50 Junior matches and Triangular Final keeps only champion and tables without Junior', () => {
  const t1973 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1973-triangular');
  assert.ok(t1973 && t1973.matchArchive && t1973.regularRows && t1973.secondaryRegularTable && t1973.finalGroups);

  const matches = t1973.matchArchive;
  assert.equal(matches.length, 50, 'Expected exact 50 Junior matches (26 Apertura + 24 Finalización) in 1973');

  matches.forEach((m, idx) => {
    assert.equal(
      m.round,
      idx < 26 ? `Fecha ${idx + 1} · Apertura` : `Fecha ${idx + 1} · Finalización`,
      `Unexpected round label at 1973 index ${idx}: ${m.round}`
    );
    assert.ok(m.date.includes('1973'), `Expected explicit 1973 date at index ${idx}: ${m.date}`);
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1973: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Silva Pacheco') && !m.awayTeam.includes('Silva Pacheco'));
    assert.ok(!m.homeTeam.includes('Fútbol Profesional') && !m.awayTeam.includes('Fútbol Profesional'));
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(m.homeTeam !== 'Caldas' && m.awayTeam !== 'Caldas');
    assert.ok(m.homeTeam !== 'SAN' && m.awayTeam !== 'SAN');
    assert.ok(getTournamentTeamCrest(t1973, m.homeTeam), `Missing crest for ${m.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1973, m.awayTeam), `Missing crest for ${m.awayTeam}`);
  });

  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  const juniorAperturaRow = t1973.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (24 PJ)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 24);
  const juniorFinalizacionRow = t1973.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinalizacionRow.pj,
    pg: juniorFinalizacionRow.pg,
    pe: juniorFinalizacionRow.pe,
    pp: juniorFinalizacionRow.pp,
    gf: juniorFinalizacionRow.gf,
    gc: juniorFinalizacionRow.gc,
    dg: juniorFinalizacionRow.dg,
    pts: juniorFinalizacionRow.pts,
  });

  // Combined 50-match Reclasificación total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 50,
    pg: 16,
    pe: 15,
    pp: 19,
    gf: 58,
    gc: 67,
    dg: -9,
    pts: 47,
  });

  // Vueltas: 13 + 13 in Apertura, 12 + 12 in Finalización
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 12);

  // 13 distinct rivals (2 matches vs Cúcuta Deportivo in Apertura, 4 matches vs the other 12 clubs)
  const opponents = getMatchArchiveOpponents(matches);
  assert.equal(opponents.length, 13);
  for (const opp of opponents) {
    const expectedCount = opp === 'Cúcuta Deportivo' ? 2 : 4;
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp }).length, expectedCount);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'home' }).length, expectedCount / 2);
    assert.equal(filterMatchArchiveFixtures(matches, { opponent: opp, venue: 'away' }).length, expectedCount / 2);
  }

  // Triangular Final: only champion + standings tables (no Junior, no non-Junior playoff matches)
  assert.equal(t1973.phaseType, 'triangular');
  assert.equal(t1973.championTeam, 'Atlético Nacional');
  assert.equal(t1973.playoffMatches?.length, 0);
  assert.equal(t1973.finalGroups.length, 2);
  assert.equal(t1973.finalGroups[0].groupName, 'Triangular final');
  assert.deepEqual(
    t1973.finalGroups[0].rows.map((r) => ({ pos: r.pos, team: r.team, pts: r.pts })),
    [
      { pos: 1, team: 'Atlético Nacional', pts: 6 },
      { pos: 2, team: 'Millonarios F.C', pts: 3 },
      { pos: 3, team: 'Deportivo Cali', pts: 3 },
    ]
  );
  assert.ok(!t1973.finalGroups.some((g) => g.rows.some((r) => r.isJunior || r.team.includes('Junior'))));
});

test('1974 Campeonato Colombiano matchArchive covers Apertura (26) + Finalización (21) + Hexagonal Final (10) = 57 Junior matches and reconciles strictly with all phases', () => {
  const t1974 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1974-hexagonal');
  assert.ok(t1974 && t1974.matchArchive && t1974.regularRows && t1974.secondaryRegularTable && t1974.finalGroups);

  const matches = t1974.matchArchive;
  assert.equal(matches.length, 57, 'Expected exact 57 Junior matches (26 Apertura + 21 Finalización + 10 Hexagonal Final) in 1974');

  matches.forEach((m, idx) => {
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
      assert.ok(m.date.includes('1974'), `Expected explicit 1974 Apertura date at index ${idx}: ${m.date}`);
    } else if (idx < 47) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
      assert.ok(m.date.startsWith('Finalización · '), `Expected Finalización phase date label at index ${idx}: ${m.date}`);
    } else {
      assert.equal(m.round, `Hex. Fecha ${idx - 46}`);
      assert.ok(m.date.includes('1974'), `Expected explicit Nov/Dec 1974 Hexagonal date at index ${idx}: ${m.date}`);
    }
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1974: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Ephanor') && !m.awayTeam.includes('Ephanor'));
    assert.ok(!m.homeTeam.includes('Fútbol') && !m.awayTeam.includes('Fútbol'));
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(m.homeTeam !== 'Caldas' && m.awayTeam !== 'Caldas');
    assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in 1974 matchArchive note: ${m.note}`);
    assert.ok(getTournamentTeamCrest(t1974, m.homeTeam), `Missing crest for ${m.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1974, m.awayTeam), `Missing crest for ${m.awayTeam}`);
  });

  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'hexagonal', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ) against regularRows (chronological #1)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  const juniorAperturaRow = t1974.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (21 PJ: 12 Grupo A + 9 Intergrupos/Pareja) against regularGroups[0] (Grupo A)
  assert.ok(t1974.regularGroups && t1974.regularGroups.length === 2);
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupARow = t1974.regularGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupARow.pj,
    pg: juniorFinGroupARow.pg,
    pe: juniorFinGroupARow.pe,
    pp: juniorFinGroupARow.pp,
    gf: juniorFinGroupARow.gf,
    gc: juniorFinGroupARow.gc,
    dg: juniorFinGroupARow.dg,
    pts: juniorFinGroupARow.pts,
  });

  // Regular Reclasificación reconciliation (47 PJ) against secondaryRegularTable (chronological #3)
  const juniorReclasRow = t1974.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches.slice(0, 47)), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Hexagonal Final reconciliation (10 PJ) against finalGroups[0]
  const hexagonalMatches = filterMatchArchiveFixtures(matches, { lap: 'hexagonal' });
  assert.equal(hexagonalMatches.length, 10);
  const juniorHexRow = t1974.finalGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(hexagonalMatches), {
    pj: juniorHexRow.pj,
    pg: juniorHexRow.pg,
    pe: juniorHexRow.pe,
    pp: juniorHexRow.pp,
    gf: juniorHexRow.gf,
    gc: juniorHexRow.gc,
    dg: juniorHexRow.dg,
    pts: juniorHexRow.pts,
  });

  // Combined 57-match campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 57,
    pg: 23,
    pe: 18,
    pp: 16,
    gf: 72,
    gc: 65,
    dg: 7,
    pts: 64,
  });

  // 13 distinct rivals across the season; Pareja Unión Magdalena played 3 times in Finalización
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  assert.equal(
    filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Unión Magdalena' }).length,
    3
  );

  // Hexagonal Final playoffMatches contains strictly the 30 official Hexagonal matches (Fecha 1..10)
  assert.equal(t1974.phaseType, 'hexagonal');
  assert.equal(t1974.championTeam, 'Deportivo Cali');
  assert.equal(t1974.playoffMatches?.length, 30);
  for (const pm of t1974.playoffMatches || []) {
    assert.ok(/^Fecha (?:[1-9]|10)$/.test(pm.stage), `Unexpected stage in 1974 playoffMatches: ${pm.stage}`);
    assert.ok(pm.date?.includes('1974'), `Expected 1974 date in 1974 playoffMatches: ${pm.date}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    assert.ok(getTournamentTeamCrest(t1974, pm.homeTeam), `Missing playoff crest for ${pm.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1974, pm.awayTeam), `Missing playoff crest for ${pm.awayTeam}`);
  }
});

test('1974-1982 championships follow exact Apertura (26) -> Finalización Grupo A & B (21) -> Reclasificación (47) chronology and math', () => {
  const expectedIds = [
    '1974-hexagonal',
    '1975-hexagonal',
    '1976-hexagonal',
    '1977-hexagonal',
    '1978-semifinal',
    '1979-cuadrangular',
    '1980-cuadrangular',
    '1981-cuadrangular',
    '1982-octogonal',
  ];

  // Confirm ONLY 1974-1982 carry regularGroups (1983+ switched to Copa de la Paz + Torneo Nacional)
  const actualIds = CHRONOLOGICAL_STANDINGS_TABLES.filter((t) => t.regularGroups && t.regularGroups.length > 0).map(
    (t) => t.id
  );
  assert.deepEqual(actualIds, expectedIds);

  for (const id of expectedIds) {
    const t = CHRONOLOGICAL_STANDINGS_TABLES.find((x) => x.id === id);
    assert.ok(t && t.regularRows && t.regularGroups && t.secondaryRegularTable, `Missing regular tables for ${id}`);

    // 1. Apertura (26 PJ, 14 clubs)
    assert.equal(t.regularRows.length, 14, `${id}: Apertura must have 14 clubs`);
    assert.ok(t.regularPhaseTitle?.includes('Apertura'), `${id}: regularPhaseTitle should be Apertura`);

    // 2. Finalización Grupo A (7 clubs, 21 PJ) & Grupo B (7 clubs, 21 PJ)
    assert.equal(t.regularGroups.length, 2, `${id}: must have 2 regularGroups`);
    const [groupA, groupB] = t.regularGroups;
    assert.equal(groupA.groupName, 'Grupo A');
    assert.equal(groupB.groupName, 'Grupo B');
    assert.equal(groupA.rows.length, 7, `${id}: Grupo A must have 7 clubs`);
    assert.equal(groupB.rows.length, 7, `${id}: Grupo B must have 7 clubs`);

    // Top 7 of Apertura -> Grupo A; Bottom 7 of Apertura -> Grupo B
    const top7Set = new Set(t.regularRows.slice(0, 7).map((r) => r.team));
    const bot7Set = new Set(t.regularRows.slice(7, 14).map((r) => r.team));
    for (const r of groupA.rows) {
      assert.ok(top7Set.has(r.team), `${id}: ${r.team} in Grupo A was not in Apertura Top 7`);
    }
    for (const r of groupB.rows) {
      assert.ok(bot7Set.has(r.team), `${id}: ${r.team} in Grupo B was not in Apertura Bottom 7`);
    }

    // 3. Reclasificación (47 PJ, 14 clubs) === Apertura + Finalización
    const reclas = t.secondaryRegularTable.rows;
    assert.equal(reclas.length, 14, `${id}: Reclasificación must have 14 clubs`);
    assert.ok(t.secondaryRegularTable.title.includes('Reclasificación'), `${id}: secondaryRegularTable must be Reclasificación`);

    const finAll = [...groupA.rows, ...groupB.rows];
    for (const apRow of t.regularRows) {
      assert.equal(apRow.pj, 26, `${id} Apertura ${apRow.team} PJ`);
      assert.equal(apRow.pg + apRow.pe + apRow.pp, 26, `${id} Apertura ${apRow.team} W+D+L`);
      assert.equal(apRow.pg * 2 + apRow.pe, apRow.pts, `${id} Apertura ${apRow.team} Pts`);
      assert.equal(apRow.gf - apRow.gc, apRow.dg, `${id} Apertura ${apRow.team} DG`);

      const finRow = finAll.find((x) => x.team === apRow.team);
      assert.ok(finRow, `${id}: Missing ${apRow.team} in Finalización`);
      assert.equal(finRow.pj, 21, `${id} Finalización ${apRow.team} PJ`);
      assert.equal(finRow.pg + finRow.pe + finRow.pp, 21, `${id} Finalización ${apRow.team} W+D+L`);
      assert.equal(finRow.pg * 2 + finRow.pe, finRow.pts, `${id} Finalización ${apRow.team} Pts`);
      assert.equal(finRow.gf - finRow.gc, finRow.dg, `${id} Finalización ${apRow.team} DG`);

      const recRow = reclas.find((x) => x.team === apRow.team);
      assert.ok(recRow, `${id}: Missing ${apRow.team} in Reclasificación`);
      assert.equal(recRow.pj, apRow.pj + finRow.pj, `${id} Reclas ${apRow.team} PJ`);
      assert.equal(recRow.pg, apRow.pg + finRow.pg, `${id} Reclas ${apRow.team} PG`);
      assert.equal(recRow.pe, apRow.pe + finRow.pe, `${id} Reclas ${apRow.team} PE`);
      assert.equal(recRow.pp, apRow.pp + finRow.pp, `${id} Reclas ${apRow.team} PP`);
      assert.equal(recRow.gf, apRow.gf + finRow.gf, `${id} Reclas ${apRow.team} GF`);
      assert.equal(recRow.gc, apRow.gc + finRow.gc, `${id} Reclas ${apRow.team} GC`);
      assert.equal(recRow.dg, recRow.gf - recRow.gc, `${id} Reclas ${apRow.team} DG`);
      assert.equal(recRow.pts, apRow.pts + finRow.pts, `${id} Reclas ${apRow.team} Pts`);
    }

    // Verify Finalización league-wide win/loss & points balance (294 total PJ / PTS)
    const finPG = finAll.reduce((a, r) => a + r.pg, 0);
    const finPE = finAll.reduce((a, r) => a + r.pe, 0);
    const finPP = finAll.reduce((a, r) => a + r.pp, 0);
    const finPTS = finAll.reduce((a, r) => a + r.pts, 0);
    assert.equal(finPG, finPP, `${id} Finalización PG === PP`);
    assert.equal(finPE % 2, 0, `${id} Finalización even draws`);
    assert.equal(finPTS, 294, `${id} Finalización total points === 294`);

    // Verify Apertura badges indicate Grupo A / Grupo B cleanly
    assert.equal(getRowStatusBadge(t, t.regularRows[0], 'regular'), 'Líder · Grupo A');
    assert.equal(getRowStatusBadge(t, t.regularRows[6], 'regular'), 'Grupo A');
    assert.equal(getRowStatusBadge(t, t.regularRows[7], 'regular'), 'Grupo B');
    assert.ok(getRowStatusBadge(t, groupA.rows[0], 'regularGroup', 'Grupo A').includes('Líder'));
    assert.ok(getRowStatusBadge(t, groupB.rows[0], 'regularGroup', 'Grupo B').includes('Líder'));
  }

  // Spot-check 1974 Grupo B winner (Deportivo Pereira 25 pts) & 1978 Junior in Grupo B (2.º, 25 pts)
  const t1974 = CHRONOLOGICAL_STANDINGS_TABLES.find((x) => x.id === '1974-hexagonal')!;
  assert.equal(t1974.regularGroups![0].rows[0].team, 'Deportivo Cali');
  assert.equal(t1974.regularGroups![0].rows[0].pts, 30);
  assert.equal(t1974.regularGroups![1].rows[0].team, 'Deportivo Pereira');
  assert.equal(t1974.regularGroups![1].rows[0].pts, 25);

  const t1978 = CHRONOLOGICAL_STANDINGS_TABLES.find((x) => x.id === '1978-semifinal')!;
  assert.equal(t1978.regularGroups![1].rows[1].team, 'Junior de Barranquilla');
  assert.equal(t1978.regularGroups![1].rows[1].pts, 25);
});

test('1975 Campeonato Colombiano matchArchive covers Apertura (26) + Finalización (21) + Hexagonal Final (10) = 57 Junior matches and reconciles strictly with all phases', () => {
  const t1975 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1975-hexagonal');
  assert.ok(
    t1975 &&
      t1975.matchArchive &&
      t1975.regularRows &&
      t1975.regularGroups &&
      t1975.regularGroups.length === 2 &&
      t1975.secondaryRegularTable &&
      t1975.finalGroups
  );

  const matches = t1975.matchArchive;
  assert.equal(
    matches.length,
    57,
    'Expected exact 57 Junior matches (26 Apertura + 21 Finalización + 10 Hexagonal Final) in 1975'
  );

  matches.forEach((m, idx) => {
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
      assert.ok(m.date.includes('1975'), `Expected explicit 1975 Apertura date at index ${idx}: ${m.date}`);
    } else if (idx < 47) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
      assert.ok(m.date.includes('1975'), `Expected explicit 1975 Finalización date at index ${idx}: ${m.date}`);
    } else {
      assert.equal(m.round, `Hex. Fecha ${idx - 46}`);
      assert.ok(m.date.includes('1975'), `Expected explicit Nov/Dec 1975 Hexagonal date at index ${idx}: ${m.date}`);
    }
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1975: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(m.homeTeam !== 'Caldas' && m.awayTeam !== 'Caldas');
    assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in 1975 matchArchive note: ${m.note}`);
    assert.ok(getTournamentTeamCrest(t1975, m.homeTeam), `Missing crest for ${m.homeTeam}`);
    assert.ok(getTournamentTeamCrest(t1975, m.awayTeam), `Missing crest for ${m.awayTeam}`);
  });

  // Verify 57-match filter options reflect chronological Finalización split (12 Grupo A + 9 Intergrupos/Pareja)
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'hexagonal', '1', '2', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Fin. Grupo A (12)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Fin. Intergrupos (9)');

  // Apertura reconciliation (26 PJ) against regularRows
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const juniorAperturaRow = t1975.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (21 PJ: 12 Grupo A + 9 Intergrupos/Pareja) against regularGroups[0]
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  const finGroupAMatches = filterMatchArchiveFixtures(matches, { lap: '3' });
  const finIntergroupMatches = filterMatchArchiveFixtures(matches, { lap: '4' });
  assert.equal(finGroupAMatches.length, 12);
  assert.equal(finIntergroupMatches.length, 9);
  const groupARivals = new Set(t1975.regularGroups[0].rows.map((r) => r.team));
  const groupBRivals = new Set(t1975.regularGroups[1].rows.map((r) => r.team));
  for (const m of finGroupAMatches) {
    const opp = m.homeTeam === 'Junior de Barranquilla' ? m.awayTeam : m.homeTeam;
    assert.ok(groupARivals.has(opp), `Expected Grupo A rival in lap 3, got ${opp}`);
  }
  for (const m of finIntergroupMatches) {
    const opp = m.homeTeam === 'Junior de Barranquilla' ? m.awayTeam : m.homeTeam;
    assert.ok(groupBRivals.has(opp), `Expected Grupo B rival in lap 4, got ${opp}`);
  }

  const juniorFinGroupARow = t1975.regularGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupARow.pj,
    pg: juniorFinGroupARow.pg,
    pe: juniorFinGroupARow.pe,
    pp: juniorFinGroupARow.pp,
    gf: juniorFinGroupARow.gf,
    gc: juniorFinGroupARow.gc,
    dg: juniorFinGroupARow.dg,
    pts: juniorFinGroupARow.pts,
  });

  // Regular Reclasificación reconciliation (47 PJ) against secondaryRegularTable
  const juniorReclasRow = t1975.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches.slice(0, 47)), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Hexagonal Final reconciliation (10 PJ) against finalGroups[0]
  const hexagonalMatches = filterMatchArchiveFixtures(matches, { lap: 'hexagonal' });
  assert.equal(hexagonalMatches.length, 10);
  const juniorHexRow = t1975.finalGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(hexagonalMatches), {
    pj: juniorHexRow.pj,
    pg: juniorHexRow.pg,
    pe: juniorHexRow.pe,
    pp: juniorHexRow.pp,
    gf: juniorHexRow.gf,
    gc: juniorHexRow.gc,
    dg: juniorHexRow.dg,
    pts: juniorHexRow.pts,
  });

  // Combined 57-match season total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 57,
    pg: 20,
    pe: 20,
    pp: 17,
    gf: 74,
    gc: 65,
    dg: 9,
    pts: 60,
  });

  // 13 distinct rivals; Pareja Deportes Quindío played 3 times in Finalización
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  assert.equal(
    filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Deportes Quindío' }).length,
    3
  );

  // Hexagonal Final playoffMatches contains strictly the 30 official Hexagonal matches reconciling all 6 clubs
  assert.equal(t1975.phaseType, 'hexagonal');
  assert.equal(t1975.championTeam, 'Independiente Santa Fe');
  assert.equal(t1975.playoffMatches?.length, 30);
  const hexCheck = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of t1975.playoffMatches || []) {
    assert.ok(/^Fecha (?:[1-9]|10)$/.test(pm.stage), `Unexpected stage in 1975 playoffMatches: ${pm.stage}`);
    assert.ok(pm.date?.includes('1975'), `Expected 1975 date in 1975 playoffMatches: ${pm.date}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!hexCheck.has(club)) hexCheck.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = hexCheck.get(pm.homeTeam)!;
    const a = hexCheck.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  for (const row of t1975.finalGroups[0].rows) {
    const c = hexCheck.get(row.team)!;
    assert.ok(c, `Missing club in 1975 Hexagonal playoffMatches: ${row.team}`);
    assert.deepEqual(c, {
      pj: row.pj,
      pg: row.pg,
      pe: row.pe,
      pp: row.pp,
      gf: row.gf,
      gc: row.gc,
      pts: row.pts,
    });
  }
});

test('1976 Campeonato Colombiano matchArchive covers Apertura (26) + Desempate Ap. (2) + Finalización (21) + Hexagonal Final (10) = 59 Junior matches and reconciles strictly with all phases', () => {
  const t1976 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1976-hexagonal');
  assert.ok(
    t1976 &&
      t1976.matchArchive &&
      t1976.regularRows &&
      t1976.regularGroups &&
      t1976.regularGroups.length === 2 &&
      t1976.secondaryRegularTable &&
      t1976.finalGroups
  );

  const matches = t1976.matchArchive;
  assert.equal(
    matches.length,
    59,
    'Expected exact 59 Junior matches (26 Apertura + 2 Desempate Ap. + 21 Finalización + 10 Hexagonal Final) in 1976'
  );

  matches.forEach((m, idx) => {
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
      assert.ok(m.date.includes('1976'), `Expected 1976 Apertura label at index ${idx}: ${m.date}`);
    } else if (idx < 28) {
      assert.ok(m.round.startsWith('Desempate Ap.'), `Expected Desempate Ap. round at index ${idx}: ${m.round}`);
      assert.ok(m.date.includes('julio de 1976'), `Expected July 1976 Desempate date at index ${idx}: ${m.date}`);
    } else if (idx < 49) {
      assert.equal(m.round, `Fecha ${idx - 1} · Finalización`);
      assert.ok(m.date.startsWith('Finalización · '), `Expected Finalización label at index ${idx}: ${m.date}`);
    } else {
      assert.equal(m.round, `Hex. Fecha ${idx - 48}`);
      assert.ok(m.date.includes('1976'), `Expected explicit Nov/Dec 1976 Hexagonal date at index ${idx}: ${m.date}`);
    }
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1976: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(m.homeTeam !== 'Caldas' && m.awayTeam !== 'Caldas');
    assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in 1976 matchArchive note: ${m.note}`);
    if (m.homeTeam !== 'Millonarios F.C') {
      assert.ok(getTournamentTeamCrest(t1976, m.homeTeam), `Missing crest for ${m.homeTeam}`);
    }
    if (m.awayTeam !== 'Millonarios F.C') {
      assert.ok(getTournamentTeamCrest(t1976, m.awayTeam), `Missing crest for ${m.awayTeam}`);
    }
  });

  // Verify 59-match filter options include Desempate Ap. (2)
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'desempate', 'finalizacion', 'hexagonal', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ) against regularRows
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const juniorAperturaRow = t1976.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Desempate Apertura (2 PJ: 4-1 & 1-4 vs Millonarios)
  const desempateMatches = filterMatchArchiveFixtures(matches, { lap: 'desempate' });
  assert.equal(desempateMatches.length, 2);
  assert.deepEqual(computeJuniorMatchArchiveSummary(desempateMatches), {
    pj: 2,
    pg: 1,
    pe: 0,
    pp: 1,
    gf: 5,
    gc: 5,
    dg: 0,
    pts: 2,
  });

  // Finalización reconciliation (21 PJ: 12 Grupo A + 9 Intergrupos/Pareja) against regularGroups[0]
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupARow = t1976.regularGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupARow.pj,
    pg: juniorFinGroupARow.pg,
    pe: juniorFinGroupARow.pe,
    pp: juniorFinGroupARow.pp,
    gf: juniorFinGroupARow.gf,
    gc: juniorFinGroupARow.gc,
    dg: juniorFinGroupARow.dg,
    pts: juniorFinGroupARow.pts,
  });

  // Regular Reclasificación reconciliation (47 PJ = 26 Apertura + 21 Finalización) against secondaryRegularTable
  const juniorReclasRow = t1976.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches]), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Hexagonal Final reconciliation (10 PJ) against finalGroups[0]
  const hexagonalMatches = filterMatchArchiveFixtures(matches, { lap: 'hexagonal' });
  assert.equal(hexagonalMatches.length, 10);
  const juniorHexRow = t1976.finalGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(hexagonalMatches), {
    pj: juniorHexRow.pj,
    pg: juniorHexRow.pg,
    pe: juniorHexRow.pe,
    pp: juniorHexRow.pp,
    gf: juniorHexRow.gf,
    gc: juniorHexRow.gc,
    dg: juniorHexRow.dg,
    pts: juniorHexRow.pts,
  });

  // Combined 59-match season total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 59,
    pg: 28,
    pe: 14,
    pp: 17,
    gf: 82,
    gc: 65,
    dg: 17,
    pts: 70,
  });

  // 13 distinct rivals; Pareja Unión Magdalena played 3 times in Finalización
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  assert.equal(
    filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Unión Magdalena' }).length,
    3
  );

  // Hexagonal Final playoffMatches contains strictly the 30 official Hexagonal matches reconciling all 6 clubs
  assert.equal(t1976.phaseType, 'hexagonal');
  assert.equal(t1976.championTeam, 'Atlético Nacional');
  assert.equal(t1976.playoffMatches?.length, 30);
  const hexCheck = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of t1976.playoffMatches || []) {
    assert.ok(/^Fecha (?:[1-9]|10)$/.test(pm.stage), `Unexpected stage in 1976 playoffMatches: ${pm.stage}`);
    assert.ok(pm.date?.includes('1976'), `Expected 1976 date in 1976 playoffMatches: ${pm.date}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!hexCheck.has(club)) hexCheck.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = hexCheck.get(pm.homeTeam)!;
    const a = hexCheck.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  for (const row of t1976.finalGroups[0].rows) {
    const c = hexCheck.get(row.team)!;
    assert.ok(c, `Missing club in 1976 Hexagonal playoffMatches: ${row.team}`);
    assert.deepEqual(c, {
      pj: row.pj,
      pg: row.pg,
      pe: row.pe,
      pp: row.pp,
      gf: row.gf,
      gc: row.gc,
      pts: row.pts,
    });
  }
});

test('1977 Campeonato Colombiano (1ª Estrella) matchArchive reconciles all 57 Junior matches, 30 Hexagonal Final matches, and getJuniorChampionshipStarLabel across all 12 titles', () => {
  const t1977 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1977-hexagonal');
  assert.ok(
    t1977 &&
      t1977.matchArchive &&
      t1977.regularRows &&
      t1977.regularGroups &&
      t1977.regularGroups.length === 2 &&
      t1977.secondaryRegularTable &&
      t1977.finalGroups &&
      t1977.finalGroups.length === 1
  );

  assert.equal(isJuniorChampionTournament(t1977), true);
  assert.equal(t1977.championTeam, 'Junior de Barranquilla');
  assert.equal(getJuniorChampionshipStarLabel(t1977), '1ª Estrella');

  // Verify championship star label helper across all 12 Junior titles and non-championship seasons
  const allJuniorChamps = CHRONOLOGICAL_STANDINGS_TABLES.filter(isJuniorChampionTournament);
  assert.equal(allJuniorChamps.length, 12);
  allJuniorChamps.forEach((champTable, idx) => {
    assert.equal(
      getJuniorChampionshipStarLabel(champTable),
      `${idx + 1}ª Estrella`,
      `Unexpected star label for ${champTable.id}`
    );
  });
  const t1976 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1976-hexagonal')!;
  assert.equal(getJuniorChampionshipStarLabel(t1976), null);

  const matches = t1977.matchArchive;
  assert.equal(matches.length, 57, 'Expected 57 Junior matches in 1977 (26 Apertura + 21 Finalización + 10 Hexagonal)');

  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1977 at index ${idx}: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!(m.note || '').trim().startsWith('★'), `Unexpected leading star in note at ${m.round}`);
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
    } else if (idx < 47) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
    } else {
      assert.equal(m.round, `Hex. Fecha ${idx - 46}`);
      assert.ok(m.date.includes('1977'), `Expected exact 1977 date in ${m.round}: ${m.date}`);
    }
  });

  // Lap filter options
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'hexagonal', '1', '2', '3', '4']
  );

  // Apertura reconciliation (26 PJ — 1º lugar, invicto de local 9-4-0)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const aperturaHomeSummary = computeJuniorMatchArchiveSummary(
    filterMatchArchiveFixtures(aperturaMatches, { venue: 'home' })
  );
  assert.equal(aperturaHomeSummary.pp, 0, 'Junior finished Apertura 1977 unbeaten at home');
  const juniorAperturaRow = t1977.regularRows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (21 PJ: 12 Grupo A + 9 Intergrupos/Pareja) against regularGroups[0]
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupARow = t1977.regularGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupARow.pj,
    pg: juniorFinGroupARow.pg,
    pe: juniorFinGroupARow.pe,
    pp: juniorFinGroupARow.pp,
    gf: juniorFinGroupARow.gf,
    gc: juniorFinGroupARow.gc,
    dg: juniorFinGroupARow.dg,
    pts: juniorFinGroupARow.pts,
  });

  // Regular Reclasificación reconciliation (47 PJ = 26 Apertura + 21 Finalización) against secondaryRegularTable
  const juniorReclasRow = t1977.secondaryRegularTable.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches]), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Hexagonal Final reconciliation (10 PJ — CAMPEÓN, 5/5 wins at home) against finalGroups[0]
  const hexagonalMatches = filterMatchArchiveFixtures(matches, { lap: 'hexagonal' });
  assert.equal(hexagonalMatches.length, 10);
  const hexHomeSummary = computeJuniorMatchArchiveSummary(
    filterMatchArchiveFixtures(hexagonalMatches, { venue: 'home' })
  );
  assert.equal(hexHomeSummary.pg, 5, 'Junior won all 5 home matches in Hexagonal Final 1977');
  const juniorHexRow = t1977.finalGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(hexagonalMatches), {
    pj: juniorHexRow.pj,
    pg: juniorHexRow.pg,
    pe: juniorHexRow.pe,
    pp: juniorHexRow.pp,
    gf: juniorHexRow.gf,
    gc: juniorHexRow.gc,
    dg: juniorHexRow.dg,
    pts: juniorHexRow.pts,
  });

  // Combined 57-match championship campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 57,
    pg: 24,
    pe: 20,
    pp: 13,
    gf: 71,
    gc: 56,
    dg: 15,
    pts: 68,
  });

  // 13 distinct rivals; official Pareja Unión Magdalena played 3 times in Finalización
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  assert.equal(
    filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Unión Magdalena' }).length,
    3
  );

  // Hexagonal Final playoffMatches contains strictly the 30 official matches reconciling all 6 clubs
  assert.equal(t1977.phaseType, 'hexagonal');
  assert.equal(t1977.playoffMatches?.length, 30);
  const hexCheck = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of t1977.playoffMatches || []) {
    assert.ok(/^Fecha (?:[1-9]|10)$/.test(pm.stage), `Unexpected stage in 1977 playoffMatches: ${pm.stage}`);
    assert.ok(pm.date?.includes('1977'), `Expected 1977 date in 1977 playoffMatches: ${pm.date}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!hexCheck.has(club)) hexCheck.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = hexCheck.get(pm.homeTeam)!;
    const a = hexCheck.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  for (const row of t1977.finalGroups[0].rows) {
    const c = hexCheck.get(row.team)!;
    assert.ok(c, `Missing club in 1977 Hexagonal playoffMatches: ${row.team}`);
    assert.deepEqual(c, {
      pj: row.pj,
      pg: row.pg,
      pe: row.pe,
      pp: row.pp,
      gf: row.gf,
      gc: row.gc,
      pts: row.pts,
    });
  }
});

test('1978 match archive reconciles 26 Apertura + 21 Finalización (Grupo B) + 6 Cuadrangular Semifinal A matches and 36 Fase Final playoff matches', () => {
  const t1978 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1978-semifinal')!;
  assert.ok(t1978, '1978-semifinal tournament should exist');
  assert.equal(isJuniorChampionTournament(t1978), false, 'Junior was not champion in 1978');
  assert.equal(getJuniorChampionshipStarLabel(t1978), null);

  const matches = t1978.matchArchive!;
  assert.equal(matches.length, 53, 'Expected 53 Junior matches in 1978 (26 Apertura + 21 Finalización + 6 Cuadrangular Semifinal A)');

  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1978 at index ${idx}: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!m.homeTeam.includes('Peñarol') && !m.awayTeam.includes('Peñarol'));
    assert.ok(!(m.note || '').trim().startsWith('★'), `Unexpected leading star in note at ${m.round}`);
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
    } else if (idx < 47) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
    } else {
      assert.equal(m.round, `Semif. Fecha ${idx - 46}`);
      assert.ok(m.date.includes('1978'), `Expected exact 1978 date in ${m.round}: ${m.date}`);
    }
  });

  // Lap filter options for 53-match 1978 structure (Junior in Grupo B)
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'semifinal', '1', '2', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Fin. Grupo B (27–38)');

  // Apertura reconciliation (26 PJ — 10º lugar) against regularRows
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const juniorAperturaRow = t1978.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (21 PJ: 12 Grupo B + 9 Intergrupos/Pareja) against regularGroups[1]
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupBRow = t1978.regularGroups![1].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupBRow.pj,
    pg: juniorFinGroupBRow.pg,
    pe: juniorFinGroupBRow.pe,
    pp: juniorFinGroupBRow.pp,
    gf: juniorFinGroupBRow.gf,
    gc: juniorFinGroupBRow.gc,
    dg: juniorFinGroupBRow.dg,
    pts: juniorFinGroupBRow.pts,
  });

  // Reclasificación reconciliation (47 PJ = 26 Apertura + 21 Finalización) against secondaryRegularTable
  const juniorReclasRow = t1978.secondaryRegularTable!.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches]), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Cuadrangular Semifinal A reconciliation (6 PJ — 3º lugar) against finalGroups[0]
  const semifinalMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  assert.equal(semifinalMatches.length, 6);
  const juniorSemiRow = t1978.finalGroups![0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(semifinalMatches), {
    pj: juniorSemiRow.pj,
    pg: juniorSemiRow.pg,
    pe: juniorSemiRow.pe,
    pp: juniorSemiRow.pp,
    gf: juniorSemiRow.gf,
    gc: juniorSemiRow.gc,
    dg: juniorSemiRow.dg,
    pts: juniorSemiRow.pts,
  });

  // Combined 53-match 1978 official league campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 53,
    pg: 19,
    pe: 17,
    pp: 17,
    gf: 73,
    gc: 68,
    dg: 5,
    pts: 55,
  });

  // 13 distinct rivals; official Pareja Deportivo Cali played 3 times in Finalización
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  assert.equal(
    filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Deportivo Cali' }).length,
    3
  );

  // Fase Final playoffMatches: 36 clean official matches (12 Semifinal A + 12 Semifinal B + 12 Cuadrangular Final)
  const pms = t1978.playoffMatches || [];
  assert.equal(pms.length, 36, 'Expected 36 Fase Final playoff matches in 1978');
  for (const pm of pms) {
    assert.notEqual(pm.stage, 'Resultados', 'Should not contain noisy Resultados dump rows');
    assert.ok(!pm.homeTeam.includes('Millonaros') && !pm.awayTeam.includes('Millonaros'));
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    assert.notEqual(pm.homeTeam, 'Caldas');
    assert.notEqual(pm.awayTeam, 'Caldas');
  }

  const slices = [
    { group: t1978.finalGroups![0], fixtures: pms.slice(0, 12), name: 'Semifinal Grupo A' },
    { group: t1978.finalGroups![1], fixtures: pms.slice(12, 24), name: 'Semifinal Grupo B' },
    { group: t1978.finalGroups![2], fixtures: pms.slice(24, 36), name: 'Cuadrangular Final' },
  ];
  for (const { group, fixtures, name } of slices) {
    const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const pm of fixtures) {
      for (const club of [pm.homeTeam, pm.awayTeam]) {
        if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      }
      const h = check.get(pm.homeTeam)!;
      const a = check.get(pm.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += pm.homeScore; h.gc += pm.awayScore;
      a.gf += pm.awayScore; a.gc += pm.homeScore;
      if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
      else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
      else { a.pg++; a.pts += 2; h.pp++; }
    }
    for (const row of group.rows) {
      const c = check.get(row.team)!;
      assert.ok(c, `Missing club in 1978 ${name} playoffMatches: ${row.team}`);
      assert.deepEqual(c, {
        pj: row.pj,
        pg: row.pg,
        pe: row.pe,
        pp: row.pp,
        gf: row.gf,
        gc: row.gc,
        pts: row.pts,
      });
    }
  }
});

test('1979 match archive reconciles 26 Apertura + 21 Finalización (Grupo A) + 6 Cuadrangular Semifinal A + 6 Cuadrangular Final matches (59 PJ) and 36 Fase Final playoff matches', () => {
  const t1979 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1979-cuadrangular')!;
  assert.ok(t1979, '1979-cuadrangular tournament should exist');
  assert.equal(isJuniorChampionTournament(t1979), false, 'Junior was not champion in 1979');
  assert.equal(getJuniorChampionshipStarLabel(t1979), null);

  const matches = t1979.matchArchive!;
  assert.equal(matches.length, 59, 'Expected 59 Junior matches in 1979 (26 Apertura + 21 Finalización + 6 Semifinal A + 6 Cuadrangular Final)');

  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1979 at index ${idx}: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!(m.note || '').trim().startsWith('★'), `Unexpected leading star in note at ${m.round}`);
    assert.ok(m.date.includes('1979'), `Expected exact 1979 date in ${m.round}: ${m.date}`);
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
    } else if (idx < 47) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
    } else if (idx < 53) {
      assert.equal(m.round, `Semif. Fecha ${idx - 46}`);
    } else {
      assert.equal(m.round, `Cuad. Final · Fecha ${idx - 52}`);
    }
  });

  // Lap filter options for 59-match 1979 structure (distinct from 1976's 59 with Desempate + Hexagonal)
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'semifinal', 'cuadrangular', '1', '2', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Fin. Grupo A (12)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Fin. Intergrupos (9)');

  // Apertura reconciliation (26 PJ — 4º lugar) against regularRows
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const juniorAperturaRow = t1979.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización reconciliation (21 PJ: 12 Grupo A + 9 Intergrupos/Pareja) against regularGroups[0]
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupARow = t1979.regularGroups![0].rows.find((r) => r.isJunior)!;
  assert.equal(juniorFinGroupARow.pos, 4, 'Junior finished 4th in Finalización Grupo A 1979');
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupARow.pj,
    pg: juniorFinGroupARow.pg,
    pe: juniorFinGroupARow.pe,
    pp: juniorFinGroupARow.pp,
    gf: juniorFinGroupARow.gf,
    gc: juniorFinGroupARow.gc,
    dg: juniorFinGroupARow.dg,
    pts: juniorFinGroupARow.pts,
  });

  // Reclasificación reconciliation (47 PJ = 26 Apertura + 21 Finalización) against secondaryRegularTable
  const juniorReclasRow = t1979.secondaryRegularTable!.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches]), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Cuadrangular Semifinal A reconciliation (6 PJ — 1º lugar, 8 pts) against finalGroups[0]
  const semifinalMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  assert.equal(semifinalMatches.length, 6);
  const juniorSemiRow = t1979.finalGroups![0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(semifinalMatches), {
    pj: juniorSemiRow.pj,
    pg: juniorSemiRow.pg,
    pe: juniorSemiRow.pe,
    pp: juniorSemiRow.pp,
    gf: juniorSemiRow.gf,
    gc: juniorSemiRow.gc,
    dg: juniorSemiRow.dg,
    pts: juniorSemiRow.pts,
  });

  // Cuadrangular Final reconciliation (6 PJ — 4º lugar, 1 pt) against finalGroups[2] and rows
  const finalMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(finalMatches.length, 6);
  const juniorFinalRow = t1979.finalGroups![2].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalMatches), {
    pj: juniorFinalRow.pj,
    pg: juniorFinalRow.pg,
    pe: juniorFinalRow.pe,
    pp: juniorFinalRow.pp,
    gf: juniorFinalRow.gf,
    gc: juniorFinalRow.gc,
    dg: juniorFinalRow.dg,
    pts: juniorFinalRow.pts,
  });

  // Combined 59-match 1979 campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 59,
    pg: 23,
    pe: 17,
    pp: 19,
    gf: 71,
    gc: 65,
    dg: 6,
    pts: 63,
  });

  // 13 distinct rivals; official Pareja Deportes Tolima played 3 times in Finalización (1 home, 2 away)
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  const tolimaFin = filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Deportes Tolima' });
  assert.equal(tolimaFin.length, 3);
  assert.equal(tolimaFin.filter((m) => m.homeTeam === 'Junior de Barranquilla').length, 1);
  assert.equal(tolimaFin.filter((m) => m.homeTeam === 'Deportes Tolima').length, 2);

  // Fase Final playoffMatches: 36 clean official matches (12 Semifinal A + 12 Semifinal B + 12 Cuadrangular Final)
  const pms = t1979.playoffMatches || [];
  assert.equal(pms.length, 36, 'Expected 36 Fase Final playoff matches in 1979');
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados'), `Unexpected Resultados dump row: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    assert.ok(pm.date?.includes('1979'), `Expected 1979 date in playoffMatch: ${pm.date}`);
  }

  const slices = [
    { group: t1979.finalGroups![0], fixtures: pms.slice(0, 12), name: 'Semifinal Grupo A' },
    { group: t1979.finalGroups![1], fixtures: pms.slice(12, 24), name: 'Semifinal Grupo B' },
    { group: t1979.finalGroups![2], fixtures: pms.slice(24, 36), name: 'Cuadrangular Final' },
  ];
  for (const { group, fixtures, name } of slices) {
    const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const pm of fixtures) {
      for (const club of [pm.homeTeam, pm.awayTeam]) {
        if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      }
      const h = check.get(pm.homeTeam)!;
      const a = check.get(pm.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += pm.homeScore; h.gc += pm.awayScore;
      a.gf += pm.awayScore; a.gc += pm.homeScore;
      if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
      else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
      else { a.pg++; a.pts += 2; h.pp++; }
    }
    for (const row of group.rows) {
      const c = check.get(row.team)!;
      assert.ok(c, `Missing club in 1979 ${name} playoffMatches: ${row.team}`);
      assert.deepEqual(c, {
        pj: row.pj,
        pg: row.pg,
        pe: row.pe,
        pp: row.pp,
        gf: row.gf,
        gc: row.gc,
        pts: row.pts,
      });
    }
  }
});

test('1980 match archive reconciles 26 Apertura + 2 Desempate Ap. + 21 Finalización (Grupo A) + 6 Cuadrangular Semifinal B + 6 Cuadrangular Final (61 PJ, 2ª Estrella ★) and 40 Fase Final/Desempate matches', () => {
  const t1980 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1980-cuadrangular')!;
  assert.ok(t1980, '1980-cuadrangular tournament should exist');
  assert.equal(isJuniorChampionTournament(t1980), true, 'Junior was champion in 1980 (2ª Estrella)');
  assert.equal(t1980.championTeam, 'Junior de Barranquilla');
  assert.equal(getJuniorChampionshipStarLabel(t1980), '2ª Estrella');

  const matches = t1980.matchArchive!;
  assert.equal(
    matches.length,
    61,
    'Expected 61 Junior matches in 1980 (26 Apertura + 2 Desempate Ap. + 21 Finalización + 6 Semifinal B + 6 Cuadrangular Final)'
  );

  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1980 at index ${idx}: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!m.homeTeam.includes('Varta') && !m.awayTeam.includes('Varta'));
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
    } else if (idx === 26) {
      assert.equal(m.round, 'Desempate Ap. · Ida');
    } else if (idx === 27) {
      assert.equal(m.round, 'Desempate Ap. · Vuelta');
    } else if (idx < 49) {
      assert.equal(m.round, `Fecha ${idx - 1} · Finalización`);
    } else if (idx < 55) {
      assert.equal(m.round, `Semifinal B · Fecha ${idx - 48}`);
    } else {
      assert.equal(m.round, `Cuadrangular Final · Fecha ${idx - 54}`);
    }
  });

  // 10 lap filter options for 61-match 1980 structure
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'desempate', 'finalizacion', 'semifinal', 'cuadrangular', '1', '2', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Fin. Grupo A (27–38)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Fin. Intergrupos (39–47)');

  // Apertura reconciliation (26 PJ — 1º lugar, 35 pts, +20 DG)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const juniorAperturaRow = t1980.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Desempate Apertura reconciliation (2 PJ — 2-1 & 1-2 vs Deportivo Cali, 4-2 global)
  const desempateMatches = filterMatchArchiveFixtures(matches, { lap: 'desempate' });
  assert.equal(desempateMatches.length, 2);
  assert.deepEqual(computeJuniorMatchArchiveSummary(desempateMatches), {
    pj: 2,
    pg: 2,
    pe: 0,
    pp: 0,
    gf: 4,
    gc: 2,
    dg: 2,
    pts: 4,
  });

  // Finalización Grupo A reconciliation (21 PJ — 7º lugar, 10 pts, incl. 0-1 fallo Fornari vs Unión Magdalena)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupARow = t1980.regularGroups![0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupARow.pj,
    pg: juniorFinGroupARow.pg,
    pe: juniorFinGroupARow.pe,
    pp: juniorFinGroupARow.pp,
    gf: juniorFinGroupARow.gf,
    gc: juniorFinGroupARow.gc,
    dg: juniorFinGroupARow.dg,
    pts: juniorFinGroupARow.pts,
  });

  // Reclasificación reconciliation (47 PJ = 26 Apertura + 21 Finalización)
  const juniorReclasRow = t1980.secondaryRegularTable!.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches]), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Cuadrangular Semifinal B reconciliation (6 PJ — 1º lugar, 8 pts)
  const semifinalMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  assert.equal(semifinalMatches.length, 6);
  const juniorSemiRow = t1980.finalGroups![1].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(semifinalMatches), {
    pj: juniorSemiRow.pj,
    pg: juniorSemiRow.pg,
    pe: juniorSemiRow.pe,
    pp: juniorSemiRow.pp,
    gf: juniorSemiRow.gf,
    gc: juniorSemiRow.gc,
    dg: juniorSemiRow.dg,
    pts: juniorSemiRow.pts,
  });

  // Cuadrangular Final reconciliation (6 PJ — 1º CAMPEÓN INVICTO, 9 pts)
  const finalMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(finalMatches.length, 6);
  const juniorFinalRow = t1980.finalGroups![2].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalMatches), {
    pj: juniorFinalRow.pj,
    pg: juniorFinalRow.pg,
    pe: juniorFinalRow.pe,
    pp: juniorFinalRow.pp,
    gf: juniorFinalRow.gf,
    gc: juniorFinalRow.gc,
    dg: juniorFinalRow.dg,
    pts: juniorFinalRow.pts,
  });

  // Combined 61-match 1980 championship campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 61,
    pg: 22,
    pe: 22,
    pp: 17,
    gf: 68,
    gc: 61,
    dg: 7,
    pts: 66,
  });

  // 13 distinct rivals; Pareja Unión Magdalena played 3 times in Finalización
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  const magFin = filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Unión Magdalena' });
  assert.equal(magFin.length, 3);

  // Fase Final + Desempates playoffMatches: 40 clean official matches
  const pms = t1980.playoffMatches || [];
  assert.equal(pms.length, 40, 'Expected 40 Fase Final / Desempate playoff matches in 1980');
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados'), `Unexpected Resultados dump row: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
  }

  const slices = [
    { group: t1980.finalGroups![0], fixtures: pms.slice(4, 16), name: 'Semifinal Grupo A' },
    { group: t1980.finalGroups![1], fixtures: pms.slice(16, 28), name: 'Semifinal Grupo B' },
    { group: t1980.finalGroups![2], fixtures: pms.slice(28, 40), name: 'Cuadrangular Final' },
  ];
  for (const { group, fixtures, name } of slices) {
    const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const pm of fixtures) {
      for (const club of [pm.homeTeam, pm.awayTeam]) {
        if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      }
      const h = check.get(pm.homeTeam)!;
      const a = check.get(pm.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += pm.homeScore; h.gc += pm.awayScore;
      a.gf += pm.awayScore; a.gc += pm.homeScore;
      if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
      else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
      else { a.pg++; a.pts += 2; h.pp++; }
    }
    for (const row of group.rows) {
      const c = check.get(row.team)!;
      assert.ok(c, `Missing club in 1980 ${name} playoffMatches: ${row.team}`);
      assert.deepEqual(c, {
        pj: row.pj,
        pg: row.pg,
        pe: row.pe,
        pp: row.pp,
        gf: row.gf,
        gc: row.gc,
        pts: row.pts,
      });
    }
  }
});

test('1981 match archive reconciles 26 Apertura + 21 Finalización (Heptagonal B) + 6 Cuadrangular Semifinal A + 6 Cuadrangular Final (59 PJ) and 36 Fase Final matches', () => {
  const t1981 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1981-cuadrangular')!;
  assert.ok(t1981, '1981-cuadrangular tournament should exist');
  assert.equal(t1981.championTeam, 'Atlético Nacional');

  const matches = t1981.matchArchive!;
  assert.equal(
    matches.length,
    59,
    'Expected 59 Junior matches in 1981 (26 Apertura + 21 Finalización Heptagonal B + 6 Semifinal A + 6 Cuadrangular Final)'
  );

  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1981 at index ${idx}: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
    } else if (idx < 47) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
    } else if (idx < 53) {
      assert.equal(m.round, `Semifinal A · Fecha ${idx - 46}`);
    } else {
      assert.equal(m.round, `Cuadrangular Final · Fecha ${idx - 52}`);
    }
  });

  // 9 lap filter options for 59-match 1981 structure (Apertura + Finalización Grupo B + Semifinal + Cuadrangular Final)
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'semifinal', 'cuadrangular', '1', '2', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Fin. Grupo B (27–38)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Fin. Intergrupos (39–47)');

  // Apertura reconciliation (26 PJ — 12º lugar, 21 pts, -7 DG)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const juniorAperturaRow = t1981.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización Heptagonal B reconciliation (21 PJ — 2º lugar, 24 pts, +5 DG)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupBRow = t1981.regularGroups![1].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupBRow.pj,
    pg: juniorFinGroupBRow.pg,
    pe: juniorFinGroupBRow.pe,
    pp: juniorFinGroupBRow.pp,
    gf: juniorFinGroupBRow.gf,
    gc: juniorFinGroupBRow.gc,
    dg: juniorFinGroupBRow.dg,
    pts: juniorFinGroupBRow.pts,
  });

  // Reclasificación reconciliation (47 PJ = 26 Apertura + 21 Finalización)
  const juniorReclasRow = t1981.secondaryRegularTable!.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches]), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Cuadrangular Semifinal A reconciliation (6 PJ — 2º lugar, 9 pts, +2 DG)
  const semifinalMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  assert.equal(semifinalMatches.length, 6);
  const juniorSemiRow = t1981.finalGroups![0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(semifinalMatches), {
    pj: juniorSemiRow.pj,
    pg: juniorSemiRow.pg,
    pe: juniorSemiRow.pe,
    pp: juniorSemiRow.pp,
    gf: juniorSemiRow.gf,
    gc: juniorSemiRow.gc,
    dg: juniorSemiRow.dg,
    pts: juniorSemiRow.pts,
  });

  // Cuadrangular Final reconciliation (6 PJ — 4º lugar, 5 pts, 10:10 DG 0)
  const finalMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(finalMatches.length, 6);
  const juniorFinalRow = t1981.finalGroups![2].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalMatches), {
    pj: juniorFinalRow.pj,
    pg: juniorFinalRow.pg,
    pe: juniorFinalRow.pe,
    pp: juniorFinalRow.pp,
    gf: juniorFinalRow.gf,
    gc: juniorFinalRow.gc,
    dg: juniorFinalRow.dg,
    pts: juniorFinalRow.pts,
  });

  // Combined 59-match 1981 season total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 59,
    pg: 19,
    pe: 21,
    pp: 19,
    gf: 74,
    gc: 74,
    dg: 0,
    pts: 59,
  });

  // 13 distinct rivals; Pareja Unión Magdalena played 3 times in Finalización (2H + 1A as Grupo B club)
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  const magFin = filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Unión Magdalena' });
  assert.equal(magFin.length, 3);
  assert.equal(filterMatchArchiveFixtures(magFin, { venue: 'home' }).length, 2);
  assert.equal(filterMatchArchiveFixtures(magFin, { venue: 'away' }).length, 1);

  // Fase Final playoffMatches: 36 clean official matches (12 Semifinal A + 12 Semifinal B + 12 Cuadrangular Final)
  const pms = t1981.playoffMatches || [];
  assert.equal(pms.length, 36, 'Expected 36 Fase Final playoff matches in 1981');
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados'), `Unexpected Resultados dump row: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
  }

  const slices = [
    { group: t1981.finalGroups![0], fixtures: pms.slice(0, 12), name: 'Semifinal Grupo A' },
    { group: t1981.finalGroups![1], fixtures: pms.slice(12, 24), name: 'Semifinal Grupo B' },
    { group: t1981.finalGroups![2], fixtures: pms.slice(24, 36), name: 'Cuadrangular Final' },
  ];
  for (const { group, fixtures, name } of slices) {
    const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const pm of fixtures) {
      for (const club of [pm.homeTeam, pm.awayTeam]) {
        if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      }
      const h = check.get(pm.homeTeam)!;
      const a = check.get(pm.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += pm.homeScore; h.gc += pm.awayScore;
      a.gf += pm.awayScore; a.gc += pm.homeScore;
      if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
      else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
      else { a.pg++; a.pts += 2; h.pp++; }
    }
    for (const row of group.rows) {
      const c = check.get(row.team)!;
      assert.ok(c, `Missing club in 1981 ${name} playoffMatches: ${row.team}`);
      assert.deepEqual(c, {
        pj: row.pj,
        pg: row.pg,
        pe: row.pe,
        pp: row.pp,
        gf: row.gf,
        gc: row.gc,
        pts: row.pts,
      });
    }
  }
});

test('1982 match archive reconciles 26 Apertura + 21 Finalización (Heptagonal B) + 14 Octogonal Final (61 PJ) and 58 Fase Final/Desempate matches', () => {
  const t1982 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1982-octogonal')!;
  assert.ok(t1982, '1982-octogonal tournament should exist');
  assert.equal(t1982.championTeam, 'América de Cali');

  const matches = t1982.matchArchive!;
  assert.equal(
    matches.length,
    61,
    'Expected 61 Junior matches in 1982 (26 Apertura + 21 Finalización Heptagonal B + 14 Octogonal Final)'
  );

  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Unexpected non-Junior fixture in 1982 at index ${idx}: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    if (idx < 26) {
      assert.equal(m.round, `Fecha ${idx + 1} · Apertura`);
    } else if (idx < 47) {
      assert.equal(m.round, `Fecha ${idx + 1} · Finalización`);
    } else {
      assert.equal(m.round, `Octogonal Final · Fecha ${idx - 46}`);
    }
  });

  // 8 lap filter options for 61-match 1982 Octogonal structure
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'octogonal', '1', '2', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === 'octogonal')?.label, 'Octogonal Final (14)');
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Fin. Grupo B (12)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Fin. Intergrupos (9)');

  // Apertura reconciliation (26 PJ — 11º lugar, 22 pts, +2 DG)
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(aperturaMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '1' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '2' }).length, 13);
  const juniorAperturaRow = t1982.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches), {
    pj: juniorAperturaRow.pj,
    pg: juniorAperturaRow.pg,
    pe: juniorAperturaRow.pe,
    pp: juniorAperturaRow.pp,
    gf: juniorAperturaRow.gf,
    gc: juniorAperturaRow.gc,
    dg: juniorAperturaRow.dg,
    pts: juniorAperturaRow.pts,
  });

  // Finalización Heptagonal B reconciliation (21 PJ — 3º lugar, 27 pts, +16 DG)
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finalizacionMatches.length, 21);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 12);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 9);
  const juniorFinGroupBRow = t1982.regularGroups![1].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches), {
    pj: juniorFinGroupBRow.pj,
    pg: juniorFinGroupBRow.pg,
    pe: juniorFinGroupBRow.pe,
    pp: juniorFinGroupBRow.pp,
    gf: juniorFinGroupBRow.gf,
    gc: juniorFinGroupBRow.gc,
    dg: juniorFinGroupBRow.dg,
    pts: juniorFinGroupBRow.pts,
  });

  // Reclasificación reconciliation (47 PJ = 26 Apertura + 21 Finalización)
  const juniorReclasRow = t1982.secondaryRegularTable!.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches]), {
    pj: juniorReclasRow.pj,
    pg: juniorReclasRow.pg,
    pe: juniorReclasRow.pe,
    pp: juniorReclasRow.pp,
    gf: juniorReclasRow.gf,
    gc: juniorReclasRow.gc,
    dg: juniorReclasRow.dg,
    pts: juniorReclasRow.pts,
  });

  // Octogonal Final reconciliation (14 PJ — 8º lugar, 11 pts, 16:19 -3 DG)
  const octogonalMatches = filterMatchArchiveFixtures(matches, { lap: 'octogonal' });
  assert.equal(octogonalMatches.length, 14);
  const juniorOctRow = t1982.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(octogonalMatches), {
    pj: juniorOctRow.pj,
    pg: juniorOctRow.pg,
    pe: juniorOctRow.pe,
    pp: juniorOctRow.pp,
    gf: juniorOctRow.gf,
    gc: juniorOctRow.gc,
    dg: juniorOctRow.dg,
    pts: juniorOctRow.pts,
  });

  // Combined 61-match 1982 season total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 61,
    pg: 23,
    pe: 14,
    pp: 24,
    gf: 89,
    gc: 74,
    dg: 15,
    pts: 60,
  });

  // 13 distinct rivals; Pareja Unión Magdalena played 3 times in Finalización (2H + 1A)
  assert.equal(getMatchArchiveOpponents(matches).length, 13);
  const magFin = filterMatchArchiveFixtures(finalizacionMatches, { opponent: 'Unión Magdalena' });
  assert.equal(magFin.length, 3);
  assert.equal(filterMatchArchiveFixtures(magFin, { venue: 'home' }).length, 2);
  assert.equal(filterMatchArchiveFixtures(magFin, { venue: 'away' }).length, 1);

  // Fase Final + Desempate playoffMatches: 58 clean official matches (2 Desempate Ap. + 56 Octogonal Final)
  const pms = t1982.playoffMatches || [];
  assert.equal(pms.length, 58, 'Expected 58 Fase Final / Desempate playoff matches in 1982');
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados'), `Unexpected Resultados dump row: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
  }

  const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of pms.slice(2)) {
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = check.get(pm.homeTeam)!;
    const a = check.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  for (const row of t1982.rows) {
    const c = check.get(row.team)!;
    assert.ok(c, `Missing club in 1982 Octogonal Final playoffMatches: ${row.team}`);
    assert.deepEqual(c, {
      pj: row.pj,
      pg: row.pg,
      pe: row.pe,
      pp: row.pp,
      gf: row.gf,
      gc: row.gc,
      pts: row.pts,
    });
  }
});

test('1983 match archive reconciles 14 Copa de la Paz + 2 Serie Extra + 26 Torneo Nacional + 14 Octogonal Final (56 PJ, Subcampeón 🥈) and 60 Fase Final/Bonificación matches', () => {
  const t1983 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1983-octogonal');
  assert.ok(t1983, 'Missing 1983-octogonal');
  const matches = t1983.matchArchive || [];
  assert.equal(matches.length, 56, 'Expected 56 official Junior matches in 1983');

  // Strictly Junior matches with standardized club names & round labels
  matches.forEach((m, idx) => {
    const isJuniorMatch =
      m.homeTeam.toLowerCase().includes('junior') || m.awayTeam.toLowerCase().includes('junior');
    assert.ok(isJuniorMatch, `Non-Junior match found at index ${idx}: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(
      !m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'),
      `Trailing period in Millonarios name at index ${idx}`
    );
    if (idx < 14) {
      assert.equal(m.round, `Copa de la Paz · Fecha ${idx + 1}`);
    } else if (idx === 14) {
      assert.equal(m.round, 'Serie Extra · Ida');
    } else if (idx === 15) {
      assert.equal(m.round, 'Serie Extra · Vuelta');
    } else if (idx < 42) {
      assert.equal(m.round, `Torneo Nacional · Fecha ${idx - 15}`);
    } else {
      assert.equal(m.round, `Octogonal Final · Fecha ${idx - 41}`);
    }
  });

  // 7 lap filter options for 56-match 1983 structure
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'desempate', 'finalizacion', 'octogonal', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === 'apertura')?.label, 'Copa de la Paz (14)');
  assert.equal(lapOpts.find((o) => o.id === 'desempate')?.label, 'Serie Extra (2)');
  assert.equal(lapOpts.find((o) => o.id === 'finalizacion')?.label, 'Torneo Nacional (26)');
  assert.equal(lapOpts.find((o) => o.id === 'octogonal')?.label, 'Octogonal Final (14)');
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Nac. 1.ª Vta (1–13)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Nac. 2.ª Vta (14–26)');

  // Copa de la Paz reconciliation (14 PJ — 1.º Grupo B, 20 pts, 26:18 +8 DG)
  const copaPazMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(copaPazMatches.length, 14);
  assert.deepEqual(computeJuniorMatchArchiveSummary(copaPazMatches), {
    pj: 14,
    pg: 10,
    pe: 0,
    pp: 4,
    gf: 26,
    gc: 18,
    dg: 8,
    pts: 20,
  });

  // Serie Extra Bonificación reconciliation (2 PJ vs Once Caldas: 2-2 & 0-2)
  const serieExtraMatches = filterMatchArchiveFixtures(matches, { lap: 'desempate' });
  assert.equal(serieExtraMatches.length, 2);
  assert.deepEqual(computeJuniorMatchArchiveSummary(serieExtraMatches), {
    pj: 2,
    pg: 0,
    pe: 1,
    pp: 1,
    gf: 2,
    gc: 4,
    dg: -2,
    pts: 1,
  });

  // Torneo Nacional reconciliation (26 PJ — 4.º lugar, 34 pts, 48:25 +23 DG)
  const nacionalMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(nacionalMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 13);
  const juniorNacRow = t1983.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(nacionalMatches), {
    pj: juniorNacRow.pj,
    pg: juniorNacRow.pg,
    pe: juniorNacRow.pe,
    pp: juniorNacRow.pp,
    gf: juniorNacRow.gf,
    gc: juniorNacRow.gc,
    dg: juniorNacRow.dg,
    pts: juniorNacRow.pts,
  });

  // Octogonal Final reconciliation (14 PJ — 2.º Subcampeón 🥈, 18 pts en cancha + 1.00 bonif = 19.00)
  const octogonalMatches = filterMatchArchiveFixtures(matches, { lap: 'octogonal' });
  assert.equal(octogonalMatches.length, 14);
  const juniorOctRow = t1983.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(octogonalMatches), {
    pj: juniorOctRow.pj,
    pg: juniorOctRow.pg,
    pe: juniorOctRow.pe,
    pp: juniorOctRow.pp,
    gf: juniorOctRow.gf,
    gc: juniorOctRow.gc,
    dg: juniorOctRow.dg,
    pts: juniorOctRow.pts - 1, // 18 on-pitch points + 1.00 bonus = 19.00
  });

  // Combined 56-match 1983 season total (100 goals scored!)
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 56,
    pg: 30,
    pe: 13,
    pp: 13,
    gf: 100,
    gc: 61,
    dg: 39,
    pts: 73,
  });

  // 13 distinct rivals across the 1983 season
  assert.equal(getMatchArchiveOpponents(matches).length, 13);

  // Fase Final + Bonificación playoffMatches: 60 clean official matches (4 Serie Extra + 56 Octogonal Final)
  const pms = t1983.playoffMatches || [];
  assert.equal(pms.length, 60, 'Expected 60 Fase Final / Bonificación playoff matches in 1983');
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados'), `Unexpected Resultados dump row: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    assert.ok(pm.homeTeam !== 'Caldas' && pm.awayTeam !== 'Caldas', 'Expected standardized Once Caldas name');
  }

  const bonuses: Record<string, number> = {
    'América de Cali': 0.75,
    'Junior de Barranquilla': 1,
    'Atlético Nacional': 1,
    'Millonarios F.C': 0.75,
    'Once Caldas': 1,
    'Independiente Santa Fe': 0,
    'Deportivo Cali': 0,
    'Independiente Medellín': 0.5,
  };
  const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of pms.slice(4)) {
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = check.get(pm.homeTeam)!;
    const a = check.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  for (const row of t1983.rows) {
    const c = check.get(row.team)!;
    assert.ok(c, `Missing club in 1983 Octogonal Final playoffMatches: ${row.team}`);
    assert.deepEqual(
      { ...c, pts: c.pts + (bonuses[row.team] ?? 0) },
      {
        pj: row.pj,
        pg: row.pg,
        pe: row.pe,
        pp: row.pp,
        gf: row.gf,
        gc: row.gc,
        pts: row.pts,
      }
    );
  }
});

test('1984 Campeonato Colombiano: Junior 56-match archive (Copa de la Paz + Serie Extra + Torneo Nacional + Octogonal Final) and 60 Fase Final matches reconcile 100%', () => {
  const t1984 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1984-octogonal')!;
  assert.ok(t1984, '1984-octogonal tournament must exist');

  const matches = t1984.matchArchive || [];
  assert.equal(matches.length, 56, 'Expected 56 official Junior matches in 1984');

  // Every match must involve Junior, have standardized Millonarios name, non-empty date/vuelta, and exact round labels
  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Match ${idx} does not involve Junior: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(
      !m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'),
      `Trailing period in Millonarios name at index ${idx}`
    );
    assert.ok(m.date && m.date.trim().length > 0, `Missing date/vuelta label at index ${idx}`);
    if (idx < 14) {
      assert.equal(m.round, `Copa de la Paz · Fecha ${idx + 1}`);
    } else if (idx === 14) {
      assert.equal(m.round, 'Serie Extra · Ida');
    } else if (idx === 15) {
      assert.equal(m.round, 'Serie Extra · Vuelta');
    } else if (idx < 42) {
      assert.equal(m.round, `Torneo Nacional · Fecha ${idx - 15}`);
    } else {
      assert.equal(m.round, `Octogonal Final · Fecha ${idx - 41}`);
      assert.match(m.date, /de (noviembre|diciembre) de 1984$/);
    }
  });

  // 7 lap filter options for 56-match 1984 structure
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'desempate', 'finalizacion', 'octogonal', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === 'apertura')?.label, 'Copa de la Paz (14)');
  assert.equal(lapOpts.find((o) => o.id === 'desempate')?.label, 'Serie Extra (2)');
  assert.equal(lapOpts.find((o) => o.id === 'finalizacion')?.label, 'Torneo Nacional (26)');
  assert.equal(lapOpts.find((o) => o.id === 'octogonal')?.label, 'Octogonal Final (14)');
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Nac. 1.ª Vta (1–13)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Nac. 2.ª Vta (14–26)');

  // Copa de la Paz reconciliation (14 PJ — 1.º Grupo A, 22 pts, 28:9 +19 DG)
  const copaPazMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(copaPazMatches.length, 14);
  assert.deepEqual(computeJuniorMatchArchiveSummary(copaPazMatches), {
    pj: 14,
    pg: 11,
    pe: 0,
    pp: 3,
    gf: 28,
    gc: 9,
    dg: 19,
    pts: 22,
  });

  // Serie Extra Bonificación reconciliation (2 PJ vs América de Cali: 0-1 & 0-2)
  const serieExtraMatches = filterMatchArchiveFixtures(matches, { lap: 'desempate' });
  assert.equal(serieExtraMatches.length, 2);
  assert.deepEqual(computeJuniorMatchArchiveSummary(serieExtraMatches), {
    pj: 2,
    pg: 0,
    pe: 0,
    pp: 2,
    gf: 0,
    gc: 3,
    dg: -3,
    pts: 0,
  });

  // Torneo Nacional reconciliation (26 PJ — 3.º lugar, 31 pts, 34:31 +3 DG)
  const nacionalMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(nacionalMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 13);
  const juniorNacRow = t1984.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(nacionalMatches), {
    pj: juniorNacRow.pj,
    pg: juniorNacRow.pg,
    pe: juniorNacRow.pe,
    pp: juniorNacRow.pp,
    gf: juniorNacRow.gf,
    gc: juniorNacRow.gc,
    dg: juniorNacRow.dg,
    pts: juniorNacRow.pts,
  });

  // Octogonal Final reconciliation (14 PJ — 5.º lugar, 13 pts en cancha + 1.25 bonif = 14.25)
  const octogonalMatches = filterMatchArchiveFixtures(matches, { lap: 'octogonal' });
  assert.equal(octogonalMatches.length, 14);
  const juniorOctRow = t1984.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(octogonalMatches), {
    pj: juniorOctRow.pj,
    pg: juniorOctRow.pg,
    pe: juniorOctRow.pe,
    pp: juniorOctRow.pp,
    gf: juniorOctRow.gf,
    gc: juniorOctRow.gc,
    dg: juniorOctRow.dg,
    pts: juniorOctRow.pts - 1.25, // 13 on-pitch points + 1.25 bonus = 14.25
  });

  // Combined 56-match 1984 season total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 56,
    pg: 28,
    pe: 10,
    pp: 18,
    gf: 73,
    gc: 58,
    dg: 15,
    pts: 66,
  });

  // 13 distinct rivals across the 1984 season
  assert.equal(getMatchArchiveOpponents(matches).length, 13);

  // Fase Final + Bonificación playoffMatches: 60 clean official matches (4 Serie Extra + 56 Octogonal Final)
  const pms = t1984.playoffMatches || [];
  assert.equal(pms.length, 60, 'Expected 60 Fase Final / Bonificación playoff matches in 1984');
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados'), `Unexpected Resultados dump row: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
  }

  const bonuses: Record<string, number> = {
    'América de Cali': 2,
    'Millonarios F.C': 0.25,
    'Independiente Medellín': 0,
    'Deportes Tolima': 0.25,
    'Junior de Barranquilla': 1.25,
    'Atlético Bucaramanga': 0,
    'Atlético Nacional': 1.25,
    'Unión Magdalena': 0,
  };
  const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of pms.slice(4)) {
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = check.get(pm.homeTeam)!;
    const a = check.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  for (const row of t1984.rows) {
    const c = check.get(row.team)!;
    assert.ok(c, `Missing club in 1984 Octogonal Final playoffMatches: ${row.team}`);
    assert.deepEqual(
      { ...c, pts: c.pts + (bonuses[row.team] ?? 0) },
      {
        pj: row.pj,
        pg: row.pg,
        pe: row.pe,
        pp: row.pp,
        gf: row.gf,
        gc: row.gc,
        pts: row.pts,
      }
    );
  }
});

test('1985 Campeonato Colombiano: Junior 56-match archive (Copa de la Paz Campeón + Serie Extra + Torneo Nacional + Octogonal Final) and 60 Fase Final matches reconcile 100%', () => {
  const t1985 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1985-octogonal')!;
  assert.ok(t1985, '1985-octogonal tournament must exist');

  const matches = t1985.matchArchive || [];
  assert.equal(matches.length, 56, 'Expected 56 official Junior matches in 1985');

  matches.forEach((m, idx) => {
    assert.ok(
      m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla',
      `Match ${idx} does not involve Junior: ${m.homeTeam} vs ${m.awayTeam}`
    );
    assert.ok(
      !m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'),
      `Trailing period in Millonarios name at index ${idx}`
    );
    assert.ok(m.date && m.date.trim().length > 0, `Missing date/vuelta label at index ${idx}`);
    assert.ok(!m.note || !m.note.startsWith('★'), `Unexpected duplicate leading star in note at index ${idx}`);
    if (idx < 14) {
      assert.equal(m.round, `Copa de la Paz · Fecha ${idx + 1}`);
    } else if (idx === 14) {
      assert.equal(m.round, 'Serie Extra · Ida');
    } else if (idx === 15) {
      assert.equal(m.round, 'Serie Extra · Vuelta');
    } else if (idx < 42) {
      assert.equal(m.round, `Torneo Nacional · Fecha ${idx - 15}`);
    } else {
      assert.equal(m.round, `Octogonal Final · Fecha ${idx - 41}`);
    }
  });

  // 7 lap filter options for 56-match 1985 structure
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', 'desempate', 'finalizacion', 'octogonal', '3', '4']
  );
  assert.equal(lapOpts.find((o) => o.id === 'apertura')?.label, 'Copa de la Paz (14)');
  assert.equal(lapOpts.find((o) => o.id === 'desempate')?.label, 'Serie Extra (2)');
  assert.equal(lapOpts.find((o) => o.id === 'finalizacion')?.label, 'Torneo Nacional (26)');
  assert.equal(lapOpts.find((o) => o.id === 'octogonal')?.label, 'Octogonal Final (14)');
  assert.equal(lapOpts.find((o) => o.id === '3')?.label, 'Nac. 1.ª Vta (1–13)');
  assert.equal(lapOpts.find((o) => o.id === '4')?.label, 'Nac. 2.ª Vta (14–26)');

  // Copa de la Paz reconciliation (14 PJ — 1.º Grupo B, 20 pts, 31:14 +17 DG)
  const copaPazMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  assert.equal(copaPazMatches.length, 14);
  assert.deepEqual(computeJuniorMatchArchiveSummary(copaPazMatches), {
    pj: 14,
    pg: 9,
    pe: 2,
    pp: 3,
    gf: 31,
    gc: 14,
    dg: 17,
    pts: 20,
  });

  // Serie Extra Copa de la Paz reconciliation (2 PJ vs DIM: 0-0 & 2-0 -> Campeón +1.00 bonif)
  const serieExtraMatches = filterMatchArchiveFixtures(matches, { lap: 'desempate' });
  assert.equal(serieExtraMatches.length, 2);
  assert.deepEqual(computeJuniorMatchArchiveSummary(serieExtraMatches), {
    pj: 2,
    pg: 1,
    pe: 1,
    pp: 0,
    gf: 2,
    gc: 0,
    dg: 2,
    pts: 3,
  });

  // Torneo Nacional reconciliation (26 PJ — 22 pts, 37:33 +4 DG)
  const nacionalMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(nacionalMatches.length, 26);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '3' }).length, 13);
  assert.equal(filterMatchArchiveFixtures(matches, { lap: '4' }).length, 13);
  assert.deepEqual(computeJuniorMatchArchiveSummary(nacionalMatches), {
    pj: 26,
    pg: 9,
    pe: 4,
    pp: 13,
    gf: 37,
    gc: 33,
    dg: 4,
    pts: 22,
  });

  // Reclasificación Regular 40-fecha reconciliation (Copa de la Paz + Torneo Nacional = t1985.regularRows Junior)
  const juniorRegRow = t1985.regularRows!.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...copaPazMatches, ...nacionalMatches]), {
    pj: juniorRegRow.pj,
    pg: juniorRegRow.pg,
    pe: juniorRegRow.pe,
    pp: juniorRegRow.pp,
    gf: juniorRegRow.gf,
    gc: juniorRegRow.gc,
    dg: juniorRegRow.dg,
    pts: juniorRegRow.pts,
  });

  // Octogonal Final reconciliation (14 PJ — 4.º lugar, 16 pts en cancha + 1.00 bonif = 17.00)
  const octogonalMatches = filterMatchArchiveFixtures(matches, { lap: 'octogonal' });
  assert.equal(octogonalMatches.length, 14);
  const juniorOctRow = t1985.rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(octogonalMatches), {
    pj: juniorOctRow.pj,
    pg: juniorOctRow.pg,
    pe: juniorOctRow.pe,
    pp: juniorOctRow.pp,
    gf: juniorOctRow.gf,
    gc: juniorOctRow.gc,
    dg: juniorOctRow.dg,
    pts: juniorOctRow.pts - 1, // 16 on-pitch points + 1.00 bonus = 17.00
  });

  // Combined 56-match 1985 season total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 56,
    pg: 24,
    pe: 13,
    pp: 19,
    gf: 90,
    gc: 64,
    dg: 26,
    pts: 61,
  });

  // 13 distinct rivals across the 1985 season
  assert.equal(getMatchArchiveOpponents(matches).length, 13);

  // Fase Final + Bonificación playoffMatches: 60 clean official matches (4 Serie Extra + 56 Octogonal Final)
  const pms = t1985.playoffMatches || [];
  assert.equal(pms.length, 60, 'Expected 60 Fase Final / Bonificación playoff matches in 1985');
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados'), `Unexpected Resultados dump row: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
  }

  const bonuses: Record<string, number> = {
    'América de Cali': 1.5,
    'Deportivo Cali': 1,
    'Millonarios F.C': 0,
    'Junior de Barranquilla': 1,
    'Independiente Medellín': 0.75,
    'Atlético Nacional': 0.5,
    'Unión Magdalena': 0,
    'Atlético Bucaramanga': 0,
  };
  const check = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of pms.slice(4)) {
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!check.has(club)) check.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = check.get(pm.homeTeam)!;
    const a = check.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  for (const row of t1985.rows) {
    const c = check.get(row.team)!;
    assert.ok(c, `Missing club in 1985 Octogonal Final playoffMatches: ${row.team}`);
    assert.deepEqual(
      { ...c, pts: c.pts + (bonuses[row.team] ?? 0) },
      {
        pj: row.pj,
        pg: row.pg,
        pe: row.pe,
        pp: row.pp,
        gf: row.gf,
        gc: row.gc,
        pts: row.pts,
      }
    );
  }
});

test('1986 Campeonato Colombiano: official RSSSF tables (Finalización + Reclasificación + Octogonal) and cleaned verified matches exclude non-league friendlies and raw Wikipedia dump artifacts', () => {
  const t1986 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1986-octogonal')!;
  assert.ok(t1986 && t1986.regularRows && t1986.secondaryRegularTable && t1986.rows);

  // Regular phase = Torneo "Edmer Tamayo Marín" (Finalización 26 fechas, GF == GC == 404)
  assert.equal(t1986.regularRows.length, 14);
  const finGF = t1986.regularRows.reduce((s, r) => s + r.gf, 0);
  const finGC = t1986.regularRows.reduce((s, r) => s + r.gc, 0);
  assert.equal(finGF, 404);
  assert.equal(finGC, 404);
  for (const r of t1986.regularRows) {
    assert.equal(r.pg + r.pe + r.pp, r.pj);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }

  // Secondary regular table = Reclasificación Regular 1986 (42/40 fechas); Top 8 match Octogonal Final clubs exactly
  const reclas = t1986.secondaryRegularTable.rows;
  assert.equal(reclas.length, 14);
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pg + r.pe + r.pp, r.pj);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
    if (i > 0) {
      assert.ok(
        reclas[i - 1].pts > r.pts || (reclas[i - 1].pts === r.pts && reclas[i - 1].pg >= r.pg),
        `1986 Reclasificación sort error at pos ${r.pos}: ${r.team}`
      );
    }
  }
  const top8Reclas = new Set(reclas.slice(0, 8).map((r) => r.team));
  const octogonalTeams = new Set(t1986.rows.map((r) => r.team));
  assert.deepEqual(top8Reclas, octogonalTeams);
  const juniorReclas = reclas.find((r) => r.isJunior)!;
  assert.equal(juniorReclas.pos, 4);
  assert.equal(juniorReclas.pts, 47);

  // Cleaned 21 partial Octogonal Final playoffMatches (no "Resultados", no "Millonarios F.C.", no "Caldas" shorthand)
  const pms = t1986.playoffMatches || [];
  assert.equal(pms.length, 21);
  for (const pm of pms) {
    assert.match(pm.stage, /^Octogonal Final · Fecha \d+$/);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    assert.ok(pm.homeTeam !== 'Caldas' && pm.awayTeam !== 'Caldas');
  }

  // Cleaned 7 verified official Primera A Junior matches (zero friendlies, zero leading stars, chronological Fecha 5..8)
  const matches = t1986.matchArchive || [];
  assert.equal(matches.length, 7);
  for (const m of matches) {
    assert.ok(m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla');
    assert.ok(!m.homeTeam.includes('Uruguay') && !m.awayTeam.includes('Uruguay'));
    assert.ok(!m.homeTeam.includes('Cristal Caldas') && !m.awayTeam.includes('Cristal Caldas'));
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in 1986 matchArchive: ${m.note}`);
  }
  assert.deepEqual(
    matches.slice(3).map((m) => m.round),
    ['Octogonal · Fecha 5', 'Octogonal · Fecha 6', 'Octogonal · Fecha 7', 'Octogonal · Fecha 8']
  );
});

test('1987 Campeonato Colombiano: corrected Reclasificación sorting & DIM GF, official Finalización sub-table, and cleaned verified match archive without synthetic summary cards', () => {
  const t1987 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1987-octogonal')!;
  assert.ok(t1987 && t1987.regularRows && t1987.secondaryRegularTable && t1987.rows);

  assert.equal(t1987.championTeam, 'Millonarios F.C');
  assert.equal(getRowStatusBadge(t1987, t1987.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1987, t1987.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // Reclasificación Regular 1987 (42/40 fechas): strictly sorted by pts desc, then PG desc
  const reclas = t1987.regularRows;
  assert.equal(reclas.length, 14);
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pg + r.pe + r.pp, r.pj);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
    if (i > 0) {
      assert.ok(
        reclas[i - 1].pts > r.pts || (reclas[i - 1].pts === r.pts && reclas[i - 1].pg >= r.pg),
        `1987 Reclasificación sort error at pos ${r.pos}: ${r.team}`
      );
    }
  }
  // Verify DIM GF/DG fix (17 Apertura + 28 Finalización = 45 GF, -14 DG) and bottom-3 order
  const dim = reclas.find((r) => r.team === 'Independiente Medellín')!;
  assert.equal(dim.pos, 8);
  assert.equal(dim.gf, 45);
  assert.equal(dim.gc, 59);
  assert.equal(dim.dg, -14);
  assert.deepEqual(
    reclas.slice(11).map((r) => ({ pos: r.pos, team: r.team, pts: r.pts })),
    [
      { pos: 12, team: 'Cúcuta Deportivo', pts: 27 },
      { pos: 13, team: 'Unión Magdalena', pts: 27 },
      { pos: 14, team: 'Once Caldas', pts: 25 },
    ]
  );
  const top8Reclas = new Set(reclas.slice(0, 8).map((r) => r.team));
  const octogonalTeams = new Set(t1987.rows.map((r) => r.team));
  assert.deepEqual(top8Reclas, octogonalTeams);

  // Secondary regular table = Torneo "Carlos Arturo Mejía" (Finalización 26 fechas, GF == GC == 437)
  const fin = t1987.secondaryRegularTable.rows;
  assert.equal(fin.length, 14);
  assert.equal(fin.reduce((s, r) => s + r.gf, 0), 437);
  assert.equal(fin.reduce((s, r) => s + r.gc, 0), 437);
  const juniorFin = fin.find((r) => r.isJunior)!;
  assert.equal(juniorFin.pos, 8);
  assert.equal(juniorFin.pts, 28);
  assert.equal(juniorFin.gf, 38);
  assert.equal(juniorFin.gc, 29);

  // Cleaned matchArchive & playoffMatches: zero synthetic summary cards, canonical club names
  const matches = t1987.matchArchive || [];
  assert.equal(matches.length, 1);
  assert.equal(matches[0].homeTeam, 'Millonarios F.C');
  assert.equal(matches[0].awayTeam, 'Junior de Barranquilla');
  assert.equal(matches[0].homeScore, 1);
  assert.equal(matches[0].awayScore, 0);
  assert.equal(matches[0].date, '20 de diciembre de 1987');
  assert.deepEqual(getMatchArchiveOpponents(matches), ['Millonarios F.C']);
  assert.equal(t1987.playoffMatches?.length, 1);
  assert.equal(t1987.playoffMatches?.[0].homeTeam, 'Millonarios F.C');
});

test('1988 Campeonato Colombiano: 15-club Reclasificación & Finalización sub-table, 56 reconciled Octogonal playoffMatches, and 36 verified Junior matches across Pentagonales, Triangulares, Finalización, and Octogonal Final', () => {
  const t1988 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1988-octogonal')!;
  assert.ok(t1988 && t1988.regularRows && t1988.secondaryRegularTable && t1988.rows);

  assert.equal(t1988.championTeam, 'Millonarios F.C');
  assert.equal(getRowStatusBadge(t1988, t1988.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1988, t1988.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // Reclasificación Regular 1988 (40 fechas · 15 clubes); Top 8 match Octogonal Final clubs
  const reclas = t1988.regularRows;
  assert.equal(reclas.length, 15);
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 40);
    assert.equal(r.pg + r.pe + r.pp, 40);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }
  const top8Reclas = new Set(reclas.slice(0, 8).map((r) => r.team));
  const octogonalTeams = new Set(t1988.rows.map((r) => r.team));
  assert.deepEqual(top8Reclas, octogonalTeams);

  // Secondary regular table = Torneo Nacional / Finalización 1988 (28 fechas · 15 clubes, zero-sum GF == GC == 516)
  const fin = t1988.secondaryRegularTable.rows;
  assert.equal(fin.length, 15);
  assert.equal(fin.reduce((s, r) => s + r.gf, 0), 516);
  assert.equal(fin.reduce((s, r) => s + r.gc, 0), 516);
  const juniorFin = fin.find((r) => r.isJunior)!;
  assert.equal(juniorFin.pos, 4);
  assert.equal(juniorFin.pj, 28);
  assert.equal(juniorFin.pg, 12);
  assert.equal(juniorFin.pe, 9);
  assert.equal(juniorFin.pp, 7);
  assert.equal(juniorFin.gf, 46);
  assert.equal(juniorFin.gc, 28);
  assert.equal(juniorFin.dg, 18);
  assert.equal(juniorFin.pts, 33);

  // Cleaned 56 Octogonal Final playoffMatches reconcile 100% across all 8 clubs against rows (excluding bonus)
  const pms = t1988.playoffMatches || [];
  assert.equal(pms.length, 56);
  const octCheck = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const pm of pms) {
    assert.match(pm.stage, /^Octogonal · Fecha (?:[1-9]|1[0-4])$/);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
    for (const club of [pm.homeTeam, pm.awayTeam]) {
      if (!octCheck.has(club)) octCheck.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    const h = octCheck.get(pm.homeTeam)!;
    const a = octCheck.get(pm.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += pm.homeScore; h.gc += pm.awayScore;
    a.gf += pm.awayScore; a.gc += pm.homeScore;
    if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
    else { a.pg++; a.pts += 2; h.pp++; }
  }
  const expectedBonus: Record<string, number> = {
    'Millonarios F.C': 1.5,
    'Atlético Nacional': 1.5,
    'América de Cali': 0.75,
    'Independiente Santa Fe': 0.75,
    'Junior de Barranquilla': 0.25,
    'Deportivo Pereira': 0,
    'Deportes Quindío': 0,
    'Cúcuta Deportivo': 0,
  };
  for (const row of t1988.rows) {
    const c = octCheck.get(row.team)!;
    assert.ok(c, `Missing club in 1988 Octogonal playoffMatches: ${row.team}`);
    assert.deepEqual(c, {
      pj: row.pj,
      pg: row.pg,
      pe: row.pe,
      pp: row.pp,
      gf: row.gf,
      gc: row.gc,
      pts: Number((row.pts - expectedBonus[row.team]).toFixed(2)),
    });
  }

  // Cleaned 36 verified Junior matches in matchArchive + stage filter pills
  const matches = t1988.matchArchive || [];
  assert.equal(matches.length, 36);
  for (const m of matches) {
    assert.ok(m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla');
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in 1988 matchArchive: ${m.note}`);
  }

  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => o.id),
    ['all', 'apertura', '1', '2', 'finalizacion', 'octogonal']
  );

  // Pentagonal Grupo C (8 PJ) reconciles 100% against RSSSF (2-2-4, 5-9, 6 pts)
  const pentMatches = filterMatchArchiveFixtures(matches, { lap: '1' });
  assert.equal(pentMatches.length, 8);
  assert.deepEqual(computeJuniorMatchArchiveSummary(pentMatches), {
    pj: 8, pg: 2, pe: 2, pp: 4, gf: 5, gc: 9, dg: -4, pts: 6,
  });

  // Triangular Grupo D (4 PJ) reconciles 100% against RSSSF (2-0-2, 5-5, 4 pts)
  const triMatches = filterMatchArchiveFixtures(matches, { lap: '2' });
  assert.equal(triMatches.length, 4);
  assert.deepEqual(computeJuniorMatchArchiveSummary(triMatches), {
    pj: 4, pg: 2, pe: 0, pp: 2, gf: 5, gc: 5, dg: 0, pts: 4,
  });

  // Combined Apertura (12 PJ) & verified Finalización subset (10 PJ, incl. Valenciano 2-1 debut & 3-0 Sporting)
  assert.equal(filterMatchArchiveFixtures(matches, { lap: 'apertura' }).length, 12);
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(finMatches.length, 10);
  const valencianoDebut = finMatches.find((m) => m.date === '23 oct 1988')!;
  assert.ok(valencianoDebut);
  assert.equal(valencianoDebut.homeTeam, 'Independiente Santa Fe');
  assert.equal(valencianoDebut.homeScore, 2);
  assert.equal(valencianoDebut.awayScore, 1);

  // Octogonal Final (14 PJ) reconciles 100% against RSSSF (4-6-4, 15-15, 14 pts in cancha + 0.25 bonus)
  const octMatches = filterMatchArchiveFixtures(matches, { lap: 'octogonal' });
  assert.equal(octMatches.length, 14);
  assert.deepEqual(computeJuniorMatchArchiveSummary(octMatches), {
    pj: 14, pg: 4, pe: 6, pp: 4, gf: 15, gc: 15, dg: 0, pts: 14,
  });
});

test('1989 Campeonato Colombiano (Desierto): 15-club Reclasificación & Apertura zero-sum tables, Cuadrangular A/B & Repechaje (32 reconciled playoffMatches), and 34 verified Junior matches across Apertura, Finalización, and Cuadrangular A', () => {
  const t1989 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1989-desierto')!;
  assert.ok(t1989 && t1989.regularRows && t1989.secondaryRegularTable && t1989.finalGroups);

  // Reclasificación Regular 1989 (28 PJ · 15 clubes · zero-sum GF == GC == 444, Pereira 35-33 fixed)
  const reclas = t1989.regularRows;
  assert.equal(reclas.length, 15);
  assert.equal(reclas.reduce((s, r) => s + r.gf, 0), 444);
  assert.equal(reclas.reduce((s, r) => s + r.gc, 0), 444);
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 28);
    assert.equal(r.pg + r.pe + r.pp, 28);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }
  const pereiraRec = reclas.find((r) => r.team === 'Deportivo Pereira')!;
  assert.equal(pereiraRec.gf, 35);
  assert.equal(pereiraRec.gc, 33);
  assert.equal(pereiraRec.dg, 2);

  // Secondary regular table = Torneo Apertura 1989 (14 PJ · 15 clubes · zero-sum GF == GC == 223, Tolima DG -8 fixed)
  const apTable = t1989.secondaryRegularTable.rows;
  assert.equal(apTable.length, 15);
  assert.equal(apTable.reduce((s, r) => s + r.gf, 0), 223);
  assert.equal(apTable.reduce((s, r) => s + r.gc, 0), 223);
  for (const r of apTable) {
    assert.equal(r.pj, 14);
    assert.equal(r.pg + r.pe + r.pp, 14);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }
  const tolimaAp = apTable.find((r) => r.team === 'Deportes Tolima')!;
  assert.equal(tolimaAp.dg, -8);

  // Fase Final groups: Cuadrangular A, Cuadrangular B, and Repechaje (NOT mislabeled as Cuadrangular Final)
  assert.equal(t1989.finalGroups.length, 3);
  assert.match(t1989.finalGroups[0].groupName, /Cuadrangular Semifinal · Grupo A/);
  assert.match(t1989.finalGroups[1].groupName, /Cuadrangular Semifinal · Grupo B/);
  assert.match(t1989.finalGroups[2].groupName, /^Repechaje/);
  assert.ok(!t1989.finalGroups[2].groupName.includes('Cuadrangular Final'));

  // Cleaned 32 playoffMatches (12 Cuad. A + 12 Cuad. B + 8 Repechaje Fechas 1–4) reconcile 100% against all 3 finalGroups
  const pms = t1989.playoffMatches || [];
  assert.equal(pms.length, 32);
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Resultados') && !pm.stage.includes('Clasificación'), `Dirty stage: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
  }

  const tallyGroup = (slice: typeof pms) => {
    const map = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const pm of slice) {
      for (const club of [pm.homeTeam, pm.awayTeam]) {
        if (!map.has(club)) map.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      }
      const h = map.get(pm.homeTeam)!;
      const a = map.get(pm.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += pm.homeScore; h.gc += pm.awayScore;
      a.gf += pm.awayScore; a.gc += pm.homeScore;
      if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
      else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
      else { a.pg++; a.pts += 2; h.pp++; }
    }
    return map;
  };

  const slices = [pms.slice(0, 12), pms.slice(12, 24), pms.slice(24, 32)];
  slices.forEach((slice, gIdx) => {
    const stats = tallyGroup(slice);
    for (const row of t1989.finalGroups![gIdx].rows) {
      const c = stats.get(row.team)!;
      assert.ok(c, `Missing club ${row.team} in 1989 finalGroup ${gIdx}`);
      assert.deepEqual(c, {
        pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts,
      });
    }
  });

  // Junior 34-match archive (14 Apertura + 14 Finalización + 6 Cuadrangular Semifinal A)
  const matches = t1989.matchArchive || [];
  assert.equal(matches.length, 34);
  for (const m of matches) {
    assert.ok(m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla');
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in 1989 matchArchive: ${m.note}`);
    assert.ok(m.date && m.date.trim().length > 0);
  }

  // 1989 stage filter pills & 1951 34-match 2-vuelta regression safety
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => ({ id: o.id, label: o.label })),
    [
      { id: 'all', label: 'Todas (34)' },
      { id: 'apertura', label: 'Apertura (14)' },
      { id: 'finalizacion', label: 'Finalización (14)' },
      { id: 'semifinal', label: 'Cuadrangular A (6)' },
    ]
  );

  const t1951 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1951-dorado')!;
  assert.ok(t1951 && t1951.matchArchive && t1951.matchArchive.length === 34);
  const lapOpts1951 = getMatchArchiveLapOptions(t1951.matchArchive.length, t1951.matchArchive);
  assert.deepEqual(
    lapOpts1951.map((o) => o.id),
    ['all', '1', '2']
  );

  // Reconcile Apertura (14 PJ), Finalización (14 PJ), Reclasificación (28 PJ), and Cuadrangular A (6 PJ)
  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const cuadMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  assert.equal(apMatches.length, 14);
  assert.equal(finMatches.length, 14);
  assert.equal(cuadMatches.length, 6);

  const juniorApRow = apTable.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(apMatches), {
    pj: juniorApRow.pj, pg: juniorApRow.pg, pe: juniorApRow.pe, pp: juniorApRow.pp,
    gf: juniorApRow.gf, gc: juniorApRow.gc, dg: juniorApRow.dg, pts: juniorApRow.pts,
  });

  assert.deepEqual(computeJuniorMatchArchiveSummary(finMatches), {
    pj: 14, pg: 4, pe: 5, pp: 5, gf: 13, gc: 15, dg: -2, pts: 13,
  });

  const juniorRecRow = reclas.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary([...apMatches, ...finMatches]), {
    pj: juniorRecRow.pj, pg: juniorRecRow.pg, pe: juniorRecRow.pe, pp: juniorRecRow.pp,
    gf: juniorRecRow.gf, gc: juniorRecRow.gc, dg: juniorRecRow.dg, pts: juniorRecRow.pts,
  });

  const juniorCuadRow = t1989.finalGroups[0].rows.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(cuadMatches), {
    pj: juniorCuadRow.pj, pg: juniorCuadRow.pg, pe: juniorCuadRow.pe, pp: juniorCuadRow.pp,
    gf: juniorCuadRow.gf, gc: juniorCuadRow.gc, dg: juniorCuadRow.dg, pts: juniorCuadRow.pts,
  });

  // Combined 34-match 1989 campaign total
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 34, pg: 14, pe: 12, pp: 8, gf: 38, gc: 32, dg: 6, pts: 40,
  });
  assert.equal(getMatchArchiveOpponents(matches).length, 14);
});

test('1990 Campeonato Colombiano (Copa Mustang): 15-club Reclasificación & Apertura zero-sum tables, 36 reconciled Fase Final matches (incl. Nacional 7.50), and 40 verified Junior matches across Pentagonal C, Triangular B, and Finalización', () => {
  const t1990 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1990-reclasificacion')!;
  assert.ok(t1990 && t1990.regularRows && t1990.secondaryRegularTable && t1990.finalGroups);

  assert.equal(t1990.championTeam, 'América de Cali');
  assert.equal(getRowStatusBadge(t1990, t1990.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1990, t1990.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // Reclasificación Regular 1990 (40 PJ · 15 clubes · zero-sum GF == GC == 666)
  const reclas = t1990.regularRows;
  assert.equal(reclas.length, 15);
  assert.equal(reclas.reduce((s, r) => s + r.gf, 0), 666);
  assert.equal(reclas.reduce((s, r) => s + r.gc, 0), 666);
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 40);
    assert.equal(r.pg + r.pe + r.pp, 40);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }

  // Secondary regular table = Torneo Apertura 1990 (12 PJ · all 15 clubs incl. Sporting · zero-sum GF == GC == 203)
  const apTable = t1990.secondaryRegularTable.rows;
  assert.equal(apTable.length, 15);
  assert.equal(apTable.reduce((s, r) => s + r.gf, 0), 203);
  assert.equal(apTable.reduce((s, r) => s + r.gc, 0), 203);
  assert.ok(apTable.some((r) => r.team === 'Sporting de Barranquilla' && r.pos === 14));
  for (let i = 0; i < apTable.length; i++) {
    const r = apTable[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 12);
    assert.equal(r.pg + r.pe + r.pp, 12);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }

  // Cleaned 36 playoffMatches (12 Cuad. A + 12 Cuad. B + 12 Final) reconcile 100% against all 3 finalGroups + bonuses
  const pms = t1990.playoffMatches || [];
  assert.equal(pms.length, 36);
  for (const pm of pms) {
    assert.ok(!pm.stage.includes('Torneo Finalización'), `Regular match leaked into playoffMatches: ${pm.stage}`);
    assert.ok(!pm.stage.includes('Resultados'), `Dirty stage: ${pm.stage}`);
    assert.ok(!pm.homeTeam.includes('Millonarios F.C.') && !pm.awayTeam.includes('Millonarios F.C.'));
  }

  const bonuses: Record<string, number> = {
    'América de Cali': 2,
    'Independiente Santa Fe': 0.75,
    'Independiente Medellín': 0.75,
    'Atlético Nacional': 0.5,
    'Atlético Bucaramanga': 0.5,
    'Deportivo Cali': 0.25,
    'Deportes Quindío': 0,
    'Once Caldas': 0,
  };

  const tallyGroup = (slice: typeof pms) => {
    const map = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const pm of slice) {
      for (const club of [pm.homeTeam, pm.awayTeam]) {
        if (!map.has(club)) map.set(club, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
      }
      const h = map.get(pm.homeTeam)!;
      const a = map.get(pm.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += pm.homeScore; h.gc += pm.awayScore;
      a.gf += pm.awayScore; a.gc += pm.homeScore;
      if (pm.homeScore > pm.awayScore) { h.pg++; h.pts += 2; a.pp++; }
      else if (pm.homeScore === pm.awayScore) { h.pe++; h.pts++; a.pe++; a.pts++; }
      else { a.pg++; a.pts += 2; h.pp++; }
    }
    return map;
  };

  const slices = [pms.slice(0, 12), pms.slice(12, 24), pms.slice(24, 36)];
  slices.forEach((slice, gIdx) => {
    const stats = tallyGroup(slice);
    for (const row of t1990.finalGroups![gIdx].rows) {
      const c = stats.get(row.team)!;
      assert.ok(c, `Missing club ${row.team} in 1990 finalGroup ${gIdx}`);
      assert.deepEqual(
        { ...c, pts: Number((c.pts + (bonuses[row.team] ?? 0)).toFixed(2)) },
        { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts }
      );
    }
  });
  // Verify Nacional fixed to 3-1-2, 7.50 pts in Cuadrangular Final
  const nalFinal = t1990.rows.find((r) => r.team === 'Atlético Nacional')!;
  assert.equal(nalFinal.pg, 3);
  assert.equal(nalFinal.pe, 1);
  assert.equal(nalFinal.pp, 2);
  assert.equal(nalFinal.pts, 7.5);

  // Junior 40-match archive (8 Pentagonal C + 4 Triangular B + 28 Finalización), zero synthetic cards
  const matches = t1990.matchArchive || [];
  assert.equal(matches.length, 40);
  for (const m of matches) {
    assert.ok(m.homeTeam === 'Junior de Barranquilla' || m.awayTeam === 'Junior de Barranquilla');
    assert.ok(!m.awayTeam.includes('Fase Regional') && !m.awayTeam.includes('Todos contra Todos'));
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!m.note?.startsWith('★'), `Unexpected leading star in 1990 matchArchive: ${m.note}`);
    assert.ok(m.date && m.date.trim().length > 0);
  }

  // 7 stage filter pills for 40-match 1990 structure
  const lapOpts = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOpts.map((o) => ({ id: o.id, label: o.label })),
    [
      { id: 'all', label: 'Todas (40)' },
      { id: 'apertura', label: 'Apertura (12)' },
      { id: '1', label: 'Pentagonal C (8)' },
      { id: '2', label: 'Triangular B (4)' },
      { id: 'finalizacion', label: 'Finalización (28)' },
      { id: '3', label: 'Fin. 1.ª Vta (14)' },
      { id: '4', label: 'Fin. 2.ª Vta (14)' },
    ]
  );

  // Reconcile Pentagonal C (8), Triangular B (4), Apertura (12), Finalización (28 = 14 + 14), and Reclasificación (40)
  const pentMatches = filterMatchArchiveFixtures(matches, { lap: '1' });
  const triMatches = filterMatchArchiveFixtures(matches, { lap: '2' });
  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const fin1 = filterMatchArchiveFixtures(matches, { lap: '3' });
  const fin2 = filterMatchArchiveFixtures(matches, { lap: '4' });
  assert.equal(pentMatches.length, 8);
  assert.equal(triMatches.length, 4);
  assert.equal(apMatches.length, 12);
  assert.equal(finMatches.length, 28);
  assert.equal(fin1.length, 14);
  assert.equal(fin2.length, 14);

  const juniorApRow = apTable.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(apMatches), {
    pj: juniorApRow.pj, pg: juniorApRow.pg, pe: juniorApRow.pe, pp: juniorApRow.pp,
    gf: juniorApRow.gf, gc: juniorApRow.gc, dg: juniorApRow.dg, pts: juniorApRow.pts,
  });

  assert.deepEqual(computeJuniorMatchArchiveSummary(finMatches), {
    pj: 28, pg: 3, pe: 12, pp: 13, gf: 21, gc: 31, dg: -10, pts: 18,
  });

  const juniorRecRow = reclas.find((r) => r.isJunior)!;
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: juniorRecRow.pj, pg: juniorRecRow.pg, pe: juniorRecRow.pe, pp: juniorRecRow.pp,
    gf: juniorRecRow.gf, gc: juniorRecRow.gc, dg: juniorRecRow.dg, pts: juniorRecRow.pts,
  });

  assert.equal(getMatchArchiveOpponents(matches).length, 14);
});

test('1991 Campeonato Colombiano (Copa Mustang): 15-club Reclasificación & Finalización zero-sum tables, fixed Junior 6.00 pts & 12 reconciled Cuadrangular Final playoffMatches, and 14 verified Junior matches with 5 stage filter pills', () => {
  const t1991 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1991-cuadrangular')!;
  assert.ok(t1991 && t1991.regularRows && t1991.secondaryRegularTable && t1991.finalGroups);

  assert.equal(t1991.championTeam, 'Atlético Nacional');
  assert.equal(getRowStatusBadge(t1991, t1991.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1991, t1991.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // Reclasificación Regular 1991 (40 PJ · 15 clubes · zero-sum GF == GC == 773 · Junior 1.º 54 pts)
  const reclas = t1991.regularRows;
  assert.equal(reclas.length, 15);
  assert.equal(reclas[0].team, 'Junior de Barranquilla');
  assert.equal(reclas[0].pts, 54);
  assert.equal(reclas.reduce((s, r) => s + r.gf, 0), 773);
  assert.equal(reclas.reduce((s, r) => s + r.gc, 0), 773);
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 40);
    assert.equal(r.pg + r.pe + r.pp, 40);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }

  // Secondary regular table = Torneo Finalización 1991 (28 PJ · 15 clubes · zero-sum GF == GC == 543 · Junior 1.º 40 pts)
  const finTable = t1991.secondaryRegularTable.rows;
  assert.equal(finTable.length, 15);
  assert.equal(finTable[0].team, 'Junior de Barranquilla');
  assert.equal(finTable[0].pts, 40);
  assert.equal(finTable.reduce((s, r) => s + r.gf, 0), 543);
  assert.equal(finTable.reduce((s, r) => s + r.gc, 0), 543);
  for (let i = 0; i < finTable.length; i++) {
    const r = finTable[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 28);
    assert.equal(r.pg + r.pe + r.pp, 28);
    assert.equal(r.pg * 2 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
  }

  // Implicit Apertura = Reclasificación - Finalización must be zero-sum across all 15 clubs (230 GF == 230 GC)
  const finByTeam = new Map(finTable.map((r) => [r.team, r]));
  let apPg = 0, apPe = 0, apPp = 0, apGf = 0, apGc = 0;
  for (const r of reclas) {
    const f = finByTeam.get(r.team)!;
    assert.ok(f);
    assert.equal(r.pj - f.pj, 12);
    apPg += r.pg - f.pg;
    apPe += r.pe - f.pe;
    apPp += r.pp - f.pp;
    apGf += r.gf - f.gf;
    apGc += r.gc - f.gc;
  }
  assert.equal(apPg, apPp);
  assert.equal(apPe % 2, 0);
  assert.equal(apGf, 230);
  assert.equal(apGc, 230);

  // Junior Cuadrangular Final pts fixed to 6 (5 on pitch + 1.00 bonus), both in rows and finalGroups[2]
  const cuadFinalGroup = t1991.finalGroups[2];
  assert.equal(t1991.rows[2].team, 'Junior de Barranquilla');
  assert.equal(t1991.rows[2].pts, 6);
  assert.equal(cuadFinalGroup.rows[2].pts, 6);

  // All 3 finalGroups must be zero-sum
  for (const g of t1991.finalGroups) {
    assert.equal(g.rows.length, 4);
    assert.equal(g.rows.reduce((s, r) => s + r.pg, 0), g.rows.reduce((s, r) => s + r.pp, 0));
    assert.equal(g.rows.reduce((s, r) => s + r.gf, 0), g.rows.reduce((s, r) => s + r.gc, 0));
  }

  // All 12 Cuadrangular Final playoffMatches reconcile 100% against finalGroups[2] + bonuses
  const pms = t1991.playoffMatches || [];
  assert.equal(pms.length, 12);
  const bonuses: Record<string, number> = {
    'Atlético Nacional': 0.25,
    'América de Cali': 0.5,
    'Junior de Barranquilla': 1.0,
    'Independiente Santa Fe': 0.75,
  };
  const tally: Record<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }> = {};
  for (const r of cuadFinalGroup.rows) {
    tally[r.team] = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: bonuses[r.team] };
  }
  for (const m of pms) {
    tally[m.homeTeam].pj += 1;
    tally[m.awayTeam].pj += 1;
    tally[m.homeTeam].gf += m.homeScore;
    tally[m.homeTeam].gc += m.awayScore;
    tally[m.awayTeam].gf += m.awayScore;
    tally[m.awayTeam].gc += m.homeScore;
    if (m.homeScore > m.awayScore) {
      tally[m.homeTeam].pg += 1;
      tally[m.homeTeam].pts += 2;
      tally[m.awayTeam].pp += 1;
    } else if (m.homeScore < m.awayScore) {
      tally[m.awayTeam].pg += 1;
      tally[m.awayTeam].pts += 2;
      tally[m.homeTeam].pp += 1;
    } else {
      tally[m.homeTeam].pe += 1;
      tally[m.homeTeam].pts += 1;
      tally[m.awayTeam].pe += 1;
      tally[m.awayTeam].pts += 1;
    }
  }
  for (const r of cuadFinalGroup.rows) {
    const t = tally[r.team];
    assert.equal(t.pj, r.pj);
    assert.equal(t.pg, r.pg);
    assert.equal(t.pe, r.pe);
    assert.equal(t.pp, r.pp);
    assert.equal(t.gf, r.gf);
    assert.equal(t.gc, r.gc);
    assert.equal(t.pts, r.pts);
  }

  // Verified 14-match Junior archive: zero synthetic summary cards, 5 stage filter pills, 6/6 Cuadrangular Final 100% reconciled
  const matches = t1991.matchArchive || [];
  assert.equal(matches.length, 14);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(!/Fase Regional|Todos contra Todos|Grupo A \(/i.test(`${m.homeTeam} ${m.awayTeam}`));
    assert.ok(m.homeScore <= 9 && m.awayScore <= 9, `Synthetic score leaked: ${m.homeScore}-${m.awayScore}`);
    assert.ok(!(m.note || '').startsWith('★'));
  }

  assert.deepEqual(
    getMatchArchiveLapOptions(14, matches),
    [
      { id: 'all', label: 'Todas (14)' },
      { id: 'apertura', label: 'Apertura (3)' },
      { id: 'finalizacion', label: 'Finalización (2)' },
      { id: 'semifinal', label: 'Cuad. Semifinal A (3)' },
      { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
    ]
  );

  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const semiMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  const finalMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(apMatches.length, 3);
  assert.equal(finMatches.length, 2);
  assert.equal(semiMatches.length, 3);
  assert.equal(finalMatches.length, 6);

  // Junior's 6/6 Cuadrangular Final matches reconcile 100% against official Cuadrangular Final table (on-pitch 5 pts + 1.00 bonus = 6)
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalMatches), {
    pj: 6, pg: 2, pe: 1, pp: 3, gf: 10, gc: 9, dg: 1, pts: 5,
  });
});

test('1992 Campeonato Colombiano (Copa Mustang): 16-club Reclasificación & Finalización zero-sum tables, fixed Unión Magdalena DG (-6), 12 reconciled Cuadrangular Final playoffMatches, and 12 verified Junior matches with 5 stage filter pills', () => {
  const t1992 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1992-cuadrangular');
  assert.ok(t1992, '1992-cuadrangular tournament should exist');
  assert.equal(t1992.championTeam, 'América de Cali');

  // 16-club Reclasificación Regular (46 PJ, zero-sum)
  const recl = t1992.regularRows || [];
  assert.equal(recl.length, 16);
  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (const row of recl) {
    assert.equal(row.pj, 46);
    assert.equal(row.pg + row.pe + row.pp, 46);
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 2 + row.pe, row.pts);
    rPg += row.pg; rPe += row.pe; rPp += row.pp; rGf += row.gf; rGc += row.gc;
  }
  assert.equal(rPg, 241);
  assert.equal(rPp, 241);
  assert.equal(rPe, 254);
  assert.equal(rGf, 833);
  assert.equal(rGc, 833);
  const jrRecl = recl.find((r) => r.isJunior);
  assert.ok(jrRecl);
  assert.equal(jrRecl.pos, 4);
  assert.equal(jrRecl.pts, 54);
  assert.equal(jrRecl.gf, 76);

  // 16-club Finalización sub-table (30 PJ, zero-sum) & implicit Apertura (16 PJ, zero-sum)
  const finTable = t1992.secondaryRegularTable;
  assert.ok(finTable, '1992 should include official Torneo Finalización sub-table');
  assert.equal(finTable.rows.length, 16);
  let fPg = 0, fPe = 0, fPp = 0, fGf = 0, fGc = 0;
  for (const row of finTable.rows) {
    assert.equal(row.pj, 30);
    assert.equal(row.pg + row.pe + row.pp, 30);
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 2 + row.pe, row.pts);
    fPg += row.pg; fPe += row.pe; fPp += row.pp; fGf += row.gf; fGc += row.gc;
  }
  assert.equal(fPg, 164);
  assert.equal(fPp, 164);
  assert.equal(fPe, 152);
  assert.equal(fGf, 563);
  assert.equal(fGc, 563);
  const jrFin = finTable.rows.find((r) => r.isJunior);
  assert.ok(jrFin);
  assert.equal(jrFin.pos, 2);
  assert.equal(jrFin.pts, 38);
  assert.equal(jrFin.gf, 56);

  // Reclasificación - Finalización = Apertura (16 PJ, 77 PG = 77 PP, 102 PE, 270 GF = 270 GC)
  const finByTeam = new Map(finTable.rows.map((r) => [r.team, r]));
  let aPg = 0, aPe = 0, aPp = 0, aGf = 0, aGc = 0;
  for (const rRow of recl) {
    const fRow = finByTeam.get(rRow.team);
    assert.ok(fRow, `Missing Finalización row for ${rRow.team}`);
    const apPj = rRow.pj - fRow.pj;
    const apPg = rRow.pg - fRow.pg;
    const apPe = rRow.pe - fRow.pe;
    const apPp = rRow.pp - fRow.pp;
    const apGf = rRow.gf - fRow.gf;
    const apGc = rRow.gc - fRow.gc;
    assert.equal(apPj, 16);
    assert.equal(apPg + apPe + apPp, 16);
    assert.equal(apPg * 2 + apPe, rRow.pts - fRow.pts);
    aPg += apPg; aPe += apPe; aPp += apPp; aGf += apGf; aGc += apGc;
  }
  assert.equal(aPg, 77);
  assert.equal(aPp, 77);
  assert.equal(aPe, 102);
  assert.equal(aGf, 270);
  assert.equal(aGc, 270);

  // Fase Final groups: fix Unión Magdalena DG (-6) in Semifinal A + clean names + runner-up Nacional
  const groups = t1992.finalGroups || [];
  assert.equal(groups.length, 3);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');
  assert.equal(groups[2].groupName, 'Cuadrangular Final (América Campeón ★)');

  for (const grp of groups) {
    let gPg = 0, gPe = 0, gPp = 0, gGf = 0, gGc = 0;
    for (const r of grp.rows) {
      assert.equal(r.gf - r.gc, r.dg, `DG mismatch in ${grp.groupName} for ${r.team}`);
      gPg += r.pg; gPe += r.pe; gPp += r.pp; gGf += r.gf; gGc += r.gc;
    }
    assert.equal(gPg, gPp, `PG!=PP in ${grp.groupName}`);
    assert.equal(gGf, gGc, `GF!=GC in ${grp.groupName}`);
  }

  const umSemiA = groups[0].rows.find((r) => r.team === 'Unión Magdalena');
  assert.ok(umSemiA);
  assert.equal(umSemiA.dg, -6);

  assert.equal(getRowStatusBadge(t1992, t1992.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1992, t1992.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // All 12 Cuadrangular Final playoffMatches reconcile 100% with the 4-club final table + bonuses
  const playoffs = t1992.playoffMatches || [];
  assert.equal(playoffs.length, 12);
  const bonusMap: Record<string, number> = {
    'América de Cali': 1.0,
    'Atlético Nacional': 0.75,
    'Deportivo Cali': 1.0,
    'Junior de Barranquilla': 0.75,
  };
  const tally: Record<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }> = {};
  for (const team of Object.keys(bonusMap)) {
    tally[team] = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: bonusMap[team] };
  }
  for (const m of playoffs) {
    assert.ok(tally[m.homeTeam] && tally[m.awayTeam]);
    tally[m.homeTeam].pj += 1;
    tally[m.awayTeam].pj += 1;
    tally[m.homeTeam].gf += m.homeScore;
    tally[m.homeTeam].gc += m.awayScore;
    tally[m.awayTeam].gf += m.awayScore;
    tally[m.awayTeam].gc += m.homeScore;
    if (m.homeScore > m.awayScore) {
      tally[m.homeTeam].pg += 1; tally[m.homeTeam].pts += 2;
      tally[m.awayTeam].pp += 1;
    } else if (m.homeScore < m.awayScore) {
      tally[m.awayTeam].pg += 1; tally[m.awayTeam].pts += 2;
      tally[m.homeTeam].pp += 1;
    } else {
      tally[m.homeTeam].pe += 1; tally[m.homeTeam].pts += 1;
      tally[m.awayTeam].pe += 1; tally[m.awayTeam].pts += 1;
    }
  }
  for (const r of t1992.rows) {
    const t = tally[r.team];
    assert.equal(t.pj, r.pj);
    assert.equal(t.pg, r.pg);
    assert.equal(t.pe, r.pe);
    assert.equal(t.pp, r.pp);
    assert.equal(t.gf, r.gf);
    assert.equal(t.gc, r.gc);
    assert.equal(t.pts, r.pts);
  }

  // Verified 12-match Junior archive: exact dates (zero undated placeholders), 5 stage filter pills, 6/6 Cuadrangular Final 100% reconciled
  const matches = t1992.matchArchive || [];
  assert.equal(matches.length, 12);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(!/Noviembre\s*[–-]\s*Diciembre|^Diciembre de 1992$/i.test(m.date || ''), `Undated placeholder leaked: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'));
  }

  assert.deepEqual(
    getMatchArchiveLapOptions(12, matches),
    [
      { id: 'all', label: 'Todas (12)' },
      { id: 'apertura', label: 'Apertura (1)' },
      { id: 'finalizacion', label: 'Finalización (2)' },
      { id: 'semifinal', label: 'Cuad. Semifinal B (3)' },
      { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
    ]
  );

  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const semiMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  const finalMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(apMatches.length, 1);
  assert.equal(finMatches.length, 2);
  assert.equal(semiMatches.length, 3);
  assert.equal(finalMatches.length, 6);

  // Junior's 6/6 Cuadrangular Final matches reconcile 100% against official Cuadrangular Final table (on-pitch 0 pts + 0.75 bonus = 0.75)
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalMatches), {
    pj: 6, pg: 0, pe: 0, pp: 6, gf: 3, gc: 11, dg: -8, pts: 0,
  });
});

test('1993 Campeonato Colombiano (3ª Estrella ★): fixed 16-club Reclasificación (Junior 83-59, DIM 67-46, Cúcuta 21 PP) & Finalización sub-table, 16 playoffMatches (4 Apertura bonus + 12 reconciled Cuadrangular Final), and 11 dated Junior matches with 4 stage filter pills', () => {
  const t1993 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1993-cuadrangular');
  assert.ok(t1993, '1993-cuadrangular tournament should exist');
  assert.equal(t1993.championTeam, 'Junior de Barranquilla');
  assert.equal(t1993.isJuniorChampion, true);

  // 16-club Reclasificación Regular (44 PJ, PG == PP == 242, fixed DIM 67-46, Cúcuta 21 PP, Junior 83-59)
  const recl = t1993.regularRows || [];
  assert.equal(recl.length, 16);
  let rPg = 0, rPe = 0, rPp = 0;
  for (const row of recl) {
    assert.equal(row.pj, 44);
    assert.equal(row.pg + row.pe + row.pp, 44, `PJ mismatch for ${row.team}`);
    assert.equal(row.gf - row.gc, row.dg, `DG mismatch for ${row.team}`);
    assert.equal(row.pg * 2 + row.pe, row.pts, `PTS mismatch for ${row.team}`);
    rPg += row.pg; rPe += row.pe; rPp += row.pp;
  }
  assert.equal(rPg, 242);
  assert.equal(rPp, 242);
  assert.equal(rPe, 220);

  const jrRecl = recl.find((r) => r.isJunior);
  assert.ok(jrRecl);
  assert.equal(jrRecl.pos, 1);
  assert.equal(jrRecl.pts, 56);
  assert.equal(jrRecl.gf, 83);
  assert.equal(jrRecl.gc, 59);
  assert.equal(jrRecl.dg, 24);

  const dimRecl = recl.find((r) => r.team === 'Independiente Medellín');
  assert.ok(dimRecl);
  assert.equal(dimRecl.gf, 67);
  assert.equal(dimRecl.gc, 46);
  assert.equal(dimRecl.dg, 21);

  const cucRecl = recl.find((r) => r.team === 'Cúcuta Deportivo');
  assert.ok(cucRecl);
  assert.equal(cucRecl.pg, 12);
  assert.equal(cucRecl.pe, 11);
  assert.equal(cucRecl.pp, 21);
  assert.equal(cucRecl.pts, 35);

  // 16-club Finalización sub-table (30 PJ, PG == PP == 158) & exact Apertura diff (14 PJ, PG == PP == 84)
  const finTable = t1993.secondaryRegularTable;
  assert.ok(finTable, '1993 should include official Torneo Finalización sub-table');
  assert.equal(finTable.rows.length, 16);
  let fPg = 0, fPe = 0, fPp = 0;
  for (const row of finTable.rows) {
    assert.equal(row.pj, 30);
    assert.equal(row.pg + row.pe + row.pp, 30);
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 2 + row.pe, row.pts);
    fPg += row.pg; fPe += row.pe; fPp += row.pp;
  }
  assert.equal(fPg, 158);
  assert.equal(fPp, 158);
  assert.equal(fPe, 164);

  const jrFin = finTable.rows.find((r) => r.isJunior);
  assert.ok(jrFin);
  assert.equal(jrFin.pos, 2);
  assert.equal(jrFin.pts, 35);
  assert.equal(jrFin.gf, 57);

  const finByTeam = new Map(finTable.rows.map((r) => [r.team, r]));
  let aPg = 0, aPe = 0, aPp = 0;
  for (const rRow of recl) {
    const fRow = finByTeam.get(rRow.team);
    assert.ok(fRow, `Missing Finalización row for ${rRow.team}`);
    assert.equal(rRow.pj - fRow.pj, 14);
    const apPg = rRow.pg - fRow.pg;
    const apPe = rRow.pe - fRow.pe;
    const apPp = rRow.pp - fRow.pp;
    assert.equal(apPg + apPe + apPp, 14);
    assert.equal(apPg * 2 + apPe, rRow.pts - fRow.pts);
    aPg += apPg; aPe += apPe; aPp += apPp;
  }
  assert.equal(aPg, 84);
  assert.equal(aPp, 84);
  assert.equal(aPe, 56);

  // Fase Final groups: all 3 zero-sum, normalized names, Junior Campeón ★ & DIM Subcampeón 🥈
  const groups = t1993.finalGroups || [];
  assert.equal(groups.length, 3);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');
  assert.equal(groups[2].groupName, 'Cuadrangular Final (Junior Campeón ★ · 3ª Estrella)');
  for (const grp of groups) {
    let gPg = 0, gPp = 0, gGf = 0, gGc = 0;
    for (const r of grp.rows) {
      assert.equal(r.gf - r.gc, r.dg);
      gPg += r.pg; gPp += r.pp; gGf += r.gf; gGc += r.gc;
    }
    assert.equal(gPg, gPp);
    assert.equal(gGf, gGc);
  }
  assert.equal(getRowStatusBadge(t1993, t1993.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1993, t1993.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // 16 official playoffMatches: 4 Apertura bonus playoffs + 12 Cuadrangular Final matches reconciled 100%
  const playoffs = t1993.playoffMatches || [];
  assert.equal(playoffs.length, 16);
  const cfPlayoffs = playoffs.filter((m) => /^Cuad\. Final/i.test(m.stage));
  assert.equal(cfPlayoffs.length, 12);
  const tally: Record<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }> = {};
  for (const r of t1993.rows) {
    tally[r.team] = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
  }
  for (const m of cfPlayoffs) {
    assert.ok(tally[m.homeTeam] && tally[m.awayTeam]);
    tally[m.homeTeam].pj += 1;
    tally[m.awayTeam].pj += 1;
    tally[m.homeTeam].gf += m.homeScore;
    tally[m.homeTeam].gc += m.awayScore;
    tally[m.awayTeam].gf += m.awayScore;
    tally[m.awayTeam].gc += m.homeScore;
    if (m.homeScore > m.awayScore) {
      tally[m.homeTeam].pg += 1; tally[m.homeTeam].pts += 2;
      tally[m.awayTeam].pp += 1;
    } else if (m.homeScore < m.awayScore) {
      tally[m.awayTeam].pg += 1; tally[m.awayTeam].pts += 2;
      tally[m.homeTeam].pp += 1;
    } else {
      tally[m.homeTeam].pe += 1; tally[m.homeTeam].pts += 1;
      tally[m.awayTeam].pe += 1; tally[m.awayTeam].pts += 1;
    }
  }
  for (const r of t1993.rows) {
    const t = tally[r.team];
    assert.equal(t.pj, r.pj);
    assert.equal(t.pg, r.pg);
    assert.equal(t.pe, r.pe);
    assert.equal(t.pp, r.pp);
    assert.equal(t.gf, r.gf);
    assert.equal(t.gc, r.gc);
    assert.equal(t.pts, r.pts);
  }

  // Verified 11-match Junior archive: exact dates, zero leading ★, 4 stage filter pills, 6/6 Cuadrangular Final 100% reconciled
  const matches = t1993.matchArchive || [];
  assert.equal(matches.length, 11);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(!/^Diciembre de 1993$/i.test(m.date || ''), `Undated placeholder leaked: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'), `Leading star leaked: ${m.note}`);
  }

  assert.deepEqual(
    getMatchArchiveLapOptions(11, matches),
    [
      { id: 'all', label: 'Todas (11)' },
      { id: 'desempate', label: 'Desempate Apertura (2)' },
      { id: 'semifinal', label: 'Cuad. Semifinal A (3)' },
      { id: 'cuadrangular', label: 'Cuadrangular Final (6)' },
    ]
  );

  const desMatches = filterMatchArchiveFixtures(matches, { lap: 'desempate' });
  const semiMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  const finalMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(desMatches.length, 2);
  assert.equal(semiMatches.length, 3);
  assert.equal(finalMatches.length, 6);

  // Junior's 6/6 Cuadrangular Final matches reconcile 100% against official Cuadrangular Final table (3-1-2, 14-11, +3, 7 pts)
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalMatches), {
    pj: 6, pg: 3, pe: 1, pp: 2, gf: 14, gc: 11, dg: 3, pts: 7,
  });
});

test('1994 Campeonato Colombiano reconciles Reclasificación (46 PJ), Finalización (30 PJ), implicit Apertura (16 PJ), 3 Fase Final groups, 12/12 Cuadrangular Final matches, and 3 verified Junior Semifinal B matches', () => {
  const t1994 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1994-cuadrangular');
  assert.ok(t1994, '1994-cuadrangular table must exist');
  assert.equal(t1994.championTeam, 'Atlético Nacional');
  assert.equal(t1994.runnerUpTeam, 'Millonarios F.C');
  assert.ok(!t1994.description.includes('publicada en Wikipedia'));

  // 1. Reclasificación Regular (46 PJ, 16 clubs) — 100% zero-sum
  const reclas = t1994.regularRows || [];
  assert.equal(reclas.length, 16);
  let recPg = 0, recPe = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const r of reclas) {
    assert.equal(r.pj, 46);
    assert.equal(r.pg + r.pe + r.pp, 46, `${r.team} Reclasificación PJ mismatch`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Reclasificación DG mismatch`);
    assert.equal(r.pg * 2 + r.pe, r.pts, `${r.team} Reclasificación PTS mismatch`);
    recPg += r.pg; recPe += r.pe; recPp += r.pp; recGf += r.gf; recGc += r.gc;
  }
  assert.equal(recPg, 243);
  assert.equal(recPp, 243);
  assert.equal(recPe, 250);
  assert.equal(recGf, 981);
  assert.equal(recGc, 981);
  const junReclas = reclas.find((r) => r.isJunior)!;
  assert.equal(junReclas.pos, 5);
  assert.equal(junReclas.pts, 50);
  assert.equal(junReclas.gf, 67);
  assert.equal(junReclas.gc, 58);

  // 2. Secondary Regular Table: Torneo Finalización 1994 (30 PJ, 16 clubs) — 100% zero-sum
  const finTable = t1994.secondaryRegularTable;
  assert.ok(finTable && finTable.rows.length === 16);
  assert.ok(finTable.title.includes('Torneo Finalización 1994'));
  assert.ok(!(finTable.description || '').includes('Wikipedia'));
  let finPg = 0, finPe = 0, finPp = 0, finGf = 0, finGc = 0;
  for (const r of finTable.rows) {
    assert.equal(r.pj, 30);
    assert.equal(r.pg + r.pe + r.pp, 30, `${r.team} Finalización PJ mismatch`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Finalización DG mismatch`);
    assert.equal(r.pg * 2 + r.pe, r.pts, `${r.team} Finalización PTS mismatch`);
    finPg += r.pg; finPe += r.pe; finPp += r.pp; finGf += r.gf; finGc += r.gc;
  }
  assert.equal(finPg, 156);
  assert.equal(finPp, 156);
  assert.equal(finPe, 168);
  assert.equal(finGf, 657);
  assert.equal(finGc, 657);
  const junFin = finTable.rows.find((r) => r.isJunior)!;
  assert.equal(junFin.pos, 4);
  assert.equal(junFin.pts, 35);
  assert.equal(junFin.gf, 51);
  assert.equal(junFin.gc, 37);

  // 3. Implicit Torneo Apertura 1994 (Reclasificación - Finalización = 16 PJ) — 100% zero-sum for all 16 clubs
  const finByTeam = Object.fromEntries(finTable.rows.map((r) => [r.team, r]));
  let apPg = 0, apPe = 0, apPp = 0, apGf = 0, apGc = 0;
  for (const r of reclas) {
    const f = finByTeam[r.team];
    assert.ok(f, `Missing ${r.team} in Finalización 1994`);
    const pj = r.pj - f.pj;
    const pg = r.pg - f.pg;
    const pe = r.pe - f.pe;
    const pp = r.pp - f.pp;
    const gf = r.gf - f.gf;
    const gc = r.gc - f.gc;
    const pts = r.pts - f.pts;
    assert.equal(pj, 16, `${r.team} implicit Apertura PJ != 16`);
    assert.equal(pg + pe + pp, 16);
    assert.equal(pg * 2 + pe, pts);
    assert.ok(pg >= 0 && pe >= 0 && pp >= 0 && gf >= 0 && gc >= 0);
    apPg += pg; apPe += pe; apPp += pp; apGf += gf; apGc += gc;
  }
  assert.equal(apPg, 87);
  assert.equal(apPp, 87);
  assert.equal(apPe, 82);
  assert.equal(apGf, 324);
  assert.equal(apGc, 324);

  // 4. All 3 finalGroups normalized & 100% zero-sum
  const groups = t1994.finalGroups || [];
  assert.equal(groups.length, 3);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');
  assert.equal(groups[2].groupName, 'Cuadrangular Final (Atlético Nacional Campeón ★)');

  for (const g of groups) {
    assert.equal(g.rows.length, 4);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of g.rows) {
      assert.equal(r.pj, 6);
      assert.equal(r.pg + r.pe + r.pp, 6);
      assert.equal(r.gf - r.gc, r.dg);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `${g.groupName} PG != PP`);
    assert.equal(pe % 2, 0, `${g.groupName} PE odd`);
    assert.equal(gf, gc, `${g.groupName} GF != GC`);
  }

  // No contradiction between finalPhaseDescription and official Cuadrangular Final table (9.00, 8.50, 7.50, 3.50)
  assert.ok(t1994.finalPhaseDescription?.includes('9.00'));
  assert.ok(t1994.finalPhaseDescription?.includes('8.50'));
  assert.ok(t1994.finalPhaseDescription?.includes('7.50'));
  assert.ok(t1994.finalPhaseDescription?.includes('3.50'));
  assert.deepEqual(
    t1994.rows.map((r) => ({ team: r.team, pts: r.pts, gf: r.gf, gc: r.gc })),
    groups[2].rows.map((r) => ({ team: r.team, pts: r.pts, gf: r.gf, gc: r.gc }))
  );

  // Badges: Nacional Campeón ★, Millonarios Subcampeón 🥈
  assert.equal(getRowStatusBadge(t1994, t1994.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1994, t1994.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // 5. All 12/12 Cuadrangular Final playoffMatches dated & 100% reconciled with official table + bonuses
  const playoffs = t1994.playoffMatches || [];
  assert.equal(playoffs.length, 12);
  const bonuses: Record<string, number> = {
    'Atlético Nacional': 2.0,
    'Millonarios F.C': 1.5,
    'América de Cali': 0.5,
    'Independiente Medellín': 0.5,
  };
  const tally: Record<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }> = {};
  for (const r of t1994.rows) {
    tally[r.team] = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: bonuses[r.team] };
  }
  for (const m of playoffs) {
    assert.ok(m.date && /1994/.test(m.date), `Missing 1994 date on playoff match: ${m.stage}`);
    assert.ok(m.stage.startsWith('Cuad. Final · Fecha '), `Unexpected stage format: ${m.stage}`);
    const h = tally[m.homeTeam];
    const a = tally[m.awayTeam];
    assert.ok(h && a, `Unknown team in 1994 playoffMatches: ${m.homeTeam} vs ${m.awayTeam}`);
    h.pj++; a.pj++;
    h.gf += m.homeScore; h.gc += m.awayScore;
    a.gf += m.awayScore; a.gc += m.homeScore;
    if (m.homeScore > m.awayScore) { h.pg++; h.pts += 2; a.pp++; }
    else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 2; h.pp++; }
    else { h.pe++; a.pe++; h.pts += 1; a.pts += 1; }
  }
  for (const r of t1994.rows) {
    const t = tally[r.team];
    assert.equal(t.pj, r.pj);
    assert.equal(t.pg, r.pg);
    assert.equal(t.pe, r.pe);
    assert.equal(t.pp, r.pp);
    assert.equal(t.gf, r.gf);
    assert.equal(t.gc, r.gc);
    assert.equal(t.pts, r.pts);
  }

  // 6. Verified 3-match Junior Semifinal B archive (exact dates, zero fabrication, zero leading ★)
  const matches = t1994.matchArchive || [];
  assert.equal(matches.length, 3);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(/nov 1994$/i.test(m.date), `Expected exact Nov 1994 date: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'), `Leading star leaked: ${m.note}`);
  }
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches), {
    pj: 3, pg: 1, pe: 0, pp: 2, gf: 3, gc: 5, dg: -2, pts: 2,
  });
});

test('1995 Torneo Nivelación (4ª Estrella ★) reconciles 16-club 3-pt-per-win table, Cortuluá -2 pts deduction, Campeón/Subcampeón badges, and 5 primary-source verified Junior matches', () => {
  const t1995 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-nivelacion');
  assert.ok(t1995, '1995-nivelacion table must exist');
  assert.equal(t1995.championTeam, 'Junior de Barranquilla');
  assert.equal(t1995.runnerUpTeam, 'América de Cali');
  assert.equal(t1995.isJuniorChampion, true);
  assert.equal(t1995.hasFinalPhase, false);

  // Era-accurate points-per-win switch (1948-1994 => 2 pts, 1995+ => 3 pts)
  assert.equal(getTournamentPointsPerWin('1994'), 2);
  assert.equal(getTournamentPointsPerWin('1995'), 3);
  assert.equal(getTournamentPointsPerWin('1995/96'), 3);
  assert.equal(getTournamentPointsPerWin(199401), 2);
  assert.equal(getTournamentPointsPerWin(199501), 3);

  // 1. Official 16-club single table (30 PJ, 3 pts/win + Cortuluá -2 pts) — 100% zero-sum
  const regular = t1995.regularRows || [];
  assert.equal(regular.length, 16);
  let sumPg = 0, sumPe = 0, sumPp = 0, sumGf = 0, sumGc = 0;
  for (const r of regular) {
    assert.equal(r.pj, 30);
    assert.equal(r.pg + r.pe + r.pp, 30, `${r.team} PJ mismatch`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} DG mismatch`);
    const deduction = r.team === 'Cortuluá' ? 2 : 0;
    assert.equal(r.pg * 3 + r.pe - deduction, r.pts, `${r.team} PTS mismatch`);
    sumPg += r.pg; sumPe += r.pe; sumPp += r.pp; sumGf += r.gf; sumGc += r.gc;
  }
  assert.equal(sumPg, 165);
  assert.equal(sumPp, 165);
  assert.equal(sumPe, 150);
  assert.equal(sumGf, 676);
  assert.equal(sumGc, 676);

  // Regular rows match final summary rows identically
  assert.deepEqual(t1995.rows, regular);

  // Junior 1º (62 pts, 66-37) & América 2º (60 pts, 56-32)
  assert.equal(regular[0].team, 'Junior de Barranquilla');
  assert.equal(regular[0].pts, 62);
  assert.equal(regular[0].gf, 66);
  assert.equal(regular[0].gc, 37);
  assert.equal(regular[1].team, 'América de Cali');
  assert.equal(regular[1].pts, 60);
  assert.equal(regular[15].team, 'Cúcuta Deportivo');
  assert.equal(regular[15].pts, 24);

  // Badges: Junior Campeón ★, América Subcampeón 🥈
  assert.equal(getRowStatusBadge(t1995, regular[0], 'regular'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1995, regular[1], 'regular'), 'Subcampeón 🥈');
  assert.equal(getRowStatusBadge(t1995, t1995.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1995, t1995.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // 2. Verified 5-match Junior archive (exact 1995 dates, canonical club names, zero leading ★, 3 pts/win summary)
  const validTeams = new Set(regular.map((r) => r.team));
  const matches = t1995.matchArchive || [];
  assert.equal(matches.length, 5);
  assert.ok(getTournamentTeamCrest(t1995, 'Junior de Barranquilla'));
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/1995$/.test(m.date), `Expected exact 1995 date: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'), `Leading star leaked: ${m.note}`);
  }
  assert.deepEqual(
    computeJuniorMatchArchiveSummary(matches, getTournamentPointsPerWin(t1995.year)),
    { pj: 5, pg: 2, pe: 1, pp: 2, gf: 10, gc: 13, dg: -3, pts: 7 }
  );
});

test('1995-96 Campeonato Colombiano (Copa Mustang 1995-96) reconciles 48-fecha Reclasificación, 30-fecha Copa Mustang II, implicit 18-fecha Copa Mustang I, zero-sum Semifinals A/B & Cuadrangular Final, 12/12 playoffMatches, and 54/54 Junior archive with 6 stage filter pills', () => {
  const t9596 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1995-96-cuadrangular');
  assert.ok(t9596, '1995-96-cuadrangular table must exist');
  assert.equal(t9596.year, '1995/96');
  assert.equal(t9596.championTeam, 'Deportivo Cali');
  assert.equal(t9596.runnerUpTeam, 'Millonarios F.C');
  assert.equal(t9596.hasRegularPhase, true);
  assert.equal(t9596.hasFinalPhase, true);
  assert.equal(getTournamentPointsPerWin(t9596.year), 3);

  // 1. Official Reclasificación Regular (48 PJ, 16 clubs) — 100% zero-sum
  const regular = t9596.regularRows || [];
  assert.equal(regular.length, 16);
  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (const r of regular) {
    assert.equal(r.pj, 48, `${r.team} Reclasificación PJ != 48`);
    assert.equal(r.pg + r.pe + r.pp, 48, `${r.team} Reclasificación W+D+L != 48`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Reclasificación DG mismatch`);
    if (r.team === 'Independiente Santa Fe') {
      assert.equal(r.pts, 50, 'Santa Fe official Reclasificación points must be 50');
    } else {
      assert.equal(r.pg * 3 + r.pe, r.pts, `${r.team} Reclasificación PTS mismatch`);
    }
    rPg += r.pg; rPe += r.pe; rPp += r.pp; rGf += r.gf; rGc += r.gc;
  }
  assert.equal(rPg, 268);
  assert.equal(rPp, 268);
  assert.equal(rPe, 232);
  assert.equal(rGf, 1040);
  assert.equal(rGc, 1040);

  // 2. Copa Mustang II · Torneo Finalización 1996 (30 PJ, 16 clubs) — 100% zero-sum
  const fin = t9596.secondaryRegularTable;
  assert.ok(fin, 'secondaryRegularTable (Copa Mustang II) must exist');
  assert.equal(fin.rows.length, 16);
  let fPg = 0, fPe = 0, fPp = 0, fGf = 0, fGc = 0;
  for (const r of fin.rows) {
    assert.equal(r.pj, 30, `${r.team} Copa Mustang II PJ != 30`);
    assert.equal(r.pg + r.pe + r.pp, 30, `${r.team} Copa Mustang II W+D+L != 30`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Copa Mustang II DG mismatch`);
    const deduction = r.team === 'Independiente Santa Fe' ? 2 : 0;
    assert.equal(r.pg * 3 + r.pe - deduction, r.pts, `${r.team} Copa Mustang II PTS mismatch`);
    fPg += r.pg; fPe += r.pe; fPp += r.pp; fGf += r.gf; fGc += r.gc;
  }
  assert.equal(fPg, 169);
  assert.equal(fPp, 169);
  assert.equal(fPe, 142);
  assert.equal(fGf, 647);
  assert.equal(fGc, 647);

  // Verify Atlético Nacional corrected to 50 pts (15*3+5) and Junior 8º with 39 pts (50-37)
  const nacFin = fin.rows.find((r) => r.team === 'Atlético Nacional');
  assert.ok(nacFin && nacFin.pts === 50);
  const junFin = fin.rows.find((r) => r.team === 'Junior de Barranquilla');
  assert.ok(junFin && junFin.pos === 8 && junFin.pts === 39 && junFin.gf === 50 && junFin.gc === 37);

  // 3. Implicit Copa Mustang I (Reclasificación - Copa Mustang II = 18 PJ) — 100% zero-sum
  const finByTeam = new Map(fin.rows.map((r) => [r.team, r]));
  let aPg = 0, aPe = 0, aPp = 0, aGf = 0, aGc = 0;
  for (const r of regular) {
    const f = finByTeam.get(r.team);
    assert.ok(f, `Missing ${r.team} in secondaryRegularTable`);
    const pj = r.pj - f.pj;
    const pg = r.pg - f.pg;
    const pe = r.pe - f.pe;
    const pp = r.pp - f.pp;
    const gf = r.gf - f.gf;
    const gc = r.gc - f.gc;
    assert.equal(pj, 18, `${r.team} implicit Copa Mustang I PJ != 18`);
    assert.equal(pg + pe + pp, 18, `${r.team} implicit Copa Mustang I W+D+L != 18`);
    aPg += pg; aPe += pe; aPp += pp; aGf += gf; aGc += gc;
  }
  assert.equal(aPg, 99);
  assert.equal(aPp, 99);
  assert.equal(aPe, 90);
  assert.equal(aGf, 393);
  assert.equal(aGc, 393);

  // 4. All 3 finalGroups normalized & 100% zero-sum (including Cali 2-1-3 fix in Grupo A)
  const groups = t9596.finalGroups || [];
  assert.equal(groups.length, 3);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');
  assert.equal(groups[2].groupName, 'Cuadrangular Final (Deportivo Cali Campeón ★)');

  const caliSemiA = groups[0].rows.find((r) => r.team === 'Deportivo Cali');
  assert.ok(caliSemiA && caliSemiA.pg === 2 && caliSemiA.pe === 1 && caliSemiA.pp === 3 && caliSemiA.pts === 11);

  for (const g of groups) {
    assert.equal(g.rows.length, 4);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of g.rows) {
      assert.equal(r.pj, 6);
      assert.equal(r.pg + r.pe + r.pp, 6, `${g.groupName} ${r.team} W+D+L != 6`);
      assert.equal(r.gf - r.gc, r.dg, `${g.groupName} ${r.team} DG mismatch`);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `${g.groupName} PG != PP`);
    assert.equal(pe % 2, 0, `${g.groupName} PE odd`);
    assert.equal(gf, gc, `${g.groupName} GF != GC`);
  }

  // Cuadrangular Final matches summary rows identically & badges assign Cali Campeón ★ / Millonarios Subcampeón 🥈
  assert.deepEqual(t9596.rows, groups[2].rows);
  assert.equal(getRowStatusBadge(t9596, t9596.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t9596, t9596.rows[1], 'finalSummary'), 'Subcampeón 🥈');

  // 5. All 12/12 Cuadrangular Final playoffMatches dated (1996) & 100% reconciled to rows (Cali +1.00 bonus = 12)
  const playoffs = t9596.playoffMatches || [];
  assert.equal(playoffs.length, 12);
  const finalBonuses: Record<string, number> = {
    'Deportivo Cali': 1,
    'Millonarios F.C': 0,
    'Atlético Nacional': 0,
    'América de Cali': 0,
  };
  const tally: Record<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }> = {};
  for (const r of t9596.rows) {
    tally[r.team] = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: finalBonuses[r.team] };
  }
  for (const m of playoffs) {
    assert.ok(m.date && /1996$/.test(m.date), `Missing 1996 date on playoff match: ${m.stage}`);
    assert.ok(m.stage.startsWith('Cuad. Final · Fecha '), `Unexpected playoff stage: ${m.stage}`);
    const h = tally[m.homeTeam];
    const a = tally[m.awayTeam];
    assert.ok(h && a, `Unknown team in 1995-96 playoffMatches: ${m.homeTeam} vs ${m.awayTeam}`);
    h.pj++; a.pj++;
    h.gf += m.homeScore; h.gc += m.awayScore;
    a.gf += m.awayScore; a.gc += m.homeScore;
    if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
    else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
    else { h.pe++; a.pe++; h.pts += 1; a.pts += 1; }
  }
  for (const r of t9596.rows) {
    const t = tally[r.team];
    assert.equal(t.pj, r.pj);
    assert.equal(t.pg, r.pg);
    assert.equal(t.pe, r.pe);
    assert.equal(t.pp, r.pp);
    assert.equal(t.gf, r.gf);
    assert.equal(t.gc, r.gc);
    assert.equal(t.pts, r.pts);
  }

  // 6. Complete 54/54 Junior matchArchive: canonical names, zero leading ★, 6 stage filter pills & 3-pt-per-win reconciliation
  const validTeams = new Set(regular.map((r) => r.team));
  const matches = t9596.matchArchive || [];
  assert.equal(matches.length, 54);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(!/Millonarios F\.C\./.test(m.homeTeam) && !/Millonarios F\.C\./.test(m.awayTeam), 'Trailing dot in Millonarios name');
    assert.ok(/(1995|1996)$/.test(m.date), `Expected 1995/1996 date: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'), `Leading star leaked: ${m.note}`);
  }

  const lapOptions = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOptions.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'semifinal', '3', '4']
  );

  const ptsPerWin = getTournamentPointsPerWin(t9596.year);
  const aperturaMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finalizacionMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const finLap1 = filterMatchArchiveFixtures(matches, { lap: '3' });
  const finLap2 = filterMatchArchiveFixtures(matches, { lap: '4' });
  const semiMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });

  assert.equal(aperturaMatches.length, 18);
  assert.equal(finalizacionMatches.length, 30);
  assert.equal(finLap1.length, 15);
  assert.equal(finLap2.length, 15);
  assert.equal(semiMatches.length, 6);

  assert.deepEqual(computeJuniorMatchArchiveSummary(aperturaMatches, ptsPerWin), {
    pj: 18, pg: 7, pe: 4, pp: 7, gf: 23, gc: 26, dg: -3, pts: 25,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finalizacionMatches, ptsPerWin), {
    pj: 30, pg: 10, pe: 9, pp: 11, gf: 50, gc: 37, dg: 13, pts: 39,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary([...aperturaMatches, ...finalizacionMatches], ptsPerWin), {
    pj: 48, pg: 17, pe: 13, pp: 18, gf: 73, gc: 63, dg: 10, pts: 64,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(semiMatches, ptsPerWin), {
    pj: 6, pg: 2, pe: 1, pp: 3, gf: 6, gc: 8, dg: -2, pts: 7,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches, ptsPerWin), {
    pj: 54, pg: 19, pe: 14, pp: 21, gf: 79, gc: 71, dg: 8, pts: 71,
  });
});

test('1996-97 Campeonato Colombiano reconciles 46-fecha Reclasificación, fixed 32-fecha Copa Mustang I (Unión Magdalena 14 PP), implicit 14-fecha Copa Mustang II, Cuadrangular Final (Tolima 2º, 12/12 playoffMatches), and 46/46 Junior archive with 5 stage filter pills', () => {
  const t9697 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1996-97-cuadrangular');
  assert.ok(t9697, '1996-97-cuadrangular table must exist');
  assert.equal(t9697.year, '1996/97');
  assert.equal(t9697.championTeam, 'América de Cali');
  assert.equal(t9697.runnerUpTeam, 'Atlético Bucaramanga');
  assert.equal(getTournamentPointsPerWin(t9697.year), 3);

  // 1. Reclasificación Regular (46 PJ, 16 clubs) — 100% zero-sum
  const regular = t9697.regularRows || [];
  assert.equal(regular.length, 16);
  const cm1Bonuses: Record<string, number> = {
    'América de Cali': 2,
    'Atlético Nacional': 1,
    'Deportivo Cali': 0.5,
    'Junior de Barranquilla': 0.25,
  };
  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (const r of regular) {
    assert.equal(r.pj, 46);
    assert.equal(r.pg + r.pe + r.pp, 46, `${r.team} Reclasificación W+D+L != 46`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Reclasificación DG mismatch`);
    assert.equal(r.pg * 3 + r.pe + (cm1Bonuses[r.team] || 0), r.pts, `${r.team} Reclasificación PTS mismatch`);
    rPg += r.pg; rPe += r.pe; rPp += r.pp; rGf += r.gf; rGc += r.gc;
  }
  assert.equal(rPg, 256);
  assert.equal(rPp, 256);
  assert.equal(rPe, 224);
  assert.equal(rGf, 920);
  assert.equal(rGc, 920);

  // 2. Copa Mustang I (32 PJ, 16 clubs) — Unión Magdalena 14 PP fix -> 100% zero-sum
  const cm1 = t9697.secondaryRegularTable;
  assert.ok(cm1, 'secondaryRegularTable (Copa Mustang I) must exist');
  assert.equal(cm1.rows.length, 16);
  const magCm1 = cm1.rows.find((r) => r.team === 'Unión Magdalena');
  assert.ok(magCm1 && magCm1.pg === 11 && magCm1.pe === 7 && magCm1.pp === 14 && magCm1.pts === 40);

  let aPg = 0, aPe = 0, aPp = 0, aGf = 0, aGc = 0;
  for (const r of cm1.rows) {
    assert.equal(r.pj, 32);
    assert.equal(r.pg + r.pe + r.pp, 32, `${r.team} Copa Mustang I W+D+L != 32`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Copa Mustang I DG mismatch`);
    assert.equal(r.pg * 3 + r.pe, r.pts, `${r.team} Copa Mustang I PTS mismatch`);
    aPg += r.pg; aPe += r.pe; aPp += r.pp; aGf += r.gf; aGc += r.gc;
  }
  assert.equal(aPg, 170);
  assert.equal(aPp, 170);
  assert.equal(aPe, 172);
  assert.equal(aGf, 634);
  assert.equal(aGc, 634);

  // 3. Implicit Copa Mustang II (Reclasificación - Copa Mustang I = 14 PJ) — 100% zero-sum
  const cm1ByTeam = new Map(cm1.rows.map((r) => [r.team, r]));
  let bPg = 0, bPe = 0, bPp = 0, bGf = 0, bGc = 0;
  for (const r of regular) {
    const a = cm1ByTeam.get(r.team);
    assert.ok(a, `Missing ${r.team} in Copa Mustang I`);
    assert.equal(r.pj - a.pj, 14);
    assert.equal((r.pg - a.pg) + (r.pe - a.pe) + (r.pp - a.pp), 14);
    bPg += r.pg - a.pg; bPe += r.pe - a.pe; bPp += r.pp - a.pp;
    bGf += r.gf - a.gf; bGc += r.gc - a.gc;
  }
  assert.equal(bPg, 86);
  assert.equal(bPp, 86);
  assert.equal(bPe, 52);
  assert.equal(bGf, 286);
  assert.equal(bGc, 286);

  // 4. Cuadrangular Final 1996-97: América 1º (10 pts, Campeón ★), Tolima 2º (9 pts, +3 DG), Nacional 3º (9 pts, -3 DG), Cali 4º (5 pts)
  assert.ok(/Cuadrangular Final 1996-97/i.test(t9697.finalPhaseTitle || ''));
  assert.equal(t9697.rows[0].team, 'América de Cali');
  assert.equal(t9697.rows[1].team, 'Deportes Tolima');
  assert.equal(t9697.rows[2].team, 'Atlético Nacional');
  assert.equal(t9697.rows[3].team, 'Deportivo Cali');
  assert.deepEqual(t9697.rows, t9697.finalGroups?.[0].rows);
  assert.equal(getRowStatusBadge(t9697, t9697.rows[0], 'finalSummary'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t9697, t9697.rows[1], 'finalSummary'), '2º Puesto');
  assert.equal(
    getRowStatusBadge(t9697, t9697.finalGroups![0].rows[1], 'finalGroup', t9697.finalGroups![0].groupName),
    '2º Puesto'
  );

  // 5. Exactly 12/12 Cuadrangular Final playoffMatches (no raw 381 Wikipedia dump!) & 100% reconciled to rows
  const playoffs = t9697.playoffMatches || [];
  assert.equal(playoffs.length, 12);
  const cfBonuses: Record<string, number> = {
    'América de Cali': 1,
    'Deportes Tolima': 0,
    'Atlético Nacional': 0,
    'Deportivo Cali': 0,
  };
  const tally: Record<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }> = {};
  for (const r of t9697.rows) {
    tally[r.team] = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: cfBonuses[r.team] };
  }
  for (const m of playoffs) {
    assert.ok(m.date && /1997$/.test(m.date), `Missing 1997 date: ${m.stage}`);
    assert.ok(m.stage.startsWith('Cuad. Final · Fecha '), `Unexpected stage: ${m.stage}`);
    const h = tally[m.homeTeam];
    const a = tally[m.awayTeam];
    assert.ok(h && a, `Unknown team in 1996-97 playoffMatches: ${m.homeTeam} vs ${m.awayTeam}`);
    h.pj++; a.pj++;
    h.gf += m.homeScore; h.gc += m.awayScore;
    a.gf += m.awayScore; a.gc += m.homeScore;
    if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
    else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
    else { h.pe++; a.pe++; h.pts += 1; a.pts += 1; }
  }
  for (const r of t9697.rows) {
    const t = tally[r.team];
    assert.equal(t.pj, r.pj);
    assert.equal(t.pg, r.pg);
    assert.equal(t.pe, r.pe);
    assert.equal(t.pp, r.pp);
    assert.equal(t.gf, r.gf);
    assert.equal(t.gc, r.gc);
    assert.equal(t.pts, r.pts);
  }

  // 6. Complete 46/46 Junior matchArchive with 5 stage filter pills & 3-pt-per-win reconciliation
  const validTeams = new Set(regular.map((r) => r.team));
  const matches = t9697.matchArchive || [];
  assert.equal(matches.length, 46);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/(1996|1997)$/.test(m.date), `Expected 1996/1997 date: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'), `Leading star leaked: ${m.note}`);
  }
  const lapOptions = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOptions.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2']
  );

  const ptsPerWin = getTournamentPointsPerWin(t9697.year);
  const cm1Matches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const cm2Matches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const lap1 = filterMatchArchiveFixtures(matches, { lap: '1' });
  const lap2 = filterMatchArchiveFixtures(matches, { lap: '2' });

  assert.equal(cm1Matches.length, 32);
  assert.equal(cm2Matches.length, 14);
  assert.equal(lap1.length, 16);
  assert.equal(lap2.length, 16);

  assert.deepEqual(computeJuniorMatchArchiveSummary(cm1Matches, ptsPerWin), {
    pj: 32, pg: 13, pe: 9, pp: 10, gf: 53, gc: 40, dg: 13, pts: 48,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(cm2Matches, ptsPerWin), {
    pj: 14, pg: 5, pe: 2, pp: 7, gf: 12, gc: 18, dg: -6, pts: 17,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches, ptsPerWin), {
    pj: 46, pg: 18, pe: 11, pp: 17, gf: 65, gc: 58, dg: 7, pts: 65,
  });
});

test('Torneo Adecuación 1997 reconciles full 16-club 22-fecha general table (Millonarios 5 PP fix), 16-fecha Primera Fase sub-table, zero-sum Semifinals A/B, 6 canonical knockout playoffMatches, and 28/28 Junior archive with shootout draw-win bonus', () => {
  const t1997 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1997-adecuacion');
  assert.ok(t1997, '1997-adecuacion table must exist');
  assert.equal(t1997.year, '1997');
  assert.equal(t1997.championTeam, 'América de Cali');
  assert.equal(t1997.runnerUpTeam, 'Atlético Bucaramanga');
  assert.equal(getTournamentPointsPerWin(t1997.year), 3);

  // 1. Full 16-club 22-fecha general table (Millonarios fixed to 5 PP -> 100% zero-sum)
  const regular = t1997.regularRows || [];
  assert.equal(regular.length, 16);
  const mill22 = regular.find((r) => r.team === 'Millonarios F.C');
  assert.ok(mill22 && mill22.pg === 11 && mill22.pe === 6 && mill22.pp === 5 && mill22.pts === 44.75);
  const jun22 = regular.find((r) => r.team === 'Junior de Barranquilla');
  assert.ok(jun22 && jun22.pos === 5 && jun22.pts === 37.25 && jun22.gf === 32 && jun22.gc === 26);

  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (const r of regular) {
    assert.equal(r.pj, 22);
    assert.equal(r.pg + r.pe + r.pp, 22, `${r.team} Adecuación 22 W+D+L != 22`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Adecuación 22 DG mismatch`);
    rPg += r.pg; rPe += r.pe; rPp += r.pp; rGf += r.gf; rGc += r.gc;
  }
  assert.equal(rPg, 121);
  assert.equal(rPp, 121);
  assert.equal(rPe, 110);
  assert.equal(rGf, 464);
  assert.equal(rGc, 464);

  // 2. Primera Fase sub-table (16 PJ, 16 clubs, Millonarios fixed to 3 PP -> 100% zero-sum)
  const f1 = t1997.secondaryRegularTable;
  assert.ok(f1, 'secondaryRegularTable (Primera Fase 16 PJ) must exist');
  assert.equal(f1.rows.length, 16);
  const mill16 = f1.rows.find((r) => r.team === 'Millonarios F.C');
  assert.ok(mill16 && mill16.pg === 8 && mill16.pe === 5 && mill16.pp === 3 && mill16.pts === 33);

  let fPg = 0, fPe = 0, fPp = 0, fGf = 0, fGc = 0;
  for (const r of f1.rows) {
    assert.equal(r.pj, 16);
    assert.equal(r.pg + r.pe + r.pp, 16, `${r.team} Primera Fase W+D+L != 16`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Primera Fase DG mismatch`);
    fPg += r.pg; fPe += r.pe; fPp += r.pp; fGf += r.gf; fGc += r.gc;
  }
  assert.equal(fPg, 87);
  assert.equal(fPp, 87);
  assert.equal(fPe, 82);
  assert.equal(fGf, 310);
  assert.equal(fGc, 310);

  // 3. Implicit Cuadrangulares Regionales (22 - 16 = 6 PJ) — 100% zero-sum
  const f1ByTeam = new Map(f1.rows.map((r) => [r.team, r]));
  let regPg = 0, regPe = 0, regPp = 0, regGf = 0, regGc = 0;
  for (const r of regular) {
    const a = f1ByTeam.get(r.team);
    assert.ok(a, `Missing ${r.team} in Primera Fase`);
    assert.equal(r.pj - a.pj, 6);
    assert.equal((r.pg - a.pg) + (r.pe - a.pe) + (r.pp - a.pp), 6);
    regPg += r.pg - a.pg; regPe += r.pe - a.pe; regPp += r.pp - a.pp;
    regGf += r.gf - a.gf; regGc += r.gc - a.gc;
  }
  assert.equal(regPg, 34);
  assert.equal(regPp, 34);
  assert.equal(regPe, 28);
  assert.equal(regGf, 154);
  assert.equal(regGc, 154);

  // 4. Semifinales Grupo A & B normalized & 100% zero-sum + Bucaramanga Subcampeón 🥈 badge
  const groups = t1997.finalGroups || [];
  assert.equal(groups.length, 2);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');
  for (const g of groups) {
    assert.equal(g.rows.length, 4);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of g.rows) {
      assert.equal(r.pj, 6);
      assert.equal(r.pg + r.pe + r.pp, 6);
      assert.equal(r.gf - r.gc, r.dg);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp);
    assert.equal(pe % 2, 0);
    assert.equal(gf, gc);
  }
  assert.equal(getRowStatusBadge(t1997, t1997.rows[0], 'finalSummary'), 'Subcampeón 🥈');

  // 5. All 6 knockout playoffMatches (canonical club names, exact dic 1997 dates)
  const validTeams = new Set(regular.map((r) => r.team));
  const playoffs = t1997.playoffMatches || [];
  assert.equal(playoffs.length, 6);
  for (const m of playoffs) {
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical playoff homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical playoff awayTeam: ${m.awayTeam}`);
    assert.ok(/dic 1997$/.test(m.date || ''), `Expected dic 1997 date: ${m.date}`);
  }

  // 6. Complete 28/28 Junior matchArchive: 4 stage filter pills & shootout-aware reconciliation (3/2/1/0)
  const matches = t1997.matchArchive || [];
  assert.equal(matches.length, 28);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/1997$/.test(m.date), `Expected 1997 date: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'), `Leading star leaked: ${m.note}`);
  }

  const lapOptions = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOptions.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'semifinal']
  );

  // Confirm 1952 (also 28 matches) is unaffected by 1997 Adecuación stage filter guard
  const t1952 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1952-campeonato');
  if (t1952?.matchArchive?.length === 28) {
    assert.deepEqual(
      getMatchArchiveLapOptions(t1952.matchArchive.length, t1952.matchArchive).map((o) => o.id),
      ['all', '1', '2']
    );
  }

  const ptsPerWin = getTournamentPointsPerWin(t1997.year);
  const f1Matches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const regDMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const semiBMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });

  assert.equal(f1Matches.length, 16);
  assert.equal(regDMatches.length, 6);
  assert.equal(semiBMatches.length, 6);

  assert.deepEqual(computeJuniorMatchArchiveSummary(f1Matches, ptsPerWin), {
    pj: 16, pg: 6, pe: 4, pp: 6, gf: 23, gc: 22, dg: 1, pts: 24,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(regDMatches, ptsPerWin), {
    pj: 6, pg: 4, pe: 1, pp: 1, gf: 9, gc: 4, dg: 5, pts: 13,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary([...f1Matches, ...regDMatches], ptsPerWin), {
    pj: 22, pg: 10, pe: 5, pp: 7, gf: 32, gc: 26, dg: 6, pts: 37,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(semiBMatches, ptsPerWin), {
    pj: 6, pg: 1, pe: 2, pp: 3, gf: 5, gc: 11, dg: -6, pts: 5,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches, ptsPerWin), {
    pj: 28, pg: 11, pe: 7, pp: 10, gf: 37, gc: 37, dg: 0, pts: 42,
  });
});

test('1998 Campeonato Colombiano reconciles zero-sum 50-fecha Reclasificación, 36-fecha Apertura (Copa Mustang I), implicit 14-fecha Finalización, Semifinals A/B, Gran Final, and 50/50 Junior archive with 6 stage filter pills & shootout points', () => {
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  assert.ok(t1998, '1998-reclasificacion table must exist');
  assert.equal(t1998.year, '1998');
  assert.equal(t1998.championTeam, 'Deportivo Cali');
  assert.equal(t1998.runnerUpTeam, 'Once Caldas');
  assert.equal(getTournamentPointsPerWin(t1998.year), 3);

  // 1. Reclasificación Regular (50 PJ, 16 clubs) — 100% zero-sum (1088 GF = 1088 GC)
  const regular = t1998.regularRows || [];
  assert.equal(regular.length, 16);
  const jun50 = regular.find((r) => r.isJunior);
  assert.ok(jun50 && jun50.pos === 14 && jun50.pj === 50 && jun50.pg === 12 && jun50.pe === 19 && jun50.pp === 19 && jun50.gf === 71 && jun50.gc === 85 && jun50.pts === 66);

  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (const r of regular) {
    assert.equal(r.pj, 50);
    assert.equal(r.pg + r.pe + r.pp, 50, `${r.team} Reclasificación W+D+L != 50`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Reclasificación DG mismatch`);
    rPg += r.pg; rPe += r.pe; rPp += r.pp; rGf += r.gf; rGc += r.gc;
  }
  assert.equal(rPg, 272);
  assert.equal(rPp, 272);
  assert.equal(rPe, 256);
  assert.equal(rGf, 1088);
  assert.equal(rGc, 1088);

  // 2. Torneo Apertura · Copa Mustang I (36 PJ, 16 clubs) — 100% zero-sum
  const ap = t1998.secondaryRegularTable;
  assert.ok(ap, 'secondaryRegularTable (Copa Mustang I 36 PJ) must exist');
  assert.equal(ap.rows.length, 16);
  const jun36 = ap.rows.find((r) => r.isJunior);
  assert.ok(jun36 && jun36.pos === 7 && jun36.pj === 36 && jun36.pg === 11 && jun36.pe === 14 && jun36.pp === 11 && jun36.gf === 51 && jun36.gc === 55 && jun36.pts === 55);

  let aPg = 0, aPe = 0, aPp = 0, aGf = 0, aGc = 0;
  for (const r of ap.rows) {
    assert.equal(r.pj, 36);
    assert.equal(r.pg + r.pe + r.pp, 36, `${r.team} Apertura W+D+L != 36`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Apertura DG mismatch`);
    aPg += r.pg; aPe += r.pe; aPp += r.pp; aGf += r.gf; aGc += r.gc;
  }
  assert.equal(aPg, 198);
  assert.equal(aPp, 198);
  assert.equal(aPe, 180);
  assert.equal(aGf, 775);
  assert.equal(aGc, 775);

  // 3. Implicit Finalización (Reclasificación - Apertura = 14 PJ) — 100% zero-sum
  const apByTeam = new Map(ap.rows.map((r) => [r.team, r]));
  let fPg = 0, fPe = 0, fPp = 0, fGf = 0, fGc = 0;
  for (const r of regular) {
    const a = apByTeam.get(r.team);
    assert.ok(a, `Missing ${r.team} in Apertura`);
    assert.equal(r.pj - a.pj, 14);
    assert.equal((r.pg - a.pg) + (r.pe - a.pe) + (r.pp - a.pp), 14);
    fPg += r.pg - a.pg; fPe += r.pe - a.pe; fPp += r.pp - a.pp;
    fGf += r.gf - a.gf; fGc += r.gc - a.gc;
  }
  assert.equal(fPg, 74);
  assert.equal(fPp, 74);
  assert.equal(fPe, 76);
  assert.equal(fGf, 313);
  assert.equal(fGc, 313);

  // 4. Cuadrangulares Semifinales A & B normalized, zero-sum, and badges accurate
  const groups = t1998.finalGroups || [];
  assert.equal(groups.length, 2);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');
  for (const g of groups) {
    assert.equal(g.rows.length, 4);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of g.rows) {
      assert.equal(r.pj, 6);
      assert.equal(r.pg + r.pe + r.pp, 6);
      assert.equal(r.gf - r.gc, r.dg);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp);
    assert.equal(pe % 2, 0);
    assert.equal(gf, gc);
  }
  assert.equal(getRowStatusBadge(t1998, groups[0].rows[0], 'finalGroup', groups[0].groupName), 'Subcampeón 🥈');
  assert.equal(getRowStatusBadge(t1998, groups[1].rows[0], 'finalGroup', groups[1].groupName), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1998, t1998.rows[0], 'finalSummary'), 'Campeón ★');

  // 5. Gran Final playoffMatches (2 canonical matches with 1998 dates)
  const validTeams = new Set(regular.map((r) => r.team));
  const playoffs = t1998.playoffMatches || [];
  assert.equal(playoffs.length, 2);
  for (const m of playoffs) {
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical playoff homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical playoff awayTeam: ${m.awayTeam}`);
    assert.ok(/dic 1998$/.test(m.date || ''), `Expected dic 1998 date: ${m.date}`);
  }
  assert.equal(playoffs[0].homeScore, 4);
  assert.equal(playoffs[0].awayScore, 0);
  assert.equal(playoffs[1].homeScore, 0);
  assert.equal(playoffs[1].awayScore, 0);

  // 6. Complete 50/50 Junior matchArchive: 6 stage filter pills & shootout-aware reconciliation (3/2/1/0)
  const matches = t1998.matchArchive || [];
  assert.equal(matches.length, 50);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/1998$/.test(m.date), `Expected 1998 date: ${m.date}`);
    assert.ok(!(m.note || '').startsWith('★'), `Leading star leaked: ${m.note}`);
  }

  const lapOptions = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOptions.map((o) => o.id),
    ['all', 'apertura', 'cuadrangular', 'finalizacion', '1', '2']
  );

  // Confirm 1973 (also 50 matches) is unaffected by 1998 stage filter guard
  const t1973 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1973-triangular');
  assert.ok(t1973?.matchArchive?.length === 50);
  assert.deepEqual(
    getMatchArchiveLapOptions(t1973.matchArchive.length, t1973.matchArchive).map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2', '3', '4']
  );

  const ptsPerWin = getTournamentPointsPerWin(t1998.year);
  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const cuadDMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const vta1Matches = filterMatchArchiveFixtures(matches, { lap: '1' });
  const vta2Matches = filterMatchArchiveFixtures(matches, { lap: '2' });

  assert.equal(apMatches.length, 36);
  assert.equal(cuadDMatches.length, 6);
  assert.equal(finMatches.length, 14);
  assert.equal(vta1Matches.length, 15);
  assert.equal(vta2Matches.length, 15);

  assert.deepEqual(computeJuniorMatchArchiveSummary(vta1Matches, ptsPerWin), {
    pj: 15, pg: 5, pe: 6, pp: 4, gf: 19, gc: 23, dg: -4, pts: 24,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(cuadDMatches, ptsPerWin), {
    pj: 6, pg: 3, pe: 3, pp: 0, gf: 16, gc: 9, dg: 7, pts: 14,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(vta2Matches, ptsPerWin), {
    pj: 15, pg: 3, pe: 5, pp: 7, gf: 16, gc: 23, dg: -7, pts: 17,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apMatches, ptsPerWin), {
    pj: 36, pg: 11, pe: 14, pp: 11, gf: 51, gc: 55, dg: -4, pts: 55,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finMatches, ptsPerWin), {
    pj: 14, pg: 1, pe: 5, pp: 8, gf: 20, gc: 30, dg: -10, pts: 11,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches, ptsPerWin), {
    pj: 50, pg: 12, pe: 19, pp: 19, gf: 71, gc: 85, dg: -14, pts: 66,
  });
});

test('1999 Campeonato Colombiano reconciles zero-sum Apertura (22 PJ) & Finalización (22 PJ, Quindío 28 GF), Semifinales A & B (24/24 matches + 4 finals, fixed pos 4 & badges), and 50/50 Junior archive with 4 stage filter pills', () => {
  const t1999 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1999-cuadrangular');
  assert.ok(t1999, '1999-cuadrangular must exist');
  assert.equal(t1999.championTeam, 'Atlético Nacional');
  assert.equal(t1999.runnerUpTeam, 'América de Cali');
  assert.ok(
    !(t1999.secondaryRegularTable?.description || '').toLowerCase().includes('wikipedia'),
    '1999 Finalización description must not cite Wikipedia'
  );

  // 1. Torneo Apertura 1999 (22 PJ, 16 clubs) — 100% zero-sum & 3-1-0 exact
  const apertura = t1999.regularRows || [];
  assert.equal(apertura.length, 16);
  let aPg = 0, aPe = 0, aPp = 0, aGf = 0, aGc = 0;
  for (let i = 0; i < apertura.length; i++) {
    const r = apertura[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 22);
    assert.equal(r.pg + r.pe + r.pp, 22);
    assert.equal(r.pg * 3 + r.pe, r.pts, `${r.team} Apertura pts != 3*PG+PE`);
    assert.equal(r.gf - r.gc, r.dg);
    aPg += r.pg; aPe += r.pe; aPp += r.pp; aGf += r.gf; aGc += r.gc;
  }
  assert.equal(aPg, 107);
  assert.equal(aPp, 107);
  assert.equal(aPe, 138);
  assert.equal(aGf, 467);
  assert.equal(aGc, 467);
  const junAp = apertura.find((r) => r.isJunior);
  assert.ok(junAp && junAp.pos === 4 && junAp.pg === 9 && junAp.pe === 7 && junAp.pp === 6 && junAp.gf === 34 && junAp.gc === 34 && junAp.pts === 34);

  // 2. Torneo Finalización 1999 (22 PJ, 16 clubs) — 100% zero-sum (Quindío 28-45 -17 & Envigado 28 pts)
  const fin = t1999.secondaryRegularTable?.rows || [];
  assert.equal(fin.length, 16);
  let fPg = 0, fPe = 0, fPp = 0, fGf = 0, fGc = 0;
  for (let i = 0; i < fin.length; i++) {
    const r = fin[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 22);
    assert.equal(r.pg + r.pe + r.pp, 22);
    assert.equal(r.pg * 3 + r.pe, r.pts, `${r.team} Finalización pts != 3*PG+PE`);
    assert.equal(r.gf - r.gc, r.dg, `${r.team} Finalización DG mismatch`);
    fPg += r.pg; fPe += r.pe; fPp += r.pp; fGf += r.gf; fGc += r.gc;
  }
  assert.equal(fPg, 126);
  assert.equal(fPp, 126);
  assert.equal(fPe, 100);
  assert.equal(fGf, 451);
  assert.equal(fGc, 451);
  const quindioFin = fin.find((r) => r.team === 'Deportes Quindío');
  assert.ok(quindioFin && quindioFin.gf === 28 && quindioFin.gc === 45 && quindioFin.dg === -17 && quindioFin.pts === 18);
  const envigadoFin = fin.find((r) => r.team === 'Envigado F.C');
  assert.ok(envigadoFin && envigadoFin.pts === 28);
  const junFin = fin.find((r) => r.isJunior);
  assert.ok(junFin && junFin.pos === 4 && junFin.pg === 10 && junFin.pe === 5 && junFin.pp === 7 && junFin.gf === 27 && junFin.gc === 24 && junFin.pts === 35);

  // 3. Cuadrangulares Semifinales A & B — exact pos 1..4, zero-sum, & badges
  assert.deepEqual(t1999.rows.map((r) => r.pos), [1, 2, 3, 4]);
  const groups = t1999.finalGroups || [];
  assert.equal(groups.length, 2);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');
  for (const g of groups) {
    assert.deepEqual(g.rows.map((r) => r.pos), [1, 2, 3, 4]);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of g.rows) {
      assert.equal(r.pj, 6);
      assert.equal(r.pg + r.pe + r.pp, 6);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      assert.equal(r.gf - r.gc, r.dg);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp);
    assert.equal(pe % 2, 0);
    assert.equal(gf, gc);
  }
  // Badges: Nacional Campeón ★, América Subcampeón 🥈, Junior NOT mislabeled Subcampeón!
  assert.equal(getRowStatusBadge(t1999, apertura[0], 'regular'), 'Subcampeón 🥈');
  assert.equal(getRowStatusBadge(t1999, apertura[1], 'regular'), 'Campeón ★');
  assert.equal(getRowStatusBadge(t1999, groups[1].rows[0], 'finalGroup', groups[1].groupName), 'Campeón ★');
  assert.notEqual(getRowStatusBadge(t1999, groups[1].rows[1], 'finalGroup', groups[1].groupName), 'Subcampeón 🥈');

  // 3b. Reclasificación General 1999 (tertiaryRegularTable, 16 clubs) — 100% exact sum of Apertura + Finalización + Semifinales A/B & zero-sum
  const reclas = t1999.tertiaryRegularTable?.rows || [];
  assert.equal(reclas.length, 16);
  const sumByTeam = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; dg: number; pts: number }>();
  for (const lst of [apertura, fin, groups[0].rows, groups[1].rows]) {
    for (const r of lst) {
      const cur = sumByTeam.get(r.team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
      cur.pj += r.pj; cur.pg += r.pg; cur.pe += r.pe; cur.pp += r.pp;
      cur.gf += r.gf; cur.gc += r.gc; cur.dg += r.dg; cur.pts += r.pts;
      sumByTeam.set(r.team, cur);
    }
  }
  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    const expected = sumByTeam.get(r.team);
    assert.ok(expected, `Unexpected team in 1999 Reclasificación: ${r.team}`);
    assert.deepEqual(
      { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, dg: r.dg, pts: r.pts },
      expected,
      `1999 Reclasificación mismatch for ${r.team}`
    );
    rPg += r.pg; rPe += r.pe; rPp += r.pp; rGf += r.gf; rGc += r.gc;
  }
  assert.equal(rPg, 250);
  assert.equal(rPp, 250);
  assert.equal(rPe, 252);
  assert.equal(rGf, 994);
  assert.equal(rGc, 994);
  assert.equal(reclas[0].team, 'Atlético Nacional');
  assert.equal(reclas[0].pts, 85);
  assert.equal(reclas[1].team, 'Junior de Barranquilla');
  assert.equal(reclas[1].pts, 79);
  assert.equal(getRowStatusBadge(t1999, reclas[0], 'tertiaryRegular'), 'Campeón ★ · Lib.');
  assert.equal(getRowStatusBadge(t1999, reclas[1], 'tertiaryRegular'), 'Libertadores 2000');
  assert.equal(getRowStatusBadge(t1999, reclas[7], 'tertiaryRegular'), 'Subcampeón 🥈');
  assert.equal(getRowStatusBadge(t1999, reclas[13], 'tertiaryRegular'), 'Descendido');

  // 4. All 28 playoffMatches: 4 clean stages, canonical names, 1999 dates, crests, & 100% match-by-match reconciliation for Semifinals A & B
  const validTeams = new Set(apertura.map((r) => r.team));
  const playoffs = t1999.playoffMatches || [];
  assert.equal(playoffs.length, 28);
  assert.deepEqual(Array.from(new Set(playoffs.map((m) => m.stage))), [
    'Gran Final',
    'Final Finalización',
    'Semifinal · Grupo B',
    'Semifinal · Grupo A',
  ]);
  for (const m of playoffs) {
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical playoff homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical playoff awayTeam: ${m.awayTeam}`);
    assert.ok(/1999$/.test(m.date || ''), `Expected 1999 date in playoffMatches: ${m.date}`);
  }
  assert.ok(getTournamentTeamCrest(t1999, 'Junior de Barranquilla', true));
  for (const [stageName, group] of [
    ['Semifinal · Grupo A', groups[0]],
    ['Semifinal · Grupo B', groups[1]],
  ] as const) {
    const stageMatches = playoffs.filter((m) => m.stage === stageName);
    assert.equal(stageMatches.length, 12);
    const tallies = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const r of group.rows) {
      tallies.set(r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
    }
    for (const m of stageMatches) {
      const h = tallies.get(m.homeTeam)!;
      const a = tallies.get(m.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += m.homeScore; h.gc += m.awayScore;
      a.gf += m.awayScore; a.gc += m.homeScore;
      if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
      else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
      else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
    }
    for (const r of group.rows) {
      const calc = tallies.get(r.team)!;
      assert.deepEqual(calc, { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    }
  }

  // 5. Complete 50/50 Junior matchArchive with 4 stage filter pills & 100% reconciliation
  const matches = t1999.matchArchive || [];
  assert.equal(matches.length, 50);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/1999$/.test(m.date), `Expected 1999 date: ${m.date}`);
  }
  const lapOptions = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOptions.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'semifinal']
  );

  // Confirm 1973 and 1998 (also 50 matches) remain unaffected by 1999 stage filter guard
  const t1973 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1973-triangular');
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion');
  assert.deepEqual(
    getMatchArchiveLapOptions(t1973!.matchArchive!.length, t1973!.matchArchive!).map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2', '3', '4']
  );
  assert.deepEqual(
    getMatchArchiveLapOptions(t1998!.matchArchive!.length, t1998!.matchArchive!).map((o) => o.id),
    ['all', 'apertura', 'cuadrangular', 'finalizacion', '1', '2']
  );

  const ptsPerWin = getTournamentPointsPerWin(t1999.year);
  assert.equal(ptsPerWin, 3);
  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const semiMatches = filterMatchArchiveFixtures(matches, { lap: 'semifinal' });
  assert.equal(apMatches.length, 22);
  assert.equal(finMatches.length, 22);
  assert.equal(semiMatches.length, 6);

  assert.deepEqual(computeJuniorMatchArchiveSummary(apMatches, ptsPerWin), {
    pj: 22, pg: 9, pe: 7, pp: 6, gf: 34, gc: 34, dg: 0, pts: 34,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finMatches, ptsPerWin), {
    pj: 22, pg: 10, pe: 5, pp: 7, gf: 27, gc: 24, dg: 3, pts: 35,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(semiMatches, ptsPerWin), {
    pj: 6, pg: 3, pe: 1, pp: 2, gf: 11, gc: 10, dg: 1, pts: 10,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches, ptsPerWin), {
    pj: 50, pg: 22, pe: 13, pp: 15, gf: 72, gc: 68, dg: 4, pts: 79,
  });
});

test('2000 Campeonato Colombiano (Subcampeón 🥈) reconciles zero-sum Apertura (22 PJ), Finalización (22 PJ), Reclasificación (44 PJ), Cuadrangular Final (12/12 matches), and 50/50 Junior archive with 4 stage filter pills', () => {
  const t2000 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2000-cuadrangular');
  assert.ok(t2000, '2000-cuadrangular must exist');
  assert.equal(t2000.championTeam, 'América de Cali');
  assert.equal(t2000.runnerUpTeam, 'Junior de Barranquilla');
  assert.equal(t2000.isJuniorRunnerUp, true);
  assert.ok(
    !(t2000.secondaryRegularTable?.description || '').toLowerCase().includes('wikipedia'),
    '2000 Finalización description must not cite Wikipedia'
  );

  // 1. Torneo Apertura 2000 (22 PJ, 16 clubs) — 100% zero-sum
  const apertura = t2000.regularRows || [];
  assert.equal(apertura.length, 16);
  let aPg = 0, aPe = 0, aPp = 0, aGf = 0, aGc = 0;
  for (let i = 0; i < apertura.length; i++) {
    const r = apertura[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 22);
    assert.equal(r.pg + r.pe + r.pp, 22);
    assert.equal(r.pg * 3 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
    aPg += r.pg; aPe += r.pe; aPp += r.pp; aGf += r.gf; aGc += r.gc;
  }
  assert.equal(aPg, 125);
  assert.equal(aPp, 125);
  assert.equal(aPe, 102);
  assert.equal(aGf, 467);
  assert.equal(aGc, 467);
  assert.equal(apertura[0].team, 'Deportivo Cali');
  assert.equal(getRowStatusBadge(t2000, apertura[0], 'regular'), 'Ganador · Lib. 2001');
  const junAp = apertura.find((r) => r.isJunior);
  assert.ok(junAp && junAp.pos === 6 && junAp.pg === 9 && junAp.pe === 5 && junAp.pp === 8 && junAp.gf === 33 && junAp.gc === 27 && junAp.pts === 32);

  // 2. Torneo Finalización 2000 (22 PJ, 16 clubs) — 100% zero-sum
  const fin = t2000.secondaryRegularTable?.rows || [];
  assert.equal(fin.length, 16);
  let fPg = 0, fPe = 0, fPp = 0, fGf = 0, fGc = 0;
  for (let i = 0; i < fin.length; i++) {
    const r = fin[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 22);
    assert.equal(r.pg + r.pe + r.pp, 22);
    assert.equal(r.pg * 3 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
    fPg += r.pg; fPe += r.pe; fPp += r.pp; fGf += r.gf; fGc += r.gc;
  }
  assert.equal(fPg, 129);
  assert.equal(fPp, 129);
  assert.equal(fPe, 94);
  assert.equal(fGf, 478);
  assert.equal(fGc, 478);
  assert.equal(fin[0].team, 'América de Cali');
  assert.equal(fin[0].pts, 48);
  const junFin = fin.find((r) => r.isJunior);
  assert.ok(junFin && junFin.pos === 3 && junFin.pg === 10 && junFin.pe === 8 && junFin.pp === 4 && junFin.gf === 37 && junFin.gc === 23 && junFin.pts === 38);

  // 3. Reclasificación Regular 2000 (44 PJ, 16 clubs) — exact sum of Apertura + Finalización & 100% zero-sum
  const reclas = t2000.tertiaryRegularTable?.rows || [];
  assert.equal(reclas.length, 16);
  const apByTeam = new Map(apertura.map((r) => [r.team, r]));
  const finByTeam = new Map(fin.map((r) => [r.team, r]));
  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    const a = apByTeam.get(r.team)!;
    const b = finByTeam.get(r.team)!;
    assert.deepEqual(
      { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, dg: r.dg, pts: r.pts },
      { pj: a.pj + b.pj, pg: a.pg + b.pg, pe: a.pe + b.pe, pp: a.pp + b.pp, gf: a.gf + b.gf, gc: a.gc + b.gc, dg: a.dg + b.dg, pts: a.pts + b.pts },
      `2000 Reclasificación mismatch for ${r.team}`
    );
    rPg += r.pg; rPe += r.pe; rPp += r.pp; rGf += r.gf; rGc += r.gc;
  }
  assert.equal(rPg, 254);
  assert.equal(rPp, 254);
  assert.equal(rPe, 196);
  assert.equal(rGf, 945);
  assert.equal(rGc, 945);
  assert.equal(reclas[0].team, 'América de Cali');
  assert.equal(reclas[2].team, 'Junior de Barranquilla');
  assert.equal(reclas[2].pts, 70);
  assert.equal(reclas[3].team, 'Deportes Tolima');
  assert.equal(reclas[4].team, 'Millonarios F.C');
  assert.equal(getRowStatusBadge(t2000, reclas[0], 'tertiaryRegular'), 'Campeón ★ · Lib.');
  assert.equal(getRowStatusBadge(t2000, reclas[2], 'tertiaryRegular'), 'Subcampeón 🥈');
  assert.equal(getRowStatusBadge(t2000, reclas[5], 'tertiaryRegular'), 'Libertadores 2001');
  assert.equal(getRowStatusBadge(t2000, reclas[15], 'tertiaryRegular'), 'Descendido');

  // 4. Cuadrangular Final 2000 (6 PJ, 4 clubs) & 12/12 playoffMatches exact reconciliation
  const groups = t2000.finalGroups || [];
  assert.equal(groups.length, 1);
  assert.equal(groups[0].groupName, 'Cuadrangular Final 2000');
  const cfRows = groups[0].rows;
  assert.deepEqual(cfRows.map((r) => ({ pos: r.pos, team: r.team, pts: r.pts })), [
    { pos: 1, team: 'América de Cali', pts: 10 },
    { pos: 2, team: 'Junior de Barranquilla', pts: 9 },
    { pos: 3, team: 'Deportes Tolima', pts: 7 },
    { pos: 4, team: 'Independiente Santa Fe', pts: 7 },
  ]);
  assert.equal(getRowStatusBadge(t2000, cfRows[0], 'finalGroup', groups[0].groupName), 'Campeón ★');
  assert.equal(getRowStatusBadge(t2000, cfRows[1], 'finalGroup', groups[0].groupName), 'Subcampeón 🥈');

  const validTeams = new Set(apertura.map((r) => r.team));
  const playoffs = t2000.playoffMatches || [];
  assert.equal(playoffs.length, 12);
  assert.deepEqual(Array.from(new Set(playoffs.map((m) => m.stage))), [
    'Fecha 1', 'Fecha 2', 'Fecha 3', 'Fecha 4', 'Fecha 5', 'Fecha 6',
  ]);
  const cfTally = new Map(cfRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
  for (const m of playoffs) {
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical playoff homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical playoff awayTeam: ${m.awayTeam}`);
    assert.ok(/2000$/.test(m.date || ''), `Expected 2000 date in playoffMatches: ${m.date}`);
    assert.ok(m.venue && m.venue.includes('Estadio'), `Expected official venue for ${m.homeTeam} vs ${m.awayTeam}`);
    const h = cfTally.get(m.homeTeam)!;
    const a = cfTally.get(m.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += m.homeScore; h.gc += m.awayScore;
    a.gf += m.awayScore; a.gc += m.homeScore;
    if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
    else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
    else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
  }
  for (const r of cfRows) {
    assert.deepEqual(cfTally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
  }

  // 5. Complete 50/50 Junior matchArchive with 4 stage filter pills & 100% reconciliation
  const matches = t2000.matchArchive || [];
  assert.equal(matches.length, 50);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2000$/.test(m.date), `Expected 2000 date: ${m.date}`);
  }
  const lapOptions = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOptions.map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'cuadrangular']
  );

  // Confirm 1973, 1998, and 1999 (all 50-match archives) remain unaffected
  const t1973 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1973-triangular')!;
  const t1998 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1998-reclasificacion')!;
  const t1999 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1999-cuadrangular')!;
  assert.deepEqual(
    getMatchArchiveLapOptions(t1973.matchArchive!.length, t1973.matchArchive!).map((o) => o.id),
    ['all', 'apertura', 'finalizacion', '1', '2', '3', '4']
  );
  assert.deepEqual(
    getMatchArchiveLapOptions(t1998.matchArchive!.length, t1998.matchArchive!).map((o) => o.id),
    ['all', 'apertura', 'cuadrangular', 'finalizacion', '1', '2']
  );
  assert.deepEqual(
    getMatchArchiveLapOptions(t1999.matchArchive!.length, t1999.matchArchive!).map((o) => o.id),
    ['all', 'apertura', 'finalizacion', 'semifinal']
  );
  // Confirm 1998 Apertura still keeps its 36 matches (including Cuadrangularón D) while 2000 Apertura has strictly 22
  assert.equal(filterMatchArchiveFixtures(t1998.matchArchive!, { lap: 'apertura' }).length, 36);

  const ptsPerWin = getTournamentPointsPerWin(t2000.year);
  assert.equal(ptsPerWin, 3);
  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  const cfMatches = filterMatchArchiveFixtures(matches, { lap: 'cuadrangular' });
  assert.equal(apMatches.length, 22);
  assert.equal(finMatches.length, 22);
  assert.equal(cfMatches.length, 6);

  assert.deepEqual(computeJuniorMatchArchiveSummary(apMatches, ptsPerWin), {
    pj: 22, pg: 9, pe: 5, pp: 8, gf: 33, gc: 27, dg: 6, pts: 32,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finMatches, ptsPerWin), {
    pj: 22, pg: 10, pe: 8, pp: 4, gf: 37, gc: 23, dg: 14, pts: 38,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(cfMatches, ptsPerWin), {
    pj: 6, pg: 2, pe: 3, pp: 1, gf: 6, gc: 6, dg: 0, pts: 9,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches, ptsPerWin), {
    pj: 50, pg: 21, pe: 16, pp: 13, gf: 76, gc: 56, dg: 20, pts: 79,
  });
});

test('2001 Campeonato Colombiano audits Apertura (22), Finalización (22), Reclasificación (44), Cuadrangulares A/B + Gran Final (26 playoff matches, fixed 2-2) and complete 44-match Junior archive', () => {
  const t2001 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2001-reclasificacion');
  assert.ok(t2001, '2001-reclasificacion must exist');
  assert.equal(t2001.championTeam, 'América de Cali');
  assert.equal(t2001.runnerUpTeam, 'Independiente Medellín');
  assert.ok(!t2001.isJuniorChampion);
  assert.ok(!t2001.isJuniorRunnerUp);

  // 1. Apertura 2001 (22 PJ, 16 clubs, zero-sum)
  const apertura = t2001.regularRows || [];
  assert.equal(apertura.length, 16);
  let apPg = 0, apPe = 0, apPp = 0, apGf = 0, apGc = 0;
  for (let i = 0; i < apertura.length; i++) {
    const r = apertura[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 22);
    assert.equal(r.pg + r.pe + r.pp, 22);
    assert.equal(r.pg * 3 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
    apPg += r.pg; apPe += r.pe; apPp += r.pp; apGf += r.gf; apGc += r.gc;
  }
  assert.equal(apPg, 133);
  assert.equal(apPp, 133);
  assert.equal(apPe, 86);
  assert.equal(apGf, 440);
  assert.equal(apGc, 440);
  assert.equal(apertura[0].team, 'Cortuluá');
  assert.equal(apertura[0].pts, 42);
  assert.equal(getRowStatusBadge(t2001, apertura[0], 'regular'), 'Ganador · Lib. 2002');
  const jrAp = apertura.find((r) => r.isJunior)!;
  assert.equal(jrAp.pos, 8);
  assert.equal(jrAp.pts, 31);

  // 2. Finalización 2001 (22 PJ, 16 clubs, zero-sum)
  const fin = t2001.secondaryRegularTable?.rows || [];
  assert.equal(fin.length, 16);
  assert.equal(t2001.secondaryRegularTable?.badgeLabel, 'Torneo Finalización · 22 Fechas');
  assert.ok(!(t2001.secondaryRegularTable?.description || '').includes('Wikipedia'));
  let finPg = 0, finPe = 0, finPp = 0, finGf = 0, finGc = 0;
  for (let i = 0; i < fin.length; i++) {
    const r = fin[i];
    assert.equal(r.pos, i + 1);
    assert.equal(r.pj, 22);
    assert.equal(r.pg + r.pe + r.pp, 22);
    assert.equal(r.pg * 3 + r.pe, r.pts);
    assert.equal(r.gf - r.gc, r.dg);
    finPg += r.pg; finPe += r.pe; finPp += r.pp; finGf += r.gf; finGc += r.gc;
  }
  assert.equal(finPg, 127);
  assert.equal(finPp, 127);
  assert.equal(finPe, 98);
  assert.equal(finGf, 433);
  assert.equal(finGc, 433);
  assert.equal(fin[0].team, 'Once Caldas');
  assert.equal(fin[0].pts, 43);
  assert.equal(getRowStatusBadge(t2001, fin[0], 'secondaryRegular'), 'Ganador · Lib. 2002');
  const jrFin = fin.find((r) => r.isJunior)!;
  assert.equal(jrFin.pos, 12);
  assert.equal(jrFin.pts, 25);

  // 3. Reclasificación Regular 2001 (44 PJ, exact Apertura + Finalización)
  const reclas = t2001.tertiaryRegularTable?.rows || [];
  assert.equal(reclas.length, 16);
  assert.equal(t2001.tertiaryRegularTable?.badgeLabel, 'Reclasificación Regular · 44 Fechas');
  const apByTeam = new Map(apertura.map((r) => [r.team, r]));
  const finByTeam = new Map(fin.map((r) => [r.team, r]));
  let rPg = 0, rPe = 0, rPp = 0, rGf = 0, rGc = 0;
  for (let i = 0; i < reclas.length; i++) {
    const r = reclas[i];
    assert.equal(r.pos, i + 1);
    const a = apByTeam.get(r.team)!;
    const b = finByTeam.get(r.team)!;
    assert.deepEqual(
      { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, dg: r.dg, pts: r.pts },
      { pj: a.pj + b.pj, pg: a.pg + b.pg, pe: a.pe + b.pe, pp: a.pp + b.pp, gf: a.gf + b.gf, gc: a.gc + b.gc, dg: a.dg + b.dg, pts: a.pts + b.pts },
      `2001 Reclasificación mismatch for ${r.team}`
    );
    rPg += r.pg; rPe += r.pe; rPp += r.pp; rGf += r.gf; rGc += r.gc;
  }
  assert.equal(rPg, 260);
  assert.equal(rPp, 260);
  assert.equal(rPe, 184);
  assert.equal(rGf, 873);
  assert.equal(rGc, 873);
  assert.equal(reclas[0].team, 'Once Caldas');
  assert.equal(reclas[0].pts, 81);
  assert.equal(reclas[10].team, 'Junior de Barranquilla');
  assert.equal(reclas[10].pts, 56);
  assert.equal(getRowStatusBadge(t2001, reclas[0], 'tertiaryRegular'), 'Clasif. · Lib. 2002');
  assert.equal(getRowStatusBadge(t2001, reclas[2], 'tertiaryRegular'), 'Campeón ★ · Lib.');
  assert.equal(getRowStatusBadge(t2001, reclas[5], 'tertiaryRegular'), 'Clasif. · Lib. 2002');
  assert.equal(getRowStatusBadge(t2001, reclas[7], 'tertiaryRegular'), 'Subcampeón');
  assert.equal(getRowStatusBadge(t2001, reclas[15], 'tertiaryRegular'), 'Promoción · Perm.');

  // 4. Cuadrangulares Semifinales A & B + Gran Final (26 official playoff matches)
  const groups = t2001.finalGroups || [];
  assert.equal(groups.length, 2);
  assert.equal(groups[0].groupName, 'Cuadrangular Semifinal · Grupo A');
  assert.equal(groups[1].groupName, 'Cuadrangular Semifinal · Grupo B');

  const validTeams = new Set(apertura.map((r) => r.team));
  const playoffs = t2001.playoffMatches || [];
  assert.equal(playoffs.length, 26);
  // Regression guard: Grupo A Fecha 1 América 2-2 Once Caldas (fixing Wikipedia ES 0-0 typo)
  const ameOnc = playoffs.find((m) => m.stage === 'Grupo A · Fecha 1' && m.homeTeam === 'América de Cali')!;
  assert.ok(ameOnc);
  assert.equal(ameOnc.homeScore, 2);
  assert.equal(ameOnc.awayScore, 2);

  for (const m of playoffs) {
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical playoff homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical playoff awayTeam: ${m.awayTeam}`);
    assert.ok(!m.homeTeam.endsWith('.') && !m.awayTeam.endsWith('.'));
    assert.ok(/2001$/.test(m.date || ''), `Expected 2001 date in playoffMatches: ${m.date}`);
    assert.ok(m.venue && m.venue.includes('Estadio'), `Expected official venue for ${m.homeTeam} vs ${m.awayTeam}`);
  }

  for (const [grpIdx, prefix] of [[0, 'Grupo A · '], [1, 'Grupo B · ']] as const) {
    const gRows = groups[grpIdx].rows;
    const gMatches = playoffs.filter((m) => m.stage.startsWith(prefix));
    assert.equal(gMatches.length, 12);
    const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
    for (const m of gMatches) {
      const h = tally.get(m.homeTeam)!;
      const a = tally.get(m.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += m.homeScore; h.gc += m.awayScore;
      a.gf += m.awayScore; a.gc += m.homeScore;
      if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
      else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
      else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
    }
    for (const r of gRows) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    }
  }
  const finalMatches = playoffs.filter((m) => m.stage.startsWith('Gran Final'));
  assert.equal(finalMatches.length, 2);
  assert.equal(finalMatches[0].homeScore, 0);
  assert.equal(finalMatches[0].awayScore, 1);
  assert.equal(finalMatches[1].homeScore, 2);
  assert.equal(finalMatches[1].awayScore, 0);

  // 5. Complete 44/44 Junior matchArchive with 3 stage filter pills & 100% reconciliation
  const matches = t2001.matchArchive || [];
  assert.equal(matches.length, 44);
  for (const m of matches) {
    assert.ok(/junior/i.test(m.homeTeam) || /junior/i.test(m.awayTeam));
    assert.ok(validTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(validTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2001$/.test(m.date), `Expected 2001 date: ${m.date}`);
  }
  const lapOptions = getMatchArchiveLapOptions(matches.length, matches);
  assert.deepEqual(
    lapOptions.map((o) => o.id),
    ['all', 'apertura', 'finalizacion']
  );

  const ptsPerWin = getTournamentPointsPerWin(t2001.year);
  assert.equal(ptsPerWin, 3);
  const apMatches = filterMatchArchiveFixtures(matches, { lap: 'apertura' });
  const finMatches = filterMatchArchiveFixtures(matches, { lap: 'finalizacion' });
  assert.equal(apMatches.length, 22);
  assert.equal(finMatches.length, 22);

  assert.deepEqual(computeJuniorMatchArchiveSummary(apMatches, ptsPerWin), {
    pj: 22, pg: 8, pe: 7, pp: 7, gf: 22, gc: 23, dg: -1, pts: 31,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finMatches, ptsPerWin), {
    pj: 22, pg: 6, pe: 7, pp: 9, gf: 27, gc: 29, dg: -2, pts: 25,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(matches, ptsPerWin), {
    pj: 44, pg: 14, pe: 14, pp: 16, gf: 49, gc: 52, dg: -3, pts: 56,
  });
});

test('2002-I and 2002-II short tournaments and independent Reclasificación Anual 2002 reconcile 100% mathematically', () => {
  const t2002I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2002-I-regular');
  const t2002II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2002-II-regular');
  assert.ok(t2002I, '2002-I-regular must exist');
  assert.ok(t2002II, '2002-II-regular must exist');

  // Reclasificación MUST be independent, never embedded inside 2002-I or 2002-II Todos contra Todos
  assert.equal(t2002I.secondaryRegularTable, undefined);
  assert.equal(t2002I.tertiaryRegularTable, undefined);
  assert.equal(t2002II.secondaryRegularTable, undefined);
  assert.equal(t2002II.tertiaryRegularTable, undefined);

  assert.equal(t2002I.championTeam, 'América de Cali');
  assert.equal(t2002I.runnerUpTeam, 'Atlético Nacional');
  assert.equal(t2002II.championTeam, 'Independiente Medellín');
  assert.equal(t2002II.runnerUpTeam, 'Deportivo Pasto');

  // Verify both regular tables (18 clubs, 22 PJ, zero-sum PG=PP, GF=GC, 3*PG+PE=PTS)
  for (const [tbl, expectedSum] of [
    [t2002I, { pg: 133, pe: 130, pp: 133, gf: 436, gc: 436 }],
    [t2002II, { pg: 142, pe: 112, pp: 142, gf: 471, gc: 471 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 22);
      assert.equal(r.pg + r.pe + r.pp, 22);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  // Verify Cuadrangulares A & B + Gran Final match-to-standings reconciliation for both semesters
  const verifySemesterPlayoffs = (tbl: typeof t2002I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2002$/.test(m.date || ''), `Expected 2002 date in ${tbl.id}: ${m.date}`);
      assert.ok(!String(m.date).includes('24/10'), `Regression guard: 24/10 typo found in ${tbl.id}`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    const finals = playoffs.filter((m) => m.stage === 'Gran Final');
    assert.equal(finals.length, 2);
  };

  verifySemesterPlayoffs(t2002I);
  verifySemesterPlayoffs(t2002II);

  // Regression guard: 2002-I Grupo B Santa Fe (9-5) and Envigado (6-4) fixed against RSSSF
  const sf2002I = t2002I.finalGroups![1].rows.find((r) => r.team === 'Independiente Santa Fe')!;
  const env2002I = t2002I.finalGroups![1].rows.find((r) => r.team === 'Envigado F.C')!;
  assert.equal(sf2002I.gf, 9);
  assert.equal(sf2002I.gc, 5);
  assert.equal(env2002I.gf, 6);
  assert.equal(env2002I.gc, 4);

  // Verify 22 + 22 Junior matchArchive exact reconciliation
  const apArchive = t2002I.matchArchive || [];
  const finArchive = t2002II.matchArchive || [];
  assert.equal(apArchive.length, 22);
  assert.equal(finArchive.length, 22);

  const canonicalTeams = new Set((t2002I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2002$/.test(m.date), `Expected 2002 date: ${m.date}`);
  }
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 22, pg: 7, pe: 5, pp: 10, gf: 19, gc: 25, dg: -6, pts: 26,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 22, pg: 4, pe: 9, pp: 9, gf: 27, gc: 33, dg: -6, pts: 21,
  });

  // Verify independent Reclasificación Anual 2002 matches exact arithmetic sum of 2002-I + 2002-II + playoffs
  const rec2002 = getAnnualReclassificationByYear('2002-I');
  assert.ok(rec2002 && rec2002.id === 'reclasificacion-2002');
  assert.equal(getAnnualReclassificationByYear('2002-II')?.id, 'reclasificacion-2002');
  assert.equal(ANNUAL_RECLASSIFICATION_TABLES[0].rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2002I, t2002II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2002.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2002 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2002.rows[0].team, 'Deportivo Cali');
  assert.equal(rec2002.rows[0].pts, 104);
  assert.equal(rec2002.rows[14].team, 'Junior de Barranquilla');
  assert.equal(rec2002.rows[14].pts, 47);
  assert.equal(rec2002.rows[17].team, 'Real Cartagena');
});

test('2003-I and 2003-II short tournaments, 50 Junior archive matches, stage filters, and independent Reclasificación Anual 2003 reconcile 100% mathematically', () => {
  const t2003I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2003-I-cuadrangular');
  const t2003II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2003-II-cuadrangular');
  assert.ok(t2003I, '2003-I-cuadrangular must exist');
  assert.ok(t2003II, '2003-II-cuadrangular must exist');

  // Reclasificación MUST remain independent, never embedded inside 2003-I or 2003-II
  assert.equal(t2003I.secondaryRegularTable, undefined);
  assert.equal(t2003I.tertiaryRegularTable, undefined);
  assert.equal(t2003II.secondaryRegularTable, undefined);
  assert.equal(t2003II.tertiaryRegularTable, undefined);

  assert.equal(t2003I.championTeam, 'Once Caldas');
  assert.equal(t2003I.runnerUpTeam, 'Junior de Barranquilla');
  assert.equal(t2003II.championTeam, 'Deportes Tolima');
  assert.equal(t2003II.runnerUpTeam, 'Deportivo Cali');

  // Verify both 18-club, 18-round regular tables (zero-sum PG=PP, GF=GC, 3*PG+PE=PTS)
  for (const [tbl, expectedSum] of [
    [t2003I, { pg: 114, pe: 96, pp: 114, gf: 385, gc: 385 }],
    [t2003II, { pg: 114, pe: 96, pp: 114, gf: 379, gc: 379 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, 18);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  // Forensic regression guard: Junior 2003-I regular is 27 pts (8-3-7, 19-18) and Pereira is 8th (26 pts, 7 PG)
  const jun2003IReg = t2003I.regularRows!.find((r) => r.team === 'Junior de Barranquilla')!;
  const per2003IReg = t2003I.regularRows!.find((r) => r.team === 'Deportivo Pereira')!;
  assert.deepEqual(
    { pos: jun2003IReg.pos, pj: jun2003IReg.pj, pg: jun2003IReg.pg, pe: jun2003IReg.pe, pp: jun2003IReg.pp, gf: jun2003IReg.gf, gc: jun2003IReg.gc, pts: jun2003IReg.pts },
    { pos: 6, pj: 18, pg: 8, pe: 3, pp: 7, gf: 19, gc: 18, pts: 27 }
  );
  assert.equal(per2003IReg.pos, 8);
  assert.equal(per2003IReg.pts, 26);

  // Verify Cuadrangulares A & B + Gran Final match-to-standings reconciliation for both 2003 semesters
  const verifySemesterPlayoffs = (tbl: typeof t2003I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2003$/.test(m.date || ''), `Expected 2003 date in ${tbl.id}: ${m.date}`);
      assert.ok(!String(m.date).includes('9 de junio'), `Regression guard: 9 de junio typo found in ${tbl.id}`);
      assert.ok(m.homeTeam !== 'Millonarios F.C.' && m.awayTeam !== 'Millonarios F.C.', `Non-canonical Millonarios trailing dot in ${tbl.id}`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    const finals = playoffs.filter((m) => m.stage === 'Gran Final');
    assert.equal(finals.length, 2);
  };

  verifySemesterPlayoffs(t2003I);
  verifySemesterPlayoffs(t2003II);

  // Regression guard: restored Cuadrangular A Round 4 matches in 2003-I
  const r4Am = t2003I.playoffMatches!.find(
    (m) => m.stage === 'Cuadrangular A' && m.homeTeam === 'América de Cali' && m.awayTeam === 'Unión Magdalena' && m.homeScore === 4 && m.awayScore === 1
  );
  const r4Oc = t2003I.playoffMatches!.find(
    (m) => m.stage === 'Cuadrangular A' && m.homeTeam === 'Once Caldas' && m.awayTeam === 'Deportivo Cali' && m.homeScore === 1 && m.awayScore === 1
  );
  assert.ok(r4Am && r4Am.date === '25 may 2003');
  assert.ok(r4Oc && r4Oc.date === '26 may 2003');

  // Verify 26 (2003-I) + 24 (2003-II) Junior matchArchive exact reconciliation & stage filters
  const apArchive = t2003I.matchArchive || [];
  const finArchive = t2003II.matchArchive || [];
  assert.equal(apArchive.length, 26);
  assert.equal(finArchive.length, 24);

  const canonicalTeams = new Set((t2003I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2003$/.test(m.date), `Expected 2003 date: ${m.date}`);
  }

  // Stage filter options & counts for 26-match (2003-I) and 24-match (2003-II) archives
  const apLapOpts = getMatchArchiveLapOptions(apArchive.length, apArchive);
  assert.deepEqual(apLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  const apRegular = filterMatchArchiveFixtures(apArchive, { lap: 'apertura' });
  const apCuad = filterMatchArchiveFixtures(apArchive, { lap: 'semifinal' });
  const apFinal = filterMatchArchiveFixtures(apArchive, { lap: 'final' });
  assert.equal(apRegular.length, 18);
  assert.equal(apCuad.length, 6);
  assert.equal(apFinal.length, 2);

  assert.deepEqual(computeJuniorMatchArchiveSummary(apRegular, 3), {
    pj: 18, pg: 8, pe: 3, pp: 7, gf: 19, gc: 18, dg: 1, pts: 27,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apCuad, 3), {
    pj: 6, pg: 4, pe: 0, pp: 2, gf: 9, gc: 5, dg: 4, pts: 12,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apFinal, 3), {
    pj: 2, pg: 0, pe: 1, pp: 1, gf: 0, gc: 1, dg: -1, pts: 1,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 26, pg: 12, pe: 4, pp: 10, gf: 28, gc: 24, dg: 4, pts: 40,
  });

  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal']);
  const finRegular = filterMatchArchiveFixtures(finArchive, { lap: 'apertura' });
  const finCuad = filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' });
  assert.equal(finRegular.length, 18);
  assert.equal(finCuad.length, 6);

  assert.deepEqual(computeJuniorMatchArchiveSummary(finRegular, 3), {
    pj: 18, pg: 7, pe: 4, pp: 7, gf: 24, gc: 28, dg: -4, pts: 25,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finCuad, 3), {
    pj: 6, pg: 3, pe: 1, pp: 2, gf: 8, gc: 7, dg: 1, pts: 10,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 24, pg: 10, pe: 5, pp: 9, gf: 32, gc: 35, dg: -3, pts: 35,
  });

  // Verify independent Reclasificación Anual 2003 matches exact arithmetic sum of 2003-I + 2003-II + playoffs
  const rec2003 = getAnnualReclassificationByYear('2003-I');
  assert.ok(rec2003 && rec2003.id === 'reclasificacion-2003');
  assert.equal(getAnnualReclassificationByYear('2003-II')?.id, 'reclasificacion-2003');
  assert.equal(rec2003.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2003I, t2003II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2003.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2003 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2003.rows[0].team, 'Deportivo Cali');
  assert.equal(rec2003.rows[0].pts, 88);
  assert.equal(rec2003.rows[1].team, 'Junior de Barranquilla');
  assert.equal(rec2003.rows[1].pts, 75);
  assert.equal(rec2003.rows[2].team, 'Millonarios F.C');
  assert.equal(rec2003.rows[2].pts, 74);
  assert.equal(rec2003.rows[10].team, 'Centauros Villavicencio');
  assert.equal(rec2003.rows[10].pts, 53);
});

// ── 83. 2004 Full Audit: 2004-I, 2004-II (5ª Estrella), 50 Junior Matches & Reclasificación 2004 ──
test('83. 2004 full audit: zero-sum regular tables, 52 playoffs, 24+26 Junior archive, and Reclasificación 2004', () => {
  const t2004I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2004-I-cuadrangular')!;
  const t2004II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2004-II-cuadrangular')!;
  assert.ok(t2004I && t2004II);

  assert.equal(t2004I.championTeam, 'Independiente Medellín');
  assert.equal(t2004I.runnerUpTeam, 'Atlético Nacional');
  assert.equal(t2004I.secondaryRegularTable, undefined);
  assert.equal(t2004I.tertiaryRegularTable, undefined);

  assert.equal(t2004II.championTeam, 'Junior de Barranquilla');
  assert.equal(t2004II.runnerUpTeam, 'Atlético Nacional');
  assert.equal(t2004II.isJuniorChampion, true);
  assert.equal(t2004II.secondaryRegularTable, undefined);
  assert.equal(t2004II.tertiaryRegularTable, undefined);

  for (const [tbl, expectedSum] of [
    [t2004I, { pg: 117, pe: 90, pp: 117, gf: 390, gc: 390 }],
    [t2004II, { pg: 124, pe: 76, pp: 124, gf: 376, gc: 376 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  const verifySemesterPlayoffs = (tbl: typeof t2004I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2004$/.test(m.date || ''), `Expected 2004 date in ${tbl.id}: ${m.date}`);
      assert.ok(m.homeTeam !== 'Chicó FC' && m.awayTeam !== 'Chicó FC', `Non-canonical Chicó FC in ${tbl.id}`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    assert.equal(playoffs.filter((m) => m.stage === 'Gran Final').length, 2);
  };

  verifySemesterPlayoffs(t2004I);
  verifySemesterPlayoffs(t2004II);

  const apArchive = t2004I.matchArchive || [];
  const finArchive = t2004II.matchArchive || [];
  assert.equal(apArchive.length, 24);
  assert.equal(finArchive.length, 26);

  const canonicalTeams = new Set((t2004I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2004$/.test(m.date), `Expected 2004 date: ${m.date}`);
  }

  const apLapOpts = getMatchArchiveLapOptions(apArchive.length, apArchive);
  assert.deepEqual(apLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.ok(apLapOpts.some((o) => o.id === 'semifinal' && o.label.includes('Cuadrangular A (6)')));
  const apRegular = filterMatchArchiveFixtures(apArchive, { lap: 'apertura' });
  const apCuad = filterMatchArchiveFixtures(apArchive, { lap: 'semifinal' });
  assert.equal(apRegular.length, 18);
  assert.equal(apCuad.length, 6);
  assert.deepEqual(computeJuniorMatchArchiveSummary(apRegular, 3), {
    pj: 18, pg: 8, pe: 6, pp: 4, gf: 26, gc: 16, dg: 10, pts: 30,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apCuad, 3), {
    pj: 6, pg: 1, pe: 3, pp: 2, gf: 4, gc: 8, dg: -4, pts: 6,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 24, pg: 9, pe: 9, pp: 6, gf: 30, gc: 24, dg: 6, pts: 36,
  });

  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  assert.ok(finLapOpts.some((o) => o.id === 'semifinal' && o.label.includes('Cuadrangular B (6)')));
  assert.ok(finLapOpts.some((o) => o.id === 'final' && o.label.includes('Gran Final (2)')));
  const finRegular = filterMatchArchiveFixtures(finArchive, { lap: 'apertura' });
  const finCuad = filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' });
  const finFinal = filterMatchArchiveFixtures(finArchive, { lap: 'final' });
  assert.equal(finRegular.length, 18);
  assert.equal(finCuad.length, 6);
  assert.equal(finFinal.length, 2);
  assert.deepEqual(computeJuniorMatchArchiveSummary(finRegular, 3), {
    pj: 18, pg: 7, pe: 7, pp: 4, gf: 26, gc: 21, dg: 5, pts: 28,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finCuad, 3), {
    pj: 6, pg: 4, pe: 1, pp: 1, gf: 11, gc: 5, dg: 6, pts: 13,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finFinal, 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 5, gc: 5, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 26, pg: 12, pe: 8, pp: 6, gf: 42, gc: 31, dg: 11, pts: 44,
  });

  const rec2004 = getAnnualReclassificationByYear('2004-I');
  assert.ok(rec2004 && rec2004.id === 'reclasificacion-2004');
  assert.equal(getAnnualReclassificationByYear('2004-II')?.id, 'reclasificacion-2004');
  assert.equal(rec2004.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2004I, t2004II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2004.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2004 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2004.rows[0].team, 'América de Cali');
  assert.equal(rec2004.rows[0].pts, 94);
  assert.equal(rec2004.rows[1].team, 'Atlético Nacional');
  assert.equal(rec2004.rows[1].pts, 88);
  assert.equal(rec2004.rows[2].team, 'Independiente Medellín');
  assert.equal(rec2004.rows[2].pts, 80);
  assert.equal(rec2004.rows[3].team, 'Junior de Barranquilla');
  assert.equal(rec2004.rows[3].pts, 80);
  assert.equal(rec2004.rows[4].team, 'Deportivo Cali');
  assert.equal(rec2004.rows[4].pts, 80);
  assert.equal(rec2004.rows[11].team, 'Cortuluá');
  assert.equal(rec2004.rows[11].pts, 41);
});

// ── 84. 2005 Full Audit: 2005-I, 2005-II, 42 Junior Matches & Reclasificación 2005 ──
test('84. 2005 full audit: zero-sum regular tables, 52 playoffs, 18+24 Junior archive, and Reclasificación 2005', () => {
  const t2005I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2005-I-regular')!;
  const t2005II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2005-II-cuadrangular')!;
  assert.ok(t2005I && t2005II);

  assert.equal(t2005I.championTeam, 'Atlético Nacional');
  assert.equal(t2005I.runnerUpTeam, 'Independiente Santa Fe');
  assert.equal(t2005I.secondaryRegularTable, undefined);
  assert.equal(t2005I.tertiaryRegularTable, undefined);

  assert.equal(t2005II.championTeam, 'Deportivo Cali');
  assert.equal(t2005II.runnerUpTeam, 'Real Cartagena');
  assert.equal(t2005II.secondaryRegularTable, undefined);
  assert.equal(t2005II.tertiaryRegularTable, undefined);

  for (const [tbl, expectedSum] of [
    [t2005I, { pg: 109, pe: 106, pp: 109, gf: 380, gc: 380 }],
    [t2005II, { pg: 122, pe: 80, pp: 122, gf: 397, gc: 397 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  const verifySemesterPlayoffs = (tbl: typeof t2005I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2005$/.test(m.date || ''), `Expected 2005 date in ${tbl.id}: ${m.date}`);
      assert.ok(m.homeTeam !== 'Envigado F.C.' && m.awayTeam !== 'Envigado F.C.', `Non-canonical Envigado dot in ${tbl.id}`);
      assert.ok(m.homeTeam !== 'Cartagena' && m.awayTeam !== 'Cartagena', `Non-canonical Cartagena short name in ${tbl.id}`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    assert.equal(playoffs.filter((m) => m.stage === 'Gran Final').length, 2);
  };

  verifySemesterPlayoffs(t2005I);
  verifySemesterPlayoffs(t2005II);

  const apArchive = t2005I.matchArchive || [];
  const finArchive = t2005II.matchArchive || [];
  assert.equal(apArchive.length, 18);
  assert.equal(finArchive.length, 24);

  const canonicalTeams = new Set((t2005I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2005$/.test(m.date), `Expected 2005 date: ${m.date}`);
  }

  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 18, pg: 7, pe: 4, pp: 7, gf: 26, gc: 23, dg: 3, pts: 25,
  });

  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.ok(finLapOpts.some((o) => o.id === 'semifinal' && o.label.includes('Cuadrangular A (6)')));
  const finRegular = filterMatchArchiveFixtures(finArchive, { lap: 'apertura' });
  const finCuad = filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' });
  assert.equal(finRegular.length, 18);
  assert.equal(finCuad.length, 6);
  assert.deepEqual(computeJuniorMatchArchiveSummary(finRegular, 3), {
    pj: 18, pg: 9, pe: 2, pp: 7, gf: 22, gc: 27, dg: -5, pts: 29,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finCuad, 3), {
    pj: 6, pg: 3, pe: 1, pp: 2, gf: 7, gc: 8, dg: -1, pts: 10,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 24, pg: 12, pe: 3, pp: 9, gf: 29, gc: 35, dg: -6, pts: 39,
  });

  const rec2005 = getAnnualReclassificationByYear('2005-I');
  assert.ok(rec2005 && rec2005.id === 'reclasificacion-2005');
  assert.equal(getAnnualReclassificationByYear('2005-II')?.id, 'reclasificacion-2005');
  assert.equal(rec2005.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2005I, t2005II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2005.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2005 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2005.rows[0].team, 'Atlético Nacional');
  assert.equal(rec2005.rows[0].pts, 80);
  assert.equal(rec2005.rows[1].team, 'Independiente Santa Fe');
  assert.equal(rec2005.rows[1].pts, 78);
  assert.equal(rec2005.rows[2].team, 'Deportivo Cali');
  assert.equal(rec2005.rows[2].pts, 75);
  assert.equal(rec2005.rows[6].team, 'Junior de Barranquilla');
  assert.equal(rec2005.rows[6].pts, 64);
  assert.equal(rec2005.rows[17].team, 'Unión Magdalena');
  assert.equal(rec2005.rows[17].pts, 23);
});

// ── 85. 2006 Full Audit: 2006-I, 2006-II, 36 Junior Matches & Reclasificación 2006 ──
test('85. 2006 full audit: zero-sum regular tables, 52 playoffs, 18+18 Junior archive, and Reclasificación 2006', () => {
  const t2006I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2006-I-regular')!;
  const t2006II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2006-II-regular')!;
  assert.ok(t2006I && t2006II);

  assert.equal(t2006I.championTeam, 'Deportivo Pasto');
  assert.equal(t2006I.runnerUpTeam, 'Deportivo Cali');
  assert.equal(t2006I.secondaryRegularTable, undefined);
  assert.equal(t2006I.tertiaryRegularTable, undefined);

  assert.equal(t2006II.championTeam, 'Cúcuta Deportivo');
  assert.equal(t2006II.runnerUpTeam, 'Deportes Tolima');
  assert.equal(t2006II.secondaryRegularTable, undefined);
  assert.equal(t2006II.tertiaryRegularTable, undefined);

  for (const [tbl, expectedSum] of [
    [t2006I, { pg: 119, pe: 86, pp: 119, gf: 404, gc: 404 }],
    [t2006II, { pg: 127, pe: 70, pp: 127, gf: 414, gc: 414 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  const verifySemesterPlayoffs = (tbl: typeof t2006I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2006$/.test(m.date || ''), `Expected 2006 date in ${tbl.id}: ${m.date}`);
      assert.ok(m.homeTeam !== 'Millonarios F.C.' && m.awayTeam !== 'Millonarios F.C.', `Non-canonical Millonarios trailing dot in ${tbl.id}`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    assert.equal(playoffs.filter((m) => m.stage === 'Gran Final').length, 2);
  };

  verifySemesterPlayoffs(t2006I);
  verifySemesterPlayoffs(t2006II);

  const apArchive = t2006I.matchArchive || [];
  const finArchive = t2006II.matchArchive || [];
  assert.equal(apArchive.length, 18);
  assert.equal(finArchive.length, 18);

  const canonicalTeams = new Set((t2006I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2006$/.test(m.date), `Expected 2006 date: ${m.date}`);
  }

  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 18, pg: 4, pe: 5, pp: 9, gf: 22, gc: 29, dg: -7, pts: 17,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 18, pg: 5, pe: 5, pp: 8, gf: 19, gc: 29, dg: -10, pts: 20,
  });

  const rec2006 = getAnnualReclassificationByYear('2006-I');
  assert.ok(rec2006 && rec2006.id === 'reclasificacion-2006');
  assert.equal(getAnnualReclassificationByYear('2006-II')?.id, 'reclasificacion-2006');
  assert.equal(rec2006.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2006I, t2006II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2006.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2006 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2006.rows[0].team, 'Cúcuta Deportivo');
  assert.equal(rec2006.rows[0].pts, 92);
  assert.equal(rec2006.rows[1].team, 'Deportes Tolima');
  assert.equal(rec2006.rows[1].pts, 88);
  assert.equal(rec2006.rows[2].team, 'Deportivo Pasto');
  assert.equal(rec2006.rows[2].pts, 82);
  assert.equal(rec2006.rows[15].team, 'Junior de Barranquilla');
  assert.equal(rec2006.rows[15].pts, 37);
  assert.equal(rec2006.rows[16].team, 'Envigado F.C');
  assert.equal(rec2006.rows[16].pts, 34);
});

// ── 86. 2007 Full Audit: 2007-I, 2007-II, 36 Junior Matches & Reclasificación 2007 ──
test('86. 2007 full audit: zero-sum regular tables, 52 playoffs, 18+18 Junior archive, and Reclasificación 2007', () => {
  const t2007I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2007-I-regular')!;
  const t2007II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2007-II-regular')!;
  assert.ok(t2007I && t2007II);

  assert.equal(t2007I.championTeam, 'Atlético Nacional');
  assert.equal(t2007I.runnerUpTeam, 'Atlético Huila');
  assert.equal(t2007I.secondaryRegularTable, undefined);
  assert.equal(t2007I.tertiaryRegularTable, undefined);

  assert.equal(t2007II.championTeam, 'Atlético Nacional');
  assert.equal(t2007II.runnerUpTeam, 'La Equidad');
  assert.equal(t2007II.secondaryRegularTable, undefined);
  assert.equal(t2007II.tertiaryRegularTable, undefined);

  for (const [tbl, expectedSum] of [
    [t2007I, { pg: 114, pe: 96, pp: 114, gf: 414, gc: 414 }],
    [t2007II, { pg: 118, pe: 88, pp: 118, gf: 400, gc: 400 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  const verifySemesterPlayoffs = (tbl: typeof t2007I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2007$/.test(m.date || ''), `Expected 2007 date in ${tbl.id}: ${m.date}`);
      assert.ok(m.homeTeam !== 'Millonarios F.C.' && m.awayTeam !== 'Millonarios F.C.', `Non-canonical Millonarios trailing dot in ${tbl.id}`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    assert.equal(playoffs.filter((m) => m.stage === 'Gran Final').length, 2);
  };

  verifySemesterPlayoffs(t2007I);
  verifySemesterPlayoffs(t2007II);

  const apArchive = t2007I.matchArchive || [];
  const finArchive = t2007II.matchArchive || [];
  assert.equal(apArchive.length, 18);
  assert.equal(finArchive.length, 18);

  const canonicalTeams = new Set((t2007I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2007$/.test(m.date), `Expected 2007 date: ${m.date}`);
  }

  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 18, pg: 5, pe: 8, pp: 5, gf: 22, gc: 26, dg: -4, pts: 23,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 18, pg: 5, pe: 3, pp: 10, gf: 17, gc: 28, dg: -11, pts: 18,
  });

  const rec2007 = getAnnualReclassificationByYear('2007-I');
  assert.ok(rec2007 && rec2007.id === 'reclasificacion-2007');
  assert.equal(getAnnualReclassificationByYear('2007-II')?.id, 'reclasificacion-2007');
  assert.equal(rec2007.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2007I, t2007II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2007.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2007 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2007.rows[0].team, 'Atlético Nacional');
  assert.equal(rec2007.rows[0].pts, 104);
  assert.equal(rec2007.rows[1].team, 'Cúcuta Deportivo');
  assert.equal(rec2007.rows[1].pts, 79);
  assert.equal(rec2007.rows[2].team, 'Boyacá Chicó');
  assert.equal(rec2007.rows[2].pts, 67);
  assert.equal(rec2007.rows[15].team, 'Junior de Barranquilla');
  assert.equal(rec2007.rows[15].pts, 41);
  assert.equal(rec2007.rows[17].team, 'Real Cartagena');
  assert.equal(rec2007.rows[17].pts, 31);
});

// ── 87. 2008 Full Audit: 2008-I, 2008-II, 42 Junior Matches & Reclasificación 2008 ──
test('87. 2008 full audit: zero-sum regular tables, 52 playoffs, 18+24 Junior archive, and Reclasificación 2008', () => {
  const t2008I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2008-I-regular')!;
  const t2008II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2008-II-cuadrangular')!;
  assert.ok(t2008I && t2008II);

  assert.equal(t2008I.championTeam, 'Boyacá Chicó');
  assert.equal(t2008I.runnerUpTeam, 'América de Cali');
  assert.equal(t2008I.secondaryRegularTable, undefined);
  assert.equal(t2008I.tertiaryRegularTable, undefined);

  assert.equal(t2008II.championTeam, 'América de Cali');
  assert.equal(t2008II.runnerUpTeam, 'Independiente Medellín');
  assert.equal(t2008II.secondaryRegularTable, undefined);
  assert.equal(t2008II.tertiaryRegularTable, undefined);

  for (const [tbl, expectedSum] of [
    [t2008I, { pg: 124, pe: 76, pp: 124, gf: 406, gc: 406 }],
    [t2008II, { pg: 123, pe: 78, pp: 123, gf: 353, gc: 353 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  const verifySemesterPlayoffs = (tbl: typeof t2008I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2008$/.test(m.date || ''), `Expected 2008 date in ${tbl.id}: ${m.date}`);
      assert.ok(m.homeTeam !== 'Envigado F.C.' && m.awayTeam !== 'Envigado F.C.', `Non-canonical Envigado trailing dot in ${tbl.id}`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    assert.equal(playoffs.filter((m) => m.stage === 'Gran Final').length, 2);
  };

  verifySemesterPlayoffs(t2008I);
  verifySemesterPlayoffs(t2008II);

  const apArchive = t2008I.matchArchive || [];
  const finArchive = t2008II.matchArchive || [];
  assert.equal(apArchive.length, 18);
  assert.equal(finArchive.length, 24);

  const canonicalTeams = new Set((t2008I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2008$/.test(m.date), `Expected 2008 date: ${m.date}`);
  }

  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 18, pg: 7, pe: 3, pp: 8, gf: 21, gc: 23, dg: -2, pts: 24,
  });

  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.ok(finLapOpts.some((o) => o.id === 'semifinal' && o.label.includes('Cuadrangular B (6)')));
  const finRegular = filterMatchArchiveFixtures(finArchive, { lap: 'apertura' });
  const finCuad = filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' });
  assert.equal(finRegular.length, 18);
  assert.equal(finCuad.length, 6);
  assert.deepEqual(computeJuniorMatchArchiveSummary(finRegular, 3), {
    pj: 18, pg: 10, pe: 1, pp: 7, gf: 27, gc: 19, dg: 8, pts: 31,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finCuad, 3), {
    pj: 6, pg: 2, pe: 1, pp: 3, gf: 9, gc: 8, dg: 1, pts: 7,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 24, pg: 12, pe: 2, pp: 10, gf: 36, gc: 27, dg: 9, pts: 38,
  });

  const rec2008 = getAnnualReclassificationByYear('2008-I');
  assert.ok(rec2008 && rec2008.id === 'reclasificacion-2008');
  assert.equal(getAnnualReclassificationByYear('2008-II')?.id, 'reclasificacion-2008');
  assert.equal(rec2008.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2008I, t2008II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2008.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2008 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2008.rows[0].team, 'América de Cali');
  assert.equal(rec2008.rows[0].pts, 87);
  assert.equal(rec2008.rows[1].team, 'Independiente Medellín');
  assert.equal(rec2008.rows[1].pts, 78);
  assert.equal(rec2008.rows[2].team, 'La Equidad');
  assert.equal(rec2008.rows[2].pts, 76);
  assert.equal(rec2008.rows[6].team, 'Junior de Barranquilla');
  assert.equal(rec2008.rows[6].pts, 62);
  assert.equal(rec2008.rows[14].team, 'Atlético Bucaramanga');
  assert.equal(rec2008.rows[14].pts, 45);
});

// ── 88. 2009 Full Audit: 2009-I, 2009-II, 50 Junior Matches, Deduplicated Playoffs & Reclasificación 2009 ──
test('88. 2009 full audit: zero-sum regular tables, 52 clean playoffs, 26+24 Junior archive, timeline fix, and Reclasificación 2009', () => {
  const t2009I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2009-I-cuadrangular')!;
  const t2009II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2009-II-cuadrangular')!;
  assert.ok(t2009I && t2009II);

  assert.equal(t2009I.championTeam, 'Once Caldas');
  assert.equal(t2009I.runnerUpTeam, 'Junior de Barranquilla');
  assert.equal(t2009I.isJuniorRunnerUp, true);
  assert.equal(t2009II.championTeam, 'Independiente Medellín');
  assert.equal(t2009II.runnerUpTeam, 'Atlético Huila');

  for (const [tbl, expectedSum] of [
    [t2009I, { pg: 119, pe: 86, pp: 119, gf: 378, gc: 378 }],
    [t2009II, { pg: 107, pe: 110, pp: 107, gf: 461, gc: 461 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  const verifySemesterPlayoffs = (tbl: typeof t2009I) => {
    const groups = tbl.finalGroups || [];
    assert.equal(groups.length, 2);
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26, `Expected 26 deduplicated playoffs in ${tbl.id}`);

    const stages = new Set(playoffs.map((m) => m.stage));
    assert.deepEqual([...stages].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);

    for (const m of playoffs) {
      assert.ok(/2009$/.test(m.date || ''), `Expected 2009 date in ${tbl.id}: ${m.date}`);
      assert.ok(m.homeTeam !== 'Envigado F.C.' && m.awayTeam !== 'Envigado F.C.');
      assert.ok(m.homeTeam !== 'Cartagena' && m.awayTeam !== 'Cartagena');
      assert.ok(!(m.scorers || '').includes('<small>'), `Unexpected raw HTML in ${tbl.id} scorers`);
    }

    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = groups[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Unknown team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
    assert.equal(playoffs.filter((m) => m.stage === 'Gran Final').length, 2);
  };

  verifySemesterPlayoffs(t2009I);
  verifySemesterPlayoffs(t2009II);

  const apArchive = t2009I.matchArchive || [];
  const finArchive = t2009II.matchArchive || [];
  assert.equal(apArchive.length, 26);
  assert.equal(finArchive.length, 24);

  const canonicalTeams = new Set((t2009I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2009$/.test(m.date), `Expected 2009 date: ${m.date}`);
  }

  // 2009-I stage filters & totals (18 Regular + 6 Cuad B + 2 Gran Final)
  const apLapOpts = getMatchArchiveLapOptions(apArchive.length, apArchive);
  assert.deepEqual(apLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'apertura' }), 3), {
    pj: 18, pg: 9, pe: 4, pp: 5, gf: 30, gc: 18, dg: 12, pts: 31,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 2, pe: 3, pp: 1, gf: 11, gc: 6, dg: 5, pts: 9,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 0, pe: 0, pp: 2, gf: 2, gc: 5, dg: -3, pts: 0,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 26, pg: 11, pe: 7, pp: 8, gf: 43, gc: 29, dg: 14, pts: 40,
  });

  // 2009-II stage filters & totals (18 Regular + 6 Cuad A)
  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.ok(finLapOpts.some((o) => o.id === 'semifinal' && o.label.includes('Cuadrangular A (6)')));
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 18, pg: 8, pe: 3, pp: 7, gf: 35, gc: 25, dg: 10, pts: 27,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 2, pe: 3, pp: 1, gf: 7, gc: 5, dg: 2, pts: 9,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 24, pg: 10, pe: 6, pp: 8, gf: 42, gc: 30, dg: 12, pts: 36,
  });

  // Reclasificación Anual 2009 dynamic verification
  const rec2009 = getAnnualReclassificationByYear('2009-I');
  assert.ok(rec2009 && rec2009.id === 'reclasificacion-2009');
  assert.equal(getAnnualReclassificationByYear('2009-II')?.id, 'reclasificacion-2009');
  assert.equal(rec2009.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const tbl of [t2009I, t2009II]) {
    for (const r of tbl.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2009.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2009 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2009.rows[0].team, 'Junior de Barranquilla');
  assert.equal(rec2009.rows[0].pts, 76);
  assert.equal(rec2009.rows[0].pj, 50);
  assert.equal(rec2009.rows[1].team, 'Deportes Tolima');
  assert.equal(rec2009.rows[1].pts, 74);
  assert.equal(rec2009.rows[2].team, 'Independiente Medellín');
  assert.equal(rec2009.rows[2].pts, 67);
  assert.equal(rec2009.rows[16].team, 'Deportivo Pasto');
  assert.equal(rec2009.rows[16].pts, 43);
  assert.equal(rec2009.rows[17].team, 'América de Cali');
  assert.equal(rec2009.rows[17].pts, 37);

  // Timeline fact fix & search index check
  const m2009II = JUNIOR_TIMELINE_MILESTONES.find((m) => m.id === '2009-II-libertadores-teo-bacca')!;
  assert.ok(m2009II && m2009II.details.some((d) => d.includes('líder de la reclasificación anual con 76 puntos')));
  assert.ok(!m2009II.details.some((d) => d.includes('tercero en la reclasificación anual')));
  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2009' && i.standingsTableId === 'reclasificacion-2009'));
});

// ── 89. 2010 Full Audit: 2010-I (6ª Estrella ★), 2010-II, 40 Junior Matches & Reclasificación 2010 ──
test('89. 2010 full audit: zero-sum regular tables, 2010-I KO + 2010-II playoffs, 22+18 Junior archive, search index, and Reclasificación 2010', () => {
  const t2010I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2010-I-semifinal')!;
  const t2010II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2010-II-cuadrangular')!;
  assert.ok(t2010I && t2010II);

  assert.equal(t2010I.championTeam, 'Junior de Barranquilla');
  assert.equal(t2010I.runnerUpTeam, 'La Equidad');
  assert.equal(t2010I.isJuniorChampion, true);
  assert.equal(t2010II.championTeam, 'Once Caldas');
  assert.equal(t2010II.runnerUpTeam, 'Deportes Tolima');
  assert.ok(t2010II.description.includes('(4-3 global)'));
  assert.ok(!t2010II.description.includes('(3-4 global)'));
  assert.ok(!(t2010II.regularPhaseDescription || '').includes('Wikipedia'));

  for (const [tbl, expectedSum] of [
    [t2010I, { pg: 125, pe: 74, pp: 125, gf: 442, gc: 442 }],
    [t2010II, { pg: 113, pe: 98, pp: 113, gf: 422, gc: 422 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  // 2010-I Semifinales K.O. & Gran Final verification (6 matches)
  const playoffs2010I = t2010I.playoffMatches || [];
  assert.equal(playoffs2010I.length, 6);
  assert.deepEqual([...new Set(playoffs2010I.map((m) => m.stage))].sort(), ['Gran Final', 'Semifinales']);
  for (const m of playoffs2010I) {
    assert.ok(/2010$/.test(m.date || ''), `Expected 2010 date in 2010-I: ${m.date}`);
  }
  const rounds2010I = buildPlayoffKnockoutBrackets(playoffs2010I, t2010I.championTeam);
  assert.equal(rounds2010I.length, 2);
  const finalTie2010I = rounds2010I.find((r) => r.key === 'final')?.ties[0];
  assert.equal(finalTie2010I?.winnerTeam, 'Junior de Barranquilla');
  const koTally = new Map((t2010I.rows || []).map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
  for (const m of playoffs2010I) {
    const h = koTally.get(m.homeTeam)!;
    const a = koTally.get(m.awayTeam)!;
    h.pj++; a.pj++;
    h.gf += m.homeScore; h.gc += m.awayScore;
    a.gf += m.awayScore; a.gc += m.homeScore;
    if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
    else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
    else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
  }
  for (const r of t2010I.rows || []) {
    assert.deepEqual(koTally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
  }

  // 2010-II Cuadrangulares & Gran Final verification (26 matches)
  const playoffs2010II = t2010II.playoffMatches || [];
  assert.equal(playoffs2010II.length, 26);
  assert.deepEqual([...new Set(playoffs2010II.map((m) => m.stage))].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);
  for (const m of playoffs2010II) {
    assert.ok(/2010$/.test(m.date || ''), `Expected 2010 date in 2010-II: ${m.date}`);
    assert.ok(!(m.scorers || '').includes('F, Uribe'));
  }
  for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
    const gRows = (t2010II.finalGroups || [])[idx].rows;
    const gMatches = playoffs2010II.filter((m) => m.stage === stageName);
    assert.equal(gMatches.length, 12);
    const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
    for (const m of gMatches) {
      const h = tally.get(m.homeTeam)!;
      const a = tally.get(m.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += m.homeScore; h.gc += m.awayScore;
      a.gf += m.awayScore; a.gc += m.homeScore;
      if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
      else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
      else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
    }
    for (const r of gRows) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    }
  }

  // Junior matchArchive: 22 in 2010-I + 18 in 2010-II
  const apArchive = t2010I.matchArchive || [];
  const finArchive = t2010II.matchArchive || [];
  assert.equal(apArchive.length, 22);
  assert.equal(finArchive.length, 18);

  const canonicalTeams = new Set((t2010I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2010$/.test(m.date), `Expected 2010 date: ${m.date}`);
  }

  const apLapOpts = getMatchArchiveLapOptions(apArchive.length, apArchive);
  assert.deepEqual(apLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'apertura' }), 3), {
    pj: 18, pg: 9, pe: 5, pp: 4, gf: 28, gc: 17, dg: 11, pts: 32,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 3, gc: 2, dg: 1, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 3, gc: 2, dg: 1, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 22, pg: 11, pe: 5, pp: 6, gf: 34, gc: 21, dg: 13, pts: 38,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 18, pg: 2, pe: 10, pp: 6, gf: 21, gc: 28, dg: -7, pts: 16,
  });

  // Reclasificación Anual 2010 dynamic verification
  const rec2010 = getAnnualReclassificationByYear('2010-I');
  assert.ok(rec2010 && rec2010.id === 'reclasificacion-2010');
  assert.equal(getAnnualReclassificationByYear('2010-II')?.id, 'reclasificacion-2010');
  assert.equal(rec2010.rows.length, 18);

  const computed = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const addStats = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed.set(team, cur);
  };
  for (const r of t2010I.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const r of t2010I.rows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const r of t2010II.regularRows || []) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const fg of t2010II.finalGroups || []) for (const r of fg.rows) addStats(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const m of playoffs2010II.filter((pm) => pm.stage === 'Gran Final')) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    addStats(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    addStats(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2010.rows) {
    const expected = computed.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2010 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2010.rows[0].team, 'Deportes Tolima');
  assert.equal(rec2010.rows[0].pts, 86);
  assert.equal(rec2010.rows[1].team, 'Once Caldas');
  assert.equal(rec2010.rows[1].pts, 77);
  assert.equal(rec2010.rows[2].team, 'Independiente Santa Fe');
  assert.equal(rec2010.rows[2].pts, 75);
  assert.equal(rec2010.rows[9].team, 'Junior de Barranquilla');
  assert.equal(rec2010.rows[9].pts, 54);
  assert.equal(rec2010.rows[9].pj, 40);
  assert.equal(rec2010.rows[16].team, 'Cortuluá');
  assert.equal(rec2010.rows[16].pts, 28);
  assert.equal(rec2010.rows[17].team, 'Deportivo Pereira');
  assert.equal(rec2010.rows[17].pts, 27);

  // Search index verification (missing torneo-2010-II + reclasificacion-anual-2010)
  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'torneo-2010-II' && i.standingsTableId === '2010-II-cuadrangular'));
  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2010' && i.standingsTableId === 'reclasificacion-2010'));
});

// ── 90. 2011 Full Audit: 2011-I, 2011-II (7ª Estrella ★), 42 Junior Matches & Reclasificación 2011 ──
test('90. 2011 full audit: zero-sum regular tables (with Quindío -3 pts sanction), 14+14 KO playoffs, 18+24 Junior archive, brackets, search index, and Reclasificación 2011', () => {
  const t2011I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-I-regular')!;
  const t2011II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2011-II-playoffs')!;
  assert.ok(t2011I && t2011II);

  assert.equal(t2011I.championTeam, 'Atlético Nacional');
  assert.equal(t2011I.runnerUpTeam, 'La Equidad');
  assert.equal(t2011II.championTeam, 'Junior de Barranquilla');
  assert.equal(t2011II.runnerUpTeam, 'Once Caldas');
  assert.equal(t2011II.isJuniorChampion, true);
  assert.ok((t2011II.regularPhaseDescription || '').includes('-3 puntos'));

  // Zero-sum verification of 2011-I and 2011-II regularRows
  for (const [tbl, expectedSum, hasQuindioSanction] of [
    [t2011I, { pg: 122, pe: 80, pp: 122, gf: 442, gc: 442 }, false],
    [t2011II, { pg: 112, pe: 100, pp: 112, gf: 392, gc: 392 }, true],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      const penalty = hasQuindioSanction && r.team === 'Deportes Quindío' ? 3 : 0;
      assert.equal(r.pg * 3 + r.pe - penalty, r.pts, `Points mismatch for ${r.team} in ${tbl.id}`);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  // 2011-I Playoffs: 14 exact matches, zero junk entries, corrected Gran Final Ida scorers, 4 semifinalist rows
  const playoffs2011I = t2011I.playoffMatches || [];
  assert.equal(playoffs2011I.length, 14);
  assert.deepEqual([...new Set(playoffs2011I.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
  assert.ok(playoffs2011I.every((m) => !/estadísticas previas/i.test(m.stage || '')));
  assert.ok(playoffs2011I.every((m) => /2011$/.test(m.date || '')));
  const finalIda2011I = playoffs2011I.find((m) => m.stage === 'Gran Final' && m.homeTeam === 'La Equidad')!;
  assert.ok(finalIda2011I.scorers?.includes('Juan Gilberto Núñez'));
  assert.ok(finalIda2011I.scorers?.includes('Edwin Rivas'));
  assert.ok(finalIda2011I.scorers?.includes('Carlos Rentería'));
  assert.ok(!finalIda2011I.scorers?.includes('Giovanni Moreno'));
  assert.equal((t2011I.rows || []).length, 8);

  const rounds2011I = buildPlayoffKnockoutBrackets(playoffs2011I, t2011I.championTeam);
  assert.equal(rounds2011I.length, 3);
  const qf2011IMil = rounds2011I[0].ties.find((t) => t.teamA === 'Millonarios F.C' || t.teamB === 'Millonarios F.C')!;
  assert.equal(qf2011IMil.winnerTeam, 'Millonarios F.C');
  const qf2011INac = rounds2011I[0].ties.find((t) => t.teamA === 'Atlético Nacional' || t.teamB === 'Atlético Nacional')!;
  assert.equal(qf2011INac.winnerTeam, 'Atlético Nacional');
  assert.equal(rounds2011I.find((r) => r.key === 'final')?.ties[0].winnerTeam, 'Atlético Nacional');

  // 2011-II Playoffs: 14 exact matches, non-truncated QF note, reconciled 4 semifinalist rows (Junior 9-9, 0 DG)
  const playoffs2011II = t2011II.playoffMatches || [];
  assert.equal(playoffs2011II.length, 14);
  assert.deepEqual([...new Set(playoffs2011II.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
  assert.ok(playoffs2011II.every((m) => /2011$/.test(m.date || '')));
  const qfJuniorVuelta = playoffs2011II.find((m) => m.stage === 'Cuartos de final' && m.homeTeam === 'Junior de Barranquilla')!;
  assert.ok(qfJuniorVuelta.note?.includes('Resolución 050'));
  assert.ok(!qfJuniorVuelta.note?.endsWith('en Tun'));

  const rounds2011II = buildPlayoffKnockoutBrackets(playoffs2011II, t2011II.championTeam);
  assert.equal(rounds2011II.length, 3);
  const qfChicoTie = rounds2011II[0].ties.find((t) => t.involvesJunior)!;
  assert.equal(qfChicoTie.winnerTeam, 'Junior de Barranquilla');
  assert.equal(qfChicoTie.penaltiesLabel, 'Clasificó por Resolución Dimayor');
  const sfJuniorTie = rounds2011II[1].ties.find((t) => t.involvesJunior)!;
  assert.equal(sfJuniorTie.winnerTeam, 'Junior de Barranquilla');
  const final2011IITie = rounds2011II.find((r) => r.key === 'final')?.ties[0]!;
  assert.equal(final2011IITie.winnerTeam, 'Junior de Barranquilla');

  // Reconcile both 2011-I and 2011-II semifinalist rows directly against playoffMatches
  for (const [tbl, matches] of [[t2011I, playoffs2011I], [t2011II, playoffs2011II]] as const) {
    const tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of matches) {
      for (const [tm, gf, gc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += gf; cur.gc += gc;
        if (gf > gc) { cur.pg++; cur.pts += 3; } else if (gf < gc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        tally.set(tm, cur);
      }
    }
    for (const r of tbl.rows || []) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts }, `Playoff row mismatch for ${r.team} in ${tbl.id}`);
      assert.equal(r.gf - r.gc, r.dg);
    }
  }

  // Junior matchArchive: 18 in 2011-I + 24 in 2011-II (18 regular + 2 Cuartos + 2 Semifinal + 2 Gran Final)
  const apArchive = t2011I.matchArchive || [];
  const finArchive = t2011II.matchArchive || [];
  assert.equal(apArchive.length, 18);
  assert.equal(finArchive.length, 24);
  const canonicalTeams2011 = new Set((t2011I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2011.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2011.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2011$/.test(m.date), `Expected 2011 date: ${m.date}`);
  }
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 18, pg: 5, pe: 4, pp: 9, gf: 19, gc: 28, dg: -9, pts: 19,
  });
  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 18, pg: 8, pe: 7, pp: 3, gf: 28, gc: 22, dg: 6, pts: 31,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 0, pe: 2, pp: 0, gf: 2, gc: 2, dg: 0, pts: 2,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 3, gc: 3, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 4, gc: 4, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 24, pg: 10, pe: 9, pp: 5, gf: 37, gc: 31, dg: 6, pts: 39,
  });

  // Reclasificación Anual 2011 dynamic verification (regularRows + all 14+14 playoffMatches)
  const rec2011 = getAnnualReclassificationByYear('2011-I');
  assert.ok(rec2011 && rec2011.id === 'reclasificacion-2011');
  assert.equal(getAnnualReclassificationByYear('2011-II')?.id, 'reclasificacion-2011');
  assert.equal(rec2011.rows.length, 18);

  const computed2011 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2011 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2011.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2011.set(team, cur);
  };
  for (const r of t2011I.regularRows || []) add2011(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const r of t2011II.regularRows || []) add2011(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const m of [...playoffs2011I, ...playoffs2011II]) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2011(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2011(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2011.rows) {
    const expected = computed2011.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2011 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    const sanction = row.team === 'Deportes Quindío' ? 3 : 0;
    assert.equal(row.pg * 3 + row.pe - sanction, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2011.rows[0].team, 'Once Caldas');
  assert.equal(rec2011.rows[0].pts, 79);
  assert.equal(rec2011.rows[5].team, 'Junior de Barranquilla');
  assert.equal(rec2011.rows[5].pts, 58);
  assert.equal(rec2011.rows[5].pj, 42);
  assert.equal(rec2011.rows[17].team, 'Deportivo Pereira');
  assert.equal(rec2011.rows[17].pts, 32);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2011' && i.standingsTableId === 'reclasificacion-2011'));
});

// ── 91. 2012 Full Audit: 2012-I, 2012-II, 42 Junior Matches & Reclasificación 2012 ──
test('91. 2012 full audit: zero-sum regular tables, 26+26 cuadrangulares/final playoffs, 18+24 Junior archive, search index, and Reclasificación 2012', () => {
  const t2012I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2012-I-regular')!;
  const t2012II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2012-II-cuadrangular')!;
  assert.ok(t2012I && t2012II);

  assert.equal(t2012I.championTeam, 'Independiente Santa Fe');
  assert.equal(t2012I.runnerUpTeam, 'Deportivo Pasto');
  assert.equal(t2012II.championTeam, 'Millonarios F.C');
  assert.equal(t2012II.runnerUpTeam, 'Independiente Medellín');
  assert.equal(t2012II.finalGroups?.[1].rows[0].team, 'Independiente Medellín');

  // Zero-sum regularRows verification
  for (const [tbl, expectedSum] of [
    [t2012I, { pg: 105, pe: 114, pp: 105, gf: 397, gc: 397 }],
    [t2012II, { pg: 114, pe: 96, pp: 114, gf: 375, gc: 375 }],
  ] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.deepEqual({ pg, pe, pp, gf, gc }, expectedSum);
  }

  // Cuadrangulares & Gran Final verification for both 2012-I and 2012-II (26 matches each)
  for (const tbl of [t2012I, t2012II]) {
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);
    assert.deepEqual([...new Set(playoffs.map((m) => m.stage))].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);
    for (const m of playoffs) {
      assert.ok(/2012$/.test(m.date || ''), `Expected 2012 date in ${tbl.id}: ${m.date}`);
    }
    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = (tbl.finalGroups || [])[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
  }

  // Junior matchArchive: 18 in 2012-I + 24 in 2012-II (18 regular + 6 Cuadrangular A)
  const apArchive = t2012I.matchArchive || [];
  const finArchive = t2012II.matchArchive || [];
  assert.equal(apArchive.length, 18);
  assert.equal(finArchive.length, 24);
  const canonicalTeams2012 = new Set((t2012I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2012.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2012.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2012$/.test(m.date), `Expected 2012 date: ${m.date}`);
  }
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 18, pg: 7, pe: 4, pp: 7, gf: 28, gc: 24, dg: 4, pts: 25,
  });
  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 18, pg: 8, pe: 8, pp: 2, gf: 27, gc: 15, dg: 12, pts: 32,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 2, pe: 2, pp: 2, gf: 5, gc: 6, dg: -1, pts: 8,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 24, pg: 10, pe: 10, pp: 4, gf: 32, gc: 21, dg: 11, pts: 40,
  });

  // Reclasificación Anual 2012 dynamic verification
  const rec2012 = getAnnualReclassificationByYear('2012-I');
  assert.ok(rec2012 && rec2012.id === 'reclasificacion-2012');
  assert.equal(getAnnualReclassificationByYear('2012-II')?.id, 'reclasificacion-2012');
  assert.equal(rec2012.rows.length, 18);

  const computed2012 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2012 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2012.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2012.set(team, cur);
  };
  for (const tbl of [t2012I, t2012II]) {
    for (const r of tbl.regularRows || []) add2012(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) add2012(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2012(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2012(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2012.rows) {
    const expected = computed2012.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2012 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2012.rows[0].team, 'Deportes Tolima');
  assert.equal(rec2012.rows[0].pts, 80);
  assert.equal(rec2012.rows[6].team, 'Junior de Barranquilla');
  assert.equal(rec2012.rows[6].pts, 65);
  assert.equal(rec2012.rows[6].pj, 42);
  assert.equal(rec2012.rows[17].team, 'Real Cartagena');
  assert.equal(rec2012.rows[17].pts, 32);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2012' && i.standingsTableId === 'reclasificacion-2012'));
});

// ── 92. 2013 Full Audit: 2013-I, 2013-II, 42 Junior Matches & Reclasificación 2013 ──
test('92. 2013 full audit: zero-sum regular tables, deduplicated 26+26 cuadrangulares/final playoffs, unified Itagüí naming, 18+24 Junior archive, search index, and Reclasificación 2013', () => {
  const t2013I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2013-I-regular')!;
  const t2013II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2013-II-cuadrangular')!;
  assert.ok(t2013I && t2013II);

  assert.equal(t2013I.championTeam, 'Atlético Nacional');
  assert.equal(t2013I.runnerUpTeam, 'Independiente Santa Fe');
  assert.equal(t2013II.championTeam, 'Atlético Nacional');
  assert.equal(t2013II.runnerUpTeam, 'Deportivo Cali');

  // Zero-sum regularRows verification
  for (const tbl of [t2013I, t2013II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // Cuadrangulares & Gran Final verification for both 2013-I and 2013-II (exact 26 matches each, no duplicates, unified Itagüí F. C)
  for (const tbl of [t2013I, t2013II]) {
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26, `Expected 26 playoffMatches in ${tbl.id}`);
    assert.deepEqual([...new Set(playoffs.map((m) => m.stage))].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);
    for (const m of playoffs) {
      assert.ok(/2013$/.test(m.date || ''), `Expected explicit 2013 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
      assert.ok(m.homeTeam !== 'Águilas Doradas' && m.awayTeam !== 'Águilas Doradas', `Unexpected Águilas Doradas in ${tbl.id}`);
    }
    for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
      const gRows = (tbl.finalGroups || [])[idx].rows;
      const gMatches = playoffs.filter((m) => m.stage === stageName);
      assert.equal(gMatches.length, 12);
      const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
      for (const m of gMatches) {
        const h = tally.get(m.homeTeam)!;
        const a = tally.get(m.awayTeam)!;
        assert.ok(h && a, `Missing team in ${tbl.id} ${stageName}: ${m.homeTeam} vs ${m.awayTeam}`);
        h.pj++; a.pj++;
        h.gf += m.homeScore; h.gc += m.awayScore;
        a.gf += m.awayScore; a.gc += m.homeScore;
        if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
        else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
        else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
      }
      for (const r of gRows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
  }

  // Junior matchArchive: 18 in 2013-I + 24 in 2013-II (18 regular + 6 Cuadrangular A)
  const apArchive = t2013I.matchArchive || [];
  const finArchive = t2013II.matchArchive || [];
  assert.equal(apArchive.length, 18);
  assert.equal(finArchive.length, 24);
  const canonicalTeams2013 = new Set((t2013I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2013.has(m.homeTeam), `Non-canonical homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2013.has(m.awayTeam), `Non-canonical awayTeam: ${m.awayTeam}`);
    assert.ok(/2013$/.test(m.date), `Expected 2013 date: ${m.date}`);
  }
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 18, pg: 6, pe: 4, pp: 8, gf: 24, gc: 25, dg: -1, pts: 22,
  });
  const finLapOpts = getMatchArchiveLapOptions(finArchive.length, finArchive);
  assert.deepEqual(finLapOpts.map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 18, pg: 8, pe: 6, pp: 4, gf: 29, gc: 24, dg: 5, pts: 30,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 3, pe: 1, pp: 2, gf: 10, gc: 7, dg: 3, pts: 10,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 24, pg: 11, pe: 7, pp: 6, gf: 39, gc: 31, dg: 8, pts: 40,
  });

  // Reclasificación Anual 2013 dynamic verification
  const rec2013 = getAnnualReclassificationByYear('2013-I');
  assert.ok(rec2013 && rec2013.id === 'reclasificacion-2013');
  assert.equal(getAnnualReclassificationByYear('2013-II')?.id, 'reclasificacion-2013');
  assert.equal(rec2013.rows.length, 18);

  const computed2013 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2013 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2013.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2013.set(team, cur);
  };
  for (const tbl of [t2013I, t2013II]) {
    for (const r of tbl.regularRows || []) add2013(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const fg of tbl.finalGroups || []) for (const r of fg.rows) add2013(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of (tbl.playoffMatches || []).filter((pm) => pm.stage === 'Gran Final')) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2013(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2013(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2013.rows) {
    const expected = computed2013.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2013 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2013.rows[0].team, 'Atlético Nacional');
  assert.equal(rec2013.rows[0].pts, 103);
  assert.equal(rec2013.rows[7].team, 'Junior de Barranquilla');
  assert.equal(rec2013.rows[7].pts, 62);
  assert.equal(rec2013.rows[7].pj, 42);
  assert.equal(rec2013.rows[17].team, 'Deportes Quindío');
  assert.equal(rec2013.rows[17].pts, 27);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2013' && i.standingsTableId === 'reclasificacion-2013'));
});

// ── 93. 2014 Full Audit: 2014-I (Subcampeón 🥈), 2014-II, 42 Junior Matches & Reclasificación 2014 ──
test('93. 2014 full audit: zero-sum regular tables, 2014-I knockout brackets (clean Wikipedia artifact + penalties), 2014-II 26 cuadrangulares/final playoffs, 24+18 Junior archive, search index, and Reclasificación 2014', () => {
  const t2014I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-I-playoffs')!;
  const t2014II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2014-II-regular')!;
  assert.ok(t2014I && t2014II);

  assert.equal(t2014I.championTeam, 'Atlético Nacional');
  assert.equal(t2014I.runnerUpTeam, 'Junior de Barranquilla');
  assert.equal(t2014II.championTeam, 'Independiente Santa Fe');
  assert.equal(t2014II.runnerUpTeam, 'Independiente Medellín');

  // Zero-sum regularRows verification
  for (const tbl of [t2014I, t2014II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 18);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 18);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // 2014-I Playoffs (14 matches) & Knockout Bracket Verification
  const playoffs2014I = t2014I.playoffMatches || [];
  assert.equal(playoffs2014I.length, 14);
  assert.deepEqual([...new Set(playoffs2014I.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
  for (const m of playoffs2014I) {
    assert.ok(/2014$/.test(m.date || ''), `Expected clean 2014 date: ${m.date}`);
    assert.ok(!m.scorers?.includes('15px|'), `Unexpected Wikipedia artifact in 2014-I scorers: ${m.scorers}`);
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    assert.ok(!m.homeTeam.includes('Envigado F.C.') && !m.awayTeam.includes('Envigado F.C.'));
  }
  const brackets2014I = buildPlayoffKnockoutBrackets(playoffs2014I, t2014I.championTeam);
  assert.equal(brackets2014I.length, 3);
  assert.equal(brackets2014I[0].ties.length, 4);
  assert.equal(brackets2014I[1].ties.length, 2);
  assert.equal(brackets2014I[2].ties.length, 1);
  // Semifinal Junior vs Millonarios (0-0 global, Junior wins 5-4 on penalties)
  const sfJunior = brackets2014I[1].ties.find((s) => s.teamA === 'Junior de Barranquilla' || s.teamB === 'Junior de Barranquilla')!;
  assert.equal(sfJunior.winnerTeam, 'Junior de Barranquilla');
  // Gran Final Junior vs Atlético Nacional (2-2 global, Nacional wins 4-2 on penalties)
  assert.equal(brackets2014I[2].ties[0].winnerTeam, 'Atlético Nacional');

  // Reconcile 2014-I rows against playoffMatches
  const tally2014I = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const m of playoffs2014I) {
    for (const [tm, gf, gc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
      const cur = tally2014I.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      cur.pj++; cur.gf += gf; cur.gc += gc;
      if (gf > gc) { cur.pg++; cur.pts += 3; } else if (gf < gc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
      tally2014I.set(tm, cur);
    }
  }
  for (const r of t2014I.rows || []) {
    assert.deepEqual(tally2014I.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    assert.equal(r.gf - r.gc, r.dg);
  }

  // 2014-II Cuadrangulares & Gran Final (26 matches)
  const playoffs2014II = t2014II.playoffMatches || [];
  assert.equal(playoffs2014II.length, 26);
  assert.deepEqual([...new Set(playoffs2014II.map((m) => m.stage))].sort(), ['Cuadrangular A', 'Cuadrangular B', 'Gran Final']);
  for (const m of playoffs2014II) {
    assert.ok(/2014$/.test(m.date || ''), `Expected clean 2014 date in 2014-II: ${m.date}`);
  }
  for (const [idx, stageName] of [[0, 'Cuadrangular A'], [1, 'Cuadrangular B']] as const) {
    const gRows = (t2014II.finalGroups || [])[idx].rows;
    const gMatches = playoffs2014II.filter((m) => m.stage === stageName);
    assert.equal(gMatches.length, 12);
    const tally = new Map(gRows.map((r) => [r.team, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }]));
    for (const m of gMatches) {
      const h = tally.get(m.homeTeam)!;
      const a = tally.get(m.awayTeam)!;
      h.pj++; a.pj++;
      h.gf += m.homeScore; h.gc += m.awayScore;
      a.gf += m.awayScore; a.gc += m.homeScore;
      if (m.homeScore > m.awayScore) { h.pg++; h.pts += 3; a.pp++; }
      else if (m.homeScore < m.awayScore) { a.pg++; a.pts += 3; h.pp++; }
      else { h.pe++; h.pts += 1; a.pe++; a.pts += 1; }
    }
    for (const r of gRows) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    }
  }

  // Junior matchArchive: 24 in 2014-I (18 regular + 2 Cuartos + 2 Semifinal + 2 Gran Final) + 18 in 2014-II
  const apArchive = t2014I.matchArchive || [];
  const finArchive = t2014II.matchArchive || [];
  assert.equal(apArchive.length, 24);
  assert.equal(finArchive.length, 18);
  const canonicalTeams2014I = new Set((t2014I.regularRows || []).map((r) => r.team));
  const canonicalTeams2014II = new Set((t2014II.regularRows || []).map((r) => r.team));
  for (const m of apArchive) {
    assert.ok(canonicalTeams2014I.has(m.homeTeam), `Non-canonical 2014-I homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2014I.has(m.awayTeam), `Non-canonical 2014-I awayTeam: ${m.awayTeam}`);
    assert.ok(/2014$/.test(m.date), `Expected 2014 date: ${m.date}`);
  }
  for (const m of finArchive) {
    assert.ok(canonicalTeams2014II.has(m.homeTeam), `Non-canonical 2014-II homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2014II.has(m.awayTeam), `Non-canonical 2014-II awayTeam: ${m.awayTeam}`);
    assert.ok(/2014$/.test(m.date), `Expected 2014 date: ${m.date}`);
  }
  const apLapOpts = getMatchArchiveLapOptions(apArchive.length, apArchive);
  assert.deepEqual(apLapOpts.map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'apertura' }), 3), {
    pj: 18, pg: 10, pe: 3, pp: 5, gf: 20, gc: 17, dg: 3, pts: 33,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 1, pe: 1, pp: 0, gf: 3, gc: 2, dg: 1, pts: 4,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 0, pe: 2, pp: 0, gf: 0, gc: 0, dg: 0, pts: 2,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 2, gc: 2, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 24, pg: 12, pe: 6, pp: 6, gf: 25, gc: 21, dg: 4, pts: 42,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 18, pg: 6, pe: 4, pp: 8, gf: 19, gc: 20, dg: -1, pts: 22,
  });

  // Reclasificación Anual 2014 dynamic verification (merging Itagüí F.C + Águilas Pereira as one club)
  const rec2014 = getAnnualReclassificationByYear('2014-I');
  assert.ok(rec2014 && rec2014.id === 'reclasificacion-2014');
  assert.equal(getAnnualReclassificationByYear('2014-II')?.id, 'reclasificacion-2014');
  assert.equal(rec2014.rows.length, 18);

  const norm2014 = (team: string) => (team === 'Itagüí F.C' ? 'Águilas Pereira' : team);
  const computed2014 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2014 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const k = norm2014(team);
    const cur = computed2014.get(k) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2014.set(k, cur);
  };
  for (const r of t2014I.regularRows || []) add2014(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const r of t2014II.regularRows || []) add2014(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  for (const m of [...playoffs2014I, ...playoffs2014II]) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2014(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2014(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }

  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2014.rows) {
    const expected = computed2014.get(row.team);
    assert.ok(expected, `Missing computed stats for ${row.team}`);
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      expected,
      `Reclasificación 2014 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2014.rows[0].team, 'Independiente Santa Fe');
  assert.equal(rec2014.rows[0].pts, 82);
  assert.equal(rec2014.rows[1].team, 'Atlético Nacional');
  assert.equal(rec2014.rows[1].pts, 81);
  assert.equal(rec2014.rows[4].team, 'Junior de Barranquilla');
  assert.equal(rec2014.rows[4].pts, 64);
  assert.equal(rec2014.rows[4].pj, 42);
  assert.equal(rec2014.rows[17].team, 'Uniautónoma F.C');
  assert.equal(rec2014.rows[17].pts, 35);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2014' && i.standingsTableId === 'reclasificacion-2014'));
});

// ── 94. 2015 Full Audit: 2015-I, 2015-II (Subcampeón 🥈), 48 Junior Matches & Reclasificación 2015 ──
test('94. 2015 full audit: 20-club zero-sum regular tables, clean 14+14 knockout brackets (garbage dump removed), 22+26 Junior archive with 20-fecha filters, search index, and Reclasificación 2015', () => {
  const t2015I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-I-playoffs')!;
  const t2015II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2015-II-playoffs')!;
  assert.ok(t2015I && t2015II);

  assert.equal(t2015I.championTeam, 'Deportivo Cali');
  assert.equal(t2015I.runnerUpTeam, 'Independiente Medellín');
  assert.equal(t2015II.championTeam, 'Atlético Nacional');
  assert.equal(t2015II.runnerUpTeam, 'Junior de Barranquilla');
  assert.equal(t2015II.isJuniorRunnerUp, true);

  // Zero-sum 20-club regularRows verification
  for (const tbl of [t2015I, t2015II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 20);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // Exact 14 knockout playoffMatches each, clean dates/names, brackets & playoff rows reconciliation
  for (const tbl of [t2015I, t2015II]) {
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 14, `Expected exact 14 playoffMatches in ${tbl.id}`);
    assert.deepEqual([...new Set(playoffs.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
    for (const m of playoffs) {
      assert.ok(/2015$/.test(m.date || ''), `Expected clean 2015 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.venue?.includes('align=left') && !m.venue?.includes('[Bogotá]]'));
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
      assert.ok(!m.homeTeam.includes('Envigado F.C.') && !m.awayTeam.includes('Envigado F.C.'));
    }
    const tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs) {
      for (const [tm, gf, gc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += gf; cur.gc += gc;
        if (gf > gc) { cur.pg++; cur.pts += 3; } else if (gf < gc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        tally.set(tm, cur);
      }
    }
    assert.equal((tbl.rows || []).length, 8);
    for (const r of tbl.rows || []) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      assert.equal(r.gf - r.gc, r.dg);
    }
  }

  // Bracket penalty resolution checks
  const b2015I = buildPlayoffKnockoutBrackets(t2015I.playoffMatches || [], t2015I.championTeam);
  assert.equal(b2015I.length, 3);
  const sfCali2015I = b2015I[1].ties.find((s) => s.teamA === 'Deportivo Cali' || s.teamB === 'Deportivo Cali')!;
  assert.equal(sfCali2015I.winnerTeam, 'Deportivo Cali');
  assert.equal(b2015I[2].ties[0].winnerTeam, 'Deportivo Cali');

  const b2015II = buildPlayoffKnockoutBrackets(t2015II.playoffMatches || [], t2015II.championTeam);
  assert.equal(b2015II.length, 3);
  assert.equal(b2015II[2].ties[0].winnerTeam, 'Atlético Nacional');

  // Junior matchArchive: 22 in 2015-I (20 regular + 2 Cuartos) + 26 in 2015-II (20 regular + 6 playoffs)
  const apArchive = t2015I.matchArchive || [];
  const finArchive = t2015II.matchArchive || [];
  assert.equal(apArchive.length, 22);
  assert.equal(finArchive.length, 26);
  const canonicalTeams2015 = new Set((t2015I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2015.has(m.homeTeam), `Non-canonical 2015 homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2015.has(m.awayTeam), `Non-canonical 2015 awayTeam: ${m.awayTeam}`);
    assert.ok(/2015$/.test(m.date), `Expected 2015 date: ${m.date}`);
  }
  assert.deepEqual(getMatchArchiveLapOptions(apArchive.length, apArchive).map((o) => o.id), ['all', 'apertura', 'cuartos']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'apertura' }), 3), {
    pj: 20, pg: 9, pe: 6, pp: 5, gf: 27, gc: 16, dg: 11, pts: 33,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 0, pe: 0, pp: 2, gf: 0, gc: 4, dg: -4, pts: 0,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 22, pg: 9, pe: 6, pp: 7, gf: 27, gc: 20, dg: 7, pts: 33,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArchive.length, finArchive).map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 20, pg: 11, pe: 3, pp: 6, gf: 31, gc: 23, dg: 8, pts: 36,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 4, gc: 3, dg: 1, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 2, pe: 0, pp: 0, gf: 2, gc: 0, dg: 2, pts: 6,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 2, gc: 2, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 26, pg: 15, pe: 3, pp: 8, gf: 39, gc: 28, dg: 11, pts: 48,
  });

  // Reclasificación Anual 2015 dynamic verification
  const rec2015 = getAnnualReclassificationByYear('2015-I');
  assert.ok(rec2015 && rec2015.id === 'reclasificacion-2015');
  assert.equal(getAnnualReclassificationByYear('2015-II')?.id, 'reclasificacion-2015');
  assert.equal(rec2015.rows.length, 20);

  const computed2015 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2015 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2015.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2015.set(team, cur);
  };
  for (const r of [...(t2015I.regularRows || []), ...(t2015II.regularRows || [])]) {
    add2015(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  }
  for (const m of [...(t2015I.playoffMatches || []), ...(t2015II.playoffMatches || [])]) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2015(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2015(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }
  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2015.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2015.get(row.team),
      `Reclasificación 2015 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2015.rows[0].team, 'Atlético Nacional');
  assert.equal(rec2015.rows[0].pts, 90);
  assert.equal(rec2015.rows[2].team, 'Junior de Barranquilla');
  assert.equal(rec2015.rows[2].pts, 81);
  assert.equal(rec2015.rows[2].pj, 48);
  assert.equal(rec2015.rows[19].team, 'Cúcuta Deportivo');
  assert.equal(rec2015.rows[19].pts, 27);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2015' && i.standingsTableId === 'reclasificacion-2015'));
});

// ── 95. 2016 Full Audit: 2016-I (Subcampeón 🥈), 2016-II, 46 Junior Matches & Reclasificación 2016 ──
test('95. 2016 full audit: 20-club zero-sum regular tables, 14+14 knockout brackets with all 6 penalty shootouts, 26+20 Junior archive, search index, and Reclasificación 2016', () => {
  const t2016I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-I-playoffs')!;
  const t2016II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2016-II-regular')!;
  assert.ok(t2016I && t2016II);

  assert.equal(t2016I.championTeam, 'Independiente Medellín');
  assert.equal(t2016I.runnerUpTeam, 'Junior de Barranquilla');
  assert.equal(t2016I.isJuniorRunnerUp, true);
  assert.equal(t2016II.championTeam, 'Independiente Santa Fe');
  assert.equal(t2016II.runnerUpTeam, 'Deportes Tolima');

  // Zero-sum 20-club regularRows verification
  for (const tbl of [t2016I, t2016II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 20);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // Exact 14 knockout playoffMatches each, clean dates/names, 8-club rows reconciliation
  for (const tbl of [t2016I, t2016II]) {
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 14);
    assert.deepEqual([...new Set(playoffs.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
    for (const m of playoffs) {
      assert.ok(/2016$/.test(m.date || ''), `Expected clean 2016 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    }
    const tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs) {
      for (const [tm, gf, gc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += gf; cur.gc += gc;
        if (gf > gc) { cur.pg++; cur.pts += 3; } else if (gf < gc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        tally.set(tm, cur);
      }
    }
    assert.equal((tbl.rows || []).length, 8);
    for (const r of tbl.rows || []) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      assert.equal(r.gf - r.gc, r.dg);
    }
  }

  // Verify ALL 6 penalty shootouts in 2016-I (4) and 2016-II (2) resolve to the exact winners
  const b2016I = buildPlayoffKnockoutBrackets(t2016I.playoffMatches || [], t2016I.championTeam);
  assert.equal(b2016I[0].ties.find((s) => s.teamA === 'Águilas Doradas' || s.teamB === 'Águilas Doradas')!.winnerTeam, 'Atlético Nacional');
  assert.equal(b2016I[0].ties.find((s) => s.teamA === 'Millonarios F.C' || s.teamB === 'Millonarios F.C')!.winnerTeam, 'Junior de Barranquilla');
  assert.equal(b2016I[1].ties.find((s) => s.teamA === 'Cortuluá' || s.teamB === 'Cortuluá')!.winnerTeam, 'Independiente Medellín');
  assert.equal(b2016I[1].ties.find((s) => s.teamA === 'Atlético Nacional' || s.teamB === 'Atlético Nacional')!.winnerTeam, 'Junior de Barranquilla');
  assert.equal(b2016I[2].ties[0].winnerTeam, 'Independiente Medellín');

  const b2016II = buildPlayoffKnockoutBrackets(t2016II.playoffMatches || [], t2016II.championTeam);
  assert.equal(b2016II[0].ties.find((s) => s.teamA === 'Patriotas Boyacá' || s.teamB === 'Patriotas Boyacá')!.winnerTeam, 'Deportes Tolima');
  assert.equal(b2016II[1].ties.find((s) => s.teamA === 'Atlético Bucaramanga' || s.teamB === 'Atlético Bucaramanga')!.winnerTeam, 'Deportes Tolima');
  assert.equal(b2016II[2].ties[0].winnerTeam, 'Independiente Santa Fe');

  // Junior matchArchive: 26 in 2016-I (20 regular + 6 playoffs) + 20 in 2016-II
  const apArchive = t2016I.matchArchive || [];
  const finArchive = t2016II.matchArchive || [];
  assert.equal(apArchive.length, 26);
  assert.equal(finArchive.length, 20);
  const canonicalTeams2016 = new Set((t2016I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2016.has(m.homeTeam), `Non-canonical 2016 homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2016.has(m.awayTeam), `Non-canonical 2016 awayTeam: ${m.awayTeam}`);
    assert.ok(/2016$/.test(m.date), `Expected 2016 date: ${m.date}`);
  }
  assert.deepEqual(getMatchArchiveLapOptions(apArchive.length, apArchive).map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'apertura' }), 3), {
    pj: 20, pg: 10, pe: 7, pp: 3, gf: 28, gc: 20, dg: 8, pts: 37,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 4, gc: 4, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 0, pe: 2, pp: 0, gf: 1, gc: 1, dg: 0, pts: 2,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 0, pe: 1, pp: 1, gf: 1, gc: 3, dg: -2, pts: 1,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 26, pg: 11, pe: 10, pp: 5, gf: 34, gc: 28, dg: 6, pts: 43,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 20, pg: 7, pe: 7, pp: 6, gf: 25, gc: 27, dg: -2, pts: 28,
  });

  // Reclasificación Anual 2016 dynamic verification
  const rec2016 = getAnnualReclassificationByYear('2016-I');
  assert.ok(rec2016 && rec2016.id === 'reclasificacion-2016');
  assert.equal(getAnnualReclassificationByYear('2016-II')?.id, 'reclasificacion-2016');
  assert.equal(rec2016.rows.length, 20);

  const computed2016 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2016 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2016.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2016.set(team, cur);
  };
  for (const r of [...(t2016I.regularRows || []), ...(t2016II.regularRows || [])]) {
    add2016(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  }
  for (const m of [...(t2016I.playoffMatches || []), ...(t2016II.playoffMatches || [])]) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2016(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2016(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }
  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2016.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2016.get(row.team),
      `Reclasificación 2016 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2016.rows[0].team, 'Independiente Santa Fe');
  assert.equal(rec2016.rows[0].pts, 85);
  assert.equal(rec2016.rows[1].team, 'Atlético Nacional');
  assert.equal(rec2016.rows[1].pts, 84);
  assert.equal(rec2016.rows[2].team, 'Independiente Medellín');
  assert.equal(rec2016.rows[2].pts, 83);
  assert.equal(rec2016.rows[4].team, 'Junior de Barranquilla');
  assert.equal(rec2016.rows[4].pts, 71);
  assert.equal(rec2016.rows[4].pj, 46);
  assert.equal(rec2016.rows[19].team, 'Boyacá Chicó');
  assert.equal(rec2016.rows[19].pts, 31);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2016' && i.standingsTableId === 'reclasificacion-2016'));
});

// ── 96. 2017 Full Audit: 2017-I, 2017-II (Súper Líder ChaTeo), 42 Junior Matches & Reclasificación 2017 ──
test('96. 2017 full audit: 20-club zero-sum regular tables, clean 14+14 knockout brackets (24 garbage matches removed, 2 penalty shootouts), 20+22 Junior archive, search index, and Reclasificación 2017', () => {
  const t2017I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2017-I-regular')!;
  const t2017II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2017-II-playoffs')!;
  assert.ok(t2017I && t2017II);

  assert.equal(t2017I.championTeam, 'Atlético Nacional');
  assert.equal(t2017I.runnerUpTeam, 'Deportivo Cali');
  assert.equal(t2017II.championTeam, 'Millonarios F.C');
  assert.equal(t2017II.runnerUpTeam, 'Independiente Santa Fe');

  // Zero-sum 20-club regularRows verification
  for (const tbl of [t2017I, t2017II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 20);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // Exact 14 knockout playoffMatches each, clean dates/names, 8-club playoff rows reconciliation
  for (const tbl of [t2017I, t2017II]) {
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 14, `Expected exact 14 playoffMatches in ${tbl.id}`);
    assert.deepEqual([...new Set(playoffs.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
    for (const m of playoffs) {
      assert.ok(/2017$/.test(m.date || ''), `Expected clean 2017 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    }
    const tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs) {
      for (const [tm, gf, gc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += gf; cur.gc += gc;
        if (gf > gc) { cur.pg++; cur.pts += 3; } else if (gf < gc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        tally.set(tm, cur);
      }
    }
    assert.equal((tbl.rows || []).length, 8);
    for (const r of tbl.rows || []) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      assert.equal(r.gf - r.gc, r.dg);
    }
  }

  // Final 2017-I Vuelta 5th scorer Rodin Quiñones (77') restored
  const final2017IVuelta = (t2017I.playoffMatches || [])[13];
  assert.ok(final2017IVuelta.scorers?.includes("Quiñones (77')"));

  // Bracket & penalty shootout resolution checks
  const b2017I = buildPlayoffKnockoutBrackets(t2017I.playoffMatches || [], t2017I.championTeam);
  assert.equal(b2017I.length, 3);
  assert.equal(b2017I[2].ties[0].winnerTeam, 'Atlético Nacional');

  const b2017II = buildPlayoffKnockoutBrackets(t2017II.playoffMatches || [], t2017II.championTeam);
  assert.equal(b2017II.length, 3);
  assert.equal(b2017II[0].ties.find((s) => s.teamA === 'Junior de Barranquilla' || s.teamB === 'Junior de Barranquilla')!.winnerTeam, 'América de Cali');
  assert.equal(b2017II[0].ties.find((s) => s.teamA === 'Atlético Nacional' || s.teamB === 'Atlético Nacional')!.winnerTeam, 'Deportes Tolima');
  assert.equal(b2017II[2].ties[0].winnerTeam, 'Millonarios F.C');

  // Junior matchArchive: 20 in 2017-I + 22 in 2017-II (20 regular + 2 Cuartos)
  const apArchive = t2017I.matchArchive || [];
  const finArchive = t2017II.matchArchive || [];
  assert.equal(apArchive.length, 20);
  assert.equal(finArchive.length, 22);
  const canonicalTeams2017 = new Set((t2017I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2017.has(m.homeTeam), `Non-canonical 2017 homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2017.has(m.awayTeam), `Non-canonical 2017 awayTeam: ${m.awayTeam}`);
    assert.ok(/2017$/.test(m.date), `Expected 2017 date: ${m.date}`);
  }
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 20, pg: 6, pe: 5, pp: 9, gf: 25, gc: 26, dg: -1, pts: 23,
  });
  assert.deepEqual(getMatchArchiveLapOptions(finArchive.length, finArchive).map((o) => o.id), ['all', 'apertura', 'cuartos']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 20, pg: 12, pe: 3, pp: 5, gf: 32, gc: 15, dg: 17, pts: 39,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 0, pe: 2, pp: 0, gf: 2, gc: 2, dg: 0, pts: 2,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 22, pg: 12, pe: 5, pp: 5, gf: 34, gc: 17, dg: 17, pts: 41,
  });

  // Reclasificación Anual 2017 dynamic verification
  const rec2017 = getAnnualReclassificationByYear('2017-I');
  assert.ok(rec2017 && rec2017.id === 'reclasificacion-2017');
  assert.equal(getAnnualReclassificationByYear('2017-II')?.id, 'reclasificacion-2017');
  assert.equal(rec2017.rows.length, 20);

  const computed2017 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2017 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2017.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2017.set(team, cur);
  };
  for (const r of [...(t2017I.regularRows || []), ...(t2017II.regularRows || [])]) {
    add2017(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  }
  for (const m of [...(t2017I.playoffMatches || []), ...(t2017II.playoffMatches || [])]) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2017(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2017(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }
  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2017.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2017.get(row.team),
      `Reclasificación 2017 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2017.rows[0].team, 'Atlético Nacional');
  assert.equal(rec2017.rows[0].pts, 103);
  assert.equal(rec2017.rows[5].team, 'Junior de Barranquilla');
  assert.equal(rec2017.rows[5].pts, 64);
  assert.equal(rec2017.rows[5].pj, 42);
  assert.equal(rec2017.rows[19].team, 'Águilas Doradas');
  assert.equal(rec2017.rows[19].pts, 39);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2017' && i.standingsTableId === 'reclasificacion-2017'));
});

// ── 97. 2018 Full Audit: 2018-I, 2018-II (8ª Estrella ★), 46 Junior Matches & Reclasificación 2018 ──
test('97. 2018 full audit: 19-fecha zero-sum regular tables, 14+14 knockout brackets with all 5 penalty shootouts, 21+25 Junior archive with 19-fecha filters, search index, and Reclasificación 2018', () => {
  const t2018I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2018-I-playoffs')!;
  const t2018II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2018-II-playoffs')!;
  assert.ok(t2018I && t2018II);

  assert.equal(t2018I.championTeam, 'Deportes Tolima');
  assert.equal(t2018I.runnerUpTeam, 'Atlético Nacional');
  assert.equal(t2018II.championTeam, 'Junior de Barranquilla');
  assert.equal(t2018II.runnerUpTeam, 'Independiente Medellín');
  assert.equal(t2018II.isJuniorChampion, true);

  // Zero-sum 20-club 19-fecha regularRows verification
  for (const tbl of [t2018I, t2018II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 19);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // Exact 14 knockout playoffMatches each, clean dates/names, 8-club playoff rows reconciliation
  for (const tbl of [t2018I, t2018II]) {
    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 14);
    assert.deepEqual([...new Set(playoffs.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
    for (const m of playoffs) {
      assert.ok(/2018$/.test(m.date || ''), `Expected clean 2018 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    }
    const tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs) {
      for (const [tm, gf, gc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += gf; cur.gc += gc;
        if (gf > gc) { cur.pg++; cur.pts += 3; } else if (gf < gc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        tally.set(tm, cur);
      }
    }
    assert.equal((tbl.rows || []).length, 8);
    for (const r of tbl.rows || []) {
      assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      assert.equal(r.gf - r.gc, r.dg);
    }
  }

  // Verify ALL 5 penalty shootouts in 2018-I (4) and 2018-II (1) resolve to the exact winners
  const b2018I = buildPlayoffKnockoutBrackets(t2018I.playoffMatches || [], t2018I.championTeam);
  assert.equal(b2018I[0].ties.find((s) => s.teamA === 'Patriotas Boyacá' || s.teamB === 'Patriotas Boyacá')!.winnerTeam, 'Atlético Huila');
  assert.equal(b2018I[1].ties.find((s) => s.teamA === 'Atlético Huila' || s.teamB === 'Atlético Huila')!.winnerTeam, 'Atlético Nacional');
  assert.equal(b2018I[1].ties.find((s) => s.teamA === 'Independiente Medellín' || s.teamB === 'Independiente Medellín')!.winnerTeam, 'Deportes Tolima');
  assert.equal(b2018I[2].ties[0].winnerTeam, 'Deportes Tolima');

  const b2018II = buildPlayoffKnockoutBrackets(t2018II.playoffMatches || [], t2018II.championTeam);
  assert.equal(b2018II[0].ties.find((s) => s.teamA === 'Independiente Santa Fe' || s.teamB === 'Independiente Santa Fe')!.winnerTeam, 'Deportes Tolima');
  assert.equal(b2018II[2].ties[0].winnerTeam, 'Junior de Barranquilla');
  assert.ok((t2018II.playoffMatches || [])[5].scorers?.includes("Velázquez (44')"));

  // Junior matchArchive: 21 in 2018-I (19 regular + 2 Cuartos) + 25 in 2018-II (19 regular + 6 playoffs -> 8ª Estrella ★)
  const apArchive = t2018I.matchArchive || [];
  const finArchive = t2018II.matchArchive || [];
  assert.equal(apArchive.length, 21);
  assert.equal(finArchive.length, 25);
  const canonicalTeams2018 = new Set((t2018I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2018.has(m.homeTeam), `Non-canonical 2018 homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2018.has(m.awayTeam), `Non-canonical 2018 awayTeam: ${m.awayTeam}`);
    assert.ok(/2018$/.test(m.date), `Expected 2018 date: ${m.date}`);
  }
  assert.deepEqual(getMatchArchiveLapOptions(apArchive.length, apArchive).map((o) => o.id), ['all', 'apertura', 'cuartos']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'apertura' }), 3), {
    pj: 19, pg: 8, pe: 6, pp: 5, gf: 19, gc: 16, dg: 3, pts: 30,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 0, pe: 1, pp: 1, gf: 2, gc: 3, dg: -1, pts: 1,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 21, pg: 8, pe: 7, pp: 6, gf: 21, gc: 19, dg: 2, pts: 31,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArchive.length, finArchive).map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 19, pg: 9, pe: 5, pp: 5, gf: 32, gc: 17, dg: 15, pts: 32,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 1, pe: 1, pp: 0, gf: 1, gc: 0, dg: 1, pts: 4,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 1, pe: 1, pp: 0, gf: 4, gc: 3, dg: 1, pts: 4,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 5, gc: 4, dg: 1, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 25, pg: 12, pe: 7, pp: 6, gf: 42, gc: 24, dg: 18, pts: 43,
  });

  // Reclasificación Anual 2018 dynamic verification
  const rec2018 = getAnnualReclassificationByYear('2018-I');
  assert.ok(rec2018 && rec2018.id === 'reclasificacion-2018');
  assert.equal(getAnnualReclassificationByYear('2018-II')?.id, 'reclasificacion-2018');
  assert.equal(rec2018.rows.length, 20);

  const computed2018 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2018 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2018.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2018.set(team, cur);
  };
  for (const r of [...(t2018I.regularRows || []), ...(t2018II.regularRows || [])]) {
    add2018(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  }
  for (const m of [...(t2018I.playoffMatches || []), ...(t2018II.playoffMatches || [])]) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2018(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2018(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }
  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2018.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2018.get(row.team),
      `Reclasificación 2018 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2018.rows[0].team, 'Independiente Medellín');
  assert.equal(rec2018.rows[0].pts, 86);
  assert.equal(rec2018.rows[1].team, 'Deportes Tolima');
  assert.equal(rec2018.rows[1].pts, 85);
  assert.equal(rec2018.rows[3].team, 'Junior de Barranquilla');
  assert.equal(rec2018.rows[3].pts, 74);
  assert.equal(rec2018.rows[3].pj, 46);
  assert.equal(rec2018.rows[19].team, 'Itagüí Leones');
  assert.equal(rec2018.rows[19].pts, 22);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2018' && i.standingsTableId === 'reclasificacion-2018'));
});

// ── 98. 2019 Full Audit: 2019-I (9ª Estrella ★ Bicampeón), 2019-II (Subcampeón 🥈), 56 Junior Matches & Reclasificación 2019 ──
test('98. 2019 full audit: zero-sum regular & cuadrangular tables, 26+26 playoff matches with 4-5 shootout, 28+28 Junior archive with 28-match phase filters, search index, and Reclasificación 2019', () => {
  const t2019I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2019-I-cuadrangular')!;
  const t2019II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2019-II-cuadrangular')!;
  assert.ok(t2019I && t2019II);

  assert.equal(t2019I.championTeam, 'Junior de Barranquilla');
  assert.equal(t2019I.runnerUpTeam, 'Deportivo Pasto');
  assert.equal(t2019I.isJuniorChampion, true);
  assert.equal(t2019II.championTeam, 'América de Cali');
  assert.equal(t2019II.runnerUpTeam, 'Junior de Barranquilla');
  assert.equal(t2019II.isJuniorRunnerUp, true);

  // Zero-sum 20-club regularRows + cuadrangular group reconciliation
  for (const tbl of [t2019I, t2019II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 20);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);

    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);
    for (const m of playoffs) {
      assert.ok(/2019$/.test(m.date || ''), `Expected clean 2019 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    }

    // Reconcile 24 group matches against finalGroups
    const groupMatches = playoffs.filter((m) => /grupo [ab]/i.test(m.stage));
    assert.equal(groupMatches.length, 24);
    const tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of groupMatches) {
      for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += mgf; cur.gc += mgc;
        if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        tally.set(tm, cur);
      }
    }
    assert.equal((tbl.finalGroups || []).length, 2);
    for (const g of tbl.finalGroups || []) {
      assert.equal(g.rows.length, 4);
      for (const r of g.rows) {
        assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
        assert.equal(r.gf - r.gc, r.dg);
      }
    }
  }

  // Final bracket checks (including 2019-I Pasto vs Junior 4-5 penalty shootout)
  const b2019I = buildPlayoffKnockoutBrackets(t2019I.playoffMatches || [], t2019I.championTeam);
  assert.equal(b2019I.length, 1);
  assert.equal(b2019I[0].ties[0].winnerTeam, 'Junior de Barranquilla');
  assert.ok(b2019I[0].ties[0].penaltiesLabel?.includes('4-5') || b2019I[0].ties[0].penaltiesLabel?.includes('5-4'));

  const b2019II = buildPlayoffKnockoutBrackets(t2019II.playoffMatches || [], t2019II.championTeam);
  assert.equal(b2019II.length, 1);
  assert.equal(b2019II[0].ties[0].winnerTeam, 'América de Cali');

  // Junior matchArchive: 28 in 2019-I + 28 in 2019-II (56 total)
  const apArchive = t2019I.matchArchive || [];
  const finArchive = t2019II.matchArchive || [];
  assert.equal(apArchive.length, 28);
  assert.equal(finArchive.length, 28);
  const canonicalTeams2019 = new Set((t2019I.regularRows || []).map((r) => r.team));
  for (const m of [...apArchive, ...finArchive]) {
    assert.ok(canonicalTeams2019.has(m.homeTeam), `Non-canonical 2019 homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2019.has(m.awayTeam), `Non-canonical 2019 awayTeam: ${m.awayTeam}`);
    assert.ok(/2019$/.test(m.date), `Expected 2019 date: ${m.date}`);
  }

  assert.deepEqual(getMatchArchiveLapOptions(apArchive.length, apArchive).map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  assert.equal(getMatchArchiveLapOptions(apArchive.length, apArchive)[2].label, 'Cuadrangular B (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'apertura' }), 3), {
    pj: 20, pg: 6, pe: 12, pp: 2, gf: 24, gc: 18, dg: 6, pts: 30,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 3, pe: 3, pp: 0, gf: 9, gc: 5, dg: 4, pts: 12,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 1, gc: 1, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArchive, 3), {
    pj: 28, pg: 10, pe: 15, pp: 3, gf: 34, gc: 24, dg: 10, pts: 45,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArchive.length, finArchive).map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  assert.equal(getMatchArchiveLapOptions(finArchive.length, finArchive)[2].label, 'Cuadrangular A (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'apertura' }), 3), {
    pj: 20, pg: 9, pe: 6, pp: 5, gf: 16, gc: 9, dg: 7, pts: 33,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 3, pe: 2, pp: 1, gf: 11, gc: 8, dg: 3, pts: 11,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArchive, { lap: 'final' }), 3), {
    pj: 2, pg: 0, pe: 1, pp: 1, gf: 0, gc: 2, dg: -2, pts: 1,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArchive, 3), {
    pj: 28, pg: 12, pe: 9, pp: 7, gf: 27, gc: 19, dg: 8, pts: 45,
  });

  // Reclasificación Anual 2019 dynamic verification
  const rec2019 = getAnnualReclassificationByYear('2019-I');
  assert.ok(rec2019 && rec2019.id === 'reclasificacion-2019');
  assert.equal(getAnnualReclassificationByYear('2019-II')?.id, 'reclasificacion-2019');
  assert.equal(rec2019.rows.length, 20);

  const computed2019 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2019 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2019.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2019.set(team, cur);
  };
  for (const r of [...(t2019I.regularRows || []), ...(t2019II.regularRows || [])]) {
    add2019(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  }
  for (const m of [...(t2019I.playoffMatches || []), ...(t2019II.playoffMatches || [])]) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2019(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2019(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }
  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2019.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2019.get(row.team),
      `Reclasificación 2019 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2019.rows[0].team, 'América de Cali');
  assert.equal(rec2019.rows[0].pts, 92);
  assert.equal(rec2019.rows[1].team, 'Junior de Barranquilla');
  assert.equal(rec2019.rows[1].pts, 90);
  assert.equal(rec2019.rows[1].pj, 56);
  assert.equal(rec2019.rows[19].team, 'Atlético Huila');
  assert.equal(rec2019.rows[19].pts, 35);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2019' && i.standingsTableId === 'reclasificacion-2019'));
});

// ── 99. 2020 Full Audit: Torneo Único de Pandemia, Pasto GC=19 Zero-Sum Fix, Clean 14 Play-offs, 24 Junior Matches & Reclasificación 2020 ──
test('99. 2020 full audit: Pasto zero-sum regular table fix, clean 8-club playoff rows & 14 knockout brackets (no Liguilla pollution), 24 Junior archive with 20+2+2 filters, search index, and Reclasificación 2020', () => {
  const t2020 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2020-playoffs')!;
  assert.ok(t2020);
  assert.equal(t2020.championTeam, 'América de Cali');
  assert.equal(t2020.runnerUpTeam, 'Independiente Santa Fe');
  assert.equal(t2020.finalGroups, undefined, '2020-playoffs should not carry Liguilla de Eliminados tables in finalGroups');

  // Zero-sum 20-club regularRows (verifying Pasto gc=19, dg=8 repair)
  const rows = t2020.regularRows || [];
  assert.equal(rows.length, 20);
  const pasto = rows.find((r) => r.team === 'Deportivo Pasto')!;
  assert.equal(pasto.gc, 19);
  assert.equal(pasto.dg, 8);
  let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
  for (const r of rows) {
    assert.equal(r.pj, 20);
    assert.equal(r.pg + r.pe + r.pp, r.pj);
    assert.equal(r.gf - r.gc, r.dg);
    assert.equal(r.pg * 3 + r.pe, r.pts);
    pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
  }
  assert.equal(pg, pp);
  assert.equal(gf, gc);
  assert.equal(gf, 490);
  assert.equal(pe % 2, 0);

  // Clean 14 Play-offs knockout matches (Cuartos + Semifinales + Gran Final only) & 8-club zero-sum rows
  const playoffs = t2020.playoffMatches || [];
  assert.equal(playoffs.length, 14);
  assert.deepEqual([...new Set(playoffs.map((m) => m.stage))].sort(), ['Cuartos de final', 'Gran Final', 'Semifinales']);
  for (const m of playoffs) {
    assert.ok(/2020$/.test(m.date || ''), `Expected clean 2020 date: ${m.date}`);
  }
  const tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const m of playoffs) {
    for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
      const cur = tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      cur.pj++; cur.gf += mgf; cur.gc += mgc;
      if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
      tally.set(tm, cur);
    }
  }
  assert.equal((t2020.rows || []).length, 8);
  for (const r of t2020.rows || []) {
    assert.deepEqual(tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    assert.equal(r.gf - r.gc, r.dg);
  }

  // Knockout bracket verification (3 clean rounds: 4 QF, 2 SF, 1 Final — zero phantom 3rd-place or Liguilla ties)
  const b2020 = buildPlayoffKnockoutBrackets(playoffs, t2020.championTeam);
  assert.deepEqual(b2020.map((r) => r.key), ['cuartos', 'semifinales', 'final']);
  assert.equal(b2020[0].ties.length, 4);
  assert.equal(b2020[1].ties.length, 2);
  assert.equal(b2020[2].ties.length, 1);
  assert.equal(b2020[0].ties.find((s) => s.teamA === 'Junior de Barranquilla')!.winnerTeam, 'Junior de Barranquilla');
  assert.equal(b2020[1].ties.find((s) => s.teamB === 'Junior de Barranquilla')!.winnerTeam, 'América de Cali');
  assert.equal(b2020[2].ties[0].winnerTeam, 'América de Cali');

  // Junior matchArchive: 24 matches (20 regular + 2 Cuartos + 2 Semifinal)
  const archive = t2020.matchArchive || [];
  assert.equal(archive.length, 24);
  const canonicalTeams2020 = new Set(rows.map((r) => r.team));
  for (const m of archive) {
    assert.ok(canonicalTeams2020.has(m.homeTeam), `Non-canonical 2020 homeTeam: ${m.homeTeam}`);
    assert.ok(canonicalTeams2020.has(m.awayTeam), `Non-canonical 2020 awayTeam: ${m.awayTeam}`);
    assert.ok(/2020$/.test(m.date), `Expected 2020 date: ${m.date}`);
  }
  assert.deepEqual(getMatchArchiveLapOptions(archive.length, archive).map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal']);
  assert.equal(getMatchArchiveLapOptions(archive.length, archive)[1].label, 'Todos contra Todos (20)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(archive, { lap: 'apertura' }), 3), {
    pj: 20, pg: 8, pe: 9, pp: 3, gf: 27, gc: 17, dg: 10, pts: 33,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(archive, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 2, pe: 0, pp: 0, gf: 2, gc: 0, dg: 2, pts: 6,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(archive, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 0, pe: 1, pp: 1, gf: 1, gc: 2, dg: -1, pts: 1,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(archive, 3), {
    pj: 24, pg: 10, pe: 10, pp: 4, gf: 30, gc: 19, dg: 11, pts: 40,
  });

  // Reclasificación Anual 2020 dynamic verification
  const rec2020 = getAnnualReclassificationByYear('2020');
  assert.ok(rec2020 && rec2020.id === 'reclasificacion-2020');
  assert.equal(rec2020.rows.length, 20);

  const computed2020 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2020 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2020.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2020.set(team, cur);
  };
  for (const r of rows) {
    add2020(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
  }
  for (const m of playoffs) {
    const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
    add2020(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
    add2020(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
  }
  let recPg = 0, recPp = 0, recGf = 0, recGc = 0;
  for (const row of rec2020.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2020.get(row.team),
      `Reclasificación 2020 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    recPg += row.pg; recPp += row.pp; recGf += row.gf; recGc += row.gc;
  }
  assert.equal(recPg, recPp);
  assert.equal(recGf, recGc);
  assert.equal(rec2020.rows[0].team, 'Independiente Santa Fe');
  assert.equal(rec2020.rows[0].pts, 50);
  assert.equal(rec2020.rows[1].team, 'América de Cali');
  assert.equal(rec2020.rows[1].pts, 43);
  assert.equal(rec2020.rows[2].team, 'Junior de Barranquilla');
  assert.equal(rec2020.rows[2].pts, 40);
  assert.equal(rec2020.rows[2].pj, 24);
  assert.equal(rec2020.rows[19].team, 'Cúcuta Deportivo');
  assert.equal(rec2020.rows[19].pts, 14);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2020' && i.standingsTableId === 'reclasificacion-2020'));
});

// ── 100. 2021 Full Audit: 2021-I (19 Clubs + 8-Club Play-offs), 2021-II (Cuadrangulares Clean 26 Matches), 48 Junior Matches & Reclasificación 2021 ──
test('100. 2021 full audit: zero-sum 19+20 regular tables, 2021-I 8-club playoffs & brackets, 2021-II clean 26 matches (no Estadísticas dump, Gran Final bracket), 22+26 Junior archive, search index, and Reclasificación 2021 (21 clubs)', () => {
  const t2021I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2021-I-playoffs')!;
  const t2021II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2021-II-cuadrangular')!;
  assert.ok(t2021I && t2021II);

  assert.equal(t2021I.championTeam, 'Deportes Tolima');
  assert.equal(t2021I.runnerUpTeam, 'Millonarios F.C');
  assert.equal(t2021II.championTeam, 'Deportivo Cali');
  assert.equal(t2021II.runnerUpTeam, 'Deportes Tolima');

  // Zero-sum regularRows (19 clubs x 18 PJ in 2021-I; 20 clubs x 20 PJ in 2021-II)
  for (const [tbl, expClubs, expPj] of [[t2021I, 19, 18], [t2021II, 20, 20]] as const) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, expClubs);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, expPj);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // 2021-I Play-offs: 14 matches, 3 knockout rounds (4 QF, 2 SF, 1 Final), 8-club zero-sum rows
  const pm2021I = t2021I.playoffMatches || [];
  assert.equal(pm2021I.length, 14);
  for (const m of pm2021I) {
    assert.ok(/2021$/.test(m.date || ''), `Expected clean 2021 date in 2021-I: ${m.date}`);
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
  }
  const b2021I = buildPlayoffKnockoutBrackets(pm2021I, t2021I.championTeam);
  assert.equal(b2021I.length, 3);
  assert.deepEqual(b2021I.map((r) => r.ties.length), [4, 2, 1]);
  assert.equal(b2021I[2].ties[0].winnerTeam, 'Deportes Tolima');

  assert.equal((t2021I.rows || []).length, 8);
  const pTally2021I = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const m of pm2021I) {
    for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
      const cur = pTally2021I.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      cur.pj++; cur.gf += mgf; cur.gc += mgc;
      if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
      pTally2021I.set(tm, cur);
    }
  }
  for (const r of t2021I.rows || []) {
    assert.deepEqual(pTally2021I.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    assert.equal(r.gf - r.gc, r.dg);
  }

  // 2021-II Cuadrangulares: 26 clean matches (no Estadísticas dump, no <br/>), 24 group reconcile, 1 Final bracket
  const pm2021II = t2021II.playoffMatches || [];
  assert.equal(pm2021II.length, 26);
  for (const m of pm2021II) {
    assert.ok(/2021$/.test(m.date || ''), `Expected clean 2021 date in 2021-II: ${m.date}`);
    assert.ok(!/estad[ií]stica/i.test(m.stage));
    assert.ok(!(m.scorers || '').includes('<br'));
    assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
  }
  const b2021II = buildPlayoffKnockoutBrackets(pm2021II, t2021II.championTeam);
  assert.equal(b2021II.length, 1);
  assert.equal(b2021II[0].ties[0].winnerTeam, 'Deportivo Cali');

  const gTally2021II = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const m of pm2021II.filter((x) => /grupo [ab]/i.test(x.stage))) {
    for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
      const cur = gTally2021II.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      cur.pj++; cur.gf += mgf; cur.gc += mgc;
      if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
      gTally2021II.set(tm, cur);
    }
  }
  for (const g of t2021II.finalGroups || []) {
    for (const r of g.rows) {
      assert.deepEqual(gTally2021II.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    }
  }

  // Junior matchArchive: 22 in 2021-I + 26 in 2021-II (48 total)
  const apArch = t2021I.matchArchive || [];
  const finArch = t2021II.matchArchive || [];
  assert.equal(apArch.length, 22);
  assert.equal(finArch.length, 26);
  const canon2021I = new Set((t2021I.regularRows || []).map((r) => r.team));
  const canon2021II = new Set((t2021II.regularRows || []).map((r) => r.team));
  for (const m of apArch) {
    assert.ok(canon2021I.has(m.homeTeam) && canon2021I.has(m.awayTeam), `Non-canonical 2021-I team: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(/2021$/.test(m.date));
  }
  for (const m of finArch) {
    assert.ok(canon2021II.has(m.homeTeam) && canon2021II.has(m.awayTeam), `Non-canonical 2021-II team: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(/2021$/.test(m.date));
  }

  assert.deepEqual(getMatchArchiveLapOptions(apArch.length, apArch).map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'apertura' }), 3), {
    pj: 18, pg: 8, pe: 5, pp: 5, gf: 21, gc: 13, dg: 8, pts: 29,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 1, pe: 1, pp: 0, gf: 3, gc: 1, dg: 2, pts: 4,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 3, gc: 4, dg: -1, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArch, 3), {
    pj: 22, pg: 10, pe: 6, pp: 6, gf: 27, gc: 18, dg: 9, pts: 36,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArch.length, finArch).map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.equal(getMatchArchiveLapOptions(finArch.length, finArch)[2].label, 'Cuadrangular A (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'apertura' }), 3), {
    pj: 20, pg: 8, pe: 9, pp: 3, gf: 25, gc: 21, dg: 4, pts: 33,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 1, pe: 4, pp: 1, gf: 9, gc: 8, dg: 1, pts: 7,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArch, 3), {
    pj: 26, pg: 9, pe: 13, pp: 4, gf: 34, gc: 29, dg: 5, pts: 40,
  });

  // Reclasificación Anual 2021 dynamic 21-club zero-sum reconciliation
  const rec2021 = getAnnualReclassificationByYear('2021-I');
  assert.ok(rec2021 && rec2021.id === 'reclasificacion-2021');
  assert.equal(getAnnualReclassificationByYear('2021-II')?.id, 'reclasificacion-2021');
  assert.equal(rec2021.rows.length, 21);

  const computed2021 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2021 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2021.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2021.set(team, cur);
  };
  for (const tbl of [t2021I, t2021II]) {
    for (const r of tbl.regularRows || []) add2021(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of tbl.playoffMatches || []) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2021(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2021(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }
  let r21Pg = 0, r21Pp = 0, r21Gf = 0, r21Gc = 0;
  for (const row of rec2021.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2021.get(row.team),
      `Reclasificación 2021 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    r21Pg += row.pg; r21Pp += row.pp; r21Gf += row.gf; r21Gc += row.gc;
  }
  assert.equal(r21Pg, r21Pp);
  assert.equal(r21Gf, r21Gc);
  assert.equal(rec2021.rows[0].team, 'Deportes Tolima');
  assert.equal(rec2021.rows[0].pts, 90);
  assert.equal(rec2021.rows[4].team, 'Junior de Barranquilla');
  assert.equal(rec2021.rows[4].pts, 76);
  assert.equal(rec2021.rows[4].pj, 48);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2021' && i.standingsTableId === 'reclasificacion-2021'));
});

// ── 101. 2022 Full Audit: 2022-I & 2022-II Cuadrangulares, Pereira 4-3 Shootout, 52 Junior Matches & Reclasificación 2022 ──
test('101. 2022 full audit: zero-sum regular & cuadrangular tables, 26+26 clean playoffs with Pereira 4-3 shootout, 26+26 Junior archive, search index, and Reclasificación 2022', () => {
  const t2022I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2022-I-cuadrangular')!;
  const t2022II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2022-II-cuadrangular')!;
  assert.ok(t2022I && t2022II);

  assert.equal(t2022I.championTeam, 'Atlético Nacional');
  assert.equal(t2022I.runnerUpTeam, 'Deportes Tolima');
  assert.equal(t2022II.championTeam, 'Deportivo Pereira');
  assert.equal(t2022II.runnerUpTeam, 'Independiente Medellín');

  for (const tbl of [t2022I, t2022II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 20);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);

    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);
    for (const m of playoffs) {
      assert.ok(/2022$/.test(m.date || ''), `Expected clean 2022 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
      assert.ok(!m.homeTeam.includes('Envigado F.C.') && !m.awayTeam.includes('Envigado F.C.'));
    }

    const gTally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs.filter((x) => /grupo [ab]/i.test(x.stage))) {
      for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = gTally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += mgf; cur.gc += mgc;
        if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        gTally.set(tm, cur);
      }
    }
    for (const g of tbl.finalGroups || []) {
      for (const r of g.rows) {
        assert.deepEqual(gTally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
  }

  // Final bracket checks (including 2022-II Pereira 4-3 shootout over DIM)
  const b2022I = buildPlayoffKnockoutBrackets(t2022I.playoffMatches || [], t2022I.championTeam);
  assert.equal(b2022I.length, 1);
  assert.equal(b2022I[0].ties[0].winnerTeam, 'Atlético Nacional');

  const b2022II = buildPlayoffKnockoutBrackets(t2022II.playoffMatches || [], t2022II.championTeam);
  assert.equal(b2022II.length, 1);
  assert.equal(b2022II[0].ties[0].winnerTeam, 'Deportivo Pereira');
  assert.ok(b2022II[0].ties[0].penaltiesLabel?.includes('4-3'));

  // Junior matchArchive: 26 in 2022-I + 26 in 2022-II (52 total)
  const apArch = t2022I.matchArchive || [];
  const finArch = t2022II.matchArchive || [];
  assert.equal(apArch.length, 26);
  assert.equal(finArch.length, 26);
  const canon2022 = new Set((t2022I.regularRows || []).map((r) => r.team));
  for (const m of [...apArch, ...finArch]) {
    assert.ok(canon2022.has(m.homeTeam) && canon2022.has(m.awayTeam), `Non-canonical 2022 team: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(/2022$/.test(m.date));
  }

  assert.deepEqual(getMatchArchiveLapOptions(apArch.length, apArch).map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.equal(getMatchArchiveLapOptions(apArch.length, apArch)[2].label, 'Cuadrangular A (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'apertura' }), 3), {
    pj: 20, pg: 10, pe: 2, pp: 8, gf: 30, gc: 21, dg: 9, pts: 32,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 2, pe: 2, pp: 2, gf: 5, gc: 6, dg: -1, pts: 8,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArch, 3), {
    pj: 26, pg: 12, pe: 4, pp: 10, gf: 35, gc: 27, dg: 8, pts: 40,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArch.length, finArch).map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'apertura' }), 3), {
    pj: 20, pg: 9, pe: 4, pp: 7, gf: 24, gc: 19, dg: 5, pts: 31,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 0, pe: 1, pp: 5, gf: 5, gc: 11, dg: -6, pts: 1,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArch, 3), {
    pj: 26, pg: 9, pe: 5, pp: 12, gf: 29, gc: 30, dg: -1, pts: 32,
  });

  // Reclasificación Anual 2022 dynamic 20-club zero-sum reconciliation
  const rec2022 = getAnnualReclassificationByYear('2022-I');
  assert.ok(rec2022 && rec2022.id === 'reclasificacion-2022');
  assert.equal(getAnnualReclassificationByYear('2022-II')?.id, 'reclasificacion-2022');
  assert.equal(rec2022.rows.length, 20);

  const computed2022 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2022 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2022.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2022.set(team, cur);
  };
  for (const tbl of [t2022I, t2022II]) {
    for (const r of tbl.regularRows || []) add2022(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of tbl.playoffMatches || []) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2022(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2022(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }
  let r22Pg = 0, r22Pp = 0, r22Gf = 0, r22Gc = 0;
  for (const row of rec2022.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2022.get(row.team),
      `Reclasificación 2022 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    r22Pg += row.pg; r22Pp += row.pp; r22Gf += row.gf; r22Gc += row.gc;
  }
  assert.equal(r22Pg, r22Pp);
  assert.equal(r22Gf, r22Gc);
  assert.equal(rec2022.rows[0].team, 'Millonarios F.C');
  assert.equal(rec2022.rows[0].pts, 91);
  assert.equal(rec2022.rows[1].team, 'Independiente Medellín');
  assert.equal(rec2022.rows[1].pts, 91);
  assert.equal(rec2022.rows[4].team, 'Junior de Barranquilla');
  assert.equal(rec2022.rows[4].pts, 72);
  assert.equal(rec2022.rows[4].pj, 52);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2022' && i.standingsTableId === 'reclasificacion-2022'));
});

// ── 102. 2023 Full Audit: 2023-I (Millonarios 3-2) & 2023-II (Junior 10ª Estrella 3-5), 48 Junior Matches & Reclasificación 2023 ──
test('102. 2023 full audit: zero-sum regular & cuadrangular tables, 26+26 clean playoffs with 3-2 & 3-5 shootouts, 20+28 Junior archive, search index, and Reclasificación 2023', () => {
  const t2023I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-I-regular')!;
  const t2023II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2023-II-cuadrangular')!;
  assert.ok(t2023I && t2023II);

  assert.equal(t2023I.championTeam, 'Millonarios F.C');
  assert.equal(t2023I.runnerUpTeam, 'Atlético Nacional');
  assert.equal(t2023II.championTeam, 'Junior de Barranquilla');
  assert.equal(t2023II.runnerUpTeam, 'Independiente Medellín');
  assert.equal(t2023II.isJuniorChampion, true);

  for (const tbl of [t2023I, t2023II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 20);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);

    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);
    for (const m of playoffs) {
      assert.ok(/2023$/.test(m.date || ''), `Expected clean 2023 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
      assert.ok(!m.note?.endsWith('del clu') && !m.note?.endsWith('la Co'), `Truncated note found in ${tbl.id}: ${m.note}`);
    }

    const gTally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs.filter((x) => /grupo [ab]/i.test(x.stage))) {
      for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = gTally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += mgf; cur.gc += mgc;
        if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        gTally.set(tm, cur);
      }
    }
    for (const g of tbl.finalGroups || []) {
      for (const r of g.rows) {
        assert.deepEqual(gTally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
  }

  // Final knockout brackets & shootout resolution
  const b2023I = buildPlayoffKnockoutBrackets(t2023I.playoffMatches || [], t2023I.championTeam);
  assert.equal(b2023I.length, 1);
  assert.equal(b2023I[0].ties[0].winnerTeam, 'Millonarios F.C');
  assert.ok(b2023I[0].ties[0].penaltiesLabel?.includes('3-2'));

  const b2023II = buildPlayoffKnockoutBrackets(t2023II.playoffMatches || [], t2023II.championTeam);
  assert.equal(b2023II.length, 1);
  assert.equal(b2023II[0].ties[0].winnerTeam, 'Junior de Barranquilla');
  assert.ok(b2023II[0].ties[0].penaltiesLabel?.includes('3-5'));

  // Junior matchArchive: 20 in 2023-I + 28 in 2023-II (48 total)
  const apArch = t2023I.matchArchive || [];
  const finArch = t2023II.matchArchive || [];
  assert.equal(apArch.length, 20);
  assert.equal(finArch.length, 28);
  const canon2023 = new Set((t2023I.regularRows || []).map((r) => r.team));
  for (const m of [...apArch, ...finArch]) {
    assert.ok(canon2023.has(m.homeTeam) && canon2023.has(m.awayTeam), `Non-canonical 2023 team: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(/2023$/.test(m.date));
  }

  assert.deepEqual(computeJuniorMatchArchiveSummary(apArch, 3), {
    pj: 20, pg: 7, pe: 7, pp: 6, gf: 17, gc: 17, dg: 0, pts: 28,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArch.length, finArch).map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  assert.equal(getMatchArchiveLapOptions(finArch.length, finArch)[2].label, 'Cuadrangular A (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'apertura' }), 3), {
    pj: 20, pg: 8, pe: 6, pp: 6, gf: 29, gc: 17, dg: 12, pts: 30,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 4, pe: 1, pp: 1, gf: 15, gc: 7, dg: 8, pts: 13,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 4, gc: 4, dg: 0, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArch, 3), {
    pj: 28, pg: 13, pe: 7, pp: 8, gf: 48, gc: 28, dg: 20, pts: 46,
  });

  // Reclasificación Anual 2023 dynamic 20-club zero-sum reconciliation
  const rec2023 = getAnnualReclassificationByYear('2023-I');
  assert.ok(rec2023 && rec2023.id === 'reclasificacion-2023');
  assert.equal(getAnnualReclassificationByYear('2023-II')?.id, 'reclasificacion-2023');
  assert.equal(rec2023.rows.length, 20);

  const computed2023 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2023 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2023.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2023.set(team, cur);
  };
  for (const tbl of [t2023I, t2023II]) {
    for (const r of tbl.regularRows || []) add2023(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of tbl.playoffMatches || []) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2023(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2023(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }
  let r23Pg = 0, r23Pp = 0, r23Gf = 0, r23Gc = 0;
  for (const row of rec2023.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2023.get(row.team),
      `Reclasificación 2023 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    r23Pg += row.pg; r23Pp += row.pp; r23Gf += row.gf; r23Gc += row.gc;
  }
  assert.equal(r23Pg, r23Pp);
  assert.equal(r23Gf, r23Gc);
  assert.equal(rec2023.rows[0].team, 'Águilas Doradas');
  assert.equal(rec2023.rows[0].pts, 93);
  assert.equal(rec2023.rows[5].team, 'Junior de Barranquilla');
  assert.equal(rec2023.rows[5].pts, 74);
  assert.equal(rec2023.rows[5].pj, 48);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2023' && i.standingsTableId === 'reclasificacion-2023'));
});

// ── 103. 2024 Full Audit: 19-Fecha Regular Tables, Bucaramanga 5-6 Shootout, 2024-II Grupo B Fix, 50 Junior Matches & Reclasificación 2024 ──
test('103. 2024 full audit: 19-fecha zero-sum regular & cuadrangular tables, Grupo B rows fix, 26+26 playoffs with 5-6 shootout, 25+25 Junior archive, search index, and Reclasificación 2024', () => {
  const t2024I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2024-I-cuadrangular')!;
  const t2024II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2024-II-cuadrangular')!;
  assert.ok(t2024I && t2024II);

  assert.equal(t2024I.championTeam, 'Atlético Bucaramanga');
  assert.equal(t2024I.runnerUpTeam, 'Independiente Santa Fe');
  assert.equal(t2024II.championTeam, 'Atlético Nacional');
  assert.equal(t2024II.runnerUpTeam, 'Deportes Tolima');

  // Verify 2024-II summary rows display Junior's Grupo B (not Grupo A)
  assert.equal(t2024II.rows[0].team, 'Deportes Tolima');
  assert.equal(t2024II.rows[3].team, 'Junior de Barranquilla');
  assert.equal(t2024II.rows[3].isJunior, true);

  for (const tbl of [t2024I, t2024II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 19);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      assert.ok(r.team !== 'Alianza F. C', `Unnormalized Alianza F. C in ${tbl.id}`);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);

    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);
    for (const m of playoffs) {
      assert.ok(/2024$/.test(m.date || ''), `Expected clean 2024 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
    }

    const gTally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs.filter((x) => /grupo [ab]/i.test(x.stage))) {
      for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = gTally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += mgf; cur.gc += mgc;
        if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        gTally.set(tm, cur);
      }
    }
    for (const g of tbl.finalGroups || []) {
      for (const r of g.rows) {
        assert.deepEqual(gTally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
  }

  // Final brackets (Bucaramanga 5-6 shootout over Santa Fe & Atlético Nacional 3-1 over Tolima)
  const b2024I = buildPlayoffKnockoutBrackets(t2024I.playoffMatches || [], t2024I.championTeam);
  assert.equal(b2024I.length, 1);
  assert.equal(b2024I[0].ties[0].winnerTeam, 'Atlético Bucaramanga');
  assert.ok(b2024I[0].ties[0].penaltiesLabel?.includes('5-6'));

  const b2024II = buildPlayoffKnockoutBrackets(t2024II.playoffMatches || [], t2024II.championTeam);
  assert.equal(b2024II.length, 1);
  assert.equal(b2024II[0].ties[0].winnerTeam, 'Atlético Nacional');

  // Junior matchArchive: 25 in 2024-I + 25 in 2024-II (50 total)
  const apArch = t2024I.matchArchive || [];
  const finArch = t2024II.matchArchive || [];
  assert.equal(apArch.length, 25);
  assert.equal(finArch.length, 25);
  const canon2024 = new Set((t2024I.regularRows || []).map((r) => r.team));
  for (const m of [...apArch, ...finArch]) {
    assert.ok(canon2024.has(m.homeTeam) && canon2024.has(m.awayTeam), `Non-canonical 2024 team: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(/2024$/.test(m.date));
  }

  assert.deepEqual(getMatchArchiveLapOptions(apArch.length, apArch).map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.equal(getMatchArchiveLapOptions(apArch.length, apArch)[1].label, 'Todos contra Todos (19)');
  assert.equal(getMatchArchiveLapOptions(apArch.length, apArch)[2].label, 'Cuadrangular A (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'apertura' }), 3), {
    pj: 19, pg: 8, pe: 5, pp: 6, gf: 24, gc: 21, dg: 3, pts: 29,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 2, pe: 2, pp: 2, gf: 5, gc: 6, dg: -1, pts: 8,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArch, 3), {
    pj: 25, pg: 10, pe: 7, pp: 8, gf: 29, gc: 27, dg: 2, pts: 37,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArch.length, finArch).map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.equal(getMatchArchiveLapOptions(finArch.length, finArch)[1].label, 'Todos contra Todos (19)');
  assert.equal(getMatchArchiveLapOptions(finArch.length, finArch)[2].label, 'Cuadrangular B (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'apertura' }), 3), {
    pj: 19, pg: 8, pe: 7, pp: 4, gf: 26, gc: 16, dg: 10, pts: 31,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 2, pe: 1, pp: 3, gf: 7, gc: 8, dg: -1, pts: 7,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArch, 3), {
    pj: 25, pg: 10, pe: 8, pp: 7, gf: 33, gc: 24, dg: 9, pts: 38,
  });

  // Reclasificación Anual 2024 dynamic 20-club zero-sum reconciliation
  const rec2024 = getAnnualReclassificationByYear('2024-I');
  assert.ok(rec2024 && rec2024.id === 'reclasificacion-2024');
  assert.equal(getAnnualReclassificationByYear('2024-II')?.id, 'reclasificacion-2024');
  assert.equal(rec2024.rows.length, 20);

  const computed2024 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2024 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2024.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2024.set(team, cur);
  };
  for (const tbl of [t2024I, t2024II]) {
    for (const r of tbl.regularRows || []) add2024(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of tbl.playoffMatches || []) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2024(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2024(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }
  let r24Pg = 0, r24Pp = 0, r24Gf = 0, r24Gc = 0;
  for (const row of rec2024.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2024.get(row.team),
      `Reclasificación 2024 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    r24Pg += row.pg; r24Pp += row.pp; r24Gf += row.gf; r24Gc += row.gc;
  }
  assert.equal(r24Pg, r24Pp);
  assert.equal(r24Gf, r24Gc);
  assert.equal(rec2024.rows[0].team, 'Deportes Tolima');
  assert.equal(rec2024.rows[0].pts, 93);
  assert.equal(rec2024.rows[1].team, 'Independiente Santa Fe');
  assert.equal(rec2024.rows[1].pts, 91);
  assert.equal(rec2024.rows[5].team, 'Junior de Barranquilla');
  assert.equal(rec2024.rows[5].pts, 75);
  assert.equal(rec2024.rows[5].pj, 50);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2024' && i.standingsTableId === 'reclasificacion-2024'));
});

// ── 104. 2025 Full Audit: Centenaria 2025-I & 11ª Estrella 2025-II, 54 Junior Matches & Reclasificación 2025 ──
test('104. 2025 full audit: 20-fecha zero-sum regular & cuadrangular tables, 26+26 normalized playoffs, 26+28 Junior archive (11ª Estrella), search index, and Reclasificación 2025', () => {
  const t2025I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2025-I-cuadrangular')!;
  const t2025II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2025-II-cuadrangular')!;
  assert.ok(t2025I && t2025II);

  assert.equal(t2025I.championTeam, 'Independiente Santa Fe');
  assert.equal(t2025I.runnerUpTeam, 'Independiente Medellín');
  assert.equal(t2025II.championTeam, 'Junior de Barranquilla');
  assert.equal(t2025II.runnerUpTeam, 'Deportes Tolima');
  assert.equal(t2025II.isJuniorChampion, true);

  for (const tbl of [t2025I, t2025II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 20);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);

    const playoffs = tbl.playoffMatches || [];
    assert.equal(playoffs.length, 26);
    for (const m of playoffs) {
      assert.ok(/2025$/.test(m.date || ''), `Expected clean 2025 date in ${tbl.id}: ${m.date}`);
      assert.ok(!m.homeTeam.includes('Millonarios F.C.') && !m.awayTeam.includes('Millonarios F.C.'));
      assert.ok(!(m.scorers || '').includes("pen.'") && !(m.scorers || '').includes("a.g.'"), `Malformed scorer punctuation in ${tbl.id}: ${m.scorers}`);
      assert.ok((m.venue || '').startsWith('Estadio '), `Expected full Estadio venue in ${tbl.id}: ${m.venue}`);
    }

    const gTally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
    for (const m of playoffs.filter((x) => /grupo [ab]/i.test(x.stage))) {
      for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
        const cur = gTally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
        cur.pj++; cur.gf += mgf; cur.gc += mgc;
        if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
        gTally.set(tm, cur);
      }
    }
    for (const g of tbl.finalGroups || []) {
      for (const r of g.rows) {
        assert.deepEqual(gTally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
      }
    }
  }

  // Final knockout brackets (Santa Fe 2-1 DIM in 2025-I; Junior 4-0 Tolima in 2025-II)
  const b2025I = buildPlayoffKnockoutBrackets(t2025I.playoffMatches || [], t2025I.championTeam);
  assert.equal(b2025I.length, 1);
  assert.equal(b2025I[0].ties[0].winnerTeam, 'Independiente Santa Fe');

  const b2025II = buildPlayoffKnockoutBrackets(t2025II.playoffMatches || [], t2025II.championTeam);
  assert.equal(b2025II.length, 1);
  assert.equal(b2025II[0].ties[0].winnerTeam, 'Junior de Barranquilla');
  assert.equal(b2025II[0].ties[0].teamAGoals, 4);
  assert.equal(b2025II[0].ties[0].teamBGoals, 0);

  // Junior matchArchive: 26 in 2025-I + 28 in 2025-II (54 total)
  const apArch = t2025I.matchArchive || [];
  const finArch = t2025II.matchArchive || [];
  assert.equal(apArch.length, 26);
  assert.equal(finArch.length, 28);
  const canon2025 = new Set((t2025I.regularRows || []).map((r) => r.team));
  for (const m of [...apArch, ...finArch]) {
    assert.ok(canon2025.has(m.homeTeam) && canon2025.has(m.awayTeam), `Non-canonical 2025 team: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(/2025$/.test(m.date), `Expected 2025 date: ${m.date}`);
    assert.ok((m.venue || '').startsWith('Estadio '), `Expected full venue: ${m.venue}`);
  }

  assert.deepEqual(getMatchArchiveLapOptions(apArch.length, apArch).map((o) => o.id), ['all', 'apertura', 'semifinal']);
  assert.equal(getMatchArchiveLapOptions(apArch.length, apArch)[1].label, 'Todos contra Todos (20)');
  assert.equal(getMatchArchiveLapOptions(apArch.length, apArch)[2].label, 'Cuadrangular A (6)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'apertura' }), 3), {
    pj: 20, pg: 10, pe: 7, pp: 3, gf: 26, gc: 16, dg: 10, pts: 37,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 0, pe: 1, pp: 5, gf: 2, gc: 8, dg: -6, pts: 1,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArch, 3), {
    pj: 26, pg: 10, pe: 8, pp: 8, gf: 28, gc: 24, dg: 4, pts: 38,
  });

  assert.deepEqual(getMatchArchiveLapOptions(finArch.length, finArch).map((o) => o.id), ['all', 'apertura', 'semifinal', 'final']);
  assert.equal(getMatchArchiveLapOptions(finArch.length, finArch)[1].label, 'Todos contra Todos (20)');
  assert.equal(getMatchArchiveLapOptions(finArch.length, finArch)[2].label, 'Cuadrangular A (6)');
  assert.equal(getMatchArchiveLapOptions(finArch.length, finArch)[3].label, 'Gran Final (2)');
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'apertura' }), 3), {
    pj: 20, pg: 10, pe: 5, pp: 5, gf: 35, gc: 25, dg: 10, pts: 35,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'semifinal' }), 3), {
    pj: 6, pg: 3, pe: 2, pp: 1, gf: 8, gc: 6, dg: 2, pts: 11,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(finArch, { lap: 'final' }), 3), {
    pj: 2, pg: 2, pe: 0, pp: 0, gf: 4, gc: 0, dg: 4, pts: 6,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(finArch, 3), {
    pj: 28, pg: 15, pe: 7, pp: 6, gf: 47, gc: 31, dg: 16, pts: 52,
  });

  // Reclasificación Anual 2025 dynamic 20-club zero-sum reconciliation
  const rec2025 = getAnnualReclassificationByYear('2025-I');
  assert.ok(rec2025 && rec2025.id === 'reclasificacion-2025');
  assert.equal(getAnnualReclassificationByYear('2025-II')?.id, 'reclasificacion-2025');
  assert.equal(rec2025.rows.length, 20);

  const computed2025 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2025 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2025.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2025.set(team, cur);
  };
  for (const tbl of [t2025I, t2025II]) {
    for (const r of tbl.regularRows || []) add2025(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of tbl.playoffMatches || []) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2025(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2025(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }
  let r25Pj = 0, r25Pg = 0, r25Pp = 0, r25Gf = 0, r25Gc = 0;
  for (const row of rec2025.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2025.get(row.team),
      `Reclasificación 2025 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    r25Pj += row.pj; r25Pg += row.pg; r25Pp += row.pp; r25Gf += row.gf; r25Gc += row.gc;
  }
  assert.equal(r25Pj, 904);
  assert.equal(r25Pg, r25Pp);
  assert.equal(r25Gf, r25Gc);
  assert.equal(rec2025.rows[0].team, 'Deportes Tolima');
  assert.equal(rec2025.rows[0].pts, 96);
  assert.equal(rec2025.rows[1].team, 'Independiente Medellín');
  assert.equal(rec2025.rows[1].pts, 92);
  assert.equal(rec2025.rows[2].team, 'Junior de Barranquilla');
  assert.equal(rec2025.rows[2].pts, 90);
  assert.equal(rec2025.rows[2].pj, 54);

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2025' && i.standingsTableId === 'reclasificacion-2025'));
});

// ── 105. 2026 Full Audit: 12ª Estrella Bicampeón 2026-I Play-offs, Live 2026-II Cuadrangulares (Nov 25), 44 Junior Matches & Reclasificación 2026 ──
test('105. 2026 full audit: 19-fecha zero-sum tables, 2026-I knockout brackets (5-4 shootout & 7-1 scorers), live 2026-II Cuadrangulares (Nov 25), 25+19 Junior archive, timeline fix, and Reclasificación 2026', () => {
  const t2026I = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2026-I-playoffs')!;
  const t2026II = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '2026-II-finalizacion')!;
  assert.ok(t2026I && t2026II);

  assert.equal(t2026I.championTeam, 'Junior de Barranquilla');
  assert.equal(t2026I.runnerUpTeam, 'Atlético Nacional');
  assert.equal(t2026I.isJuniorChampion, true);
  assert.ok(t2026II.championTeam.includes('En disputa'));

  for (const tbl of [t2026I, t2026II]) {
    const rows = tbl.regularRows || [];
    assert.equal(rows.length, 20);
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rows) {
      assert.equal(r.pj, 19);
      assert.equal(r.pg + r.pe + r.pp, r.pj);
      assert.equal(r.gf - r.gc, r.dg);
      assert.equal(r.pg * 3 + r.pe, r.pts);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `PG !== PP in ${tbl.id}`);
    assert.equal(gf, gc, `GF !== GC in ${tbl.id}`);
    assert.equal(pe % 2, 0, `Odd PE in ${tbl.id}`);
  }

  // 2026-I Play-offs: 14 matches reconciling 100% with summary rows, 7-1 scorers fixed, full knockout bracket
  const p2026I = t2026I.playoffMatches || [];
  assert.equal(p2026I.length, 14);
  const koTally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const m of p2026I) {
    assert.ok(/2026$/.test(m.date || ''), `Expected clean 2026 date: ${m.date}`);
    assert.ok((m.venue || '').startsWith('Estadio '), `Expected full Estadio venue: ${m.venue}`);
    assert.ok(!(m.scorers || '').includes("pen.'") && !(m.scorers || '').includes("a.g.'"), `Malformed scorer punctuation: ${m.scorers}`);
    for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
      const cur = koTally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      cur.pj++; cur.gf += mgf; cur.gc += mgc;
      if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
      koTally.set(tm, cur);
    }
  }
  for (const r of t2026I.rows) {
    assert.deepEqual(koTally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
  }
  const nac71 = p2026I.find((m) => m.homeTeam === 'Atlético Nacional' && m.awayTeam === 'Internacional de Bogotá' && m.homeScore === 7);
  assert.ok(nac71 && nac71.scorers?.includes("Cardona (78')") && nac71.scorers?.includes("Sarmiento (81')"));

  const b2026I = buildPlayoffKnockoutBrackets(p2026I, t2026I.championTeam);
  assert.equal(b2026I.length, 3);
  const sfJunior = b2026I[1].ties.find((tie) => tie.teamA === 'Junior de Barranquilla' || tie.teamB === 'Junior de Barranquilla');
  assert.ok(sfJunior && sfJunior.winnerTeam === 'Junior de Barranquilla' && sfJunior.penaltiesLabel?.includes('5-4'));
  assert.equal(b2026I[2].ties[0].winnerTeam, 'Junior de Barranquilla');
  assert.equal(b2026I[2].ties[0].teamAGoals, 3);
  assert.equal(b2026I[2].ties[0].teamBGoals, 1);

  // 2026-II Live Cuadrangulares (Corte 25 Nov 2026): 6 matches reconciling Grupo A (F1) & Grupo B (F1+F2)
  const p2026II = t2026II.playoffMatches || [];
  assert.equal(p2026II.length, 6);
  const c26Tally = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  for (const m of p2026II) {
    assert.ok(/2026$/.test(m.date || ''));
    assert.ok((m.venue || '').startsWith('Estadio '));
    for (const [tm, mgf, mgc] of [[m.homeTeam, m.homeScore, m.awayScore], [m.awayTeam, m.awayScore, m.homeScore]] as const) {
      const cur = c26Tally.get(tm) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      cur.pj++; cur.gf += mgf; cur.gc += mgc;
      if (mgf > mgc) { cur.pg++; cur.pts += 3; } else if (mgf < mgc) { cur.pp++; } else { cur.pe++; cur.pts += 1; }
      c26Tally.set(tm, cur);
    }
  }
  for (const g of t2026II.finalGroups || []) {
    for (const r of g.rows) {
      assert.deepEqual(c26Tally.get(r.team), { pj: r.pj, pg: r.pg, pe: r.pe, pp: r.pp, gf: r.gf, gc: r.gc, pts: r.pts });
    }
  }
  assert.equal(t2026II.rows[0].team, 'Independiente Medellín');
  assert.equal(t2026II.rows[0].pts, 3);
  assert.equal(t2026II.finalGroups?.[1].rows[0].team, 'América de Cali');
  assert.equal(t2026II.finalGroups?.[1].rows[0].pts, 4);
  assert.equal(t2026II.finalGroups?.[1].rows[1].team, 'Millonarios F.C');
  assert.equal(t2026II.finalGroups?.[1].rows[1].pts, 4);

  // Junior matchArchive: 25 in 2026-I + 19 normalized in 2026-II (44 total)
  const apArch = t2026I.matchArchive || [];
  const finArch = t2026II.matchArchive || [];
  assert.equal(apArch.length, 25);
  assert.equal(finArch.length, 19);
  const canon2026 = new Set((t2026I.regularRows || []).map((r) => r.team));
  for (const m of [...apArch, ...finArch]) {
    assert.ok(canon2026.has(m.homeTeam) && canon2026.has(m.awayTeam), `Non-canonical 2026 team: ${m.homeTeam} vs ${m.awayTeam}`);
    assert.ok(/2026$/.test(m.date), `Expected 2026 date: ${m.date}`);
    assert.ok((m.venue || '').startsWith('Estadio '), `Expected full venue: ${m.venue}`);
    assert.ok(!(m.note || '').includes("pen.'") && !(m.note || '').includes("a.g.'"), `Malformed note punctuation: ${m.note}`);
  }

  assert.deepEqual(getMatchArchiveLapOptions(apArch.length, apArch).map((o) => o.id), ['all', 'apertura', 'cuartos', 'semifinal', 'final']);
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'apertura' }), 3), {
    pj: 19, pg: 11, pe: 2, pp: 6, gf: 31, gc: 24, dg: 7, pts: 35,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'cuartos' }), 3), {
    pj: 2, pg: 1, pe: 1, pp: 0, gf: 3, gc: 2, dg: 1, pts: 4,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'semifinal' }), 3), {
    pj: 2, pg: 0, pe: 2, pp: 0, gf: 1, gc: 1, dg: 0, pts: 2,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(filterMatchArchiveFixtures(apArch, { lap: 'final' }), 3), {
    pj: 2, pg: 1, pe: 0, pp: 1, gf: 3, gc: 1, dg: 2, pts: 3,
  });
  assert.deepEqual(computeJuniorMatchArchiveSummary(apArch, 3), {
    pj: 25, pg: 13, pe: 5, pp: 7, gf: 38, gc: 28, dg: 10, pts: 44,
  });

  assert.deepEqual(computeJuniorMatchArchiveSummary(finArch, 3), {
    pj: 19, pg: 5, pe: 7, pp: 7, gf: 26, gc: 27, dg: -1, pts: 22,
  });

  // Reclasificación Anual 2026 (Corte 25 Nov 2026) dynamic 20-club zero-sum reconciliation
  const rec2026 = getAnnualReclassificationByYear('2026-I');
  assert.ok(rec2026 && rec2026.id === 'reclasificacion-2026');
  assert.equal(getAnnualReclassificationByYear('2026-II')?.id, 'reclasificacion-2026');
  assert.equal(rec2026.rows.length, 20);

  const computed2026 = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();
  const add2026 = (team: string, pj: number, pg: number, pe: number, pp: number, gf: number, gc: number, pts: number) => {
    const cur = computed2026.get(team) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    cur.pj += pj; cur.pg += pg; cur.pe += pe; cur.pp += pp; cur.gf += gf; cur.gc += gc; cur.pts += pts;
    computed2026.set(team, cur);
  };
  for (const tbl of [t2026I, t2026II]) {
    for (const r of tbl.regularRows || []) add2026(r.team, r.pj, r.pg, r.pe, r.pp, r.gf, r.gc, r.pts);
    for (const m of tbl.playoffMatches || []) {
      const hRes = m.homeScore > m.awayScore ? [1, 0, 0, 3] : m.homeScore < m.awayScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      const aRes = m.awayScore > m.homeScore ? [1, 0, 0, 3] : m.awayScore < m.homeScore ? [0, 0, 1, 0] : [0, 1, 0, 1];
      add2026(m.homeTeam, 1, hRes[0], hRes[1], hRes[2], m.homeScore, m.awayScore, hRes[3]);
      add2026(m.awayTeam, 1, aRes[0], aRes[1], aRes[2], m.awayScore, m.homeScore, aRes[3]);
    }
  }
  let r26Pj = 0, r26Pg = 0, r26Pp = 0, r26Gf = 0, r26Gc = 0;
  for (const row of rec2026.rows) {
    assert.deepEqual(
      { pj: row.pj, pg: row.pg, pe: row.pe, pp: row.pp, gf: row.gf, gc: row.gc, pts: row.pts },
      computed2026.get(row.team),
      `Reclasificación 2026 mismatch for ${row.team}`
    );
    assert.equal(row.gf - row.gc, row.dg);
    assert.equal(row.pg * 3 + row.pe, row.pts);
    r26Pj += row.pj; r26Pg += row.pg; r26Pp += row.pp; r26Gf += row.gf; r26Gc += row.gc;
  }
  assert.equal(r26Pj, 800);
  assert.equal(r26Pg, r26Pp);
  assert.equal(r26Gf, r26Gc);
  assert.equal(rec2026.rows[0].team, 'Atlético Nacional');
  assert.equal(rec2026.rows[0].pts, 96);
  assert.equal(rec2026.rows[1].team, 'América de Cali');
  assert.equal(rec2026.rows[1].pts, 74);
  assert.equal(rec2026.rows[2].team, 'Independiente Santa Fe');
  assert.equal(rec2026.rows[2].pts, 69);
  assert.equal(rec2026.rows[3].team, 'Junior de Barranquilla');
  assert.equal(rec2026.rows[3].pts, 66);
  assert.equal(rec2026.rows[3].pj, 44);

  // Timeline 2026-II closing-streak accuracy & search index verification
  const m2026II = JUNIOR_TIMELINE_MILESTONES.find((m) => m.id === '2026-II-finalizacion');
  assert.ok(m2026II);
  assert.ok(m2026II.details.some((d) => d.includes('2-0 ante Cúcuta Deportivo') && d.includes('0-1 frente a Deportivo Pasto')));
  assert.ok(!m2026II.details.some((d) => d.includes('triunfos seguidos sobre Águilas')));

  assert.ok(ENCYCLOPEDIA_SEARCH_ITEMS.some((i) => i.id === 'reclasificacion-anual-2026' && i.standingsTableId === 'reclasificacion-2026'));
});

// ── 106. Global 1948–2026 Integral Audit & Regression Shield ──
test('106. Global 1948–2026 integrity shield: all 91 tournaments, 25 annual reclassifications, zero-sum tables, clean brackets, canonical names, venues, dates, and cross-module consistency', () => {
  assert.equal(CHRONOLOGICAL_STANDINGS_TABLES.length, 91);
  assert.equal(ANNUAL_RECLASSIFICATION_TABLES.length, 25);

  const validTableIds = new Set(CHRONOLOGICAL_STANDINGS_TABLES.map((t) => t.id));
  const validReclassIds = new Set(ANNUAL_RECLASSIFICATION_TABLES.map((r) => r.id));
  const documentedRsssfVariances = new Set([
    '1981-cuadrangular',
    '1987-octogonal',
    '1988-octogonal',
    '1993-cuadrangular',
  ]);
  const nonCanonicalClubPattern = /(?:Millonarios F\.C\.|Llaneros F\.C\.|Itagüí F\. C|Fortaleza F\. C|Tigres F\. C|Atlético Municipal \(Nacional\)|3\.º Puesto)/;
  const malformedScorerPattern = /(?:pen|a\.g|p)\.'/;

  for (const t of CHRONOLOGICAL_STANDINGS_TABLES) {
    // 1. Metadata & runnerUpTeam completeness across all completed tournaments (1948–2026-I)
    assert.ok(t.championTeam && t.championTeam.trim().length > 0, `Missing championTeam in ${t.id}`);
    if (t.id !== '1989-desierto' && t.id !== '2026-II-finalizacion') {
      assert.ok(t.runnerUpTeam && t.runnerUpTeam.trim().length > 0, `Missing runnerUpTeam in ${t.id}`);
      assert.ok(!nonCanonicalClubPattern.test(t.championTeam), `Non-canonical championTeam in ${t.id}: ${t.championTeam}`);
      assert.ok(!nonCanonicalClubPattern.test(t.runnerUpTeam), `Non-canonical runnerUpTeam in ${t.id}: ${t.runnerUpTeam}`);
    }

    // 2. Regular rows arithmetic & zero-sum verification (strict on 87/91; documented RSSSF note on 4 pre-1994)
    if (t.regularRows && t.regularRows.length > 0) {
      let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
      for (const r of t.regularRows) {
        assert.ok(!nonCanonicalClubPattern.test(r.team), `Non-canonical regularRows team in ${t.id}: ${r.team}`);
        assert.equal(r.pg + r.pe + r.pp, r.pj, `PJ mismatch for ${r.team} in ${t.id}`);
        assert.equal(r.gf - r.gc, r.dg, `DG mismatch for ${r.team} in ${t.id}`);
        pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
      }
      if (documentedRsssfVariances.has(t.id)) {
        assert.ok(
          t.regularPhaseDescription?.includes('desfase administrativo original'),
          `Missing archival RSSSF variance note on ${t.id}`
        );
      } else {
        assert.equal(pg, pp, `Regular PG !== PP in ${t.id} (${pg} vs ${pp})`);
        assert.equal(gf, gc, `Regular GF !== GC in ${t.id} (${gf} vs ${gc})`);
        assert.equal(pe % 2, 0, `Odd regular PE in ${t.id} (${pe})`);
      }
    }

    // 3. Final groups arithmetic & zero-sum verification (100% of all cuadrangulares/hexagonales/octogonales/triangulares)
    for (const fg of t.finalGroups || []) {
      let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
      for (const r of fg.rows) {
        assert.ok(!nonCanonicalClubPattern.test(r.team), `Non-canonical finalGroup team in ${t.id}: ${r.team}`);
        assert.equal(r.pg + r.pe + r.pp, r.pj, `FinalGroup PJ mismatch for ${r.team} in ${t.id}`);
        assert.equal(r.gf - r.gc, r.dg, `FinalGroup DG mismatch for ${r.team} in ${t.id}`);
        pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
      }
      assert.equal(pg, pp, `FinalGroup PG !== PP in ${t.id} (${fg.groupName})`);
      assert.equal(gf, gc, `FinalGroup GF !== GC in ${t.id} (${fg.groupName})`);
      assert.equal(pe % 2, 0, `FinalGroup odd PE in ${t.id} (${fg.groupName})`);
    }

    // 4. Modern 8-club knockout playoff rows zero-sum verification (2011, 2014-I, 2015–2018, 2020, 2021-I, 2026-I)
    if (
      t.rows &&
      t.rows.length > 0 &&
      ['2011-I-regular', '2011-II-playoffs', '2014-I-playoffs', '2015-I-playoffs', '2015-II-playoffs', '2016-I-playoffs', '2016-II-playoffs', '2017-I-regular', '2017-II-playoffs', '2018-I-playoffs', '2018-II-playoffs', '2020-playoffs', '2021-I-playoffs', '2026-I-playoffs'].includes(t.id)
    ) {
      assert.equal(t.rows.length, 8, `Expected 8 playoff rows in ${t.id}`);
      let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
      for (const r of t.rows) {
        assert.ok(!nonCanonicalClubPattern.test(r.team), `Non-canonical playoff row team in ${t.id}: ${r.team}`);
        assert.equal(r.pg + r.pe + r.pp, r.pj);
        assert.equal(r.gf - r.gc, r.dg);
        pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
      }
      assert.equal(pg, pp, `Playoff rows PG !== PP in ${t.id}`);
      assert.equal(gf, gc, `Playoff rows GF !== GC in ${t.id}`);
      assert.equal(pe % 2, 0, `Playoff rows odd PE in ${t.id}`);
    }

    // 5. Knockout brackets integrity: ZERO unresolved ties and ZERO false Octogonal/Cuad. Final brackets
    const brackets = buildPlayoffKnockoutBrackets(t.playoffMatches, t.championTeam);
    if (['1982-octogonal', '1983-octogonal', '1984-octogonal', '1985-octogonal', '1986-octogonal', '1990-reclasificacion', '1996-97-cuadrangular'].includes(t.id)) {
      assert.equal(brackets.length, 0, `Unexpected spurious knockout bracket in round-robin tournament ${t.id}`);
    }
    for (const round of brackets) {
      for (const tie of round.ties) {
        assert.ok(tie.winnerTeam, `Unresolved knockout tie in ${t.id} (${round.label}): ${tie.teamA} vs ${tie.teamB}`);
      }
    }

    // 6. All fixtures (matchArchive + playoffMatches): canonical names, clean scorers, year-stamped dates, and Estadio venues
    for (const m of [...(t.matchArchive || []), ...(t.playoffMatches || [])]) {
      assert.ok(!nonCanonicalClubPattern.test(m.homeTeam), `Non-canonical homeTeam in ${t.id}: ${m.homeTeam}`);
      assert.ok(!nonCanonicalClubPattern.test(m.awayTeam), `Non-canonical awayTeam in ${t.id}: ${m.awayTeam}`);
      assert.ok(m.date && /(19|20)\d\d/.test(m.date) && !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(m.date), `Invalid date in ${t.id}: ${m.date}`);
      assert.ok(m.venue && m.venue.startsWith('Estadio '), `Invalid or missing venue in ${t.id}: ${m.venue} (${m.homeTeam})`);
      if ('scorers' in m && m.scorers) {
        assert.ok(!malformedScorerPattern.test(m.scorers), `Malformed scorer punctuation in ${t.id}: ${m.scorers}`);
      }
      if (m.note) {
        assert.ok(!malformedScorerPattern.test(m.note), `Malformed note punctuation in ${t.id}: ${m.note}`);
      }
    }
  }

  // 7. Historical 1986 stadium transition verification for Junior (Romelio Martínez pre-11 May -> Metropolitano post-11 May)
  const t1986 = CHRONOLOGICAL_STANDINGS_TABLES.find((t) => t.id === '1986-octogonal')!;
  const j86Home = (t1986.matchArchive || []).filter((m) => m.homeTeam === 'Junior de Barranquilla');
  assert.ok(j86Home.some((m) => m.date.includes('febrero') && m.venue === 'Estadio Municipal Romelio Martínez, Barranquilla'));
  assert.ok(j86Home.some((m) => m.date.includes('5 de mayo') && m.venue === 'Estadio Municipal Romelio Martínez, Barranquilla'));
  assert.ok(j86Home.some((m) => m.date.includes('18 de mayo') && m.venue === 'Estadio Metropolitano Roberto Meléndez, Barranquilla'));

  // 8. All 25 Annual Reclassification tables (2002–2026): zero-sum, arithmetic, canonical club names, and valid semester references
  for (const rec of ANNUAL_RECLASSIFICATION_TABLES) {
    assert.ok(validTableIds.has(rec.aperturaTableId), `Broken aperturaTableId in ${rec.id}: ${rec.aperturaTableId}`);
    if (rec.finalizacionTableId) {
      assert.ok(validTableIds.has(rec.finalizacionTableId), `Broken finalizacionTableId in ${rec.id}: ${rec.finalizacionTableId}`);
    }
    let pg = 0, pe = 0, pp = 0, gf = 0, gc = 0;
    for (const r of rec.rows) {
      assert.ok(!nonCanonicalClubPattern.test(r.team), `Non-canonical reclassification team in ${rec.id}: ${r.team}`);
      assert.equal(r.pg + r.pe + r.pp, r.pj, `Reclass PJ mismatch for ${r.team} in ${rec.id}`);
      assert.equal(r.gf - r.gc, r.dg, `Reclass DG mismatch for ${r.team} in ${rec.id}`);
      pg += r.pg; pe += r.pe; pp += r.pp; gf += r.gf; gc += r.gc;
    }
    assert.equal(pg, pp, `Reclass PG !== PP in ${rec.id}`);
    assert.equal(gf, gc, `Reclass GF !== GC in ${rec.id}`);
    assert.equal(pe % 2, 0, `Reclass odd PE in ${rec.id}`);
  }

  // 9. Cross-module integrity: JUNIOR_YEARLY_STANDINGS, STANDINGS_2026_II_DATA, ALL_TIME_DIMAYOR_TABLE, DERBIES_DATA, Timeline, Search
  const jyByYear = new Map(JUNIOR_YEARLY_STANDINGS.map((y) => [y.year, y]));
  assert.equal(jyByYear.get('1980')?.gamesPlayed, 61);
  assert.equal(jyByYear.get('1980')?.points, 66);
  assert.equal(jyByYear.get('1983')?.gamesPlayed, 56);
  assert.equal(jyByYear.get('1983')?.points, 73);
  assert.equal(jyByYear.get('1989')?.gamesPlayed, 34);
  assert.equal(jyByYear.get('1989')?.points, 40);
  assert.equal(jyByYear.get('1996/97')?.gamesPlayed, 46);
  assert.equal(jyByYear.get('1996/97')?.points, 65);

  for (const jy of JUNIOR_YEARLY_STANDINGS) {
    if (jy.standingsTableId) {
      assert.ok(validTableIds.has(jy.standingsTableId), `Broken JUNIOR_YEARLY_STANDINGS ref: ${jy.year} -> ${jy.standingsTableId}`);
    }
  }
  for (const row of STANDINGS_2026_II_DATA) {
    assert.ok(!nonCanonicalClubPattern.test(row.team), `Non-canonical team in STANDINGS_2026_II_DATA: ${row.team}`);
  }
  for (const row of ALL_TIME_DIMAYOR_TABLE) {
    assert.ok(!nonCanonicalClubPattern.test(row.team), `Non-canonical team in ALL_TIME_DIMAYOR_TABLE: ${row.team}`);
  }
  for (const d of HISTORIC_DERBIES) {
    assert.ok(!nonCanonicalClubPattern.test(d.opponent), `Non-canonical opponent in HISTORIC_DERBIES: ${d.opponent}`);
  }
  const searchIds = new Set<string>();
  for (const item of ENCYCLOPEDIA_SEARCH_ITEMS) {
    assert.ok(!searchIds.has(item.id), `Duplicate search index ID: ${item.id}`);
    searchIds.add(item.id);
    assert.ok(!nonCanonicalClubPattern.test(item.title), `Non-canonical title in search index: ${item.title}`);
    if (item.standingsTableId) {
      assert.ok(
        validTableIds.has(item.standingsTableId) || validReclassIds.has(item.standingsTableId),
        `Broken search standingsTableId: ${item.id} -> ${item.standingsTableId}`
      );
    }
  }
  for (const m of JUNIOR_TIMELINE_MILESTONES) {
    if (m.standingsTableId) {
      assert.ok(validTableIds.has(m.standingsTableId), `Broken timeline standingsTableId: ${m.id} -> ${m.standingsTableId}`);
    }
  }
});

test('Test #107: Head-to-Head module covers all 40 unified Primera A franchises (48 historical names, 1948-2026) with exact splits, eras, crests and search resolution', () => {
  const summaries = buildAllHeadToHeadFranchises(CHRONOLOGICAL_STANDINGS_TABLES);
  assert.equal(summaries.length, 40, 'Expected exactly 40 unified Primera A franchises');
  assert.equal(RIVAL_FRANCHISES_CATALOG.length, 40);

  const byId = new Map(summaries.map((s) => [s.franchise.id, s]));

  // Verify category counts (19 Primera A, 9 Primera B, 12 Desaparecidos, 6 multi-name rebrands)
  assert.equal(summaries.filter((s) => s.franchise.status === 'primera-a').length, 19);
  assert.equal(summaries.filter((s) => s.franchise.status === 'primera-b').length, 9);
  assert.equal(summaries.filter((s) => s.franchise.status === 'desaparecido').length, 12);
  assert.equal(summaries.filter((s) => s.franchise.hasIdentityChange).length, 6);

  // Verify 100% of all 48 distinct opponent strings across all 91 tournaments map cleanly
  const distinctOpponents = new Set<string>();
  for (const table of CHRONOLOGICAL_STANDINGS_TABLES) {
    for (const m of [...(table.matchArchive || []), ...(table.playoffMatches || [])]) {
      if (m.homeTeam === 'Junior de Barranquilla') distinctOpponents.add(m.awayTeam);
      if (m.awayTeam === 'Junior de Barranquilla') distinctOpponents.add(m.homeTeam);
    }
  }
  assert.equal(distinctOpponents.size, 48, 'Expected 48 distinct historical Primera A opponent strings');
  for (const opp of distinctOpponents) {
    assert.ok(resolveClubFranchiseId(opp), `Unmapped opponent string: ${opp}`);
  }

  // Verify mathematical invariants across ALL 40 franchises
  for (const s of summaries) {
    assert.ok(s.overall.pj > 0, `Franchise ${s.franchise.id} has 0 matches`);
    assert.equal(s.home.pj + s.away.pj, s.overall.pj, `Home + Away PJ mismatch for ${s.franchise.id}`);
    assert.equal(s.home.pg + s.away.pg, s.overall.pg, `Home + Away PG mismatch for ${s.franchise.id}`);
    assert.equal(s.home.pe + s.away.pe, s.overall.pe, `Home + Away PE mismatch for ${s.franchise.id}`);
    assert.equal(s.home.pp + s.away.pp, s.overall.pp, `Home + Away PP mismatch for ${s.franchise.id}`);
    assert.equal(s.home.gf + s.away.gf, s.overall.gf, `Home + Away GF mismatch for ${s.franchise.id}`);
    assert.equal(s.home.gc + s.away.gc, s.overall.gc, `Home + Away GC mismatch for ${s.franchise.id}`);

    for (const split of [s.overall, s.home, s.away]) {
      assert.equal(split.pg + split.pe + split.pp, split.pj, `W+D+L !== PJ in ${s.franchise.id}`);
      assert.equal(split.gf - split.gc, split.dg, `GF-GC !== DG in ${s.franchise.id}`);
    }

    const eraSum = s.eraBreakdowns.reduce((acc, e) => acc + e.pj, 0);
    assert.equal(eraSum, s.overall.pj, `Era breakdown PJ sum mismatch for ${s.franchise.id}`);

    for (const relId of s.franchise.relatedFranchiseIds || []) {
      assert.ok(byId.has(relId), `Broken relatedFranchiseId ${relId} on ${s.franchise.id}`);
    }
  }

  // Verify 1968 Tercer Lugar matches vs Millonarios are captured without duplicating other playoffs
  const millos = byId.get('millonarios')!;
  assert.equal(millos.overall.pj, 216, 'Millonarios should include the 2 verified 1968 Tercer Lugar matches (214 + 2)');
  assert.ok(
    millos.matches.some((m) => m.tournamentId === '1968-campeonato' && m.round.toLowerCase().includes('tercer')),
    'Expected 1968 Tercer Lugar matches vs Millonarios'
  );
  assert.ok(millos.crestGallery.length >= 10, 'Millonarios should expose full historical crest gallery');

  // Verify all 6 multi-name rebrand lineages + Sporting de Barranquilla 2-era lineage
  const nacional = byId.get('atletico-nacional')!;
  assert.equal(nacional.overall.pj, 230, 'Atlético Nacional should unify Atlético Municipal (4) + Atlético Nacional (226)');
  assert.equal(nacional.eraBreakdowns.length, 2);
  assert.equal(nacional.eraBreakdowns[0].eraName, 'Atlético Municipal');
  assert.equal(nacional.eraBreakdowns[0].pj, 4);
  assert.equal(nacional.crestGallery.length, 7);

  const interBogota = byId.get('internacional-de-bogota')!;
  assert.equal(interBogota.overall.pj, 43, 'Internacional de Bogotá should unify La Equidad (41) + Internacional de Bogotá (2)');
  assert.equal(interBogota.eraBreakdowns.length, 2);

  const boyacaChico = byId.get('boyaca-chico')!;
  assert.equal(boyacaChico.overall.pj, 40, 'Boyacá Chicó should unify Chicó F.C (2) + Boyacá Chicó (38)');
  assert.equal(boyacaChico.eraBreakdowns.length, 2);

  const aguilas = byId.get('aguilas-doradas')!;
  assert.equal(aguilas.overall.pj, 39, 'Águilas Doradas should unify Itagüí F.C + Águilas Pereira + Águilas Doradas');
  assert.equal(aguilas.eraBreakdowns.length, 3);

  const alianza = byId.get('alianza-valledupar')!;
  assert.equal(alianza.overall.pj, 27, 'Alianza Valledupar should unify Alianza Petrolera + Alianza F.C + Alianza Valledupar');
  assert.equal(alianza.eraBreakdowns.length, 3);

  const fortaleza = byId.get('fortaleza-ceif')!;
  assert.equal(fortaleza.overall.pj, 10, 'Fortaleza CEIF should unify Fortaleza F.C (2) + Fortaleza CEIF (8)');
  assert.equal(fortaleza.eraBreakdowns.length, 2);

  const sporting = byId.get('sporting-de-barranquilla')!;
  assert.equal(sporting.overall.pj, 17, 'Sporting de Barranquilla should have 17 total matches across 2 eras');
  assert.equal(sporting.eraBreakdowns.length, 2);
  const sportingEra1 = filterHeadToHeadMatches(sporting.matches, {
    venue: 'todos',
    outcome: 'todos',
    phase: 'todas',
    eraName: 'Sporting de Barranquilla (Primera Era)',
    sortOrder: 'asc',
  });
  const sportingEra2 = filterHeadToHeadMatches(sporting.matches, {
    venue: 'todos',
    outcome: 'todos',
    phase: 'todas',
    eraName: 'Sporting de Barranquilla (Segunda Era)',
    sortOrder: 'asc',
  });
  assert.equal(sportingEra1.length + sportingEra2.length, 17);
  assert.ok(sportingEra1.length > 0 && sportingEra2.length > 0);

  // Verify filterHeadToHeadMatches venue + outcome + era filters on Atlético Nacional
  const municipalMatches = filterHeadToHeadMatches(nacional.matches, {
    venue: 'todos',
    outcome: 'todos',
    phase: 'todas',
    eraName: 'Atlético Municipal',
    sortOrder: 'asc',
  });
  assert.equal(municipalMatches.length, 4);
  assert.equal(municipalMatches[0].year, '1948');

  const nacionalHomeWins = filterHeadToHeadMatches(nacional.matches, {
    venue: 'local',
    outcome: 'W',
    phase: 'todas',
    eraName: 'todos',
    sortOrder: 'desc',
  });
  assert.equal(nacionalHomeWins.length, nacional.home.pg);

  // Verify encyclopedia search resolves former aliases and extinct clubs directly to rivalFranchiseId
  const searchExpectations: Array<[string, string]> = [
    ['la equidad', 'internacional-de-bogota'],
    ['alianza petrolera', 'alianza-valledupar'],
    ['itagui', 'aguilas-doradas'],
    ['atletico municipal', 'atletico-nacional'],
    ['sporting de barranquilla', 'sporting-de-barranquilla'],
    ['oro negro', 'oro-negro'],
    ['uniautonoma', 'uniautonoma'],
    ['centauros', 'centauros-villavicencio'],
    ['deportivo samarios', 'deportivo-samarios'],
    ['boca juniors de cali', 'boca-juniors-de-cali'],
  ];
  for (const [query, expectedFranchiseId] of searchExpectations) {
    const hits = searchEncyclopedia(query);
    assert.ok(
      hits.some((h) => h.moduleId === 'resultados-vs-equipos' && h.rivalFranchiseId === expectedFranchiseId),
      `Expected searchEncyclopedia("${query}") to return rivalFranchiseId "${expectedFranchiseId}"`
    );
  }
});

test('108. Historia module (1924-2026) data integrity, filtering, cross-links, and search indexing', () => {
  assert.equal(WIKIPEDIA_SOURCE_URL, 'https://es.wikipedia.org/wiki/Junior_de_Barranquilla');
  assert.equal(CLUB_HISTORY_INTRO.founders.length, 20, 'Should document all 20 founders of 1924');
  assert.ok(CLUB_INSTITUTIONAL_FACTS.length >= 10, 'Should contain institutional facts table');

  // 23 chronological chapters from 1924 to 2026
  assert.equal(CLUB_HISTORY_CHAPTERS.length, 23, 'Should contain all 23 historical chapters from 1924 to 2026');
  assert.equal(CLUB_HISTORY_CHAPTERS[0].id, 'cap-1924-fundacion');
  assert.equal(CLUB_HISTORY_CHAPTERS[CLUB_HISTORY_CHAPTERS.length - 1].id, 'cap-2026-estrella-12');

  const uniqueChapterIds = new Set(CLUB_HISTORY_CHAPTERS.map((c) => c.id));
  assert.equal(uniqueChapterIds.size, 23, 'All chapter IDs must be unique');

  const validTableIds = new Set(CHRONOLOGICAL_STANDINGS_TABLES.map((t) => t.id));
  const validFranchiseIds = new Set(RIVAL_FRANCHISES_CATALOG.map((f) => f.id));

  for (const chapter of CLUB_HISTORY_CHAPTERS) {
    assert.ok(chapter.paragraphs.length > 0, `Chapter ${chapter.id} must have paragraphs`);
    assert.ok(chapter.title.trim().length > 0, `Chapter ${chapter.id} must have a title`);
    if (chapter.standingsTableId) {
      assert.ok(
        validTableIds.has(chapter.standingsTableId),
        `Chapter ${chapter.id} references unknown standingsTableId "${chapter.standingsTableId}"`
      );
    }
    if (chapter.rivalFranchiseId) {
      assert.ok(
        validFranchiseIds.has(chapter.rivalFranchiseId),
        `Chapter ${chapter.id} references unknown rivalFranchiseId "${chapter.rivalFranchiseId}"`
      );
    }
  }

  // Era counts sum to 23
  const eraCounts = getHistoryEraCounts(CLUB_HISTORY_CHAPTERS);
  assert.equal(eraCounts.todos, 23);
  const sumOfEras =
    eraCounts['fundacion-dorado'] +
    eraCounts['regreso-primeras-estrellas'] +
    eraCounts['decada-90-2000'] +
    eraCounts['era-dorada-2010'] +
    eraCounts['centenario-actual'];
  assert.equal(sumOfEras, 23, 'Sum of era group counts must equal total chapters');
  assert.equal(eraCounts['centenario-actual'], 3, 'Centenario y Actualidad should contain 2024, 2025, and 2026');

  // Filtering logic
  const titlesOnly = filterHistoryChapters(CLUB_HISTORY_CHAPTERS, {
    eraGroup: 'todos',
    category: 'titulo',
    query: '',
  });
  assert.ok(titlesOnly.length >= 14, `Expected at least 14 title-tagged chapters, got ${titlesOnly.length}`);

  const micaelaHits = filterHistoryChapters(CLUB_HISTORY_CHAPTERS, {
    eraGroup: 'todos',
    category: 'todas',
    query: 'Micaela',
  });
  assert.equal(micaelaHits.length, 1);
  assert.equal(micaelaHits[0].id, 'cap-1924-fundacion');

  const garrinchaHits = filterHistoryChapters(CLUB_HISTORY_CHAPTERS, {
    eraGroup: 'todos',
    category: 'todas',
    query: 'Garrincha',
  });
  assert.equal(garrinchaHits.length, 1);
  assert.equal(garrinchaHits[0].id, 'cap-1966-regreso');

  const valderramaHits = filterHistoryChapters(CLUB_HISTORY_CHAPTERS, {
    eraGroup: 'todos',
    category: 'todas',
    query: 'Valderrama',
  });
  assert.ok(valderramaHits.some((c) => c.id === 'cap-1993-estrella-3'));

  const duodecimaHits = filterHistoryChapters(CLUB_HISTORY_CHAPTERS, {
    eraGroup: 'todos',
    category: 'todas',
    query: 'duodecima',
  });
  assert.equal(duodecimaHits.length, 1);
  assert.equal(duodecimaHits[0].id, 'cap-2026-estrella-12');

  // Symbols, stadiums, stats, records, cultural sections completeness
  const shieldEntry = CLUB_SYMBOLS_DATA.find((s) => s.id === 'sym-escudos');
  assert.ok(shieldEntry && shieldEntry.crestImages && shieldEntry.crestImages.length === 7, 'Escudos section should list all 7 historical crests');
  assert.ok(CLUB_STADIUMS_AND_FACILITIES.length >= 6, 'Should cover all stadiums and training facilities');
  assert.ok(CLUB_GENERAL_STATS.length >= 8, 'Should include institutional stats');
  assert.ok(CLUB_BIGGEST_SCORES.nationalWins.length >= 6, 'Should include biggest national wins');
  assert.ok(CLUB_BIGGEST_SCORES.internationalWins.length >= 4, 'Should include biggest international wins');
  assert.ok(CLUB_BIGGEST_SCORES.defeats.length >= 4, 'Should include heaviest historical defeats');
  assert.ok(CLUB_LANDMARK_RECORDS.length >= 7, 'Should include landmark records 1975-2017');
  assert.ok(CLUB_CULTURAL_TOPICS.length >= 7, 'Should include cultural, youth, women, monument, rivalry, and homonymous clubs topics');

  // Encyclopedia search resolution for Historia module
  const historySearchQueries = ['historia', 'ventana de campeones', 'adelita de char', 'junior de managua', 'willy'];
  for (const query of historySearchQueries) {
    const hits = searchEncyclopedia(query);
    assert.ok(
      hits.some((h) => h.moduleId === 'historia'),
      `Expected searchEncyclopedia("${query}") to return a hit in module "historia"`
    );
  }
});

test('109. Top 50 Goalscorers dataset, competition breakdowns, portrait assets, filtering, sorting, and search indexing', () => {
  assert.equal(
    TOP_50_SCORERS_SOURCE_URL,
    'https://es.wikipedia.org/wiki/Anexo:M%C3%A1ximos_goleadores_de_Junior_de_Barranquilla'
  );
  assert.equal(TOP_50_SCORERS_DATA.length, 50, 'Must contain exactly 50 top goalscorers');
  assert.equal(SCORER_ERA_FILTERS.length, 5, 'Should expose 5 era filter options (todos + 4 eras)');

  const uniqueIds = new Set<string>();
  const validLegendIds = new Set(LEGENDS_DATA.map((l) => l.id));
  let verifiedPhotoCount = 0;

  for (let i = 0; i < TOP_50_SCORERS_DATA.length; i++) {
    const scorer = TOP_50_SCORERS_DATA[i];
    assert.equal(scorer.rank, i + 1, `Expected strict rank ${i + 1} for ${scorer.name}`);
    assert.ok(!uniqueIds.has(scorer.id), `Duplicate scorer id "${scorer.id}"`);
    uniqueIds.add(scorer.id);

    // Non-increasing totalGoals ordering (166 down to 20)
    if (i > 0) {
      assert.ok(
        scorer.totalGoals <= TOP_50_SCORERS_DATA[i - 1].totalGoals,
        `Scorer #${scorer.rank} (${scorer.totalGoals}) exceeds #${i} (${TOP_50_SCORERS_DATA[i - 1].totalGoals})`
      );
    }

    // Exact competition breakdown sum equals totalGoals
    const sum = getBreakdownSum(scorer);
    assert.equal(
      sum,
      scorer.totalGoals,
      `Breakdown sum (${sum}) !== totalGoals (${scorer.totalGoals}) for #${scorer.rank} ${scorer.name}`
    );

    // Non-empty initials
    const initials = getScorerInitials(scorer.name);
    assert.ok(initials.length >= 1 && initials.length <= 2, `Invalid initials "${initials}" for ${scorer.name}`);

    // Legend cross-link integrity
    if (scorer.legendId) {
      assert.ok(
        validLegendIds.has(scorer.legendId),
        `Unknown legendId "${scorer.legendId}" on scorer ${scorer.name}`
      );
    }

    // Every local photoUrl must physically exist under public/
    if (scorer.photoUrl) {
      verifiedPhotoCount++;
      assert.ok(scorer.photoUrl.startsWith('/assets/scorers/'), `Unexpected photoUrl path ${scorer.photoUrl}`);
      const diskPath = path.join(process.cwd(), 'public', scorer.photoUrl.replace(/^\//, ''));
      assert.ok(
        fs.existsSync(diskPath),
        `Missing portrait asset on disk: ${diskPath} for #${scorer.rank} ${scorer.name}`
      );
      assert.ok(fs.statSync(diskPath).size > 2000, `Portrait file too small/corrupt: ${diskPath}`);
    }
  }

  // Spot-check podium and boundaries
  assert.equal(TOP_50_SCORERS_DATA[0].name, 'Iván René Valenciano');
  assert.equal(TOP_50_SCORERS_DATA[0].totalGoals, 166);
  assert.equal(TOP_50_SCORERS_DATA[1].name, 'Carlos Bacca');
  assert.equal(TOP_50_SCORERS_DATA[1].totalGoals, 135);
  assert.equal(TOP_50_SCORERS_DATA[2].name, 'Teófilo Gutiérrez');
  assert.equal(TOP_50_SCORERS_DATA[2].totalGoals, 107);
  assert.equal(TOP_50_SCORERS_DATA[49].rank, 50);
  assert.equal(TOP_50_SCORERS_DATA[49].totalGoals, 20);
  assert.equal(verifiedPhotoCount, 18, 'Expected 18 verified archival player portraits on disk');

  // Era bucket counts must sum to 50
  const eraCounts = getScorerEraCounts(TOP_50_SCORERS_DATA);
  assert.equal(eraCounts.todos, 50);
  assert.equal(
    eraCounts['1948-1979'] +
      eraCounts['1980-1999'] +
      eraCounts['2000-2014'] +
      eraCounts['2015-2026'],
    50
  );

  // Special filters
  const withPhoto = filterTopScorers(TOP_50_SCORERS_DATA, {
    query: '',
    era: 'todos',
    special: 'foto-archivo',
    sortBy: 'rank',
  });
  assert.equal(withPhoto.length, 18);

  const goldenBootScorers = filterTopScorers(TOP_50_SCORERS_DATA, {
    query: '',
    era: 'todos',
    special: 'botin-oro',
    sortBy: 'rank',
  });
  assert.ok(goldenBootScorers.length >= 10, `Expected at least 10 Botín de Oro winners in Top 50, got ${goldenBootScorers.length}`);

  const foreignScorers = filterTopScorers(TOP_50_SCORERS_DATA, {
    query: '',
    era: 'todos',
    special: 'extranjeros',
    sortBy: 'rank',
  });
  assert.ok(foreignScorers.length >= 15, `Expected at least 15 foreign scorers in Top 50, got ${foreignScorers.length}`);
  assert.equal(foreignScorers[0].id, 'ephanor');

  const activeScorers = filterTopScorers(TOP_50_SCORERS_DATA, {
    query: '',
    era: 'todos',
    special: 'activos',
    sortBy: 'rank',
  });
  assert.ok(activeScorers.some((s) => s.id === 'teofilo'));
  assert.ok(activeScorers.some((s) => s.id === 'luis-muriel'));

  // Accent-insensitive search across name, nickname, country
  const borjaHits = filterTopScorers(TOP_50_SCORERS_DATA, {
    query: 'Miguel Angel Borja',
    era: 'todos',
    special: 'todos',
    sortBy: 'rank',
  });
  assert.equal(borjaHits.length, 1);
  assert.equal(borjaHits[0].rank, 14);
  assert.equal(getInternationalGoals(borjaHits[0]), 16);

  const brasilHits = filterTopScorers(TOP_50_SCORERS_DATA, {
    query: 'Brasil',
    era: 'todos',
    special: 'todos',
    sortBy: 'rank',
  });
  assert.equal(brasilHits.length, 4);

  // Sort by international goals puts Borja (16) ahead of Valenciano (9)
  const sortedIntl = filterTopScorers(TOP_50_SCORERS_DATA, {
    query: '',
    era: 'todos',
    special: 'todos',
    sortBy: 'internacional',
  });
  assert.equal(sortedIntl[0].id, 'miguel-borja');
  assert.equal(getInternationalGoals(sortedIntl[0]), 16);

  // Adjacent navigation helper
  const adjFirst = getAdjacentScorers(TOP_50_SCORERS_DATA, 'valenciano');
  assert.equal(adjFirst.prev, null);
  assert.equal(adjFirst.next?.id, 'bacca');

  const adjLast = getAdjacentScorers(TOP_50_SCORERS_DATA, 'eudalio-arriaga');
  assert.equal(adjLast.prev?.id, 'luis-diaz');
  assert.equal(adjLast.next, null);

  // Encyclopedia search resolves all 50 players to goleadores-historicos with topScorerId
  for (const scorer of TOP_50_SCORERS_DATA) {
    const hits = searchEncyclopedia(scorer.name);
    assert.ok(
      hits.some(
        (h) => h.moduleId === 'goleadores-historicos' && h.topScorerId === scorer.id
      ),
      `Expected searchEncyclopedia("${scorer.name}") to resolve topScorerId "${scorer.id}"`
    );
  }
});





