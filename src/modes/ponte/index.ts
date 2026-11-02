// ============================================================
// MODO 2 — "A PONTE"
// Simulador de apoio interpessoal em uma interface de celular.
// O jogador é o aliado escolhido na Cena 5 do Modo 1 e tem 4 semanas
// para construir confiança com a protagonista. Regras em ./rules.ts.
// ============================================================

import { cards, findCard } from '../../../content/shared/cards';
import type { ChatLine, PonteAction, PonteAllyContent, PonteContent, PonteOption, Protagonist } from '../../../content/types';
import { assetPath, assetUrl } from '../../core/assets';
import type { PonteActionId, PonteState, SaveStore } from '../../core/save';
import type { Telemetry } from '../../core/telemetry';
import { confirmDialog } from '../../ui/confirm';
import { byId, el } from '../../ui/dom';
import { renderPonteSummary } from './summary';
import {
  ACTION_COST, AP_PER_WEEK, WEEKS,
  applyOption, canDo, endWeek, newPonte, spend, unlockCard, visibleOptions,
} from './rules';

export interface PonteDeps {
  saves: SaveStore;
  telemetry: Telemetry;
  exit(): void;
}

const ACTION_LABEL: Record<PonteActionId, { name: string; icon: string; verb: string }> = {
  mensagem: { name: 'Mandar mensagem', icon: '💬', verb: 'Mensagens' },
  ligacao: { name: 'Fazer ligação', icon: '📞', verb: 'Ligação' },
  visita: { name: 'Convidar para um café', icon: '☕', verb: 'Encontro' },
  pesquisa: { name: 'Pesquisar na internet', icon: '🔎', verb: 'Pesquisa' },
};

const REPLY_DELAY_MS = 900;

/** Inicia o Modo 2. `fresh` descarta o progresso salvo do modo. */
export function startPonte(protagonist: Protagonist, allyId: string, fresh: boolean, deps: PonteDeps): void {
  const content = protagonist.ponte;
  const ally = content?.allies[allyId];
  if (!content || !ally) throw new Error(`${protagonist.name} não tem o Modo 2 para o aliado ${allyId}.`);

  const saved = deps.saves.campaign(protagonist.id).ponte;
  const resume = !fresh && saved && saved.ally === allyId && saved.ending === null;
  const state = resume ? saved : newPonte(allyId, ally.startTrust);

  const game = new PonteGame(protagonist, content, ally, state, deps);
  deps.telemetry.track('ponte.start', { protagonist: protagonist.id, ally: allyId, resumed: Boolean(resume) });
  byId('ponte-screen').classList.remove('hidden');
  if (resume) game.home();
  else game.intro();
}

/** Mostra direto o resumo de um Modo 2 já concluído. */
export function showPonteSummary(protagonist: Protagonist, deps: PonteDeps): void {
  const state = deps.saves.campaign(protagonist.id).ponte;
  const ally = state && protagonist.ponte?.allies[state.ally];
  if (state?.ending && ally) {
    bindSummaryActions(protagonist, deps);
    renderPonteSummary(protagonist, ally, state);
  }
}

function bindSummaryActions(protagonist: Protagonist, deps: PonteDeps): void {
  byId('summary-restart').onclick = () => {
    deps.saves.updateCampaign(protagonist.id, c => { delete c.ponte; });
    deps.exit();
  };
  byId('summary-menu').onclick = () => deps.exit();
}

class PonteGame {
  private phone: HTMLElement;
  private shownAt = 0;
  /** Semana cujas mensagens já foram abertas (só para o aviso de não lida). */
  private seenWeek = -1;

  constructor(
    private protagonist: Protagonist,
    private content: PonteContent,
    private ally: PonteAllyContent,
    private state: PonteState,
    private deps: PonteDeps,
  ) {
    this.phone = byId('phone-screen');
    bindSummaryActions(protagonist, deps);
  }

  private get week() {
    return this.ally.weeks[this.state.week];
  }

  private save(): void {
    this.deps.saves.updateCampaign(this.protagonist.id, c => { c.ponte = this.state; });
  }

  private track(type: string, data: Record<string, unknown> = {}): void {
    this.deps.telemetry.track(`ponte.${type}`, {
      protagonist: this.protagonist.id, ally: this.state.ally, week: this.state.week + 1, trust: this.state.trust, ...data,
    });
  }

  /** Entrega as mensagens de abertura da semana (uma vez por semana). */
  private deliverWeekEvent(): void {
    const delivered = this.state.chat.some(c => c.channel === 'evento' && c.week === this.state.week);
    if (delivered) return;
    for (const line of this.week.event) {
      this.state.chat.push({ ...line, week: this.state.week, channel: 'evento' });
    }
    this.save();
  }

