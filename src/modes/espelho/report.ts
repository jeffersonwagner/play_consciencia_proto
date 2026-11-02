// Relatório de Atitudes (GDD, Modo 4): perfil predominante, reflexão sobre
// cada escolha com o conceito pedagógico, conexão com os outros modos e
// glossário educativo.

import { PROFILES, scenarios } from '../../../content/espelho/scenarios';
import { findTerm, glossary } from '../../../content/shared/glossary';
import type { AttitudeProfile } from '../../../content/types';
import type { EspelhoState } from '../../core/save';
import { byId, el } from '../../ui/dom';
import { dominantProfile, profileCounts } from './rules';

const PROFILE_TAG: Record<AttitudeProfile, string> = {
  ativo: 'aliado ativo',
  passivo: 'observador passivo',
  reprodutor: 'reprodutor de controle',
};

const PROFILE_CLASS: Record<AttitudeProfile, string> = {
  ativo: 'tag-good',
  passivo: 'tag-neutral',
  reprodutor: '',
};

export function renderEspelhoReport(state: EspelhoState): void {
  byId('summary-subtitle').textContent = 'Modo 4 — O Espelho · Relatório de Atitudes';
  const counts = profileCounts(state, scenarios);
  const dominant = dominantProfile(counts);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const sections: HTMLElement[] = [];

  // 1. Análise comportamental
  sections.push(el('div', { className: 'summary-section summary-ally' },
    el('div', { className: 'summary-scene-title' }, 'Análise comportamental'),
    el('div', { className: 'summary-choice' }, el('strong', {}, PROFILES[dominant].title)),
    el('div', { className: 'summary-note-text' }, PROFILES[dominant].description),
    el('div', { className: 'profile-bar' }, ...(Object.keys(counts) as AttitudeProfile[])
      .filter(p => counts[p] > 0)
      .map(p => el('span', {
        className: `profile-segment ${p}`,
        style: `flex:${counts[p]}`,
        title: `${PROFILE_TAG[p]}: ${counts[p]} de ${total}`,
      }, `${counts[p]}`))),
    el('div', { className: 'profile-legend' }, ...(Object.keys(counts) as AttitudeProfile[]).map(p =>
      el('span', { className: `profile-legend-item ${p}` }, `${PROFILES[p].title}: ${counts[p]}`))),
  ));

  // 2. Cada situação: escolha, reflexão, conceito e conexão
  for (const s of scenarios) {
    const i = state.answers[s.id];
    if (i === undefined) continue;
    const option = s.options[i];
    const term = findTerm(s.concept);
    sections.push(el('div', { className: 'summary-section' },
      el('div', { className: 'summary-scene-title' }, `${s.icon} ${s.title}`),
      el('div', { className: 'summary-choice' }, `› ${option.text}`),
      el('div', { className: 'summary-violence-block' },
        el('span', { className: `summary-tag ${PROFILE_CLASS[option.profile]}` }, PROFILE_TAG[option.profile]),
        el('div', { className: 'summary-violence-explanation' }, option.reflection),
      ),
      term && el('div', { className: 'report-concept' }, el('strong', {}, `${term.term}. `), term.definition),
      el('div', { className: 'report-connection' }, s.connection),
    ));
  }

  // 3. Conexão com os outros modos
  sections.push(el('div', { className: 'summary-section summary-note' },
    el('div', { className: 'summary-scene-title' }, 'A ponte de apoio'),
    el('div', { className: 'summary-note-text' },
      'Júlia não foi salva por um gesto heroico. Foi a soma de pequenas atitudes — uma amiga que não julgou, uma escrivã que acreditou, uma colega que devolveu o crédito, alguém que não riu da piada — que formou a ponte. Cada situação deste espelho é uma oportunidade de ser parte dela.'),
  ));

  // 4. Glossário educativo
  sections.push(el('div', { className: 'summary-section' },
    el('div', { className: 'summary-scene-title' }, 'Glossário educativo'),
    el('dl', { className: 'report-glossary' }, ...glossary.flatMap(t => [
      el('dt', {}, t.term),
      el('dd', {}, t.definition),
    ])),
  ));

  byId('summary-content').replaceChildren(...sections);
  byId('summary-screen').classList.remove('hidden');
}
