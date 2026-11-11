export type CompetitionType = 'Liga BetPlay' | 'Copa Colombia' | 'Copa Libertadores' | 'Superliga';

export interface MatchScorer {
  player: string;
  minute: number;
  isPenalty?: boolean;
  isOwnGoal?: boolean;
}

export interface MatchFixture {
  id: string;
  round: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'played' | 'live' | 'upcoming';
  competition: CompetitionType;
  venue: string;
  scorers?: MatchScorer[];
  juniorIsHome: boolean;
}

export interface LeagueStanding {
  pos: number;
  team: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  form: ('W' | 'D' | 'L')[];
  isJunior?: boolean;
}

export interface DerbyRecord {
  id: string;
  opponent: string;
  derbyName: string;
  totalMatches: number;
  juniorWins: number;
  draws: number;
  opponentWins: number;
  juniorGoals: number;
  opponentGoals: number;
  biggestWin: string;
  historicalContext: string;
  rivalColors: string;
}

export interface InternationalCampaign {
  id: string;
  year: number;
  tournament: string;
  stageReached: string;
  manager: string;
  keyFigures: string[];
  summary: string;
  memorableMatch: string;
  resultSummary: string;
}

export interface HistoricalRankingStat {
  rank: number;
  player: string;
  statValue: number;
  statLabel: string;
  era: string;
  role: string;
}

export interface KitJersey {
  id: string;
  year: string;
  name: string;
  badge: string;
  type: 'home' | 'away' | 'third' | 'centenary' | 'retro';
  titleWon?: string;
  description: string;
  stripes: boolean;
  baseColor: string;
  accentColor: string;
  collarColor: string;
  sponsor: string;
  starsCount: number;
  famousPlayers: string[];
  historicalNotes: string;
  image?: string;
}

export interface CustomJerseyConfig {
  name: string;
  number: string;
  stripesStyle: 'classic' | 'thin' | 'bold' | 'centenary' | 'away_navy';
  starsCount: number;
  view: 'front' | 'back';
  captainArmband: boolean;
  leaguePatch: boolean;
  collarStyle: 'v-neck' | 'round' | 'polo';
}

export interface PlayerLegend {
  id: string;
  name: string;
  nickname: string;
  era: string;
  position: 'Delantero' | 'Volante' | 'Defensa' | 'Arquero' | 'Director Técnico';
  matches: number;
  goals: number;
  titles: string[];
  bio: string;
  signatureSkill: string;
  famousQuote?: string;
  yearsInClub: string;
  tags: string[];
}

export interface CurrentPlayer {
  id: string;
  dorsal: number;
  name: string;
  nationality: string;
  position: 'Arquero' | 'Defensa' | 'Volante' | 'Delantero';
  age: number;
  matchesPlayed: number;
  goals: number;
  isCaptain?: boolean;
  status: 'titular' | 'suplente';
}

export interface ChampionshipStar {
  starNumber: number;
  year: number;
  tournament: string;
  opponent: string;
  aggregateScore: string;
  hero: string;
  manager: string;
  date: string;
  venue: string;
  description: string;
  keyMoment: string;
}

export interface OfficialTitleItem {
  number: number;
  year: number;
  titleName: string;
  category: 'Liga (Estrella)' | 'Copa Colombia' | 'Superliga';
  starNumber?: number;
  opponent: string;
  score: string;
  manager: string;
  hero: string;
  keyNote: string;
}

export interface StadiumZone {
  id: string;
  name: string;
  popularName: string;
  capacity: string;
  vibe: string;
  description: string;
  chantQuote: string;
  viewAngle: string;
  sunProtection: string;
}

export interface ChantItem {
  id: string;
  title: string;
  phrase: string;
  lyrics: string[];
  tempoBpm: number;
  category: 'Tribuna Sur' | 'Clásico' | 'Himno Popular' | 'Celebración';
  originYear: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type AppModuleId =
  | 'tablas-historicas'
  | 'resultados-vs-equipos'
  | 'goleadores-historicos'
  | 'uniformes'
  | 'titulos'
  | 'actualidad';

export type WindowViewMode = 'inicio' | AppModuleId;

export interface HistoricAllTimeTeam {
  pos: number;
  team: string;
  seasons: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  titles: number;
  isJunior?: boolean;
}

export interface GoldenBootRecord {
  id: string;
  player: string;
  year: string;
  tournament: string;
  goals: number;
  note: string;
}

export interface ClubMilestoneRecord {
  category: string;
  title: string;
  value: string;
  detail: string;
  yearOrEra: string;
}

export interface StandingRow {
  pos: number;
  team: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  statusBadge?: string;
  isJunior?: boolean;
}

export interface TournamentStandingsTable {
  id: string;
  year: string;
  chronologicalOrder: number;
  tournamentName: string;
  phaseTitle: string;
  phaseType: 'cuadrangular' | 'hexagonal' | 'octogonal' | 'triangular' | 'anual' | 'playoff';
  description: string;
  juniorFinish: string;
  championTeam: string;
  isJuniorChampion?: boolean;
  isJuniorRunnerUp?: boolean;
  // Fase 1: Tabla de Todos contra Todos (Fase Regular)
  hasRegularPhase?: boolean;
  regularPhaseTitle?: string;
  regularPhaseDescription?: string;
  regularRows?: StandingRow[];
  // Fase 2: Play-offs / Fase Final (Cuadrangular, Hexagonal, Octogonal, Triangular, Llaves K.O.)
  hasFinalPhase?: boolean;
  finalPhaseTitle?: string;
  finalPhaseDescription?: string;
  rows: StandingRow[];
  playoffMatches?: {
    stage: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    note?: string;
  }[];
  matchArchive?: {
    round: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    note?: string;
  }[];
}

export interface YearlyStandingRecord {
  year: string;
  tournamentName: string;
  finalPosition: string;
  numericPos: number;
  isChampion: boolean;
  isRunnerUp: boolean;
  finalPhase: string;
  phaseType: 'cuadrangular' | 'hexagonal' | 'octogonal' | 'triangular' | 'playoff' | 'regular';
  era: 'largos' | 'cortos';
  manager: string;
  keyNote: string;
  topScorerOrHero?: string;
  gamesPlayed?: number;
  points?: number;
  standingsTableId?: string;
}