  // -----------------------------------------
  // MOLDURA DO CELULAR
  // -----------------------------------------
  private show(title: string | null, body: HTMLElement[], options: { back?: () => void; footer?: HTMLElement } = {}): void {
    const bar = el('div', { className: 'phone-statusbar' },
      el('span', {}, `Semana ${this.state.week + 1} de ${WEEKS}`),
      el('span', { className: 'phone-ap', title: 'Pontos de Ação nesta semana' },
        'PA ', ...Array.from({ length: AP_PER_WEEK }, (_, i) =>
          el('span', { className: `phone-ap-dot${i < this.state.ap ? ' full' : ''}` }))),
    );
    const header = title === null ? null : el('div', { className: 'phone-header' },
      options.back ? el('button', { className: 'phone-back', onclick: options.back, title: 'Voltar' }, '‹') : el('span'),
      el('span', { className: 'phone-title' }, title),
      el('span'),
    );
    const content = el('div', { className: 'phone-body' }, ...body);
    this.phone.replaceChildren(bar, ...(header ? [header] : []), content, ...(options.footer ? [options.footer] : []));
    content.scrollTop = 0;
  }

  private avatar(sprite: string, size: 'sm' | 'lg' = 'sm'): HTMLElement {
    return el('div', { className: `phone-avatar ${size}` },
      el('img', { src: assetUrl(assetPath.sprite(sprite)), alt: '' }));
  }

  // -----------------------------------------
  // INTRODUÇÃO
  // -----------------------------------------
  intro(): void {
    this.show(null, [
      el('div', { className: 'phone-intro' },
        el('div', { className: 'title-eyebrow' }, 'Modo 2 — A Ponte'),
        this.avatar(this.ally.sprite, 'lg'),
        el('p', { className: 'phone-intro-text' }, this.ally.intro),
        el('ul', { className: 'phone-intro-rules' },
          el('li', {}, `A cada semana você tem ${AP_PER_WEEK} Pontos de Ação (PA).`),
          el('li', {}, 'Mensagem custa 1 PA, ligação 2 PA, um café 3 PA. Pesquisar na internet custa 1 PA e desbloqueia uma Carta de Conhecimento.'),
          el('li', {}, `O medidor ao redor da foto de ${this.protagonist.name} mostra a confiança dela em você.`),
          el('li', {}, 'Escute, valide e ofereça ajuda sem pressionar. Julgar ou dar ordens afasta.'),
        ),
        el('button', { className: 'primary-button', onclick: () => this.home() }, 'Começar'),
      ),
    ]);
  }

  // -----------------------------------------
  // TELA INICIAL DO CELULAR
  // -----------------------------------------
  home(): void {
    if (this.state.ending) return this.ending();
    this.deliverWeekEvent();
    const unread = this.seenWeek !== this.state.week;
    const app = (icon: string, name: string, onclick: () => void, badge = false, highlight = false) =>
      el('button', { className: `phone-app${highlight ? ' highlight' : ''}`, onclick },
        el('span', { className: 'phone-app-icon' }, icon, badge && el('span', { className: 'phone-badge' })),
        el('span', { className: 'phone-app-name' }, name));

    this.show(null, [
      el('div', { className: 'phone-home-clock' },
        el('div', { className: 'phone-home-week' }, this.week.title),
        el('div', { className: 'phone-home-phase' }, `Fase: ${this.week.phase}`)),
      el('div', { className: 'phone-apps' },
        app('🌉', 'A Ponte', () => this.ponteApp(), false, true),
        app('💬', 'Mensagens', () => this.messages(), unread),
        app('📅', 'Calendário', () => this.calendar()),
        app('👥', 'Contatos', () => this.contacts()),
        app('🗂️', 'Cartas', () => this.cardsApp()),
      ),
      el('p', { className: 'phone-hint' }, unread
        ? `Nova mensagem de ${this.protagonist.name}. Leia em "Mensagens" e abra "A Ponte" para agir.`
        : 'Abra "A Ponte" para agir nesta semana.'),
    ]);
  }

