import {
  HistoryChapter,
  HistoryChapterCategory,
  HistoryEraGroup,
} from '../types/football';

export interface HistoryChapterFilterOptions {
  eraGroup: HistoryEraGroup;
  category: HistoryChapterCategory;
  query: string;
}

export function normalizeHistoryQuery(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function filterHistoryChapters(
  chapters: HistoryChapter[],
  options: HistoryChapterFilterOptions
): HistoryChapter[] {
  const cleanQuery = normalizeHistoryQuery(options.query);

  return chapters.filter((ch) => {
    if (options.eraGroup !== 'todos' && ch.eraGroup !== options.eraGroup) {
      return false;
    }
    if (options.category !== 'todas' && ch.category !== options.category) {
      return false;
    }
    if (!cleanQuery) return true;

    const searchable = normalizeHistoryQuery(
      [
        ch.number,
        ch.yearLabel,
        ch.title,
        ch.eraLabel,
        ch.summary,
        ...ch.paragraphs,
        ...ch.keyFigures,
      ].join(' ')
    );

    const words = cleanQuery.split(' ').filter(Boolean);
    return words.every((word) => searchable.includes(word));
  });
}

export function getHistoryEraCounts(
  chapters: HistoryChapter[]
): Record<HistoryEraGroup, number> {
  const counts: Record<HistoryEraGroup, number> = {
    todos: chapters.length,
    'fundacion-dorado': 0,
    'regreso-primeras-estrellas': 0,
    'decada-90-2000': 0,
    'era-dorada-2010': 0,
    'centenario-actual': 0,
  };

  for (const ch of chapters) {
    counts[ch.eraGroup] += 1;
  }

  return counts;
}
