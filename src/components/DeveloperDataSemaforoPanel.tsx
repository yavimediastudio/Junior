import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Minus,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import {
  TOP_50_SCORERS_DATA,
  TOP_50_SCORERS_LAST_UPDATED,
} from '../data/topScorers50Data';
import {
  CURRENT_ROSTER,
  GOLDEN_BOOT_WINNERS,
  LEGENDS_DATA,
} from '../data/juniorData';
import {
  AuditLightStatus,
  evaluateScorersDataAudit,
  ScorerAuditRecord,
} from '../utils/scorersAuditLogic';
import { NationalityFlag } from './NationalityFlag';

interface DeveloperDataSemaforoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToScorer: (scorerId: string) => void;
}

type SemaforoFilter = 'todos' | 'verde' | 'corregidos' | 'alertas';

const STATUS_LABELS: Record<AuditLightStatus, string> = {
  verde: 'Validado',
  ambar: 'En revisión',
  rojo: 'Con error',
};

const OVERALL_HEADLINES: Record<AuditLightStatus, string> = {
  verde: 'Integridad verificada',
  ambar: 'Validación con observaciones',
  rojo: 'Inconsistencias detectadas',
};

export const DeveloperDataSemaforoPanel: React.FC<DeveloperDataSemaforoPanelProps> = ({
  isOpen,
  onClose,
  onJumpToScorer,
}) => {
  const [filter, setFilter] = useState<SemaforoFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [runCount, setRunCount] = useState(1);
  const [lastRunTime, setLastRunTime] = useState<string>(() =>
    new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  );

  // Close on Escape key & lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const report = useMemo(() => {
    // Re-evaluate live whenever panel opens or user triggers manual re-validation
    void runCount;
    return evaluateScorersDataAudit(
      TOP_50_SCORERS_DATA,
      LEGENDS_DATA,
      CURRENT_ROSTER,
      GOLDEN_BOOT_WINNERS,
      TOP_50_SCORERS_LAST_UPDATED
    );
  }, [runCount]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return report.records.filter((rec) => {
      if (filter === 'verde' && rec.status !== 'verde') return false;
      if (filter === 'corregidos' && !rec.correctedInMassAudit) return false;
      if (filter === 'alertas' && rec.status === 'verde') return false;

      if (!q) return true;
      const rankStr = String(rec.scorer.rank);
      return (
        rec.scorer.name.toLowerCase().includes(q) ||
        (rec.scorer.nickname?.toLowerCase().includes(q) ?? false) ||
        rec.scorer.nationality.toLowerCase().includes(q) ||
        rec.auditNote.toLowerCase().includes(q) ||
        rankStr === q ||
        `#${rankStr}` === q
      );
    });
  }, [report.records, filter, searchQuery]);

  if (!isOpen) return null;

  const handleRerunAudit = () => {
    setRunCount((c) => c + 1);
    setLastRunTime(
      new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  };

  const alertsCount = report.summary.ambar + report.summary.rojo;

  const renderStatusIcon = (status: AuditLightStatus, sizeClass = 'w-4 h-4') => {
    if (status === 'verde') {
      return <CheckCircle2 className={`${sizeClass} text-emerald-500 shrink-0`} aria-hidden="true" />;
    }
    if (status === 'ambar') {
      return <AlertTriangle className={`${sizeClass} text-amber-500 shrink-0`} aria-hidden="true" />;
    }
    return <XCircle className={`${sizeClass} text-rose-500 shrink-0`} aria-hidden="true" />;
  };

  const renderRowCheckCell = (rec: ScorerAuditRecord, key: ScorerAuditRecord['checks'][number]['key']) => {
    const item = rec.checks.find((c) => c.key === key);
    if (!item || !item.applicable) {
      return (
        <span
          className="inline-flex items-center justify-center text-slate-600"
          title={item?.detail ?? 'No aplica'}
        >
          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">No aplica</span>
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center justify-center"
        title={`${item.label}: ${item.detail}`}
      >
        {renderStatusIcon(item.status, 'w-4 h-4')}
        <span className="sr-only">{STATUS_LABELS[item.status]}</span>
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-stretch justify-center sm:p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-semaforo-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-7xl bg-slate-950 border border-slate-800 sm:rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Top Bar Contract: Breadcrumb left, 2 clean actions right */}
        <header className="px-5 py-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Panel de Desarrollador</span>
              <span aria-hidden="true">/</span>
              <span>Auditoría Dimayor</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-200 font-medium">Semáforo de Datos</span>
            </div>
            <h2
              id="dev-semaforo-title"
              className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5 truncate"
            >
              Semáforo de Datos de Goleadores Históricos
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRerunAudit}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Revalidar datos</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel de desarrollador"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cerrar</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Row 1: Traffic-Light Global Indicator + 4 Tabular KPI Columns */}
          <section
            aria-label="Resumen del Semáforo de Datos"
            className="border border-slate-800 rounded-lg bg-slate-900/70 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              {/* Traffic Light Housing */}
              <div className="lg:col-span-4 p-4 sm:p-5 flex items-center gap-4">
                <div
                  className="flex flex-col items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0"
                  aria-label={`Semáforo global en ${report.overallStatus}`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full transition-opacity ${
                      report.overallStatus === 'rojo'
                        ? 'bg-rose-500 ring-2 ring-rose-500/40'
                        : 'bg-slate-800 opacity-50'
                    }`}
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded-full transition-opacity ${
                      report.overallStatus === 'ambar'
                        ? 'bg-amber-500 ring-2 ring-amber-500/40'
                        : 'bg-slate-800 opacity-50'
                    }`}
                  />
                  <span
                    className={`w-3.5 h-3.5 rounded-full transition-opacity ${
                      report.overallStatus === 'verde'
                        ? 'bg-emerald-500 ring-2 ring-emerald-500/40'
                        : 'bg-slate-800 opacity-50'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {renderStatusIcon(report.overallStatus, 'w-4 h-4')}
                    <span
                      className={`text-sm font-semibold ${
                        report.overallStatus === 'verde'
                          ? 'text-emerald-400'
                          : report.overallStatus === 'ambar'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      Semáforo {report.overallStatus.charAt(0).toUpperCase() + report.overallStatus.slice(1)} ·{' '}
                      {OVERALL_HEADLINES[report.overallStatus]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {report.evaluatedAtLabel} · Última ejecución {lastRunTime}
                  </p>
                </div>
              </div>

              {/* 4 Clean KPI Cells */}
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x divide-slate-800">
                <div className="p-4 sm:p-5">
                  <div className="text-xs text-slate-400">Validados (Verde)</div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold tabular-nums text-emerald-400">
                      {report.summary.verde}/{report.summary.total}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Auditoría aprobada
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="text-xs text-slate-400">En revisión (Ámbar)</div>
                  <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-white">
                    {report.summary.ambar}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Observaciones menores
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="text-xs text-slate-400">Con error (Rojo)</div>
                  <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-white">
                    {report.summary.rojo}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Descuadres críticos
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="text-xs text-slate-400">Corregidos en lote</div>
                  <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-white">
                    {report.summary.massCorrected}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Registros intervenidos
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Row 2: Global Cross-Module Integrity Matrix */}
          <section aria-label="Controles globales de consistencia">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-semibold text-white">
                Controles de Integridad entre Módulos
              </h3>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {report.globalChecks.filter((c) => c.status === 'verde').length}/{report.globalChecks.length} reglas aprobadas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-slate-800 rounded-lg divide-y md:divide-y-0 bg-slate-900/40 overflow-hidden">
              {report.globalChecks.map((check, idx) => (
                <div
                  key={check.id}
                  className={`p-3.5 border-slate-800 ${
                    idx >= 3 ? 'lg:border-t' : ''
                  } ${idx >= 2 ? 'md:border-t lg:border-t-0' : ''} ${
                    idx % 3 !== 0 ? 'lg:border-l' : ''
                  } ${idx % 2 !== 0 ? 'md:border-l lg:border-l-0' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {renderStatusIcon(check.status, 'w-4 h-4')}
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {check.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold tabular-nums text-emerald-400 shrink-0">
                      {check.metric}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {check.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Row 3: Filter Bar & High-Density Top 50 Validation Table */}
          <section aria-label="Detalle de validación de los 50 goleadores">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              {/* Interactive Segmented Filter Controls */}
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                {(
                  [
                    { id: 'todos', label: `Todos (${report.summary.total})` },
                    { id: 'verde', label: `Validados (${report.summary.verde})` },
                    { id: 'corregidos', label: `Corrección masiva (${report.summary.massCorrected})` },
                    { id: 'alertas', label: `Con alertas (${alertsCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      filter === tab.id
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, rango o país..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="border border-slate-800 rounded-lg bg-slate-900/40 p-10 text-center">
                <p className="text-sm font-medium text-slate-200">
                  No se encontraron registros con los filtros aplicados.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {filter === 'alertas'
                    ? 'Todos los 50 registros se encuentran validados en verde sin alertas pendientes.'
                    : 'Prueba ajustando el término de búsqueda o selecciona la vista completa.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('todos');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-[11px] font-semibold text-slate-400">
                        <th className="py-2.5 pl-3 pr-2 w-14">Pos.</th>
                        <th className="py-2.5 px-3 min-w-[220px]">Goleador</th>
                        <th className="py-2.5 px-3 text-right w-24">Goles</th>
                        <th className="py-2.5 px-2 text-center w-16">Torneos</th>
                        <th className="py-2.5 px-2 text-center w-16">Leyenda</th>
                        <th className="py-2.5 px-2 text-center w-16">Plantilla</th>
                        <th className="py-2.5 px-2 text-center w-16">Carrera</th>
                        <th className="py-2.5 px-2 text-center w-16">Botines</th>
                        <th className="py-2.5 px-2 text-center w-14">Foto</th>
                        <th className="py-2.5 px-3 min-w-[240px]">Auditoría y trazabilidad</th>
                        <th className="py-2.5 px-3 text-right w-32">Estado</th>
                        <th className="py-2.5 pl-2 pr-3 text-right w-24">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-xs">
                      {filteredRecords.map((rec) => {
                        const isExpanded = expandedId === rec.scorer.id;
                        return (
                          <React.Fragment key={rec.scorer.id}>
                            <tr className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 pl-3 pr-2 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedId(isExpanded ? null : rec.scorer.id)
                                  }
                                  aria-expanded={isExpanded}
                                  aria-label={`Ver detalle de validación de ${rec.scorer.name}`}
                                  className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                  <span>#{String(rec.scorer.rank).padStart(2, '0')}</span>
                                </button>
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  {rec.scorer.photoUrl ? (
                                    <img
                                      src={rec.scorer.photoUrl}
                                      alt={rec.scorer.name}
                                      referrerPolicy="no-referrer"
                                      className="w-8 h-8 rounded object-cover object-top bg-slate-800 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-300 shrink-0">
                                      #{rec.scorer.rank}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-slate-100 truncate">
                                        {rec.scorer.name}
                                      </span>
                                      <NationalityFlag
                                        countryCode={rec.scorer.countryCode}
                                        nationality={rec.scorer.nationality}
                                        size="sm"
                                      />
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate">
                                      {rec.scorer.periods}
                                      {rec.scorer.matches ? ` · ${rec.scorer.matches} PJ` : ''}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                                <div className="font-semibold text-white">
                                  {rec.scorer.totalGoals}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  L {rec.scorer.breakdown.liga} · I {rec.internationalGoals}
                                </div>
                              </td>

                              <td className="py-2.5 px-2 text-center">
                                {renderRowCheckCell(rec, 'breakdown')}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                {renderRowCheckCell(rec, 'legends')}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                {renderRowCheckCell(rec, 'roster')}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                {renderRowCheckCell(rec, 'timeline')}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                {renderRowCheckCell(rec, 'goldenBoots')}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                {renderRowCheckCell(rec, 'photo')}
                              </td>

                              <td className="py-2.5 px-3 text-[11px] text-slate-300 leading-snug">
                                {rec.correctedInMassAudit ? (
                                  <span className="text-emerald-400 font-medium">
                                    Corregido en auditoría ·{' '}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Verificado · </span>
                                )}
                                <span className="text-slate-300">{rec.auditNote}</span>
                              </td>

                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center justify-end gap-1.5 font-medium ${
                                    rec.status === 'verde'
                                      ? 'text-emerald-400'
                                      : rec.status === 'ambar'
                                        ? 'text-amber-400'
                                        : 'text-rose-400'
                                  }`}
                                >
                                  {renderStatusIcon(rec.status, 'w-4 h-4')}
                                  <span>{STATUS_LABELS[rec.status]}</span>
                                  <span className="font-mono text-[11px] tabular-nums text-slate-400">
                                    ({rec.passedChecks}/{rec.totalApplicableChecks})
                                  </span>
                                </span>
                              </td>

                              <td className="py-2.5 pl-2 pr-3 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onJumpToScorer(rec.scorer.id)}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                                >
                                  <span>Ver</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-slate-950/80">
                                <td colSpan={12} className="px-4 py-3.5 border-t border-slate-800/60">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
                                    {rec.checks.map((check) => (
                                      <div
                                        key={check.key}
                                        className="flex items-start gap-2 text-[11px]"
                                      >
                                        <div className="mt-0.5">
                                          {check.applicable ? (
                                            renderStatusIcon(check.status, 'w-3.5 h-3.5')
                                          ) : (
                                            <Minus
                                              className="w-3.5 h-3.5 text-slate-600 shrink-0"
                                              aria-hidden="true"
                                            />
                                          )}
                                        </div>
                                        <div>
                                          <div className="font-semibold text-slate-200">
                                            {check.label}
                                          </div>
                                          <div className="text-slate-400 leading-relaxed">
                                            {check.detail}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