  // -----------------------------------------
  // APP "A PONTE"
  // -----------------------------------------
  private ponteApp(): void {
    const actions: PonteActionId[] = ['mensagem', 'ligacao', 'visita', 'pesquisa'];
    const actionButtons = actions.map(action => {
      const used = this.state.used.includes(action);
      const available = canDo(this.state, action) && (action !== 'pesquisa' || cards.some(c => !this.state.cards.includes(c.id)));
      return el('button', {
        className: 'ponte-action',
        disabled: !available,
        onclick: () => action === 'pesquisa' ? this.search() : this.conversation(action),
      },
        el('span', { className: 'ponte-action-icon' }, ACTION_LABEL[action].icon),
        el('span', { className: 'ponte-action-name' }, ACTION_LABEL[action].name),
        el('span', { className: 'ponte-action-cost' }, used ? 'feito' : `${ACTION_COST[action]} PA`),
      );
    });

    const lastEvent = this.week.event[this.week.event.length - 1];
    this.show('A Ponte', [
      el('div', { className: 'ponte-meter' },
        trustRing(this.state.trust, assetUrl(assetPath.sprite(this.content.avatar))),
        el('div', { className: 'ponte-meter-label' }, `Confiança de ${this.protagonist.name}`),
      ),
      el('div', { className: 'ponte-week' },
        el('strong', {}, `Semana ${this.state.week + 1} — ${this.week.title}`),
        el('span', { className: 'ponte-week-quote' }, `“${lastEvent.text}”`),
      ),
      el('div', { className: 'ponte-actions' }, ...actionButtons),
    ], {
      back: () => this.home(),
      footer: el('div', { className: 'phone-footer' },
        el('button', { className: 'secondary-button', onclick: () => this.cardsApp(() => this.ponteApp()) },
          `Cartas (${this.state.cards.length}/${cards.length})`),
        el('button', { className: 'primary-button phone-endweek', onclick: () => this.finishWeek() },
          this.state.week === WEEKS - 1 ? 'Encerrar a última semana' : 'Encerrar semana'),
      ),
    });
  }

  private async finishWeek(): Promise<void> {
    if (this.state.ap > 0 && !(await confirmDialog(`Você ainda tem ${this.state.ap} PA nesta semana. Encerrar mesmo assim?`, { confirm: 'Encerrar semana' }))) return;
    this.track('week_end', { apLeft: this.state.ap });
    endWeek(this.state);
    this.save();
    if (this.state.ending) this.ending();
    else this.home();
  }

  // -----------------------------------------
  // CONVERSA (mensagem, ligação ou encontro)
  // -----------------------------------------
  // Os PA só são gastos ao responder: recarregar a página no meio de uma
  // conversa não faz o jogador perder a ação.
  private conversation(action: PonteAction): void {
    if (!canDo(this.state, action)) return this.ponteApp();
    const interaction = this.week.interactions[action];
    this.track('action', { action });

    const thread = el('div', { className: `chat-thread chat-${action}` });
    const optionsBox = el('div', { className: 'chat-options' });
    const header = action === 'ligacao'
      ? el('div', { className: 'chat-call-banner' }, `📞 Em ligação com ${this.protagonist.name}`)
      : action === 'visita'
        ? el('div', { className: 'chat-call-banner' }, `☕ Encontro com ${this.protagonist.name}`)
        : null;

    this.show(this.protagonist.name, [...(header ? [header] : []), thread], { footer: optionsBox });

    // Histórico recente desta semana dá contexto à mensagem
    if (action === 'mensagem') {
      for (const c of this.state.chat.filter(c => c.week === this.state.week)) thread.append(bubble(c, this.ally.name));
    }

    for (const line of interaction.opening) thread.append(bubble(line, this.ally.name));

    const options = visibleOptions(interaction.options, this.state.cards);
    optionsBox.replaceChildren(
      el('div', { className: 'chat-options-label' }, `Como ${this.ally.name} responde?`),
      ...options.map((option, i) => el('button', {
        className: `chat-option${option.victory ? ' victory' : ''}`,
        onclick: () => this.choose(action, interaction.opening, option, thread, optionsBox),
      }, el('span', { className: 'chat-option-key' }, String(i + 1)), option.text)),
    );
    this.bindNumberKeys(optionsBox);
    this.shownAt = performance.now();
  }

  private bindNumberKeys(box: HTMLElement): void {
    const handler = (e: KeyboardEvent) => {
      if (!box.isConnected) return document.removeEventListener('keydown', handler);
      const btn = box.querySelectorAll<HTMLButtonElement>('.chat-option')[Number(e.key) - 1];
      if (/^[1-9]$/.test(e.key) && btn) { document.removeEventListener('keydown', handler); btn.click(); }
    };
    document.addEventListener('keydown', handler);
  }

  private addLine(thread: HTMLElement, line: ChatLine, channel: PonteAction): void {
    this.state.chat.push({ ...line, week: this.state.week, channel });
    thread.append(bubble(line, this.ally.name));
    thread.parentElement?.scrollTo({ top: thread.scrollHeight });
  }

