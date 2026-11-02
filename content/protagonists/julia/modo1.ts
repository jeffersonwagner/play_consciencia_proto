// ============================================================
// ROTEIRO — MODO 1 "FRAGMENTOS" · JÚLIA
// Violência patrimonial, com violência psicológica associada.
// Formato dos blocos: ver src/engine/vn/types.ts
// ============================================================

import type { Script } from '../../../src/engine/vn/types';

export const script: Script = {
  // ===== CENA 1: O ENCANTAMENTO =====
  cena1: {
    label: "Cena 1 — O encantamento",
    bg: "julia/cena01_festa",
    music: "musica_festa",
    blocks: [
      {
        type: "narration",
        text: "Uma festa de calouros. Música alta, luzes coloridas, conversas se cruzando. Júlia chegou com Carla, mas em algum momento se viu sozinha perto do bar."
      },
      {
        type: "narration",
        text: "Foi então que ele apareceu — Leo, veterano, com aquele jeito tranquilo de quem já conhece o lugar e parece saber exatamente o que dizer."
      },
      {
        speaker: "Leo",
        text: "Eu te observei a noite toda. Calouras geralmente chegam aqui meio perdidas, mas você tem outra coisa. Você está, sei lá... presente. Posso te pagar uma água?",
        sprite: "leo/charmoso",
        position: "right"
      },
      {
        speaker: "Júlia",
        text: "Água? Mais simpático que pagar uma cerveja, com certeza.",
        sprite: "julia/neutra",
        position: "left",
        secondary: { sprite: "leo/charmoso", position: "right" }
      },
      {
        speaker: "Leo",
        text: "Cerveja é fácil. Água é estratégia.",
        sprite: "leo/charmoso",
        position: "right",
        secondary: { sprite: "julia/neutra", position: "left" }
      },
      {
        type: "narration",
        text: "Algumas semanas se passaram. Mensagens diárias. Cafés entre as aulas. Leo lembrava de tudo o que ela dizia — das matérias difíceis, do nome do seu gato, da banda que ela tinha mencionado de passagem."
      },
      {
        type: "narration",
        text: "Era quinta-feira à tarde. Júlia tinha combinado de estudar com Carla naquela noite — prova importante na sexta. Mandou uma mensagem para o Leo avisando."
      },
      {
        speaker: "Leo",
        text: "Ah, que pena, meu amor… Eu estava planejando um jantar surpresa especial só pra nós dois hoje à noite. Mas tudo bem, se seus estudos são mais importantes, a gente deixa…",
        sprite: "leo/charmoso",
        position: "right"
      },
      {
        type: "choice",
        question: "O que Júlia faz?",
        options: [
          {
            text: "Manter o compromisso de estudo com Carla.",
            label: "Manteve o compromisso",
            set: { cedeu_jantar: false },
            next: "cena1_a"
          },
          {
            text: "Cancelar com a amiga e aceitar o jantar surpresa.",
            label: "Cedeu ao jantar",
            set: { cedeu_jantar: true },
            violence: "Sinal de controle relacional",
            violenceExplanation: "Pequenos pedidos que parecem afeto, mas exigem que ela abra mão de outras pessoas e compromissos. É o início da centralização da vida dela em torno dele.",
            next: "cena1_b"
          }
        ]
      }
    ]
  },

  cena1_a: {
    inherit: "cena1",
    blocks: [
      {
        speaker: "Júlia",
        text: "Leo, eu sinto muito mesmo. Vamos remarcar pro fim de semana? Eu prometi pra Carla e a prova é cedo amanhã.",
        sprite: "julia/neutra",
        position: "left"
      },
      {
        speaker: "Leo",
        text: "Claro. Eu entendo. Vai bem na prova. (Visto às 22h47)",
        sprite: "leo/charmoso",
        position: "right",
        secondary: { sprite: "julia/neutra", position: "left" }
      },
      {
        type: "narration",
        text: "Ele não respondeu mais naquela noite. Nem no dia seguinte. Júlia fez a prova com a sensação estranha de ter feito alguma coisa errada — mesmo sem ter feito nada de errado."
      },
      { type: "transition", text: "Algumas semanas depois...", nextScene: "cena2" }
    ]
  },

  cena1_b: {
    inherit: "cena1",
    blocks: [
      {
        speaker: "Júlia",
        text: "Não, não, tudo bem! A Carla entende. Que horas você quer que eu vá?",
        sprite: "julia/neutra",
        position: "left"
      },
      {
        speaker: "Leo",
        text: "Sabia que eu podia contar com você. Te busco às oito.",
        sprite: "leo/charmoso",
        position: "right",
        secondary: { sprite: "julia/neutra", position: "left" }
      },
      {
        type: "narration",
        text: "Carla disse \"sem problema\" pelo WhatsApp, mas demorou quase um minuto para digitar. Júlia tentou não pensar nisso."
      },
      { type: "transition", text: "Algumas semanas depois...", nextScene: "cena2" }
    ]
  },

  // ===== CENA 2: O PRIMEIRO ALERTA =====
  cena2: {
    label: "Cena 2 — O primeiro alerta",
    bg: "julia/cena02_quarto_dia",
    blocks: [
      {
        type: "narration",
        text: "Sábado de manhã. Júlia mexia no celular, jogada na cama, quando achou uma foto antiga — viagem de família na praia, três anos atrás. Ela e a mãe, de biquíni, rindo do sol forte demais. Postou no Instagram com #tbt."
      },
      {
        type: "narration",
        text: "Doze minutos depois, o celular vibrou. Leo."
      },
      {
        speaker: "Leo",
        text: "Pra que postar foto assim? Não tem necessidade de um monte de gente ficar vendo seu corpo.",
        sprite: "leo/irritado",
        position: "right"
      },
      {
        speaker: "Leo",
        text: "Apaga isso agora. Não gosto que fiquem vendo o que é meu.",
        sprite: "leo/irritado",
        position: "right"
      },
      {
        speaker: "Júlia",
        text: "...",
        sprite: "julia/preocupada",
        position: "left",
        secondary: { sprite: "leo/irritado", position: "right" }
      },
      {
        type: "choice",
        question: "O que Júlia faz?",
        options: [
          {
            text: "Apagar a foto para evitar uma briga.",
            label: "Apagou a foto",
            set: { apagou_foto: true },
            violence: "Violência psicológica · controle de imagem",
            violenceExplanation: "Ele decide o que ela pode ou não compartilhar sobre o próprio corpo e história, tratando-a como propriedade.",
            next: "cena2_a"
          },
          {
            text: "Defender seu direito sobre as próprias memórias.",
            label: "Manteve a publicação",
            set: { apagou_foto: false },
            next: "cena2_b"
          }
        ]
      }
    ]
  },

  cena2_a: {
    inherit: "cena2",
    blocks: [
      {
        type: "narration",
        text: "Júlia abriu o app. O dedo dela passou por cima do botão de excluir três vezes antes de pressionar. A foto sumiu. Quarenta e sete curtidas, evaporadas em um toque."
      },
      {
        speaker: "Júlia",
        text: "Pronto. Apaguei.",
        sprite: "julia/preocupada",
        position: "left"
      },
      {
        speaker: "Leo",
        text: "Obrigado, amor. É porque eu te amo, sabe? Não quero que se exponham assim a você.",
        sprite: "leo/charmoso",
        position: "right",
        secondary: { sprite: "julia/preocupada", position: "left" }
      },
      {
        type: "narration",
        text: "Júlia ficou olhando o teto. Tinha a sensação de ter perdido alguma coisa, mas não sabia exatamente o quê."
      },
      { type: "transition", text: "Algumas semanas depois...", nextScene: "cena3" }
    ]
  },

  cena2_b: {
    inherit: "cena2",
    blocks: [
      {
        speaker: "Júlia",
        text: "Leo, é uma foto antiga, com a minha mãe. Eu não vou apagar. E o meu corpo não é \"seu\".",
        sprite: "julia/preocupada",
        position: "left"
      },
      {
        speaker: "Leo",
        text: "Olha o jeito que você tá falando comigo. Eu só estou cuidando de você. Tá bom, faz o que quiser. Boa sorte com os comentários que você vai receber.",
        sprite: "leo/irritado",
        position: "right",
        secondary: { sprite: "julia/preocupada", position: "left" },
        violence: "Tentativa de manipulação por culpa",
        violenceExplanation: "Ele transforma um pedido próprio em \"cuidado\", e a recusa dela em ingratidão. Quem se impõe, vira o errado."
      },
      {
        type: "narration",
        text: "Ele não respondeu mais naquele dia. Júlia manteve a foto, mas ficou checando o celular a cada cinco minutos."
      },
      { type: "transition", text: "Algumas semanas depois...", nextScene: "cena3" }
    ]
  },

  // ===== CENA 3: A ESCALADA DO CONTROLE =====
  cena3: {
    label: "Cena 3 — A escalada do controle",
    bg: "julia/cena03_exposicao",
    music: "musica_galeria",
    blocks: [
      {
        type: "narration",
        text: "A exposição de arte tinha sido ideia de Carla. Júlia mencionou en passant que tinha interesse, e Leo se autoconvidou \"pra fazer companhia\"."
      },
      {
        speaker: "Carla",
        text: "Olha esse contraste aqui. É absurdo. Ela trabalha com pigmento de terra de verdade, dá pra ver a textura.",
        sprite: "carla/padrao",
        position: "left"
      },
      {
        speaker: "Leo",
        text: "Mas é só uma mancha marrom, né? Sinceramente, qualquer criança faz isso. Vocês pagaram pra entrar nisso?",
        sprite: "leo/irritado",
        position: "right",
        secondary: { sprite: "carla/padrao", position: "left" }
      },
      {
        speaker: "Júlia",
        text: "Leo, fala baixo. Tem outras pessoas aqui.",
        sprite: "julia/preocupada",
        position: "center"
      },
      {
        speaker: "Leo",
        text: "Eu não tô falando alto. Você tá sensível. Quando você fica com a Carla, você sempre fica assim.",
        sprite: "leo/irritado",
        position: "right",
        secondary: { sprite: "julia/preocupada", position: "center" },
        violence: "Inversão de culpa · gaslighting incipiente",
        violenceExplanation: "Ele faz algo agressivo e em seguida acusa ela de estar \"sensível\" ou exagerando. O comportamento dele vira culpa dela."
      },
      {
        type: "narration",
        text: "Carla olhou para Júlia. Depois para Leo. Depois para o relógio do celular."
      },
      {
        speaker: "Carla",
        text: "Acho que eu vou indo. Tenho que acordar cedo.",
        sprite: "carla/padrao",
        position: "left"
      },
      {
        type: "choice",
        question: "O que Júlia faz?",
        options: [
          {
            text: "Pedir Carla pra ficar e confrontar Leo discretamente.",
            label: "Confrontou o Leo",
            set: { confrontou_leo_exposicao: true },
            next: "cena3_a"
          },
          {
            text: "Ceder e sugerir que todos vão embora juntos.",
            label: "Cedeu e foram embora",
            set: { confrontou_leo_exposicao: false },
            violence: "Violência psicológica · isolamento da rede de apoio",
            violenceExplanation: "Ceder ao desconforto que ele cria perto de amigos enfraquece esses laços. Com o tempo, sobra só ele.",
            next: "cena3_b"
          }
        ]
      }
    ]
  },

  cena3_a: {
    inherit: "cena3",
    blocks: [
      {
        speaker: "Júlia",
        text: "Carla, fica. Leo, posso falar com você um instante?",
        sprite: "julia/preocupada",
        position: "center"
      },
      {
        type: "narration",
        text: "Júlia puxou Leo para um canto da galeria, perto de uma instalação de som ambiente que mascarava as vozes."
      },
      {
        speaker: "Júlia",
        text: "O que você está fazendo? Eu queria ver essa exposição. A Carla também. Se você não está afim, tudo bem, mas para de tentar arruinar pra gente.",
        sprite: "julia/preocupada",
        position: "left"
      },
      {
        speaker: "Leo",
        text: "Caramba, Júlia. Eu vim aqui por você. Eu detesto esse tipo de coisa e ainda vim. E você fica do lado da Carla? Tá bom.",
        sprite: "leo/irritado",
        position: "right",
        secondary: { sprite: "julia/preocupada", position: "left" }
      },
      {
        type: "narration",
        text: "Ele ficou em silêncio o resto da exposição. Não saiu, mas também não falou mais com ninguém. Carla apertou o braço de Júlia na hora de se despedir, como quem diz: estou aqui."
      },
      { type: "transition", text: "Uma semana depois — véspera da entrega do TCC.", nextScene: "cena4" }
    ]
  },

  cena3_b: {
    inherit: "cena3",
    blocks: [
      {
        speaker: "Júlia",
        text: "Espera, Carla. Acho que a gente também tá indo. Foi um dia longo.",
        sprite: "julia/preocupada",
        position: "center"
      },
      {
        speaker: "Carla",
        text: "...tá. Boa noite, Ju.",
        sprite: "carla/padrao",
        position: "left"
      },
      {
        type: "narration",
        text: "Carla saiu primeiro. Sozinha. No carro, no caminho de volta, Leo passou o trajeto inteiro falando sobre como a noite tinha sido \"chata por culpa da Carla\". Júlia olhava pela janela e contava postes de luz."
      },
      { type: "transition", text: "Uma semana depois — véspera da entrega do TCC.", nextScene: "cena4" }
    ]
  },

  // ===== CENA 4: O PONTO DE RUPTURA (cinemática, sem escolha) =====
  cena4: {
    label: "Cena 4 — O ponto de ruptura",
    bg: "julia/cena02_quarto_dia",
    blocks: [
      {
        type: "narration",
        text: "Faltavam dezesseis horas para a entrega do TCC. Júlia estava sentada na cama, notebook no colo, tentando fechar a última seção. Leo tinha chegado havia uma hora e estava de braços cruzados encostado na escrivaninha."
      },
      {
        speaker: "Leo",
        text: "Você prometeu que a gente ia jantar fora hoje.",
        sprite: "leo/irritado",
        position: "right"
      },
      {
        speaker: "Júlia",
        text: "Amor, eu te avisei ontem. É a entrega amanhã. Não dá. Sábado a gente faz qualquer coisa.",
        sprite: "julia/preocupada",
        position: "left",
        secondary: { sprite: "leo/irritado", position: "right" }
      },
      {
        speaker: "Leo",
        text: "Sempre tem alguma coisa. Sempre tem alguma desculpa. Você não tem tempo pra mim faz semanas.",
        sprite: "leo/irritado",
        position: "right",
        secondary: { sprite: "julia/preocupada", position: "left" }
      },
      {
        speaker: "Júlia",
        text: "Leo, é UMA noite. Eu tô tentando me formar.",
        sprite: "julia/preocupada",
        position: "left",
        secondary: { sprite: "leo/irritado", position: "right" }
      },
      {
        type: "narration",
        text: "Foi rápido. Ele se levantou. Pegou o notebook. Pegou o notebook das mãos dela."
      },
      {
        speaker: "Leo",
        text: "VOCÊ AMA MAIS ESSA PORCARIA DO QUE A MIM!",
        sprite: "leo/furia",
        position: "right",
        violence: "Violência patrimonial · destruição de bem essencial",
        violenceExplanation: "Destruir algo que pertence a ela — sobretudo um instrumento de autonomia, como o notebook do TCC — é violência reconhecida em lei (Lei Maria da Penha, art. 7º, IV)."
      },
      { type: "transition", text: "...", nextScene: "cena4_pos" }
    ]
  },

  cena4_pos: {
    inherit: "cena4",
    bg: "julia/cena04_quarto_destruido",
    blocks: [
      {
        type: "narration",
        text: "O som do notebook contra o chão de madeira foi um som que ela não esqueceria mais. Plástico estalando. Tela rachando. Um pedaço pequeno deslizando até parar perto do tapete."
      },
      {
        type: "narration",
        text: "Leo saiu. Bateu a porta da frente. Júlia ficou parada na cama por um tempo que ela não conseguiu medir."
      },
      {
        speaker: "Júlia",
        text: "Meses. Eram meses de trabalho ali.",
        sprite: "julia/chorando",
        position: "center"
      },
      {
        type: "narration",
        text: "Ela se levantou. Ajoelhou perto do que restou do notebook. Tentou apertar o botão de ligar. Nada."
      },
      { type: "transition", text: "Sozinha. Tarde da noite. O celular na mão.", nextScene: "cena5" }
    ]
  },

  // ===== CENA 5: O PEDIDO DE AJUDA (BIFURCAÇÃO) =====
  cena5: {
    label: "Cena 5 — O pedido de ajuda",
    bg: "julia/cena05_quarto_fechado",
    blocks: [
      {
        type: "narration",
        text: "Júlia destravou o celular. A lista de contatos favoritos apareceu na tela. Ela podia ligar para alguém. Tinha que ligar para alguém."
      },
      {
        speaker: "Júlia",
        text: "Pra quem eu ligo? Pra quem eu ligo agora?",
        sprite: "julia/chorando",
        position: "center"
      },
      {
        type: "choice",
        question: "Quem Júlia procura?",
        options: [
          {
            text: "Ligar para Carla, a amiga.",
            label: "Ligou para Carla",
            next: "cena5_carla"
          },
          {
            text: "Ligar para Lúcia, a mãe.",
            label: "Ligou para Lúcia",
            next: "cena5_lucia"
          }
        ]
      }
    ]
  },

  cena5_carla: {
    inherit: "cena5",
    blocks: [
      {
        type: "narration",
        text: "Ela tocou no nome de Carla. Dois toques."
      },
      {
        speaker: "Carla",
        text: "Ju? Que horas são... espera, você tá chorando? O que aconteceu?",
        sprite: "carla/padrao",
        position: "right"
      },
      {
        speaker: "Júlia",
        text: "Ele quebrou. Carla, ele quebrou o meu notebook. O TCC tá lá dentro. Tudo. Ele... ele só pegou e jogou. Eu não sei o que fazer.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "carla/padrao", position: "right" }
      },
      {
        speaker: "Carla",
        text: "Ju, escuta. Eu tô indo pra aí agora. Não abre a porta pra ele. Você tá ouvindo? Não abre a porta pra ele. Eu chego em vinte minutos.",
        sprite: "carla/padrao",
        position: "right",
        secondary: { sprite: "julia/chorando", position: "left" }
      },
      {
        type: "narration",
        text: "Júlia desligou. Pela primeira vez em horas, sentiu que alguém estava do lado dela — completamente, sem dúvida, sem ressalva."
      },
      { type: "transition", text: "Na manhã seguinte. NAE da universidade.", nextScene: "cena6_carla" }
    ],
    setAlly: "carla"
  },

  cena5_lucia: {
    inherit: "cena5",
    blocks: [
      {
        type: "narration",
        text: "Ela tocou no nome da mãe. Demorou cinco toques."
      },
      {
        speaker: "Lúcia",
        text: "Ju, filha? Tá tudo bem? Você nunca liga a essa hora.",
        sprite: "lucia/padrao",
        position: "right"
      },
      {
        speaker: "Júlia",
        text: "Mãe, o Leo... ele quebrou o meu notebook. Tava com o TCC todo lá. Ele jogou no chão na frente de mim.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "lucia/padrao", position: "right" }
      },
      {
        speaker: "Lúcia",
        text: "Meu Deus, filha. Mas vocês brigaram? Por quê? Ele faz isso sempre?",
        sprite: "lucia/padrao",
        position: "right",
        secondary: { sprite: "julia/chorando", position: "left" }
      },
      {
        speaker: "Lúcia",
        text: "Olha, briga de namorado é uma coisa, sabe... mas escuta, todo casal passa por momentos difíceis. Seu pai e eu também tivemos as nossas crises. Você tem certeza que não pode conversar com ele com calma amanhã?",
        sprite: "lucia/padrao",
        position: "right",
        secondary: { sprite: "julia/chorando", position: "left" },
        violence: "Aliada falha · minimização da violência",
        violenceExplanation: "Quando alguém próximo trata a violência como \"briga normal de casal\", a vítima perde validação e tende a duvidar da própria percepção."
      },
      {
        speaker: "Júlia",
        text: "Mãe, ele DESTRUIU o meu computador. Não é briga.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "lucia/padrao", position: "right" }
      },
      {
        speaker: "Lúcia",
        text: "Eu sei, filha. Eu sei. Olha, amanhã eu pego um ônibus aí, tá? A gente conversa direito. Tenta dormir.",
        sprite: "lucia/padrao",
        position: "right",
        secondary: { sprite: "julia/chorando", position: "left" }
      },
      {
        type: "narration",
        text: "Júlia desligou. Sentiu-se um pouco menos sozinha — mas só um pouco. A mãe viria. Ela sabia que a mãe viria. Mas sabia também que ela não tinha entendido."
      },
      { type: "transition", text: "Na manhã seguinte. NAE da universidade.", nextScene: "cena6_lucia" }
    ],
    setAlly: "lucia"
  },

  // ===== CENA 6: O PRIMEIRO PASSO OFICIAL =====
  cena6_carla: {
    label: "Cena 6 — O primeiro passo oficial",
    bg: "julia/cena06_nae",
    blocks: [
      {
        type: "narration",
        text: "O Núcleo de Apoio ao Estudante ficava no segundo andar do prédio da reitoria. Carla insistiu em ir junto. Sentou-se ao lado de Júlia na sala de espera e segurou a mão dela até o nome ser chamado."
      },
      {
        speaker: "Sofia",
        text: "Júlia? Pode entrar. Pode entrar com sua acompanhante também, se você quiser.",
        sprite: "sofia/padrao",
        position: "right"
      },
      {
        speaker: "Júlia",
        text: "Quero. Quero, sim.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "sofia/padrao", position: "right" }
      },
      {
        type: "narration",
        text: "A sala era pequena, mas tinha luz natural. Sofia, a psicóloga, ofereceu água e indicou o sofá. Carla sentou ao lado de Júlia, deixando uma distância respeitosa mas presente."
      },
      {
        speaker: "Sofia",
        text: "Júlia, antes de qualquer coisa — você está em um lugar seguro aqui. Você pode me contar o que está sentindo no seu tempo. Não precisa ter pressa.",
        sprite: "sofia/padrao",
        position: "right"
      },
      {
        speaker: "Carla",
        text: "Ju, conta. Conta como aconteceu. Eu tô aqui.",
        sprite: "carla/padrao",
        position: "center",
        secondary: { sprite: "sofia/padrao", position: "right" }
      },
      {
        speaker: "Júlia",
        text: "Eu acho que eu deixei muita coisa passar. Eu sabia que tinha alguma coisa errada. Eu... eu sabia.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "sofia/padrao", position: "right" }
      },
      {
        speaker: "Sofia",
        text: "Júlia, o que você está fazendo agora — estar aqui — já é um passo enorme. E você não está sozinha nele. Vamos com calma. Você quer começar contando como vocês se conheceram?",
        sprite: "sofia/padrao",
        position: "right",
        secondary: { sprite: "julia/chorando", position: "left" }
      },
      {
        type: "narration",
        text: "Júlia respirou fundo. Olhou para Carla. Olhou para Sofia. Começou a contar do início — da festa, da água que não era cerveja, do jeito tranquilo de quem parecia saber exatamente o que dizer."
      },
      { type: "transition", text: "Fim do Modo 1 — Fragmentos", nextScene: "FIM" }
    ]
  },

  cena6_lucia: {
    label: "Cena 6 — O primeiro passo oficial",
    bg: "julia/cena06_nae",
    blocks: [
      {
        type: "narration",
        text: "O Núcleo de Apoio ao Estudante ficava no segundo andar do prédio da reitoria. Lúcia tinha vindo de ônibus de manhã cedo. Ofereceu para acompanhar Júlia — \"se você fizer questão\". Sentou-se ao lado dela na sala de espera, mexendo nas alças da bolsa."
      },
      {
        speaker: "Sofia",
        text: "Júlia? Pode entrar. Pode entrar com sua acompanhante também, se você quiser.",
        sprite: "sofia/padrao",
        position: "right"
      },
      {
        speaker: "Júlia",
        text: "Pode vir, mãe.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "sofia/padrao", position: "right" }
      },
      {
        type: "narration",
        text: "A sala era pequena, mas tinha luz natural. Sofia, a psicóloga, ofereceu água e indicou o sofá. Lúcia sentou-se na ponta, como se não soubesse se devia estar ali."
      },
      {
        speaker: "Sofia",
        text: "Júlia, antes de qualquer coisa — você está em um lugar seguro aqui. Você pode me contar o que está sentindo no seu tempo. Não precisa ter pressa.",
        sprite: "sofia/padrao",
        position: "right"
      },
      {
        speaker: "Lúcia",
        text: "Doutora, com licença. Eu acho importante a senhora saber que o rapaz é uma boa pessoa. Eu já conheci ele. Eles tiveram uma briga, é verdade, mas...",
        sprite: "lucia/padrao",
        position: "center",
        secondary: { sprite: "sofia/padrao", position: "right" },
        violence: "Aliada falha · tentativa de relativização",
        violenceExplanation: "Defender o agressor diante de um profissional desloca o foco do que aconteceu para uma imagem idealizada do relacionamento, desautorizando a fala da vítima."
      },
      {
        speaker: "Sofia",
        text: "Senhora Lúcia, eu entendo. E agradeço a senhora ter vindo apoiar a Júlia. Mas aqui, agora, é o espaço dela. Vamos escutar o que ela tem para dizer primeiro, sim?",
        sprite: "sofia/padrao",
        position: "right",
        secondary: { sprite: "lucia/padrao", position: "center" }
      },
      {
        speaker: "Júlia",
        text: "Mãe, deixa eu falar. Por favor.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "sofia/padrao", position: "right" }
      },
      {
        speaker: "Júlia",
        text: "Eu acho que eu deixei muita coisa passar. Eu sabia que tinha alguma coisa errada. Eu... eu sabia.",
        sprite: "julia/chorando",
        position: "left",
        secondary: { sprite: "sofia/padrao", position: "right" }
      },
      {
        speaker: "Sofia",
        text: "Júlia, o que você está fazendo agora — estar aqui — já é um passo enorme. Vamos com calma. Você quer começar contando como vocês se conheceram?",
        sprite: "sofia/padrao",
        position: "right",
        secondary: { sprite: "julia/chorando", position: "left" }
      },
      {
        type: "narration",
        text: "Júlia respirou fundo. Sentiu o silêncio desconfortável da mãe ao lado. Começou a contar do início — da festa, da água que não era cerveja, do jeito tranquilo de quem parecia saber exatamente o que dizer."
      },
      { type: "transition", text: "Fim do Modo 1 — Fragmentos", nextScene: "FIM" }
    ]
  }
};
