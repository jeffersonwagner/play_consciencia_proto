// Caixa educativa que aparece quando uma fala ou escolha é marcada com
// um tipo de violência. Some sozinha após 6 s (duração da animação CSS).

import { byId } from './dom';

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export function showViolenceIndicator(text: string, explanation?: string | null): void {
  const indicator = byId('violence-indicator');
  byId('violence-text').textContent = text;
  byId('violence-explanation').textContent = explanation || '';

  // Reinicia a animação mesmo se já estiver visível
  indicator.classList.remove('visible');
  void indicator.offsetWidth;
  indicator.classList.add('visible');

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => indicator.classList.remove('visible'), 6000);
}
