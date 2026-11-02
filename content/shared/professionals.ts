// ============================================================
// REDE DE PROFISSIONAIS DO MODO 3 (GDD, Apêndice A)
// Cada caso define quando cada um está de plantão (DossieContent.availability).
// ============================================================

import type { Professional } from '../types';

export const professionals: Professional[] = [
  { id: 'sofia', name: 'Sofia', role: 'Psicóloga', stance: 'acolhedor', trait: 'Empática, especializada em violência de gênero', sprite: 'sofia/padrao' },
  { id: 'amilcar', name: 'Dr. Amílcar', role: 'Psicanalista', stance: 'vies', trait: 'Distante; tende a buscar "a parte dela" no conflito' },
  { id: 'patricia', name: 'Escrivã Patrícia', role: 'Policial (DEAM)', stance: 'acolhedor', trait: 'Escuta acolhedora, registro detalhado' },
  { id: 'norberto', name: 'Delegado Norberto', role: 'Policial (plantão)', stance: 'vies', trait: 'Cético; minimiza o que não deixa marca' },
  { id: 'helena', name: 'Dra. Helena', role: 'Advogada', stance: 'acolhedor', trait: 'Clara e paciente; explica direitos e caminhos' },
  { id: 'carlos', name: 'Dr. Carlos', role: 'Advogado', stance: 'vies', trait: 'Burocrata; linguagem técnica e pressa' },
];

export function findProfessional(id: string): Professional | undefined {
  return professionals.find(p => p.id === id);
}
