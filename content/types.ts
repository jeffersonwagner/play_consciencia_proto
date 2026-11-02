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

// ------------------------------------------------------------
// MODO 2 — "A PONTE" (ver docs/MODO2.md)
// ------------------------------------------------------------

export type PonteAction = 'mensagem' | 'ligacao' | 'visita';

/** Uma fala no celular. `from: 'narrador'` aparece como texto de contexto. */
export interface ChatLine {
  from: 'protagonista' | 'jogador' | 'narrador';
  text: string;
}

export interface PonteOption {
  /** O que o jogador (no papel do aliado) diz. */
  text: string;
  /** Resposta da protagonista (e/ou narração) depois da escolha. */
  replies: ChatLine[];
  /** Variação da confiança, em pontos percentuais. */
  delta: number;
  /** Retorno pedagógico mostrado após a escolha e no resumo. */
  feedback: string;
  /** A opção só aparece se esta carta tiver sido desbloqueada. */
  requiresCard?: string;
  /** Marca a ação de vitória da semana 4. */
  victory?: boolean;
}

export interface PonteInteraction {
  /** Falas que abrem a conversa, antes das opções. */
  opening: ChatLine[];
  options: PonteOption[];
}

export interface PonteWeek {
  title: string;
  /** Fase do ciclo da violência exibida no calendário. */
  phase: string;
  /** Mensagens que chegam no início da semana. */
  event: ChatLine[];
  interactions: Record<PonteAction, PonteInteraction>;
}

export interface PonteAllyContent {
  /** Nome do aliado (o jogador), ex.: "Carla". */
  name: string;
  /** Relação com a protagonista, ex.: "amiga". */
  relation: string;
  sprite: string;
  startTrust: number;
  /** Texto de abertura do modo: quem o jogador é e o que aconteceu. */
  intro: string;
  weeks: PonteWeek[];
  endings: Record<PonteEnding, ChatLine[]>;
}

export type PonteEnding = 'positivo' | 'neutro' | 'negativo';

export interface PonteContent {
  /** Foto da protagonista no app (sprite). */
  avatar: string;
  /** Carta necessária para a ação de vitória. */
  victoryCard: string;
  allies: Record<string, PonteAllyContent>;
}

// ------------------------------------------------------------
// CARTAS DE CONHECIMENTO (compartilhadas entre protagonistas)
// ------------------------------------------------------------

export interface KnowledgeCard {
  id: string;
  title: string;
  /** Termo de busca exibido no "navegador" do celular. */
  searchQuery: string;
  summary: string;
  signs: string[];
  howToHelp: string[];
  legalBasis: string;
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
  ponte?: PonteContent;
}
