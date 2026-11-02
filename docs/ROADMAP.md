# Play na Consciência — Roadmap de Desenvolvimento

> Base: texto de qualificação (Apêndice A — GDD, cap. 4 — metodologia DBR, cronograma) e o protótipo atual (`index.html`, commit `1e82a86`).
> Data de referência: 02/11/2026.

---

## 1. Onde estamos

### 1.1 O que o protótipo já implementa

| Item do GDD | Situação | Observação |
|---|---|---|
| Modo 1 — Júlia, cenas 1 a 6 | ✅ Completo | Escolhas nas cenas 1, 2, 3 e 5; a cena 4 é cinemática (sem escolha, o que está coerente com o GDD) |
| Bifurcação da cena 5 (Carla × Lúcia) | ✅ | Gera `state.ally` e duas versões da cena 6 |
| Indicador educativo de tipo de violência | ✅ | Aparece em escolhas e em falas marcadas, com justificativa |
| Resumo final com escolhas e violências | ✅ | Inclui a versão para impressão |
| Música por cena com crossfade, volume e mudo | ✅ | |
| Salvar/continuar | ⚠️ Parcial | Usa `sessionStorage` e perde o progresso ao fechar a aba. Não serve para encadear modos |
| Sem pontuação no Modo 1 | ✅ | Coerente com o GDD |
| Aviso de conteúdo + Ligue 180 | ✅ | Só na tela inicial |
| Lívia, Márcia, Renata, Clara (Modo 1) | ❌ | Roteiro existe no GDD, mas faltam diálogos e arte |
| Modo 2 — A Ponte | ❌ | |
| Modo 3 — Dossiê 180 | ❌ | |
| Modo 4 — O Espelho | ❌ | |
| Cartas de Conhecimento, Glossário, Manual | ❌ | O glossário já está escrito no GDD |
| Finais globais (Modo 2 + Modo 3) | ❌ | |
| Registro de dados para a pesquisa (DBR) | ❌ | A metodologia exige: "registro do uso de PA para análise posterior" |

### 1.2 Problemas técnicos encontrados no código atual

1. **Bug de acessibilidade:** o `keydown` global chama `preventDefault()` em Enter e Espaço. Por isso, quem usa o teclado **não consegue ativar os botões de escolha**.
2. Arquivo único com 2.100 linhas, em que roteiro, motor e estilos estão misturados. Não escala para 5 protagonistas × 4 modos.
3. As escolhas das cenas 1 a 3 são registradas, mas **não mudam nada depois** (não existem *flags*). O Modo 2 e o Modo 3 vão precisar desse histórico, por exemplo para o dossiê refletir o que a jogadora viveu.
4. O `inherit` resolve só um nível, e chegar ao fim de uma cena sem transição falha em silêncio.
5. O botão "Pular adiante" (›) fica visível para participantes. É preciso um modo de desenvolvimento separado da build de pesquisa.
6. Os assets pesam cerca de 23 MB (PNG de 1,4 a 2 MB e um MP3 de 6,8 MB). Isso é ruim para laboratório ou Wi-Fi fraco. Em WebP/OGG, ficariam em cerca de 4 a 5 MB.
7. As fontes vêm do Google Fonts (CDN), então o jogo quebra sem internet. Para sessões em laboratório, as fontes devem ser locais.
8. Não há um botão de **saída rápida**, que é uma prática recomendada em materiais sobre violência doméstica: troca a tela por uma página neutra com um clique ou com `Esc`.

### 1.3 Inconsistências no GDD/qualificação a resolver antes de implementar

