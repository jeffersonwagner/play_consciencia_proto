// ============================================================
// ENVIO AUTOMÁTICO PARA A PLANILHA
// Tudo o que deve ir para a planilha entra numa fila guardada no
// navegador e é enviado em lotes. Se a conexão falhar, o lote fica na
// fila e é reenviado depois (inclusive em outra abertura do jogo).
// Cada lote tem um id: o servidor ignora lotes repetidos, então reenviar
// nunca duplica linhas. Lotes recusados pelo servidor (ex.: fora do
// período) saem da fila e ficam registrados, para auditoria.
// ============================================================

import { readJSON, writeJSON, type KeyValueStore } from '../core/storage';

export const QUEUE_KEY = 'play_consciencia_fila';
export const REJECTED_KEY = 'play_consciencia_recusados';

/** Abas da planilha que recebem dados. */
export type BatchKind = 'eventos' | 'respostas' | 'participantes';

export type Row = Record<string, string | number | boolean | null>;

export interface Batch {
  id: string;
  kind: BatchKind;
  rows: Row[];
  /** Lote fechado: não recebe mais linhas (já pode ter sido tentado). */
  sealed: boolean;
  /** Dados da sessão que o servidor usa para conferir o período. */
  session: { participant: string; startedAt: string };
}

export type SendResult = 'ok' | 'retry' | 'rejected';
export type Sender = (batch: Batch) => Promise<{ result: SendResult; reason?: string }>;

const MAX_ROWS = 150;

function batchId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class SyncQueue {
  private flushing: Promise<{ sent: number; pending: number }> | null = null;
  lastSentAt: string | null = null;
  lastError: string | null = null;

  constructor(private store: KeyValueStore, private sender: Sender) {}

  pending(): Batch[] {
    return readJSON<Batch[]>(this.store, QUEUE_KEY) ?? [];
  }

  rejected(): (Batch & { reason?: string })[] {
    return readJSON(this.store, REJECTED_KEY) ?? [];
  }

  private save(batches: Batch[]): void {
    writeJSON(this.store, QUEUE_KEY, batches);
  }

  /**
   * Acrescenta linhas. Eventos e respostas se juntam no último lote aberto
   * do mesmo tipo; o resumo do participante sempre vai em lote próprio
   * (o servidor substitui a linha anterior do participante).
   */
  enqueue(kind: BatchKind, rows: Row[], session: Batch['session']): void {
    if (rows.length === 0) return;
    const batches = this.pending();
    const last = batches[batches.length - 1];
    if (kind !== 'participantes' && last && !last.sealed && last.kind === kind
      && last.session.participant === session.participant && last.rows.length + rows.length <= MAX_ROWS) {
      last.rows.push(...rows);
    } else {
      batches.push({ id: batchId(), kind, rows, sealed: false, session });
    }
    this.save(batches);
  }

  /** Envia a fila em ordem. Para no primeiro erro de conexão (tenta de novo depois). */
  flush(): Promise<{ sent: number; pending: number }> {
    this.flushing ??= this.doFlush().finally(() => { this.flushing = null; });
    return this.flushing;
  }

  private async doFlush(): Promise<{ sent: number; pending: number }> {
    // Fecha os lotes atuais: linhas novas vão para lotes novos
    this.save(this.pending().map(b => ({ ...b, sealed: true })));
    let sent = 0;
    for (const batch of this.pending()) {
      const { result, reason } = await this.sender(batch);
      if (result === 'retry') {
        this.lastError = reason ?? 'sem conexão';
        break;
      }
      if (result === 'rejected') {
        writeJSON(this.store, REJECTED_KEY, [...this.rejected(), { ...batch, reason }]);
        this.lastError = reason ?? 'recusado pelo servidor';
      } else {
        sent++;
        this.lastSentAt = new Date().toISOString();
        this.lastError = null;
      }
      this.save(this.pending().filter(b => b.id !== batch.id));
    }
    return { sent, pending: this.pending().length };
  }
}

/**
 * Envio para o Apps Script da planilha. Usa "text/plain" para evitar a
 * verificação prévia de CORS (o Apps Script não responde a ela).
 */
export function appsScriptSender(url: string, token: string, fetchImpl: typeof fetch = fetch): Sender {
  return async batch => {
    if (!url) return { result: 'retry', reason: 'endereço da planilha não configurado' };
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ acao: 'gravar', token, lote: batch }),
      });
      const body = await res.json() as { ok?: boolean; erro?: string; tentar_novamente?: boolean };
      if (body.ok) return { result: 'ok' };
      if (body.tentar_novamente) return { result: 'retry', reason: body.erro };
      // Recusas definitivas (período, token, formato) não adianta reenviar
      return { result: 'rejected', reason: body.erro ?? 'recusado' };
    } catch (err) {
      return { result: 'retry', reason: err instanceof Error ? err.message : 'sem conexão' };
    }
  };
}
