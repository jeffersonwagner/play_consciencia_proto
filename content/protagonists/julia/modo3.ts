// ============================================================
// CASO — MODO 3 "DOSSIÊ 180" · JÚLIA
// Violência patrimonial e psicológica. RASCUNHO para revisão.
// Regras e balanceamento: docs/MODO3.md
// ============================================================

import type { DossieContent, DossieContext } from '../../types';

const SLOTS = ['Dia 1 · manhã', 'Dia 1 · tarde', 'Dia 2 · manhã', 'Dia 2 · tarde', 'Dia 3 · manhã'];
const ALL = SLOTS.map((_, i) => i);

function relato(ctx: DossieContext): string[] {
  const p: string[] = [];

  switch (ctx.ponteEnding) {
    case 'positivo':
      p.push(`Júlia, 21 anos, estudante universitária, chega à Delegacia da Mulher acompanhada por ${ctx.allyName}, que a apoiou nas últimas semanas. Está decidida a registrar o que aconteceu.`);
      break;
    case 'negativo':
      p.push('Júlia, 21 anos, estudante universitária, foi encaminhada pelo Núcleo de Apoio ao Estudante. Chega sozinha, fala pouco e evita contato visual. Diz que "não queria incomodar".');
      break;
    default:
      p.push('Júlia, 21 anos, estudante universitária, foi encaminhada pelo Núcleo de Apoio ao Estudante. Diz que "agora está tudo mais calmo", mas aceitou conversar.');
  }

  p.push('Relata que o namorado, Leo, arremessou e destruiu o notebook dela na véspera da entrega do TCC, depois de uma discussão por "falta de atenção". O trabalho de oito meses estava no aparelho.');

  p.push(ctx.flags.apagou_foto
    ? 'Semanas antes, ele exigiu que ela apagasse uma foto de família das redes sociais ("não gosto que fiquem vendo o que é meu"). Ela apagou.'
    : 'Semanas antes, ele exigiu que ela apagasse uma foto de família das redes sociais ("não gosto que fiquem vendo o que é meu"). Ela se recusou, e ele a culpou pela "briga".');

  if (ctx.flags.cedeu_jantar || ctx.flags.confrontou_leo_exposicao === false) {
    p.push('Conta que passou a cancelar compromissos com amigas para atendê-lo e que ele constrangia a melhor amiga, Carla, em público — até elas se afastarem.');
  } else {
    p.push('Conta que ele demonstrava incômodo sempre que ela saía com a amiga Carla e que a acusava de ficar "sensível" quando estava com ela.');
  }

  p.push('Depois do episódio, Leo deu a ela um notebook novo. Desde então, a busca todos os dias na faculdade e passou a exigir a senha do aparelho: "como fui eu que dei, tenho o direito de ver".');
  return p;
}

