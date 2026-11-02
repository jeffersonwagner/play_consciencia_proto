// ============================================================
// CENÁRIOS — MODO 4 "O ESPELHO"
// 1–4: GDD (Apêndice A), reescritos sem pressupor o gênero de quem joga.
// 5–7: novos (decisão provisória G5). RASCUNHO para revisão.
// Perfis: ativo (aliado ativo), passivo (observador passivo),
// reprodutor (reprodutor de comportamentos de controle).
// ============================================================

import type { AttitudeProfile, EspelhoScenario } from '../types';

export const scenarios: EspelhoScenario[] = [
  {
    id: 'reuniao',
    setting: 'Trabalho',
    icon: '💼',
    title: 'A reunião',
    situation: 'Em uma reunião, Bruna propõe uma ideia nova. Ninguém comenta. Minutos depois, Marcos repete a mesma ideia com outras palavras — e recebe elogios de todos.',
    options: [
      { profile: 'reprodutor', text: 'Reforçar: "Boa, Marcos! Ótima ideia."', reflection: 'Reforçar quem repetiu a ideia, sem notar de onde ela veio, consolida o apagamento das mulheres no trabalho.' },
      { profile: 'passivo', text: 'Ficar em silêncio.', reflection: 'O silêncio parece neutro, mas deixa o apagamento acontecer — e ensina a todos que ele é normal.' },
      { profile: 'ativo', text: '"Essa é a proposta que a Bruna trouxe há pouco, né? Bruna, quer detalhar?"', reflection: 'Devolver o crédito, sem confronto, é um gesto simples que muda quem é ouvida na sala.' },
    ],
    concept: 'bropriating',
    connection: 'Lívia, uma das protagonistas, vê o parceiro diminuir sua autoridade diante dos colegas. Ambientes que reconhecem as mulheres tornam esse tipo de controle mais visível — e menos aceito.',
  },
  {
    id: 'jantar',
    setting: 'Casa',
    icon: '🍽️',
    title: 'O jantar',
    situation: 'Todo mundo chegou cansado do trabalho. Como quase sempre, é a mesma mulher da casa — mãe, irmã, companheira ou colega de república — que vai para a cozinha preparar o jantar.',
    options: [
      { profile: 'passivo', text: 'Perguntar se ela precisa de ajuda e esperar as instruções.', reflection: 'Oferecer ajuda é bom, mas esperar instruções mantém com ela a carga mental de planejar e distribuir tudo.' },
      { profile: 'ativo', text: 'Assumir uma parte do trabalho, sem esperar que peçam.', reflection: 'Dividir de fato é assumir responsabilidade — não "ajudar" em uma tarefa que seria dela.' },
      { profile: 'reprodutor', text: 'Agradecer pelo jantar e continuar descansando.', reflection: 'Agradecer sem dividir naturaliza a jornada dupla: a gratidão não substitui a divisão do trabalho.' },
    ],
    concept: 'jornada-dupla',
    connection: 'Márcia ouve que "mulher tem que aprender a ser dona de casa". A ideia de que o cuidado é tarefa natural das mulheres sustenta formas de controle muito mais graves.',
  },
  {
    id: 'grupo',
    setting: 'Amigos',
    icon: '📱',
    title: 'O grupo de mensagens',
    situation: 'Em um grupo de amigos, alguém compartilha a foto íntima de uma mulher que vocês conhecem, acompanhada de piadas. Algumas pessoas já reagiram com risadas.',
    options: [
      { profile: 'reprodutor', text: 'Reagir com um emoji de risada.', reflection: 'Rir valida a exposição. Divulgar imagem íntima sem consentimento é crime (Código Penal, art. 218-C) e uma violência que pode destruir a vida de alguém.' },
      { profile: 'passivo', text: 'Ignorar e não comentar.', reflection: 'Ignorar parece não participar, mas o silêncio do grupo é exatamente o que permite que a imagem continue circulando.' },
      { profile: 'ativo', text: 'Pedir que apaguem a foto e dizer que isso é violência.', reflection: 'Romper a cumplicidade do grupo tem um custo social pequeno e pode impedir que a violência se espalhe.' },
    ],
    concept: 'machismo-estrutural',
    connection: 'No Modo 1, Leo diz que não quer que "fiquem vendo o que é meu". Tratar o corpo de uma mulher como objeto — de posse ou de piada — segue a mesma lógica.',
  },
  {
    id: 'conselho',
    setting: 'Relacionamento',
    icon: '💬',
    title: 'O conselho',
    situation: 'Uma pessoa próxima — especialista no assunto — conta que está insegura com um projeto importante. Para você, a solução parece óbvia.',
    options: [
      { profile: 'reprodutor', text: 'Explicar em detalhes o que ela deveria fazer.', reflection: 'Explicar a quem é especialista, sem que ela peça, desautoriza o conhecimento dela — é o que se chama de mansplaining.' },
      { profile: 'ativo', text: 'Perguntar se ela quer ajuda ou se só quer desabafar.', reflection: 'Perguntar respeita o saber e a autonomia dela. Muitas vezes, o que se quer é escuta — não solução.' },
      { profile: 'passivo', text: 'Mudar de assunto para animá-la.', reflection: 'Evitar o assunto parece gentil, mas deixa a pessoa sozinha com a insegurança.' },
      { profile: 'reprodutor', text: 'Dizer que ela está sendo "emocional demais".', reflection: 'Chamar de "emocional" a insegurança de uma mulher invalida o que ela sente — o mesmo mecanismo do gaslighting.' },
    ],
    concept: 'mansplaining',
    connection: 'Lívia é executiva e, mesmo assim, tem a competência questionada em casa. Desautorizar o saber de uma mulher, ainda que "sem querer", alimenta a ideia de que ela precisa de tutela.',
  },
  {
    id: 'onibus',
    setting: 'Rua',
    icon: '🚌',
    title: 'No ônibus',
    situation: 'No ônibus lotado, você percebe um homem se encostando em uma mulher, que tenta, visivelmente desconfortável, se afastar.',
    options: [
      { profile: 'passivo', text: 'Fingir que não viu: pode ser só o ônibus cheio.', reflection: 'Na dúvida, o desconforto dela é o sinal mais importante. Ignorar deixa o assédio sem testemunha.' },
      { profile: 'ativo', text: 'Abrir espaço e chamá-la para perto ("Moça, tem lugar aqui"), ou avisar o motorista.', reflection: 'Intervir sem confronto direto — criar uma saída para ela, chamar o motorista — protege sem aumentar o risco. Importunação sexual é crime (Código Penal, art. 215-A).' },
      { profile: 'reprodutor', text: 'Pensar que, se ela não reclama, não deve ser nada.', reflection: 'Esperar que a vítima reaja transfere a ela a responsabilidade. O medo e o choque costumam paralisar.' },
    ],
    concept: 'importunacao',
    connection: 'A violência contra a mulher não acontece só dentro de casa. Quem aprende a intervir no ônibus aprende também a não desviar o olhar quando é com uma amiga.',
  },
  {
    id: 'desabafo',
    setting: 'Amigos',
    icon: '☕',
    title: 'O desabafo',
    situation: 'Uma colega comenta, meio rindo, que o namorado "é ciumento": olha o celular dela todo dia e não gosta que ela saia sem ele.',
    options: [
      { profile: 'reprodutor', text: '"Ciúme é prova de amor, né?"', reflection: 'Romantizar o controle é um dos caminhos pelos quais a violência psicológica fica invisível.' },
      { profile: 'passivo', text: 'Rir junto e mudar de assunto.', reflection: 'Rir alivia o momento, mas perde a chance de mostrar que você notou — e de se colocar como alguém de confiança.' },
      { profile: 'ativo', text: '"E como você se sente com isso? Se um dia quiser conversar, tô aqui."', reflection: 'Perguntar sem julgar e deixar a porta aberta é exatamente o que a Carla faz no Modo 2 — e é o começo de uma ponte.' },
    ],
    concept: 'rede-de-apoio',
    connection: 'A história de Júlia começou assim: com pedidos que pareciam cuidado. Quem percebe cedo e continua por perto pode ser a pessoa para quem ela vai ligar na Cena 5.',
  },
  {
    id: 'noticia',
    setting: 'Família',
    icon: '📺',
    title: 'A notícia',
    situation: 'No almoço de família, a TV noticia a agressão a uma jovem que voltava de uma festa. Um parente comenta: "Mas também, o que ela estava fazendo lá àquela hora?"',
    options: [
      { profile: 'reprodutor', text: 'Concordar: "É, tem que se cuidar."', reflection: 'Perguntar o que a vítima fez desloca a culpa do agressor para ela. A responsabilidade pela violência é sempre de quem a comete.' },
      { profile: 'passivo', text: 'Ficar em silêncio para não criar clima.', reflection: 'Evitar o conflito é compreensível, mas o silêncio confirma a frase para quem está ouvindo — inclusive para alguma mulher da mesa.' },
      { profile: 'ativo', text: '"A culpa é de quem agrediu, não dela."', reflection: 'Uma frase curta e firme já muda a conversa. Quem ouve — talvez alguém que vive algo parecido — percebe que ali há apoio.' },
    ],
    concept: 'culpabilizacao',
    connection: 'No Modo 3, um delegado pergunta a Júlia se "foi só um notebook". As instituições reproduzem o descrédito que se aprende em conversas como a deste almoço.',
  },
];

export const PROFILES: Record<AttitudeProfile | 'misto', { title: string; description: string }> = {
  ativo: {
    title: 'Aliado ativo',
    description: 'Você tende a perceber o machismo cotidiano e a agir, sem expor quem é afetada. É essa postura que sustenta a ponte de apoio para mulheres como as protagonistas deste jogo.',
  },
  passivo: {
    title: 'Observador passivo',
    description: 'Você costuma perceber que algo está errado, mas tende ao silêncio ou a esperar. O silêncio de quem está em volta é um dos sustentos do machismo estrutural — e também a parte mais fácil de mudar.',
  },
  reprodutor: {
    title: 'Reprodutor de comportamentos de controle',
    description: 'Algumas das suas escolhas reproduzem, muitas vezes sem querer, ideias que naturalizam o controle e a desigualdade. Ninguém está fora dessa estrutura: reconhecer isso é o primeiro passo — e é para isso que serve este espelho.',
  },
  misto: {
    title: 'Perfil misto',
    description: 'Suas escolhas variaram de um cenário para outro. Vale olhar com atenção em quais situações você agiu e em quais preferiu o silêncio ou repetiu o que é comum ouvir.',
  },
};
