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