  private choose(action: PonteAction, opening: ChatLine[], option: PonteOption, thread: HTMLElement, optionsBox: HTMLElement): void {
    const before = this.state.trust;
    spend(this.state, action);
    for (const line of opening) this.state.chat.push({ ...line, week: this.state.week, channel: action });
    applyOption(this.state, action, option);
    this.track('choice', {
      action, choice: option.text, delta: option.delta, victory: Boolean(option.victory),
      decisionMs: Math.round(performance.now() - this.shownAt),
    });
    optionsBox.replaceChildren();
    this.addLine(thread, { from: 'jogador', text: option.text }, action);
    this.save();

    // Respostas chegam uma a uma, como num aplicativo de mensagens
    let i = 0;
    const next = () => {
      if (i < option.replies.length) {
        const typing = el('div', { className: 'chat-typing' }, `${this.protagonist.name} está digitando…`);
        thread.append(typing);
        setTimeout(() => {
          typing.remove();
          this.addLine(thread, option.replies[i++], action);
          this.save();
          next();
        }, REPLY_DELAY_MS);
        return;
      }
      optionsBox.replaceChildren(
        feedbackCard(option, before, this.state.trust),
        el('button', {
          className: 'primary-button',
          onclick: () => this.state.ending ? this.ending() : this.ponteApp(),
        }, this.state.ending ? 'Ver desfecho' : 'Voltar ao app'),
      );
    };
    next();
  }

  // -----------------------------------------
  // PESQUISA E CARTAS
  // -----------------------------------------
  private search(): void {
    const results = cards.filter(c => !this.state.cards.includes(c.id));
    this.show('Navegador', [
      el('div', { className: 'search-box' }, '🔎 Pesquisar…'),
      el('p', { className: 'phone-hint' }, 'Escolha uma pesquisa. Cada pesquisa custa 1 PA e desbloqueia uma Carta de Conhecimento.'),
      ...results.map(card => el('button', {
        className: 'search-result',
        onclick: () => {
          spend(this.state, 'pesquisa');
          unlockCard(this.state, card.id);
          this.track('card', { card: card.id });
          this.save();
          this.cardDetail(card.id, () => this.ponteApp(), true);
        },
      },
        el('span', { className: 'search-query' }, `“${card.searchQuery}”`),
        el('span', { className: 'search-title' }, card.title))),
    ], { back: () => this.ponteApp() });
  }

  private cardsApp(back: () => void = () => this.home()): void {
    this.show('Cartas de Conhecimento', [
      el('div', { className: 'cards-grid' }, ...cards.map(card => {
        const unlocked = this.state.cards.includes(card.id);
        return el('button', {
          className: `knowledge-tile${unlocked ? '' : ' locked'}`,
          disabled: !unlocked,
          onclick: () => this.cardDetail(card.id, () => this.cardsApp(back)),
        }, unlocked ? card.title : '???');
      })),
      el('p', { className: 'phone-hint' }, 'Use "Pesquisar na internet" no app A Ponte para desbloquear cartas.'),
    ], { back });
  }

  private cardDetail(id: string, back: () => void, isNew = false): void {
    const card = findCard(id)!;
    this.show('Carta de Conhecimento', [
      el('article', { className: 'knowledge-card' },
        isNew && el('div', { className: 'knowledge-new' }, 'Nova carta desbloqueada'),
        el('h2', {}, card.title),
        el('p', {}, card.summary),
        el('h3', {}, 'Sinais'),
        el('ul', {}, ...card.signs.map(s => el('li', {}, s))),
        el('h3', {}, 'Como ajudar'),
        el('ul', {}, ...card.howToHelp.map(s => el('li', {}, s))),
        el('p', { className: 'knowledge-legal' }, card.legalBasis),
      ),
    ], { back });
  }

  // -----------------------------------------
  // APPS DE APOIO
  // -----------------------------------------
  private messages(): void {
    this.seenWeek = this.state.week;
    const thread = el('div', { className: 'chat-thread' });
    let week = -1;
    for (const entry of this.state.chat) {
      if (entry.week !== week) {
        week = entry.week;
        thread.append(el('div', { className: 'chat-week' }, `Semana ${week + 1}`));
      }
      thread.append(bubble(entry, this.ally.name));
    }
    this.show(this.protagonist.name, [thread], { back: () => this.home() });
    thread.parentElement?.scrollTo({ top: thread.scrollHeight });
  }

