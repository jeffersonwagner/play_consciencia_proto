import { describe, expect, it } from 'vitest';
import { PROFILES, scenarios } from '../content/espelho/scenarios';
import { findTerm, glossary } from '../content/shared/glossary';
import { answer, dominantProfile, newEspelho, profileCounts, shuffled } from '../src/modes/espelho/rules';

const pickProfile = (profile: string) => (s: typeof scenarios[number]) => s.options.findIndex(o => o.profile === profile);

describe('regras do Modo 4', () => {
  it('embaralha as opções sem perder nenhuma', () => {
    const order = shuffled(4, () => 0);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
    expect(order).not.toEqual([0, 1, 2, 3]);
  });

  it('registra as respostas e conclui no último cenário', () => {
    const state = newEspelho(scenarios);
    for (const s of scenarios) answer(state, scenarios, pickProfile('ativo')(s), 1000);
    expect(state.completed).toBe(true);
    expect(() => answer(state, scenarios, 0, 0)).toThrow();
    expect(dominantProfile(profileCounts(state, scenarios))).toBe('ativo');
  });

  it('empate no topo resulta em perfil misto', () => {
    expect(dominantProfile({ ativo: 3, passivo: 3, reprodutor: 1 })).toBe('misto');
    expect(dominantProfile({ ativo: 1, passivo: 2, reprodutor: 4 })).toBe('reprodutor');
  });
});

describe('conteúdo do Modo 4', () => {
  it('tem de 5 a 7 cenários (GDD), com IDs únicos', () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(5);
    expect(scenarios.length).toBeLessThanOrEqual(7);
    expect(new Set(scenarios.map(s => s.id)).size).toBe(scenarios.length);
  });

  it('todo cenário permite agir como aliado e tem conceito no glossário', () => {
    for (const s of scenarios) {
      expect(s.options.some(o => o.profile === 'ativo'), s.id).toBe(true);
      expect(s.options.some(o => o.profile !== 'ativo'), s.id).toBe(true);
      expect(findTerm(s.concept), s.concept).toBeDefined();
    }
  });

  it('todos os perfis têm descrição e o glossário não repete termos', () => {
    for (const p of ['ativo', 'passivo', 'reprodutor', 'misto'] as const) expect(PROFILES[p].description.length).toBeGreaterThan(40);
    expect(new Set(glossary.map(t => t.id)).size).toBe(glossary.length);
  });

  it('é possível obter cada um dos três perfis', () => {
    for (const profile of ['passivo', 'reprodutor'] as const) {
      const state = newEspelho(scenarios);
      for (const s of scenarios) {
        const i = pickProfile(profile)(s);
        answer(state, scenarios, i >= 0 ? i : pickProfile('ativo')(s), 500);
      }
      expect(dominantProfile(profileCounts(state, scenarios))).toBe(profile);
    }
  });
});
