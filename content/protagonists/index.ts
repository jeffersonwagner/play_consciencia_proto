// Registro das protagonistas. Para adicionar uma nova história:
//   1. crie content/protagonists/<id>/index.ts (+ modo1.ts) seguindo a Júlia;
//   2. coloque a arte em assets-src/ e rode `npm run assets`;
//   3. troque o placeholder abaixo pelo import.
// Protagonistas sem `fragmentos` aparecem no menu como "em produção".

import type { Protagonist } from '../types';
import { julia } from './julia';

export const protagonists: Protagonist[] = [
  julia,
  {
    id: 'livia',
    name: 'Lívia',
    age: 38,
    role: 'Executiva',
    focus: 'Violência psicológica e gaslighting',
    contentWarning: 'Esta experiência aborda violência psicológica e gaslighting em um relacionamento afetivo.',
  },
  {
    id: 'marcia',
    name: 'Márcia',
    age: 29,
    role: 'Mãe de baixa renda',
    focus: 'Violência moral e social, ameaça e cárcere privado',
    contentWarning: 'Esta experiência aborda violência moral e social, ameaças e privação de liberdade.',
  },
  {
    id: 'renata',
    name: 'Renata',
    age: 32,
    role: 'Dona de confeitaria',
    focus: 'Violência física e patrimonial',
    contentWarning: 'Esta experiência aborda violência física e patrimonial em um relacionamento afetivo.',
  },
  {
    id: 'clara',
    name: 'Clara',
    age: 26,
    role: 'Recém-casada',
    focus: 'Violência sexual conjugal',
    contentWarning: 'Esta experiência aborda violência sexual dentro do casamento.',
  },
];

export function findProtagonist(id: string): Protagonist | undefined {
  return protagonists.find(p => p.id === id);
}
