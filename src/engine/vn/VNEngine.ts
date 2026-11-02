// ============================================================
// MOTOR DE VISUAL NOVEL
// Executa um roteiro (Script) sobre os elementos do #stage do index.html.
// Não conhece protagonistas nem modos: recebe o estado a mutar e avisa
// por callbacks quando algo muda (para salvar) e quando o roteiro termina.
// ============================================================

import { assetPath, assetUrl } from '../../core/assets';
import type { MusicPlayer } from '../../core/audio';
import type { FragmentosState } from '../../core/save';
import { byId } from '../../ui/dom';
import { showViolenceIndicator } from '../../ui/violenceIndicator';
import { resolveSceneProp } from './script';
import {
  END_SCENE,
  type Block, type ChoiceBlock, type ChoiceOption, type DialogBlock,
  type Position, type Script, type TransitionBlock,
} from './types';

export interface VNEngineOptions {
  script: Script;
  state: FragmentosState;
  music: MusicPlayer;
  /** Chamado sempre que o estado muda (para salvar). */
  onChange(state: FragmentosState): void;
  /** Chamado ao chegar em uma transição para END_SCENE. */
  onEnd(state: FragmentosState): void;
  /** Eventos para o registro de pesquisa. */
  onEvent?(type: string, data: Record<string, unknown>): void;
}

const TRANSITION_MS = 2200;

export class VNEngine {
  private script: Script;
  private state: FragmentosState;
  private opts: VNEngineOptions;
  private blockShownAt = 0;

  constructor(opts: VNEngineOptions) {
    this.opts = opts;
    this.script = opts.script;
    this.state = opts.state;
  }

  get currentScene(): string {
    return this.state.currentScene;
  }

  /** Começa (ou retoma) do ponto salvo no estado. */
  resume(): void {
    this.loadScene(this.state.currentScene, this.state.blockIndex);
  }

  // -----------------------------------------
  // CARREGAMENTO DE CENA
  // -----------------------------------------
  loadScene(sceneId: string, startIndex = 0): void {
    const scene = this.script[sceneId];
    if (!scene) {
      console.error('Cena não encontrada:', sceneId);
      return;
    }

    this.state.currentScene = sceneId;
    this.state.blockIndex = startIndex;

    // Marca aliado se a cena define um
    if (scene.setAlly) this.state.ally = scene.setAlly;

    // Fundo, rótulo e música podem estar na cena ou ser herdados
    const bg = resolveSceneProp(this.script, sceneId, 'bg');
    const music = resolveSceneProp(this.script, sceneId, 'music');
    this.setBackground(bg);
    byId('scene-label').textContent = this.sceneLabel(sceneId);
    this.opts.music.update(music ? assetUrl(assetPath.music(music)) : null);

    this.opts.onEvent?.('scene', { scene: sceneId });
    this.opts.onChange(this.state);
    this.renderBlock();
  }

  private sceneLabel(sceneId: string): string {
    return resolveSceneProp(this.script, sceneId, 'label') ?? '';
  }

  // -----------------------------------------
  // RENDERIZAÇÃO DE BLOCO
  // -----------------------------------------
  private renderBlock(): void {
    const block = this.currentBlock();
    if (!block) {
      console.warn('Fim dos blocos da cena', this.state.currentScene);
      return;
    }

    byId('choices').classList.remove('visible');
    this.blockShownAt = performance.now();

    switch (block.type) {
      case 'choice':
        this.renderChoice(block);
        break;
      case 'transition':
        this.renderTransition(block);
        break;
      case 'narration':
        this.renderDialog(null, block.text);
        break;
      default:
        this.renderDialog(block, block.text);
    }

    // Fala ou narração marcada: mostra o indicador e registra no resumo
    if (block.type !== 'choice' && block.type !== 'transition' && block.violence) {
      showViolenceIndicator(block.violence, block.violenceExplanation);

      // Evita duplicatas ao reler o mesmo bloco (ex.: ao retomar o save)
      const alreadyLogged = this.state.choices.some(c =>
        c.scene === this.state.currentScene && c.violence === block.violence && c.isNarrative === true,
      );
      if (!alreadyLogged) {
        this.state.choices.push({
          scene: this.state.currentScene,
          sceneLabel: this.sceneLabel(this.state.currentScene) || this.state.currentScene,
          choice: block.type === 'narration' ? '(momento narrativo)' : `${block.speaker} (fala marcada por violência)`,
          violence: block.violence,
          violenceExplanation: block.violenceExplanation || null,
          isNarrative: true,
        });
      }
    }

    this.opts.onChange(this.state);
  }

  private currentBlock(): Block | undefined {
    return this.script[this.state.currentScene]?.blocks[this.state.blockIndex];
  }

