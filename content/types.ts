import type { Script } from '../src/engine/vn/types';

export type ProtagonistId = 'julia' | 'livia' | 'marcia' | 'renata' | 'clara';

export interface AllyInfo {
  /** Nome exibido, ex.: "Carla (amiga)". */
  name: string;
  kind: 'eficaz' | 'falho';
  description: string;
}

export interface FragmentosContent {
  start: string;
  script: Script;
  /** Texto de abertura na tela da protagonista. */
  synopsis: string;
  /** Nota pedagógica ao fim do resumo. */
  closingNote: string;
  /** Aliados possíveis da Cena 5, indexados pelo `setAlly` da cena. */
  allies: Record<string, AllyInfo>;
}

export interface Protagonist {
  id: ProtagonistId;
  name: string;
  age: number;
  role: string;
  /** Foco principal de violência (GDD, Apêndice A). */
  focus: string;
  /** Aviso de conteúdo específico desta história. */
  contentWarning: string;
  fragmentos?: FragmentosContent;
}
