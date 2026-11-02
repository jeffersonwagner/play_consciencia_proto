// Validador do conteúdo do Modo 2 + conferência do balanceamento
// descrito em docs/MODO2.md.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { protagonists } from '../content/protagonists';
import { cards } from '../content/shared/cards';
import type { PonteAction, PonteAllyContent } from '../content/types';
import { assetPath } from '../src/core/assets';
import { ACTION_COST, AP_PER_WEEK, WEEKS, visibleOptions } from '../src/modes/ponte/rules';

const PUBLIC = join(__dirname, '..', 'public');
const ACTIONS: PonteAction[] = ['mensagem', 'ligacao', 'visita'];

/** Combinações de ações possíveis numa semana (cada uma no máximo uma vez). */
function weekPlans(): { actions: PonteAction[]; research: boolean }[] {
  const plans = [];
  for (let mask = 0; mask < 16; mask++) {
    const actions = ACTIONS.filter((_, i) => mask & (1 << i));
    const research = Boolean(mask & 8);
    const cost = actions.reduce((s, a) => s + ACTION_COST[a], 0) + (research ? ACTION_COST.pesquisa : 0);
    if (cost <= AP_PER_WEEK) plans.push({ actions, research });
  }
  return plans;
}

/** Maior confiança final possível, com ou sem permitir pesquisar a carta. */
function bestFinalTrust(ally: PonteAllyContent, allowResearch: boolean, card: string): number {
  let best = 0;
  const walk = (week: number, trust: number, cardsOwned: string[]) => {
    if (trust >= 100 || week === WEEKS) { best = Math.max(best, Math.min(trust, 100)); return; }
    for (const plan of weekPlans()) {
      if (plan.research && !allowResearch) continue;
      const owned = plan.research ? [...cardsOwned, card] : cardsOwned;
      let t = trust;
      for (const a of plan.actions) {
        t += Math.max(...visibleOptions(ally.weeks[week].interactions[a].options, owned).map(o => o.delta));
      }
      walk(week + 1, t, owned);
    }
  };
  walk(0, ally.startTrust, []);
  return best;
}

describe('Cartas de Conhecimento', () => {
  it('têm IDs únicos e conteúdo preenchido', () => {
    expect(new Set(cards.map(c => c.id)).size).toBe(cards.length);
    for (const c of cards) {
      expect(c.summary.length, c.id).toBeGreaterThan(40);
      expect(c.signs.length, c.id).toBeGreaterThan(0);
      expect(c.howToHelp.length, c.id).toBeGreaterThan(0);
    }
  });
});

describe.each(protagonists.filter(p => p.ponte).map(p => [p.name, p] as const))('Modo 2 — %s', (_name, p) => {
  const ponte = p.ponte!;

  it('a carta de vitória existe', () => {
    expect(cards.some(c => c.id === ponte.victoryCard)).toBe(true);
  });

  it('cada aliado da Cena 5 do Modo 1 tem roteiro no Modo 2', () => {
    expect(Object.keys(ponte.allies).sort()).toEqual(Object.keys(p.fragmentos?.allies ?? {}).sort());
  });

  it('sprites existem', () => {
    const sprites = [ponte.avatar, ...Object.values(ponte.allies).map(a => a.sprite)];
    expect(sprites.filter(s => !existsSync(join(PUBLIC, assetPath.sprite(s))))).toEqual([]);
  });

  describe.each(Object.entries(ponte.allies))('aliado %s', (_id, ally) => {
    it(`tem ${WEEKS} semanas, cada conversa com resposta acolhedora e prejudicial`, () => {
      expect(ally.weeks).toHaveLength(WEEKS);
      for (const [w, week] of ally.weeks.entries()) {
        for (const action of ACTIONS) {
          const deltas = week.interactions[action].options.filter(o => !o.victory).map(o => o.delta);
          expect(Math.max(...deltas), `semana ${w + 1}, ${action}`).toBeGreaterThan(0);
          expect(Math.min(...deltas), `semana ${w + 1}, ${action}`).toBeLessThan(0);
        }
      }
    });

    it('a ação de vitória só existe na última semana e exige a carta', () => {
      for (const [w, week] of ally.weeks.entries()) {
        const victories = ACTIONS.flatMap(a => week.interactions[a].options.filter(o => o.victory));
        if (w === WEEKS - 1) expect(victories.length).toBeGreaterThan(0);
        else expect(victories).toEqual([]);
        for (const v of victories) expect(v.requiresCard).toBe(ponte.victoryCard);
      }
    });

    it('o final positivo exige pesquisar a carta (balanceamento)', () => {
      expect(bestFinalTrust(ally, false, ponte.victoryCard)).toBeLessThan(100);
      expect(bestFinalTrust(ally, true, ponte.victoryCard)).toBe(100);
    });
  });
});
