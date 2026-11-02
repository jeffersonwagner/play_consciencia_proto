// ============================================================
// ROTEIRO — MODO 2 "A PONTE" · JÚLIA
// Aliada eficaz: Carla (amiga). Aliada falha: Lúcia (mãe).
// RASCUNHO para revisão do pesquisador e de especialista.
//
// Cada conversa tem uma resposta acolhedora, uma insuficiente e uma
// prejudicial (ordem variada de propósito). Escala de confiança:
//   mensagem  +3 / 0 / −5      ligação  +8 / +1 / −8
//   visita   +13 / +2 / −12    ação de vitória (semana 4) +25
// Na semana 4, as respostas acolhedoras sem a carta valem menos (ligação
// +7, visita +10): só validar já não basta; o avanço depende de nomear a
// violência (ver docs/MODO2.md).
// Regras e balanceamento: docs/MODO2.md
// ============================================================

import type { ChatLine, PonteAllyContent, PonteContent, PonteOption } from '../../types';

const j = (text: string): ChatLine => ({ from: 'protagonista', text });
const n = (text: string): ChatLine => ({ from: 'narrador', text });
const op = (delta: number, text: string, replies: ChatLine[], feedback: string, extra: Partial<PonteOption> = {}): PonteOption =>
  ({ delta, text, replies, feedback, ...extra });

const VICTORY_CARD = 'violencia-patrimonial';
const victory = { requiresCard: VICTORY_CARD, victory: true };

const FB = {
  vitoria: 'Nomear a violência com informação correta, ligar o "presente" ao controle e oferecer companhia — sem pressionar — é a ação que mais fortalece a decisão dela.',
  privacidade: 'Afirmar o direito dela à privacidade combate a lógica de posse do agressor: um presente não compra o direito de vigiar.',
  gaslighting: 'Duvidar da percepção dela reproduz o gaslighting do agressor e a deixa ainda mais sozinha.',
  ambivalencia: 'Validar sentimentos ambivalentes é essencial: a vítima costuma gostar do parceiro e, ao mesmo tempo, temê-lo.',
  opcoes: 'Dar opções e respeitar o ritmo dela, priorizando a segurança, constrói confiança.',
};

