// Tela de resumo ao fim do Modo 2: desfecho, evolução da confiança por
// semana, respostas dadas (com o retorno pedagógico) e cartas desbloqueadas.

import { findCard } from '../../../content/shared/cards';
import type { PonteAllyContent, Protagonist } from '../../../content/types';
import type { PonteState } from '../../core/save';
import { byId, el } from '../../ui/dom';

const ENDING_TEXT = {
  positivo: 'Final positivo — a confiança chegou a 100% e a protagonista deu o segundo passo: o registro formal, acompanhada por você.',
  neutro: 'Final neutro — o vínculo se manteve, mas não o bastante para romper o ciclo.',
  negativo: 'Final negativo — a confiança se perdeu e a protagonista se afastou.',
};

const ACTION_NAME = { mensagem: 'Mensagem', ligacao: 'Ligação', visita: 'Encontro', pesquisa: 'Pesquisa' };

export function renderPonteSummary(protagonist: Protagonist, ally: PonteAllyContent, state: PonteState): void {
  byId('summary-subtitle').textContent = `Modo 2 — A Ponte · ${ally.name} e ${protagonist.name}`;

  const sections: HTMLElement[] = [];

  sections.push(el('div', { className: 'summary-section summary-ally' },
    el('div', { className: 'summary-scene-title' }, 'Desfecho'),
    el('div', { className: 'summary-choice' }, ENDING_TEXT[state.ending ?? 'neutro']),
    el('div', { className: 'summary-ally-description' },
      `Confiança final: ${state.trust}% (início: ${ally.startTrust}%).` +
      (state.victory ? ' Você realizou a ação de vitória da semana 4.' : '')),
  ));

  // Evolução da confiança
  const points = [ally.startTrust, ...state.trustByWeek];
  if (state.ending && state.trustByWeek.length < ally.weeks.length) points.push(state.trust);
  sections.push(el('div', { className: 'summary-section' },
    el('div', { className: 'summary-scene-title' }, 'Confiança ao longo das semanas'),
    el('div', { className: 'trust-bars' }, ...points.map((value, i) =>
      el('div', { className: 'trust-bar' },
        el('div', { className: 'trust-bar-fill', style: `height:${value}%` }),
        el('span', { className: 'trust-bar-value' }, `${value}%`),
        el('span', { className: 'trust-bar-label' }, i === 0 ? 'Início' : `Sem. ${i}`),
      ))),
  ));

  // Respostas por semana
  for (const [w, week] of ally.weeks.entries()) {
    if (w > state.week) break;
    const entries = state.log.filter(l => l.week === w);
    sections.push(el('div', { className: 'summary-section' },
      el('div', { className: 'summary-scene-title' }, `Semana ${w + 1} — ${week.title}`),
      entries.length === 0
        ? el('div', { className: 'summary-choice' }, '› Nenhuma conversa nesta semana.')
        : null,
      ...entries.flatMap(e => [
        el('div', { className: 'summary-choice' }, `› ${ACTION_NAME[e.action]}: “${e.choice}”`),
        el('div', { className: 'summary-violence-block' },
          el('span', { className: `summary-tag ${e.delta > 0 ? 'tag-good' : e.delta < 0 ? '' : 'tag-neutral'}` },
            e.delta === 0 ? 'confiança mantida' : `confiança ${e.delta > 0 ? '+' : ''}${e.delta}`),
          el('div', { className: 'summary-violence-explanation' }, e.feedback),
        ),
      ]),
    ));
  }

  // Cartas
  sections.push(el('div', { className: 'summary-section' },
    el('div', { className: 'summary-scene-title' }, 'Cartas de Conhecimento desbloqueadas'),
    state.cards.length === 0
      ? el('div', { className: 'summary-choice' }, '› Nenhuma. Buscar informação faz parte de apoiar alguém.')
      : el('div', {}, ...state.cards.map(id => el('div', { className: 'summary-choice' }, `› ${findCard(id)?.title ?? id}`))),
  ));

  sections.push(el('div', { className: 'summary-section summary-note' },
    el('div', { className: 'summary-scene-title' }, 'Sobre esta experiência'),
    el('div', { className: 'summary-note-text' },
      'Apoiar alguém em uma relação abusiva raramente é resolver o problema por ela. É escutar sem julgar, validar o que ela sente, oferecer ajuda concreta sem pressionar, buscar informação — e continuar presente, mesmo quando ela ainda não está pronta para sair do ciclo.'),
  ));

  byId('summary-content').replaceChildren(...sections);
  byId('summary-screen').classList.remove('hidden');
}
