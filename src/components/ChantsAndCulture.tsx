import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, Sparkles, Heart } from 'lucide-react';
import { CHANTS_DATA } from '../data/juniorData';
import { ChantItem } from '../types/football';
import { playStadiumAudio } from '../utils/footballLogic';

interface ChantsAndCultureProps {
  audioEnabled: boolean;
}

export const ChantsAndCulture: React.FC<ChantsAndCultureProps> = ({ audioEnabled }) => {
  const [selectedChant, setSelectedChant] = useState<ChantItem>(CHANTS_DATA[0]);
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);

  // Rhythmic stadium drum beat loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingBeat && audioEnabled) {
      const beatDelay = (60 / selectedChant.tempoBpm) * 1000;
      interval = setInterval(() => {
        playStadiumAudio('drum');
      }, beatDelay);
    }
    return () => clearInterval(interval);
  }, [isPlayingBeat, audioEnabled, selectedChant]);

  const toggleDrumBeat = () => {
    if (!audioEnabled) {
      alert('Por favor activa los efectos de sonido en la barra superior para escuchar el bombo.');
      return;
    }
    setIsPlayingBeat(!isPlayingBeat);
  };

  const triggerSingleDrum = () => {
    playStadiumAudio('drum');
  };

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <Music className="w-4 h-4" />
              <span>Carnaval & Gradería</span>
              <span aria-hidden="true">·</span>
              <span>La Fiesta de Curramba</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Cánticos, Bombos & Cultura Tiburona
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            El folclor único de Barranquilla: salsa, cumbia, y los coros multitudinarios de la hinchada más alegre de Colombia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chants Playlist List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Repertorio Oficial de la Tribuna:
            </span>
            {CHANTS_DATA.map((chant) => (
              <button
                key={chant.id}
                onClick={() => {
                  setSelectedChant(chant);
                  setIsPlayingBeat(false);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedChant.id === chant.id
                    ? 'bg-red-950/50 border-red-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold uppercase text-slate-100">
                    {chant.title}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded">
                    {chant.category}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 italic font-medium">
                  &quot;{chant.phrase}&quot;
                </div>
              </button>
            ))}

            {/* Stadium Drum Interactive Sound Box */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-display text-sm font-bold uppercase text-white tracking-wide">
                    Bombo de la Banda Sur
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedChant.tempoBpm} BPM
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDrumBeat}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                    isPlayingBeat
                      ? 'bg-amber-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/60'
                  }`}
                >
                  {isPlayingBeat ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Detener Ritmo</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Activar Ritmo de Bombo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={triggerSingleDrum}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-colors"
                  title="Golpear bombo una vez"
                >
                  ¡Golpear Bombo! 🥁
                </button>
              </div>
            </div>
          </div>

          {/* Karaoke Lyrics Display & Origin (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block">
                    {selectedChant.category}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white">
                    {selectedChant.title}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
              </div>

              {/* Lyrics with Karaoke Vibe */}
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 mb-6">
                {selectedChant.lyrics.map((line, idx) => (
                  <p
                    key={idx}
                    className="font-display text-lg sm:text-xl font-bold uppercase text-slate-100 tracking-wide leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300 block mb-1">Origen e Historia Popular:</span>
                <p>{selectedChant.originYear}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Barranquilla, Puerta de Oro de Colombia</span>
              <span>¡La Arenosa es Rojiblanca!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
