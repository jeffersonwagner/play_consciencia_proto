# Modo 3 — "Dossiê 180": regras e balanceamento

> Documento de trabalho. Os números gerais ficam em `src/modes/dossie/rules.ts`; os de cada
> caso, em `content/protagonists/<id>/modo3.ts`. Ajuste após o Ciclo 1.

## Decisões provisórias (a confirmar pelo pesquisador)

- **Papel do jogador:** técnica(o) de referência da rede de atendimento à mulher do município.
  Recebe o caso, classifica a violência e decide os encaminhamentos.
- **Ligação com o Modo 2:** o caso chega à rede de qualquer forma; muda *como* chega. O final
  do Modo 2 define o bem-estar inicial e o texto do relato:

  | Final do Modo 2 | Como o caso chega | Bem-estar inicial |
  |---|---|---|
  | Positivo | Júlia vai à DEAM acompanhada pelo aliado | 65% |
  | Neutro | Encaminhada pelo NAE, diz que "está tudo mais calmo" | 50% |
  | Negativo | Encaminhada pelo NAE, sozinha e retraída | 40% |
  | (Modo 2 não jogado — só no modo dev) | — | 50% |

- **Medida protetiva:** tratada como ação pertinente em qualquer momento, porque desde a
  Lei nº 14.550/2023 ela independe de boletim de ocorrência ou inquérito. Não está entre as três
  "ações corretas" do GDD, então vale um bônus menor.
- **G2 (nome repetido):** a Escrivã Patrícia foi mantida no Modo 3. A colisão de nomes com a
  amiga de Lívia continua pendente.

## Ciclo do jogo

1. **Análise (não gasta tempo):** o jogador lê o dossiê (relato + documentos) e aplica
   etiquetas de violência — arrastando para o dossiê ou clicando/tocando/usando o teclado.
   Ao "Concluir a classificação":

   | Situação | Efeito no bem-estar |
   |---|---|
   | Etiqueta correta | +4 cada |
   | Etiqueta aceitável (subtipo pertinente) | 0 |
   | Etiqueta equivocada | −5 cada |
   | Etiqueta correta que faltou | −6 cada |

   Os encaminhamentos só ficam disponíveis depois da classificação.

2. **Encaminhamentos (gastam tempo):** o caso tem **5 períodos** (Dia 1 manhã … Dia 3 manhã).
   Cada encaminhamento ocupa um período e só pode ser feito uma vez. Alguns exigem escolher um
   profissional, e cada profissional tem **plantão**: só está disponível em certos períodos.
   "Aguardar" passa o período e custa −3 (a espera aumenta a angústia).
3. **Sequenciamento:** algumas ações valem mais quando feitas depois de outras. Exemplo do caso
   da Júlia: registrar o B.O. *depois* do acolhimento psicológico dá +4.
4. **Dilema:** no início de um período específico, surge um evento que exige decisão.
5. O caso termina quando os períodos acabam ou quando o jogador encerra. O bem-estar fica
   sempre entre 0 e 100; se chegar a 0, o caso termina na hora.

## Finais

| Bem-estar final | Final do Modo 3 |
|---|---|
| ≥ 80% | Positivo: Júlia rompe o ciclo com segurança |
| 50–79% | Neutro: buscou ajuda, mas houve falhas na proteção |
| < 50% | Negativo: retaliação ou desistência por falta de acolhimento |

**Final global da protagonista** (Modos 2 + 3):

| | Modo 3 positivo | Modo 3 neutro | Modo 3 negativo |
|---|---|---|---|
| **Modo 2 positivo** | Positivo | Neutro | Negativo |
| **Modo 2 neutro** | Positivo | Neutro | Negativo |
| **Modo 2 negativo** | Neutro | Negativo | Negativo |

## Caso da Júlia — conferência

Ações recomendadas pelo GDD: acolhimento psicológico com **Sofia**, B.O. com foco no dano
patrimonial (com a **Escrivã Patrícia**, que entra no plantão no Dia 2) e **NAE** para suporte
acadêmico.

- Caminho ideal: classificação correta (+8) → NAE (+8) → Sofia (+12) → dilema bem resolvido
  (+6) → B.O. com Patrícia (+12, +4 de sequência) → orientação jurídica com Dra. Helena (+5).
  Partindo de 50%: 100%.
- Dilema urgência × qualidade: o Delegado Norberto está de plantão já no Dia 1, mas é cético
  (B.O. com ele: −8). Esperar pela Escrivã Patrícia é melhor, desde que o tempo seja usado com
  outros encaminhamentos.
- Os testes (`tests/dossie.test.ts`) conferem que o caminho ideal chega ao final positivo
  mesmo partindo de 40%, e que um caminho apressado e com profissionais enviesados termina
  no final negativo.