| # | Inconsistência | Sugestão |
|---|---|---|
| G1 | O Modo 1 já termina na Cena 6 (NAE), mas o Modo 2 diz que "ao atingir 100%, a Cena 6 é desbloqueada" | Escolher uma das opções: (a) o Modo 1 termina na Cena 5 e a Cena 6 vira o desfecho do Modo 2; ou (b) a Cena 6 do Modo 1 é a primeira busca de ajuda e o Modo 2 conduz a um "segundo passo" (registro formal), que alimenta o Modo 3. **Adotado provisoriamente: (b)** — ver [MODO2.md](MODO2.md) |
| G2 | "Patrícia" é ao mesmo tempo aliada falha (Modo 2) e escrivã (Modo 3) | Renomear uma das duas |
| G3 | Cartas padronizadas (5): Ciclo, Patrimonial, Gaslighting, Consentimento, Rede de Apoio. Renata exige "Violência Física e Patrimonial", e as etiquetas do Modo 3 incluem Moral, Ameaça, Cárcere Privado e Sexual Conjugal | Criar uma **taxonomia única** (`violence-types`) com IDs estáveis, usada pelo indicador do Modo 1, pelas cartas do Modo 2 e pelas etiquetas do Modo 3. Base: art. 7º da Lei Maria da Penha (física, psicológica, sexual, patrimonial, moral) + subtipos |
| G4 | No Modo 2 com o **aliado falho** (Lúcia, Patrícia, Beto, Odete, Beatriz), não está claro o papel do jogador | Definir: o jogador controla o aliado falho e o jogo oferece opções "no viés do personagem" e "superando o viés". O desafio é maior (confiança inicial menor). **Adotado provisoriamente**, com confiança inicial de 40% — ver [MODO2.md](MODO2.md) |
| G5 | O Modo 4 pede de 5 a 7 cenários, mas só 4 estão escritos | Escrever mais 1 a 3 (sugestões: assédio na rua/transporte, piada no trabalho, divisão do cuidado com filhos) |
| G6 | O Modo 4 pressupõe um jogador homem com parceira ("a parceira assume as tarefas"), mas o público é geral | Formular os cenários na 2ª pessoa e de forma neutra quanto a gênero, ou perguntar o perfil no início e adaptar os textos |
| G7 | O cap. 4 fala em "protótipo funcional básico **em Unity**" e, logo depois, em "Implementação em HTML5"; o Ciclo 2 diz "Extensão do protótipo em Unity" | Atualizar o texto para HTML5 (ver seção 2) |
| G8 | Cronograma: a Fase 1 diz "novembro de 2026" mas descreve atividades "em setembro"; a Fase 2 cita "outubro" para testes internos | Revisar as datas antes da versão final |

---

## 2. Decisão de tecnologia: continuar em HTML5

**Recomendação: continuar na web (HTML5/CSS/TypeScript), com build via Vite. Não migrar para Unity.**

| Modo | Natureza da interface | Por que a web atende bem |
|---|---|---|
| 1 — Fragmentos | Visual novel (texto, sprites, fundos) | Já funciona. É o caso de uso clássico da web |
| 2 — A Ponte | Simulador de smartphone: apps, chat, calendário, medidor circular | Interface de app é exatamente o que HTML/CSS fazem melhor. Em Unity, isso significaria recriar um chat e listas com uGUI/UI Toolkit, com mais trabalho e pior resultado |
| 3 — Dossiê 180 | Mesa de trabalho com documentos e *drag and drop* de etiquetas | Pointer Events + DOM. Nenhum requisito de física, 3D ou shader |
| 4 — O Espelho | Cenários com escolhas + relatório | Formulário e relatório imprimível. Trivial na web |

Motivos adicionais:
- **Aplicação nos ciclos de DBR:** o link abre em qualquer navegador de laboratório ou no celular, sem instalação. Unity WebGL gera builds de 20 a 50 MB, tem carregamento lento e suporte ruim em celular.
- **Velocidade de iteração:** os ajustes entre ciclos são quase todos de texto, balanceamento e interface, o que a web permite fazer em minutos.
- **Acessibilidade:** leitores de tela, zoom e contraste funcionam nativamente no DOM. Isso já é exigido no Ciclo 2 ("ajustes... com foco em acessibilidade").
- **Custo:** reescrever o Modo 1 em Unity consumiria semanas que o cronograma não tem.

Em que caso eu reconsideraria: se o GDD passar a pedir cenas animadas em tempo real, personagens 3D ou exportação nativa para lojas de apps. Nenhum desses requisitos existe hoje. Mesmo para lojas, a web pode ser empacotada (Capacitor ou Tauri) depois.

### Stack proposta

