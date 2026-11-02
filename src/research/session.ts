// ============================================================
// SESSÃO DE PESQUISA (participação de uma pessoa)
// O participante é identificado só por um código gerado pelo jogo
// (ex.: PNC-7K3Q) — nunca por nome, e-mail ou outro dado pessoal.
// O aceite do TCLE é registrado com data, hora e versão do termo.
// Ao terminar (ou ao iniciar outra participação no mesmo computador),
// a sessão vai para um arquivo local de segurança.
// ============================================================

import { readJSON, writeJSON, type KeyValueStore } from '../core/storage';
import type { TelemetryEvent } from '../core/telemetry';

export const SESSION_KEY = 'play_consciencia_session';
export const ARCHIVE_KEY = 'play_consciencia_archive';

export interface ResearchSession {
  participant: string;
  /** Turma/grupo, vindo do link (?grupo=...). */
  group: string;
  sessionId: string;
  startedAt: string;
  appVersion: string;
  consent: { acceptedAt: string; tcleVersion: string };
  /** Modos e protagonista exigidos, copiados da configuração no início. */
  requiredModes: number[];
  protagonist: string;
  /** Ciclo de avaliação (1 ou 2), copiado da configuração no início. */
  cycle: number;
  /** Autorização de gravação da entrevista em áudio ("Sim"/"Não"), do TCLE. */
  audioConsent: string;
  /** Acertos nos itens de conhecimento (ex.: "7/9"). */
  preScore?: string;
  postScore?: string;
  preDoneAt?: string;
  postDoneAt?: string;
  finishedAt?: string;
}

/** Sessão encerrada, guardada com seus dados (cópia de segurança local). */
export interface ArchivedSession {
  session: ResearchSession;
  endedAt: string;
  events: TelemetryEvent[];
  save: unknown;
}

/** Sem letras e números que se confundem (O/0, I/1, L). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCode(random: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 4; i++) code += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return `PNC-${code}`;
}

/** Grupo vindo do link: só letras, números, espaço e hífen, até 40 caracteres. */
export function sanitizeGroup(raw: string | null): string {
  return (raw ?? '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 40);
}

export function newSession(opts: {
  code: string;
  group: string;
  appVersion: string;
  tcleVersion: string;
  requiredModes: number[];
  protagonist: string;
  cycle: number;
  audioConsent: string;
  now?: Date;
}): ResearchSession {
  const now = opts.now ?? new Date();
  return {
    participant: opts.code,
    group: opts.group,
    sessionId: `${opts.code}-${now.toISOString().replace(/[-:]/g, '').slice(0, 15)}`,
    startedAt: now.toISOString(),
    appVersion: opts.appVersion,
    consent: { acceptedAt: now.toISOString(), tcleVersion: opts.tcleVersion },
    requiredModes: opts.requiredModes,
    protagonist: opts.protagonist,
    cycle: opts.cycle,
    audioConsent: opts.audioConsent,
  };
}

export class SessionStore {
  constructor(private store: KeyValueStore) {}

  current(): ResearchSession | null {
    return readJSON<ResearchSession>(this.store, SESSION_KEY);
  }

  start(session: ResearchSession): void {
    writeJSON(this.store, SESSION_KEY, session);
  }

  update(change: (s: ResearchSession) => void): ResearchSession | null {
    const s = this.current();
    if (!s) return null;
    change(s);
    writeJSON(this.store, SESSION_KEY, s);
    return s;
  }

  archive(): ArchivedSession[] {
    return readJSON<ArchivedSession[]>(this.store, ARCHIVE_KEY) ?? [];
  }

  /** Guarda a sessão atual (com eventos e save) no arquivo local e a encerra. */
  close(events: TelemetryEvent[], save: unknown, now = new Date()): ArchivedSession | null {
    const session = this.current();
    if (!session) return null;
    const entry: ArchivedSession = { session, endedAt: now.toISOString(), events, save };
    writeJSON(this.store, ARCHIVE_KEY, [...this.archive(), entry]);
    this.store.removeItem(SESSION_KEY);
    return entry;
  }
}
