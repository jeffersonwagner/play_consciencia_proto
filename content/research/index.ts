// ============================================================
// TCLE E QUESTIONÁRIOS DA PESQUISA
// Transcritos de TCLE.docx e Anexos_Instrumentos_Coleta.pdf (UFLA/PPGCC).
// Ajustes para o formato dentro do jogo:
//   - o "Código do participante" não é perguntado: o jogo gera o código
//     e o grava em todas as respostas;
//   - "Modo(s) jogado(s)" também não: os modos concluídos vão para a
//     aba Participantes automaticamente;
//   - o TCLE não pede nome, RG/CPF, telefone nem assinatura (o jogo não
//     coleta dados pessoais). O aceite é registrado com data, hora e
//     versão do termo, e o participante pode baixar a sua via.
// O Registro de Entrevista (instrumento 1) é preenchido pelo pesquisador
// fora do jogo.
// ============================================================

/** true exibe a faixa "versão provisória" nas telas da pesquisa. */
export const PLACEHOLDER = false;

export interface TcleContent {
  /** Versão do texto (gravada junto com o aceite). */
  version: string;
  title: string;
  /** Cabeçalho (instituição, pesquisadores, contatos). */
  header: string[];
  sections: { title: string; paragraphs: string[] }[];
  /** Declarações que o participante precisa marcar para aceitar. */
  declarations: string[];
  /** Pergunta de autorização de gravação em áudio (resposta Sim/Não obrigatória). */
  audioQuestion: string;
}

interface BaseItem {
  id: string;
  text: string;
  required?: boolean;
  /** Dimensão avaliada (ex.: "Bloom: Compreensão"), gravada com a resposta. */
  dimension?: string;
}

export type QuestionItem =
  | BaseItem & { type: 'likert'; scale?: string[] }
  | BaseItem & { type: 'escolha'; options: string[]; /** Alternativa correta (itens de conhecimento). */ correct?: string }
  | BaseItem & { type: 'multipla'; options: string[] }
  | BaseItem & { type: 'texto' }
  | BaseItem & { type: 'curto' }
  | BaseItem & { type: 'numero'; min?: number; max?: number };

export interface Questionnaire {
  /** Identificador gravado na planilha (ex.: "pre", "pos"). */
  id: string;
  title: string;
  intro: string;
  sections: { title?: string; note?: string; items: QuestionItem[] }[];
}

/** Questionários de cada ciclo de avaliação (escolhido na aba Config). */
export interface CycleInstruments {
  pre?: Questionnaire;
  post: Questionnaire;
}

export const LIKERT_PADRAO = ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'];
const ESCALA_NOTA = 'Escala: 1 = Discordo totalmente | 2 = Discordo | 3 = Neutro | 4 = Concordo | 5 = Concordo totalmente.';
const GENERO = ['Feminino', 'Masculino', 'Não binário', 'Prefiro não informar', 'Outro'];

