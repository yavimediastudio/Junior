import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { AppModuleId } from '../types/football';

interface HomeWindowsGridProps {
  onOpenWindow: (moduleId: AppModuleId) => void;
  onOpenTitle?: (titleId: string) => void;
}

interface FeaturedTitleCard {
  id: string;
  kicker: string;
  title: string;
  deck: string;
  year: string;
  image: string;
  alt: string;
}

const SECONDARY_TITLES: FeaturedTitleCard[] = [
  {
    id: 'liga-2023-ii',
    kicker: 'Estrella 10 · 2023-II',
    title: 'La gesta en el Atanasio por penales',
    deck: 'Victoria histórica ante Independiente Medellín para bordar la décima estrella.',
    year: '2023',
    image: '/assets/aistudio/image_49b6ffc7.png',
    alt: 'Junior campeón de la Liga BetPlay 2023-II levantando la décima estrella',
  },
  {
    id: 'liga-2019-i',
    kicker: 'Estrella 9 · 2019-I',
    title: 'Bicampeón de Liga en El Campín',
    deck: 'Consagración ante Deportivo Pasto en Bogotá que selló la época dorada.',
    year: '2019',
    image: '/assets/aistudio/image_cb1cf6a4.png',
    alt: 'Junior bicampeón de la Liga Águila 2019-I celebrando con el trofeo',
  },
  {
    id: 'liga-1977',
    kicker: 'Primera Estrella · 1977',
    title: 'La Bruja Verón y la gloria inaugural',
    deck: 'Tras 53 años de fundación, Junior dio su primera vuelta olímpica en el Romelio.',
    year: '1977',
    image: '/assets/aistudio/image_1eafc3c5.png',
    alt: 'Vuelta olímpica histórica de Junior Campeón 1977 en el Romelio Martínez',
  },
];

const ARCHIVE_CUPS_STRIP = [
  {
    id: 'copa-2015',
    label: 'Copa Colombia 2015',
    image: '/assets/aistudio/image_4be7bfe7.png',
    alt: 'Junior campeón Copa Colombia 2015',
  },
  {
    id: 'copa-2017',
    label: 'Copa Colombia 2017',
    image: '/assets/aistudio/image_9b5baf10.png',
    alt: 'Junior campeón Copa Colombia 2017',
  },
  {
    id: 'superliga-2019',
    label: 'Superliga 2019',
    image: '/assets/aistudio/image_3d33e4e3.png',
    alt: 'Junior campeón Superliga 2019',
  },
  {
    id: 'superliga-2020',
    label: 'Superliga 2020',
    image: '/assets/aistudio/image_2754f763.png',
    alt: 'Junior campeón Superliga 2020',
  },
];

const ARCHIVE_DEPARTMENTS: {
  id: AppModuleId;
  kicker: string;
  title: string;
  summary: string;
  metric: string;
}[] = [
  {
    id: 'tablas-historicas',
    kicker: 'Archivo Estadístico · 1948–2026',
    title: 'Tablas Históricas Oficiales',
    summary:
      'Consulta año por año las posiciones completas del fútbol profesional colombiano: fases regulares, cuadrangulares, hexagonales y llaves finales.',
    metric: '91 Torneos',
  },
  {
    id: 'resultados-vs-equipos',
    kicker: 'Historial Frente a Frente',
    title: 'Clásicos y Rivales de Primera A',
    summary:
      'Balance verificado contra 40 franquicias históricas del país, evolución de nombres, escudos y registro de duelos memorables.',
    metric: '40 Franquicias',
  },
  {
    id: 'actualidad',
    kicker: 'Temporada Vigente · 2026',
    title: 'Actualidad, Plantilla y Liga BetPlay',
    summary:
      'Nómina profesional 2026-II, cuerpo técnico, repaso del bicampeonato ★11–★12 y seguimiento oficial de la temporada.',
    metric: 'Temporada 2026',
  },
];

