// Validador de conteúdo: roda em `npm run validate` e antes de toda build.
// Falha se algum roteiro tiver cena quebrada/inalcançável ou se um
// sprite, fundo ou música referenciado não existir em public/.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { protagonists } from '../content/protagonists';
import { assetPath } from '../src/core/assets';
import { collectAssets, validateScript } from '../src/engine/vn/script';

const PUBLIC = join(__dirname, '..', 'public');

const withFragmentos = protagonists.filter(p => p.fragmentos);

describe('registro de protagonistas', () => {
  it('tem IDs únicos', () => {
    const ids = protagonists.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe.each(withFragmentos.map(p => [p.name, p] as const))('Modo 1 — %s', (_name, p) => {
  const content = p.fragmentos!;

  it('roteiro estruturalmente válido', () => {
    expect(validateScript(content.script, content.start)).toEqual([]);
  });

  it('todos os assets referenciados existem', () => {
    const refs = collectAssets(content.script);
    const missing = [
      ...[...refs.sprites].map(assetPath.sprite),
      ...[...refs.backgrounds].map(assetPath.background),
      ...[...refs.music].map(assetPath.music),
    ].filter(path => !existsSync(join(PUBLIC, path)));
    expect(missing).toEqual([]);
  });

  it('todo aliado definido na Cena 5 está descrito', () => {
    const allies = Object.values(content.script).map(s => s.setAlly).filter(Boolean) as string[];
    expect(allies.length).toBeGreaterThan(0);
    for (const ally of allies) expect(content.allies[ally], ally).toBeDefined();
  });
});
