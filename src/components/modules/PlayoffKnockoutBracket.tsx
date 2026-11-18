import React from 'react';
import { Trophy, Medal, Swords, MapPin, Calendar } from 'lucide-react';
import { TournamentStandingsTable } from '../../types/football';
import {
  buildPlayoffKnockoutBrackets,
  getTournamentTeamCrest,
  PlayoffKnockoutTie,
} from '../../utils/footballLogic';

interface PlayoffKnockoutBracketProps {
  tournament: TournamentStandingsTable;
}

const ClubCrestBadge: React.FC<{
  tournament: TournamentStandingsTable;
  teamName: string;
  size?: 'sm' | 'md';
}> = ({ tournament, teamName, size = 'md' }) => {
  const isJunior =
    teamName.toLowerCase().includes('junior') &&
    !teamName.toLowerCase().includes('boca juniors');
  const crest = getTournamentTeamCrest(tournament, teamName, isJunior);
  const dimClass = size === 'sm' ? 'w-4 h-4' : 'w-8 h-8';

  if (crest) {
    return (
      <img
        src={crest.src}
        alt={crest.alt}
        className={`${dimClass} object-contain shrink-0 drop-shadow`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${dimClass} rounded-full bg-slate-800 border border-slate-700 inline-flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-400 uppercase`}
    >
      {teamName.replace(/[^A-Za-zÁÉÍÓÚÑ]/g, '').slice(0, 2) || 'FC'}
    </span>
  );
};

const TieCard: React.FC<{
  tournament: TournamentStandingsTable;
  tie: PlayoffKnockoutTie;
}> = ({ tournament, tie }) => {
  const isTeamAWinner =
    tie.winnerTeam !== null && tie.winnerTeam === tie.teamA;
  const isTeamBWinner =
    tie.winnerTeam !== null && tie.winnerTeam === tie.teamB;
  const isTeamAJunior =
    tie.teamA.toLowerCase().includes('junior') &&
    !tie.teamA.toLowerCase().includes('boca juniors');
  const isTeamBJunior =
    tie.teamB.toLowerCase().includes('junior') &&
    !tie.teamB.toLowerCase().includes('boca juniors');

  return (
    <div
      data-testid={`knockout-tie-${tie.id}`}
      className={`rounded-xl border bg-slate-950/90 overflow-hidden transition-colors ${
        tie.isFinalTie
          ? 'border-amber-500/40'
          : tie.involvesJunior
          ? 'border-red-500/40'
          : 'border-slate-800'
      }`}
    >
      {/* Tie Header */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
          {tie.isFinalTie ? (
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : tie.isThirdPlaceTie ? (
            <Medal className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          ) : (
            <Swords className="w-3.5 h-3.5 text-red-400 shrink-0" />
          )}
          <span className={tie.isFinalTie ? 'text-amber-300' : 'text-slate-200'}>
            {tie.stageLabel}
          </span>
        </div>

        {tie.winnerTeam && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              tie.isFinalTie
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : tie.isThirdPlaceTie
                ? 'bg-slate-800 text-amber-200 border border-slate-700'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {tie.isFinalTie
              ? `★ Campeón: ${tie.winnerTeam.replace('de Barranquilla', '').trim()}`
              : tie.isThirdPlaceTie
              ? `3.er Puesto: ${tie.winnerTeam.replace('de Barranquilla', '').trim()}`
              : `Avanza: ${tie.winnerTeam.replace('de Barranquilla', '').trim()}`}
          </span>
        )}
      </div>

      {/* Head-to-Head Aggregate Banner */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <ClubCrestBadge tournament={tournament} teamName={tie.teamA} size="md" />
          <div className="min-w-0">
            <div
              className={`text-xs sm:text-sm font-bold leading-snug truncate ${
                isTeamAJunior
                  ? 'text-red-300'
                  : isTeamAWinner
                  ? 'text-white'
                  : 'text-slate-300'
              }`}
              title={tie.teamA}
            >
              {tie.teamA}
            </div>
            {isTeamAWinner && (
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                {tie.isFinalTie
                  ? 'Campeón ★'
                  : tie.isThirdPlaceTie
                  ? 'Ganador 3.º Puesto'
                  : 'Clasificado'}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0 px-2">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">
            Global
          </span>
          <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-base sm:text-lg font-black text-white tabular-nums tracking-tight">
            <span className={isTeamAWinner ? 'text-amber-300' : 'text-slate-200'}>
              {tie.teamAGoals}
            </span>
            <span className="text-slate-500 mx-1">-</span>
            <span className={isTeamBWinner ? 'text-amber-300' : 'text-slate-200'}>
              {tie.teamBGoals}
            </span>
          </div>
          {tie.penaltiesLabel && (
            <span className="mt-1 text-[10px] font-mono text-amber-300">
              {tie.penaltiesLabel}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
          <div className="min-w-0">
            <div
              className={`text-xs sm:text-sm font-bold leading-snug truncate ${
                isTeamBJunior
                  ? 'text-red-300'
                  : isTeamBWinner
                  ? 'text-white'
                  : 'text-slate-300'
              }`}
              title={tie.teamB}
            >
              {tie.teamB}
            </div>
            {isTeamBWinner && (
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                {tie.isFinalTie
                  ? 'Campeón ★'
                  : tie.isThirdPlaceTie
                  ? 'Ganador 3.º Puesto'
                  : 'Clasificado'}
              </div>
            )}
          </div>
          <ClubCrestBadge tournament={tournament} teamName={tie.teamB} size="md" />
        </div>
      </div>

      {/* Individual Legs (Ida / Vuelta) */}
      <div className="px-4 pb-3.5 space-y-2">
        {tie.legs.map((leg, idx) => {
          const legLabel =
            tie.legs.length === 1
              ? 'Partido Único'
              : idx === 0
              ? 'Ida'
              : idx === 1
              ? 'Vuelta'
              : `Desempate ${idx - 1}`;
          const isHomeJunior = leg.homeTeam.toLowerCase().includes('junior');
          const isAwayJunior = leg.awayTeam.toLowerCase().includes('junior');

          return (
            <div
              key={`${tie.id}-leg-${idx}`}
              className="p-2.5 rounded-lg bg-slate-900/75 border border-slate-800/90 space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <span className="font-bold uppercase text-amber-400">{legLabel}</span>
                <div className="flex items-center gap-3">
                  {leg.venue && (
                    <span className="inline-flex items-center gap-1 text-slate-400 truncate max-w-[240px] sm:max-w-none">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      {leg.venue}
                    </span>
                  )}
                  {leg.date && (
                    <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                      <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                      {leg.date}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0 text-right">
                  <span
                    className={`truncate ${
                      isHomeJunior ? 'text-red-300 font-bold' : 'text-slate-200'
                    }`}
                    title={leg.homeTeam}
                  >
                    {leg.homeTeam.replace('de Barranquilla', '').trim()}
                  </span>
                  <ClubCrestBadge
                    tournament={tournament}
                    teamName={leg.homeTeam}
                    size="sm"
                  />
                </div>

                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono text-xs font-bold text-white tabular-nums shrink-0">
                  {leg.homeScore} - {leg.awayScore}
                </span>

                <div className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
                  <ClubCrestBadge
                    tournament={tournament}
                    teamName={leg.awayTeam}
                    size="sm"
                  />
                  <span
                    className={`truncate ${
                      isAwayJunior ? 'text-red-300 font-bold' : 'text-slate-200'
                    }`}
                    title={leg.awayTeam}
                  >
                    {leg.awayTeam.replace('de Barranquilla', '').trim()}
                  </span>
                </div>
              </div>

              {leg.scorers && (
                <div className="text-[10px] text-emerald-300/90 leading-relaxed pt-1 border-t border-slate-800/70">
                  {leg.scorers}
                </div>
              )}
              {leg.note && (
                <div className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/70">
                  {leg.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PlayoffKnockoutBracket: React.FC<PlayoffKnockoutBracketProps> = ({
  tournament,
}) => {
  const rounds = buildPlayoffKnockoutBrackets(
    tournament.playoffMatches,
    tournament.championTeam
  );

  if (rounds.length === 0) {
    return null;
  }

  return (
    <div data-testid="playoff-knockout-brackets" className="space-y-5">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <Swords className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Llaves de Enfrentamiento Directo</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Series ida y vuelta por eliminación directa
        </span>
      </div>

      <div className="space-y-6">
        {rounds.map((round) => (
          <div key={round.key} className="space-y-3">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                {round.label}
              </h5>
              <span className="text-[10px] font-mono text-slate-400">
                {round.ties.length} {round.ties.length === 1 ? 'llave' : 'llaves'}
              </span>
            </div>

            <div
              className={`grid gap-4 ${
                round.ties.length === 1 ? 'grid-cols-1 lg:grid-cols-1 max-w-3xl' : 'grid-cols-1 lg:grid-cols-2'
              }`}
            >
              {round.ties.map((tie) => (
                <TieCard key={tie.id} tournament={tournament} tie={tie} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
