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
import { bindSummaryActions as bindSummary } from '../../ui/summaryActions';
import { renderPonteSummary } from './summary';
import {
  ACTION_COST, AP_PER_WEEK, CALL_ANSWER_SECONDS, WEEKS,
  applyOption, canDo, endWeek, newPonte, silenceOption, spend, unlockCard, visibleOptions,
} from './rules';

export interface PonteDeps {
  saves: SaveStore;
  telemetry: Telemetry;
  exit(): void;
  continueTo?: { allowed(mode: number): boolean; go(mode: number, protagonist: Protagonist): void };
}

const ACTION_LABEL: Record<PonteActionId, { name: string; icon: string; verb: string }> = {
  mensagem: { name: 'Mandar mensagem', icon: '💬', verb: 'Mensagens' },
  ligacao: { name: 'Fazer ligação', icon: '📞', verb: 'Ligação' },
  visita: { name: 'Convidar para um café', icon: '☕', verb: 'Encontro' },
  pesquisa: { name: 'Pesquisar na internet', icon: '🔎', verb: 'Pesquisa' },
};

const REPLY_DELAY_MS = 900;
/** Tempo mínimo de cada legenda na ligação (mais 25 ms por caractere). */
const CAPTION_MS = 1400;

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
  const done = Boolean(deps.saves.campaign(protagonist.id).ponte?.ending);
  bindSummary({
    restart: () => {
      deps.saves.updateCampaign(protagonist.id, c => { delete c.ponte; });
      deps.exit();
    },
    menu: () => deps.exit(),
    next: done && protagonist.dossie && deps.continueTo?.allowed(3)
      ? { label: 'Continuar no Modo 3 →', go: () => deps.continueTo!.go(3, protagonist) }
      : undefined,
  });
}

class PonteGame {
  private phone: HTMLElement;
  private shownAt = 0;
  /** Semana cujas mensagens já foram abertas (só para o aviso de não lida). */
  private seenWeek = -1;
  /** Cronômetros da ligação em curso, cancelados ao sair da tela. */
  private timers: number[] = [];

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
  // MOLDURA: celular + painel da semana fora do aparelho
  // -----------------------------------------
  private show(
    title: string | null,
    body: HTMLElement[],
    options: { back?: () => void; footer?: HTMLElement; frame?: 'intro' | 'jogo' | 'desfecho'; bodyClass?: string } = {},
  ): void {
    this.clearTimers();
    this.renderFrame(options.frame ?? 'jogo');
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
    const content = el('div', { className: `phone-body${options.bodyClass ? ` ${options.bodyClass}` : ''}` }, ...body);
    this.phone.replaceChildren(bar, ...(header ? [header] : []), content, ...(options.footer ? [options.footer] : []));
    content.scrollTop = 0;
  }

  /** Título da semana (acima do celular) e painel com confiança e ações da semana. */
  private renderFrame(frame: 'intro' | 'jogo' | 'desfecho'): void {
    const top = byId('ponte-top');
    const side = byId('ponte-side');
    if (frame === 'intro') {
      top.replaceChildren(el('div', { className: 'title-eyebrow' }, 'Modo 2 — A Ponte'));
      side.replaceChildren();
      side.hidden = true;
      return;
    }
    side.hidden = false;
    const ring = el('div', { className: 'ponte-meter' },
      trustRing(this.state.trust, assetUrl(assetPath.sprite(this.content.avatar))),
      el('div', { className: 'ponte-meter-label' }, `Confiança de ${this.protagonist.name}`));

    if (frame === 'desfecho') {
      top.replaceChildren(
        el('div', { className: 'title-eyebrow' }, 'Modo 2 — A Ponte'),
        el('h2', { className: 'ponte-top-title' }, 'Desfecho'));
      side.replaceChildren(ring);
      return;
    }

    const lastEvent = this.week.event[this.week.event.length - 1];
    top.replaceChildren(
      el('div', { className: 'title-eyebrow' }, 'Modo 2 — A Ponte'),
      el('h2', { className: 'ponte-top-title' }, `Semana ${this.state.week + 1} — ${this.week.title}`),
      el('div', { className: 'ponte-top-phase' }, `Fase: ${this.week.phase}`));
    side.replaceChildren(
      ring,
      el('blockquote', { className: 'ponte-week-quote' }, `“${lastEvent.text}”`),
      el('div', { className: 'ponte-side-ap' },
        el('span', {}, 'Pontos de Ação'),
        el('span', { className: 'phone-ap' }, ...Array.from({ length: AP_PER_WEEK }, (_, i) =>
          el('span', { className: `phone-ap-dot${i < this.state.ap ? ' full' : ''}` })))),
      el('button', { className: 'secondary-button', onclick: () => this.cardsApp() },
        `Cartas (${this.state.cards.length}/${cards.length})`),
      el('button', { className: 'primary-button phone-endweek', onclick: () => this.finishWeek() },
        this.state.week === WEEKS - 1 ? 'Encerrar a última semana' : 'Encerrar semana'),
    );
  }

