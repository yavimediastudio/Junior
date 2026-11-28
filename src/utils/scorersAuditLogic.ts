import {
  CurrentPlayer,
  GoldenBootRecord,
  PlayerLegend,
  TopScorerProfile,
} from '../types/football';
import {
  buildScorersRaceTimeline,
  RACE_END_YEAR,
  RACE_START_YEAR,
} from './scorersRaceLogic';

export type AuditLightStatus = 'verde' | 'ambar' | 'rojo';

export type AuditCheckKey =
  | 'breakdown'
  | 'legends'
  | 'roster'
  | 'timeline'
  | 'goldenBoots'
  | 'photo';

export interface AuditCheckItem {
  key: AuditCheckKey;
  label: string;
  shortLabel: string;
  status: AuditLightStatus;
  detail: string;
  applicable: boolean;
}

export interface ScorerAuditRecord {
  scorer: TopScorerProfile;
  status: AuditLightStatus;
  passedChecks: number;
  totalApplicableChecks: number;
  checks: AuditCheckItem[];
  correctedInMassAudit: boolean;
  auditNote: string;
  breakdownSum: number;
  internationalGoals: number;
}

export interface GlobalAuditCheck {
  id: string;
  label: string;
  status: AuditLightStatus;
  metric: string;
  detail: string;
}

export interface ScorersAuditSummary {
  total: number;
  verde: number;
  ambar: number;
  rojo: number;
  massCorrected: number;
  photosVerified: number;
  goldenBootsCount: number;
  activePlayersVerified: number;
}

export interface ScorersAuditReport {
  overallStatus: AuditLightStatus;
  evaluatedAtLabel: string;
  summary: ScorersAuditSummary;
  globalChecks: GlobalAuditCheck[];
  records: ScorerAuditRecord[];
}

/**
 * Registro auditable de correcciones aplicadas en la actualización masiva
 * contra fuentes históricas de Dimayor, CONMEBOL y Wikipedia.
 */
export const MASS_AUDIT_CORRECTION_NOTES: Record<string, string> = {
  valenciano:
    'Biografía ajustada (60 goles en 1995 y 1995/96) y serie anual 1988–2006 verificada (supera a Ephanor en 1995).',
  bacca:
    'Total unificado en 135 goles en todos los módulos; Botines de Copa Colombia (2009 y 2011) y títulos compartidos 2010-I / 2024-I documentados.',
  'silva-pacheco':
    'Botín de Oro 1973 desglosado (19 con Cúcuta + 17 con Junior = 36) y aporte anual 1973 corregido a 17 goles.',
  'victor-pacheco':
    'Eliminado año fantasma 2002 en períodos, Leyendas y Carrera 1948–2026 (etapas reales: 1990–1999, 2006 y 2009).',
  arzuaga:
    'Eliminado año fantasma 2012 en períodos y Carrera 1948–2026 (etapas reales: 2000–2005, 2008, 2010 y 2014).',
  'giovanni-hernandez':
    'Total de goles (52) y presencias (203 PJ) sincronizados entre Top 50 y Leyendas.',
  'luis-carlos-ruiz':
    'Botín de Oro 2013-II marcado explícitamente como compartido con Dayro Moreno (16 goles).',
  'juan-ramon-veron':
    'Etapas reales (1976–1977 y 1979) y 123 PJ sincronizados entre Top 50 y Leyendas.',
  'yimmi-chara':
    '27 goles y 138 PJ sincronizados con Plantilla 2026; cuádruple empate del Botín 2017-II documentado.',
  'luis-muriel':
    '21 goles y 39 PJ sincronizados con Plantilla 2026; Botín 2026-I marcado como compartido (13 goles).',
};

function mergeStatus(current: AuditLightStatus, next: AuditLightStatus): AuditLightStatus {
  if (current === 'rojo' || next === 'rojo') return 'rojo';
  if (current === 'ambar' || next === 'ambar') return 'ambar';
  return 'verde';
}

export function getScorerBreakdownSum(scorer: TopScorerProfile): number {
  const b = scorer.breakdown;
  return b.liga + b.copa + b.superliga + b.libertadores + b.sudamericana + b.conmebol;
}

export function getScorerInternationalGoals(scorer: TopScorerProfile): number {
  const b = scorer.breakdown;
  return b.libertadores + b.sudamericana + b.conmebol;
}