| Camada | Escolha | Justificativa |
|---|---|---|
| Linguagem | **TypeScript** | O roteiro passa a ser checado por tipos: uma cena `next` inexistente ou um sprite com nome errado vira erro de compilação |
| Build/dev | **Vite** | Servidor local com recarga instantânea; gera uma pasta `dist/` estática |
| UI | **DOM + CSS puro**, componentes em módulos TS | Um framework (React etc.) não é necessário para esta escala. Se o Modo 3 ficar complexo, dá para adotar **Preact** só nele |
| Conteúdo | Arquivos `.ts` tipados por protagonista/modo | É o formato atual, só que separado e validado. (Alternativa avaliada: a linguagem narrativa *Ink*. Fica descartada por enquanto, porque teria curva de aprendizado e o formato próprio já funciona) |
| Persistência | `localStorage` com *schema* versionado | Permite encadear os modos 1→2→3→4 entre sessões |
| Telemetria | Log local de eventos, exportável como JSON/CSV | Não exige servidor, está alinhado à LGPD/TCLE e cobre a necessidade da análise DBR |
| Testes | **Vitest** | Lógica de confiança, PA, bem-estar, sequenciamento e finais, além do validador de roteiro |
| Distribuição | GitHub Pages (online) + build **arquivo único** (`vite-plugin-singlefile`) para pendrive/laboratório sem internet | |

---

## 3. Estrutura de pastas proposta

```
play_consciencia_proto/
├─ index.html                     # só o "casco": monta o app
├─ package.json  vite.config.ts  tsconfig.json
├─ docs/
│  ├─ ROADMAP.md                  # este documento
│  ├─ GUIA_DE_CONTEUDO.md         # como escrever cenas, semanas, casos
│  ├─ MODO2.md                    # regras e balanceamento do Modo 2
│  ├─ MODO3.md                    # regras e balanceamento do Modo 3
│  └─ MODO4.md                    # regras do Modo 4
├─ public/assets/                 # servidos como estão
│  ├─ fonts/
│  ├─ audio/music/  audio/sfx/
│  ├─ backgrounds/<protagonista>/  # cena01_festa.webp …
│  ├─ characters/<personagem>/     # julia/neutra.webp, julia/chorando.webp …
│  └─ ui/                          # ícones do celular, mesa, etiquetas
├─ src/
│  ├─ main.ts                     # bootstrap + roteador de telas
│  ├─ core/
│  │  ├─ state.ts                 # estado da campanha (tipos + store)
│  │  ├─ save.ts                  # localStorage versionado + migrações
│  │  ├─ telemetry.ts             # eventos de pesquisa + exportação
│  │  ├─ audio.ts                 # música/sfx (extraído do protótipo)
│  │  ├─ router.ts                # hub → modo → resumo
│  │  └─ config.ts                # flags: modo dev, build de pesquisa
│  ├─ engine/
│  │  └─ vn/                      # motor de visual novel (Modo 1 e cinemáticas)
│  ├─ modes/
│  │  ├─ fragmentos/              # Modo 1
│  │  ├─ ponte/                   # Modo 2: phone UI, confiança, PA, semanas
│  │  ├─ dossie/                  # Modo 3: mesa, etiquetas, rede, plantão
│  │  └─ espelho/                 # Modo 4: cenários + relatório
│  ├─ ui/                         # componentes comuns: indicador de violência,
│  │                              # visualizador de cartas, glossário, saída rápida
│  └─ styles/                     # tokens.css + um CSS por modo
├─ content/
│  ├─ shared/
│  │  ├─ violence-types.ts        # taxonomia única (resolve G3)
│  │  ├─ cards.ts                 # Cartas de Conhecimento
│  │  ├─ glossary.ts              # glossário do GDD
│  │  ├─ characters.ts            # quem é quem, sprites, papel
│  │  └─ professionals.ts         # rede do Modo 3 (traços, plantão)
│  ├─ protagonists/
│  │  ├─ julia/   { meta.ts, modo1.ts, modo2.ts, modo3.ts }
│  │  ├─ livia/   …
│  │  ├─ marcia/  …
│  │  ├─ renata/  …
│  │  └─ clara/   …
│  └─ espelho/scenarios.ts
├─ tools/
│  └─ validate-content.ts         # checa `next` quebrado, sprites/fundos ausentes,
│                                 # cenas inalcançáveis, IDs de violência inválidos
└─ tests/
```