// ------------------------------------------------------------
// TCLE
// ------------------------------------------------------------
export const tcle: TcleContent = {
  version: 'v1',
  title: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
  header: [
    'Universidade Federal de Lavras (UFLA) — Programa de Pós-Graduação em Ciência da Computação (PPGCC). Campus Universitário, Caixa Postal 3037 – CEP 37200-900 – Lavras – MG.',
    'Título da pesquisa: “Play na Consciência — Conscientização sobre a Violência Contra a Mulher”.',
    'Pesquisador responsável: Jefferson Wagner Francisco, discente do Programa de Pós-Graduação em Ciência da Computação (PPGCC) da Universidade Federal de Lavras (UFLA).',
    'Orientador: Prof. DSc. Heitor Augustus Xavier Costa, Departamento de Ciência da Computação (DCC/ICET) — UFLA.',
    'Instituição: Universidade Federal de Lavras (UFLA).',
    'Endereço profissional do pesquisador: Universidade Federal de Lavras, Departamento de Ciência da Computação, Campus Universitário, Caixa Postal 3037, CEP 37200-900, Lavras – MG.',
    'Telefone e e-mail do pesquisador: (11) 91704-9654 / jefferson.francisco@estudante.ufla.br',
    'Quem apresenta este Termo e obtém o consentimento: o próprio pesquisador responsável, Jefferson Wagner Francisco.',
  ],
  sections: [
    {
      title: '1. Convite para participar da pesquisa',
      paragraphs: ['Você está sendo convidado(a) a participar, de forma voluntária, da pesquisa “Play na Consciência — Conscientização sobre a Violência Contra a Mulher”, desenvolvida no âmbito do Programa de Pós-Graduação em Ciência da Computação (PPGCC) da Universidade Federal de Lavras (UFLA). Antes de decidir se deseja participar, leia este documento com atenção e esclareça todas as suas dúvidas com o pesquisador. Você foi convidado(a) diretamente pelo pesquisador, mas sua participação é totalmente voluntária: se decidir não participar ou desistir a qualquer momento, isso não terá qualquer consequência para você nem para a sua relação com o pesquisador.'],
    },
    {
      title: '2. Objetivo da pesquisa',
      paragraphs: ['Esta pesquisa tem como objetivo desenvolver e avaliar o jogo sério “Play na Consciência”, voltado à conscientização sobre a violência contra as mulheres e à reflexão crítica sobre o machismo estrutural. Você está sendo convidado(a) a jogar uma versão de teste (protótipo) desse jogo e a responder a questionários e/ou a uma breve entrevista sobre sua experiência, sua compreensão do conteúdo e sua opinião sobre o jogo.'],
    },
    {
      title: '3. Justificativa',
      paragraphs: ['A violência contra as mulheres é um grave problema de direitos humanos e de saúde pública. Estratégias educativas interativas, como os jogos sérios, têm se mostrado promissoras para sensibilizar e promover reflexão crítica sobre esse tema, de forma mais envolvente do que materiais informativos tradicionais. Sua participação ajudará a avaliar se o jogo cumpre esse papel e a identificar pontos a serem melhorados.'],
    },
    {
      title: '4. Como será sua participação',
      paragraphs: [
        'Caso aceite participar, você será convidado(a) a:',
        '– Participar de uma sessão individual, online (por videochamada) ou presencial, conforme sua escolha. A sessão presencial será em local reservado, combinado com você, que garanta sua privacidade e seu conforto. Não serão realizadas sessões em locais públicos com circulação de pessoas;',
        '– Jogar o protótipo do jogo “Play na Consciência” em um computador, com o acompanhamento do pesquisador;',
        '– Responder a questionários, antes e/ou depois do jogo, sobre seus conhecimentos, suas atitudes e sua experiência com o jogo;',
        '– Participar, caso seja convidado(a), de uma breve entrevista sobre sua compreensão do jogo e sua opinião sobre ele.',
        'A duração estimada da sessão é de aproximadamente 30 minutos. Sua participação ocorrerá em um único encontro, salvo se você for convidado(a) e concordar em participar de uma etapa adicional, o que será sempre comunicado e consentido separadamente. Esta pesquisa não tem grupo controle nem placebo, e não há método alternativo de participação, pois consiste apenas na avaliação do jogo.',
      ],
    },
    {
      title: '5. Conteúdo sensível do jogo — aviso importante',
      paragraphs: ['O jogo “Play na Consciência” retrata, de forma ficcional, narrativas de mulheres em situação de violência psicológica, moral, patrimonial, física e/ou sexual, com o objetivo de sensibilizar sobre o tema. As cenas foram elaboradas com cuidado, mas podem gerar desconforto emocional em algumas pessoas, especialmente para quem já vivenciou situações semelhantes. Antes de começar a jogar, essa informação também será apresentada em uma tela de aviso dentro do próprio jogo. Você pode decidir não participar, ou interromper sua participação a qualquer momento, sem necessidade de justificativa e sem qualquer prejuízo. Os questionários e a entrevista não perguntam sobre experiências pessoais de violência.'],
    },
    {
      title: '6. Riscos e desconfortos',
      paragraphs: [
        'Esta pesquisa apresenta risco mínimo, porém não nulo. Os principais desconfortos possíveis são: (i) desconforto emocional ao entrar em contato com as narrativas de violência retratadas no jogo, durante a sessão ou nas horas e dias seguintes; (ii) eventual constrangimento ao responder a perguntas sobre suas atitudes pessoais relacionadas à violência de gênero; (iii) risco de quebra de sigilo, por se tratar de pessoa conhecida do pesquisador e, em sessões online, pelas limitações de sigilo do ambiente virtual (ver item 8); e (iv) em sessões presenciais em residências, a sensação de insegurança por estar a sós com o pesquisador.',
        'Para reduzir esses riscos: as sessões são individuais; você escolhe entre sessão online e presencial; na sessão presencial, você poderá estar acompanhado(a) de uma pessoa de sua confiança, que ficará em outro ambiente; você não é obrigado(a) a responder a nenhuma pergunta com a qual não se sinta confortável e pode pausar ou interromper a sessão a qualquer momento. Se você sentir necessidade de conversar sobre algo relacionado ao tema durante ou após a participação, o pesquisador irá acolher o que for compartilhado e poderá indicar canais de apoio, como a Central de Atendimento à Mulher (Ligue 180, 24 horas), o Centro de Valorização da Vida (188, 24 horas), os serviços de emergência (190 e 192) e os serviços públicos de saúde mental e de atendimento à mulher da sua cidade. O pesquisador não realiza avaliação nem intervenção clínica, para a qual não possui formação. Ao final da sessão, você receberá por escrito a lista desses canais de apoio.',
      ],
    },
    {
      title: '7. Benefícios',
      paragraphs: ['Não há benefício financeiro ou de qualquer outra natureza garantido diretamente a você por participar desta pesquisa. Você poderá, ao final, refletir sobre o tema e conhecer informações sobre a rede de proteção à mulher. Como benefício indireto, espera-se que sua participação contribua para o desenvolvimento de um recurso educativo sobre a violência contra a mulher e para a ampliação do conhecimento científico sobre o uso de jogos sérios nesse tema, beneficiando, no futuro, outras pessoas.'],
    },
    {
      title: '8. Sigilo e privacidade',
      paragraphs: [
        'As informações fornecidas por você serão utilizadas exclusivamente para fins desta pesquisa. Seus dados serão identificados por um código numérico, e não pelo seu nome, sendo a lista de correspondência entre nome e código mantida em arquivo separado, protegido por senha, de acesso restrito ao pesquisador e ao orientador. O pesquisador não informará a terceiros quem participou ou recusou participar. As sessões online não serão gravadas em vídeo. Os resultados poderão ser publicados em trabalhos acadêmicos (dissertação, artigos, apresentações em eventos), sempre de forma agregada ou anonimizada, sem que você possa ser identificado(a). Os dados serão armazenados de forma segura pelo prazo mínimo de 5 (cinco) anos, conforme a Resolução CNS nº 466/2012, e descartados de forma segura após esse período.',
        'Atenção: em atividades realizadas em ambiente virtual (videochamada, e-mail, formulários on-line), não é possível garantir sigilo absoluto, pois há limitações na segurança da transmissão e do armazenamento de dados pela internet, e a sessão online pode ser ouvida ou vista por pessoas presentes no seu ambiente. Por isso, recomenda-se que você participe de um local em que possa jogar com privacidade. O pesquisador adotará os cuidados possíveis para proteger seus dados.',
      ],
    },
    {
      title: '9. Participação voluntária e direito de desistência',
      paragraphs: ['Sua participação é voluntária. Você tem o direito de se recusar a participar ou de desistir a qualquer momento, sem necessidade de apresentar justificativa e sem qualquer prejuízo ou penalidade. Caso deseje desistir, basta comunicar sua decisão ao pesquisador, e seus dados, se assim você desejar, serão excluídos da pesquisa.'],
    },
    {
      title: '10. Acompanhamento e assistência',
      paragraphs: ['Não está previsto acompanhamento após a sessão, pois a participação ocorre em um único encontro. Se você sentir qualquer desconforto depois dela, pode entrar em contato com o pesquisador pelos contatos informados acima, que irá acolhê-lo(a) e orientá-lo(a) sobre onde buscar apoio. Se houver dano comprovadamente decorrente da pesquisa, você terá direito à assistência necessária.'],
    },
    {
      title: '11. Ressarcimento e indenização',
      paragraphs: ['Não há despesas previstas para você em decorrência da participação nesta pesquisa, e não haverá pagamento pela participação. Caso ocorra algum gasto comprovadamente decorrente da sua participação (como deslocamento ou uso de internet), você terá direito ao ressarcimento integral pelo pesquisador. Você também tem direito a indenização diante de eventuais danos decorrentes da pesquisa, nos termos da legislação brasileira vigente.'],
    },
    {
      title: '12. Contato para dúvidas',
      paragraphs: [
        'Em caso de dúvidas sobre a pesquisa, você pode entrar em contato com o pesquisador responsável, Jefferson Wagner Francisco, pelo telefone (11) 91704-9654 ou pelo e-mail jefferson.francisco@estudante.ufla.br, ou com o orientador, Prof. DSc. Heitor Augustus Xavier Costa, pelo e-mail heitor@ufla.br.',
        'Em caso de dúvidas quanto aos seus direitos como voluntário de pesquisa, ou caso você se sinta prejudicado(a) de alguma forma, entre em contato com o Comitê de Ética em Pesquisa com Seres Humanos da Universidade Federal de Lavras (COEP/UFLA), pelo telefone (35) 3829-5182, no horário de atendimento das 7h30 às 12h30, ou pelo endereço: Pró-Reitoria de Pesquisa e Inovação (PRPI), Universidade Federal de Lavras, Campus Universitário, Lavras – MG, CEP 37200-900.',
      ],
    },
    {
      title: '13. Consentimento',
      paragraphs: [
        'Declaro que li e/ou ouvi as explicações contidas neste Termo de Consentimento Livre e Esclarecido antes de concordar em participar da pesquisa acima descrita. Discuti com o pesquisador sobre a minha decisão em participar dessa pesquisa, ficando claro para mim quais são os propósitos do estudo, os procedimentos a serem realizados, seus desconfortos e riscos, as garantias de confidencialidade e de esclarecimentos permanentes. Ficou claro também que minha participação é isenta de despesas e que tenho garantia de acesso a assistência adequada e a indenização, caso ocorram eventuais danos decorrentes da pesquisa. Concordo voluntariamente em participar desta pesquisa e sei que poderei retirar o meu consentimento a qualquer momento, antes ou durante a mesma, sem penalidades, prejuízo ou perda de qualquer benefício que eu possa ter adquirido.',
        'Este Termo é redigido em duas vias (impressas ou digitais), sendo uma delas entregue a mim e a outra mantida com o pesquisador.',
      ],
    },
  ],
  declarations: [
    'Li este Termo e concordo voluntariamente em participar desta pesquisa, nos termos do item 13.',
  ],
  audioQuestion: 'Em caso de entrevista, autorizo a gravação em áudio, que será usada apenas para transcrição e descartada em seguida.',
};

