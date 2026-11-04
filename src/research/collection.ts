// ============================================================
// CONFIGURAÇÃO DA COLETA (lida da planilha, aba "Config")
// O pesquisador liga/desliga a coleta e define o período direto na
// planilha, sem gerar nova build. O jogo guarda a última configuração
// lida, para funcionar mesmo se a internet cair durante a sessão.
// O servidor (Apps Script) aplica as mesmas regras ao receber os dados.
// ============================================================

import { readJSON, writeJSON, type KeyValueStore } from '../core/storage';

export const CONFIG_CACHE_KEY = 'play_consciencia_coleta_config';

export interface CollectionConfig {
  ativa: boolean;
  /** Primeiro dia da coleta, "AAAA-MM-DD" (inclusive). */
  inicio: string;
  /** Último dia da coleta, "AAAA-MM-DD" (inclusive, até 23:59). */
  fim: string;
  /** Modos que o participante deve concluir antes do questionário final. */
  modos: number[];
  /** Protagonista da coleta. */
  protagonista: string;
  /** Ciclo de avaliação (1 ou 2): define os questionários aplicados. */
  ciclo: number;
  /** Mensagem opcional exibida quando a coleta não está aberta. */
  mensagem?: string;
}

export type CollectionStatus = 'aberta' | 'antes' | 'encerrada' | 'inativa' | 'indisponivel';

/** Data local no início (00:00) ou no fim (23:59:59.999) do dia. */
export function parseDay(day: string, endOfDay = false): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return d;
}

export function collectionStatus(config: CollectionConfig | null, now = new Date()): CollectionStatus {
  if (!config) return 'indisponivel';
  if (!config.ativa) return 'inativa';
  const start = parseDay(config.inicio);
  const end = parseDay(config.fim, true);
  if (!start || !end) return 'indisponivel';
  if (now < start) return 'antes';
  if (now > end) return 'encerrada';
  return 'aberta';
}

/** Valida e normaliza a resposta do servidor. */
export function parseConfig(raw: unknown): CollectionConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const modos = String(r.modos ?? '1,2').split(/[^\d]+/).map(Number).filter(n => n >= 1 && n <= 4);
  const config: CollectionConfig = {
    ativa: r.ativa === true || /^(sim|true|1)$/i.test(String(r.ativa ?? '')),
    inicio: String(r.inicio ?? ''),
    fim: String(r.fim ?? ''),
    modos: modos.length ? modos : [1, 2],
    protagonista: String(r.protagonista || 'julia'),
    ciclo: Number(r.ciclo) === 2 ? 2 : 1,
    mensagem: r.mensagem ? String(r.mensagem) : undefined,
  };
  // Sem datas válidas a configuração ainda vale: desligada, o jogo abre
  // direto; ligada, collectionStatus() a trata como indisponível
  return config;
}

export interface CachedConfig {
  config: CollectionConfig;
  fetchedAt: string;
}

/**
 * Busca a configuração na planilha (com tempo-limite). Se não conseguir,
 * usa a última guardada; se nunca conseguiu, devolve null ("indisponível").
 */
export async function loadConfig(
  store: KeyValueStore,
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 6000,
): Promise<{ config: CollectionConfig | null; fromCache: boolean }> {
  if (url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${url}${url.includes('?') ? '&' : '?'}acao=config`, { signal: controller.signal });
      const config = parseConfig(await res.json());
      if (config) {
        writeJSON(store, CONFIG_CACHE_KEY, { config, fetchedAt: new Date().toISOString() } satisfies CachedConfig);
        return { config, fromCache: false };
      }
    } catch {
      /* sem conexão — usa a cópia guardada */
    } finally {
      clearTimeout(timer);
    }
  }
  return { config: readJSON<CachedConfig>(store, CONFIG_CACHE_KEY)?.config ?? null, fromCache: true };
}

export function formatDay(day: string): string {
  const d = parseDay(day);
  return d ? d.toLocaleDateString('pt-BR') : day;
}
