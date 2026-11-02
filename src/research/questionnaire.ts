// Renderiza um questionário (pré ou pós-teste) e devolve as respostas.
// Itens obrigatórios sem resposta impedem o envio e são destacados.

import { LIKERT_PADRAO, type QuestionItem, type Questionnaire } from '../../content/research';
import { el } from '../ui/dom';

export type Answers = Record<string, string>;

function itemField(item: QuestionItem): { node: HTMLElement; value(): string } {
  const name = `q-${item.id}`;
  if (item.type === 'texto') {
    const area = el('textarea', { name, rows: 3, className: 'q-text' });
    return { node: area, value: () => area.value.trim() };
  }
  if (item.type === 'curto') {
    const input = el('input', { type: 'text', name, className: 'q-short', maxLength: 120 });
    return { node: input, value: () => input.value.trim() };
  }
  if (item.type === 'numero') {
    const input = el('input', { type: 'number', name, className: 'q-short q-number', min: String(item.min ?? ''), max: String(item.max ?? ''), inputMode: 'numeric' });
    return {
      node: input,
      // Fora do intervalo conta como sem resposta
      value: () => (input.value && input.checkValidity() ? input.value : ''),
    };
  }
  const options = item.type === 'likert' ? (item.scale ?? LIKERT_PADRAO) : item.options;
  const multiple = item.type === 'multipla';
  const inputs = options.map(opt => el('input', { type: multiple ? 'checkbox' : 'radio', name, value: opt }));
  const node = el('div', { className: `q-options${item.type === 'likert' ? ' q-likert' : ''}` },
    ...options.map((opt, i) => el('label', { className: 'q-option' }, inputs[i], el('span', {}, opt))));
  return { node, value: () => inputs.filter(i => i.checked).map(i => i.value).join(' | ') };
}

export function renderQuestionnaire(
  screen: HTMLElement,
  q: Questionnaire,
  banner: HTMLElement | null,
  onDone: (answers: Answers, items: QuestionItem[]) => void,
): void {
  const fields: { item: QuestionItem; wrap: HTMLElement; value(): string }[] = [];
  const sections = q.sections.map(section => el('fieldset', { className: 'q-section' },
    section.title && el('legend', {}, section.title),
    section.note && el('p', { className: 'q-note' }, section.note),
    ...section.items.map(item => {
      const field = itemField(item);
      const wrap = el('div', { className: 'q-item' },
        el('p', { className: 'q-question' }, item.text, item.required && el('span', { className: 'q-required', title: 'Obrigatória' }, ' *')),
        field.node);
      fields.push({ item, wrap, value: field.value });
      return wrap;
    })));

  const error = el('p', { className: 'gate-error', role: 'alert' });
  const submit = () => {
    let firstMissing: HTMLElement | null = null;
    for (const f of fields) {
      const missing = Boolean(f.item.required) && !f.value();
      f.wrap.classList.toggle('missing', missing);
      if (missing && !firstMissing) firstMissing = f.wrap;
    }
    if (firstMissing) {
      error.textContent = 'Responda as perguntas marcadas com * para continuar.';
      firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onDone(Object.fromEntries(fields.map(f => [f.item.id, f.value()])), fields.map(f => f.item));
  };

  screen.replaceChildren(
    ...(banner ? [banner] : []),
    el('div', { className: 'title-eyebrow' }, 'Pesquisa'),
    el('h1', { className: 'title-main research-title' }, q.title),
    el('div', { className: 'title-divider' }),
    el('form', { className: 'q-form', onsubmit: (e: SubmitEvent) => { e.preventDefault(); submit(); } },
      el('p', { className: 'gate-note' }, q.intro),
      ...sections,
      error,
      el('button', { className: 'primary-button', type: 'submit' }, 'Enviar respostas'),
    ),
  );
  screen.scrollTop = 0;
}
