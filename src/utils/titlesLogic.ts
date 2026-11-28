import {
  ChampionManagerRecord,
  EnrichedOfficialTitle,
  TitleFormatType,
} from '../types/football';

export type TitleCategoryFilter = 'todos' | 'liga' | 'copa' | 'superliga';
export type TitleFormatFilter = 'todos' | TitleFormatType;

export interface TitlesFilterCriteria {
  category: TitleCategoryFilter;
  format: TitleFormatFilter;
  query: string;
}

export interface TitleCategoryTotals {
  total: number;
  liga: number;
  copa: number;
  superliga: number;
  shootouts: number;
}

const MANAGER_HIGHLIGHTS: Record<string, string> = {
  'Julio Avelino Comesaña':
    'Director técnico más laureado en la historia de Junior (3 Ligas, 1 Copa Colombia y 1 Superliga).',
  'Alfredo Arias':
    'Conductor del segundo bicampeonato de Liga consecutivo (2025-II y 2026-I) con 11.ª y 12.ª Estrellas.',
  'Juan Ramón Verón':
    'Ídolo argentino que asumió el doble rol de jugador y técnico para conquistar la 1.ª Estrella (1977).',
  'José «Puchero» Varacka':
    'Arquitecto del «equipo de los obreros», campeón invicto del Cuadrangular Final de 1980.',
  'Carlos «Piscis» Restrepo':
    'Campeón de punta a punta en el Torneo Nivelación 1995 (62 puntos en 30 fechas).',
  'Miguel Ángel «Zurdo» López':
    'Artífice de la épica «Final de los Milagros» ante Atlético Nacional en Medellín (2004-II).',
  'Diego Edison Umaña':
    'Lideró la consagración de Carlos Bacca y la remontada 3-1 frente a La Equidad (2010-I).',
  'José Eugenio «Cheché» Hernández':
    'Campeón en el Palogrande de Manizales por penales ante Once Caldas (2011-II).',
  'Alexis Mendoza':
    'Ídolo barranquillero que le dio al club su primera Copa Colombia oficial en El Campín (2015).',
  'Luis Fernando Suárez':
    'Campeón de la primera Superliga de Colombia en la historia rojiblanca (2019).',
  'Arturo Reyes':
    'Entrenador samario que devolvió la gloria liguera bordando la Décima Estrella en Medellín (2023-II).',
};

export function getTitleCategoryTotals(titles: EnrichedOfficialTitle[]): TitleCategoryTotals {
  return {
    total: titles.length,
    liga: titles.filter((t) => t.category === 'Liga (Estrella)').length,
    copa: titles.filter((t) => t.category === 'Copa Colombia').length,
    superliga: titles.filter((t) => t.category === 'Superliga').length,
    shootouts: titles.filter((t) => Boolean(t.penaltyShootout)).length,
  };
}

export function filterOfficialTitles(
  titles: EnrichedOfficialTitle[],
  criteria: TitlesFilterCriteria
): EnrichedOfficialTitle[] {
  const q = criteria.query.trim().toLowerCase();
  return titles.filter((t) => {
    if (criteria.category === 'liga' && t.category !== 'Liga (Estrella)') return false;
    if (criteria.category === 'copa' && t.category !== 'Copa Colombia') return false;
    if (criteria.category === 'superliga' && t.category !== 'Superliga') return false;
    if (criteria.format !== 'todos' && t.formatType !== criteria.format) return false;

    if (!q) return true;
    const searchable = [
      t.titleName,
      String(t.year),
      t.shortYearLabel,
      t.opponent,
      t.rivalDisplayName,
      t.manager,
      t.hero,
      t.venue,
      t.keyNote,
      t.starNumber ? `estrella ${t.starNumber}` : '',
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(q);
  });
}

export function getAdjacentTitles(
  titles: EnrichedOfficialTitle[],
  currentId: string
): {
  prev: EnrichedOfficialTitle | null;
  next: EnrichedOfficialTitle | null;
  currentIndex: number;
} {
  const idx = titles.findIndex((t) => t.id === currentId);
  if (idx === -1) {
    return { prev: null, next: null, currentIndex: -1 };
  }
  return {
    prev: idx > 0 ? titles[idx - 1] : null,
    next: idx < titles.length - 1 ? titles[idx + 1] : null,
    currentIndex: idx,
  };
}

/**
 * Construye dinámicamente el ranking de Directores Técnicos campeones a partir
 * del catálogo oficial de 16 títulos Dimayor.
 */
export function buildChampionManagersRanking(
  titles: EnrichedOfficialTitle[]
): ChampionManagerRecord[] {
  const grouped = new Map<
    string,
    {
      name: string;
      ligaTitles: number;
      copaTitles: number;
      superligaTitles: number;
      years: string[];
      titleIds: string[];
      firstYear: number;
    }
  >();

  for (const title of titles) {
    const cleanName = title.manager.replace(/\s*\([^)]*\)\s*/g, '').trim();
    const existing = grouped.get(cleanName) ?? {
      name: cleanName,
      ligaTitles: 0,
      copaTitles: 0,
      superligaTitles: 0,
      years: [],
      titleIds: [],
      firstYear: title.year,
    };

    if (title.category === 'Liga (Estrella)') existing.ligaTitles += 1;
    else if (title.category === 'Copa Colombia') existing.copaTitles += 1;
    else existing.superligaTitles += 1;

    existing.years.push(title.shortYearLabel);
    existing.titleIds.push(title.id);
    existing.firstYear = Math.min(existing.firstYear, title.year);
    grouped.set(cleanName, existing);
  }

  return Array.from(grouped.values())
    .map((item) => ({
      name: item.name,
      totalTitles: item.ligaTitles + item.copaTitles + item.superligaTitles,
      ligaTitles: item.ligaTitles,
      copaTitles: item.copaTitles,
      superligaTitles: item.superligaTitles,
      yearsLabel: item.years.join(' · '),
      titleIds: item.titleIds,
      highlight:
        MANAGER_HIGHLIGHTS[item.name] ??
        `Campeón oficial Dimayor con Junior (${item.years.join(', ')}).`,
    }))
    .sort((a, b) => {
      if (b.totalTitles !== a.totalTitles) return b.totalTitles - a.totalTitles;
      if (b.ligaTitles !== a.ligaTitles) return b.ligaTitles - a.ligaTitles;
      return a.name.localeCompare(b.name, 'es');
    });
}
