import { describe, expect, it } from 'vitest';
import { SAVE_KEY, SaveStore, migrate, newFragmentos } from '../src/core/save';
import type { KeyValueStore } from '../src/core/storage';
import { resolveSceneProp, validateScript } from '../src/engine/vn/script';
import type { Script } from '../src/engine/vn/types';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: k => { data.delete(k); },
  };
}

describe('resolveSceneProp', () => {
  const script: Script = {
    raiz: { label: 'Raiz', bg: 'x/fundo', blocks: [{ type: 'transition', text: '', nextScene: 'FIM' }] },
    filho: { inherit: 'raiz', blocks: [{ type: 'transition', text: '', nextScene: 'FIM' }] },
    neto: { inherit: 'filho', bg: 'x/outro', blocks: [{ type: 'transition', text: '', nextScene: 'FIM' }] },
    ciclo: { inherit: 'ciclo', blocks: [{ type: 'transition', text: '', nextScene: 'FIM' }] },
  };

  it('herda em cadeia (mais de um nível)', () => {
    expect(resolveSceneProp(script, 'neto', 'label')).toBe('Raiz');
    expect(resolveSceneProp(script, 'neto', 'bg')).toBe('x/outro');
  });

  it('não entra em laço com herança circular', () => {
    expect(resolveSceneProp(script, 'ciclo', 'label')).toBeUndefined();
  });
});

describe('validateScript', () => {
  it('aponta destino inexistente, cena inalcançável e fim sem transição', () => {
    const script: Script = {
      a: { bg: 'f', blocks: [{ type: 'choice', options: [{ text: '', label: '', next: 'nao_existe' }] }] },
      solta: { bg: 'f', blocks: [{ type: 'narration', text: 'sem saída' }] },
    };
    const errors = validateScript(script, 'a').join('\n');
    expect(errors).toMatch(/nao_existe/);
    expect(errors).toMatch(/solta: cena inalcançável/);
    expect(errors).toMatch(/solta: o último bloco/);
  });
});

describe('SaveStore', () => {
  it('persiste a campanha por protagonista', () => {
    const store = memoryStore();
    const saves = new SaveStore(store);
    saves.updateCampaign('julia', c => {
      c.fragmentos = { ...newFragmentos('cena1'), ally: 'carla', flags: { apagou_foto: true } };
    });

    const reloaded = new SaveStore(store).campaign('julia');
    expect(reloaded.fragmentos?.ally).toBe('carla');
    expect(reloaded.fragmentos?.flags.apagou_foto).toBe(true);
    expect(new SaveStore(store).campaign('livia').fragmentos).toBeUndefined();
  });

  it('descarta saves de versão desconhecida ou corrompidos', () => {
    expect(migrate({ version: 999, campaigns: {} }).campaigns).toEqual({});
    expect(migrate('lixo').campaigns).toEqual({});
    const saves = new SaveStore(memoryStore({ [SAVE_KEY]: '{json quebrado' }));
    expect(saves.campaign('julia').fragmentos).toBeUndefined();
  });
});
