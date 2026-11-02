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
import './styles/print.css';

import { protagonists } from '../content/protagonists';
import { DEV } from './core/config';
import { SaveStore } from './core/save';
import { browserStore } from './core/storage';
import { Telemetry } from './core/telemetry';
import { showFragmentosSummary, startFragmentos, type FragmentosDeps } from './modes/fragmentos';
import { showDossieSummary, startDossie } from './modes/dossie';
import { showPonteSummary, startPonte } from './modes/ponte';
import { byId } from './ui/dom';
import { renderHub } from './ui/hub';
import { mountSafetyBar } from './ui/safety';

const store = browserStore();
const saves = new SaveStore(store);
const telemetry = new Telemetry(store);

const deps: FragmentosDeps = {
  saves,
  telemetry,
  // Recarregar garante um palco limpo (áudio, timers, listeners)
  exit: () => location.reload(),
};

mountSafetyBar();
renderHub(protagonists, {
  campaign: id => saves.campaign(id),
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
});

// Acesso para depuração no console: __pnc.telemetry.download()
if (DEV) {
  Object.assign(window, { __pnc: { saves, telemetry } });
}