// ------------------------------------------------------------
// CARLA — aliada eficaz
// ------------------------------------------------------------
const carla: PonteAllyContent = {
  name: 'Carla',
  relation: 'amiga',
  sprite: 'carla/padrao',
  startTrust: 50,
  intro: 'Você é Carla, amiga de Júlia. Depois da conversa no NAE, ela voltou para casa — e para uma rotina em que Leo continua presente. Nas próximas quatro semanas, você não pode decidir por ela. Mas pode ser alguém em quem ela confia o bastante para dar o próximo passo.',
  weeks: [
    {
      title: 'O choque',
      phase: 'Depois da explosão',
      event: [
        j('Não consigo levantar da cama.'),
        j('Eram oito meses de TCC. A orientadora disse que dá pra pedir prorrogação, mas eu nem consigo abrir o e-mail.'),
      ],
      interactions: {
        mensagem: {
          opening: [j('Desculpa sumir. Tô sem cabeça pra nada.')],
          options: [
            op(3, 'Não precisa pedir desculpa. Tô aqui, no seu tempo. Quer que eu passe aí mais tarde ou prefere só conversar por aqui?',
              [j('Por aqui, por enquanto. Obrigada, Carla.')],
              'Oferecer presença sem impor um ritmo respeita a autonomia dela.'),
            op(-5, 'Eu te avisei que esse cara não prestava.',
              [j('Eu sei. Eu sou uma idiota mesmo.')],
              '"Eu te avisei" desloca a culpa para a vítima e aumenta a vergonha — e a vergonha afasta.'),
            op(0, 'Força, amiga! Vai dar tudo certo 💪',
              [j('Valeu.')],
              'Frases otimistas genéricas não são erradas, mas podem soar como pressa para ela "ficar bem".'),
          ],
        },
        ligacao: {
          opening: [
            n('Júlia atende no quarto toque. A voz está rouca.'),
            j('Eu fico pensando que, se eu tivesse ido jantar com ele naquele dia, nada disso teria acontecido.'),
          ],
          options: [
            op(-8, 'Bom, talvez você tenha provocado um pouco, né? Mas ele exagerou.',
              [j('…É, talvez.'), n('Ela desliga logo depois.')],
              'Sugerir que ela "provocou" reforça a culpa que o agressor já colocou nela. Nada justifica a violência.'),
            op(8, 'Ju, a escolha de quebrar o notebook foi dele. Você não fez nada que justifique isso. E o que você tá sentindo faz todo sentido.',
              [j('Ninguém tinha falado assim comigo. Todo mundo pergunta o que eu fiz.')],
              'Devolver a responsabilidade ao agressor e validar os sentimentos dela é o centro do apoio.'),
            op(1, 'Não pensa nisso agora. Tenta descansar.',
              [j('Tá. Vou tentar.')],
              'Cuidar do descanso é bom, mas evitar o assunto deixa a culpa dela sem resposta.'),
          ],
        },
        visita: {
          opening: [
            n('Você leva café e pão de queijo. O notebook quebrado ainda está no canto do quarto.'),
            j('Eu não sei nem por onde começar. O TCC, a faculdade, ele… tudo.'),
          ],
          options: [
            op(2, 'Vamos assistir alguma coisa pra você distrair a cabeça?',
              [j('Pode ser.')],
              'Companhia ajuda, mas o momento pedia escuta sobre o que aconteceu.'),
            op(13, 'A gente não precisa resolver tudo hoje. Quer que eu te ajude com uma coisa só? Posso ver com você o pedido de prorrogação — e meu primo talvez consiga recuperar os arquivos do HD.',
              [j('Você faria isso? …Tá. Uma coisa de cada vez.'), n('Pela primeira vez na semana, Júlia come alguma coisa.')],
              'Ajuda prática, oferecida — não imposta — reduz a sensação de impotência sem tirar dela as decisões.'),
            op(-12, 'Você tem que terminar com ele hoje. Me dá o celular que eu mando a mensagem.',
              [j('Carla, para. Não é assim.'), n('O clima fica pesado. Você vai embora mais cedo.')],
              'Decidir por ela, mesmo com boa intenção, repete a dinâmica de controle que ela vive com o agressor.'),
          ],
        },
      },
    },
    {
      title: 'A recompensa',
      phase: 'Lua de mel',
      event: [
        j('Carla, você não vai acreditar.'),
        j('O Leo apareceu aqui com um notebook novo. Melhor que o meu antigo. Ele chorou, pediu desculpas, disse que nunca mais.'),
        j('Acho que ele está mudando.'),
      ],
      interactions: {
        mensagem: {
          opening: [j('Ele até instalou os programas pra mim 😅')],
          options: [
            op(0, 'Que bom que você tem um notebook de novo.',
              [j('Pois é!')],
              'Reconhecer a necessidade prática é compreensível, mas sem perguntar como ela se sente o gesto dele fica sem questionamento.'),
            op(-5, 'Sério que você caiu nessa? Que boba, Ju.',
              [j('Nossa. Obrigada pelo apoio.')],
              'Chamá-la de "boba" gera vergonha; ela tende a parar de contar as coisas para você.'),
            op(3, 'E você, como tá se sentindo com tudo isso?',
              [j('Não sei. Feliz? Mas ao mesmo tempo parece que eu tô devendo alguma coisa pra ele.')],
              'Perguntar sobre os sentimentos dela, sem julgar, abre espaço para ela mesma perceber o desconforto.'),
          ],
        },
        ligacao: {
          opening: [j('Ele disse que foi um momento de descontrole por causa do estresse. Que me ama demais.')],
          options: [
            op(8, 'Fico feliz que ele tenha pedido desculpas, mas me preocupo com você. Pedir desculpas não apaga o que aconteceu. Como você ficaria se acontecesse de novo?',
              [j('…Eu ficaria com medo. Eu ainda fico com medo quando ele levanta a voz.')],
              'Separar o pedido de desculpas da violência ajuda a perceber a fase de "lua de mel" do ciclo.'),
            op(-8, 'Se ele te ama tanto assim, talvez valha a pena tentar de novo.',
              [j('É o que eu tô pensando.')],
              'Legitimar a "lua de mel" reforça o ciclo da violência: depois dela, a tensão volta a crescer.'),
            op(1, 'Hmm. Você que sabe.',
              [j('É… eu que sei.')],
              'Respeitar a decisão dela é importante, mas a indiferença pode soar como abandono.'),
          ],
        },
        visita: {
          opening: [
            n('Vocês se encontram na lanchonete da faculdade. O notebook novo está na mesa, ainda com o adesivo da loja.'),
            j('Eu me sinto mal de não estar mais feliz com isso.'),
          ],
          options: [
            op(-12, 'Você tá sendo ingrata. Ele se esforçou.',
              [j('Até você acha isso.'), n('Ela guarda o notebook e muda de assunto.')],
              'Cobrar gratidão pelo "presente" coloca você ao lado do agressor.'),
            op(2, 'Deixa isso pra lá, vamos falar de outra coisa.',
              [j('Tá bom.')],
              'Mudar de assunto alivia o momento, mas perde a chance de ouvir o que ela está sentindo.'),
            op(13, 'Você não tem obrigação de ficar feliz. Um presente não desfaz o que ele fez — e tudo bem sentir as duas coisas ao mesmo tempo.',
              [j('É isso. É exatamente isso. Parece que eu sou ingrata, mas não é.')],
              FB.ambivalencia),
          ],
        },
      },
    },
    {
      title: 'A vigilância',
      phase: 'Aumento da tensão',
      event: [
        j('Agora o Leo me busca todo dia na saída da aula.'),
        j('Ele diz que é pra eu não voltar sozinha, que é perigoso.'),
        j('Mas se eu demoro cinco minutos ele já liga perguntando onde eu tô.'),
      ],
      interactions: {
        mensagem: {
          opening: [j('Hoje ele ficou bravo porque eu parei pra falar com um colega do grupo.')],
          options: [
            op(-5, 'Ah, isso é ciúme normal, todo namorado faz.',
              [j('Será?')],
              'Normalizar o controle como "ciúme normal" é um dos fatores que mantêm a violência invisível.'),
            op(3, 'Isso parece mais vigilância do que cuidado. Como você se sente quando ele faz isso?',
              [j('Sufocada. Mas eu não queria pensar assim.')],
              'Nomear o comportamento com cuidado, e devolver a pergunta, ajuda ela a confiar na própria percepção.'),
            op(0, 'Que chato. Ignora.',
              [j('Não dá pra ignorar ele.')],
              'Ignorar não é uma opção real para quem vive sob vigilância.'),
          ],
        },
        ligacao: {
          opening: [j('Eu sinto falta de voltar com você depois da aula, de passar na livraria…')],
          options: [
            op(1, 'Fala pra ele que você quer voltar sozinha e pronto.',
              [j('Você não entende. Não é tão simples.')],
              'A sugestão é bem-intencionada, mas ignora o risco de confronto e a dinâmica de controle.'),
            op(8, 'Que tal eu te encontrar na saída nos dias em que a gente tem horário parecido? Aí você volta comigo, sem precisar explicar nada pra ninguém.',
              [j('Terça e quinta dá. Eu ia gostar muito.')],
              'Oferecer companhia concreta reduz o isolamento sem expor Júlia a um confronto.'),
            op(-8, 'Se você não fala nada, é porque gosta, né?',
              [j('Isso não é justo.')],
              'Culpar a vítima pelo próprio silêncio ignora o medo que o sustenta.'),
          ],
        },
        visita: {
          opening: [
            n('Terça-feira. Você espera Júlia na porta do bloco. Leo está no estacionamento, olhando.'),
            j('Ele tá ali. Ele vai ficar bravo.'),
          ],
          options: [
            op(13, 'Você decide. Se quiser, a gente vai juntas até a lanchonete e eu fico com você o tempo todo. Se preferir ir com ele hoje, tudo bem também — eu tô aqui amanhã.',
              [n('Júlia respira fundo e vai com você. Leo vai embora, mas manda várias mensagens.'), j('Obrigada por não me forçar. E por estar aqui.')],
              FB.opcoes),
            op(-12, 'Deixa que eu vou lá falar umas verdades pra ele.',
              [j('Não! Por favor, não. Vai ser pior pra mim depois.')],
              'Confrontar o agressor pode aumentar o risco para a vítima. A segurança dela vem antes da sua indignação.'),
            op(0, 'Então vai lá, a gente se fala depois.',
              [n('Júlia caminha até o carro de Leo sem olhar para trás.')],
              'Ceder ao controle sem oferecer alternativa reforça o isolamento.'),
          ],
        },
      },
    },
    {
      title: 'O confronto silencioso',
      phase: 'Aumento da tensão',
      event: [
        j('Ele pediu a senha do notebook.'),
        j('Disse que, como foi ele que deu, tem o direito de ver o que eu faço nele.'),
        j('Eu não sei se tô exagerando de não querer dar.'),
      ],
      interactions: {
        mensagem: {
          opening: [j('Talvez seja justo, né? O notebook foi ele que comprou.')],
          options: [
            op(-5, 'Se foi ele que pagou, ele tem razão.',
              [j('Foi o que eu pensei.')],
              'O "presente" virou instrumento de controle. Concordar com isso legitima a violência patrimonial.'),
            op(3, 'Não é exagero. O notebook é seu, e sua privacidade também. Um presente não dá a ele o direito de te vigiar.',
              [j('Eu precisava ouvir isso de alguém.')],
              FB.privacidade),
            op(0, 'Sei lá, Ju. Complicado.',
              [j('É.')],
              'Hesitar deixa a dúvida dela sem resposta.'),
          ],
        },
        ligacao: {
          opening: [j('Ele ficou repetindo: "depois de tudo que eu fiz por você". Eu tô cansada, Carla.')],
          options: [
            op(7, 'Você tem todo o direito de não dar a senha. E não precisa decidir nada sozinha — eu tô com você.',
              [j('Obrigada. Eu ainda não sei o que fazer, mas me sinto menos maluca.')],
              'Apoio e validação sustentam a confiança, mesmo quando ela ainda não está pronta para agir.'),
            op(-8, 'Dá a senha logo pra ele parar de encher.',
              [j('Você também acha que eu devia ceder?')],
              'Aconselhar a ceder ao controle para "evitar briga" reforça o poder do agressor.'),
            op(25, 'Ju, eu li sobre isso. Quebrar o seu notebook foi violência patrimonial — tá na Lei Maria da Penha. E agora o notebook "de presente" virou um jeito de te controlar. Não é cuidado, é a mesma coisa de outro jeito. Se você quiser registrar o que aconteceu, eu vou com você.',
              [n('Silêncio do outro lado da linha. Depois, um soluço.'), j('Tem nome. O que ele fez tem nome.'), j('Eu quero ir. Você vai comigo mesmo?')],
              FB.vitoria, victory),
          ],
        },
        visita: {
          opening: [
            n('Vocês se encontram na sua casa. Júlia chega com o notebook na mochila — e o desliga antes de sentar.'),
            j('Ele vê tudo. Eu sinto que ele vê tudo.'),
          ],
          options: [
            op(2, 'Quer trocar a senha de tudo agora? Eu te ajudo.',
              [j('Talvez. Mas aí ele vai perceber.')],
              'Segurança digital é importante, mas precisa ser planejada com ela para não aumentar o risco.'),
            op(25, 'Eu pesquisei sobre o que aconteceu com você. Tem nome: violência patrimonial. Quebrar o seu instrumento de estudo é violência pela Lei Maria da Penha. E esse notebook, que era pra ser um pedido de desculpas, virou mais uma forma de controle. Você não está exagerando. Quando você quiser registrar, eu vou junto.',
              [j('Ele quebrou o meu notebook e agora quer controlar o outro.'), j('Eu quero registrar. Você vai comigo?')],
              FB.vitoria, victory),
            op(10, 'Você não está exagerando. O que você sente é um sinal importante. Eu tô aqui pro que você precisar.',
              [j('Obrigada, Carla. De verdade.')],
              'Escutar e validar mantém a ponte firme.'),
            op(-12, 'Você tá ficando paranoica, Ju.',
              [j('Até você.')],
              FB.gaslighting),
          ],
        },
      },
    },
  ],
  endings: {
    positivo: [
      n('Na segunda-feira seguinte, Carla e Júlia chegam juntas à Delegacia da Mulher.'),
      j('Obrigada por não desistir de mim.'),
      n('Júlia registra o boletim de ocorrência pela destruição do notebook. O caso dela segue para a rede de proteção — é ali que começa o Modo 3, Dossiê 180.'),
    ],
    neutro: [
      n('As semanas passam. Júlia continua respondendo suas mensagens, às vezes com atraso.'),
      j('Tá tudo mais calmo. Acho que vai ficar tudo bem.'),
      n('A ponte existe, mas ainda não é forte o suficiente. O ciclo continua — e Júlia sabe que pode contar com você quando ele recomeçar.'),
    ],
    negativo: [
      j('Carla, eu preciso de um tempo.'),
      j('Não é nada com você. Eu só não quero falar sobre isso agora.'),
      n('As mensagens passam a ficar sem resposta. Júlia está mais sozinha — e o ciclo, mais forte.'),
    ],
  },
};

