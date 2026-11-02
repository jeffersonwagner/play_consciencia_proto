// Tela de resumo ao fim do Modo 1: escolhas por cena, violências
// identificadas, aliado escolhido para o Modo 2 e nota pedagógica.

import type { Protagonist } from '../../../content/types';
import type { FragmentosState } from '../../core/save';
import { byId, el } from '../../ui/dom';

export function renderSummary(protagonist: Protagonist, state: FragmentosState): void {
  const content = protagonist.fragmentos!;
  byId('summary-subtitle').textContent = `Modo 1 — Fragmentos · História de ${protagonist.name}`;

  // Agrupa por cena, na ordem em que aconteceram
  const grouped = new Map<string, FragmentosState['choices']>();
  for (const c of state.choices) {
    const key = c.sceneLabel || c.scene;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  const sections: HTMLElement[] = [];
  for (const [sceneLabel, records] of grouped) {
    sections.push(el('div', { className: 'summary-section' },
      el('div', { className: 'summary-scene-title' }, sceneLabel),
      ...records.flatMap(c => [
        el('div', { className: 'summary-choice' }, `› ${c.choice}`),
        c.violence && el('div', { className: 'summary-violence-block' },
          el('span', { className: 'summary-tag' }, c.violence),
          c.violenceExplanation && el('div', { className: 'summary-violence-explanation' }, c.violenceExplanation),
        ),
      ]),
    ));
  }

  // Aliado
  const ally = state.ally ? content.allies[state.ally] : undefined;
  if (ally) {
    sections.push(el('div', { className: 'summary-section summary-ally' },
      el('div', { className: 'summary-scene-title' }, `Quem acompanha ${protagonist.name} no Modo 2`),
      el('div', { className: 'summary-choice' }, el('strong', {}, ally.name)),
      el('div', { className: 'summary-ally-description' }, ally.description),
    ));
  }

  // Nota final pedagógica
  sections.push(el('div', { className: 'summary-section summary-note' },
    el('div', { className: 'summary-scene-title' }, 'Sobre esta experiência'),
    el('div', { className: 'summary-note-text' }, content.closingNote),
  ));

  byId('summary-content').replaceChildren(...sections);
  byId('stage').style.display = 'none';
  byId('summary-screen').classList.remove('hidden');
}
