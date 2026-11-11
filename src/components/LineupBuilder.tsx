import React, { useState } from 'react';
import {
  Users,
  RotateCcw,
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { FormationType, getFormationCoordinates } from '../utils/footballLogic';

interface PitchPlayer {
  id: string;
  name: string;
  shortName: string;
  role: string;
  era: string;
  isLegend: boolean;
}

const AVAILABLE_PLAYERS: PitchPlayer[] = [
  // Arqueros
  { id: 'mele', name: 'Santiago Mele', shortName: 'S. Mele', role: 'Arquero', era: 'Actual / Uruguay', isLegend: false },
  { id: 'martinez', name: 'Jefersson Martínez', shortName: 'J. Martínez', role: 'Arquero', era: 'Actual', isLegend: false },
  { id: 'viera', name: 'Sebastián Viera', shortName: 'S. Viera', role: 'Arquero', era: '2011-2023', isLegend: true },
  { id: 'carrabs', name: 'Lorenzo Carrabs', shortName: 'L. Carrabs', role: 'Arquero', era: '1978-1980', isLegend: true },

  // Defensas
  { id: 'herrera', name: 'Edwin Herrera', shortName: 'E. Herrera', role: 'Defensa', era: 'Actual / Titular', isLegend: false },
  { id: 'moreno_yef', name: 'Yeferson Moreno', shortName: 'Y. Moreno', role: 'Defensa', era: 'Actual / Titular', isLegend: false },
  { id: 'olivera', name: 'Emanuel Olivera "Turro"', shortName: 'E. Olivera', role: 'Defensa', era: 'Actual', isLegend: false },
  { id: 'pena', name: 'Jermein Peña', shortName: 'J. Peña', role: 'Defensa', era: 'Actual', isLegend: false },
  { id: 'perez_rafa', name: 'Rafael Pérez', shortName: 'R. Pérez', role: 'Defensa', era: 'Actual / Leyenda', isLegend: false },
  { id: 'zalazar', name: 'Nicolás Zalazar', shortName: 'N. Zalazar', role: 'Defensa', era: 'Actual', isLegend: false },
  { id: 'fuentes', name: 'Gabriel Fuentes', shortName: 'G. Fuentes', role: 'Defensa', era: '2018-2024 · Fluminense', isLegend: true },
  { id: 'ribonetto', name: 'Walter Ribonetto', shortName: 'W. Ribonetto', role: 'Defensa', era: '2004', isLegend: true },
  { id: 'brian', name: 'Alexis Mendoza', shortName: 'A. Mendoza', role: 'Defensa', era: '1990-1996', isLegend: true },
  { id: 'dulio', name: 'Dulio Miranda', shortName: 'D. Miranda', role: 'Defensa', era: '1977-1985', isLegend: true },
  { id: 'piedrahita', name: 'Marlon Piedrahita', shortName: 'M. Piedrahita', role: 'Defensa', era: '2017-2021', isLegend: true },

  // Volantes
  { id: 'moreno_didier', name: 'Didier Moreno', shortName: 'D. Moreno', role: 'Volante', era: 'Actual / Capitán', isLegend: false },
  { id: 'cantillo', name: 'Víctor Cantillo', shortName: 'V. Cantillo', role: 'Volante', era: 'Actual / Bicampeón', isLegend: false },
  { id: 'colorado', name: 'Andrés Colorado', shortName: 'A. Colorado', role: 'Volante', era: 'Actual', isLegend: false },
  { id: 'chara', name: 'Yimmi Chará', shortName: 'Y. Chará', role: 'Volante', era: 'Actual / ChaTeo', isLegend: false },
  { id: 'hinojoza', name: 'Roberto Hinojoza', shortName: 'R. Hinojoza', role: 'Volante', era: 'Actual', isLegend: false },
  { id: 'valderrama', name: 'Carlos Valderrama (El Pibe)', shortName: 'El Pibe', role: 'Volante', era: '1993-1995', isLegend: true },
  { id: 'pacheco', name: 'Víctor Pacheco', shortName: 'V. Pacheco', role: 'Volante', era: '1990-1999', isLegend: true },
  { id: 'giovanni', name: 'Giovanni Hernández', shortName: 'G. Hernández', role: 'Volante', era: '2008-2012', isLegend: true },
  { id: 'mackenzie', name: 'Oswaldo Mackenzie', shortName: 'O. Mackenzie', role: 'Volante', era: '1993-2001', isLegend: true },
  { id: 'comesana_p', name: 'Julio Comesaña (Jugador)', shortName: 'J. Comesaña', role: 'Volante', era: '1977', isLegend: true },

  // Delanteros
  { id: 'bacca', name: 'Carlos Bacca', shortName: 'C. Bacca', role: 'Delantero', era: 'Actual / 125+ Goles', isLegend: true },
  { id: 'titi', name: 'Steven "El Titi" Rodríguez', shortName: 'Titi Rdgz.', role: 'Delantero', era: 'Actual / Goleador', isLegend: false },
  { id: 'enamorado', name: 'José Enamorado', shortName: 'J. Enamorado', role: 'Delantero', era: 'Actual / Desequilibrio', isLegend: false },
  { id: 'caicedo', name: 'Déiber Caicedo', shortName: 'D. Caicedo', role: 'Delantero', era: 'Actual', isLegend: false },
  { id: 'vladimir', name: 'Vladimir Hernández', shortName: 'V. Hernández', role: 'Delantero', era: 'Actual / 2023', isLegend: true },
  { id: 'marco_perez', name: 'Marco Pérez', shortName: 'M. Pérez', role: 'Delantero', era: 'Actual', isLegend: false },
  { id: 'teofilo', name: 'Teófilo Gutiérrez', shortName: 'Teo Gutiérrez', role: 'Delantero', era: '2007-2021', isLegend: true },
  { id: 'luis_diaz', name: 'Luis Díaz', shortName: 'L. Díaz', role: 'Delantero', era: '2017-2019', isLegend: true },
  { id: 'valenciano', name: 'Iván René Valenciano', shortName: 'Valenciano', role: 'Delantero', era: '1988-1999', isLegend: true },
  { id: 'veron', name: 'Juan Ramón Verón', shortName: 'J. R. Verón', role: 'Delantero', era: '1977', isLegend: true },
];

const getPlayer = (id: string): PitchPlayer => {
  return AVAILABLE_PLAYERS.find((p) => p.id === id) || AVAILABLE_PLAYERS[0];
};

export const LineupBuilder: React.FC = () => {
  const [formation, setFormation] = useState<FormationType>('4-3-3');
  const [teamName, setTeamName] = useState('Los Invencibles de Curramba');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Initialize with dream historical 4-3-3 default lineup
  const [lineup, setLineup] = useState<(PitchPlayer | null)[]>([
    getPlayer('viera'),
    getPlayer('herrera'),
    getPlayer('brian'),
    getPlayer('ribonetto'),
    getPlayer('piedrahita'),
    getPlayer('cantillo'),
    getPlayer('valderrama'),
    getPlayer('pacheco'),
    getPlayer('luis_diaz'),
    getPlayer('valenciano'),
    getPlayer('bacca'),
  ]);

  const spots = getFormationCoordinates(formation);

  const handleSelectPlayer = (player: PitchPlayer) => {
    if (selectedSlotIndex === null) return;
    const newLineup = [...lineup];
    newLineup[selectedSlotIndex] = player;
    setLineup(newLineup);
    setSelectedSlotIndex(null);
  };

  const loadPreset = (presetName: 'actual' | '1993' | '2023' | 'bicampeon') => {
    if (presetName === 'actual') {
      setFormation('4-3-3');
      setTeamName('Nómina Titular Actual 2025/2026');
      setLineup([
        getPlayer('mele'),
        getPlayer('herrera'),
        getPlayer('olivera'),
        getPlayer('pena'),
        getPlayer('moreno_yef'),
        getPlayer('moreno_didier'),
        getPlayer('cantillo'),
        getPlayer('chara'),
        getPlayer('caicedo'),
        getPlayer('bacca'),
        getPlayer('enamorado'),
      ]);
    } else if (presetName === '1993') {
      setFormation('4-3-3');
      setTeamName('Dream Team 1993 (Tercera Estrella)');
      setLineup([
        getPlayer('carrabs'),
        getPlayer('herrera'),
        getPlayer('brian'),
        getPlayer('dulio'),
        getPlayer('piedrahita'),
        getPlayer('comesana_p'),
        getPlayer('valderrama'),
        getPlayer('pacheco'),
        getPlayer('mackenzie'),
        getPlayer('valenciano'),
        getPlayer('veron'),
      ]);
    } else if (presetName === '2023') {
      setFormation('4-2-3-1');
      setTeamName('Once de La Décima Estrella 2023');
      setLineup([
        getPlayer('mele'),
        getPlayer('fuentes'),
        getPlayer('olivera'),
        getPlayer('pena'),
        getPlayer('piedrahita'),
        getPlayer('moreno_didier'),
        getPlayer('cantillo'),
        getPlayer('vladimir'),
        getPlayer('chara'),
        getPlayer('enamorado'),
        getPlayer('bacca'),
      ]);
    } else if (presetName === 'bicampeon') {
      setFormation('4-3-3');
      setTeamName('Bicampeones 2018-2019 (ChaTeo & Lucho)');
      setLineup([
        getPlayer('viera'),
        getPlayer('fuentes'),
        getPlayer('brian'),
        getPlayer('ribonetto'),
        getPlayer('piedrahita'),
        getPlayer('cantillo'),
        getPlayer('giovanni'),
        getPlayer('pacheco'),
        getPlayer('luis_diaz'),
        getPlayer('teofilo'),
        getPlayer('bacca'),
      ]);
    }
  };

  // Compute team chemistry
  const assignedPlayers = lineup.filter(Boolean) as PitchPlayer[];
  const legendsCount = assignedPlayers.filter((p) => p.isLegend).length;
  const attackPower = Math.min(99, 82 + assignedPlayers.length);
  const chemistryPercent = Math.min(100, Math.round((assignedPlayers.length / 11) * 100));

  return (
    <section id="alineacion" className="py-16 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <Users className="w-4 h-4" />
              <span>Pizarra Táctica & Once Histórico</span>
              <span aria-hidden="true">·</span>
              <span>Laboratorio Rojiblanco</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Arma tu Once Ideal de Los Tiburones
            </h2>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Alineaciones de Época:</span>
            <button
              onClick={() => loadPreset('actual')}
              className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-700/80 text-xs font-semibold text-red-300 hover:text-white hover:bg-red-600 transition-colors"
            >
              Titular 2025/26
            </button>
            <button
              onClick={() => loadPreset('2023')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-white hover:border-amber-500 transition-colors"
            >
              La Décima 2023
            </button>
            <button
              onClick={() => loadPreset('1993')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-red-500 transition-colors"
            >
              Dream Team 1993
            </button>
            <button
              onClick={() => loadPreset('bicampeon')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-red-500 transition-colors"
            >
              Bicampeón 2018-19
            </button>
          </div>
        </div>

        {/* Tactical Setup Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <label htmlFor="team-name" className="text-xs font-medium text-slate-400 block mb-1">Nombre de tu Escuadra:</label>
            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold"
            />
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Formación Táctica:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['4-3-3', '4-2-3-1', '4-4-2', '3-5-2'] as const).map((form) => (
                <button
                  key={form}
                  onClick={() => setFormation(form)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors ${
                    formation === form
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {form}
                </button>
              ))}
            </div>
          </div>

          {/* Team Chemistry & Stats */}
          <div className="flex items-center justify-around text-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Química</span>
              <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                {chemistryPercent}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Poder Ofensivo</span>
              <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                {attackPower}/99
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Leyendas</span>
              <span className="font-mono text-base font-bold text-red-400 tabular-nums">
                {legendsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Pitch + Player Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Football Field Visual (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* The Green Pitch */}
            <div
              className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl"
              style={{
                background: 'linear-gradient(to bottom, #15803d, #166534, #14532d)',
              }}
            >
              {/* Grass Pitch Stripes */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <div className="h-1/6 border-b border-white" />
                <div className="h-1/6 border-b border-white" />
                <div className="h-1/6 border-b border-white" />
                <div className="h-1/6 border-b border-white" />
                <div className="h-1/6 border-b border-white" />
              </div>

              {/* Pitch White Markings */}
              <div className="absolute inset-4 border-2 border-white/60 pointer-events-none">
                {/* Center Line & Circle */}
                <div className="absolute top-1/2 left-0 right-0 border-b-2 border-white/60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white/60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60" />

                {/* Top Penalty Area (Opponent) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b-2 border-l-2 border-r-2 border-white/60" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-10 border-b-2 border-l-2 border-r-2 border-white/60" />

                {/* Bottom Penalty Area (Junior Goal) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-t-2 border-l-2 border-r-2 border-white/60" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-10 border-t-2 border-l-2 border-r-2 border-white/60" />
              </div>

              {/* 11 Players on Pitch */}
              {spots.map((spot) => {
                const player = lineup[spot.index];
                const isSelected = selectedSlotIndex === spot.index;

                return (
                  <button
                    key={spot.index}
                    onClick={() => setSelectedSlotIndex(spot.index)}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform hover:scale-110 focus:outline-none z-20 ${
                      isSelected ? 'scale-125 z-30' : ''
                    }`}
                  >
                    {/* Player Badge / Jersey Token */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex flex-col items-center justify-center shadow-lg border-2 transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-red-600 ring-4 ring-amber-400/50'
                          : player?.isLegend
                          ? 'border-amber-400 bg-[#081D40] text-amber-300'
                          : 'border-white bg-[#D62027] text-white'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase font-mono tracking-tighter">
                        {spot.role}
                      </span>
                      {player?.isLegend && (
                        <span className="text-[8px] text-amber-300 -mt-1 font-bold">★</span>
                      )}
                    </div>

                    {/* Name Pill on Pitch */}
                    <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700/80 text-[10px] sm:text-xs font-bold text-white whitespace-nowrap shadow-md max-w-[85px] truncate">
                      {player ? player.shortName : 'Elegir'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Selection Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                  {selectedSlotIndex !== null
                    ? `Seleccionando posición: ${spots[selectedSlotIndex]?.role}`
                    : 'Pizarra de Convocatoria'}
                </span>
                <h3 className="font-display text-lg font-bold uppercase text-white tracking-wide">
                  {selectedSlotIndex !== null ? 'Elige tu Jugador' : 'Toca una posición en el campo'}
                </h3>
              </div>

              {selectedSlotIndex !== null && (
                <button
                  onClick={() => setSelectedSlotIndex(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cerrar
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[460px]">
              {AVAILABLE_PLAYERS.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handleSelectPlayer(pl)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-red-400">
                      {pl.role.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                        <span>{pl.name}</span>
                        {pl.isLegend && (
                          <span className="text-[9px] text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/60 px-1 rounded">
                            Ídolo
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{pl.era}</div>
                    </div>
                  </div>

                  <button className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 group-hover:text-white group-hover:bg-red-600 rounded-lg transition-colors border border-slate-800">
                    Alinear
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
