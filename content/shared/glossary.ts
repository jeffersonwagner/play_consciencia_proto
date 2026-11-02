// ============================================================
// GLOSSÁRIO EDUCATIVO (GDD, Apêndice A — "Glossário de Termos")
// "Importunação sexual" e "Culpabilização da vítima" foram acrescentados
// para os cenários novos do Modo 4 (ver docs/MODO4.md).
// ============================================================

import type { GlossaryTerm } from '../types';

export const glossary: GlossaryTerm[] = [
  { id: 'ameaca', term: 'Ameaça', definition: 'Situações em que o agressor promete causar dano físico, psicológico, patrimonial ou social à vítima ou a pessoas próximas, com o objetivo de controlá-la ou intimidá-la.' },
  { id: 'bropriating', term: 'Bropriating', definition: 'Quando um homem se apropria de uma ideia inicialmente apresentada por uma mulher, recebendo os créditos e o reconhecimento que deveriam ser atribuídos a ela.' },
  { id: 'carcere-privado', term: 'Cárcere privado', definition: 'Privação da liberdade de ir e vir da vítima, por meio de trancas, retirada de chaves, vigilância constante ou impedimento de sair de casa ou de determinados ambientes, com ou sem uso de força física.' },
  { id: 'carga-mental', term: 'Carga mental', definition: 'Responsabilidade invisível de planejar, organizar e lembrar-se de tarefas domésticas e familiares, geralmente atribuída às mulheres, mesmo quando ambos trabalham fora.' },
  { id: 'ciclo-da-violencia', term: 'Ciclo da violência', definition: 'Padrão recorrente em relacionamentos abusivos, composto por três fases principais: aumento de tensão, explosão/agressão e "lua de mel" (arrependimento, pedidos de desculpa e promessas de mudança), que tendem a se repetir e agravar.' },
  { id: 'consentimento', term: 'Consentimento', definition: 'Acordo livre, informado, específico e reversível entre pessoas para uma determinada interação, especialmente sexual. Pode ser retirado a qualquer momento, inclusive dentro de relacionamentos estáveis ou do casamento.' },
  { id: 'culpabilizacao', term: 'Culpabilização da vítima', definition: 'Atribuir à vítima a responsabilidade pela violência que sofreu ("o que ela estava fazendo lá?", "com aquela roupa…"), deslocando o foco de quem cometeu a agressão.' },
  { id: 'deam', term: 'Delegacia Especializada de Atendimento à Mulher (DEAM)', definition: 'Unidade policial voltada ao atendimento a mulheres em situação de violência, com equipe treinada para o registro de ocorrência, a solicitação de medidas protetivas e o encaminhamento à rede de apoio.' },
  { id: 'estupro-marital', term: 'Estupro marital', definition: 'Violência sexual conjugal praticada por um parceiro contra o outro, na qual não há consentimento para a relação sexual, ainda que haja casamento ou união estável.' },
  { id: 'gaslighting', term: 'Gaslighting', definition: 'Forma de violência psicológica em que o agressor distorce fatos, mente ou omite informações para fazer a vítima duvidar da própria memória, percepção ou sanidade, minando sua confiança em si mesma.' },
  { id: 'importunacao', term: 'Importunação sexual', definition: 'Praticar ato libidinoso contra alguém sem a sua anuência — como encostar-se, tocar ou se esfregar em uma pessoa no transporte público. É crime previsto no art. 215-A do Código Penal.' },
  { id: 'jornada-dupla', term: 'Jornada dupla', definition: 'Situação em que a mulher acumula trabalho remunerado fora de casa com a maior parte do trabalho doméstico e de cuidado dentro de casa, o que gera sobrecarga e desgaste.' },
  { id: 'machismo-estrutural', term: 'Machismo estrutural', definition: 'Conjunto de práticas, normas, piadas, crenças e instituições que, de forma histórica e sistemática, colocam homens em posição de privilégio em relação às mulheres, naturalizando desigualdades e violências.' },
  { id: 'mansplaining', term: 'Mansplaining', definition: 'Quando um homem explica algo a uma mulher de forma condescendente, didática em excesso ou desnecessária, presumindo que ela não sabe, mesmo quando ela é especialista no assunto.' },
  { id: 'medida-protetiva', term: 'Medida Protetiva de Urgência', definition: 'Instrumento jurídico previsto na Lei Maria da Penha que permite ao juiz determinar, em prazo curto, medidas de proteção à vítima, como o afastamento do agressor do lar, a proibição de contato e de aproximação, entre outras.' },
  { id: 'rede-de-apoio', term: 'Rede de apoio', definition: 'Conjunto de pessoas, serviços e instituições que podem oferecer suporte emocional, material, jurídico, de saúde e de proteção à mulher em situação de violência (amigos, familiares, vizinhos, serviços públicos, organizações sociais).' },
  { id: 'violencia-fisica', term: 'Violência física', definition: 'Qualquer ação que cause danos ao corpo da vítima, como empurrões, tapas, socos, apertos, chutes, queimaduras, estrangulamento ou o uso de objetos ou armas.' },
  { id: 'violencia-moral', term: 'Violência moral', definition: 'Agressões à honra e à reputação da vítima, por meio de xingamentos, humilhações, calúnias, difamações ou da divulgação de informações que a desqualificam perante os outros.' },
  { id: 'violencia-patrimonial', term: 'Violência patrimonial', definition: 'Controle, destruição ou retenção de bens, documentos, dinheiro, cartões, ferramentas de trabalho ou de estudo da vítima, com o objetivo de restringir sua autonomia e aumentar sua dependência financeira em relação ao agressor.' },
  { id: 'violencia-psicologica', term: 'Violência psicológica', definition: 'Condutas que causam danos emocionais e reduzem a autoestima da vítima, como humilhações, ameaças, chantagens, isolamento, controle de rotinas, ciúme excessivo e desqualificações constantes.' },
  { id: 'violencia-sexual-conjugal', term: 'Violência sexual conjugal', definition: 'Qualquer ato sexual sem consentimento dentro de um relacionamento afetivo ou casamento, incluindo coerção, pressão, chantagem emocional ou uso de força física; configura estupro mesmo quando há vínculo formal entre as partes.' },
  { id: 'violencia-social', term: 'Violência social', definition: 'Isolamento da vítima de sua rede de relações (amigos, vizinhas, colegas, familiares), proibição de participar de atividades comunitárias ou de estudo/trabalho, e controle de sua circulação em espaços públicos ou privados.' },
];

export function findTerm(id: string): GlossaryTerm | undefined {
  return glossary.find(t => t.id === id);
}
