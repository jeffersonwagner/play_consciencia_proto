# Ciclos de avaliação — roteiro de aplicação

> Ciclos de DBR (cap. 4 da qualificação), conforme os instrumentos de coleta (UFLA/PPGCC):
>
> | Ciclo | Participantes | Modos | Sequência |
> |---|---|---|---|
> | **1** | 10 | 1 e 2 (Júlia) | jogo → questionário reduzido pós-sessão → entrevista semiestruturada |
> | **2** | 20 | definidos na planilha | questionário pré-jogo → jogo → questionário pós-jogo |
>
> O ciclo é escolhido na aba **Config** da planilha (`ciclo = 1` ou `2`), e o jogo aplica os
> questionários correspondentes. Durante a avaliação, o menu mostra só os modos da chave `modos`.
> Para testar o jogo completo, use `?avaliacao=0` ou a build oficial. A configuração técnica
> está em [COLETA.md](COLETA.md).
>
> O Ciclo 2 já tem os questionários dos anexos no jogo, mas será revisto depois dos resultados
> do Ciclo 1.

---

## 1. Antes da coleta

### 1.1 Requisitos éticos e de conteúdo
- [ ] Parecer do COEP/UFLA aprovado. Confirmar com o comitê que o **aceite do TCLE dentro do
      jogo** (sem nome, RG/CPF nem assinatura; com data, hora, versão e cópia para baixar)
      substitui as duas vias assinadas, ou colher a assinatura em papel em paralelo (ver
      seção 4).
- [ ] Confirmar com o comitê que os questionários podem ser respondidos **dentro do jogo**, e
      não no Google Forms previsto nos anexos. O conteúdo é o mesmo; só muda o meio.
- [ ] Revisão dos textos dos Modos 1 e 2 e das citações de lei, de preferência com
      especialista em violência de gênero.
- [ ] Decisões provisórias confirmadas: G1 e G4 ([MODO2.md](MODO2.md)); G2 (nome repetido
      "Patrícia") resolvido.

### 1.2 Planilha e build
- [ ] Planilha criada e Apps Script implantado ([COLETA.md](COLETA.md), seções 1 e 2).
- [ ] Aba Config: `ativa = SIM`, `ciclo = 1`, `modos = 1,2`, `inicio`, `fim`.
- [ ] Build de coleta gerada (`npm run build:pesquisa`) e publicada (sessões online) ou
      copiada para o computador (sessões presenciais).
- [ ] Antes da coleta real: fazer uma participação completa de teste, conferir que chegou à
      planilha e apagar essas linhas de teste.

### 1.3 Teste interno (2 a 3 pessoas)
- [ ] Participação completa por caminhos diferentes: Carla e Lúcia; finais positivo, neutro e
      negativo.
- [ ] **Cronometrar.** O TCLE informa cerca de **30 minutos** de sessão. Se os Modos 1 e 2,
      somados ao questionário e à entrevista, passarem muito disso, ajuste o roteiro ou o
      texto do TCLE com o comitê.
- [ ] Testar sem internet: desligar o Wi-Fi no meio do jogo e religar; os dados devem
      chegar à planilha.
- [ ] Testar a saída rápida (botão e Esc) e recarregar a página no meio de um modo (o
      progresso deve continuar).

### 1.4 Cuidados com o computador (sessões presenciais)
- **Não use janela anônima:** se ela for fechada antes do envio, os dados se perdem.
- Antes de desligar, confira no painel (**Ctrl + Alt + P**) se não há lotes pendentes.
- Use fones de ouvido (o Modo 1 tem música).

---

## 2. Roteiro da sessão — Ciclo 1

| Etapa | Onde | Observações |
|---|---|---|
| Acolhimento | Fora do jogo | Apresentar a pesquisa, o conteúdo sensível, o direito de interromper, a saída rápida e o Ligue 180. |
| TCLE | No jogo | Texto integral, declaração de consentimento e autorização de gravação em áudio da entrevista (Sim/Não). Cópia para baixar. |
| Código de participação | No jogo | Gerado pelo jogo (ex.: `PNC-7G6G`). **Anote-o na sua lista de correspondência nome ↔ código** (TCLE, item 8) e no registro da entrevista. |
| Modos 1 e 2 | No jogo | O progresso aparece no rodapé do menu. Não explique as mecânicas além das telas do jogo: a compreensão das regras é um dos objetos de avaliação. |
| Questionário Reduzido Pós-Sessão | No jogo | Liberado ao concluir os modos. Identificação, MEEGA+ reduzido, itens de Bloom e de Bartle, comentário livre. |
| Canais de apoio | No jogo | A tela final lista 180, 188, 190, 192 e serviços da cidade, com opção de baixar (TCLE, item 6: "você receberá por escrito"). |
| Entrevista semiestruturada | Fora do jogo | Registro de Entrevista (instrumento 1 dos anexos), preenchido pelo pesquisador. Grave em áudio só se a autorização no TCLE for "Sim" (coluna `tcle_audio` na aba Participantes). |
| Encerramento | Fora do jogo | Conversa de acolhimento. Em sessão presencial, o botão "Encerrar" prepara o computador para a próxima pessoa. |

