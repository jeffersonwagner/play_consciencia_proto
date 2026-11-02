// Atalhos para montar DOM sem innerHTML (o texto nunca é interpretado como HTML).

type Child = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Omit<HTMLElementTagNameMap[K], 'style'>> & { style?: string } = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  const { style, ...rest } = props;
  Object.assign(node, rest);
  if (style) node.setAttribute('style', style);
  for (const child of children) {
    if (child) node.append(child);
  }
  return node;
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento #${id} não encontrado no index.html`);
  return node as T;
}

/** Tira o foco de um botão clicado com o mouse, para Espaço/Enter seguirem avançando o diálogo. */
export function blurIfMouse(e: MouseEvent): void {
  if (e.detail > 0) (e.currentTarget as HTMLElement | null)?.blur();
}