Princípios:
- **Adicionar uma protagonista não deve exigir mexer em `src/`**, só criar uma pasta em `content/protagonists/` e os assets dela.
- O estado é uma **campanha por protagonista**:
  ```ts
  { protagonist: 'julia',
    modo1: { choices, flags, ally },
    modo2: { trust, week, ap, cards, log, ending },
    modo3: { wellbeing, tags, actions, ending },
    globalEnding }
  // + modo4 (global, não depende da protagonista)
  ```
- Uma **telemetria** separada do save registra: código anônimo do participante, timestamps, escolhas, tempo por decisão, uso de PA, curva de confiança e bem-estar, e cartas abertas.

---

## 4. Roadmap

O cronograma da qualificação previa a coleta do Ciclo 1 (Modos 1, 2 e 3) em novembro de 2026. Como o Modo 2 ainda não começou, **essa data não é realista**. Proponho levar a coleta do Ciclo 1 para a **1ª quinzena de dezembro** e usar só a Júlia nos Modos 1 a 3. A estratégia é a de **fatia vertical**: uma protagonista atravessando todos os modos antes de produzir as outras quatro. Isso valida as mecânicas cedo e transforma as demais protagonistas em produção de conteúdo, sem código novo.

### Fase 0 — Reestruturação (02/11 a 09/11)
- [x] Vite + TypeScript + Vitest; estrutura de pastas da seção 3
- [x] Extrair CSS, motor VN, áudio e roteiro da Júlia para módulos (**comportamento idêntico ao atual**)
- [x] Estado de campanha + `localStorage` versionado; *flags* nas escolhas do Modo 1
- [x] Hub inicial: escolher protagonista e modo (com bloqueio de progressão configurável)
- [x] Corrigir o bug do Enter/Espaço; navegação por teclado nas escolhas (Tab + Enter, ou teclas 1–9)
- [x] Botão de saída rápida (também com Esc); Ligue 180 acessível em todas as telas
- [x] Imagens em WebP (13 MB → 0,7 MB); fontes locais
- [ ] Recomprimir as músicas (10 MB em MP3) — pendente: falta um codificador de áudio (ffmpeg) na máquina
- [x] Validador de conteúdo (`npm run validate`) rodando no `npm run build`
- [x] Flag `DEV` (mantém o "pular", o seletor de cena e o *reset*) × build de pesquisa
- [x] Base do registro de eventos (escolhas com tempo de decisão), exportável em JSON
- **Entrega:** a Júlia no Modo 1 roda igual ao protótipo atual, agora sobre a nova base

### Fase 1 — Modo 2 "A Ponte", Júlia (09/11 a 23/11)
- [x] Resolver G1 e G4 no GDD (decisões provisórias em [MODO2.md](MODO2.md))
- [x] Interface de celular: tela inicial com Contatos, Mensagens, Calendário, Cartas e app "A Ponte"
- [x] Medidor de Confiança circular (50% Carla, 40% Lúcia) e regras de variação
- [x] Pontos de Ação: 3 por semana; mensagem = 1, ligação = 2, visita = 3, pesquisa = 1
- [x] Ciclo de 4 semanas com eventos do agressor (tensão / lua de mel)
- [x] Cartas de Conhecimento (5, rascunho): desbloqueio via pesquisa; "carta necessária" para a ação de vitória
- [x] Roteiros: Carla (eficaz) e Lúcia (falha), semanas 1 a 4 — **rascunho para revisão**
- [x] Finais: 100% / intermediário / 0% ("Preciso de um tempo…") + resumo com retorno pedagógico
- [x] Balanceamento em [MODO2.md](MODO2.md) + testes (inclui verificação automática de que o final positivo exige a carta)
- **Entrega:** a Júlia jogável de ponta a ponta nos Modos 1→2

### Fase 2 — Modo 3 "Dossiê 180", Júlia (23/11 a 05/12)
- [x] Mesa de trabalho: dossiê central montado a partir do estado dos Modos 1 e 2
- [x] Etiquetas de violência com *drag and drop* (arrastar com o mouse; clicar/tocar/teclado como alternativa) e taxonomia única (G3)
- [x] Rede de profissionais com traços (acolhedor/viés) e plantão/tempo (5 períodos)
- [x] Barra de ações de encaminhamento com **sequenciamento** (a ordem importa) e dilema da "compensação"
- [x] Nível de Bem-Estar e finais (≥80 / 50–79 / <50) — regras em [MODO3.md](MODO3.md)
- [x] Final global da Júlia (Modo 2 + Modo 3), no resumo do Modo 3
- **Entrega:** a Júlia completa nos Modos 1→2→3