export const dossie: DossieContent = {
  caseNumber: 'Caso nº 2026-0147',
  intro: 'Você é técnica(o) de referência da rede de atendimento à mulher do município. O caso de Júlia acaba de chegar. Leia o dossiê, classifique a violência e decida os encaminhamentos — e em que ordem. Cada período do dia conta: nem todos os profissionais estão de plantão o tempo todo.',
  startWellbeing: { positivo: 65, neutro: 50, negativo: 40, 'sem-modo2': 50 },
  relato,
  documents: ctx => [
    // A foto ganha arte quando existir public/assets/documents/<id>.webp (campo `image`)
    { kind: 'foto', title: 'Foto anexada', body: 'Notebook com a tela estilhaçada e a carcaça partida no chão de madeira de um quarto.' },
    { kind: 'print', from: 'Leo', title: 'Print de mensagens', body: '"Pra que postar foto assim? Não tem necessidade de um monte de gente ficar vendo seu corpo. Apaga isso agora. Não gosto que fiquem vendo o que é meu."' },
    { kind: 'ficha', title: 'Ficha do NAE', body: `Primeiro atendimento psicológico (Sofia). Estudante relata destruição do notebook pelo namorado. ${ctx.ally === 'lucia' ? 'Acompanhada pela mãe, que tentou relativizar o episódio.' : ctx.ally === 'carla' ? 'Acompanhada pela amiga Carla.' : ''} Encaminhada à rede.` },
    { kind: 'notificacao', from: 'Leo', title: 'Mensagem recente de Leo', body: '"Depois de tudo que eu fiz por você, você não confia em mim? Me passa a senha."' },
  ],
  correctTags: ['patrimonial', 'psicologica'],
  acceptableTags: ['gaslighting'],
  tagsFeedback: 'Destruir o notebook — instrumento de estudo — é violência patrimonial (Lei Maria da Penha, art. 7º, IV). Controlar fotos, isolar das amigas, vigiar e exigir senhas é violência psicológica (art. 7º, II). Chamá-la de "sensível" para inverter a culpa é gaslighting, um subtipo da violência psicológica.',
  slots: SLOTS,
  availability: {
    sofia: [1, 2, 3, 4],
    amilcar: ALL,
    norberto: [0, 1],
    patricia: [2, 3, 4],
    helena: [3, 4],
    carlos: ALL,
  },
  actions: [
    {
      id: 'psicologico',
      label: 'Agendar atendimento psicológico',
      icon: '🧠',
      professionals: ['sofia', 'amilcar'],
      recommended: true,
      outcomes: {
        sofia: {
          delta: 12,
          narration: 'Sofia retoma o acompanhamento iniciado no NAE. Júlia volta a dormir melhor.',
          feedback: 'Acolhimento especializado fortalece Júlia emocionalmente — e a prepara para os próximos passos.',
        },
        amilcar: {
          delta: -4,
          narration: 'Dr. Amílcar pergunta o que Júlia "fez para despertar tanta raiva" no namorado.',
          feedback: 'Uma abordagem que procura "a parte dela" no conflito reforça a culpa que o agressor já colocou nela.',
        },
      },
    },
    {
      id: 'bo',
      label: 'Registrar boletim de ocorrência',
      icon: '📄',
      professionals: ['patricia', 'norberto'],
      recommended: true,
      outcomes: {
        patricia: {
          delta: 12,
          narration: 'A Escrivã Patrícia ouve Júlia sem pressa e registra o dano ao notebook, as mensagens e o controle da senha.',
          feedback: 'Um registro acolhedor e detalhado, com foco no dano patrimonial, dá base às medidas de proteção e à reparação.',
        },
        norberto: {
          delta: -8,
          narration: '"Mas foi só um notebook? Ele não encostou em você?" — o Delegado Norberto registra o mínimo.',
          feedback: 'Descrédito no momento do registro é revitimização e aumenta muito a chance de desistência.',
        },
      },
      sequence: [{
        after: 'psicologico',
        delta: 4,
        feedback: 'Depor depois do acolhimento psicológico reduz a revitimização.',
      }],
    },
    {
      id: 'nae',
      label: 'Acionar o NAE (suporte acadêmico)',
      icon: '🎓',
      recommended: true,
      outcomes: {
        default: {
          delta: 8,
          narration: 'O NAE garante a prorrogação do TCC e ajuda a recuperar parte dos arquivos.',
          feedback: 'Reduzir o dano concreto da violência patrimonial (prazos, estudo) devolve a Júlia parte da autonomia que ele tentou tirar.',
        },
      },
    },
    {
      id: 'juridico',
      label: 'Orientação jurídica',
      icon: '⚖️',
      professionals: ['helena', 'carlos'],
      outcomes: {
        helena: {
          delta: 5,
          narration: 'Dra. Helena explica, com calma, as medidas protetivas e o direito à reparação do dano.',
          feedback: 'Informação clara sobre direitos dá a Júlia poder de decisão.',
        },
        carlos: {
          delta: -3,
          narration: 'Dr. Carlos fala em artigos e prazos por dez minutos. Júlia sai sem entender o que pode fazer.',
          feedback: 'Orientação técnica demais, com pressa, não informa — e pode desanimar.',
        },
      },
    },
    {
      id: 'mpu',
      label: 'Solicitar medida protetiva de urgência',
      icon: '🛡️',
      outcomes: {
        default: {
          delta: 5,
          narration: 'Com a concordância de Júlia, é pedida a proibição de contato e de aproximação.',
          feedback: 'A medida protetiva pode proibir contato e aproximação. Desde a Lei nº 14.550/2023, ela independe de boletim de ocorrência ou inquérito.',
        },
      },
    },
    {
      id: 'abrigo',
      label: 'Acionar abrigo sigiloso',
      icon: '🏠',
      outcomes: {
        default: {
          delta: -8,
          narration: 'Júlia é orientada a deixar a faculdade e a cidade por tempo indeterminado. Ela recusa, assustada.',
          feedback: 'O abrigo sigiloso é para risco iminente de morte. No caso de Júlia, seria desproporcional: a afastaria da faculdade e da rede de apoio.',
        },
      },
    },
    {
      id: 'mediacao',
      label: 'Propor conversa de conciliação com o agressor',
      icon: '🤝',
      outcomes: {
        default: {
          delta: -12,
          narration: 'Leo chega à conversa sorrindo e fala por quase todo o tempo. Júlia concorda com tudo.',
          feedback: 'Conciliação não é indicada em violência doméstica: a Lei Maria da Penha (art. 41) afasta os institutos da Lei nº 9.099/95. Colocar a vítima frente a frente com o agressor reforça o controle.',
        },
      },
    },
  ],
  events: [
    {
      id: 'oferta-notebook',
      slot: 2,
      title: 'Dilema: a "compensação"',
      text: 'Leo ligou para o NAE. Diz que já deu um notebook novo a Júlia e que "pode dar outro, melhor", desde que ela "deixe isso pra lá". Júlia pergunta o que você acha.',
      options: [
        {
          text: 'Registrar a oferta no dossiê e dizer a Júlia que ela não precisa negociar nada com ele.',
          delta: 6,
          feedback: 'Uma "compensação" condicionada a desistir é pressão sobre a vítima. Registrá-la protege Júlia — e o dano não é só material.',
        },
        {
          text: 'Sugerir que ela aceite: resolve o prejuízo e evita mais conflito.',
          delta: -10,
          feedback: 'Aceitar o "acordo" trata a violência como prejuízo material e devolve a ele o controle — o mesmo mecanismo do "presente" do Modo 2.',
        },
        {
          text: 'Não comentar: a decisão é só dela.',
          delta: -3,
          feedback: 'Respeitar a decisão dela é importante, mas sem informação ela decide sob pressão. Neutralidade aqui favorece o agressor.',
        },
      ],
    },
  ],
  endings: {
    positivo: [
      'Júlia entrega o TCC com a prorrogação garantida e segue no acompanhamento com Sofia.',
      'A medida de proteção e o registro detalhado deixam Leo sem espaço para pressionar. Ela rompe o ciclo com segurança.',
    ],
    neutro: [
      'Júlia foi atendida, mas o caminho teve falhas: atendimentos que a fizeram duvidar de si, esperas e lacunas na proteção.',
      'Ela segue na faculdade — e Leo ainda encontra brechas para se aproximar.',
    ],
    negativo: [
      'Depois de ser desacreditada, Júlia para de responder aos contatos da rede.',
      'Leo descobre o registro e reage. Sem acolhimento adequado, ela desiste do processo e volta para o ciclo.',
    ],
  },
  globalEndings: {
    positivo: 'Júlia teve quem a escutasse (Modo 2) e uma rede que a acolheu (Modo 3). Meses depois, apresenta o TCC. Na plateia, quem esteve com ela o tempo todo.',
    neutro: 'Júlia saiu do pior momento, mas a proteção ficou incompleta. A história dela mostra como cada elo — amizade, família, serviço — pode sustentar ou enfraquecer a ponte.',
    negativo: 'Júlia ficou sem apoio suficiente — de quem estava perto ou da rede que deveria protegê-la. O ciclo continua. Muitas histórias reais terminam assim; elas não precisam terminar.',
  },
};
