# Play na Consciência

Jogo sério sobre violência contra a mulher, desenvolvido como parte de uma pesquisa de mestrado (DBR).
O jogo tem quatro modos: Fragmentos, A Ponte, Dossiê 180 e O Espelho. O plano de desenvolvimento está em [docs/ROADMAP.md](docs/ROADMAP.md).

## Rodar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev        # http://localhost:5173 (modo dev: pular, seletor de cena)
npm run build      # tipos + testes + build em dist/
npm run preview    # serve dist/ como na versão de pesquisa
```

- **Versão de pesquisa:** é o `dist/`. O `index.html` vem com JS, CSS e fontes embutidos, e a pasta `assets/` fica ao lado. Funciona hospedado ou aberto direto do disco ou de um pendrive, sem internet. Os controles de teste ficam escondidos; para mostrá-los, adicione `?dev` à URL.
- **Teclado:** Espaço, Enter ou → avançam o diálogo; as teclas 1 a 9 escolhem uma opção; Esc aciona a saída rápida.
- **Depuração** (modo dev): `__pnc.telemetry.download()` no console baixa os eventos registrados, e `__pnc.saves` dá acesso ao progresso.

## Estrutura

```
content/                     roteiros e dados (o que muda entre histórias)
  protagonists/<id>/         index.ts (metadados) + modo1.ts (roteiro)
  types.ts
src/
  core/                      save, áudio, telemetria, config, assets
  engine/vn/                 motor de visual novel + validação de roteiro
  modes/fragmentos/          Modo 1 (controles + resumo)
  ui/                        menu inicial, barra de segurança, indicador
  styles/
assets-src/                  arte original (PNG) — fonte para `npm run assets`
public/assets/               arquivos servidos (WebP, MP3)
tests/                       validador de conteúdo + testes do núcleo
```

## Adicionar uma protagonista

1. Coloque a arte em `assets-src/characters/<personagem>/` e `assets-src/backgrounds/<protagonista>/` e rode `npm run assets`.
2. Crie `content/protagonists/<id>/modo1.ts`, no mesmo formato do roteiro da Júlia (ver `src/engine/vn/types.ts`), e o `index.ts` com os metadados.
3. Registre a protagonista em `content/protagonists/index.ts`.
4. Rode `npm run validate`. Ele aponta cenas quebradas ou inalcançáveis e arquivos de arte ou música ausentes.
