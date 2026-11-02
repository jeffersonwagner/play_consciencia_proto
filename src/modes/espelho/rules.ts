// ============================================================
// MODO 4 — REGRAS (funções puras, testadas em tests/espelho.test.ts)
// Ordem embaralhada das opções, registro das respostas e cálculo do
// perfil do Relatório de Atitudes. Ver docs/MODO4.md.
// ============================================================

import type { AttitudeProfile, EspelhoScenario } from '../../../content/types';
import type { EspelhoState } from '../../core/save';

/** Embaralhamento de Fisher–Yates; `random` é injetável para os testes. */
export function shuffled(n: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function newEspelho(scenarios: EspelhoScenario[], random: () => number = Math.random): EspelhoState {
  return {
    order: Object.fromEntries(scenarios.map(s => [s.id, shuffled(s.options.length, random)])),
    answers: {},
    decisionMs: {},
    current: 0,
    completed: false,
  };
}

/** Registra a resposta (índice original da opção) e avança. */
export function answer(state: EspelhoState, scenarios: EspelhoScenario[], optionIndex: number, decisionMs: number): void {
  const scenario = scenarios[state.current];
  if (!scenario || state.completed) throw new Error('Não há cenário pendente.');
  if (!scenario.options[optionIndex]) throw new Error(`Opção inválida: ${optionIndex}`);
  state.answers[scenario.id] = optionIndex;
  state.decisionMs[scenario.id] = Math.round(decisionMs);
  state.current++;
  if (state.current >= scenarios.length) state.completed = true;
}

export function profileCounts(state: EspelhoState, scenarios: EspelhoScenario[]): Record<AttitudeProfile, number> {
  const counts: Record<AttitudeProfile, number> = { ativo: 0, passivo: 0, reprodutor: 0 };
  for (const s of scenarios) {
    const i = state.answers[s.id];
    if (i !== undefined) counts[s.options[i].profile]++;
  }
  return counts;
}

/** Perfil mais frequente; empate no topo resulta em "misto". */
export function dominantProfile(counts: Record<AttitudeProfile, number>): AttitudeProfile | 'misto' {
  const sorted = (Object.entries(counts) as [AttitudeProfile, number][]).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] === sorted[1][1] ? 'misto' : sorted[0][0];
}
