// ============================================================
// MODO 1 — "FRAGMENTOS"
// Liga o motor de visual novel aos controles do HUD, ao save da
// campanha e à tela de resumo.
// ============================================================

import type { Protagonist } from '../../../content/types';
import { MusicPlayer } from '../../core/audio';
import { DEV } from '../../core/config';
import { newFragmentos, type SaveStore } from '../../core/save';
import type { Telemetry } from '../../core/telemetry';
import { VNEngine } from '../../engine/vn/VNEngine';
import { blurIfMouse, byId, el } from '../../ui/dom';
import { renderSummary } from './summary';

export interface FragmentosDeps {
  saves: SaveStore;
  telemetry: Telemetry;
  /** Volta ao menu inicial. */
  exit(): void;
}

/** Inicia o Modo 1. `fresh` descarta o progresso salvo da protagonista. */
export function startFragmentos(protagonist: Protagonist, fresh: boolean, deps: FragmentosDeps): void {
  const content = protagonist.fragmentos;
  if (!content) throw new Error(`${protagonist.name} ainda não tem o Modo 1.`);

  const saved = deps.saves.campaign(protagonist.id).fragmentos;
  const state = !fresh && saved && !saved.completed ? saved : newFragmentos(content.start);
  const music = new MusicPlayer();

  const engine = new VNEngine({
    script: content.script,
    state,
    music,
    onChange: s => { deps.saves.updateCampaign(protagonist.id, c => { c.fragmentos = s; }); },
    onEnd: s => {
      music.stop();
      renderSummary(protagonist, s);
    },
    onEvent: (type, data) => deps.telemetry.track(`fragmentos.${type}`, { protagonist: protagonist.id, ...data }),
  });

  deps.telemetry.track('fragmentos.start', { protagonist: protagonist.id, resumed: state === saved });
  bindControls(engine, music, deps, protagonist, content.script);
  byId('stage').style.display = '';
  engine.resume();
}

/** Mostra direto o resumo de um Modo 1 já concluído. */
export function showFragmentosSummary(protagonist: Protagonist, deps: FragmentosDeps): void {
  const state = deps.saves.campaign(protagonist.id).fragmentos;
  if (state?.completed) {
    bindSummaryActions(protagonist, deps);
    renderSummary(protagonist, state);
  }
}

function bindSummaryActions(protagonist: Protagonist, deps: FragmentosDeps): void {
  byId('summary-restart').onclick = () => {
    deps.saves.updateCampaign(protagonist.id, c => { delete c.fragmentos; });
    deps.exit();
  };
  byId('summary-menu').onclick = () => deps.exit();
}

function bindControls(
  engine: VNEngine,
  music: MusicPlayer,
  deps: FragmentosDeps,
  protagonist: Protagonist,
  script: Record<string, unknown>,
): void {
  bindSummaryActions(protagonist, deps);

  // Áudio
  const muteBtn = byId<HTMLButtonElement>('mute-btn');
  const volume = byId<HTMLInputElement>('volume-slider');
  const paintMute = () => {
    muteBtn.classList.toggle('muted', music.muted);
    muteBtn.textContent = music.muted ? '✕' : '♪';
  };
  muteBtn.onclick = e => { music.toggleMute(); paintMute(); blurIfMouse(e); };
  volume.oninput = () => { music.setVolume(Number(volume.value)); paintMute(); };

  // Reiniciar: descarta o progresso do Modo 1 e volta ao menu
  byId<HTMLButtonElement>('restart-btn').onclick = () => {
    if (!confirm('Recomeçar a história do início? O progresso deste modo será perdido.')) return;
    deps.saves.updateCampaign(protagonist.id, c => { delete c.fragmentos; });
    deps.exit();
  };

  // Controles de desenvolvimento
  const skip = byId<HTMLButtonElement>('skip-btn');
  skip.hidden = !DEV;
  skip.onclick = e => { engine.advance(); blurIfMouse(e); };
  if (DEV) {
    const select = el('select', { id: 'dev-scene-select', title: 'Ir para cena (modo dev)' },
      ...Object.keys(script).map(id => el('option', { value: id, textContent: id })),
    );
    select.value = engine.currentScene;
    select.onchange = () => { engine.loadScene(select.value); select.blur(); };
    byId('menu-controls').prepend(select);
  }

  // Avançar com clique em qualquer lugar do palco
  byId('stage').addEventListener('click', e => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, #choices')) return;
    engine.advance();
  });

  // Teclado: Espaço/Enter/→ avançam; 1–9 escolhem uma opção.
  // Teclas dentro de botões e campos seguem o comportamento padrão
  // deles (antes, o preventDefault global impedia ativar as escolhas).
  document.addEventListener('keydown', e => {
    if (!byId('summary-screen').classList.contains('hidden')) return;
    if (byId('stage').style.display === 'none') return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a')) return;

    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      engine.advance();
    } else if (/^[1-9]$/.test(e.key)) {
      engine.chooseByNumber(Number(e.key));
    }
  });
}
