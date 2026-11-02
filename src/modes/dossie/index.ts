// ============================================================
// MODO 3 — "DOSSIÊ 180"
// Mesa de trabalho: dossiê no centro, etiquetas de violência à direita,
// rede de profissionais à esquerda, encaminhamentos embaixo.
// Regras em ./rules.ts; o caso de cada protagonista vem do conteúdo.
// ============================================================

import { findProfessional } from '../../../content/shared/professionals';
import { violenceTypes } from '../../../content/shared/violence-types';
import type { DossieAction, DossieContent, DossieContext, Protagonist } from '../../../content/types';
import { assetPath, assetUrl } from '../../core/assets';
import type { Campaign, DossieState, SaveStore } from '../../core/save';
import type { Telemetry } from '../../core/telemetry';
import { confirmDialog } from '../../ui/confirm';
import { byId, el } from '../../ui/dom';
import {
  canAct, concludeClassification, finish, isAvailable, newDossie, pendingEvent,
  performAction, resolveEvent, startingWellbeing, toggleTag, wait,
} from './rules';
import { renderDossieSummary } from './summary';

export interface DossieDeps {
  saves: SaveStore;
  telemetry: Telemetry;
  exit(): void;
}

/** Monta o contexto do dossiê a partir do que aconteceu nos Modos 1 e 2. */
export function dossieContext(protagonist: Protagonist, campaign: Campaign): DossieContext {
  const ally = campaign.ponte?.ally ?? campaign.fragmentos?.ally ?? null;
  return {
    flags: campaign.fragmentos?.flags ?? {},
    ally,
    allyName: ally ? protagonist.ponte?.allies[ally]?.name ?? null : null,
    ponteEnding: campaign.ponte?.ending ?? null,
  };
}

export function startDossie(protagonist: Protagonist, fresh: boolean, deps: DossieDeps): void {
  const content = protagonist.dossie;
  if (!content) throw new Error(`${protagonist.name} ainda não tem o Modo 3.`);
  const campaign = deps.saves.campaign(protagonist.id);
  const saved = campaign.dossie;
  const resume = !fresh && saved && saved.ending === null;
  const state = resume ? saved : newDossie(startingWellbeing(content, campaign.ponte?.ending));

  deps.telemetry.track('dossie.start', { protagonist: protagonist.id, resumed: Boolean(resume), wellbeing: state.wellbeing });
  bindSummaryActions(protagonist, deps);
  byId('dossie-screen').classList.remove('hidden');
  new DossieDesk(protagonist, content, state, dossieContext(protagonist, campaign), deps).render(!resume);
}

export function showDossieSummary(protagonist: Protagonist, deps: DossieDeps): void {
  const campaign = deps.saves.campaign(protagonist.id);
  if (campaign.dossie?.ending && protagonist.dossie) {
    bindSummaryActions(protagonist, deps);
    renderDossieSummary(protagonist, protagonist.dossie, campaign.dossie, campaign.ponte?.ending ?? null);
  }
}

function bindSummaryActions(protagonist: Protagonist, deps: DossieDeps): void {
  byId('summary-restart').onclick = () => {
    deps.saves.updateCampaign(protagonist.id, c => { delete c.dossie; });
    deps.exit();
  };
  byId('summary-menu').onclick = () => deps.exit();
}

class DossieDesk {
  private root = byId('dossie-screen');
  private showIntro = false;
  /** Último resultado, mostrado em destaque até a próxima jogada. */
  private flash: { title: string; delta: number; text: string; narration?: string } | null = null;

  constructor(
    private protagonist: Protagonist,
    private content: DossieContent,
    private state: DossieState,
    private ctx: DossieContext,
    private deps: DossieDeps,
  ) {}

  private save(): void {
    this.deps.saves.updateCampaign(this.protagonist.id, c => { c.dossie = this.state; });
  }

  private track(type: string, data: Record<string, unknown> = {}): void {
    this.deps.telemetry.track(`dossie.${type}`, {
      protagonist: this.protagonist.id, slot: this.state.slot, wellbeing: this.state.wellbeing, ...data,
    });
  }

