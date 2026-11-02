// ============================================================
// REGISTRO DE EVENTOS PARA A PESQUISA (DBR)
// Base mínima: cada decisão do jogador vira um evento com horário, para
// análise posterior (tempo de decisão, trajetórias, uso de PA etc.).
// Os eventos ficam no navegador. Na build de pesquisa, o módulo
// src/research acrescenta o código do participante a cada evento e o
// envia automaticamente para a planilha da coleta (ver docs/COLETA.md).
// ============================================================

import { readJSON, writeJSON, type KeyValueStore } from './storage';

const TELEMETRY_KEY = 'play_consciencia_telemetry';

export interface TelemetryEvent {
  at: string;
  type: string;
  [field: string]: unknown;
}

export class Telemetry {
  /** Campos fixos acrescentados a todo evento (ex.: código do participante). */
  context: () => Record<string, unknown> = () => ({});
  private listeners: ((event: TelemetryEvent) => void)[] = [];

  constructor(private store: KeyValueStore) {}

  /** Avisa a cada evento registrado (usado pelo envio automático da pesquisa). */
  onTrack(listener: (event: TelemetryEvent) => void): void {
    this.listeners.push(listener);
  }

  track(type: string, data: Record<string, unknown> = {}): void {
    const event: TelemetryEvent = { at: new Date().toISOString(), type, ...this.context(), ...data };
    const events = this.events();
    events.push(event);
    writeJSON(this.store, TELEMETRY_KEY, events);
    for (const listener of this.listeners) listener(event);
  }

  events(): TelemetryEvent[] {
    return readJSON<TelemetryEvent[]>(this.store, TELEMETRY_KEY) ?? [];
  }

  clear(): void {
    this.store.removeItem(TELEMETRY_KEY);
  }

  /** Baixa os eventos como arquivo JSON. */
  download(filename = `play-consciencia-${Date.now()}.json`): void {
    const blob = new Blob([JSON.stringify(this.events(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
