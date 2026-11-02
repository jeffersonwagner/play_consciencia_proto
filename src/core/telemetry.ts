// ============================================================
// REGISTRO DE EVENTOS PARA A PESQUISA (DBR)
// Base mínima: cada decisão do jogador vira um evento com horário, para
// análise posterior (tempo de decisão, trajetórias, uso de PA etc.).
// Os dados ficam só no navegador; a exportação (JSON) é feita ao fim da
// sessão pelo pesquisador. Tela de consentimento e código do participante
// entram na Fase 3 do roadmap.
// ============================================================

import { readJSON, writeJSON, type KeyValueStore } from './storage';

const TELEMETRY_KEY = 'play_consciencia_telemetry';

export interface TelemetryEvent {
  at: string;
  type: string;
  [field: string]: unknown;
}

export class Telemetry {
  constructor(private store: KeyValueStore) {}

  track(type: string, data: Record<string, unknown> = {}): void {
    const events = this.events();
    events.push({ at: new Date().toISOString(), type, ...data });
    writeJSON(this.store, TELEMETRY_KEY, events);
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
