# Coleta de dados — planilha Google e build de pesquisa

O jogo tem duas versões:

| Versão | Comando | Para quê |
|---|---|---|
| **Oficial** | `npm run build` → `dist/` | Lançamento e uso livre. **Não contém nenhum código de pesquisa**: sem TCLE, sem questionários, sem envio de dados. |
| **Coleta** | `npm run build:pesquisa` → `dist-pesquisa/` | Avaliações do mestrado. TCLE e questionários dentro do jogo, com envio automático para uma planilha Google. |

Na versão de coleta, **quem controla tudo é a planilha**: ligar e desligar a coleta, as datas de
início e fim, o ciclo e os modos. Não é preciso gerar uma nova build para mudar nada disso.

### Jogo completo × modo avaliação

| Quero… | Como |
|---|---|
| **Testar o jogo completo** (4 modos, sem avaliação) | Build oficial (`npm run build`, ou `npm run dev` no computador). Ou, na build de coleta, o endereço com **`?avaliacao=0`** (ex.: `…/index.html?avaliacao=0`); o painel do pesquisador (Ctrl + Alt + P) tem um atalho. |
| **Aplicar a avaliação** | Build de coleta com `ativa = SIM`. O menu mostra **só os modos do ciclo** (Ciclo 1: Modos 1 e 2), inclusive para quem joga sem participar ou já concluiu. |
| **Desligar a avaliação para todos** | `ativa = NÃO` na planilha: a build de coleta passa a abrir o jogo completo, sem pesquisa. |

Com `?avaliacao=0`, nada é enviado para a planilha, e o progresso fica guardado **separado** do
das participações. Assim, testar no mesmo computador do laboratório não mexe no jogo de nenhum
participante. Nesse endereço, `?avaliacao=0&dev` também libera os controles de teste (pular
cenas, abrir qualquer modo).

---

## 1. Preparar a planilha (uma vez)

1. Crie uma planilha no Google Planilhas, de preferência na conta institucional. Exemplo de
   nome: `Play na Consciência — Coleta`.
2. Menu **Extensões → Apps Script**. Apague o conteúdo do editor e cole o arquivo
   [`tools/apps-script/Code.gs`](../tools/apps-script/Code.gs). Salve.
3. No editor, escolha a função **`configurar`** e clique em **Executar**. Autorize o acesso
   quando o Google pedir. Isso cria as abas:

   | Aba | Conteúdo |
   |---|---|
   | **Config** | Ligar/desligar, período, modos exigidos, token |
   | **Participantes** | Uma linha por participante: aceite do TCLE, progresso e indicadores de cada modo (colunas no dicionário em [CICLO1.md](CICLO1.md)) |
   | **Respostas** | Uma linha por resposta dos questionários (participante, questionário, item, pergunta, resposta) |
   | **Eventos** | Uma linha por decisão no jogo (trajetória, tempos de decisão) |
   | **Lotes** | Controle interno de envios; evita linhas duplicadas |

4. **Implantar → Nova implantação → Tipo: App da Web**
   - Executar como: **Eu**.
   - Quem pode acessar: **Qualquer pessoa**. O jogo envia os dados sem login; o token impede
     envios de terceiros.
   - Copie o endereço que termina em **`/exec`**.

## 2. Configurar a build de coleta (uma vez)

Copie `.env.pesquisa` para **`.env.pesquisa.local`**, que não vai para o git, e preencha:

```
VITE_RESEARCH=1
VITE_COLLECT_URL=https://script.google.com/macros/s/.../exec
VITE_COLLECT_TOKEN=(o token da aba Config)
```

Depois gere a build:

```bash
npm run build:pesquisa
```

Publique a pasta `dist-pesquisa/` (GitHub Pages, servidor da universidade) para as sessões
online, ou copie-a para os computadores do laboratório. Nos dois casos, o computador precisa
de internet para enviar os dados (ver seção 5).

**Link por turma:** acrescente `?grupo=` ao endereço, por exemplo
`.../index.html?grupo=Turma-A`. O grupo é gravado com cada participante.

## 3. Abrir, acompanhar e encerrar a coleta

Na aba **Config**:

