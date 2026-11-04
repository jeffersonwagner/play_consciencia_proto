// ============================================================
// MÓDULO DE PESQUISA (só existe na build de coleta)
// Fluxo do participante:
//   boas-vindas → TCLE → código → questionário pré-jogo (só no Ciclo 2)
//   → jogo (modos definidos na planilha) → questionário final →
//   agradecimento com os canais de apoio.
// O ciclo (aba Config) define os questionários: content/research.
// Tudo é enviado automaticamente para a planilha (ver docs/COLETA.md).
// Fora do período, ou com a coleta desligada na planilha, o jogo abre
// normalmente, sem pesquisa.
// ============================================================

import '../styles/research.css';
import { PLACEHOLDER, instrumentsFor, score, tcle, type QuestionItem, type Questionnaire } from '../../content/research';
import type { Protagonist } from '../../content/types';
import { APP_VERSION, COLLECT_TOKEN, COLLECT_URL } from '../core/config';
import type { SaveStore } from '../core/save';
import type { KeyValueStore } from '../core/storage';
import type { Telemetry, TelemetryEvent } from '../core/telemetry';
import { byId, el } from '../ui/dom';
import { collectionStatus, formatDay, loadConfig, type CollectionConfig, type CollectionStatus } from './collection';
import { eventsToRows, summaryRows } from './export';
import { renderQuestionnaire, type Answers } from './questionnaire';
import { SessionStore, generateCode, newSession, sanitizeGroup, type ResearchSession } from './session';
import { SyncQueue, appsScriptSender, type Row } from './sync';

export interface ResearchBootDeps {
  store: KeyValueStore;
  saves: SaveStore;
  telemetry: Telemetry;
  protagonists: Protagonist[];
  /** Abre o menu do jogo, com os modos e o rodapé de progresso indicados. */
  openHub(options?: { footer?: () => HTMLElement | null; modes?: number[] }): void;
}

const FLUSH_INTERVAL_MS = 20000;

/** Canais de apoio entregues por escrito ao final (TCLE, item 6). */
const SUPPORT_CHANNELS: [string, string][] = [
  ['Ligue 180', 'Central de Atendimento à Mulher — gratuita, 24 horas'],
  ['188', 'Centro de Valorização da Vida (CVV) — 24 horas'],
  ['190', 'Polícia Militar — emergência'],
  ['192', 'SAMU — emergência médica'],
  ['Sua cidade', 'Serviços públicos de saúde mental (CAPS, UBS) e de atendimento à mulher (CRAM, Delegacia da Mulher)'],
];

function toRow(record: Record<string, unknown>): Row {
  const row: Row = {};
  for (const [k, v] of Object.entries(record)) {
    row[k] = v === undefined ? null : typeof v === 'object' && v !== null ? JSON.stringify(v) : v as Row[string];
  }
  return row;
}

export async function bootResearch(deps: ResearchBootDeps): Promise<void> {
  const app = new ResearchApp(deps);
  await app.start();
}

class ResearchApp {
  private sessions: SessionStore;
  private queue: SyncQueue;
  private screen = byId('hub-screen');
  private config: CollectionConfig | null = null;

