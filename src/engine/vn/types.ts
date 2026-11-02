// ============================================================
// FORMATO DO ROTEIRO DE VISUAL NOVEL
// Cada cena contém uma sequência de "blocos":
//   { type: "dialog" (padrão), speaker, text, sprite?, position?, secondary?, violence? }
//   { type: "narration", text, violence? }
//   { type: "choice", question?, options: [{ text, label, next, set?, violence? }] }
//   { type: "transition", text, nextScene }
// Sprites, fundos e músicas são referenciados por ID (ver src/core/assets.ts):
//   sprite "julia/neutra"            → assets/characters/julia/neutra.webp
//   bg     "julia/cena01_festa"      → assets/backgrounds/julia/cena01_festa.webp
//   music  "musica_festa"            → assets/audio/music/musica_festa.mp3
// ============================================================

export type Position = 'left' | 'center' | 'right';
export type FlagValue = boolean | number | string;

/** Marca educativa: mostra o indicador de violência e registra no resumo. */
export interface ViolenceMark {
  violence?: string;
  violenceExplanation?: string;
}

export interface SpriteRef {
  sprite: string;
  position: Position;
}

export interface DialogBlock extends ViolenceMark {
  type?: 'dialog';
  speaker: string;
  text: string;
  sprite?: string;
  position?: Position;
  /** Personagem acompanhante na cena (aparece escurecido). */
  secondary?: SpriteRef;
}

export interface NarrationBlock extends ViolenceMark {
  type: 'narration';
  text: string;
}

export interface ChoiceOption extends ViolenceMark {
  text: string;
  /** Rótulo curto usado no resumo final. */
  label: string;
  next: string;
  /** Flags gravadas no estado da campanha (lidas pelos Modos 2 e 3). */
  set?: Record<string, FlagValue>;
}

export interface ChoiceBlock {
  type: 'choice';
  question?: string;
  options: ChoiceOption[];
}

export interface TransitionBlock {
  type: 'transition';
  text: string;
  /** ID da próxima cena, ou END_SCENE para encerrar o modo. */
  nextScene: string;
}

export type Block = DialogBlock | NarrationBlock | ChoiceBlock | TransitionBlock;

export interface Scene {
  label?: string;
  bg?: string;
  music?: string;
  /** Herda label, bg e music de outra cena (resolvido em cadeia). */
  inherit?: string;
  /** Define o aliado jogável no Modo 2. */
  setAlly?: string;
  blocks: Block[];
}

export type Script = Record<string, Scene>;

export const END_SCENE = 'FIM';
