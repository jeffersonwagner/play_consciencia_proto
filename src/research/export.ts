// ============================================================
// EXPORTAÇÃO DOS DADOS DE PESQUISA (funções puras, testadas em
// tests/research.test.ts). Três formatos, descritos em docs/CICLO1.md:
//   - JSON completo: sessão + eventos + save (para auditoria/reanálise);
//   - CSV de eventos: uma linha por evento (trajetórias, tempos);
//   - CSV de resumo: uma linha por participante e protagonista
//     (indicadores prontos para a análise descritiva).
// CSV com separador ";" e BOM UTF-8, para abrir direto no Excel em pt-BR.
// ============================================================

import { scenarios } from '../../content/espelho/scenarios';
import type { Protagonist } from '../../content/types';
import type { SaveData } from '../core/save';
import type { TelemetryEvent } from '../core/telemetry';
import { globalEnding } from '../modes/dossie/rules';
import { dominantProfile, profileCounts } from '../modes/espelho/rules';
import type { ResearchSession } from './session';

export const EXPORT_SCHEMA = 1;

export interface SessionExport {
  schema: number;
  exportedAt: string;
  session: ResearchSession | null;
  events: TelemetryEvent[];
  save: SaveData;
}

export function buildExport(session: ResearchSession | null, events: TelemetryEvent[], save: SaveData, now = new Date()): SessionExport {
  return { schema: EXPORT_SCHEMA, exportedAt: now.toISOString(), session, events, save };
}

// -----------------------------------------
// CSV
// -----------------------------------------
type Cell = string | number | boolean | null | undefined;

function cell(value: Cell): string {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'number' ? String(value).replace('.', ',') : String(value);
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCSV(rows: Record<string, Cell>[], columns?: string[]): string {
  const cols = columns ?? [...new Set(rows.flatMap(r => Object.keys(r)))];
  return [cols.join(';'), ...rows.map(r => cols.map(c => cell(r[c])).join(';'))].join('\r\n') + '\r\n';
}

const EVENT_COLUMNS = [
  'at', 'participant', 'sessionId', 'type', 'protagonist', 'ally', 'scene', 'week', 'slot',
  'action', 'professional', 'scenario', 'choice', 'option', 'profile', 'delta', 'trust', 'wellbeing', 'decisionMs',
] as const;

/** Uma linha por evento; campos fora das colunas fixas vão para "outros" (JSON). */
export function eventsToRows(events: TelemetryEvent[]): Record<string, Cell>[] {
  return events.map(e => {
    const row: Record<string, Cell> = {};
    const rest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(e)) {
      if ((EVENT_COLUMNS as readonly string[]).includes(key)) {
        row[key] = typeof value === 'object' && value !== null ? JSON.stringify(value) : value as Cell;
      } else {
        rest[key] = value;
      }
    }
    row.outros = Object.keys(rest).length ? JSON.stringify(rest) : '';
    return row;
  });
}

export function eventsToCSV(events: TelemetryEvent[]): string {
  return toCSV(eventsToRows(events), [...EVENT_COLUMNS, 'outros']);
}

// -----------------------------------------
// RESUMO POR PARTICIPANTE
// -----------------------------------------

/** Minutos entre o primeiro e o último evento cujo tipo começa com o prefixo. */
export function modeMinutes(events: TelemetryEvent[], prefix: string, protagonist?: string): number | null {
  const times = events
    .filter(e => e.type.startsWith(prefix) && (!protagonist || e.protagonist === undefined || e.protagonist === protagonist))
    .map(e => Date.parse(e.at))
    .filter(t => !Number.isNaN(t));
  if (times.length < 2) return null;
  return Math.round(((Math.max(...times) - Math.min(...times)) / 60000) * 10) / 10;
}

