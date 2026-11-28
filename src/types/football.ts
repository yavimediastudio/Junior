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
  | 'actualidad'
  | 'historia';

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
  runnerUpTeam?: string;
  isJuniorChampion?: boolean;
  isJuniorRunnerUp?: boolean;
  // Fase 1: Tabla de Todos contra Todos (Fase Regular)
  hasRegularPhase?: boolean;
  regularPhaseTitle?: string;
  regularPhaseDescription?: string;
  regularRows?: StandingRow[];
  regularGroupsSectionTitle?: string;
  regularGroupsSectionDescription?: string;
  regularGroups?: {
    id: string;
    groupName: string;
    description?: string;
    rows: StandingRow[];
  }[];
  secondaryRegularTable?: {
    title: string;
    badgeLabel?: string;
    description?: string;
    rows: StandingRow[];
  };
  tertiaryRegularTable?: {
    title: string;
    badgeLabel?: string;
    description?: string;
    rows: StandingRow[];
  };
  // Fase 2: Play-offs / Fase Final (Cuadrangular, Hexagonal, Octogonal, Triangular, Llaves K.O.)
  hasFinalPhase?: boolean;
  finalPhaseTitle?: string;
  finalPhaseDescription?: string;
  rows: StandingRow[];
  finalGroups?: {
    id: string;
    groupName: string;
    description?: string;
    rows: StandingRow[];
  }[];
  playoffMatches?: {
    stage: string;
    date?: string;
    venue?: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    scorers?: string;
    note?: string;
  }[];
  matchArchive?: {
    round: string;
    date: string;
    venue?: string;
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

export interface AnnualReclassificationTable {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  aperturaTableId: string;
  finalizacionTableId: string;
  aperturaChampion: string;
  finalizacionChampion: string;
  leaderTeam: string;
  leaderPoints: number;
  juniorPosition: string;
  juniorSummary: string;
  relegatedTeam?: string;
  relegationNote?: string;
  internationalSummary: string;
  rows: StandingRow[];
}

export type FranchiseStatus = 'primera-a' | 'primera-b' | 'desaparecido';

export interface FranchiseEraIdentity {
  name: string;
  years: string;
  city: string;
  note?: string;
}

export interface FranchiseCrestEra {
  src: string;
  alt: string;
  eraLabel: string;
  teamName: string;
}

export interface ClubFranchiseMetadata {
  id: string;
  name: string;
  shortName: string;
  monogram: string;
  status: FranchiseStatus;
  city: string;
  department: string;
  colors: string;
  primaryHex: string;
  secondaryHex: string;
  derbyName: string;
  aliases: string[];
  eras: FranchiseEraIdentity[];
  hasIdentityChange?: boolean;
  relatedFranchiseIds?: string[];
  relatedNote?: string;
  historicalContext: string;
}

export interface HeadToHeadMatchRecord {
  id: string;
  tournamentId: string;
  year: string;
  chronologicalOrder: number;
  tournamentName: string;
  round: string;
  date: string;
  venue: string;
  isHome: boolean;
  isFinalPhase: boolean;
  opponentNameAtTime: string;
  opponentCrest?: { src: string; alt: string } | null;
  juniorCrest?: { src: string; alt: string } | null;
  juniorScore: number;
  opponentScore: number;
  outcome: 'W' | 'D' | 'L';
  note?: string;
}

export interface HeadToHeadSplitStats {
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  winPct: number;
  pointsPct: number;
  biggestWin: HeadToHeadMatchRecord | null;
  biggestLoss: HeadToHeadMatchRecord | null;
}

export interface HeadToHeadEraBreakdown {
  eraName: string;
  years: string;
  city: string;
  note?: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
}

export interface HeadToHeadFranchiseSummary {
  franchise: ClubFranchiseMetadata;
  matches: HeadToHeadMatchRecord[];
  overall: HeadToHeadSplitStats;
  home: HeadToHeadSplitStats;
  away: HeadToHeadSplitStats;
  eraBreakdowns: HeadToHeadEraBreakdown[];
  crestGallery: FranchiseCrestEra[];
  primaryCrest: { src: string; alt: string } | null;
  firstYear: string;
  lastYear: string;
  currentStreak: string;
  lastMatch: HeadToHeadMatchRecord | null;
}

export type HistoryTabId =
  | 'cronica'
  | 'simbolos'
  | 'infraestructura'
  | 'datos'
  | 'cultura';

export type HistoryEraGroup =
  | 'todos'
  | 'fundacion-dorado'
  | 'regreso-primeras-estrellas'
  | 'decada-90-2000'
  | 'era-dorada-2010'
  | 'centenario-actual';

export type HistoryChapterCategory =
  | 'todas'
  | 'fundacion'
  | 'titulo'
  | 'internacional'
  | 'crisis'
  | 'hito';

export interface HistoryChapter {
  id: string;
  number: string;
  yearLabel: string;
  title: string;
  eraLabel: string;
  eraGroup: Exclude<HistoryEraGroup, 'todos'>;
  category: Exclude<HistoryChapterCategory, 'todas'>;
  summary: string;
  paragraphs: string[];
  keyFigures: string[];
  standingsTableId?: string;
  rivalFranchiseId?: string;
}

export interface ClubInstitutionalFact {
  label: string;
  value: string;
}

export interface ClubSymbolEntry {
  id: string;
  title: string;
  period: string;
  paragraphs: string[];
  highlight?: string;
  crestImages?: Array<{ src: string; caption: string }>;
}

export interface ClubFacilityEntry {
  id: string;
  type: 'estadio' | 'sede';
  name: string;
  period: string;
  location: string;
  capacityOrScope: string;
  paragraphs: string[];
}

export interface ClubRecordItem {
  year: string;
  title: string;
  detail: string;
}

export interface ClubCulturalTopic {
  id: string;
  group: 'liderazgo' | 'filiales' | 'social' | 'influencia';
  title: string;
  subtitle: string;
  paragraphs: string[];
  highlights?: string[];
  rivalFranchiseId?: string;
}

export type ScorerEraBucket =
  | 'todos'
  | '1948-1979'
  | '1980-1999'
  | '2000-2014'
  | '2015-2026';

export type ScorerSpecialFilter =
  | 'todos'
  | 'foto-archivo'
  | 'botin-oro'
  | 'extranjeros'
  | 'activos';

export type ScorerSortKey = 'rank' | 'liga' | 'internacional';

export interface ScorerGoalBreakdown {
  liga: number;
  copa: number;
  superliga: number;
  libertadores: number;
  sudamericana: number;
  conmebol: number;
}

export interface TopScorerProfile {
  rank: number;
  id: string;
  name: string;
  nickname?: string;
  nationality: string;
  countryCode: 'COL' | 'BRA' | 'URU' | 'PAR' | 'ARG' | 'VEN' | 'CHI';
  position: string;
  periods: string;
  eraBucket: Exclude<ScorerEraBucket, 'todos'>;
  totalGoals: number;
  matches?: number;
  breakdown: ScorerGoalBreakdown;
  isActiveAtClub?: boolean;
  goldenBoots?: string[];
  titlesNote?: string;
  bio: string;
  photoUrl?: string;
  photoAttribution?: string;
  legendId?: string;
}

export type TitleFormatType = 'final-ida-vuelta' | 'final-penales' | 'tabla-cuadrangular';

export interface TitleFinalMatchLeg {
  stage: string;
  date: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scorers: string;
  note?: string;
}

export interface TitlePenaltyShootout {
  scoreLabel: string;
  winner: 'Junior';
  summary: string;
  keyKick: string;
}

export interface EnrichedOfficialTitle extends OfficialTitleItem {
  id: string;
  shortYearLabel: string;
  decade: '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';
  formatType: TitleFormatType;
  date: string;
  venue: string;
  description: string;
  keyMoment: string;
  campaignSummary: string;
  rivalDisplayName: string;
  rivalFranchiseId: string;
  standingsTableId?: string;
  featuredScorerIds: string[];
  championPhotoUrl?: string;
  championPhotoCaption?: string;
  championPhotoOrientation?: 'landscape' | 'portrait';
  finalMatches: TitleFinalMatchLeg[];
  penaltyShootout?: TitlePenaltyShootout;
}

export interface ChampionManagerRecord {
  name: string;
  totalTitles: number;
  ligaTitles: number;
  copaTitles: number;
  superligaTitles: number;
  yearsLabel: string;
  titleIds: string[];
  highlight: string;
}

export interface ChampionPlayerRecord {
  id: string;
  name: string;
  position: string;
  era: string;
  totalTitles: number;
  ligaTitles: number;
  copaTitles: number;
  superligaTitles: number;
  titleIds: string[];
  scorerId?: string;
  highlight: string;
}





