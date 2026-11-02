// ============================================================
// MODO 4 — "O ESPELHO"
// Sete situações do cotidiano. Quem joga responde como agiria de
// verdade; não há retorno durante o jogo, só no Relatório de Atitudes.
// ============================================================

import { scenarios } from '../../../content/espelho/scenarios';
import type { EspelhoState, SaveStore } from '../../core/save';
import type { Telemetry } from '../../core/telemetry';
import { byId, el } from '../../ui/dom';
import { renderEspelhoReport } from './report';
import { answer, newEspelho } from './rules';

export interface EspelhoDeps {
  saves: SaveStore;
  telemetry: Telemetry;
  exit(): void;
}

export function startEspelho(fresh: boolean, deps: EspelhoDeps): void {
  const saved = deps.saves.espelho();
  const resume = !fresh && saved && !saved.completed;
  const state = resume ? saved : newEspelho(scenarios);
  deps.saves.setEspelho(state);
  deps.telemetry.track('espelho.start', { resumed: Boolean(resume), order: state.order });
  bindReportActions(deps);
  byId('espelho-screen').classList.remove('hidden');
  const game = new EspelhoGame(state, deps);
  if (resume) game.scenario();
  else game.intro();
}

export function showEspelhoReport(deps: EspelhoDeps): void {
  const state = deps.saves.espelho();
  if (state?.completed) {
    bindReportActions(deps);
    renderEspelhoReport(state);
  }
}

function bindReportActions(deps: EspelhoDeps): void {
  byId('summary-restart').onclick = () => {
    deps.saves.setEspelho(undefined);
    deps.exit();
  };
  byId('summary-menu').onclick = () => deps.exit();
}

class EspelhoGame {
  private root = byId('espelho-screen');
  private shownAt = 0;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(private state: EspelhoState, private deps: EspelhoDeps) {}

  intro(): void {
    this.root.replaceChildren(el('div', { className: 'mirror-card mirror-intro' },
      el('div', { className: 'title-eyebrow' }, 'Modo 4 — O Espelho'),
      el('h1', { className: 'mirror-title' }, 'Agora, é com você.'),
      el('p', { className: 'mirror-text' },
        `Nos modos anteriores, você viveu a história de outras pessoas. Aqui, não há personagem: são ${scenarios.length} situações do dia a dia — no trabalho, em casa, entre amigos, na rua.`),
      el('p', { className: 'mirror-text' },
        'Não há pontuação nem resposta certa durante o jogo. Responda como você agiria de verdade — não como acha que deveria agir. No final, você recebe um Relatório de Atitudes.'),
      el('button', { className: 'primary-button', onclick: () => this.scenario() }, 'Começar'),
    ));
  }

  scenario(): void {
    if (this.state.completed) return this.finished();
    const index = this.state.current;
    const scenario = scenarios[index];
    const order = this.state.order[scenario.id] ?? scenario.options.map((_, i) => i);

    const buttons = order.map((original, shownIndex) => el('button', {
      className: 'mirror-option',
      onclick: () => this.choose(original),
    }, el('span', { className: 'mirror-option-key' }, String(shownIndex + 1)), scenario.options[original].text));

    this.root.replaceChildren(el('div', { className: 'mirror-card' },
      el('div', { className: 'mirror-progress' }, ...scenarios.map((_, i) =>
        el('span', { className: `mirror-dot${i < index ? ' done' : i === index ? ' now' : ''}` }))),
      el('div', { className: 'mirror-setting' }, `${scenario.icon} ${scenario.setting}`),
      el('h1', { className: 'mirror-title' }, scenario.title),
      el('p', { className: 'mirror-text' }, scenario.situation),
      el('div', { className: 'mirror-question' }, 'O que você faz?'),
      el('div', { className: 'mirror-options' }, ...buttons),
      el('div', { className: 'mirror-count' }, `Situação ${index + 1} de ${scenarios.length}`),
    ));

    this.bindKeys(buttons);
    this.shownAt = performance.now();
  }

  private bindKeys(buttons: HTMLButtonElement[]): void {
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    this.keyHandler = e => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select')) return;
      if (/^[1-9]$/.test(e.key)) buttons[Number(e.key) - 1]?.click();
    };
    document.addEventListener('keydown', this.keyHandler);
  }

  private choose(optionIndex: number): void {
    // Ignora cliques/teclas repetidos durante a transição para o próximo cenário
    if (this.root.querySelector('.leaving')) return;
    const scenario = scenarios[this.state.current];
    const decisionMs = performance.now() - this.shownAt;
    answer(this.state, scenarios, optionIndex, decisionMs);
    this.deps.saves.setEspelho(this.state);
    this.deps.telemetry.track('espelho.choice', {
      scenario: scenario.id,
      option: optionIndex,
      profile: scenario.options[optionIndex].profile,
      shownPosition: this.state.order[scenario.id].indexOf(optionIndex) + 1,
      decisionMs: Math.round(decisionMs),
    });

    // Pequena pausa entre as situações, sem retorno sobre a escolha
    this.root.firstElementChild?.classList.add('leaving');
    setTimeout(() => this.scenario(), 350);
  }

  private finished(): void {
    if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
    this.deps.telemetry.track('espelho.end', { answers: this.state.answers });
    this.root.replaceChildren(el('div', { className: 'mirror-card mirror-intro' },
      el('div', { className: 'title-eyebrow' }, 'Modo 4 — O Espelho'),
      el('h1', { className: 'mirror-title' }, 'Obrigado pela sinceridade.'),
      el('p', { className: 'mirror-text' }, 'Seu Relatório de Atitudes mostra como cada escolha do dia a dia fortalece — ou enfraquece — a ponte de apoio para mulheres como Júlia.'),
      el('button', {
        className: 'primary-button',
        onclick: () => {
          this.root.classList.add('hidden');
          renderEspelhoReport(this.state);
        },
      }, 'Ver Relatório de Atitudes'),
    ));
  }
}
