# Modo 2 — "A Ponte": regras e balanceamento

> Documento de trabalho. Os números ficam em `src/modes/ponte/rules.ts` (regras gerais) e
> `content/protagonists/<id>/modo2.ts` (variação de confiança de cada resposta).
> Ajuste aqui e lá após o Ciclo 1.

## Decisões provisórias (GDD)

- **G1 — Cena 6:** a Cena 6 do Modo 1 (NAE) é a *primeira* busca de ajuda. O Modo 2 se passa
  nas quatro semanas seguintes e, no final positivo, leva ao **segundo passo**: a protagonista
  decide fazer o registro formal (B.O.) acompanhada pelo aliado. Esse registro abre o caso no
  Modo 3.
- **G4 — Aliado falho:** o jogador controla o aliado escolhido na Cena 5, inclusive o falho.
  Com o aliado falho, as opções incluem respostas "no viés do personagem" (minimizar, defender
  o agressor, apressar) e respostas "superando o viés". A confiança começa menor (40% contra
  50%), porque a protagonista já sentiu o julgamento na Cena 5.

## Ciclo do jogo

1. O modo tem **4 semanas**. Cada semana abre com uma mensagem da protagonista sobre um
   acontecimento (fase do ciclo da violência: explosão, lua de mel, aumento da tensão).
2. O jogador recebe **3 Pontos de Ação (PA)** por semana. PA não usados se perdem.
3. Ações (cada uma, no máximo uma vez por semana):

   | Ação | Custo | Efeito típico (resposta acolhedora / prejudicial) |
   |---|---|---|
   | Mandar mensagem | 1 PA | +3 / −5 |
   | Fazer ligação | 2 PA | +8 / −8 |
   | Convidar para um café/visitar | 3 PA | +13 / −12 |
   | Pesquisar na internet | 1 PA | desbloqueia uma Carta de Conhecimento |

4. Cada conversa tem 3 respostas possíveis: uma **acolhedora**, uma **insuficiente**
   (≈ 0) e uma **prejudicial**. Depois de responder, aparece um retorno pedagógico curto.
5. **Ação de vitória** (semana 4, na ligação ou na visita): só aparece se a carta exigida
   (Júlia: *Violência Patrimonial*) tiver sido desbloqueada. Vale **+25**.

## Fim do modo

| Condição | Final |
|---|---|
| Confiança chega a 100% (a qualquer momento) | **Positivo:** a protagonista decide fazer o registro formal com o aliado → caso aberto no Modo 3 |
| Confiança chega a 0% (a qualquer momento) | **Negativo:** "Preciso de um tempo…" — afastamento |
| Fim da semana 4 com confiança ≥ 50% | **Neutro:** o vínculo continua, mas o ciclo também |
| Fim da semana 4 com confiança < 50% | **Negativo** |

## Conferência do balanceamento (Júlia)

- **Carla (início 50%):** três visitas acolhedoras nas semanas 1 a 3 levam a 89%. Na semana 4,
  pesquisar (1 PA) + ligar (2 PA) com a ação de vitória dá +25 → 100%. Há folga de cerca de 14
  pontos para respostas não ideais.
- **Semana 4, respostas acolhedoras sem a carta valem menos:** ligação +7 (não +8) e visita +10
  (não +13), então a semana rende no máximo +10 sem a carta. Sem esse ajuste, a Carla chegaria
  a 100% sem pesquisar nada. Na semana 4, só validar já não basta: o avanço depende de nomear
  a violência.
- **Lúcia (início 40%):** o mesmo caminho perfeito chega a 104% → 100%. A folga é de apenas
  4 pontos: com a aliada falha, o final positivo exige respostas quase sempre acolhedoras.
  É intencional, mas precisa ser observado no Ciclo 1.
- Sem a carta (ou seja, sem pesquisar), o máximo possível é 99% (Carla) ou 89% (Lúcia): o final
  positivo depende de o jogador buscar informação, como pede o GDD.