// ------------------------------------------------------------
// LÚCIA — aliada falha (o desafio é superar o próprio viés)
// ------------------------------------------------------------
const lucia: PonteAllyContent = {
  name: 'Lúcia',
  relation: 'mãe',
  sprite: 'lucia/padrao',
  startTrust: 40,
  intro: 'Você é Lúcia, mãe de Júlia. No NAE, você defendeu o Leo — e viu o rosto da sua filha se fechar. Nas próximas quatro semanas, você vai se ver diante do que aprendeu sobre casamento e "brigas de casal". Algumas respostas vão parecer naturais para você. Nem sempre são as que ajudam.',
  weeks: [
    {
      title: 'O choque',
      phase: 'Depois da explosão',
      event: [
        j('Mãe, não consigo levantar da cama.'),
        j('Eram oito meses de TCC.'),
      ],
      interactions: {
        mensagem: {
          opening: [j('A senhora já chegou em casa?')],
          options: [
            op(-5, 'Já, filha. Olha, computador a gente compra outro, o importante é vocês ficarem bem.',
              [j('Não é sobre o computador, mãe.')],
              'Reduzir a violência a um prejuízo material ("compra outro") minimiza o que ela viveu.'),
            op(3, 'Já, mas meu coração ficou aí. Como você está, de verdade?',
              [j('Mal, mãe. Muito mal.')],
              'Perguntar pelo sentimento, e não pelo objeto, mostra que você está vendo a dor dela.'),
            op(0, 'Já. Come alguma coisa, viu?',
              [j('Tá.')],
              'Cuidado prático é amor, mas não alcança o que ela está sentindo.'),
          ],
        },
        ligacao: {
          opening: [j('Eu fico pensando que, se eu tivesse ido jantar com ele naquele dia, nada disso teria acontecido.')],
          options: [
            op(1, 'Filha, não fica remoendo isso.',
              [j('Não consigo não remoer.')],
              'Pedir que ela "pare de pensar" não responde à culpa que ela sente.'),
            op(-8, 'É, minha filha, homem quando é contrariado fica nervoso. A gente tem que saber lidar.',
              [j('Então a culpa é minha?')],
              'Este é o viés de Lúcia: ensinar a mulher a "lidar" com a agressão naturaliza a violência.'),
            op(8, 'Ju, eu falei besteira no NAE e quero te pedir desculpas. Você não tem culpa. Quem quebrou o notebook foi ele, e isso não se faz.',
              [n('Silêncio na linha.'), j('Obrigada por dizer isso, mãe. Eu precisava.')],
              'Reconhecer o próprio erro é o primeiro passo de uma aliada falha que quer superar o viés.'),
          ],
        },
        visita: {
          opening: [
            n('Você volta à cidade de Júlia no fim de semana. O notebook quebrado ainda está no canto do quarto.'),
            j('Oito meses, mãe. Oito meses.'),
          ],
          options: [
            op(-12, 'Pelo menos ele não encostou em você, né? Podia ter sido pior.',
              [j('Mãe… sério?'), n('Júlia vira para a parede.')],
              'Comparar com "algo pior" invalida o que ela sofreu. Violência patrimonial é violência.'),
            op(2, 'Eu te ajudo a pagar um computador novo.',
              [j('Obrigada… mas não é isso que dói.')],
              'A ajuda material é bem-vinda, mas focar só no objeto deixa a dor emocional de lado.'),
            op(13, 'Senta aqui comigo. Não foi só o computador, né? Foi o seu trabalho, o seu esforço. Eu sei que dói.',
              [n('Júlia deita a cabeça no colo da mãe, como não fazia havia anos.'), j('Dói muito, mãe.')],
              'Ao focar na dor emocional, e não no prejuízo material, Lúcia começa a superar o próprio viés.'),
          ],
        },
      },
    },
    {
      title: 'A recompensa',
      phase: 'Lua de mel',
      event: [
        j('Mãe, o Leo trouxe um notebook novo pra mim.'),
        j('Ele chorou, pediu desculpas, disse que nunca mais.'),
        j('Acho que ele está mudando.'),
      ],
      interactions: {
        mensagem: {
          opening: [j('Ele até instalou os programas pra mim.')],
          options: [
            op(3, 'E você, filha, como se sente com isso?',
              [j('Confusa. Parece que eu tô devendo alguma coisa.')],
              'Perguntar, em vez de comemorar, deixa espaço para ela perceber o desconforto.'),
            op(-5, 'Graças a Deus! Eu sabia que ele era um bom rapaz.',
              [j('É… acho que sim.')],
              'Celebrar o "gesto nobre" do agressor reforça a fase de lua de mel — é o viés que Lúcia precisa evitar.'),
            op(0, 'Que bom que você tem com o que estudar.',
              [j('É.')],
              'Focar no lado prático é compreensível, mas deixa o gesto dele sem questionamento.'),
          ],
        },
        ligacao: {
          opening: [j('Ele disse que foi o estresse. Que me ama demais.')],
          options: [
            op(-8, 'Seu pai também tinha os rompantes dele, filha, e olha nós aqui. Relacionamento é assim.',
              [j('Mãe, eu não quero que seja assim.')],
              'Usar a própria história para normalizar a violência é comum em quem viveu relações parecidas — e transmite o ciclo adiante.'),
            op(1, 'Bom, se ele pediu desculpas…',
              [j('Pois é.')],
              'A frase incompleta deixa implícito que o pedido de desculpas resolve tudo.'),
            op(8, 'Pedir desculpas é o mínimo, filha. Eu já vi esse filme: depois do presente vem a calmaria; depois da calmaria, a briga de novo. Eu não quero isso pra você.',
              [j('A senhora nunca tinha falado assim.'), j('Eu também tenho medo que aconteça de novo.')],
              'Lúcia usa a própria experiência para reconhecer o ciclo, em vez de normalizá-lo.'),
          ],
        },
        visita: {
          opening: [
            n('Almoço de domingo. O notebook novo está sobre a mesa.'),
            j('Eu me sinto mal de não estar mais feliz com isso.'),
          ],
          options: [
            op(13, 'Você não tem obrigação de ficar feliz. Um presente não apaga o que ele fez — e tudo bem sentir as duas coisas.',
              [j('Obrigada por entender, mãe.')],
              FB.ambivalencia),
            op(-12, 'Ingratidão não combina com você, Júlia. Ele se esforçou.',
              [j('Eu sabia que a senhora ia ficar do lado dele.')],
              'Cobrar gratidão coloca a mãe ao lado do agressor — exatamente o que Júlia temia.'),
            op(2, 'Vamos almoçar, depois a gente conversa.',
              [j('Tá bom.'), n('A conversa não volta.')],
              'Adiar o assunto evita conflito, mas perde a chance de ouvir.'),
          ],
        },
      },
    },
    {
      title: 'A vigilância',
      phase: 'Aumento da tensão',
      event: [
        j('Mãe, agora o Leo me busca todo dia na faculdade.'),
        j('Diz que é pra eu não voltar sozinha.'),
        j('Mas se eu demoro cinco minutos ele já liga perguntando onde eu tô.'),
      ],
      interactions: {
        mensagem: {
          opening: [j('Hoje ele ficou bravo porque eu parei pra falar com um colega.')],
          options: [
            op(0, 'Me liga quando chegar em casa, tá?',
              [j('Tá, mãe.')],
              'Pedir notícias mostra cuidado, mas não ajuda a nomear o que está acontecendo.'),
            op(3, 'Isso parece mais controle do que cuidado, filha. Como você se sente?',
              [j('Sufocada, mãe.')],
              'Lúcia reconhece sinais de sufocamento em vez de elogiar o "cuidado".'),
            op(-5, 'Que rapaz atencioso! Hoje em dia é difícil um homem que se preocupa assim.',
              [j('…')],
              'Elogiar o "cuidado" confunde vigilância com proteção — o viés que o GDD pede para Lúcia evitar.'),
          ],
        },
        ligacao: {
          opening: [j('Eu sinto falta de voltar sozinha, de passar na livraria…')],
          options: [
            op(8, 'Então vamos combinar: nos dias que você quiser, me liga na saída e a gente conversa no caminho. Você não fica sozinha e não precisa dar satisfação a ele.',
              [j('Eu ia gostar, mãe.')],
              'Presença concreta e combinada reduz o isolamento sem expor Júlia.'),
            op(-8, 'Ele só quer te proteger, filha. Deixa ele cuidar de você.',
              [j('Não é proteção, mãe.')],
              'Confundir vigilância com proteção é o viés que Lúcia precisa superar.'),
            op(1, 'Fala pra ele que você quer ir sozinha.',
              [j('Não é tão simples.')],
              'A sugestão ignora o medo e o risco de confronto.'),
          ],
        },
        visita: {
          opening: [
            n('Você chega de surpresa para buscar Júlia na faculdade. Leo já está lá, no estacionamento.'),
            j('Mãe? Ele vai ficar bravo…'),
          ],
          options: [
            op(-12, 'Oi, Leo! Que bom te ver, meu filho. Cuidando da minha menina, hein?',
              [n('Júlia entra no carro de Leo sem olhar para trás.')],
              'Elogiar o "cuidado" do agressor diante da filha confirma que ele tem o apoio da família.'),
            op(13, 'Você decide, filha. Se quiser, a gente vai tomar um café só nós duas. Se preferir ir com ele, eu respeito — mas tô aqui.',
              [n('Júlia hesita. Depois segura o braço da mãe.'), j('Vamos tomar o café, mãe.')],
              FB.opcoes),
            op(2, 'Leo, hoje ela vai comigo.',
              [n('Leo sorri para Lúcia e manda uma mensagem para Júlia: "depois a gente conversa".'), j('Mãe, ele vai cobrar isso depois.')],
              'Decidir por ela, na frente dele, pode aumentar o risco depois.'),
          ],
        },
      },
    },
    {
      title: 'O confronto silencioso',
      phase: 'Aumento da tensão',
      event: [
        j('Mãe, o Leo pediu a senha do notebook.'),
        j('Disse que, como foi ele que deu, tem direito de ver o que eu faço.'),
        j('Será que eu tô exagerando?'),
      ],
      interactions: {
        mensagem: {
          opening: [j('Talvez seja justo, né? Foi ele que comprou.')],
          options: [
            op(0, 'Não sei, filha. No meu tempo não tinha essas coisas.',
              [j('Tá, mãe.')],
              'A distância de geração não precisa virar desinteresse; perguntar mais ajudaria.'),
            op(-5, 'Dá a senha, filha. Não vale a pena brigar por isso.',
              [j('Foi o que eu pensei.')],
              'Aconselhar a ceder ao controle "para evitar briga" legitima a violência patrimonial.'),
            op(3, 'Não é justo, filha. Presente não dá direito de vigiar ninguém.',
              [j('Obrigada, mãe.')],
              FB.privacidade),
          ],
        },
        ligacao: {
          opening: [j('Ele ficou repetindo: "depois de tudo que eu fiz por você". Eu tô cansada, mãe.')],
          options: [
            op(-8, 'Homem é orgulhoso assim mesmo, filha. Dá um tempo pra ele.',
              [j('A senhora sempre arruma uma desculpa pra ele.')],
              'Justificar o comportamento dele com "é assim mesmo" naturaliza o controle.'),
            op(25, 'Filha, eu pesquisei. O que o Leo fez com o seu notebook tem nome: violência patrimonial, e está na Lei Maria da Penha. E agora esse notebook novo virou um jeito de te controlar. Eu errei quando defendi ele. Se você quiser registrar o que aconteceu, eu vou com você.',
              [n('Silêncio. Depois, a voz de Júlia, embargada.'), j('Mãe… a senhora vai comigo mesmo?')],
              'Lúcia supera o próprio viés: nomeia a violência com informação correta, reconhece o erro e oferece companhia — sem pressionar.', victory),
            op(7, 'Você tem o direito de não dar a senha. E não precisa decidir nada sozinha.',
              [j('Obrigada, mãe. Eu ainda não sei o que fazer.')],
              'Apoio e validação sustentam a confiança, mesmo quando ela ainda não está pronta para agir.'),
            op(1, 'Descansa, filha. Amanhã você pensa nisso.',
              [j('Tá.')],
              'Cuidar do descanso é bom, mas a dúvida dela fica sem resposta.'),
          ],
        },
        visita: {
          opening: [
            n('Você pega o primeiro ônibus. Júlia abre a porta com o notebook novo, desligado, debaixo do braço.'),
            j('Ele vê tudo, mãe. Eu sinto que ele vê tudo.'),
          ],
          options: [
            op(10, 'Você não está exagerando. Eu tô aqui, e não vou embora.',
              [j('Obrigada, mãe.')],
              'Escutar e validar mantém a ponte firme.'),
            op(-12, 'Isso é coisa da sua cabeça, filha. Ele é um bom rapaz.',
              [j('Por que a senhora sempre defende ele?')],
              FB.gaslighting),
            op(25, 'Filha, eu fui ler sobre isso. Quebrar o seu notebook foi violência patrimonial, está na lei. E esse notebook novo, que parecia um pedido de desculpas, virou mais uma forma de controle. Eu demorei pra enxergar. Quando você quiser registrar, eu vou junto.',
              [j('Eu quero, mãe. Eu quero registrar.')],
              'Lúcia supera o próprio viés: nomeia a violência com informação correta, reconhece o erro e oferece companhia — sem pressionar.', victory),
          ],
        },
      },
    },
  ],
  endings: {
    positivo: [
      n('Na segunda-feira, mãe e filha chegam juntas à Delegacia da Mulher. Lúcia segura a bolsa com força — e a mão de Júlia também.'),
      j('Obrigada por ter mudado, mãe.'),
      n('Júlia registra o boletim de ocorrência. O caso segue para a rede de proteção — é ali que começa o Modo 3, Dossiê 180.'),
    ],
    neutro: [
      n('As ligações de domingo continuam. Júlia conta algumas coisas — não todas.'),
      j('Tá tudo mais calmo, mãe. Não se preocupa.'),
      n('A ponte entre vocês existe, mas ainda balança. O ciclo continua.'),
    ],
    negativo: [
      j('Mãe, eu preciso de um tempo.'),
      j('Toda vez que eu falo com a senhora eu saio me sentindo pior.'),
      n('Júlia para de atender as ligações. Longe da mãe e das amigas, ela fica mais exposta ao ciclo.'),
    ],
  },
};

export const ponte: PonteContent = {
  avatar: 'julia/neutra',
  victoryCard: VICTORY_CARD,
  allies: { carla, lucia },
};
