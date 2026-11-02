import type { Protagonist } from '../../types';
import { script } from './modo1';

export const julia: Protagonist = {
  id: 'julia',
  name: 'Júlia',
  age: 21,
  role: 'Universitária',
  focus: 'Violência patrimonial e psicológica',
  contentWarning: 'Esta experiência aborda situações de violência psicológica e patrimonial em relacionamentos afetivos.',
  fragmentos: {
    start: 'cena1',
    script,
    synopsis: 'A história de Júlia, uma estudante universitária, e do começo de um relacionamento que se transforma. Seis cenas, escolhas que importam, e a consciência sobre o que muitas vezes passa despercebido.',
    closingNote: 'Cada escolha que você fez ao longo da história de Júlia ilustra como a violência psicológica e patrimonial pode se instalar gradualmente em um relacionamento — começando com pequenos sinais facilmente racionalizados. Reconhecer esses padrões é o primeiro passo para interromper ciclos de violência, seja na própria vida ou na vida de alguém próximo.',
    allies: {
      carla: {
        name: 'Carla (amiga)',
        kind: 'eficaz',
        description: 'Aliada eficaz — apoio direto e validação emocional.',
      },
      lucia: {
        name: 'Lúcia (mãe)',
        kind: 'falho',
        description: 'Aliada falha — boas intenções, mas dificuldade em reconhecer a gravidade da situação.',
      },
    },
  },
};