### Durante o jogo
- Anote dúvidas, hesitações, reações emocionais e pedidos de ajuda, com o código de
  participação. Eles alimentam o Bloco A e as notas do Registro de Entrevista.
- Se houver desconforto, pause e ofereça encerrar. A interrupção não precisa ser justificada.

## 3. Roteiro da sessão — Ciclo 2

Igual ao Ciclo 1, com duas diferenças: o **Instrumento de Avaliação — Pré-Jogo** é aplicado
logo depois do TCLE (perfil, teste de Bloom com 9 questões e linha de base de atitude) e, no
fim, o **Instrumento de Avaliação — Pós-Jogo** (mesmo teste de Bloom e de atitude, MEEGA+,
TAM e perguntas abertas). Não há entrevista prevista nos anexos para este ciclo.

---

## 4. Diferenças em relação aos documentos (TCLE e anexos)

O conteúdo das perguntas e do TCLE foi transcrito sem alterações. O que mudou foi a forma:

| Documento | No jogo | Por quê |
|---|---|---|
| "Código do participante" perguntado em cada questionário; no pré-jogo, criado pelo participante (ex.: `SI87`) | O jogo gera o código e o grava em todas as respostas | Evita erro de digitação ao parear pré e pós. |
| TCLE: "código **numérico**" | Código alfanumérico (`PNC-` + 4 caracteres) | Pode ser ajustado no TCLE ou no jogo; avise se preferir só números. |
| "Modo(s) jogado(s) nesta sessão" | Registrado automaticamente (`m1_concluido`, `m2_final`…) | O jogo já sabe. |
| TCLE com nome, RG/CPF, telefone e assinatura em duas vias | Aceite registrado com data, hora e versão; cópia para baixar | O jogo não coleta dados pessoais. Se o comitê exigir assinatura, colha-a em papel e anote o código. |
| Questionários no Google Forms | Questionários dentro do jogo, gravados na planilha | Pedido do pesquisador. |
| "Turma / contexto" (pré-jogo) | Mantido como pergunta; o link `?grupo=` também grava a turma | — |

## 5. Dados

Os dados chegam **automaticamente** à planilha. Não há exportação manual.

### Aba Participantes (uma linha por participante)

| Coluna | Descrição |
|---|---|
| `participante`, `grupo`, `sessao`, `versao`, `inicio`, `ciclo` | Código, turma (do link), id da sessão, versão do jogo, início, ciclo |
| `tcle_aceito_em`, `tcle_versao`, `tcle_audio` | Aceite do TCLE e autorização de gravação da entrevista (Sim/Não) |
| `pre_concluido_em`, `pos_concluido_em`, `finalizado_em` | Etapas da participação |
| `pre_acertos`, `pos_acertos` | Acertos no teste de Bloom (Ciclo 2), ex.: `7/9` |
| `modos_exigidos`, `protagonista` | Configuração da coleta no momento da participação |
| `m1_*`, `m2_*`, `m3_*`, `m4_*` | Indicadores de cada modo (escolhas, finais, confiança, etiquetas…) |
| `m1_minutos` … `m4_minutos` | Duração aproximada de cada modo |

### Aba Respostas
Uma linha por pergunta respondida: `participante`, `questionario` (`pos_c1`, `pre`, `pos`),
`item`, `dimensao` (Bloom, MEEGA+, TAM…), `pergunta`, `resposta` (escala por extenso, ex.:
"Concordo"), `acertou` (SIM/NÃO nos itens de Bloom do Ciclo 2), `respondido_em`.

Os itens de Bloom e de atitude têm o **mesmo código** no pré e no pós-jogo (`bloom_1` a
`bloom_9`, `atitude_1` a `atitude_5`). Para comparar, filtre por `item` e cruze por
`participante`.

### Aba Eventos
Uma linha por evento do jogo (`fragmentos.*`, `ponte.*`, `sessao.*`, `questionario.*`…), com o
tempo de decisão (`decisionMs`) e as variações de confiança.

### Gabarito do teste de Bloom (Ciclo 2)
O documento não traz o gabarito. Usei as alternativas corretas evidentes, que **devem ser
confirmadas**: 1 Violência psicológica · 2 "A física atinge o corpo…" · 3 "Impedir ou dificultar
o acesso…" · 4 "Escutar sem julgar…" · 5 "Orientar a pessoa e acionar…" · 6 "Acionar o serviço
de emergência…" · 7 Escalada progressiva · 8 "…revitimização" · 9 "Uma rede eficaz escuta…".
Ficam em `content/research/index.ts` (campo `correct`).