  private calendar(): void {
    this.show('Calendário', this.ally.weeks.map((w, i) => el('div', {
      className: `calendar-week${i === this.state.week ? ' current' : ''}${i < this.state.week ? ' past' : ''}`,
    },
      el('strong', {}, `Semana ${i + 1}`),
      el('span', {}, i <= this.state.week ? w.title : '—'),
      el('span', { className: 'calendar-phase' }, i <= this.state.week ? `Fase: ${w.phase}` : ''),
      i < this.state.trustByWeek.length && el('span', { className: 'calendar-trust' }, `Confiança ao fim: ${this.state.trustByWeek[i]}%`),
    )), { back: () => this.home() });
  }

  private contacts(): void {
    const contact = (name: string, detail: string, href?: string) => href
      ? el('a', { className: 'contact', href }, el('strong', {}, name), el('span', {}, detail))
      : el('div', { className: 'contact' }, el('strong', {}, name), el('span', {}, detail));
    this.show('Contatos', [
      el('div', { className: 'contact contact-person' },
        this.avatar(this.content.avatar),
        el('div', {}, el('strong', {}, this.protagonist.name), el('span', {}, `${this.protagonist.role}, ${this.protagonist.age} anos`))),
      el('div', { className: 'contact contact-person' },
        this.avatar(this.ally.sprite),
        el('div', {}, el('strong', {}, `${this.ally.name} (você)`), el('span', {}, `${this.ally.relation} de ${this.protagonist.name}`))),
      el('div', { className: 'contacts-section' }, 'Contatos úteis'),
      contact('Ligue 180', 'Central de Atendimento à Mulher — 24 h, gratuita', 'tel:180'),
      contact('190', 'Polícia Militar — emergência', 'tel:190'),
      contact('Delegacia da Mulher (DEAM)', 'Boletim de ocorrência e medida protetiva'),
      contact('CRAM / CREAS', 'Apoio psicossocial e jurídico'),
    ], { back: () => this.home() });
  }

  // -----------------------------------------
  // DESFECHO
  // -----------------------------------------
  private ending(): void {
    const ending = this.state.ending!;
    const delivered = this.state.chat.some(c => c.channel === 'final');
    if (!delivered) {
      for (const line of this.ally.endings[ending]) this.state.chat.push({ ...line, week: this.state.week, channel: 'final' });
      this.track('end', { ending, victory: this.state.victory, cards: this.state.cards });
      this.save();
    }
    const titles = { positivo: 'A ponte se sustenta', neutro: 'A ponte balança', negativo: 'A ponte se rompe' };
    const thread = el('div', { className: 'chat-thread' },
      ...this.state.chat.filter(c => c.channel === 'final').map(c => bubble(c, this.ally.name)));
    this.show(null, [
      el('div', { className: `ending-banner ending-${ending}` }, titles[ending]),
      trustRing(this.state.trust, assetUrl(assetPath.sprite(this.content.avatar))),
      thread,
    ], {
      footer: el('div', { className: 'phone-footer' },
        el('button', {
          className: 'primary-button',
          onclick: () => {
            byId('ponte-screen').classList.add('hidden');
            renderPonteSummary(this.protagonist, this.ally, this.state);
          },
        }, 'Ver resumo')),
    });
  }
}

// -----------------------------------------
// COMPONENTES
// -----------------------------------------
function bubble(line: ChatLine, allyName: string): HTMLElement {
  if (line.from === 'narrador') return el('div', { className: 'chat-narration' }, line.text);
  return el('div', { className: `chat-bubble ${line.from === 'jogador' ? 'mine' : 'theirs'}`, title: line.from === 'jogador' ? allyName : '' }, line.text);
}

function feedbackCard(option: PonteOption, before: number, after: number): HTMLElement {
  const change = after - before;
  const tone = option.delta > 0 ? 'good' : option.delta < 0 ? 'bad' : 'neutral';
  return el('div', { className: `feedback-card ${tone}` },
    el('div', { className: 'feedback-delta' },
      change === 0 ? 'Confiança mantida' : `Confiança ${change > 0 ? '+' : ''}${change} → ${after}%`),
    el('div', { className: 'feedback-text' }, option.feedback));
}

/** Foto da protagonista com o medidor circular de confiança. */
export function trustRing(trust: number, photoUrl: string): HTMLElement {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const level = trust >= 70 ? 'high' : trust >= 40 ? 'mid' : 'low';
  const wrap = el('div', { className: `trust-ring ${level}`, title: `Confiança: ${trust}%` });
  wrap.innerHTML = `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="${r}" class="trust-track"/>
      <circle cx="60" cy="60" r="${r}" class="trust-value"
        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - trust / 100)}"/>
    </svg>`;
  wrap.append(
    el('img', { src: photoUrl, alt: '' }),
    el('span', { className: 'trust-percent' }, `${trust}%`),
  );
  return wrap;
}
