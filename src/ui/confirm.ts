// Confirmação dentro do jogo, no lugar do confirm() do navegador: alguns
// navegadores (e janelas embutidas) bloqueiam a caixa nativa e respondem
// "cancelar" sem mostrar nada, o que travava ações como "Começar de novo".

import { el } from './dom';

export function confirmDialog(
  message: string,
  { confirm = 'Sim', cancel = 'Cancelar' }: { confirm?: string; cancel?: string } = {},
): Promise<boolean> {
  return new Promise(resolve => {
    const close = (answer: boolean) => {
      modal.remove();
      resolve(answer);
    };
    const yes = el('button', { className: 'primary-button', onclick: () => close(true) }, confirm);
    const modal = el('div', { className: 'desk-modal confirm-modal', role: 'dialog', ariaModal: 'true' },
      el('div', { className: 'desk-modal-card' },
        el('p', {}, message),
        el('div', { className: 'confirm-actions' },
          yes,
          el('button', { className: 'secondary-button', onclick: () => close(false) }, cancel),
        ),
      ),
    );
    document.body.append(modal);
    yes.focus();
  });
}
