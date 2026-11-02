// ============================================================
// MENU INICIAL (HUB)
// 1º passo: escolher a protagonista. 2º passo: escolher o modo.
// Protagonistas sem conteúdo aparecem como "em produção"; modos ainda
// não implementados aparecem como "em desenvolvimento".
// ============================================================

import type { Protagonist } from '../../content/types';
import { DEV, EVALUATION_OFF, LOCK_PROGRESSION } from '../core/config';
import type { Campaign, EspelhoState } from '../core/save';
import { byId, el } from './dom';

export interface HubActions {
  campaign(id: string): Campaign;
  espelho(): EspelhoState | undefined;
  anyDossieDone(): boolean;
  startFragmentos(p: Protagonist, fresh: boolean): void;
  showFragmentosSummary(p: Protagonist): void;
  startPonte(p: Protagonist, ally: string, fresh: boolean): void;
  showPonteSummary(p: Protagonist): void;
  startDossie(p: Protagonist, fresh: boolean): void;
  showDossieSummary(p: Protagonist): void;
  startEspelho(fresh: boolean): void;
  showEspelhoReport(): void;
  /** Rodapé extra (progresso da participação, na build de avaliação). */
  footer?(): HTMLElement | null;
  /** Modos oferecidos (na avaliação, só os do ciclo); sem a opção, todos. */
  modes?: number[];
}

const MODES = [
  { n: 1, name: 'Fragmentos', perspective: 'A perspectiva da vítima' },
  { n: 2, name: 'A Ponte', perspective: 'A perspectiva da rede de apoio' },
  { n: 3, name: 'Dossiê 180', perspective: 'A perspectiva do sistema de proteção' },
  { n: 4, name: 'O Espelho', perspective: 'A perspectiva da autorreflexão' },
];

export function renderHub(protagonists: Protagonist[], actions: HubActions): void {
  const screen = byId('hub-screen');
  screen.classList.remove('hidden');
  showProtagonists(screen, protagonists, actions);
}

function footerOf(actions: HubActions): HTMLElement[] {
  const footer = actions.footer?.();
  return footer ? [footer] : [];
}

function header(sub: string): HTMLElement[] {
  return [
    el('div', { className: 'title-eyebrow' }, `Jogo Sério · Protótipo de Pesquisa${EVALUATION_OFF ? ' · jogo completo, sem avaliação' : ''}${DEV ? ' · modo dev' : ''}`),
    el('h1', { className: 'title-main' }, 'Play na Consciência'),
    el('div', { className: 'title-sub' }, sub),
    el('div', { className: 'title-divider' }),
  ];
}

function showProtagonists(screen: HTMLElement, protagonists: Protagonist[], actions: HubActions): void {
  const cards = protagonists.map(p => {
    const available = Boolean(p.fragmentos);
    return el('button', {
      className: 'hub-card',
      disabled: !available,
      onclick: () => showModes(screen, p, protagonists, actions),
    },
      el('span', { className: 'hub-card-name' }, p.name),
      el('span', { className: 'hub-card-role' }, `${p.role}, ${p.age} anos`),
      el('span', { className: 'hub-card-focus' }, p.focus),
      !available && el('span', { className: 'hub-card-badge' }, 'Em produção'),
    );
  });

  screen.replaceChildren(
    ...header('Escolha uma história'),
    el('div', { className: 'hub-grid' }, ...cards),
    ...footerOf(actions),
  );
  screen.scrollTop = 0;
}

function modeInfo(mode: typeof MODES[number]): HTMLElement {
  return el('div', { className: 'hub-mode-info' },
    el('span', { className: 'hub-mode-name' }, `Modo ${mode.n} — ${mode.name}`),
    el('span', { className: 'hub-mode-perspective' }, mode.perspective),
  );
}

function disabledMode(mode: typeof MODES[number], badge: string): HTMLElement {
  return el('div', { className: 'hub-mode hub-mode-disabled' },
    modeInfo(mode),
    el('span', { className: 'hub-card-badge' }, badge),
  );
}

const confirmRestart = () => confirm('Começar de novo? O progresso deste modo será perdido.');

