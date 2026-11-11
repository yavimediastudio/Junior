import React, { useState } from 'react';
import { MapPin, Users, Sun, Compass, Mic, Award } from 'lucide-react';
import { STADIUM_ZONES } from '../data/juniorData';
import { StadiumZone } from '../types/football';

export const StadiumSection: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<StadiumZone>(STADIUM_ZONES[0]); // Default to Sur

  return (
    <section id="estadio" className="py-16 bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Templos del Fútbol Caribe</span>
              <span aria-hidden="true">·</span>
              <span>Barranquilla, Colombia</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
              Estadio Metropolitano Roberto Meléndez
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            La Casa de la Selección Colombia y fortaleza inexpugnable de Junior de Barranquilla. 46.692 almas empujando con 35°C de calor y pasión.
          </p>
        </div>

        {/* Stadium Panoramic Visual */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-12">
          <img
            src="/src/assets/images/junior_metropolitano_pitch_1794167191975.jpg"
            alt="Gramado y graderías del Estadio Metropolitano Roberto Meléndez en Barranquilla"
            className="w-full h-72 sm:h-96 object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Stadium Floating Badge Banner */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                Inaugurado el 11 de Mayo de 1986
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                El Coloso de la Ciudadela 20 de Julio
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-mono font-bold text-white">
                📍 Av. Murillo con Circunvalar
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Tribune Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Tribune Selector Tabs (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Explorar Tribunas del Roberto Meléndez:
            </span>
            {STADIUM_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedZone.id === zone.id
                    ? 'bg-red-950/50 border-red-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold uppercase text-slate-100">
                    {zone.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {zone.capacity}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 truncate">
                  {zone.popularName}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Tribune Detail Box (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block">
                    {selectedZone.popularName}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white">
                    {selectedZone.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aforo: {selectedZone.capacity}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {selectedZone.description}
              </p>

              {/* Chant Quote */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-900/40 text-xs sm:text-sm text-amber-200 italic mb-6">
                &quot;{selectedZone.chantQuote}&quot;
              </div>

              {/* Tribune Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-800">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ángulo de Visión</span>
                  </div>
                  <p className="text-slate-300">{selectedZone.viewAngle}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sombra & Clima</span>
                  </div>
                  <p className="text-slate-300">{selectedZone.sunProtection}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                    <Award className="w-3.5 h-3.5 text-red-400" />
                    <span>Atmósfera</span>
                  </div>
                  <p className="text-slate-300">{selectedZone.vibe}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tribute to Historic Romelio Martínez Stadium */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              El Templo Original (1935 - 1986)
            </span>
            <h4 className="font-display text-xl font-bold uppercase text-white">
              Estadio Romelio Martínez (Calle 72 con Carrera 44)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Aquí nació la leyenda de Juan Ramón Verón y la Primera Estrella de 1977.
              El Romelio albergó a Heleno de Freitas, Garrincha, Dida y las inolvidables tardes dominicales que forjaron la identidad rojiblanca antes del traslado al Metropolitano.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Mic className="w-4 h-4 text-red-500" />
              <span>Voz Inmortal: Édgar Perea</span>
            </div>
            <p className="italic text-slate-300 text-[11px]">
              &quot;¡Sigan siendo felices, Édgar les dice! ¡Junior tu papá y no joda nadie más!&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