  constructor(private deps: ResearchBootDeps) {
    this.sessions = new SessionStore(deps.store);
    this.queue = new SyncQueue(deps.store, appsScriptSender(COLLECT_URL, COLLECT_TOKEN));

    deps.telemetry.context = () => {
      const s = this.active();
      return s ? { participant: s.participant, sessionId: s.sessionId } : {};
    };
    deps.telemetry.onTrack(event => this.onEvent(event));

    // Envio periódico, ao voltar a conexão e ao sair da página
    setInterval(() => void this.queue.flush(), FLUSH_INTERVAL_MS);
    window.addEventListener('online', () => void this.queue.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void this.queue.flush();
    });
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') this.researcherPanel();
    });
  }

  /** Participação em andamento (aceitou o TCLE e ainda não terminou). */
  private active(): ResearchSession | null {
    const s = this.sessions.current();
    return s && !s.finishedAt ? s : null;
  }

  private onEvent(event: TelemetryEvent): void {
    const s = this.active();
    if (!s) return;
    this.queue.enqueue('eventos', eventsToRows([event]).map(toRow), { participant: s.participant, startedAt: s.startedAt });
    if (event.type.endsWith('.end')) this.sendParticipant();
  }

  /** Linha-resumo do participante (substitui a anterior na planilha). */
  private sendParticipant(): void {
    const s = this.sessions.current();
    if (!s) return;
    // Sempre uma linha por participante (chave participante|protagonista),
    // mesmo antes de começar a jogar
    const rows = summaryRows(s, this.deps.saves.snapshot(), this.deps.telemetry.events(), this.deps.protagonists)
      .map(r => ({ ...r, protagonista: r.protagonista || s.protagonist }))
      .filter(r => r.protagonista === s.protagonist)
      .map(r => toRow({
        ...r,
        tcle_aceito_em: s.consent.acceptedAt,
        tcle_versao: s.consent.tcleVersion,
        tcle_audio: s.audioConsent,
        ciclo: s.cycle,
        pre_acertos: s.preScore ?? '',
        pos_acertos: s.postScore ?? '',
        modos_exigidos: s.requiredModes.join(','),
        pre_concluido_em: s.preDoneAt ?? '',
        pos_concluido_em: s.postDoneAt ?? '',
        finalizado_em: s.finishedAt ?? '',
      }));
    this.queue.enqueue('participantes', rows, { participant: s.participant, startedAt: s.startedAt });
    void this.queue.flush();
  }

  private banner(): HTMLElement | null {
    return PLACEHOLDER
      ? el('div', { className: 'research-placeholder' }, 'Versão provisória: TCLE e questionários de EXEMPLO. Não use em coleta real.')
      : null;
  }

  private page(...children: (HTMLElement | null | false)[]): void {
    this.screen.classList.remove('hidden');
    this.screen.replaceChildren(...[this.banner(), ...children].filter((c): c is HTMLElement => Boolean(c)));
    this.screen.scrollTop = 0;
  }

  // -----------------------------------------
  // INÍCIO
  // -----------------------------------------
  async start(): Promise<void> {
    const current = this.active();
    if (current) {
      void this.queue.flush();
      const { pre } = instrumentsFor(current.cycle);
      return pre && !current.preDoneAt ? this.questionnaire(pre) : this.openGame();
    }

    this.page(el('p', { className: 'gate-note' }, 'Verificando a coleta de dados…'));
    const { config } = await loadConfig(this.deps.store, COLLECT_URL);
    this.config = config;
    void this.queue.flush();
    const status = collectionStatus(config);
    if (status === 'aberta') this.welcome();
    else this.closed(status);
  }

  /** Jogo da participação: só os modos do ciclo, com o progresso no rodapé. */
  private openGame(): void {
    const s = this.active();
    this.deps.openHub({ footer: () => this.progressFooter(), modes: s?.requiredModes });
  }

  /**
   * Jogo sem coleta (quem não participa, quem já concluiu, ou fora do
   * período): também só com os modos do ciclo. O jogo completo fica para
   * `ativa = NÃO` na planilha, `?avaliacao=0` ou a build oficial.
   */
  private playFree(): void {
    this.deps.openHub({ modes: this.config?.modos ?? this.sessions.current()?.requiredModes });
  }

  private closed(status: CollectionStatus): void {
    // Coleta desligada: o jogo abre direto, sem mencionar a pesquisa
    if (status === 'inativa') return this.deps.openHub();
    const text: Record<Exclude<CollectionStatus, 'aberta' | 'inativa'>, string> = {
      antes: `A coleta de dados da pesquisa começa em ${formatDay(this.config?.inicio ?? '')}.`,
      encerrada: `A coleta de dados da pesquisa foi encerrada em ${formatDay(this.config?.fim ?? '')}. Obrigado a quem participou!`,
      indisponivel: 'Não foi possível verificar a coleta de dados (sem conexão ou período não configurado). Você pode jogar normalmente; nenhum dado será registrado.',
    };
    this.page(
      el('div', { className: 'title-eyebrow' }, 'Pesquisa'),
      el('h1', { className: 'title-main research-title' }, 'Play na Consciência'),
      el('div', { className: 'title-divider' }),
      el('p', { className: 'title-meta' }, this.config?.mensagem || text[status as keyof typeof text]),
      el('button', { className: 'primary-button', onclick: () => this.playFree() }, 'Jogar'),
    );
  }

  // -----------------------------------------
  // BOAS-VINDAS E TCLE
  // -----------------------------------------
  private welcome(): void {
    this.page(
      el('div', { className: 'title-eyebrow' }, 'Pesquisa de mestrado'),
      el('h1', { className: 'title-main' }, 'Play na Consciência'),
      el('div', { className: 'title-divider' }),
      el('p', { className: 'title-meta' }, 'Este jogo faz parte de uma pesquisa sobre jogos sérios e conscientização sobre a violência contra a mulher. A participação é voluntária e anônima: você não informa nome nem dados pessoais.'),
      el('p', { className: 'gate-note' }, `Coleta aberta até ${formatDay(this.config!.fim)}.`),
      el('button', { className: 'primary-button', onclick: () => this.tcleScreen() }, 'Quero participar'),
      el('button', { className: 'secondary-button', onclick: () => this.playFree() }, 'Jogar sem participar da pesquisa'),
    );
  }

  private tcleScreen(): void {
    const checks = tcle.declarations.map(() => el('input', { type: 'checkbox' }));
    const audio = ['Sim', 'Não'].map(v => el('input', { type: 'radio', name: 'tcle-audio', value: v }));
    const error = el('p', { className: 'gate-error', role: 'alert' });
    const accept = () => {
      const audioConsent = audio.find(a => a.checked)?.value;
      if (!checks.every(c => c.checked)) {
        error.textContent = 'Para participar, marque a declaração de consentimento.';
        return;
      }
      if (!audioConsent) {
        error.textContent = 'Responda se autoriza a gravação em áudio (Sim ou Não).';
        return;
      }
      this.beginParticipation(audioConsent);
    };
    const download = () => {
      const text = [
        tcle.title, ...tcle.header,
        ...tcle.sections.flatMap(s => [s.title, ...s.paragraphs]),
        ...tcle.declarations.map(d => `[ ] ${d}`),
        `${tcle.audioQuestion} (  ) Sim  (  ) Não`,
        `Versão do termo: ${tcle.version}`,
      ].join('\n\n');
      const a = el('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })), download: 'TCLE-Play-na-Consciencia.txt' });
      a.click();
    };
    this.page(
      el('div', { className: 'title-eyebrow' }, 'Termo de consentimento'),
      el('h1', { className: 'title-main research-title' }, tcle.title),
      el('div', { className: 'gate-form tcle' },
        ...tcle.header.map(p => el('p', { className: 'tcle-header' }, p)),
        ...tcle.sections.flatMap(s => [el('h2', { className: 'tcle-section' }, s.title), ...s.paragraphs.map(p => el('p', { className: 'tcle-text' }, p))]),
        el('button', { className: 'secondary-button tcle-download', onclick: download }, 'Baixar a minha via deste termo'),
        ...tcle.declarations.map((d, i) => el('label', { className: 'gate-check' }, checks[i], ` ${d}`)),
        el('div', { className: 'tcle-audio' },
          el('p', {}, tcle.audioQuestion),
          ...audio.map(a => el('label', { className: 'gate-check' }, a, ` ${a.value}`))),
        error,
        el('button', { className: 'primary-button', onclick: accept }, 'Aceito participar'),
        el('button', {
          className: 'secondary-button',
          onclick: () => this.page(
            el('h1', { className: 'title-main research-title' }, 'Tudo bem.'),
            el('p', { className: 'title-meta' }, 'Você não vai participar da pesquisa e nenhum dado será registrado. Se quiser, pode jogar normalmente.'),
            el('button', { className: 'primary-button', onclick: () => this.playFree() }, 'Jogar'),
          ),
        }, 'Não aceito'),
      ),
    );
  }

  private beginParticipation(audioConsent: string): void {
    const config = this.config!;
    const session = newSession({
      code: generateCode(),
      group: sanitizeGroup(new URLSearchParams(location.search).get('grupo')),
      appVersion: APP_VERSION,
      tcleVersion: tcle.version,
      requiredModes: config.modos,
      protagonist: config.protagonista,
      cycle: config.ciclo,
      audioConsent,
    });
    // Cada participação começa do zero neste computador
    this.deps.saves.resetAll();
    this.deps.telemetry.clear();
    this.sessions.start(session);
    this.deps.telemetry.track('sessao.inicio', {
      group: session.group,
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
    });
    this.sendParticipant();

    this.page(
      el('div', { className: 'title-eyebrow' }, 'Obrigado por participar'),
      el('h1', { className: 'title-main research-title' }, 'Seu código de participação'),
      el('div', { className: 'research-code' }, session.participant),
      el('p', { className: 'title-meta' }, 'Anote este código. Ele não identifica você, mas permite pedir a retirada dos seus dados da pesquisa, se quiser.'),
      el('button', {
        className: 'primary-button',
        onclick: () => {
          const { pre } = instrumentsFor(session.cycle);
          if (pre) this.questionnaire(pre);
          else this.openGame();
        },
      }, 'Continuar'),
    );
  }

  // -----------------------------------------
  // QUESTIONÁRIOS
  // -----------------------------------------
  private questionnaire(q: Questionnaire): void {
    renderQuestionnaire(this.screen, q, this.banner(), (answers, items) => this.saveAnswers(q, answers, items));
    this.screen.classList.remove('hidden');
  }

  private saveAnswers(q: Questionnaire, answers: Answers, items: QuestionItem[]): void {
    const s = this.active();
    if (!s) return;
    const now = new Date().toISOString();
    const rows = items.map(item => toRow({
      participante: s.participant,
      sessao: s.sessionId,
      questionario: q.id,
      item: item.id,
      dimensao: item.dimension ?? '',
      pergunta: item.text,
      resposta: answers[item.id] ?? '',
      acertou: item.type === 'escolha' && item.correct ? (answers[item.id] === item.correct ? 'SIM' : 'NÃO') : '',
      respondido_em: now,
    }));
    this.queue.enqueue('respostas', rows, { participant: s.participant, startedAt: s.startedAt });
    this.deps.telemetry.track(`questionario.${q.id}`, { items: items.length });

    const { correct, total } = score(q, answers);
    const result = total ? `${correct}/${total}` : undefined;
    if (q.id === instrumentsFor(s.cycle).pre?.id) {
      this.sessions.update(x => { x.preDoneAt = now; x.preScore = result; });
      this.sendParticipant();
      this.openGame();
    } else {
      this.deps.telemetry.track('sessao.fim');
      this.sessions.update(x => { x.postDoneAt = now; x.postScore = result; x.finishedAt = now; });
      this.sendParticipant();
      void this.finished();
    }
  }

  // -----------------------------------------
  // PROGRESSO NO MENU E FIM
  // -----------------------------------------
  private modeDone(mode: number, s: ResearchSession): boolean {
    const c = this.deps.saves.campaign(s.protagonist);
    if (mode === 1) return Boolean(c.fragmentos?.completed);
    if (mode === 2) return Boolean(c.ponte?.ending);
    if (mode === 3) return Boolean(c.dossie?.ending);
    return Boolean(this.deps.saves.espelho()?.completed);
  }

  private progressFooter(): HTMLElement | null {
    const s = this.active();
    if (!s) return null;
    const allDone = s.requiredModes.every(m => this.modeDone(m, s));
    return el('div', { className: 'research-footer' },
      el('span', {}, `Participação ${s.participant}`),
      el('span', { className: 'research-steps' }, ...s.requiredModes.map(m =>
        el('span', { className: this.modeDone(m, s) ? 'done' : '' }, `${this.modeDone(m, s) ? '✓' : '○'} Modo ${m}`))),
      allDone
        ? el('button', { className: 'primary-button', onclick: () => this.questionnaire(instrumentsFor(s.cycle).post) }, 'Responder o questionário final')
        : el('span', {}, 'Ao concluir os modos, responda o questionário final.'),
    );
  }

  private async finished(): Promise<void> {
    const s = this.sessions.current()!;
    this.page(el('p', { className: 'gate-note' }, 'Enviando suas respostas…'));
    const { pending } = await this.queue.flush();
    this.page(
      el('div', { className: 'title-eyebrow' }, 'Participação concluída'),
      el('h1', { className: 'title-main research-title' }, 'Muito obrigado!'),
      el('div', { className: 'research-code' }, s.participant),
      el('p', { className: 'title-meta' }, pending === 0
        ? 'Suas respostas foram enviadas.'
        : 'Suas respostas foram salvas e serão enviadas automaticamente quando houver internet. Por favor, não apague os dados do navegador deste computador.'),
      el('div', { className: 'research-support' },
        el('h2', {}, 'Canais de apoio'),
        el('p', {}, 'Se este tema mexeu com você, converse com o pesquisador, com alguém de confiança ou procure:'),
        el('dl', {}, ...SUPPORT_CHANNELS.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, v)])),
        el('button', { className: 'secondary-button', onclick: () => this.downloadSupport() }, 'Baixar esta lista')),
      el('button', { className: 'primary-button', onclick: () => this.nextParticipant() }, 'Encerrar'),
      el('button', { className: 'secondary-button', onclick: () => this.playFree() }, 'Continuar jogando (sem coleta)'),
    );
  }

  private downloadSupport(): void {
    const text = ['Play na Consciência — Canais de apoio', ...SUPPORT_CHANNELS.map(([k, v]) => `${k}: ${v}`),
      'Pesquisador: Jefferson Wagner Francisco — (11) 91704-9654 — jefferson.francisco@estudante.ufla.br'].join('\n\n');
    el('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })), download: 'Canais-de-apoio.txt' }).click();
  }

  /** Guarda a participação no arquivo local e prepara o computador para a próxima pessoa. */
  private nextParticipant(): void {
    this.sessions.close(this.deps.telemetry.events(), this.deps.saves.snapshot());
    this.deps.saves.resetAll();
    this.deps.telemetry.clear();
    location.reload();
  }

  // -----------------------------------------
  // PAINEL DO PESQUISADOR (Ctrl + Alt + P)
  // -----------------------------------------
  private researcherPanel(): void {
    document.querySelector('.research-panel')?.remove();
    const s = this.sessions.current();
    const status = collectionStatus(this.config);
    const info: [string, string][] = [
      ['Coleta', `${status}${this.config ? ` (${formatDay(this.config.inicio)} a ${formatDay(this.config.fim)})` : ''}`],
      ['Ciclo', String(s?.cycle ?? this.config?.ciclo ?? '—')],
      ['Planilha', COLLECT_URL ? 'configurada' : 'NÃO configurada'],
      ['Participação atual', s ? `${s.participant}${s.finishedAt ? ' (concluída)' : ''}` : '—'],
      ['Lotes aguardando envio', String(this.queue.pending().length)],
      ['Lotes recusados', String(this.queue.rejected().length)],
      ['Último envio', this.queue.lastSentAt ? new Date(this.queue.lastSentAt).toLocaleString('pt-BR') : '—'],
      ['Último erro', this.queue.lastError ?? '—'],
      ['Participações no arquivo local', String(this.sessions.archive().length)],
      ['Versão do jogo', APP_VERSION],
    ];
    const backup = () => {
      const data = { current: s, archive: this.sessions.archive(), pending: this.queue.pending(), rejected: this.queue.rejected() };
      const a = el('a', {
        href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })),
        download: `play-consciencia_copia-de-seguranca_${new Date().toISOString().slice(0, 10)}.json`,
      });
      a.click();
    };
    const panel = el('div', { className: 'research-panel desk-modal' },
      el('div', { className: 'desk-modal-card' },
        el('h2', {}, 'Painel do pesquisador'),
        el('dl', { className: 'research-info' }, ...info.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, v)])),
        el('button', {
          className: 'secondary-button',
          onclick: async () => { await this.queue.flush(); panel.remove(); this.researcherPanel(); },
        }, 'Enviar agora'),
        el('button', { className: 'secondary-button', onclick: backup }, 'Baixar cópia de segurança (JSON)'),
        el('a', { className: 'secondary-button', href: '?avaliacao=0', target: '_blank' }, 'Abrir o jogo completo, sem avaliação'),
        el('button', { className: 'secondary-button', onclick: () => panel.remove() }, 'Fechar'),
      ),
    );
    document.body.append(panel);
  }
}