function showModes(screen: HTMLElement, p: Protagonist, protagonists: Protagonist[], actions: HubActions): void {
  const content = p.fragmentos!;
  const campaign = actions.campaign(p.id);
  const progress = campaign.fragmentos;

  // Modo 1
  const modo1 = el('div', { className: 'hub-mode' },
    modeInfo(MODES[0]),
    el('div', { className: 'hub-mode-actions' },
      progress && !progress.completed && el('button', {
        className: 'primary-button',
        onclick: () => actions.startFragmentos(p, false),
      }, 'Continuar de onde parei'),
      progress?.completed && el('button', {
        className: 'primary-button',
        onclick: () => actions.showFragmentosSummary(p),
      }, 'Ver resumo'),
      el('button', {
        className: progress ? 'secondary-button' : 'primary-button',
        onclick: () => {
          if (progress && !confirmRestart()) return;
          actions.startFragmentos(p, true);
        },
      }, progress ? 'Começar de novo' : 'Iniciar a história'),
    ),
  );

  // Modo 2: o aliado vem da Cena 5 do Modo 1. No modo dev, sem o Modo 1
  // concluído, dá para escolher qualquer aliado para testar.
  const allyFromModo1 = progress?.completed ? progress.ally : null;
  const ponte = campaign.ponte;
  let modo2: HTMLElement;
  if (!p.ponte) {
    modo2 = disabledMode(MODES[1], 'Em desenvolvimento');
  } else if (LOCK_PROGRESSION && !allyFromModo1) {
    modo2 = disabledMode(MODES[1], 'Conclua o Modo 1');
  } else {
    const allies = allyFromModo1 ? [allyFromModo1] : Object.keys(p.ponte.allies);
    const canResume = ponte && ponte.ending === null && allies.includes(ponte.ally);
    modo2 = el('div', { className: 'hub-mode' },
      modeInfo(MODES[1]),
      el('div', { className: 'hub-mode-actions' },
        canResume && el('button', {
          className: 'primary-button',
          onclick: () => actions.startPonte(p, ponte.ally, false),
        }, 'Continuar de onde parei'),
        ponte?.ending && el('button', {
          className: 'primary-button',
          onclick: () => actions.showPonteSummary(p),
        }, 'Ver resumo'),
        ...allies.map(ally => el('button', {
          className: ponte ? 'secondary-button' : 'primary-button',
          onclick: () => {
            if (ponte && !confirmRestart()) return;
            actions.startPonte(p, ally, true);
          },
        }, `${ponte ? 'Começar de novo' : 'Iniciar'} como ${p.ponte!.allies[ally].name}`)),
      ),
    );
  }

  // Modo 3: o caso chega à rede depois do Modo 2 (qualquer final)
  const modo2Done = Boolean(ponte?.ending);
  const dossie = campaign.dossie;
  let modo3: HTMLElement;
  if (!p.dossie) {
    modo3 = disabledMode(MODES[2], 'Em desenvolvimento');
  } else if (LOCK_PROGRESSION && !modo2Done) {
    modo3 = disabledMode(MODES[2], 'Conclua o Modo 2');
  } else {
    modo3 = el('div', { className: 'hub-mode' },
      modeInfo(MODES[2]),
      el('div', { className: 'hub-mode-actions' },
        dossie && dossie.ending === null && el('button', {
          className: 'primary-button',
          onclick: () => actions.startDossie(p, false),
        }, 'Continuar de onde parei'),
        dossie?.ending && el('button', {
          className: 'primary-button',
          onclick: () => actions.showDossieSummary(p),
        }, 'Ver resumo'),
        el('button', {
          className: dossie ? 'secondary-button' : 'primary-button',
          onclick: () => {
            if (dossie && !confirmRestart()) return;
            actions.startDossie(p, true);
          },
        }, dossie ? 'Começar de novo' : 'Abrir o caso'),
      ),
    );
  }

  // Modo 4: global (o mesmo para todas as protagonistas)
  const espelho = actions.espelho();
  const modo4 = LOCK_PROGRESSION && !actions.anyDossieDone()
    ? disabledMode(MODES[3], 'Conclua o Modo 3')
    : el('div', { className: 'hub-mode' },
      modeInfo(MODES[3]),
      el('div', { className: 'hub-mode-actions' },
        espelho && !espelho.completed && el('button', {
          className: 'primary-button',
          onclick: () => actions.startEspelho(false),
        }, 'Continuar de onde parei'),
        espelho?.completed && el('button', {
          className: 'primary-button',
          onclick: () => actions.showEspelhoReport(),
        }, 'Ver relatório'),
        el('button', {
          className: espelho ? 'secondary-button' : 'primary-button',
          onclick: () => {
            if (espelho && !confirmRestart()) return;
            actions.startEspelho(true);
          },
        }, espelho ? 'Começar de novo' : 'Olhar o espelho'),
      ),
    );

  // Na avaliação, só os modos do ciclo aparecem no menu
  const modeRows = [modo1, modo2, modo3, modo4].filter((_, i) => !actions.modes || actions.modes.includes(i + 1));

  screen.replaceChildren(
    ...header(p.name),
    el('p', { className: 'title-meta' }, content.synopsis),
    el('div', { className: 'hub-modes' }, ...modeRows),
    el('div', { className: 'trigger-warning' },
      el('strong', {}, 'Aviso de Conteúdo'),
      `${p.contentWarning} O conteúdo foi elaborado com finalidade educativa, em contexto de pesquisa acadêmica de mestrado. Se este tema afetar você pessoalmente, considere fazer a experiência em companhia de alguém de confiança, ou buscar apoio: `,
      el('strong', { className: 'trigger-warning-helpline' }, 'Central de Atendimento à Mulher — disque 180'),
      '.',
    ),
    el('button', {
      className: 'secondary-button hub-back',
      onclick: () => showProtagonists(screen, protagonists, actions),
    }, '← Outras histórias'),
    ...footerOf(actions),
  );
  screen.scrollTop = 0;
}