  render(intro = false): void {
    if (intro) this.showIntro = true;
    if (this.state.ending) return this.ending();

    const slotLabel = this.content.slots[this.state.slot] ?? 'Fim do prazo';
    this.root.replaceChildren(
      el('header', { className: 'desk-top' },
        el('div', { className: 'desk-case' },
          el('span', { className: 'desk-case-number' }, this.content.caseNumber),
          el('strong', {}, `${this.protagonist.name}, ${this.protagonist.age} anos`)),
        el('div', { className: 'desk-time' },
          el('span', { className: 'desk-label' }, 'Período'),
          el('strong', {}, slotLabel),
          el('div', { className: 'desk-slots' }, ...this.content.slots.map((_, i) =>
            el('span', { className: `desk-slot${i < this.state.slot ? ' past' : i === this.state.slot ? ' now' : ''}` })))),
        wellbeingMeter(this.state.wellbeing),
      ),
      el('div', { className: 'desk-main' },
        this.network(),
        this.dossier(),
        this.tagsPanel(),
      ),
      this.actionBar(),
    );

    if (this.showIntro) this.modal(this.introModal());
    else {
      const event = pendingEvent(this.content, this.state);
      if (event && this.state.classified) this.modal(this.eventModal(event));
    }
  }

  // -----------------------------------------
  // PAINEL ESQUERDO — REDE DE PROFISSIONAIS
  // -----------------------------------------
  private network(): HTMLElement {
    return el('aside', { className: 'desk-panel desk-network' },
      el('h2', { className: 'desk-panel-title' }, 'Rede de profissionais'),
      ...Object.keys(this.content.availability).map(id => {
        const p = findProfessional(id)!;
        const now = isAvailable(this.content, id, this.state.slot);
        const next = this.content.availability[id].find(s => s > this.state.slot);
        return el('div', { className: `pro-card ${p.stance}${now ? '' : ' off'}` },
          proAvatar(p.name, p.sprite),
          el('div', { className: 'pro-info' },
            el('strong', {}, p.name),
            el('span', { className: 'pro-role' }, p.role),
            el('span', { className: 'pro-trait' }, p.trait),
            el('span', { className: 'pro-shift' }, now ? '● De plantão agora'
              : next !== undefined ? `Plantão a partir de ${this.content.slots[next]}` : 'Sem plantão no prazo do caso'),
          ));
      }),
    );
  }