// ------------------------------------------------------------
// ITENS COMUNS AO PRÉ E AO PÓS-JOGO (Ciclo 2)
// Os ids são iguais nos dois questionários, para parear as respostas.
// ------------------------------------------------------------
const BLOOM: QuestionItem[] = [
  {
    id: 'bloom_1', type: 'escolha', required: true, dimension: 'Bloom: Compreensão',
    text: 'Em uma situação em que um(a) parceiro(a) passa a controlar constantemente com quem a outra pessoa conversa, monitora suas mensagens e restringe suas saídas, esse comportamento é melhor classificado como:',
    options: ['Ciúme normal em relacionamentos saudáveis', 'Violência psicológica', 'Violência apenas física, pois não há agressão corporal', 'Uma fase passageira do relacionamento'],
    correct: 'Violência psicológica',
  },
  {
    id: 'bloom_2', type: 'escolha', required: true, dimension: 'Bloom: Compreensão',
    text: 'Qual das alternativas descreve corretamente a diferença entre violência física e violência psicológica?',
    options: ['Só a física deixa marcas e por isso é a única que pode ser comprovada', 'A psicológica não é considerada violência pela lei brasileira', 'A física atinge o corpo; a psicológica atinge a integridade emocional, autoestima e autonomia da vítima', 'Não existe diferença: toda violência é física por natureza'],
    correct: 'A física atinge o corpo; a psicológica atinge a integridade emocional, autoestima e autonomia da vítima',
  },
  {
    id: 'bloom_3', type: 'escolha', required: true, dimension: 'Bloom: Compreensão',
    text: 'O que caracteriza a chamada \'violência patrimonial\' contra a mulher?',
    options: ['Impedir ou dificultar o acesso da mulher a bens, valores, documentos ou recursos econômicos próprios', 'Discutir sobre gastos do casal', 'Dividir contas de forma desigual mas combinada entre o casal', 'Recusar-se a emprestar dinheiro a terceiros'],
    correct: 'Impedir ou dificultar o acesso da mulher a bens, valores, documentos ou recursos econômicos próprios',
  },
  {
    id: 'bloom_4', type: 'escolha', required: true, dimension: 'Bloom: Aplicação',
    text: 'Uma amiga conta que o parceiro a xinga na frente de outras pessoas e depois se desculpa, prometendo que \'nunca mais vai acontecer\'. Qual seria a atitude de apoio mais adequada nesse momento?',
    options: ['Dizer que ela está exagerando, já que ele se desculpou', 'Escutar sem julgar, validar o que ela sente e apresentar, com cuidado, informações sobre onde buscar apoio', 'Aconselhá-la a terminar o relacionamento imediatamente, sem mais conversa', 'Ignorar o assunto para não se meter na vida alheia'],
    correct: 'Escutar sem julgar, validar o que ela sente e apresentar, com cuidado, informações sobre onde buscar apoio',
  },
  {
    id: 'bloom_5', type: 'escolha', required: true, dimension: 'Bloom: Aplicação',
    text: 'Você é responsável por encaminhar um caso relatado de violência doméstica em um ambiente universitário. Qual seria o encaminhamento inicial mais adequado?',
    options: ['Resolver o caso sozinho(a), sem envolver outros setores', 'Orientar a pessoa e acionar/indicar o serviço de apoio institucional competente (ex.: núcleo de apoio ao estudante, ouvidoria, rede de proteção)', 'Publicar o caso em redes sociais para gerar pressão pública', 'Aguardar que a própria vítima resolva sozinha, sem qualquer orientação'],
    correct: 'Orientar a pessoa e acionar/indicar o serviço de apoio institucional competente (ex.: núcleo de apoio ao estudante, ouvidoria, rede de proteção)',
  },
  {
    id: 'bloom_6', type: 'escolha', required: true, dimension: 'Bloom: Aplicação',
    text: 'Em uma situação de risco iminente (agressão em andamento), qual é a ação mais adequada e imediata?',
    options: ['Tentar mediar a discussão pessoalmente antes de qualquer outra coisa', 'Acionar o serviço de emergência/segurança (ex.: 190) e buscar apoio imediato', 'Aguardar a situação se resolver sozinha', 'Registrar a situação em vídeo antes de agir'],
    correct: 'Acionar o serviço de emergência/segurança (ex.: 190) e buscar apoio imediato',
  },
  {
    id: 'bloom_7', type: 'escolha', required: true, dimension: 'Bloom: Análise',
    text: 'Em um relacionamento, o padrão descrito é: ciúme excessivo → isolamento da vítima em relação a amigos e família → controle financeiro → ameaças. Esse padrão representa, principalmente, um exemplo de:',
    options: ['Fatos isolados e sem relação entre si', 'Escalada progressiva da violência', 'Comportamento normal de qualquer relacionamento', 'Melhora gradual da relação'],
    correct: 'Escalada progressiva da violência',
  },
  {
    id: 'bloom_8', type: 'escolha', required: true, dimension: 'Bloom: Análise',
    text: 'Durante um atendimento a uma suposta vítima, o profissional minimiza o relato, questiona a roupa que ela usava e sugere que ela \'deve ter provocado\'. O que essa conduta evidencia?',
    options: ['Um atendimento adequado e imparcial', 'Uma inconsistência grave no atendimento, caracterizando revitimização', 'Uma forma aceitável de checar os fatos', 'Um procedimento padrão de qualquer protocolo de acolhimento'],
    correct: 'Uma inconsistência grave no atendimento, caracterizando revitimização',
  },
  {
    id: 'bloom_9', type: 'escolha', required: true, dimension: 'Bloom: Análise',
    text: 'Comparando dois relatos — um em que a vítima recebe apoio de uma amiga que a escuta sem julgamento (Carla) e outro em que a amiga minimiza e culpabiliza a vítima (Lúcia) — qual elemento diferencia uma rede de apoio eficaz de uma ineficaz?',
    options: ['A eficácia depende apenas da proximidade afetiva com a vítima, não da postura adotada', 'Uma rede eficaz escuta, valida os sentimentos e orienta sem julgar; uma ineficaz culpabiliza, minimiza ou ignora o relato', 'Redes de apoio eficazes sempre tomam a decisão pela vítima', 'Não há diferença relevante entre as duas posturas'],
    correct: 'Uma rede eficaz escuta, valida os sentimentos e orienta sem julgar; uma ineficaz culpabiliza, minimiza ou ignora o relato',
  },
];