  private avatar(sprite: string, size: 'sm' | 'lg' = 'sm'): HTMLElement {
    return el('div', { className: `phone-avatar ${size}` },
      el('img', { src: assetUrl(assetPath.sprite(sprite)), alt: '' }));
  }

  private clearTimers(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }

  private later(ms: number, fn: () => void): void {
    this.timers.push(window.setTimeout(fn, ms));
  }

  // -----------------------------------------
  // INTRODUÇÃO
  // -----------------------------------------
  intro(): void {
    this.show(null, [
      el('div', { className: 'phone-intro' },
        this.avatar(this.ally.sprite, 'lg'),
        el('p', { className: 'phone-intro-text' }, this.ally.intro),
        el('ul', { className: 'phone-intro-rules' },
          el('li', {}, `A cada semana você tem ${AP_PER_WEEK} Pontos de Ação (PA).`),
          el('li', {}, 'As ações ficam na barra de baixo do celular: Mensagens (1 PA), Telefone (2 PA), Café (3 PA) e Navegador (1 PA, desbloqueia uma Carta de Conhecimento).'),
          el('li', {}, 'Na ligação, responda a tempo: o silêncio também conta como resposta.'),
          el('li', {}, `O medidor ao lado do celular mostra a confiança de ${this.protagonist.name} em você.`),
          el('li', {}, 'Escute, valide e ofereça ajuda sem pressionar. Julgar ou dar ordens afasta.'),
        ),
        el('button', { className: 'primary-button', onclick: () => this.home() }, 'Começar'),
      ),
    ], { frame: 'intro' });
  }

  // -----------------------------------------
  // TELA INICIAL DO CELULAR
  // -----------------------------------------
  home(): void {
    if (this.state.ending) return this.ending();
    this.deliverWeekEvent();
    const unread = this.seenWeek !== this.state.week;
    const app = (icon: string, name: string, onclick: () => void) =>
      el('button', { className: 'phone-app', onclick },
        el('span', { className: 'phone-app-icon' }, icon),
        el('span', { className: 'phone-app-name' }, name));

    const lastEvent = this.week.event[this.week.event.length - 1];
    const notification = unread && el('button', { className: 'phone-notification', onclick: () => this.messages() },
      this.avatar(this.content.avatar),
      el('span', { className: 'phone-notification-text' },
        el('strong', {}, this.protagonist.name),
        el('span', {}, lastEvent.text)));

    this.show(null, [
      ...(notification ? [notification] : []),
      el('div', { className: 'phone-apps' },
        app('📅', 'Calendário', () => this.calendar()),
        app('👥', 'Contatos', () => this.contacts()),
        app('🗂️', 'Cartas', () => this.cardsApp()),
      ),
      el('p', { className: 'phone-hint' }, 'As ações da semana ficam na barra de baixo. Cada uma gasta Pontos de Ação.'),
    ], { footer: this.dock(unread), bodyClass: 'phone-home' });
  }

  /** Barra de apps do celular com as quatro ações da semana. */
  private dock(unread: boolean): HTMLElement {
    const cardsLeft = cards.some(c => !this.state.cards.includes(c.id));
    const item = (action: PonteActionId, icon: string, name: string, onclick: () => void, alwaysOpen = false) => {
      const used = this.state.used.includes(action);
      const available = canDo(this.state, action) && (action !== 'pesquisa' || cardsLeft);
      const reason = used ? 'feito' : !available ? (action === 'pesquisa' && !cardsLeft ? 'todas' : 'sem PA') : `${ACTION_COST[action]} PA`;
      return el('button', {
        className: `dock-app${available ? '' : ' unavailable'}`,
        disabled: !available && !alwaysOpen,
        onclick,
        title: `${ACTION_LABEL[action].name} — ${ACTION_COST[action]} PA`,
      },
        el('span', { className: 'phone-app-icon' }, icon, action === 'mensagem' && unread && el('span', { className: 'phone-badge' })),
        el('span', { className: 'phone-app-name' }, name),
        el('span', { className: 'dock-cost' }, reason));
    };
    return el('nav', { className: 'phone-dock', ariaLabel: 'Ações da semana' },
      // Mensagens sempre abre (para reler a conversa); responder é que gasta PA
      item('mensagem', '💬', 'Mensagens', () => this.messages(), true),
      item('ligacao', '📞', 'Telefone', () => this.call()),
      item('visita', '☕', 'Café', () => this.conversation('visita')),
      item('pesquisa', '🔎', 'Navegador', () => this.search()),
    );
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
  // MENSAGENS: a conversa inteira, com a resposta da semana embaixo
  // -----------------------------------------
  // Os PA só são gastos ao responder: abrir a conversa (ou recarregar a
  // página no meio dela) não faz o jogador perder a ação.
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

    const optionsBox = el('div', { className: 'chat-options' });
    this.show(this.protagonist.name, [thread], { back: () => this.home(), footer: optionsBox });

    if (canDo(this.state, 'mensagem')) {
      const interaction = this.week.interactions.mensagem;
      this.track('action', { action: 'mensagem' });
      for (const line of interaction.opening) thread.append(bubble(line, this.ally.name));
      this.offerOptions('mensagem', interaction.opening, thread, optionsBox);
    } else {
      optionsBox.append(el('p', { className: 'chat-closed' }, this.state.used.includes('mensagem')
        ? 'Você já respondeu nesta semana.'
        : 'Sem Pontos de Ação para responder nesta semana.'));
    }
    thread.parentElement?.scrollTo({ top: thread.scrollHeight });
  }

