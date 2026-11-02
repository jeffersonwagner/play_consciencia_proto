// Funções puras sobre o roteiro: resolução de herança e validação.
// Não tocam no DOM, por isso são testadas em tests/content.test.ts.

import { END_SCENE, type Script, type Scene } from './types';

type InheritableKey = 'label' | 'bg' | 'music';

/** Busca label/bg/music na cena ou, se ausente, subindo a cadeia de `inherit`. */
export function resolveSceneProp(script: Script, sceneId: string, key: InheritableKey): string | undefined {
  const seen = new Set<string>();
  let current: Scene | undefined = script[sceneId];
  while (current && !seen.has(sceneId)) {
    if (current[key]) return current[key];
    seen.add(sceneId);
    if (!current.inherit) return undefined;
    sceneId = current.inherit;
    current = script[sceneId];
  }
  return undefined;
}

/** IDs das cenas para as quais uma cena pode seguir. */
export function sceneExits(scene: Scene): string[] {
  const exits: string[] = [];
  for (const block of scene.blocks) {
    if (block.type === 'choice') exits.push(...block.options.map(o => o.next));
    if (block.type === 'transition') exits.push(block.nextScene);
  }
  return exits;
}

export interface AssetRefs {
  sprites: Set<string>;
  backgrounds: Set<string>;
  music: Set<string>;
}

/** Todos os assets referenciados pelo roteiro. */
export function collectAssets(script: Script): AssetRefs {
  const refs: AssetRefs = { sprites: new Set(), backgrounds: new Set(), music: new Set() };
  for (const scene of Object.values(script)) {
    if (scene.bg) refs.backgrounds.add(scene.bg);
    if (scene.music) refs.music.add(scene.music);
    for (const block of scene.blocks) {
      if (block.type === 'dialog' || block.type === undefined) {
        if (block.sprite) refs.sprites.add(block.sprite);
        if (block.secondary) refs.sprites.add(block.secondary.sprite);
      }
    }
  }
  return refs;
}

/**
 * Lista problemas estruturais do roteiro. Lista vazia = roteiro válido.
 * Verifica: cena inicial, destinos e heranças existentes, cenas
 * inalcançáveis e cenas que terminam sem escolha nem transição.
 */
export function validateScript(script: Script, start: string): string[] {
  const errors: string[] = [];
  const ids = new Set(Object.keys(script));

  if (!ids.has(start)) errors.push(`Cena inicial "${start}" não existe.`);

  for (const [id, scene] of Object.entries(script)) {
    if (scene.inherit && !ids.has(scene.inherit)) {
      errors.push(`${id}: herda de "${scene.inherit}", que não existe.`);
    }
    if (scene.blocks.length === 0) {
      errors.push(`${id}: cena sem blocos.`);
      continue;
    }
    for (const next of sceneExits(scene)) {
      if (next !== END_SCENE && !ids.has(next)) errors.push(`${id}: aponta para "${next}", que não existe.`);
    }
    const last = scene.blocks[scene.blocks.length - 1];
    if (last.type !== 'choice' && last.type !== 'transition') {
      errors.push(`${id}: o último bloco precisa ser uma escolha ou uma transição.`);
    }
    scene.blocks.forEach((block, i) => {
      if ((block.type === 'choice' || block.type === 'transition') && i !== scene.blocks.length - 1) {
        errors.push(`${id}: bloco ${i} (${block.type}) não é o último — os blocos seguintes nunca serão exibidos.`);
      }
    });
    if (!resolveSceneProp(script, id, 'bg')) errors.push(`${id}: sem fundo (bg), nem por herança.`);
  }

  // Alcançabilidade a partir da cena inicial
  const reached = new Set<string>();
  const queue = ids.has(start) ? [start] : [];
  while (queue.length) {
    const id = queue.shift()!;
    if (reached.has(id) || !ids.has(id)) continue;
    reached.add(id);
    queue.push(...sceneExits(script[id]));
  }
  for (const id of ids) {
    if (!reached.has(id)) errors.push(`${id}: cena inalcançável a partir de "${start}".`);
  }

  return errors;
}