| chave | valor |
|---|---|
| `ativa` | `SIM` para coletar; `NÃO` para desligar |
| `inicio` | Primeiro dia (data) |
| `fim` | Último dia (data). **Depois dele, nenhuma nova participação é aceita.** |
| `ciclo` | `1`: questionário reduzido pós-sessão, sem pré-teste. `2`: questionários pré-jogo e pós-jogo completos. Ver [CICLO1.md](CICLO1.md) |
| `modos` | Modos que o participante conclui antes do questionário final (Ciclo 1: `1,2`) |
| `protagonista` | `julia` |
| `tolerancia_dias` | Dias após o fim em que ainda se aceitam dados de sessões **iniciadas dentro do período**, mas enviadas com atraso por falta de internet (padrão: 7) |
| `mensagem` | Texto opcional para quem abre o jogo fora do período |

O que o participante vê em cada situação:

| Situação | No jogo | No servidor |
|---|---|---|
| Antes do início | "A coleta começa em …" e o botão Jogar (sem coleta) | Recusa os dados |
| Durante o período | Convite para participar → TCLE → questionários | Grava os dados |
| Depois do fim | "A coleta foi encerrada em …" e o botão Jogar (sem coleta) | Recusa sessões novas; aceita envios atrasados de sessões do período até a tolerância |
| `ativa = NÃO` | O jogo completo abre direto, sem mencionar a pesquisa | Recusa os dados |

As regras são aplicadas **no servidor**, então nem uma versão antiga do jogo aberta em algum
computador consegue gravar fora do período.

## 4. Fluxo do participante

1. **Convite:** participar ou jogar sem participar.
2. **TCLE:** texto integral, cópia para baixar, declaração de consentimento e autorização de
   gravação em áudio da entrevista (Sim/Não). Quem não aceita pode jogar, sem nenhum registro.
3. **Código de participação** gerado pelo jogo (ex.: `PNC-7K3Q`). Não identifica a pessoa, mas
   permite pedir a retirada dos dados.
4. **Questionário pré-jogo** (só no Ciclo 2).
5. **Jogo:** os modos da aba Config, com o progresso no rodapé do menu.
6. **Questionário final**, liberado ao concluir os modos: reduzido pós-sessão (Ciclo 1) ou
   pós-jogo (Ciclo 2).
7. **Agradecimento**, com a lista de canais de apoio (180, 188, 190, 192, serviços da cidade)
   para baixar, e o botão "Encerrar", que prepara o computador para a próxima pessoa.

Nenhum dado pessoal é pedido. Não há nome, e-mail nem data de nascimento; só o código, as
respostas e as decisões no jogo.

## 5. Sem internet

- Tudo vai para uma **fila no navegador** e é reenviado automaticamente: a cada 20 segundos,
  quando a conexão volta e ao fechar ou trocar de aba. Reenviar nunca duplica linhas.
- Se a sessão terminar sem internet, a tela final avisa que os dados serão enviados depois.
  **Não apague os dados do navegador desse computador** até eles chegarem à planilha.
- **Painel do pesquisador** (tecla **Ctrl + Alt + P**, em qualquer tela): mostra o estado da
  coleta, os lotes pendentes, o último envio e o último erro, e tem os botões "Enviar agora" e
  "Baixar cópia de segurança (JSON)". Não aparece para o participante.

## 6. Testar sem conta Google

```bash
npm run coletor        # coletor simulado em http://localhost:8787
npm run dev:pesquisa   # jogo de pesquisa apontando para ele
```

O coletor simulado aplica as mesmas regras do Apps Script. Para ver os dados recebidos, abra
`http://localhost:8787/?acao=dados`. Para mudar período e liga/desliga, use
`http://localhost:8787/config-teste?inicio=AAAA-MM-DD&fim=AAAA-MM-DD&ativa=SIM`.

## 7. TCLE e questionários

Ficam em [`content/research/index.ts`](../content/research/index.ts), transcritos de `TCLE.docx` e
de `Anexos_Instrumentos_Coleta.pdf`. As adaptações ao formato do jogo estão em
[CICLO1.md](CICLO1.md#4-diferenças-em-relação-aos-documentos-tcle-e-anexos).

- Se o TCLE mudar, atualize o texto e a `version`: ela é gravada junto com cada aceite.
- `INSTRUMENTS` liga cada ciclo aos seus questionários.
- Tipos de pergunta: escala de concordância (`likert`), escolha única (`escolha`, com `correct`
  opcional para contar acertos), várias escolhas (`multipla`), resposta aberta (`texto`),
  resposta curta (`curto`) e número (`numero`).
- `PLACEHOLDER = true` volta a exibir a faixa vermelha "Versão provisória" nas telas da pesquisa.
