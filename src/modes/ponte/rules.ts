// ============================================================
// MODO 2 — REGRAS (funções puras, testadas em tests/ponte.test.ts)
// Confiança, Pontos de Ação, semanas e finais. Os números gerais ficam
// aqui; a variação de cada resposta fica no conteúdo. Ver docs/MODO2.md.
// ============================================================

import type { PonteOption } from '../../../content/types';
import type { PonteActionId, PonteState } from '../../core/save';

export const WEEKS = 4;
export const AP_PER_WEEK = 3;
/** Confiança mínima, ao fim da semana 4, para o final neutro. */
export const NEUTRAL_THRESHOLD = 50;

export const ACTION_COST: Record<PonteActionId, number> = {
  mensagem: 1,
  ligacao: 2,
  visita: 3,
  pesquisa: 1,
};

export function newPonte(ally: string, startTrust: number): PonteState {
  return {
    ally,
    trust: startTrust,
    week: 0,
    ap: AP_PER_WEEK,
    used: [],
    cards: [],
    chat: [],
    log: [],
    trustByWeek: [],
    victory: false,
    ending: null,
  };
}

export function canDo(state: PonteState, action: PonteActionId): boolean {
  return state.ending === null && !state.used.includes(action) && state.ap >= ACTION_COST[action];
}

/** Desconta os PA e marca a ação como usada na semana. */
export function spend(state: PonteState, action: PonteActionId): void {
  if (!canDo(state, action)) throw new Error(`Ação indisponível: ${action}`);
  state.ap -= ACTION_COST[action];
  state.used.push(action);
}

/** Opções visíveis: as que exigem carta só aparecem com a carta desbloqueada. */
export function visibleOptions(options: PonteOption[], cards: string[]): PonteOption[] {
  return options.filter(o => !o.requiresCard || cards.includes(o.requiresCard));
}

export function clampTrust(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Aplica a resposta escolhida. Confiança em 100 ou 0 encerra o modo na hora. */
export function applyOption(state: PonteState, action: PonteActionId, option: PonteOption): void {
  const before = state.trust;
  state.trust = clampTrust(state.trust + option.delta);
  if (option.victory) state.victory = true;
  state.log.push({
    week: state.week,
    action,
    choice: option.text,
    // Variação efetiva (já limitada a 0–100), igual à mostrada ao jogador
    delta: state.trust - before,
    trustAfter: state.trust,
    feedback: option.feedback,
  });
  if (state.trust >= 100) state.ending = 'positivo';
  else if (state.trust <= 0) state.ending = 'negativo';
}

export function unlockCard(state: PonteState, cardId: string): void {
  if (!state.cards.includes(cardId)) state.cards.push(cardId);
}

/** Encerra a semana. Ao fim da última, define o final pela confiança. */
export function endWeek(state: PonteState): void {
  if (state.ending !== null) return;
  state.trustByWeek.push(state.trust);
  if (state.week >= WEEKS - 1) {
    state.ending = state.trust >= NEUTRAL_THRESHOLD ? 'neutro' : 'negativo';
    return;
  }
  state.week++;
  state.ap = AP_PER_WEEK;
  state.used = [];
}
