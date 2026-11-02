// ============================================================
// TAXONOMIA DE TIPOS DE VIOLÊNCIA (resolve o item G3 do roadmap)
// Base: Lei Maria da Penha, art. 7º (física, psicológica, sexual,
// patrimonial, moral) + subtipos usados nos casos do GDD.
// Hoje alimenta as etiquetas do Modo 3; o indicador do Modo 1 e as
// cartas do Modo 2 podem passar a referenciar estes mesmos IDs.
// ============================================================

import type { ViolenceType } from '../types';

export const violenceTypes: ViolenceType[] = [
  { id: 'fisica', label: 'Violência Física', description: 'Ofensa à integridade ou saúde corporal (art. 7º, I).' },
  { id: 'psicologica', label: 'Violência Psicológica', description: 'Dano emocional, controle, humilhação, isolamento, vigilância, chantagem (art. 7º, II).' },
  { id: 'sexual', label: 'Violência Sexual', description: 'Constranger a presenciar, manter ou participar de relação sexual não desejada (art. 7º, III).' },
  { id: 'patrimonial', label: 'Violência Patrimonial', description: 'Retenção, subtração ou destruição de objetos, instrumentos de trabalho ou estudo, documentos, bens ou recursos (art. 7º, IV).' },
  { id: 'moral', label: 'Violência Moral', description: 'Calúnia, difamação ou injúria (art. 7º, V).' },
  { id: 'gaslighting', label: 'Gaslighting', description: 'Subtipo de violência psicológica: distorcer fatos para a vítima duvidar da própria percepção.' },
  { id: 'ameaca', label: 'Ameaça', description: 'Prometer causar mal à vítima ou a pessoas próximas, para intimidá-la.' },
  { id: 'carcere-privado', label: 'Cárcere Privado', description: 'Privar a vítima da liberdade de ir e vir (trancas, retirada de chaves, impedimento de sair).' },
];

export function findViolenceType(id: string): ViolenceType | undefined {
  return violenceTypes.find(v => v.id === id);
}