export const HomeWindowsGrid: React.FC<HomeWindowsGridProps> = ({
  onOpenWindow,
  onOpenTitle,
}) => {
  const openTitleDetail = (titleId: string) => {
    if (onOpenTitle) {
      onOpenTitle(titleId);
    } else {
      onOpenWindow('titulos');
    }
  };

  return (
    <div>
      {/* ================================================================ */}
      {/* BLOQUE 1: VITRINA FOTOGRÁFICA DE CAMPEONATOS (BLANCO PURO)       */}
      {/* ================================================================ */}
      <section className="bg-white py-14 sm:py-16 border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E1D8] mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D62027]">
                Palmarés Oficial Dimayor
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#081D40] tracking-tight leading-none mt-1.5">
                Noches de Vuelta Olímpica
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onOpenWindow('titulos')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#081D40] hover:text-[#D62027] transition-colors self-start sm:self-end"
            >
              <span>Ver los 16 títulos oficiales</span>
              <ArrowRight className="w-4 h-4 text-[#D62027]" />
            </button>
          </div>

          {/* Composición asimétrica 7 + 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Historia Principal: Estrella 11 (2025-II) */}
            <article className="lg:col-span-7 flex flex-col">
              <button
                type="button"
                onClick={() => openTitleDetail('liga-2025-ii')}
                className="group text-left focus:outline-none flex flex-col h-full"
              >
                <div className="relative overflow-hidden rounded-2xl border border-[#E5E1D8] aspect-[16/10] bg-[#081D40]">
                  <img
                    src="/assets/aistudio/image_6ac94f04.png"
                    alt="Junior de Barranquilla campeón de la Liga BetPlay II-2025 celebrando la undécima estrella"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="pt-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#9A6700] mb-2">
                      <Star className="w-3.5 h-3.5 fill-current text-[#C69214]" />
                      <span>Estrella 11 · Finalización 2025-II</span>
                    </div>
                    <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#081D40] group-hover:text-[#D62027] transition-colors leading-[0.98]">
                      La undécima estrella que abrió la ruta al bicampeonato
                    </h3>
                    <p className="font-editorial text-base sm:text-lg text-[#475569] mt-2.5 leading-relaxed">
                      Con temple de campeón en Ibagué y la conducción de Alfredo Arias, Junior levantó la estrella once y encendió la fiesta rojiblanca rumbo al doblete histórico de 2026.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#D62027] mt-4">
                    <span>Abrir ficha completa y acta de final</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </button>
            </article>

            {/* Columna derecha: 3 títulos clave apilados con divisores hairline */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-[#E5E1D8] border-t lg:border-t-0 lg:border-l border-[#E5E1D8] pt-6 lg:pt-0 lg:pl-8">
              {SECONDARY_TITLES.map((item, idx) => (
                <article key={item.id} className={idx === 0 ? 'pb-5' : idx === SECONDARY_TITLES.length - 1 ? 'pt-5' : 'py-5'}>
                  <button
                    type="button"
                    onClick={() => openTitleDetail(item.id)}
                    className="group w-full text-left grid grid-cols-12 gap-4 items-center focus:outline-none"
                  >
                    <div className="col-span-5 overflow-hidden rounded-xl border border-[#E5E1D8] aspect-[4/3] bg-[#081D40]">
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="col-span-7 min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D62027] block">
                        {item.kicker}
                      </span>
                      <h3 className="font-display text-xl font-extrabold uppercase text-[#081D40] group-hover:text-[#D62027] transition-colors leading-tight mt-0.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#526075] mt-1 line-clamp-2 leading-relaxed">
                        {item.deck}
                      </p>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </div>

          {/* Tira compacta de Copas y Superligas */}
          <div className="mt-10 pt-8 border-t border-[#E5E1D8]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#526075]">
                Copas Colombia y Superligas en el Archivo Fotográfico
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ARCHIVE_CUPS_STRIP.map((cup) => (
                <button
                  key={cup.id}
                  type="button"
                  onClick={() => openTitleDetail(cup.id)}
                  className="group text-left focus:outline-none"
                >
                  <div className="overflow-hidden rounded-xl border border-[#E5E1D8] aspect-[16/10] bg-[#081D40]">
                    <img
                      src={cup.image}
                      alt={cup.alt}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#081D40] group-hover:text-[#D62027] transition-colors">
                      {cup.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#D62027] transition-colors shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BLOQUE 2: HISTORIAS Y CULTURA ROJIBLANCA (BANDA MARFIL #F7F5F0)  */}
      {/* ================================================================ */}
      <section className="bg-[#F7F5F0] py-14 sm:py-16 border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D62027]">
              Historias del Club
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-[#081D40] tracking-tight leading-none mt-1.5">
              Memoria, Goleadores e Identidad
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tarjeta 1: Historia Centenaria con fotografía del Metropolitano */}
            <article className="bg-white rounded-2xl border border-[#E5E1D8] overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/10] overflow-hidden bg-[#081D40]">
                  <img
                    src="/src/assets/images/junior_hero_stadium_1794167190681.jpg"
                    alt="Estadio Metropolitano Roberto Meléndez de Barranquilla"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D62027]">
                    1924 – 2026 · 23 Capítulos
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#081D40] mt-1 leading-tight">
                    Historia Centenaria
                  </h3>
                  <p className="font-editorial text-base text-[#475569] mt-2 leading-relaxed">
                    Desde el sueño de Doña Micaela Lavalle en el barrio San Roque hasta el clamor de La Caldera del Metropolitano.
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenWindow('historia')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#081D40] hover:text-[#D62027] transition-colors"
                >
                  <span>Leer la crónica oficial</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D62027]" />
                </button>
              </div>
            </article>

            {/* Tarjeta 2: Goleadores Históricos (bloque editorial Azul Marino) */}
            <article className="bg-[#081D40] text-white rounded-2xl border border-[#081D40] overflow-hidden flex flex-col justify-between p-6 sm:p-7">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FDE047]">
                  Top 50 · 15 Botines de Oro
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-white mt-1 leading-none">
                  Cañoneros Legendarios
                </h3>
                <p className="font-editorial text-base text-slate-300 mt-2.5 leading-relaxed">
                  Los artilleros que escribieron las noches inolvidables del Tiburón en Liga, Copa y torneos continentales.
                </p>

                <dl className="mt-6 divide-y divide-white/10 border-y border-white/10">
                  <div className="py-2.5 flex items-center justify-between text-sm">
                    <dt className="font-semibold text-white">1. Iván René Valenciano</dt>
                    <dd className="font-display text-xl font-black text-[#FDE047] tabular-nums">166</dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between text-sm">
                    <dt className="font-semibold text-white">2. Carlos Bacca</dt>
                    <dd className="font-display text-xl font-black text-white tabular-nums">135</dd>
                  </div>
                  <div className="py-2.5 flex items-center justify-between text-sm">
                    <dt className="font-semibold text-white">3. Teófilo Gutiérrez</dt>
                    <dd className="font-display text-xl font-black text-white tabular-nums">107</dd>
                  </div>
                </dl>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => onOpenWindow('goleadores-historicos')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-[#FDE047] transition-colors"
                >
                  <span>Explorar el Top 50 de goleadores</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FDE047]" />
                </button>
              </div>
            </article>

            {/* Tarjeta 3: Museo de Camisetas e Insignias */}
            <article className="bg-white rounded-2xl border border-[#E5E1D8] overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/10] bg-gradient-to-br from-[#F7F5F0] via-white to-[#FEF2F2] border-b border-[#EFECE4] flex items-center justify-center p-8 relative">
                  {/* Franjas rojiblancas sutiles de fondo */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, #D62027 0px, #D62027 28px, transparent 28px, transparent 56px)',
                    }}
                  />
                  <img
                    src="/assets/aistudio/image_82370351.png"
                    alt="Escudo institucional de Junior de Barranquilla con estrellas"
                    className="relative z-10 w-28 h-28 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D62027]">
                    Patrimonio Visual · 1924–2026
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#081D40] mt-1 leading-tight">
                    Camisetas e Insignias
                  </h3>
                  <p className="font-editorial text-base text-[#475569] mt-2 leading-relaxed">
                    Cinco escudos históricos, la evolución de las rayas rojiblancas y el personalizador oficial con las 12 estrellas.
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenWindow('uniformes')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#081D40] hover:text-[#D62027] transition-colors"
                >
                  <span>Entrar al museo de camisetas</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D62027]" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BLOQUE 3: DIRECTORIO DE ARCHIVO Y ACTUALIDAD (FILAS EDITORIALES) */}
      {/* ================================================================ */}
      <section className="bg-white py-14 sm:py-16 border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#D62027]">
                Archivo y Competencia
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-[#081D40] tracking-tight leading-none mt-1.5">
                Datos Oficiales del Club
              </h2>
              <p className="text-sm text-[#526075] mt-3 leading-relaxed">
                Cada campaña desde 1948, el balance verificado frente a los rivales del fútbol colombiano y la plantilla de la temporada actual.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#E5E1D8] border-y border-[#E5E1D8]">
              {ARCHIVE_DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => onOpenWindow(dept.id)}
                  className="group w-full py-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F5F0]/60 px-3 -mx-3 rounded-xl transition-colors"
                >
                  <div className="max-w-xl">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D62027]">
                      {dept.kicker}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-[#081D40] group-hover:text-[#D62027] transition-colors leading-tight mt-0.5">
                      {dept.title}
                    </h3>
                    <p className="text-sm text-[#526075] mt-1 leading-relaxed">
                      {dept.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-display text-lg font-extrabold uppercase text-[#081D40] tabular-nums">
                      {dept.metric}
                    </span>
                    <span className="w-9 h-9 rounded-full border border-[#E5E1D8] group-hover:border-[#D62027] group-hover:bg-[#D62027] flex items-center justify-center text-[#081D40] group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
