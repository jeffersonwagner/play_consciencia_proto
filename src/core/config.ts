// Modo de desenvolvimento: ativo no `npm run dev` ou com `?dev` na URL.
// Mostra os controles de teste (pular, seletor de cena). A build de
// pesquisa, aberta sem `?dev`, esconde esses controles dos participantes.

const params = typeof location !== 'undefined'
  ? new URLSearchParams(location.search)
  : new URLSearchParams();

export const DEV = import.meta.env.DEV || params.has('dev');

/**
 * Exige concluir um modo antes de liberar o seguinte (1 → 2 → 3).
 * Desligado no modo dev, para testar qualquer modo diretamente.
 */
export const LOCK_PROGRESSION = !DEV;

/** Endereço para onde a saída rápida leva. */
export const QUICK_EXIT_URL = 'https://www.google.com/search?q=previs%C3%A3o+do+tempo';