const ATITUDE: QuestionItem[] = [
  'Eu me sinto capaz de reconhecer sinais de violência contra a mulher em uma situação real.',
  'Eu me sinto capaz de oferecer apoio adequado a uma pessoa que sofre violência.',
  'Eu sei para onde encaminhar um caso de violência contra a mulher.',
  'Eu me sinto pessoalmente responsável por agir quando presencio sinais de violência de gênero.',
  'Eu estou disposto(a) a intervir (de forma segura) ao presenciar uma situação de violência contra a mulher.',
].map((text, i) => ({ id: `atitude_${i + 1}`, type: 'likert', text, required: true, dimension: 'Atitude e autoeficácia' }));

function likerts(prefix: string, dimension: string, texts: string[]): QuestionItem[] {
  return texts.map((text, i) => ({ id: `${prefix}_${i + 1}`, type: 'likert', text, required: true, dimension }));
}

// ------------------------------------------------------------
// CICLO 1 — Questionário Reduzido Pós-Sessão (sem pré-teste)
// ------------------------------------------------------------
export const ciclo1PosSessao: Questionnaire = {
  id: 'pos_c1',
  title: 'Questionário Reduzido Pós-Sessão',
  intro: 'Aplicação única, logo após a sessão de jogo. Seu código de participação é registrado automaticamente.',
  sections: [
    {
      title: 'A. Identificação',
      items: [
        { id: 'idade', type: 'numero', text: 'Idade', required: true, min: 14, max: 99 },
        { id: 'genero', type: 'escolha', text: 'Gênero', options: GENERO, required: true },
        { id: 'curso', type: 'curto', text: 'Curso / área de formação' },
      ],
    },
    {
      title: 'B. MEEGA+ reduzido',
      note: ESCALA_NOTA,
      items: likerts('meega_red', 'MEEGA+', [
        'As regras do jogo foram fáceis de entender.',
        'A interface do jogo (telas, botões, ícones) era clara.',
        'Eu me diverti jogando os modos apresentados.',
        'O jogo me ajudou a compreender melhor o tema da violência contra a mulher.',
      ]),
    },
    {
      title: 'C. Itens reduzidos — Bloom (compreensão do conteúdo)',
      note: 'Responda com suas palavras, de forma breve.',
      items: [
        { id: 'bloom_red_1', type: 'texto', required: true, dimension: 'Bloom', text: 'Cite um ou mais tipos de violência que você identificou na história entre Júlia e Leo.' },
        { id: 'bloom_red_2', type: 'texto', required: true, dimension: 'Bloom', text: 'Descreva um sinal, no jogo, que indicava que a situação de Júlia estava piorando (escalada da violência).' },
      ],
    },
    {
      title: 'D. Itens reduzidos — Bartle (atitude e autoeficácia)',
      items: [
        { id: 'bartle_red_1', type: 'texto', required: true, dimension: 'Bartle', text: 'Depois de jogar, você sente que mudou ou reforçou alguma opinião sobre como agir diante de uma situação de violência contra a mulher? Se sim, qual?' },
        { id: 'bartle_red_2', type: 'texto', required: true, dimension: 'Bartle', text: 'Você se sentiria mais confiante em ajudar alguém nessa situação depois de jogar? Por quê?' },
      ],
    },
    {
      title: 'E. Comentário livre',
      items: [{ id: 'comentario', type: 'texto', text: 'Deseja acrescentar algum comentário sobre a experiência?' }],
    },
  ],
};

