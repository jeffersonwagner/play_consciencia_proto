// Ponto de entrada: carrega estilos e fontes locais, monta a barra de
// segurança e abre o menu inicial.

import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './styles/tokens.css';
import './styles/vn.css';
import './styles/screens.css';
import './styles/hub.css';
import './styles/safety.css';
import './styles/phone.css';
import './styles/desk.css';
import './styles/espelho.css';
import './styles/print.css';

import { protagonists } from '../content/protagonists';
import { DEV } from './core/config';
import { SaveStore } from './core/save';
import { EVALUATION_OFF } from './core/config';
import { browserStore, prefixedStore } from './core/storage';
import { Telemetry } from './core/telemetry';
import { showFragmentosSummary, startFragmentos, type FragmentosDeps } from './modes/fragmentos';
import { showDossieSummary, startDossie } from './modes/dossie';
import { showEspelhoReport, startEspelho } from './modes/espelho';
import { showPonteSummary, startPonte } from './modes/ponte';
import { byId } from './ui/dom';
import { renderHub } from './ui/hub';
import { mountSafetyBar } from './ui/safety';

// Jogo completo aberto na build de avaliação (?avaliacao=0): progresso
// separado, para os testes do pesquisador não se misturarem às participações
const store = EVALUATION_OFF ? prefixedStore(browserStore(), 'teste_') : browserStore();
const saves = new SaveStore(store);
const telemetry = new Telemetry(store);

// "Continuar no Modo N" no fim de um modo: guarda o pedido e recarrega
// (palco limpo, como no exit); o menu, ao abrir, inicia o modo pedido.
const NEXT_MODE_KEY = 'play_consciencia_proximo_modo';
/** Modos do menu aberto por último (na avaliação, só os do ciclo). */
let menuModes: number[] | undefined;

const deps: FragmentosDeps = {
  saves,
  telemetry,
  // Recarregar garante um palco limpo (áudio, timers, listeners)
  exit: () => location.reload(),
  continueTo: {
    allowed: mode => !menuModes || menuModes.includes(mode),
    go: (mode, p) => {
      try { sessionStorage.setItem(NEXT_MODE_KEY, JSON.stringify({ mode, protagonist: p.id })); } catch { /* sem sessão: volta ao menu */ }
      location.reload();
    },
  },
};

function takeNextMode(): { mode: number; protagonist: string } | null {
  try {
    const raw = sessionStorage.getItem(NEXT_MODE_KEY);
    sessionStorage.removeItem(NEXT_MODE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

mountSafetyBar();

export interface HubOptions {
  /** Rodapé com o progresso da participação (build de avaliação). */
  footer?: () => HTMLElement | null;
  /** Modos oferecidos no menu; sem a opção, todos. */
  modes?: number[];
}

function openHub({ footer, modes }: HubOptions = {}): void {
  menuModes = modes;
  renderHub(protagonists, {
    campaign: id => saves.campaign(id),
    espelho: () => saves.espelho(),
    anyDossieDone: () => saves.anyDossieDone(),
    startFragmentos: (p, fresh) => {
      byId('hub-screen').classList.add('hidden');
      startFragmentos(p, fresh, deps);
    },
    showFragmentosSummary: p => {
      byId('hub-screen').classList.add('hidden');
      showFragmentosSummary(p, deps);
    },
    startPonte: (p, ally, fresh) => {
      byId('hub-screen').classList.add('hidden');
      startPonte(p, ally, fresh, deps);
    },
    showPonteSummary: p => {
      byId('hub-screen').classList.add('hidden');
      showPonteSummary(p, deps);
    },
    startDossie: (p, fresh) => {
      byId('hub-screen').classList.add('hidden');
      startDossie(p, fresh, deps);
    },
    showDossieSummary: p => {
      byId('hub-screen').classList.add('hidden');
      showDossieSummary(p, deps);
    },
    startEspelho: fresh => {
      byId('hub-screen').classList.add('hidden');
      startEspelho(fresh, deps);
    },
    showEspelhoReport: () => {
      byId('hub-screen').classList.add('hidden');
      showEspelhoReport(deps);
    },
    footer,
    modes,
  });
  startNextMode(modes);
}

/** Inicia o modo pedido por "Continuar no Modo N", se ele estiver liberado. */
function startNextMode(modes?: number[]): void {
  const next = takeNextMode();
  const p = next && protagonists.find(x => x.id === next.protagonist);
  if (!next || !p || (modes && !modes.includes(next.mode))) return;
  const campaign = saves.campaign(p.id);
  if (next.mode === 2 && p.ponte && campaign.fragmentos?.completed && campaign.fragmentos.ally) {
    const ally = campaign.fragmentos.ally;
    const resume = campaign.ponte?.ally === ally && campaign.ponte.ending === null;
    byId('hub-screen').classList.add('hidden');
    startPonte(p, ally, !resume, deps);
  } else if (next.mode === 3 && p.dossie && campaign.ponte?.ending) {
    const resume = campaign.dossie?.ending === null;
    byId('hub-screen').classList.add('hidden');
    startDossie(p, !resume, deps);
  }
}

// O módulo de pesquisa só entra na build de coleta (npm run build:pesquisa).
// A condição usa import.meta.env diretamente para que, na build oficial,
// o Vite descarte o módulo inteiro (nenhum código de pesquisa é incluído).
if ((import.meta.env.VITE_RESEARCH === '1' && !EVALUATION_OFF) || (import.meta.env.DEV && location.search.includes('pesquisa'))) {
  import('./research').then(m => m.bootResearch({ store, saves, telemetry, protagonists, openHub }));
} else {
  openHub();
}

// Acesso para depuração no console: __pnc.telemetry.download()
if (DEV) {
  Object.assign(window, { __pnc: { saves, telemetry } });
}