  private renderDialog(block: DialogBlock | null, text: string): void {
    const speakerEl = byId('speaker-name');
    const textEl = byId('dialog-text');

    this.setCharacters(block);

    if (block) {
      speakerEl.textContent = block.speaker || '';
      textEl.className = '';
    } else {
      speakerEl.textContent = '';
      textEl.className = 'narration';
    }
    textEl.textContent = text || '';

    byId('dialog-box').classList.add('visible');
    byId('continue-indicator').classList.add('visible');
  }

  private renderChoice(block: ChoiceBlock): void {
    const choicesEl = byId('choices');
    byId('dialog-box').classList.remove('visible');
    byId('continue-indicator').classList.remove('visible');

    choicesEl.replaceChildren();

    if (block.question) {
      const q = document.createElement('div');
      q.className = 'choice-question';
      q.textContent = block.question;
      choicesEl.append(q);
    }

    block.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-button';
      btn.textContent = opt.text;
      btn.style.animationDelay = `${i * 100}ms`;
      btn.dataset.key = String(i + 1);
      btn.onclick = () => this.makeChoice(opt);
      choicesEl.append(btn);
    });

    choicesEl.classList.add('visible');
  }

  private renderTransition(block: TransitionBlock): void {
    const transEl = byId('scene-transition');
    byId('scene-transition-text').textContent = block.text || '';
    transEl.classList.add('active');

    // Esconde caixa de diálogo durante transição
    byId('dialog-box').classList.remove('visible');
    byId('continue-indicator').classList.remove('visible');
    this.clearCharacters();

    setTimeout(() => {
      if (block.nextScene === END_SCENE) {
        this.state.completed = true;
        this.opts.onEvent?.('end', { ally: this.state.ally, flags: this.state.flags });
        this.opts.onChange(this.state);
        transEl.classList.remove('active');
        this.opts.onEnd(this.state);
      } else {
        this.loadScene(block.nextScene);
        setTimeout(() => transEl.classList.remove('active'), 200);
      }
    }, TRANSITION_MS);
  }

  // -----------------------------------------
  // PERSONAGENS E CENÁRIO
  // -----------------------------------------
  private setBackground(bgId: string | undefined): void {
    if (!bgId) return;
    const bg = byId('background');
    bg.classList.add('fade-out');
    setTimeout(() => {
      bg.style.backgroundImage = `url('${assetUrl(assetPath.background(bgId))}')`;
      bg.classList.remove('fade-out');
    }, 400);
  }

  private setCharacters(block: DialogBlock | null): void {
    const container = byId('characters');
    container.replaceChildren();
    if (!block?.sprite) return;

    // Sprite primário (quem está falando — destacado)
    container.append(this.createCharacter(block.sprite, block.position || 'center', false));

    // Sprite secundário (acompanhante na cena — escurecido)
    if (block.secondary) {
      container.append(this.createCharacter(block.secondary.sprite, block.secondary.position, true));
    }

    // Anima entrada
    requestAnimationFrame(() => {
      container.querySelectorAll('.character').forEach(c => c.classList.add('visible'));
    });
  }

  private createCharacter(spriteId: string, position: Position, isInactive: boolean): HTMLImageElement {
    const img = document.createElement('img');
    img.src = assetUrl(assetPath.sprite(spriteId));
    img.className = `character ${position}${isInactive ? ' inactive' : ''}`;
    img.alt = '';
    return img;
  }

  private clearCharacters(): void {
    byId('characters').replaceChildren();
  }

  // -----------------------------------------
  // ESCOLHAS
  // -----------------------------------------
  /** Escolhe pela posição (1, 2, …), usado pelos atalhos numéricos. */
  chooseByNumber(n: number): void {
    const block = this.currentBlock();
    if (block?.type !== 'choice') return;
    const option = block.options[n - 1];
    if (option) this.makeChoice(option);
  }

  private makeChoice(option: ChoiceOption): void {
    this.state.choices.push({
      scene: this.state.currentScene,
      sceneLabel: this.sceneLabel(this.state.currentScene),
      choice: option.label,
      violence: option.violence || null,
      violenceExplanation: option.violenceExplanation || null,
    });
    if (option.set) Object.assign(this.state.flags, option.set);

    this.opts.onEvent?.('choice', {
      scene: this.state.currentScene,
      choice: option.label,
      next: option.next,
      decisionMs: Math.round(performance.now() - this.blockShownAt),
    });

    if (option.violence) showViolenceIndicator(option.violence, option.violenceExplanation);

    this.loadScene(option.next);
  }

  // -----------------------------------------
  // AVANÇAR DIÁLOGO (clique / teclado)
  // -----------------------------------------
  advance(): void {
    const scene = this.script[this.state.currentScene];
    const block = this.currentBlock();

    // Escolhas e transições não avançam com clique
    if (!block || block.type === 'choice' || block.type === 'transition') return;

    if (this.state.blockIndex + 1 >= scene.blocks.length) {
      // O validador garante que isso não ocorre nos roteiros publicados
      console.error('Cena terminou sem escolha nem transição:', this.state.currentScene);
      return;
    }

    this.state.blockIndex++;
    this.renderBlock();
  }
}