// ------------------------------------------------------------
// CICLO 2 — Instrumento de Avaliação Pré-Jogo
// ------------------------------------------------------------
export const ciclo2PreJogo: Questionnaire = {
  id: 'pre',
  title: 'Instrumento de Avaliação — Pré-Jogo',
  intro: 'Pesquisa de mestrado (PPGCC/UFLA) — a responder ANTES da sessão de jogo. Você não será identificado(a) pelo nome: suas respostas ficam ligadas apenas ao código de participação gerado pelo jogo, que também será usado no questionário pós-jogo.',
  sections: [
    {
      title: 'A. Contexto de aplicação',
      items: [{ id: 'turma', type: 'curto', text: 'Turma / contexto de aplicação (ex.: disciplina, turno)' }],
    },
    {
      title: 'B. Perfil do participante',
      items: [
        { id: 'idade', type: 'numero', text: 'Idade', required: true, min: 14, max: 99 },
        { id: 'genero', type: 'escolha', text: 'Gênero', options: GENERO, required: true },
        { id: 'curso', type: 'curto', text: 'Curso / área de formação', required: true },
        {
          id: 'frequencia_jogos', type: 'escolha', required: true,
          text: 'Com que frequência você costuma jogar jogos digitais (videogame, celular, computador)?',
          options: ['Nunca', 'Raramente (algumas vezes por ano)', 'Ocasionalmente (algumas vezes por mês)', 'Frequentemente (algumas vezes por semana)', 'Diariamente'],
        },
        {
          id: 'formacao_tema', type: 'escolha', required: true,
          text: 'Você já participou de alguma disciplina, palestra, campanha ou formação sobre violência contra a mulher?',
          options: ['Sim', 'Não', 'Não tenho certeza'],
        },
        {
          id: 'contato_tema', type: 'escolha',
          text: 'Em caso afirmativo, com que frequência tem contato com esse tema?',
          options: ['Nunca', 'Raramente', 'Ocasionalmente', 'Frequentemente'],
        },
      ],
    },
    {
      title: 'C. Teste cognitivo pré-jogo (Taxonomia de Bloom)',
      note: 'As questões a seguir avaliam seu conhecimento atual sobre o tema antes de jogar. Não há prejuízo em errar. Marque apenas uma alternativa por questão.',
      items: BLOOM,
    },
    {
      title: 'D. Linha de base atitudinal e de autoeficácia',
      note: ESCALA_NOTA,
      items: ATITUDE,
    },
  ],
};

