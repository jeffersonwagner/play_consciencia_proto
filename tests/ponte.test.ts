import { describe, expect, it } from 'vitest';
import type { PonteOption } from '../content/types';
import {
  ACTION_COST, AP_PER_WEEK, CALL_SILENCE_DELTA, WEEKS,
  applyOption, canDo, endWeek, newPonte, silenceOption, spend, unlockCard, visibleOptions,
} from '../src/modes/ponte/rules';

const opt = (delta: number, extra: Partial<PonteOption> = {}): PonteOption =>
  ({ text: `delta ${delta}`, replies: [], delta, feedback: '', ...extra });

describe('Pontos de Ação', () => {
  it('cada ação custa PA e só pode ser usada uma vez por semana', () => {
    const s = newPonte('carla', 50);
    spend(s, 'ligacao');
    expect(s.ap).toBe(AP_PER_WEEK - ACTION_COST.ligacao);
    expect(canDo(s, 'ligacao')).toBe(false);
    expect(canDo(s, 'visita')).toBe(false); // 3 PA, só resta 1
    expect(canDo(s, 'mensagem')).toBe(true);
    expect(() => spend(s, 'visita')).toThrow();
  });

  it('PA e ações se renovam na semana seguinte', () => {
    const s = newPonte('carla', 50);
    spend(s, 'visita');
    endWeek(s);
    expect(s.week).toBe(1);
    expect(s.ap).toBe(AP_PER_WEEK);
    expect(canDo(s, 'visita')).toBe(true);
  });
});

describe('Confiança e finais', () => {
  it('limita a confiança entre 0 e 100 e encerra nos extremos', () => {
    const alto = newPonte('carla', 90);
    applyOption(alto, 'visita', opt(25, { victory: true }));
    expect(alto.trust).toBe(100);
    expect(alto.ending).toBe('positivo');
    expect(alto.victory).toBe(true);

    const baixo = newPonte('lucia', 5);
    applyOption(baixo, 'ligacao', opt(-8));
    expect(baixo.trust).toBe(0);
    expect(baixo.ending).toBe('negativo');
    expect(canDo(baixo, 'mensagem')).toBe(false);
  });

  it('ao fim da última semana o final depende da confiança', () => {
    const run = (trust: number) => {
      const s = newPonte('carla', trust);
      for (let w = 0; w < WEEKS; w++) endWeek(s);
      return s;
    };
    expect(run(50).ending).toBe('neutro');
    expect(run(49).ending).toBe('negativo');
    expect(run(70).trustByWeek).toHaveLength(WEEKS);
  });

  it('opções que exigem carta só aparecem com a carta', () => {
    const options = [opt(8), opt(25, { requiresCard: 'violencia-patrimonial', victory: true })];
    const s = newPonte('carla', 50);
    expect(visibleOptions(options, s.cards)).toHaveLength(1);
    unlockCard(s, 'violencia-patrimonial');
    unlockCard(s, 'violencia-patrimonial');
    expect(s.cards).toEqual(['violencia-patrimonial']);
    expect(visibleOptions(options, s.cards)).toHaveLength(2);
  });
});

describe('Ligação sem resposta', () => {
  it('o silêncio conta como resposta: reduz a confiança e fica no histórico', () => {
    const s = newPonte('carla', 50);
    spend(s, 'ligacao');
    applyOption(s, 'ligacao', silenceOption('Júlia'));
    expect(CALL_SILENCE_DELTA).toBeLessThan(0);
    expect(s.trust).toBe(50 + CALL_SILENCE_DELTA);
    expect(s.log.at(-1)).toMatchObject({ action: 'ligacao', choice: '(silêncio)' });
    expect(silenceOption('Júlia').replies[0].text).toContain('Júlia');
  });
});