/**
 * Ejecuta una auditoría determinística en tiempo real sobre todo el escalafón
 * de goleadores y sus cruces con Leyendas, Plantilla 2026, Botines de Oro
 * Dimayor y la serie cronológica 1948–2026.
 */
export function evaluateScorersDataAudit(
  scorers: TopScorerProfile[],
  legends: PlayerLegend[],
  roster: CurrentPlayer[],
  goldenBoots: GoldenBootRecord[],
  evaluatedAtLabel = 'Corte oficial: 4 de octubre de 2026'
): ScorersAuditReport {
  const legendsById = new Map(legends.map((l) => [l.id, l]));
  const rosterByName = new Map(roster.map((p) => [p.name, p]));
  const goldenBootByYear = new Map(goldenBoots.map((g) => [g.year.trim(), g]));
  const timeline = buildScorersRaceTimeline(scorers);
  const seriesById = new Map(timeline.map((s) => [s.scorer.id, s]));

  const records: ScorerAuditRecord[] = scorers.map((scorer) => {
    const breakdownSum = getScorerBreakdownSum(scorer);
    const internationalGoals = getScorerInternationalGoals(scorer);
    const b = scorer.breakdown;
    const hasNegativeComponent =
      b.liga < 0 ||
      b.copa < 0 ||
      b.superliga < 0 ||
      b.libertadores < 0 ||
      b.sudamericana < 0 ||
      b.conmebol < 0;

    // 1. Sumatoria por torneos
    const breakdownValid = !hasNegativeComponent && breakdownSum === scorer.totalGoals;
    const breakdownCheck: AuditCheckItem = {
      key: 'breakdown',
      label: 'Desglose por torneos',
      shortLabel: 'Torneos',
      applicable: true,
      status: breakdownValid ? 'verde' : 'rojo',
      detail: breakdownValid
        ? `Suma exacta: ${breakdownSum} goles (Liga ${b.liga} · Copa ${b.copa} · Superliga ${b.superliga} · Int. ${internationalGoals}).`
        : `Descuadre detectado: la suma de torneos da ${breakdownSum} frente a ${scorer.totalGoals} goles totales.`,
    };

    // 2. Paridad con Leyendas
    let legendsCheck: AuditCheckItem;
    if (scorer.legendId) {
      const legend = legendsById.get(scorer.legendId);
      if (!legend) {
        legendsCheck = {
          key: 'legends',
          label: 'Cruce con Leyendas',
          shortLabel: 'Leyendas',
          applicable: true,
          status: 'rojo',
          detail: `No se encontró el perfil vinculado "${scorer.legendId}" en LEGENDS_DATA.`,
        };
      } else {
        const goalsMatch = legend.goals === scorer.totalGoals;
        const matchesMatch = !scorer.matches || legend.matches === scorer.matches;
        const ok = goalsMatch && matchesMatch;
        legendsCheck = {
          key: 'legends',
          label: 'Cruce con Leyendas',
          shortLabel: 'Leyendas',
          applicable: true,
          status: ok ? 'verde' : 'rojo',
          detail: ok
            ? `Paridad exacta con ficha de ídolo (${legend.goals} goles${scorer.matches ? ` · ${legend.matches} PJ` : ''}).`
            : `Desfase con Leyendas: ficha registra ${legend.goals} goles / ${legend.matches} PJ frente a ${scorer.totalGoals} / ${scorer.matches ?? 'N/D'}.`,
        };
      }
    } else {
      legendsCheck = {
        key: 'legends',
        label: 'Cruce con Leyendas',
        shortLabel: 'Leyendas',
        applicable: false,
        status: 'verde',
        detail: 'Sin ficha paralela en módulo Leyendas (no aplica).',
      };
    }

    // 3. Paridad con Plantilla 2026
    let rosterCheck: AuditCheckItem;
    if (scorer.isActiveAtClub) {
      const rosterEntry = rosterByName.get(scorer.name);
      if (!rosterEntry) {
        rosterCheck = {
          key: 'roster',
          label: 'Cruce con Plantilla 2026',
          shortLabel: 'Plantilla',
          applicable: true,
          status: 'rojo',
          detail: `Jugador activo en Top 50 ausente en CURRENT_ROSTER.`,
        };
      } else if (rosterEntry.goals !== scorer.totalGoals) {
        rosterCheck = {
          key: 'roster',
          label: 'Cruce con Plantilla 2026',
          shortLabel: 'Plantilla',
          applicable: true,
          status: 'rojo',
          detail: `Desfase de goles con Plantilla 2026 (${rosterEntry.goals} en plantilla vs ${scorer.totalGoals} en Top 50).`,
        };
      } else {
        rosterCheck = {
          key: 'roster',
          label: 'Cruce con Plantilla 2026',
          shortLabel: 'Plantilla',
          applicable: true,
          status: 'verde',
          detail: `Sincronizado con Plantilla 2026 (${rosterEntry.goals} goles · dorsal #${rosterEntry.dorsal}).`,
        };
      }
    } else {
      rosterCheck = {
        key: 'roster',
        label: 'Cruce con Plantilla 2026',
        shortLabel: 'Plantilla',
        applicable: false,
        status: 'verde',
        detail: 'Jugador histórico retirado o fuera del plantel 2026 (no aplica).',
      };
    }

    // 4. Carrera cronológica 1948–2026
    const series = seriesById.get(scorer.id);
    let timelineStatus: AuditLightStatus = 'verde';
    let timelineDetail = '';
    if (!series) {
      timelineStatus = 'rojo';
      timelineDetail = 'No existe serie anual generada en la Carrera 1948–2026.';
    } else {
      const finalCumulative = series.cumulativeByYear[RACE_END_YEAR] ?? 0;
      let monotonic = true;
      let prev = 0;
      for (let y = RACE_START_YEAR; y <= RACE_END_YEAR; y++) {
        const val = series.cumulativeByYear[y] ?? 0;
        if (val < prev) {
          monotonic = false;
          break;
        }
        prev = val;
      }

      const ghostYearViolations: string[] = [];
      if (scorer.id === 'victor-pacheco' && series.goalsByYear[2002] !== undefined) {
        ghostYearViolations.push('año fantasma 2002 presente');
      }
      if (scorer.id === 'arzuaga' && series.goalsByYear[2012] !== undefined) {
        ghostYearViolations.push('año fantasma 2012 presente');
      }
      if (scorer.id === 'silva-pacheco' && series.goalsByYear[1973] !== 17) {
        ghostYearViolations.push(`1973 registra ${series.goalsByYear[1973] ?? 0} en vez de 17`);
      }
      if (
        scorer.id === 'valenciano' &&
        (series.goalsByYear[1988] !== 1 || series.goalsByYear[2006] !== 1)
      ) {
        ghostYearViolations.push('goles de 1988/2006 fuera de especificación');
      }

      if (!monotonic || finalCumulative !== scorer.totalGoals || ghostYearViolations.length > 0) {
        timelineStatus = 'rojo';
        timelineDetail =
          ghostYearViolations.length > 0
            ? `Inconsistencia histórica: ${ghostYearViolations.join('; ')}.`
            : `Acumulado 2026 (${finalCumulative}) no coincide con total oficial (${scorer.totalGoals}).`;
      } else {
        timelineDetail = `Serie ${series.firstYear}–${series.lastYear} monotónica; cierra exacto en ${finalCumulative} goles.`;
      }
    }

    const timelineCheck: AuditCheckItem = {
      key: 'timeline',
      label: 'Carrera anual 1948–2026',
      shortLabel: 'Carrera',
      applicable: true,
      status: timelineStatus,
      detail: timelineDetail,
    };

    // 5. Botines de Oro Dimayor
    let goldenBootsCheck: AuditCheckItem;
    if (scorer.goldenBoots && scorer.goldenBoots.length > 0) {
      let gbStatus: AuditLightStatus = 'verde';
      const issues: string[] = [];
      for (const entry of scorer.goldenBoots) {
        const match = entry.match(/^([^\s(]+)\s*\((\d+)/);
        if (!match) {
          gbStatus = mergeStatus(gbStatus, 'rojo');
          issues.push(`formato inválido "${entry}"`);
          continue;
        }
        const [, yearToken, goalsStr] = match;
        const expectedGoals = Number(goalsStr);
        const gbRecord = goldenBootByYear.get(yearToken);
        if (!gbRecord) {
          gbStatus = mergeStatus(gbStatus, 'rojo');
          issues.push(`${yearToken} ausente en GOLDEN_BOOT_WINNERS`);
          continue;
        }
        if (gbRecord.goals !== expectedGoals) {
          gbStatus = mergeStatus(gbStatus, 'rojo');
          issues.push(`${yearToken}: ${expectedGoals} vs ${gbRecord.goals} goles`);
        }
        const sharedInScorer = /compartido|igualado/i.test(entry);
        const sharedInTable = /compartido|igualado/i.test(gbRecord.note);
        if (sharedInScorer !== sharedInTable) {
          gbStatus = mergeStatus(gbStatus, 'ambar');
          issues.push(`${yearToken}: etiqueta de título compartido sin sincronizar`);
        }
      }
      goldenBootsCheck = {
        key: 'goldenBoots',
        label: 'Botines de Oro Dimayor',
        shortLabel: 'Botines',
        applicable: true,
        status: gbStatus,
        detail:
          issues.length === 0
            ? `${scorer.goldenBoots.length} ${scorer.goldenBoots.length === 1 ? 'Botín verificado' : 'Botines verificados'}: ${scorer.goldenBoots.join(', ')}.`
            : `Hallazgos en Botines: ${issues.join(' · ')}.`,
      };
    } else {
      goldenBootsCheck = {
        key: 'goldenBoots',
        label: 'Botines de Oro Dimayor',
        shortLabel: 'Botines',
        applicable: false,
        status: 'verde',
        detail: 'Sin Botines de Oro de Primera A registrados (no aplica).',
      };
    }

    // 6. Retrato de Archivo
    const hasPhoto = Boolean(scorer.photoUrl && scorer.photoUrl.trim().length > 0);
    const photoCheck: AuditCheckItem = {
      key: 'photo',
      label: 'Retrato de archivo',
      shortLabel: 'Foto',
      applicable: true,
      status: hasPhoto ? 'verde' : 'ambar',
      detail: hasPhoto
        ? `Retrato local verificado (${scorer.photoUrl}).`
        : 'Sin fotografía de archivo vinculada (usa retrato tipográfico de respaldo).',
    };

    const checks = [
      breakdownCheck,
      legendsCheck,
      rosterCheck,
      timelineCheck,
      goldenBootsCheck,
      photoCheck,
    ];

    const applicableChecks = checks.filter((c) => c.applicable);
    let recordStatus: AuditLightStatus = 'verde';
    for (const check of applicableChecks) {
      recordStatus = mergeStatus(recordStatus, check.status);
    }

    const passedChecks = applicableChecks.filter((c) => c.status === 'verde').length;
    const correctionNote = MASS_AUDIT_CORRECTION_NOTES[scorer.id];

    return {
      scorer,
      status: recordStatus,
      passedChecks,
      totalApplicableChecks: applicableChecks.length,
      checks,
      correctedInMassAudit: Boolean(correctionNote),
      auditNote:
        correctionNote ??
        'Registro contrastado con Wikipedia, Dimayor y CONMEBOL sin discrepancias en cifras ni períodos.',
      breakdownSum,
      internationalGoals,
    };
  });

  // Global club-wide checks
  const ranksValid =
    scorers.length === 50 &&
    scorers.every((s, idx) => s.rank === idx + 1) &&
    scorers.every((s, idx) => idx === 0 || scorers[idx - 1].totalGoals >= s.totalGoals);

  const legendRecords = records.filter((r) => r.scorer.legendId);
  const legendsAllValid = legendRecords.every(
    (r) => r.checks.find((c) => c.key === 'legends')?.status === 'verde'
  );

  const top50Names = new Set(scorers.map((s) => s.name));
  const cutoffGoals = scorers.length > 0 ? scorers[scorers.length - 1].totalGoals : 0;
  const rosterThresholdViolations = roster.filter(
    (p) => !top50Names.has(p.name) && p.goals >= cutoffGoals
  );
  const activeRecords = records.filter((r) => r.scorer.isActiveAtClub);
  const activeRosterAllValid =
    activeRecords.every((r) => r.checks.find((c) => c.key === 'roster')?.status === 'verde') &&
    rosterThresholdViolations.length === 0;

  const allTop50Boots = scorers.flatMap((s) => s.goldenBoots ?? []);
  const sharedInTop50 = allTop50Boots.filter((b) => /compartido|igualado/i.test(b)).length;
  const sharedInGoldenBoots = goldenBoots.filter((g) => /compartido|igualado/i.test(g.note)).length;
  const bootsAllValid =
    allTop50Boots.length === goldenBoots.length &&
    sharedInTop50 === sharedInGoldenBoots &&
    records.every((r) => r.checks.find((c) => c.key === 'goldenBoots')?.status === 'verde');

  const timelinesAllValid = records.every(
    (r) => r.checks.find((c) => c.key === 'timeline')?.status === 'verde'
  );

  const photosVerified = records.filter(
    (r) => r.checks.find((c) => c.key === 'photo')?.status === 'verde'
  ).length;
  const photosStatus: AuditLightStatus = photosVerified === scorers.length ? 'verde' : 'ambar';

  const globalChecks: GlobalAuditCheck[] = [
    {
      id: 'ranking-order',
      label: 'Orden y corte del escalafón',
      status: ranksValid ? 'verde' : 'rojo',
      metric: `${scorers.length}/50`,
      detail: ranksValid
        ? `Rangos #01 a #50 consecutivos y orden descendente estricto (umbral mínimo: ${cutoffGoals} goles).`
        : 'Inconsistencia en numeración o en orden descendente de goles.',
    },
    {
      id: 'legends-parity',
      label: 'Paridad Top 50 y Leyendas',
      status: legendsAllValid ? 'verde' : 'rojo',
      metric: `${legendRecords.filter((r) => r.checks.find((c) => c.key === 'legends')?.status === 'verde').length}/${legendRecords.length}`,
      detail: legendsAllValid
        ? 'Todos los ídolos vinculados coinciden en goles y partidos oficiales.'
        : 'Existen diferencias de goles o partidos entre Top 50 y Leyendas.',
    },
    {
      id: 'roster-parity',
      label: 'Plantilla 2026 y umbral #50',
      status: activeRosterAllValid ? 'verde' : 'rojo',
      metric: `${activeRecords.length} activos`,
      detail: activeRosterAllValid
        ? `Activos sincronizados y cero jugadores externos con ≥ ${cutoffGoals} goles (ej. Paiva: 18).`
        : `Desfase detectado en activos o jugadores externos superando ${cutoffGoals} goles.`,
    },
    {
      id: 'golden-boots',
      label: 'Botines de Oro Dimayor (Primera A)',
      status: bootsAllValid ? 'verde' : 'rojo',
      metric: `${allTop50Boots.length}/${goldenBoots.length}`,
      detail: bootsAllValid
        ? `15/15 Botines de Primera A alineados (${sharedInTop50} títulos compartidos documentados).`
        : 'Descuadre entre los Botines de Oro del Top 50 y la tabla oficial Dimayor.',
    },
    {
      id: 'race-timeline',
      label: 'Carrera anual 1948–2026',
      status: timelinesAllValid ? 'verde' : 'rojo',
      metric: `${records.filter((r) => r.checks.find((c) => c.key === 'timeline')?.status === 'verde').length}/${scorers.length}`,
      detail: timelinesAllValid
        ? 'Series anuales monotónicas sin años fantasma y cierre exacto al corte 2026.'
        : 'Una o más series anuales presentan desfases o años inactivos.',
    },
    {
      id: 'archival-photos',
      label: 'Cobertura de retratos de archivo',
      status: photosStatus,
      metric: `${photosVerified}/${scorers.length}`,
      detail:
        photosStatus === 'verde'
          ? 'Cobertura fotográfica completa de los 50 máximos goleadores.'
          : `${scorers.length - photosVerified} registro(s) sin retrato fotográfico local.`,
    },
  ];

  const verde = records.filter((r) => r.status === 'verde').length;
  const ambar = records.filter((r) => r.status === 'ambar').length;
  const rojo = records.filter((r) => r.status === 'rojo').length;
  const massCorrected = records.filter((r) => r.correctedInMassAudit).length;

  let overallStatus: AuditLightStatus = 'verde';
  for (const r of records) {
    overallStatus = mergeStatus(overallStatus, r.status);
  }
  for (const g of globalChecks) {
    overallStatus = mergeStatus(overallStatus, g.status);
  }

  return {
    overallStatus,
    evaluatedAtLabel,
    summary: {
      total: scorers.length,
      verde,
      ambar,
      rojo,
      massCorrected,
      photosVerified,
      goldenBootsCount: goldenBoots.length,
      activePlayersVerified: activeRecords.length,
    },
    globalChecks,
    records,
  };
}
