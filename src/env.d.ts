/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** "1" na build de coleta (npm run build:pesquisa). */
  readonly VITE_RESEARCH?: string;
  /** Endereço /exec do Apps Script da planilha da coleta. */
  readonly VITE_COLLECT_URL?: string;
  /** Token compartilhado com a aba Config da planilha. */
  readonly VITE_COLLECT_TOKEN?: string;
}
