// Botões da tela de resumo, compartilhada pelos Modos 1 a 3: recomeçar,
// voltar ao menu e, quando houver, seguir direto para o próximo modo.

import { byId } from './dom';

export function bindSummaryActions(opts: {
  restart(): void;
  menu(): void;
  /** Próximo modo; sem ele, o botão fica escondido. */
  next?: { label: string; go(): void };
}): void {
  byId('summary-restart').onclick = opts.restart;
  byId('summary-menu').onclick = opts.menu;
  const next = byId<HTMLButtonElement>('summary-next');
  next.hidden = !opts.next;
  next.textContent = opts.next?.label ?? '';
  next.onclick = opts.next ? opts.next.go : null;
  // Com o próximo modo disponível, recomeçar deixa de ser a ação principal
  byId('summary-restart').className = opts.next ? 'secondary-button' : 'primary-button';
}
