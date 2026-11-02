// Resumo do Modo 3: desfecho, bem-estar por período, linha do tempo com
// o retorno pedagógico, encaminhamentos recomendados que faltaram e o
// final global da protagonista (Modos 2 + 3).

import { findProfessional } from '../../../content/shared/professionals';
import type { DossieContent, PonteEnding, Protagonist } from '../../../content/types';
import type { DossieState } from '../../core/save';
import { byId, el } from '../../ui/dom';
import { globalEnding, missedRecommended } from './rules';

const ENDING_TEXT: Record<PonteEnding, string> = {
  positivo: 'Final positivo — bem-estar de 80% ou mais: a vítima rompe o ciclo com segurança.',
  neutro: 'Final neutro — bem-estar entre 50% e 79%: ela buscou ajuda, mas houve falhas na proteção.',
  negativo: 'Final negativo — bem-estar abaixo de 50%: retaliação ou desistência por falta de acolhimento.',
};

const GLOBAL_TITLE: Record<PonteEnding, string> = {
  positivo: 'Final global positivo',
  neutro: 'Final global neutro',
  negativo: 'Final global negativo',
};

export function renderDossieSummary(protagonist: Protagonist, content: DossieContent, state: DossieState, ponteEnding: PonteEnding | null): void {
  byId('summary-subtitle').textContent = `Modo 3 — Dossiê 180 · Caso de ${protagonist.name}`;
  const ending = state.ending ?? 'neutro';
  const sections: HTMLElement[] = [];

  sections.push(el('div', { className: 'summary-section summary-ally' },
    el('div', { className: 'summary-scene-title' }, 'Desfecho do caso'),
    el('div', { className: 'summary-choice' }, ENDING_TEXT[ending]),
    el('div', { className: 'summary-ally-description' }, `Bem-estar final: ${state.wellbeing}% (início: ${state.startWellbeing}%).`),
  ));

  const points = [state.startWellbeing, ...state.history];
  if (points[points.length - 1] !== state.wellbeing) points.push(state.wellbeing);
  sections.push(el('div', { className: 'summary-section' },
    el('div', { className: 'summary-scene-title' }, 'Bem-estar ao longo do caso'),
    el('div', { className: 'trust-bars' }, ...points.map((value, i) =>
      el('div', { className: 'trust-bar' },
        el('div', { className: 'trust-bar-fill', style: `height:${value}%` }),
        el('span', { className: 'trust-bar-value' }, `${value}%`),
        el('span', { className: 'trust-bar-label' }, i === 0 ? 'Início' : content.slots[i - 1]?.replace(' · ', ' ') ?? 'Fim'),
      ))),
  ));

  sections.push(el('div', { className: 'summary-section' },
    el('div', { className: 'summary-scene-title' }, 'Linha do tempo'),
    ...state.log.flatMap(l => {
      const action = content.actions.find(a => a.label === l.title);
      const prof = action && state.done[action.id] !== 'default' ? findProfessional(state.done[action.id])?.name : null;
      return [
        el('div', { className: 'summary-choice' }, `› ${content.slots[l.slot] ?? ''} — ${l.title}${prof ? ` (${prof})` : ''}`),
        el('div', { className: 'summary-violence-block' },
          el('span', { className: `summary-tag ${l.delta > 0 ? 'tag-good' : l.delta < 0 ? '' : 'tag-neutral'}` },
            l.delta === 0 ? 'bem-estar mantido' : `bem-estar ${l.delta > 0 ? '+' : ''}${l.delta}`),
          el('div', { className: 'summary-violence-explanation' }, l.feedback),
        ),
      ];
    }),
  ));

  const missed = missedRecommended(state, content);
  if (missed.length) {
    sections.push(el('div', { className: 'summary-section' },
      el('div', { className: 'summary-scene-title' }, 'Encaminhamentos recomendados que ficaram de fora'),
      ...missed.map(a => el('div', { className: 'summary-choice' }, `› ${a.icon} ${a.label}`)),
    ));
  }

  const global = globalEnding(ponteEnding, ending);
  sections.push(el('div', { className: 'summary-section summary-note' },
    el('div', { className: 'summary-scene-title' }, `${GLOBAL_TITLE[global]} — a história de ${protagonist.name}`),
    el('div', { className: 'summary-note-text' }, content.globalEndings[global]),
    el('div', { className: 'summary-ally-description' },
      ponteEnding ? `Combina o final do Modo 2 (${ponteEnding}) com o do Modo 3 (${ending}).` : `Modo 2 não concluído (só possível no modo dev); considerado só o Modo 3 (${ending}).`),
  ));

  byId('summary-content').replaceChildren(...sections);
  byId('summary-screen').classList.remove('hidden');
}