### Fase 3 — Instrumentação e Ciclo 1 (01/12 a 19/12)
- [ ] Tela de consentimento/código do participante (sem dados pessoais)
- [ ] Exportação da telemetria (JSON + CSV) no fim da sessão
- [ ] Build offline em arquivo único + roteiro de aplicação
- [ ] Teste interno (debug, compreensão, usabilidade): 2 a 3 pessoas
- [ ] **Coleta do Ciclo 1** (8 a 12 participantes, Modos 1 a 3, Júlia)
- [ ] Análise preliminar → lista de ajustes priorizados

### Fase 4 — Modo 4 "O Espelho" + ajustes do Ciclo 1 (15/12 a 10/01)
- [x] Resolver G5 e G6 no GDD (decisões provisórias em [MODO4.md](MODO4.md))
- [x] 7 cenários do cotidiano (4 do GDD + 3 novos), com opções embaralhadas e sem retorno durante o jogo
- [x] Relatório de Atitudes: perfil (aliado ativo / observador passivo / reprodutor / misto), glossário contextual e ligação com os modos anteriores
- [ ] Aplicar os ajustes do Ciclo 1
- [ ] Revisão MDA/DPE: tabela mecânica → dinâmica → estética → objetivo pedagógico
- [ ] Acessibilidade: tamanho de fonte, contraste, `prefers-reduced-motion`, leitor de tela

### Fase 5 — Conteúdo das demais protagonistas (contínua, de 23/11 em diante, em paralelo)
Para cada protagonista (ordem sugerida: **Renata → Lívia → Márcia → Clara**):
1. Diálogos completos do Modo 1 (as 6 cenas)
2. Arte: protagonista (3 ou 4 emoções), agressor (2 ou 3), 2 aliados, profissional da cena 6, 5 ou 6 fundos
3. Modo 2: 4 semanas × 2 aliados
4. Modo 3: caso com etiquetas, ações corretas e dilema
5. Revisão de conteúdo sensível por especialista em violência de gênero (sugestão: pelo menos para a Clara, que trata de violência sexual conjugal)

> Para o Ciclo 2 (janeiro), sugiro **Júlia + 1 ou 2 protagonistas** completas. As cinco ficam como meta de conclusão do jogo, não como requisito da defesa.

### Fase 6 — Ciclo 2 e defesa (jan a fev/2027)
- [ ] Congelamento de funcionalidades em ~10/01; daí em diante, só correções
- [ ] Pré-teste / sessão / pós-teste integrados ao fluxo (links para os instrumentos)
- [ ] **Coleta do Ciclo 2** (20 a 30 participantes, quatro modos)
- [ ] Exportação consolidada para a análise (Bloom, Bartle, MEEGA+, TAM + logs)

### Fase 7 — Conclusão do jogo (pós-defesa)
- [ ] As cinco protagonistas completas
- [ ] Manual de Referência (rede de proteção, Lei Maria da Penha, serviços)
- [ ] Polimento: som, animações, tela de créditos, versão para educadores (guia de mediação)
- [ ] Publicação aberta (Pages/itch.io) e, se fizer sentido, empacotamento para celular

---

## 5. Decisões pendentes (do pesquisador)

1. **Adiar o Ciclo 1** para dezembro, só com a Júlia? (recomendado)
2. **G1**: a Cena 6 do Modo 1 permanece como está, e o Modo 2 leva ao "segundo passo"? (recomendado)
3. **G4**: como o jogador atua com o aliado falho?
4. **Hospedagem dos dados**: só exportação local (recomendado para o CEP) ou envio para um servidor?
5. **Ordem de produção** das protagonistas e quantas entram no Ciclo 2.
6. Produção de arte das novas protagonistas: mesmo processo/ferramenta usado para a Júlia, para manter o estilo consistente.
