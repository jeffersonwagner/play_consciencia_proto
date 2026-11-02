// ============================================================
// MODO 3 — REGRAS (funções puras, testadas em tests/dossie.test.ts)
// Classificação, encaminhamentos com plantão e sequenciamento, dilemas,
// bem-estar e finais. Ver docs/MODO3.md.
// ============================================================

import type { DossieAction, DossieContent, DossieEventOption, PonteEnding } from '../../../content/types';
import type { DossieState } from '../../core/save';

export const TAG_CORRECT = 4;
export const TAG_WRONG = -5;
export const TAG_MISSING = -6;
export const WAIT_COST = -3;
export const POSITIVE_THRESHOLD = 80;
export const NEUTRAL_THRESHOLD = 50;

export function newDossie(startWellbeing: number): DossieState {
  return {
    startWellbeing,
    wellbeing: startWellbeing,
    slot: 0,
    tags: [],
    classified: false,
    done: {},
    order: [],
    resolvedEvents: [],
    log: [],
    history: [],
    ending: null,
  };
}

export function startingWellbeing(content: DossieContent, ponteEnding: PonteEnding | null | undefined): number {
  return content.startWellbeing[ponteEnding ?? 'sem-modo2'];
}

function change(state: DossieState, delta: number): number {
  const before = state.wellbeing;
  state.wellbeing = Math.max(0, Math.min(100, state.wellbeing + delta));
  if (state.wellbeing <= 0) state.ending = 'negativo';
  return state.wellbeing - before;
}

// -----------------------------------------
// CLASSIFICAÇÃO
// -----------------------------------------
export function toggleTag(state: DossieState, tagId: string): void {
  if (state.classified) return;
  const i = state.tags.indexOf(tagId);
  if (i >= 0) state.tags.splice(i, 1);
  else state.tags.push(tagId);
}

export interface ClassificationResult {
  correct: string[];
  acceptable: string[];
  wrong: string[];
  missing: string[];
  delta: number;
}

export function evaluateTags(content: DossieContent, tags: string[]): ClassificationResult {
  const correct = tags.filter(t => content.correctTags.includes(t));
  const acceptable = tags.filter(t => content.acceptableTags.includes(t));
  const wrong = tags.filter(t => !content.correctTags.includes(t) && !content.acceptableTags.includes(t));
  const missing = content.correctTags.filter(t => !tags.includes(t));
  const delta = correct.length * TAG_CORRECT + wrong.length * TAG_WRONG + missing.length * TAG_MISSING;
  return { correct, acceptable, wrong, missing, delta };
}

export function concludeClassification(state: DossieState, content: DossieContent): ClassificationResult {
  const result = evaluateTags(content, state.tags);
  const applied = change(state, result.delta);
  state.classified = true;
  state.log.push({
    slot: state.slot,
    kind: 'classificacao',
    title: 'Classificação do caso',
    delta: applied,
    feedback: content.tagsFeedback,
  });
  return { ...result, delta: applied };
}

// -----------------------------------------
// TEMPO E PLANTÃO
// -----------------------------------------
export function isAvailable(content: DossieContent, professionalId: string, slot: number): boolean {
  return content.availability[professionalId]?.includes(slot) ?? false;
}

/** Evento ainda não resolvido do período atual, se houver. */
export function pendingEvent(content: DossieContent, state: DossieState) {
  return content.events.find(e => e.slot === state.slot && !state.resolvedEvents.includes(e.id));
}

export function canAct(state: DossieState, content: DossieContent, action: DossieAction): boolean {
  return state.classified
    && state.ending === null
    && state.slot < content.slots.length
    && !(action.id in state.done)
    && !pendingEvent(content, state);
}

/** Passa para o próximo período; ao fim do último, define o final. */
function advance(state: DossieState, content: DossieContent): void {
  state.history.push(state.wellbeing);
  state.slot++;
  if (state.ending === null && state.slot >= content.slots.length) finish(state);
}

export function finish(state: DossieState): void {
  if (state.ending !== null) return;
  state.ending = state.wellbeing >= POSITIVE_THRESHOLD ? 'positivo'
    : state.wellbeing >= NEUTRAL_THRESHOLD ? 'neutro'
      : 'negativo';
}

// -----------------------------------------
// ENCAMINHAMENTOS, ESPERA E DILEMAS
// -----------------------------------------
export function performAction(state: DossieState, content: DossieContent, action: DossieAction, professional = 'default') {
  if (!canAct(state, content, action)) throw new Error(`Ação indisponível: ${action.id}`);
  if (professional !== 'default' && !isAvailable(content, professional, state.slot)) {
    throw new Error(`${professional} não está de plantão neste período.`);
  }
  const outcome = action.outcomes[professional];
  if (!outcome) throw new Error(`Sem resultado para ${action.id}/${professional}`);

  // Bônus/ônus de sequência: vale se a ação de referência já foi feita
  const bonuses = (action.sequence ?? []).filter(s => s.after in state.done);
  const delta = outcome.delta + bonuses.reduce((sum, s) => sum + s.delta, 0);
  const slot = state.slot;
  const applied = change(state, delta);

  state.done[action.id] = professional;
  state.order.push(action.id);
  state.log.push({
    slot,
    kind: 'acao',
    title: action.label,
    delta: applied,
    feedback: [outcome.feedback, ...bonuses.map(b => b.feedback)].join(' '),
    narration: outcome.narration,
  });
  advance(state, content);
  return { delta: applied, outcome, bonuses };
}

export function wait(state: DossieState, content: DossieContent): number {
  if (!state.classified || state.ending !== null || pendingEvent(content, state)) throw new Error('Não é possível aguardar agora.');
  const slot = state.slot;
  const applied = change(state, WAIT_COST);
  state.log.push({
    slot,
    kind: 'espera',
    title: 'Aguardar',
    delta: applied,
    feedback: 'Cada período sem atendimento prolonga a angústia de quem procurou ajuda.',
  });
  advance(state, content);
  return applied;
}

export function resolveEvent(state: DossieState, content: DossieContent, option: DossieEventOption): number {
  const event = pendingEvent(content, state);
  if (!event) throw new Error('Nenhum dilema pendente.');
  const applied = change(state, option.delta);
  state.resolvedEvents.push(event.id);
  state.log.push({ slot: state.slot, kind: 'evento', title: event.title, delta: applied, feedback: option.feedback, narration: option.text });
  return applied;
}

/** Ações recomendadas pelo GDD que o jogador não fez. */
export function missedRecommended(state: DossieState, content: DossieContent): DossieAction[] {
  return content.actions.filter(a => a.recommended && !(a.id in state.done));
}

// -----------------------------------------
// FINAL GLOBAL (Modos 2 + 3) — matriz em docs/MODO3.md
// -----------------------------------------
export function globalEnding(ponte: PonteEnding | null | undefined, dossie: PonteEnding): PonteEnding {
  if (dossie === 'negativo') return 'negativo';
  if (ponte === 'negativo') return dossie === 'positivo' ? 'neutro' : 'negativo';
  return dossie;
}
