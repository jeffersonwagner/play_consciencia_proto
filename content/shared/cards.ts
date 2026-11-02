// ============================================================
// CARTAS DE CONHECIMENTO (GDD, Apêndice A — nomes padronizados)
// Desbloqueadas pela ação "Pesquisar" no Modo 2. Rascunho baseado no
// glossário do GDD e na Lei Maria da Penha (Lei nº 11.340/2006);
// revisar com especialista antes do Ciclo 1.
// ============================================================

import type { KnowledgeCard } from '../types';

export const cards: KnowledgeCard[] = [
  {
    id: 'ciclo-da-violencia',
    title: 'Ciclo da Violência',
    searchQuery: 'ele pede desculpas e depois tudo se repete',
    summary: 'Padrão recorrente em relacionamentos abusivos, com três fases que tendem a se repetir e a se agravar: aumento da tensão, explosão (a agressão) e "lua de mel" (arrependimento, presentes, promessas de mudança).',
    signs: [
      'Períodos de "pisar em ovos" para não irritar o parceiro.',
      'Depois de uma agressão, pedidos de desculpa intensos, presentes e promessas.',
      'A frase "acho que ele está mudando" logo após um episódio grave.',
      'Intervalos cada vez menores entre as explosões.',
    ],
    howToHelp: [
      'Não cobre que ela "decida de uma vez": sair do ciclo costuma levar tempo.',
      'Na fase de lua de mel, não celebre o gesto do agressor; pergunte como ela se sente.',
      'Mantenha contato constante — o isolamento fortalece o ciclo.',
    ],
    legalBasis: 'Modelo descrito pela psicóloga Lenore Walker (1979) e adotado pela rede de enfrentamento à violência contra a mulher no Brasil.',
  },
  {
    id: 'violencia-patrimonial',
    title: 'Violência Patrimonial',
    searchQuery: 'namorado quebrou meu notebook é crime',
    summary: 'Controle, destruição ou retenção de bens, documentos, dinheiro, cartões ou instrumentos de trabalho e de estudo da vítima, para restringir sua autonomia e aumentar a dependência em relação ao agressor.',
    signs: [
      'Quebrar objetos dela, especialmente os de trabalho ou estudo.',
      'Exigir senhas, controlar o celular ou o computador.',
      'Dar presentes caros e depois usá-los para cobrar, vigiar ou controlar.',
      'Reter documentos, cartões ou dinheiro.',
    ],
    howToHelp: [
      'Ajude a nomear: destruir o notebook dela não é "briga", é violência.',
      'Perceba quando um "presente" vem com condições — isso também é controle.',
      'Ofereça ajuda prática: recuperar arquivos, guardar provas (fotos, mensagens).',
    ],
    legalBasis: 'Lei Maria da Penha, art. 7º, IV: "a violência patrimonial, entendida como qualquer conduta que configure retenção, subtração, destruição parcial ou total de seus objetos, instrumentos de trabalho, documentos pessoais, bens, valores e direitos ou recursos econômicos".',
  },
  {
    id: 'gaslighting',
    title: 'Gaslighting',
    searchQuery: 'ele diz que eu sou sensível demais',
    summary: 'Forma de violência psicológica em que o agressor distorce fatos, mente ou omite informações para fazer a vítima duvidar da própria memória, percepção ou sanidade.',
    signs: [
      '"Você está exagerando", "você é sensível demais", "isso nunca aconteceu".',
      'Ela passa a pedir desculpas por coisas que ele fez.',
      'Ela não confia mais na própria versão dos fatos.',
    ],
    howToHelp: [
      'Valide a percepção dela: "o que você sentiu faz sentido".',
      'Ajude a registrar os fatos (datas, mensagens) para que ela possa revê-los.',
      'Evite frases como "mas ele não é assim" — elas reforçam a dúvida.',
    ],
    legalBasis: 'Lei Maria da Penha, art. 7º, II (violência psicológica, que inclui manipulação e ridicularização). Desde 2021 a violência psicológica contra a mulher também é crime (Código Penal, art. 147-B, incluído pela Lei nº 14.188/2021).',
  },
  {
    id: 'consentimento',
    title: 'Consentimento',
    searchQuery: 'marido pode obrigar a ter relação',
    summary: 'Acordo livre, informado, específico e reversível para uma interação, especialmente sexual. Pode ser retirado a qualquer momento — inclusive no namoro, na união estável e no casamento.',
    signs: [
      'Insistência, chantagem emocional ou "punição" com silêncio depois de um "não".',
      'Tratar o sexo como "obrigação" ou "dever" do casamento.',
      'Iniciar contato sexual com a pessoa dormindo ou sem condições de consentir.',
    ],
    howToHelp: [
      'Afirme com clareza: sexo sem consentimento é violência, mesmo no casamento.',
      'Não pergunte "mas você disse não com firmeza?" — a responsabilidade é de quem violou.',
      'Indique atendimento em saúde e apoio psicológico especializados.',
    ],
    legalBasis: 'Lei Maria da Penha, art. 7º, III (violência sexual). O crime de estupro (Código Penal, art. 213) não deixa de existir por haver casamento ou relacionamento.',
  },
  {
    id: 'rede-de-apoio',
    title: 'Rede de Apoio',
    searchQuery: 'onde pedir ajuda violência contra mulher',
    summary: 'Conjunto de pessoas, serviços e instituições que oferecem suporte emocional, material, jurídico, de saúde e de proteção à mulher em situação de violência.',
    signs: [
      'Ela tem cada vez menos contato com amigas e família.',
      'Ela não sabe a quem recorrer ou acha que "não é grave o suficiente".',
    ],
    howToHelp: [
      'Ligue 180: Central de Atendimento à Mulher — gratuita, 24 horas, orienta e encaminha.',
      'Em emergência, 190 (Polícia Militar).',
      'DEAM (Delegacia da Mulher): registro de ocorrência e pedido de medida protetiva.',
      'CRAM (Centro de Referência de Atendimento à Mulher) e CREAS: apoio psicossocial e jurídico.',
      'Ofereça-se para acompanhar — ir junto faz diferença.',
    ],
    legalBasis: 'Lei Maria da Penha, arts. 8º a 12 (assistência e atendimento pela autoridade policial) e arts. 18 a 24 (medidas protetivas de urgência).',
  },
];

export function findCard(id: string): KnowledgeCard | undefined {
  return cards.find(c => c.id === id);
}