  // -----------------------------------------
  // CENTRO — DOSSIÊ
  // -----------------------------------------
  private dossier(): HTMLElement {
    const drop = el('div', { className: `tag-drop${this.state.classified ? ' locked' : ''}` },
      this.state.tags.length === 0
        ? el('span', { className: 'tag-drop-hint' }, this.state.classified ? 'Nenhuma etiqueta aplicada.' : 'Arraste etiquetas para cá — ou clique nelas no painel de etiquetas.')
        : null,
      ...this.state.tags.map(id => el('button', {
        className: 'tag-chip applied',
        disabled: this.state.classified,
        title: this.state.classified ? '' : 'Remover etiqueta',
        onclick: () => this.toggle(id),
      }, violenceTypes.find(v => v.id === id)?.label ?? id, !this.state.classified && ' ✕')),
    );
    drop.addEventListener('dragover', e => { if (!this.state.classified) { e.preventDefault(); drop.classList.add('over'); } });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer?.getData('text/plain');
      if (id && !this.state.tags.includes(id)) this.toggle(id);
    });

    return el('section', { className: 'desk-panel desk-dossier' },
      el('h2', { className: 'desk-panel-title' }, 'Dossiê'),
      // Resultado da última decisão fica no topo, à vista
      this.flash && el('div', { className: `desk-flash ${this.flash.delta > 0 ? 'good' : this.flash.delta < 0 ? 'bad' : 'neutral'}` },
        el('strong', {}, `${this.flash.title} · bem-estar ${this.flash.delta > 0 ? '+' : ''}${this.flash.delta}`),
        this.flash.narration && el('p', { className: 'desk-flash-narration' }, this.flash.narration),
        el('p', {}, this.flash.text)),
      el('div', { className: 'dossier-section' },
        el('h3', {}, 'Relato'),
        ...this.content.relato(this.ctx).map(t => el('p', {}, t))),
      el('div', { className: 'dossier-section' },
        el('h3', {}, 'Documentos'),
        el('div', { className: 'dossier-docs' }, ...this.content.documents(this.ctx).map(d =>
          el('div', { className: 'dossier-doc' }, el('strong', {}, d.title), el('span', {}, d.body))))),
      el('div', { className: 'dossier-section' },
        el('h3', {}, 'Classificação'),
        drop),
      el('div', { className: 'dossier-section' },
        el('h3', {}, 'Linha do tempo'),
        this.state.log.length === 0
          ? el('p', { className: 'tag-drop-hint' }, 'Nenhum encaminhamento ainda.')
          : el('ol', { className: 'dossier-log' }, ...this.state.log.map(l => el('li', {},
            el('span', { className: 'log-slot' }, this.content.slots[l.slot] ?? ''),
            ` ${l.title} `,
            el('span', { className: `log-delta ${l.delta > 0 ? 'good' : l.delta < 0 ? 'bad' : ''}` },
              `${l.delta > 0 ? '+' : ''}${l.delta}`))))),
    );
  }

  // -----------------------------------------
  // PAINEL DIREITO — ETIQUETAS
  // -----------------------------------------
  private tagsPanel(): HTMLElement {
    return el('aside', { className: 'desk-panel desk-tags' },
      el('h2', { className: 'desk-panel-title' }, 'Etiquetas de violência'),
      ...violenceTypes.map(v => {
        const chip = el('button', {
          className: `tag-chip${this.state.tags.includes(v.id) ? ' selected' : ''}`,
          draggable: !this.state.classified,
          disabled: this.state.classified,
          title: v.description,
          onclick: () => this.toggle(v.id),
        }, v.label);
        chip.addEventListener('dragstart', e => e.dataTransfer?.setData('text/plain', v.id));
        return chip;
      }),
      !this.state.classified && el('button', {
        className: 'primary-button desk-conclude',
        disabled: this.state.tags.length === 0,
        onclick: () => this.conclude(),
      }, 'Concluir classificação'),
      this.state.classified && el('p', { className: 'tag-drop-hint' }, 'Classificação concluída.'),
    );
  }

  private toggle(id: string): void {
    toggleTag(this.state, id);
    this.save();
    this.render();
  }

  private conclude(): void {
    const result = concludeClassification(this.state, this.content);
    this.track('classify', { tags: this.state.tags, ...result });
    const label = (ids: string[]) => ids.map(id => violenceTypes.find(v => v.id === id)?.label ?? id).join(', ');
    const parts = [
      result.correct.length && `Corretas: ${label(result.correct)}.`,
      result.acceptable.length && `Pertinentes: ${label(result.acceptable)}.`,
      result.wrong.length && `Equivocadas: ${label(result.wrong)}.`,
      result.missing.length && `Faltou identificar: ${label(result.missing)}.`,
    ].filter(Boolean).join(' ');
    this.flash = { title: 'Classificação', delta: result.delta, text: `${parts} ${this.content.tagsFeedback}` };
    this.save();
    this.render();
  }

  // -----------------------------------------
  // BARRA INFERIOR — ENCAMINHAMENTOS
  // -----------------------------------------
  private actionBar(): HTMLElement {
    const locked = !this.state.classified;
    return el('footer', { className: 'desk-actions' },
      el('div', { className: 'desk-actions-label' }, locked ? 'Conclua a classificação para liberar os encaminhamentos' : 'Encaminhamentos — cada um ocupa um período'),
      el('div', { className: 'desk-actions-row' },
        ...this.content.actions.map(action => {
          const done = action.id in this.state.done;
          return el('button', {
            className: `desk-action${done ? ' done' : ''}`,
            disabled: !canAct(this.state, this.content, action),
            onclick: () => this.chooseAction(action),
          }, el('span', { className: 'desk-action-icon' }, action.icon), el('span', {}, action.label), done && el('span', { className: 'desk-action-done' }, '✓'));
        }),
      ),
      el('div', { className: 'desk-actions-row secondary' },
        el('button', {
          className: 'secondary-button',
          disabled: locked || Boolean(pendingEvent(this.content, this.state)),
          onclick: () => this.doWait(),
        }, 'Aguardar o próximo período (−3)'),
        el('button', {
          className: 'secondary-button',
          disabled: locked,
          onclick: () => this.close(),
        }, 'Encerrar o caso'),
      ),
    );
  }

  private chooseAction(action: DossieAction): void {
    if (!action.professionals) return this.doAction(action, 'default');
    const options = action.professionals.map(id => {
      const p = findProfessional(id)!;
      const available = isAvailable(this.content, id, this.state.slot);
      const next = this.content.availability[id].find(s => s > this.state.slot);
      return el('button', {
        className: `pro-choice ${p.stance}`,
        disabled: !available,
        onclick: () => { this.closeModal(); this.doAction(action, id); },
      },
        proAvatar(p.name, p.sprite),
        el('span', { className: 'pro-info' },
          el('strong', {}, p.name),
          el('span', { className: 'pro-role' }, `${p.role} — ${p.trait}`),
          el('span', { className: 'pro-shift' }, available ? '● De plantão agora'
            : next !== undefined ? `Disponível em ${this.content.slots[next]}` : 'Indisponível no prazo do caso')));
    });
    this.modal(el('div', { className: 'desk-modal-card' },
      el('h2', {}, `${action.icon} ${action.label}`),
      el('p', {}, 'Quem vai atender?'),
      ...options,
      el('button', { className: 'secondary-button', onclick: () => this.closeModal() }, 'Cancelar'),
    ));
  }

  private doAction(action: DossieAction, professional: string): void {
    const result = performAction(this.state, this.content, action, professional);
    this.track('action', { action: action.id, professional, delta: result.delta });
    const entry = this.state.log[this.state.log.length - 1];
    this.flash = { title: action.label, delta: result.delta, text: entry.feedback, narration: entry.narration };
    this.save();
    this.render();
  }

  private doWait(): void {
    const delta = wait(this.state, this.content);
    this.track('wait', { delta });
    this.flash = { title: 'Aguardar', delta, text: this.state.log[this.state.log.length - 1].feedback };
    this.save();
    this.render();
  }

  private async close(): Promise<void> {
    const left = this.content.slots.length - this.state.slot;
    if (!(await confirmDialog(`Encerrar o caso agora? Ainda restam ${left} período(s).`, { confirm: 'Encerrar o caso' }))) return;
    finish(this.state);
    this.save();
    this.render();
  }

  // -----------------------------------------
  // JANELAS (introdução e dilema)
  // -----------------------------------------
  private modal(card: HTMLElement): void {
    this.closeModal();
    this.root.append(el('div', { className: 'desk-modal' }, card));
  }

  private closeModal(): void {
    this.root.querySelector('.desk-modal')?.remove();
  }

  private introModal(): HTMLElement {
    return el('div', { className: 'desk-modal-card' },
      el('div', { className: 'title-eyebrow' }, 'Modo 3 — Dossiê 180'),
      el('p', { className: 'desk-intro' }, this.content.intro),
      el('ul', { className: 'phone-intro-rules' },
        el('li', {}, '1. Leia o relato e os documentos.'),
        el('li', {}, '2. Aplique as etiquetas de violência e conclua a classificação.'),
        el('li', {}, `3. Faça os encaminhamentos: você tem ${this.content.slots.length} períodos, e a ordem importa.`),
        el('li', {}, 'A barra de bem-estar mostra como a vítima está sendo afetada pelas suas decisões.'),
      ),
      el('button', {
        className: 'primary-button',
        onclick: () => { this.showIntro = false; this.closeModal(); this.render(); },
      }, 'Abrir o dossiê'),
    );
  }

  private eventModal(event: NonNullable<ReturnType<typeof pendingEvent>>): HTMLElement {
    return el('div', { className: 'desk-modal-card' },
      el('h2', {}, event.title),
      el('p', {}, event.text),
      ...event.options.map(option => el('button', {
        className: 'pro-choice',
        onclick: () => {
          const delta = resolveEvent(this.state, this.content, option);
          this.track('event', { event: event.id, choice: option.text, delta });
          this.flash = { title: event.title, delta, text: option.feedback };
          this.save();
          this.closeModal();
          this.render();
        },
      }, option.text)),
    );
  }

  // -----------------------------------------
  // DESFECHO
  // -----------------------------------------
  private ending(): void {
    const ending = this.state.ending!;
    this.track('end', { ending, done: this.state.done });
    const titles = { positivo: 'Caso encerrado com proteção', neutro: 'Caso encerrado com falhas', negativo: 'Caso perdido' };
    this.root.replaceChildren(el('div', { className: 'desk-ending' },
      el('div', { className: 'title-eyebrow' }, 'Modo 3 — Dossiê 180'),
      el('h1', { className: `ending-banner ending-${ending}` }, titles[ending]),
      wellbeingMeter(this.state.wellbeing),
      ...this.content.endings[ending].map(t => el('p', { className: 'desk-ending-text' }, t)),
      el('button', {
        className: 'primary-button',
        onclick: () => {
          this.root.classList.add('hidden');
          renderDossieSummary(this.protagonist, this.content, this.state, this.ctx.ponteEnding);
        },
      }, 'Ver resumo'),
    ));
  }
}

function wellbeingMeter(value: number): HTMLElement {
  const level = value >= 80 ? 'high' : value >= 50 ? 'mid' : 'low';
  return el('div', { className: `desk-wellbeing ${level}`, title: `Bem-estar da vítima: ${value}%` },
    el('span', { className: 'desk-label' }, 'Bem-estar'),
    el('div', { className: 'wellbeing-track' },
      el('div', { className: 'wellbeing-fill', style: `width:${value}%` }),
      el('span', { className: 'wellbeing-mark', style: 'left:50%' }),
      el('span', { className: 'wellbeing-mark', style: 'left:80%' })),
    el('strong', {}, `${value}%`));
}

function proAvatar(name: string, sprite?: string): HTMLElement {
  if (sprite) {
    return el('div', { className: 'phone-avatar sm' }, el('img', { src: assetUrl(assetPath.sprite(sprite)), alt: '' }));
  }
  const initials = name.replace(/^(Dr\.|Dra\.|Escrivã|Delegado)\s+/, '').slice(0, 1);
  return el('div', { className: 'phone-avatar sm pro-initials' }, initials);
}