  // -----------------------------------------
  // CAFÉ (encontro): conversa com narração do lugar
  // -----------------------------------------
  private conversation(action: 'visita'): void {
    if (!canDo(this.state, action)) return this.home();
    const interaction = this.week.interactions[action];
    this.track('action', { action });

    const thread = el('div', { className: `chat-thread chat-${action}` });
    const optionsBox = el('div', { className: 'chat-options' });
    this.show(this.protagonist.name, [
      el('div', { className: 'chat-call-banner' }, `☕ Encontro com ${this.protagonist.name}`),
      thread,
    ], { footer: optionsBox });

    for (const line of interaction.opening) thread.append(bubble(line, this.ally.name));
    this.offerOptions(action, interaction.opening, thread, optionsBox);
  }

  private offerOptions(action: PonteAction, opening: ChatLine[], thread: HTMLElement, optionsBox: HTMLElement): void {
    const options = visibleOptions(this.week.interactions[action].options, this.state.cards);
    optionsBox.replaceChildren(
      el('div', { className: 'chat-options-label' }, `Como ${this.ally.name} responde? · ${ACTION_COST[action]} PA`),
      ...options.map((option, i) => el('button', {
        className: `chat-option${option.victory ? ' victory' : ''}`,
        onclick: () => this.choose(action, opening, option, thread, optionsBox),
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

  /** Aplica a escolha: gasta os PA, registra e atualiza o painel. */
  private commit(action: PonteAction, opening: ChatLine[], option: PonteOption, extra: Record<string, unknown> = {}): number {
    const before = this.state.trust;
    spend(this.state, action);
    for (const line of opening) this.state.chat.push({ ...line, week: this.state.week, channel: action });
    applyOption(this.state, action, option);
    this.track('choice', {
      action, choice: option.text, delta: option.delta, victory: Boolean(option.victory),
      decisionMs: Math.round(performance.now() - this.shownAt), ...extra,
    });
    this.save();
    this.renderFrame('jogo');
    return before;
  }

  private choose(action: PonteAction, opening: ChatLine[], option: PonteOption, thread: HTMLElement, optionsBox: HTMLElement): void {
    const before = this.commit(action, opening, option);
    optionsBox.replaceChildren();
    this.addLine(thread, { from: 'jogador', text: option.text }, action);

    // Respostas chegam uma a uma, como num aplicativo de mensagens
    let i = 0;
    const next = () => {
      if (i < option.replies.length) {
        const typing = el('div', { className: 'chat-typing' },
          action === 'mensagem' ? `${this.protagonist.name} está digitando…` : '…');
        thread.append(typing);
        this.later(REPLY_DELAY_MS, () => {
          typing.remove();
          this.addLine(thread, option.replies[i++], action);
          this.save();
          next();
        });
        return;
      }
      optionsBox.replaceChildren(feedbackCard(option, before, this.state.trust), this.doneButton('Voltar à tela inicial'));
    };
    next();
  }

  private doneButton(label: string, className = 'primary-button'): HTMLElement {
    return el('button', {
      className,
      onclick: () => this.state.ending ? this.ending() : this.home(),
    }, this.state.ending ? 'Ver desfecho' : label);
  }

  // -----------------------------------------
  // LIGAÇÃO: tela de chamada, falas em legenda e resposta com tempo
  // -----------------------------------------
  private call(): void {
    if (!canDo(this.state, 'ligacao')) return this.home();
    const interaction = this.week.interactions.ligacao;
    this.track('action', { action: 'ligacao' });

    const started = Date.now();
    const clock = el('div', { className: 'call-clock' }, '00:00');
    const captions = el('div', { className: 'call-captions', ariaLive: 'polite' });
    const answer = el('div', { className: 'call-answer' });
    const silence = silenceOption(this.protagonist.name);
    let answered = false;
    const hangUp = el('button', {
      className: 'call-hangup',
      title: 'Desligar',
      onclick: async () => {
        if (answered) return this.state.ending ? this.ending() : this.home();
        if (!(await confirmDialog('Desligar sem responder? O silêncio conta como resposta.', { confirm: 'Desligar' }))) return;
        respond(silence, 'desligou');
      },
    }, '📞');

    this.show(null, [
      el('div', { className: 'call-head' },
        this.avatar(this.content.avatar, 'lg'),
        el('div', { className: 'call-name' }, this.protagonist.name),
        clock),
      captions,
    ], {
      // Opções no rodapé, sempre visíveis: com tempo para responder, não dá para rolar a tela
      footer: el('div', { className: 'call-footer' }, answer, el('div', { className: 'call-hangup-row' }, hangUp)),
      bodyClass: 'call-body',
    });

    const tick = () => {
      if (!clock.isConnected) return;
      const s = Math.floor((Date.now() - started) / 1000);
      clock.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      this.later(1000, tick);
    };
    tick();

    const caption = (line: ChatLine) => {
      for (const old of captions.querySelectorAll('.call-line')) old.classList.add('past');
      captions.append(el('div', { className: `call-line ${line.from}` },
        line.from === 'jogador' ? el('span', { className: 'call-speaker' }, `${this.ally.name}: `) : null,
        line.text));
      captions.scrollTo({ top: captions.scrollHeight });
    };

    // Uma fala por vez, no ritmo de uma conversa falada
    const play = (lines: ChatLine[], done: () => void, i = 0) => {
      if (i >= lines.length) return done();
      caption(lines[i]);
      this.later(CAPTION_MS + lines[i].text.length * 25, () => play(lines, done, i + 1));
    };

    // Na hora de responder, o topo da chamada encolhe e só a última fala
    // fica à vista, para as opções caberem sem rolar a tela
    const focus = (on: boolean) => {
      const body = captions.parentElement;
      body?.classList.add('compact');
      body?.classList.toggle('answering', on);
      if (body) body.scrollTop = body.scrollHeight;
    };

    const respond = (option: PonteOption, how: 'escolha' | 'tempo' | 'desligou' = 'escolha') => {
      if (answered) return;
      answered = true;
      focus(false);
      const before = this.commit('ligacao', interaction.opening, option, { answer: how });
      answer.replaceChildren();
      if (option !== silence) caption({ from: 'jogador', text: option.text });
      this.state.chat.push({ from: 'jogador', text: option.text, week: this.state.week, channel: 'ligacao' });
      const replies = option.replies;
      play(replies, () => {
        for (const line of replies) this.state.chat.push({ ...line, week: this.state.week, channel: 'ligacao' });
        this.save();
        answer.replaceChildren(feedbackCard(option, before, this.state.trust));
        hangUp.title = 'Encerrar a ligação';
        hangUp.classList.add('ended');
        hangUp.after(el('span', { className: 'call-hangup-label' }, this.state.ending ? 'Ver desfecho' : 'Desligar'));
      });
    };
    play(interaction.opening, () => {
      const options = visibleOptions(interaction.options, this.state.cards);
      const bar = el('div', { className: 'call-timer-fill' });
      answer.replaceChildren(
        el('div', { className: 'call-timer', title: `Você tem ${CALL_ANSWER_SECONDS} segundos para responder` }, bar),
        ...options.map((option, i) => el('button', {
          className: `chat-option${option.victory ? ' victory' : ''}`,
          onclick: () => respond(option),
        }, el('span', { className: 'chat-option-key' }, String(i + 1)), option.text)),
      );
      this.bindNumberKeys(answer);
      focus(true);
      this.shownAt = performance.now();
      // A barra esvazia no tempo de resposta; no fim, o silêncio responde
      bar.style.animationDuration = `${CALL_ANSWER_SECONDS}s`;
      this.later(CALL_ANSWER_SECONDS * 1000, () => respond(silence, 'tempo'));
    });
  }

  // -----------------------------------------
  // NAVEGADOR (pesquisa) E CARTAS
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
          this.cardDetail(card.id, () => this.home(), true);
        },
      },
        el('span', { className: 'search-query' }, `“${card.searchQuery}”`),
        el('span', { className: 'search-title' }, card.title))),
    ], { back: () => this.home() });
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
      el('p', { className: 'phone-hint' }, 'Use o Navegador, na barra de baixo, para desbloquear cartas.'),
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
      thread,
    ], {
      frame: 'desfecho',
      footer: el('div', { className: 'phone-footer' },
        el('button', {
          className: 'primary-button',
          onclick: () => {
            byId('ponte-screen').classList.add('hidden');
            bindSummaryActions(this.protagonist, this.deps);
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
