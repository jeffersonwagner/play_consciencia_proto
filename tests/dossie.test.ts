import { describe, expect, it } from 'vitest';
import { protagonists } from '../content/protagonists';
import { findProfessional } from '../content/shared/professionals';
import { findViolenceType } from '../content/shared/violence-types';
import type { DossieContent } from '../content/types';
import type { DossieState } from '../src/core/save';
import {
  POSITIVE_THRESHOLD, WAIT_COST,
  canAct, concludeClassification, evaluateTags, globalEnding, missedRecommended, newDossie,
  pendingEvent, performAction, resolveEvent, toggleTag, wait,
} from '../src/modes/dossie/rules';

const withDossie = protagonists.filter(p => p.dossie);
const julia = protagonists.find(p => p.id === 'julia')!.dossie!;

const act = (s: DossieState, c: DossieContent, id: string, prof?: string) =>
  performAction(s, c, c.actions.find(a => a.id === id)!, prof);
const choose = (s: DossieState, c: DossieContent, startsWith: string) =>
  resolveEvent(s, c, pendingEvent(c, s)!.options.find(o => o.text.startsWith(startsWith))!);

describe('regras do Modo 3', () => {
  it('classificação pontua acertos, erros e faltas', () => {
    expect(evaluateTags(julia, ['patrimonial', 'psicologica']).delta).toBe(8);
    expect(evaluateTags(julia, ['patrimonial', 'psicologica', 'gaslighting']).delta).toBe(8);
    const r = evaluateTags(julia, ['patrimonial', 'fisica']);
    expect(r.wrong).toEqual(['fisica']);
    expect(r.missing).toEqual(['psicologica']);
    expect(r.delta).toBe(4 - 5 - 6);
  });

  it('encaminhamentos só depois da classificação, uma vez cada, respeitando o plantão', () => {
    const s = newDossie(50);
    const bo = julia.actions.find(a => a.id === 'bo')!;
    expect(canAct(s, julia, bo)).toBe(false);
    toggleTag(s, 'patrimonial');
    concludeClassification(s, julia);
    expect(() => act(s, julia, 'bo', 'patricia')).toThrow(/plantão/);
    act(s, julia, 'bo', 'norberto');
    expect(canAct(s, julia, bo)).toBe(false);
    expect(s.slot).toBe(1);
  });

  it('dilema bloqueia ações até ser resolvido; esperar custa bem-estar', () => {
    const s = newDossie(50);
    concludeClassification(s, julia);
    wait(s, julia);
    wait(s, julia);
    expect(s.wellbeing).toBe(50 - 12 + 2 * WAIT_COST); // faltaram as duas etiquetas corretas
    expect(pendingEvent(julia, s)?.id).toBe('oferta-notebook');
    expect(canAct(s, julia, julia.actions[0])).toBe(false);
    choose(s, julia, 'Registrar a oferta');
    expect(canAct(s, julia, julia.actions[0])).toBe(true);
  });

  it('sequência: B.O. depois do acolhimento psicológico vale mais', () => {
    const run = (first: string) => {
      const s = newDossie(50);
      concludeClassification(s, julia);
      act(s, julia, 'nae');
      if (first === 'psicologico') act(s, julia, 'psicologico', 'sofia'); else wait(s, julia);
      choose(s, julia, 'Registrar a oferta');
      return act(s, julia, 'bo', 'patricia').delta;
    };
    expect(run('psicologico')).toBe(16);
    expect(run('esperar')).toBe(12);
  });

  it('final global combina Modo 2 e Modo 3', () => {
    expect(globalEnding('positivo', 'positivo')).toBe('positivo');
    expect(globalEnding('negativo', 'positivo')).toBe('neutro');
    expect(globalEnding('negativo', 'neutro')).toBe('negativo');
    expect(globalEnding(null, 'neutro')).toBe('neutro');
    expect(globalEnding('positivo', 'negativo')).toBe('negativo');
  });
});

describe('balanceamento do caso da Júlia', () => {
  function idealPath(start: number): DossieState {
    const s = newDossie(start);
    toggleTag(s, 'patrimonial');
    toggleTag(s, 'psicologica');
    concludeClassification(s, julia);
    act(s, julia, 'nae');
    act(s, julia, 'psicologico', 'sofia');
    choose(s, julia, 'Registrar a oferta');
    act(s, julia, 'bo', 'patricia');
    act(s, julia, 'juridico', 'helena');
    act(s, julia, 'mpu');
    return s;
  }

  it('o caminho ideal termina no final positivo mesmo partindo do pior Modo 2', () => {
    const s = idealPath(julia.startWellbeing.negativo);
    expect(s.ending).toBe('positivo');
    expect(s.wellbeing).toBeGreaterThanOrEqual(POSITIVE_THRESHOLD);
    expect(missedRecommended(s, julia)).toEqual([]);
  });

  it('um caminho apressado e com profissionais enviesados termina no final negativo', () => {
    const s = newDossie(julia.startWellbeing.neutro);
    toggleTag(s, 'fisica');
    concludeClassification(s, julia);
    act(s, julia, 'bo', 'norberto');
    act(s, julia, 'psicologico', 'amilcar');
    choose(s, julia, 'Sugerir que ela aceite');
    act(s, julia, 'mediacao');
    expect(s.ending).toBe('negativo');
  });
});

describe.each(withDossie.map(p => [p.name, p.dossie!] as const))('conteúdo do Modo 3 — %s', (_name, c) => {
  it('etiquetas e profissionais existem', () => {
    for (const t of [...c.correctTags, ...c.acceptableTags]) expect(findViolenceType(t), t).toBeDefined();
    for (const id of Object.keys(c.availability)) expect(findProfessional(id), id).toBeDefined();
  });

  it('cada ação tem resultado para cada profissional listado, e todo profissional tem plantão', () => {
    for (const a of c.actions) {
      const profs = a.professionals ?? ['default'];
      for (const p of profs) expect(a.outcomes[p], `${a.id}/${p}`).toBeDefined();
      for (const p of a.professionals ?? []) expect(c.availability[p]?.length, `plantão de ${p}`).toBeGreaterThan(0);
      for (const seq of a.sequence ?? []) expect(c.actions.some(x => x.id === seq.after), seq.after).toBe(true);
    }
  });

  it('eventos caem em períodos válidos e têm opção boa e ruim', () => {
    for (const e of c.events) {
      expect(e.slot).toBeLessThan(c.slots.length);
      expect(Math.max(...e.options.map(o => o.delta))).toBeGreaterThan(0);
      expect(Math.min(...e.options.map(o => o.delta))).toBeLessThan(0);
    }
  });

  it('o relato muda conforme o Modo 2', () => {
    const base = { flags: {}, ally: 'carla', allyName: 'Carla' };
    const pos = c.relato({ ...base, ponteEnding: 'positivo' }).join(' ');
    const neg = c.relato({ ...base, ponteEnding: 'negativo' }).join(' ');
    expect(pos).not.toEqual(neg);
  });
});