export function summaryRows(
  session: ResearchSession | null,
  save: SaveData,
  events: TelemetryEvent[],
  protagonists: Protagonist[],
): Record<string, Cell>[] {
  const espelho = save.espelho;
  const counts = espelho ? profileCounts(espelho, scenarios) : null;
  const modo4: Record<string, Cell> = {
    m4_concluido: espelho?.completed ?? false,
    m4_perfil: espelho?.completed && counts ? dominantProfile(counts) : '',
    m4_ativo: counts?.ativo ?? '',
    m4_passivo: counts?.passivo ?? '',
    m4_reprodutor: counts?.reprodutor ?? '',
    m4_respostas: espelho
      ? scenarios.filter(s => espelho.answers[s.id] !== undefined)
        .map(s => `${s.id}:${s.options[espelho.answers[s.id]].profile}`).join(' | ')
      : '',
    m4_minutos: modeMinutes(events, 'espelho.'),
  };

  const played = protagonists.filter(p => save.campaigns[p.id]);
  const base = (p?: Protagonist): Record<string, Cell> => ({
    participante: session?.participant ?? '',
    grupo: session?.group ?? '',
    sessao: session?.sessionId ?? '',
    versao: session?.appVersion ?? '',
    inicio: session?.startedAt ?? events[0]?.at ?? '',
    protagonista: p?.id ?? '',
  });

  if (played.length === 0) return [{ ...base(), ...modo4 }];

  return played.map(p => {
    const c = save.campaigns[p.id];
    const f = c.fragmentos;
    const m2 = c.ponte;
    const m3 = c.dossie;
    return {
      ...base(p),
      m1_concluido: f?.completed ?? false,
      m1_aliado: f?.ally ?? '',
      m1_flags: f ? Object.entries(f.flags).map(([k, v]) => `${k}=${v}`).join(' | ') : '',
      m1_violencias_vistas: f ? f.choices.filter(x => x.violence).length : '',
      m1_minutos: modeMinutes(events, 'fragmentos.', p.id),
      m2_aliado: m2?.ally ?? '',
      m2_final: m2?.ending ?? '',
      m2_confianca_final: m2?.trust ?? '',
      m2_confianca_semanas: m2 ? m2.trustByWeek.join(' | ') : '',
      m2_vitoria: m2?.victory ?? '',
      m2_cartas: m2 ? m2.cards.join(' | ') : '',
      m2_respostas_positivas: m2 ? m2.log.filter(l => l.delta > 0).length : '',
      m2_respostas_negativas: m2 ? m2.log.filter(l => l.delta < 0).length : '',
      m2_minutos: modeMinutes(events, 'ponte.', p.id),
      m3_final: m3?.ending ?? '',
      m3_bem_estar_inicial: m3?.startWellbeing ?? '',
      m3_bem_estar_final: m3?.wellbeing ?? '',
      m3_etiquetas: m3 ? m3.tags.join(' | ') : '',
      m3_encaminhamentos: m3 ? m3.order.map(a => `${a}:${m3.done[a]}`).join(' | ') : '',
      m3_minutos: modeMinutes(events, 'dossie.', p.id),
      final_global: m3?.ending ? globalEnding(m2?.ending, m3.ending) : '',
      ...modo4,
    };
  });
}

/** Ordem fixa das colunas do resumo: todos os arquivos ficam compatíveis entre si. */
export const SUMMARY_COLUMNS = [
  'participante', 'grupo', 'sessao', 'versao', 'inicio', 'protagonista',
  'm1_concluido', 'm1_aliado', 'm1_flags', 'm1_violencias_vistas', 'm1_minutos',
  'm2_aliado', 'm2_final', 'm2_confianca_final', 'm2_confianca_semanas', 'm2_vitoria', 'm2_cartas',
  'm2_respostas_positivas', 'm2_respostas_negativas', 'm2_minutos',
  'm3_final', 'm3_bem_estar_inicial', 'm3_bem_estar_final', 'm3_etiquetas', 'm3_encaminhamentos', 'm3_minutos',
  'final_global',
  'm4_concluido', 'm4_perfil', 'm4_ativo', 'm4_passivo', 'm4_reprodutor', 'm4_respostas', 'm4_minutos',
];

export function summaryCSV(rows: Record<string, Cell>[]): string {
  return toCSV(rows, SUMMARY_COLUMNS);
}
