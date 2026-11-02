// ============================================================
// ESTADO PERSISTENTE DO JOGO
// Uma "campanha" por protagonista guarda o progresso de cada modo, para
// que o Modo 2 e o Modo 3 possam ler o que aconteceu no Modo 1.
// O formato é versionado: ao mudar a estrutura, incremente SAVE_VERSION
// e trate a conversão em migrate().
// ============================================================

import type { FlagValue } from '../engine/vn/types';
import { readJSON, writeJSON, type KeyValueStore } from './storage';

export const SAVE_KEY = 'play_consciencia_save';
export const SAVE_VERSION = 1;

export interface ChoiceRecord {
  scene: string;
  sceneLabel: string;
  choice: string;
  violence: string | null;
  violenceExplanation: string | null;
  /** true quando veio de uma fala/narração marcada, e não de uma escolha. */
  isNarrative?: boolean;
}

export interface FragmentosState {
  currentScene: string;
  blockIndex: number;
  choices: ChoiceRecord[];
  flags: Record<string, FlagValue>;
  ally: string | null;
  completed: boolean;
}

export type PonteActionId = 'mensagem' | 'ligacao' | 'visita' | 'pesquisa';

/** Mensagem exibida no histórico do celular. */
export interface PonteChatEntry {
  from: 'protagonista' | 'jogador' | 'narrador';
  text: string;
  week: number;
  channel: PonteActionId | 'evento' | 'final';
}

/** Uma resposta dada pelo jogador, para o resumo e para a pesquisa. */
export interface PonteLogEntry {
  week: number;
  action: PonteActionId;
  choice: string;
  delta: number;
  trustAfter: number;
  feedback: string;
}

export interface PonteState {
  ally: string;
  trust: number;
  /** Semana atual, a partir de 0. */
  week: number;
  ap: number;
  /** Ações já usadas na semana atual. */
  used: PonteActionId[];
  cards: string[];
  chat: PonteChatEntry[];
  log: PonteLogEntry[];
  /** Confiança ao fim de cada semana encerrada. */
  trustByWeek: number[];
  victory: boolean;
  ending: 'positivo' | 'neutro' | 'negativo' | null;
}

/** Um registro na linha do tempo do caso (classificação, encaminhamento, dilema, espera). */
export interface DossieLogEntry {
  slot: number;
  kind: 'classificacao' | 'acao' | 'evento' | 'espera';
  title: string;
  delta: number;
  feedback: string;
  narration?: string;
}

export interface DossieState {
  startWellbeing: number;
  wellbeing: number;
  /** Período atual (índice em DossieContent.slots). */
  slot: number;
  tags: string[];
  classified: boolean;
  /** Ações já realizadas: id da ação → profissional (ou 'default'). */
  done: Record<string, string>;
  /** Ordem em que as ações foram feitas (para o sequenciamento). */
  order: string[];
  resolvedEvents: string[];
  log: DossieLogEntry[];
  /** Bem-estar ao fim de cada período. */
  history: number[];
  ending: 'positivo' | 'neutro' | 'negativo' | null;
}

export interface Campaign {
  protagonist: string;
  fragmentos?: FragmentosState;
  ponte?: PonteState;
  dossie?: DossieState;
}

export interface SaveData {
  version: number;
  campaigns: Record<string, Campaign>;
}

export function emptySave(): SaveData {
  return { version: SAVE_VERSION, campaigns: {} };
}

export function newFragmentos(start: string): FragmentosState {
  return { currentScene: start, blockIndex: 0, choices: [], flags: {}, ally: null, completed: false };
}

/** Converte saves antigos; descarta o que não reconhece. */
export function migrate(raw: unknown): SaveData {
  if (!raw || typeof raw !== 'object') return emptySave();
  const data = raw as Partial<SaveData>;
  if (data.version !== SAVE_VERSION || typeof data.campaigns !== 'object' || data.campaigns === null) {
    return emptySave();
  }
  return { version: SAVE_VERSION, campaigns: data.campaigns };
}

export class SaveStore {
  private data: SaveData;

  constructor(private store: KeyValueStore) {
    this.data = migrate(readJSON(store, SAVE_KEY));
  }

  campaign(protagonist: string): Campaign {
    return this.data.campaigns[protagonist] ?? { protagonist };
  }

  updateCampaign(protagonist: string, change: (c: Campaign) => void): Campaign {
    const campaign = this.campaign(protagonist);
    change(campaign);
    this.data.campaigns[protagonist] = campaign;
    writeJSON(this.store, SAVE_KEY, this.data);
    return campaign;
  }

  resetCampaign(protagonist: string): void {
    delete this.data.campaigns[protagonist];
    writeJSON(this.store, SAVE_KEY, this.data);
  }
}
