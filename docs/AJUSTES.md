# Ajustes anotados nos testes

Lista de ajustes encontrados ao testar o jogo, ainda não desenvolvidos. Quando um item for
feito, marque-o e indique o commit.

## Pendentes

- [ ] **Fim do Modo 1 → Modo 2 direto.** Na tela de resumo do Modo 1, incluir um botão que leve
      ao Modo 2 sem voltar ao menu. A aliada escolhida na Cena 5 (Carla ou Lúcia) já define com
      quem o Modo 2 começa. *(teste do jogo completo, 02/11/2026)*
- [ ] **Modo 2: responder dentro da conversa.** Hoje, para responder a Júlia, é preciso sair da
      tela da conversa e ir para outra tela. Mostrar as opções de resposta ali mesmo, embaixo
      das mensagens, como em um aplicativo de mensagens. *(teste do jogo completo, 02/11/2026)*
- [ ] **Modo 2: tela inicial do celular mais realista.** Acabar com o app "A Ponte" como
      intermediário:
      - as 4 ações da semana (Mandar mensagem 1 PA, Fazer ligação 2 PA, Convidar para um café
        3 PA, Pesquisar na internet 1 PA) viram ícones fixos no **rodapé do celular**, como a
        barra de apps de um telefone real;
      - os outros apps (Mensagens, Calendário, Contatos, Cartas) continuam como ícones na tela
        inicial;
      - o título do modo ("A Ponte") e a fase da semana saem de dentro do celular e vão para
        **fora do aparelho**, por exemplo acima dele;
      - ajustar a dica "Abra 'A Ponte' para agir nesta semana" para apontar o rodapé;
      - também saem do celular e ficam **ao redor do aparelho**: a foto da Júlia com o medidor
        de confiança, o título e a frase da semana (ex.: "Semana 3 — A vigilância"), o botão
        "Encerrar semana" e o atalho de Cartas. O celular fica só com o que um telefone real
        teria (apps, conversas, ligações).
      *(teste do jogo completo, 02/11/2026)*
- [ ] **Modo 2: ligação diferente da mensagem (sem voz).** Hoje a ligação é um chat que custa
      2 PA. Manter as ligações, mas com mecânica própria:
      - **tela de chamada:** foto e nome da Júlia, cronômetro e botão vermelho de desligar, sem
        balões de chat;
      - **falas em legenda**, uma por vez, com pausas e indicações sonoras (*voz embargada*,
        *silêncio longo*, *barulho ao fundo*), que dão pistas que a mensagem escrita não dá;
      - **resposta com tempo:** as opções aparecem com tempo curto, e o silêncio também conta
        como resposta (a mensagem é o canal pensado; a ligação, o imediato);
      - **custo de 2 PA justificado:** mais efeito na confiança ou informações que só aparecem na
        voz.
      Voz gravada ou sintética fica para depois; as legendas continuam servindo de
      acessibilidade se houver áudio. *(teste do jogo completo, 02/11/2026)*
- [ ] **Modo 3: documentos do dossiê com visual próprio.** Hoje são só título e texto. Cada um
      deve parecer o que é:
      - **Foto anexada** (notebook quebrado): ilustração no estilo das artes do Modo 1, com cara
        de foto impressa presa ao dossiê. **Única arte nova**, a cargo do pesquisador. Enquanto
        não existir, mostrar um quadro em formato de foto com a descrição; a descrição continua
        como legenda e texto alternativo;
      - **Print de mensagens:** montado em HTML com o visual de conversa do celular do Modo 2
        (balões, nome do Leo, horário);
      - **Ficha do NAE:** formulário com cabeçalho institucional, campos e carimbo, mantendo o
        texto que muda conforme a aliada (Carla ou Lúcia);
      - **Mensagem recente de Leo:** notificação de celular, como na tela de bloqueio.
      Só a foto vira imagem; o resto continua texto editável (facilita revisar depois do Ciclo 1 e
      é lido por leitores de tela). No código: tipo de documento e campo de imagem opcional em
      `DossieDocument`. *(teste do jogo completo, 02/11/2026)*
- [ ] **Modo 4 no menu principal, como extra.** O Espelho não faz parte da história de nenhuma
      protagonista, mas hoje aparece dentro do menu da Júlia, junto dos Modos 1 a 3. Tirar o
      Modo 4 da tela de modos da protagonista e colocá-lo na tela inicial ("Escolha uma
      história"), separado dos cards das personagens, como um extra do jogo. Pontos a decidir
      ao desenvolver:
      - **liberação:** hoje exige concluir o Modo 3 de alguma protagonista; manter essa trava ou
        deixar o extra livre desde o início;
      - **modo avaliação:** o filtro de modos do ciclo (Ciclo 1 = Modos 1 e 2) precisa continuar
        escondendo o Modo 4 também na tela inicial.
      *(teste do jogo completo, 02/11/2026)*
