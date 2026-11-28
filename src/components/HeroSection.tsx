import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
  onOpenTitle?: (titleId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onOpenTitle }) => {
  const handleOpenStar12 = () => {
    if (onOpenTitle) {
      onOpenTitle('liga-2026-i');
    } else {
      onNavigate('titulos');
    }
  };

  return (
    <section className="bg-white border-b border-[#E5E1D8]">
      {/* Cuerpo principal asimétrico: Narrativa Editorial + Fotografía Monumental */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Columna izquierda: Identidad, Titular y Acción */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#D62027]">
              <span>Barranquilla, Colombia</span>
              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
              <span className="text-[#526075]">Desde 1924</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl xl:text-[72px] font-black uppercase tracking-tight text-[#081D40] leading-[0.92]">
              El Legado del{' '}
              <span className="text-[#D62027]">Tiburón</span>
            </h1>

            <p className="font-editorial text-lg sm:text-xl text-[#334155] leading-relaxed">
              Más de un siglo de fútbol, carnaval y gloria rojiblanca. Archivo oficial con las doce estrellas de liga, cuatro copas nacionales, 91 tablas históricas y la memoria viva del Metropolitano.
            </p>

            {/* Acción principal única + enlace editorial secundario */}
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('titulos')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#D62027] hover:bg-[#A6151B] text-white text-sm font-bold uppercase tracking-wider shadow-sm transition-colors"
              >
                <Star className="w-4 h-4 fill-current text-[#FDE047]" />
                <span>Explorar el Palmarés</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('historia')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#081D40] hover:text-[#D62027] border-b border-[#081D40]/25 hover:border-[#D62027] pb-0.5 transition-colors"
              >
                <span>Crónica centenaria 1924–2026</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Columna derecha: Fotografía Oficial Estrella 12 (2026-I) */}
          <div className="lg:col-span-7">
            <button
              type="button"
              onClick={handleOpenStar12}
              className="group block w-full text-left focus:outline-none"
              aria-label="Abrir ficha de la Estrella 12 Apertura 2026-I en la Sala de Trofeos"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#E5E1D8] bg-[#081D40] shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src="/assets/aistudio/image_09f17c4e.png"
                    alt="Celebración oficial de Junior de Barranquilla campeón de la Liga BetPlay I-2026, Estrella 12"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[#081D40]/90 via-[#081D40]/20 to-transparent" />
                </div>

                <div className="bg-[#081D40] sm:bg-transparent sm:absolute sm:inset-x-0 sm:bottom-0 p-4 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FDE047] mb-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Estrella 12 · Bicampeón Vigente</span>
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white leading-tight">
                      Campeón Liga BetPlay Apertura 2026-I
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/90 group-hover:text-[#FDE047] shrink-0 transition-colors">
                    <span>Ver crónica</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
              <p className="mt-2.5 text-xs font-editorial italic text-[#64748B]">
                Vuelta olímpica oficial del plantel rojiblanco tras conquistar la duodécima estrella en el fútbol profesional colombiano.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Tira editorial de cifras del club (limpia, sin cajas repetitivas) */}
      <div className="bg-[#F7F5F0] border-t border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 lg:gap-y-0 lg:divide-x divide-[#DFDBD0]">
            <div className="lg:pr-6">
              <div className="font-display text-4xl sm:text-5xl font-black text-[#081D40] tabular-nums leading-none">
                16
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#D62027] mt-1.5">
                Títulos Oficiales
              </div>
              <p className="text-xs text-[#526075] mt-0.5">
                12 Ligas · 2 Copas · 2 Superligas
              </p>
            </div>

            <div className="lg:px-6">
              <div className="font-display text-4xl sm:text-5xl font-black text-[#081D40] tabular-nums leading-none">
                166
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#081D40] mt-1.5">
                Goles de Valenciano
              </div>
              <p className="text-xs text-[#526075] mt-0.5">
                Máximo artillero histórico
              </p>
            </div>

            <div className="lg:px-6">
              <div className="font-display text-4xl sm:text-5xl font-black text-[#081D40] tabular-nums leading-none">
                102
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#081D40] mt-1.5">
                Años de Historia
              </div>
              <p className="text-xs text-[#526075] mt-0.5">
                Doña Micaela Lavalle · 1924
              </p>
            </div>

            <div className="lg:pl-6">
              <div className="font-display text-4xl sm:text-5xl font-black text-[#081D40] tabular-nums leading-none">
                46.692
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#081D40] mt-1.5">
                Estadio Metropolitano
              </div>
              <p className="text-xs text-[#526075] mt-0.5">
                Roberto Meléndez, La Caldera
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
