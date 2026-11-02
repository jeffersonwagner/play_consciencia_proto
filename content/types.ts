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

// ------------------------------------------------------------
// MODO 3 — "DOSSIÊ 180" (ver docs/MODO3.md)
// ------------------------------------------------------------

/** Tipo de violência (taxonomia única, content/shared/violence-types.ts). */
export interface ViolenceType {
  id: string;
  label: string;
  description: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  /** Acolhedor ou com viés — afeta o resultado do encaminhamento. */
  stance: 'acolhedor' | 'vies';
  trait: string;
  sprite?: string;
}

/** Dados do jogo usados para montar o dossiê a partir dos Modos 1 e 2. */
export interface DossieContext {
  flags: Record<string, boolean | number | string>;
  ally: string | null;
  allyName: string | null;
  ponteEnding: PonteEnding | null;
}

export interface DossieDocument {
  title: string;
  body: string;
}

export interface DossieOutcome {
  delta: number;
  feedback: string;
  /** Narração curta do que aconteceu no atendimento. */
  narration: string;
}

export interface DossieAction {
  id: string;
  label: string;
  icon: string;
  /** Se definido, o jogador escolhe entre estes profissionais. */
  professionals?: string[];
  /** Resultado por profissional (ou em `default`, sem profissional). */
  outcomes: Record<string, DossieOutcome>;
  /** Bônus/ônus quando a ação é feita depois de outra. */
  sequence?: { after: string; delta: number; feedback: string }[];
  /** Ação recomendada pelo GDD (aparece no resumo se não for feita). */
  recommended?: boolean;
}

export interface DossieEventOption {
  text: string;
  delta: number;
  feedback: string;
}

export interface DossieEvent {
  id: string;
  /** Período em que o evento aparece (índice em `slots`). */
  slot: number;
  title: string;
  text: string;
  options: DossieEventOption[];
}

export interface DossieContent {
  caseNumber: string;
  intro: string;
  startWellbeing: Record<PonteEnding | 'sem-modo2', number>;
  relato(ctx: DossieContext): string[];
  documents(ctx: DossieContext): DossieDocument[];
  correctTags: string[];
  /** Subtipos pertinentes: não pontuam nem penalizam. */
  acceptableTags: string[];
  /** Explicação das etiquetas corretas, mostrada após a classificação. */
  tagsFeedback: string;
  slots: string[];
  /** Períodos em que cada profissional está de plantão. */
  availability: Record<string, number[]>;
  actions: DossieAction[];
  events: DossieEvent[];
  endings: Record<PonteEnding, string[]>;
  /** Epílogo do final global (Modos 2 + 3). */
  globalEndings: Record<PonteEnding, string>;
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
  dossie?: DossieContent;
}
