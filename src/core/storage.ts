// Acesso ao localStorage que nunca lança exceção: em janela anônima,
// com cookies bloqueados ou em alguns navegadores de laboratório o acesso
// falha. Nesses casos o jogo funciona normalmente, só sem salvar.

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memory = new Map<string, string>();
const memoryStore: KeyValueStore = {
  getItem: k => memory.get(k) ?? null,
  setItem: (k, v) => { memory.set(k, v); },
  removeItem: k => { memory.delete(k); },
};

export function browserStore(): KeyValueStore {
  try {
    const probe = '__pnc_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return memoryStore;
  }
}

export function readJSON<T>(store: KeyValueStore, key: string): T | null {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(store: KeyValueStore, key: string, value: unknown): void {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch { /* cota cheia ou acesso negado — ignora */ }
}
