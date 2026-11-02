// ============================================================
// BARRA DE SEGURANÇA (presente em todas as telas)
// - Saída rápida: troca a página por uma pesquisa neutra, sem deixar o
//   jogo no histórico do botão "voltar". Também dispara com Esc.
//   O progresso fica salvo, então dá para retomar depois.
// - Central de Atendimento à Mulher (Ligue 180), sempre visível.
// ============================================================

import { QUICK_EXIT_URL } from '../core/config';
import { el } from './dom';

export function quickExit(): void {
  document.title = 'Nova guia';
  document.body.replaceChildren();
  location.replace(QUICK_EXIT_URL);
}

export function mountSafetyBar(): void {
  const bar = el('div', { id: 'safety-bar' },
    el('button', {
      className: 'safety-exit',
      title: 'Sair rapidamente do jogo (tecla Esc)',
      onclick: quickExit,
    }, '✕ Sair rápido'),
    el('a', {
      className: 'safety-helpline',
      href: 'tel:180',
      title: 'Central de Atendimento à Mulher — ligação gratuita, 24 horas',
    }, 'Ligue 180'),
  );
  document.body.append(bar);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') quickExit();
  });
}