// ------------------------------------------------------------
// CICLO 2 — Instrumento de Avaliação Pós-Jogo
// ------------------------------------------------------------
export const ciclo2PosJogo: Questionnaire = {
  id: 'pos',
  title: 'Instrumento de Avaliação — Pós-Jogo',
  intro: 'Pesquisa de mestrado (PPGCC/UFLA) — a responder IMEDIATAMENTE após a sessão de jogo. Suas respostas ficam ligadas ao mesmo código de participação do questionário pré-jogo.',
  sections: [
    {
      title: 'B. Teste cognitivo pós-jogo (Taxonomia de Bloom)',
      note: 'As questões são as mesmas do questionário pré-jogo, para permitir a comparação de ganho cognitivo (pré x pós).',
      items: BLOOM,
    },
    { title: 'C. Atitude e autoeficácia', note: ESCALA_NOTA, items: ATITUDE },
    {
      title: 'D. Experiência de jogo (MEEGA+) — Usabilidade',
      note: ESCALA_NOTA,
      items: likerts('meega_usab', 'MEEGA+: Usabilidade', [
        'As regras do jogo foram fáceis de entender.',
        'A interface do jogo (telas, botões, ícones) era clara e intuitiva.',
        'Consegui navegar pelo jogo sem dificuldades técnicas.',
        'As instruções fornecidas durante o jogo foram suficientes para que eu soubesse o que fazer.',
      ]),
    },
    {
      title: 'D. Experiência de jogo (MEEGA+) — Experiência do jogador',
      items: likerts('meega_exp', 'MEEGA+: Experiência do jogador', [
        'Eu me diverti jogando "Play na Consciência".',
        'O nível de desafio proposto pelo jogo foi adequado (nem muito fácil, nem muito difícil).',
        'Em algum momento, fiquei tão envolvido(a) no jogo que perdi a noção do tempo.',
        'Eu me senti emocionalmente envolvido(a) com a história e os personagens.',
        'Eu gostaria de continuar jogando os próximos modos do jogo.',
      ]),
    },
    {
      title: 'D. Experiência de jogo (MEEGA+) — Relevância educacional',
      items: likerts('meega_rel', 'MEEGA+: Relevância educacional', [
        'O jogo me ajudou a compreender melhor o tema da violência contra a mulher.',
        'As situações apresentadas no jogo se pareciam com situações que podem ocorrer na vida real.',
        'Eu recomendaria este jogo para ser usado em atividades educativas sobre o tema.',
      ]),
    },
    {
      title: 'E. Aceitação tecnológica (TAM) — Utilidade percebida',
      note: ESCALA_NOTA,
      items: likerts('tam_util', 'TAM: Utilidade percebida', [
        'Usar este jogo pode melhorar minha capacidade de reconhecer situações de violência contra a mulher.',
        'Este jogo é útil para aprender sobre como agir diante de casos de violência contra a mulher.',
        'Considero que jogar "Play na Consciência" tem valor educativo.',
      ]),
    },
    {
      title: 'E. Aceitação tecnológica (TAM) — Facilidade de uso percebida',
      items: likerts('tam_facil', 'TAM: Facilidade de uso percebida', [
        'Foi fácil aprender a jogar "Play na Consciência".',
        'Minha interação com o jogo foi clara e compreensível.',
        'Não precisei de muito esforço mental para jogar.',
      ]),
    },
    {
      title: 'E. Aceitação tecnológica (TAM) — Intenção de uso',
      items: likerts('tam_uso', 'TAM: Intenção de uso', [
        'Eu jogaria novamente "Play na Consciência".',
        'Eu recomendaria este jogo a outras pessoas.',
        'Eu utilizaria este jogo (ou algo semelhante) em atividades futuras (ex.: aulas, formações, campanhas).',
      ]),
    },
    {
      title: 'F. Perguntas abertas (qualitativas)',
      items: [
        { id: 'aberta_1', type: 'texto', required: true, text: 'O que você mais gostou no jogo? Por quê?' },
        { id: 'aberta_2', type: 'texto', required: true, text: 'O que você mudaria ou melhoraria no jogo?' },
        { id: 'aberta_3', type: 'texto', required: true, text: 'Alguma situação do jogo fez você refletir sobre algo que não havia pensado antes? Qual?' },
      ],
    },
  ],
};

export const INSTRUMENTS: Record<number, CycleInstruments> = {
  1: { post: ciclo1PosSessao },
  2: { pre: ciclo2PreJogo, post: ciclo2PosJogo },
};

export function instrumentsFor(cycle: number): CycleInstruments {
  return INSTRUMENTS[cycle] ?? INSTRUMENTS[1];
}

/** Acertos nos itens com alternativa correta (ex.: teste de Bloom). */
export function score(q: Questionnaire, answers: Record<string, string>): { correct: number; total: number } {
  const items = q.sections.flatMap(s => s.items).filter(i => i.type === 'escolha' && i.correct);
  const correct = items.filter(i => i.type === 'escolha' && answers[i.id] === i.correct).length;
  return { correct, total: items.length };
}
