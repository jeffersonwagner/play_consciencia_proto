// Modo de desenvolvimento: ativo no `npm run dev` ou com `?dev` na URL.
// Mostra os controles de teste (pular, seletor de cena). A build de
// pesquisa, aberta sem `?dev`, esconde esses controles dos participantes.

const params = typeof location !== 'undefined'
  ? new URLSearchParams(location.search)
  : new URLSearchParams();

/**
 * `?avaliacao=0` na build de avaliação abre o jogo completo, sem TCLE,
 * questionários nem envio de dados, para o pesquisador testar. O progresso
 * fica separado do das participações (ver main.ts).
 */
export const EVALUATION_OFF = import.meta.env.VITE_RESEARCH === '1' && params.get('avaliacao') === '0';

// Na build de avaliação, `?dev` só vale junto com `?avaliacao=0`:
// participantes não podem destravar modos nem ver controles de teste.
export const DEV = import.meta.env.DEV || ((import.meta.env.VITE_RESEARCH !== '1' || EVALUATION_OFF) && params.has('dev'));

/**
 * Exige concluir um modo antes de liberar o seguinte (1 → 2 → 3).
 * Desligado no modo dev, para testar qualquer modo diretamente.
 */
export const LOCK_PROGRESSION = !DEV;

// Build de coleta de dados (npm run build:pesquisa): ver src/research e
// docs/COLETA.md. Ligar/desligar a coleta e o período ficam na planilha.
export const COLLECT_URL = import.meta.env.VITE_COLLECT_URL ?? '';
export const COLLECT_TOKEN = import.meta.env.VITE_COLLECT_TOKEN ?? '';

export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';

/** Endereço para onde a saída rápida leva. */
export const QUICK_EXIT_URL = 'https://www.google.com/search?q=previs%C3%A3o+do+tempo';
