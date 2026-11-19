/**
 * Questionario PRO: data model.
 *
 * Separate from the public trees (src/types/tree.ts). The public questionnaire
 * speaks to migrants in plain language and reuses one outcome node for many
 * paths; the PRO one is for CAF, patronati, consulenti and lawyers, so every
 * outcome is specific to the path (e.g. famiglia → lavoro is not sustained by
 * the same norm as sussidiaria → lavoro) and carries sources.
 *
 * Italian only: the audience works in Italian offices.
 */

export interface ProNorma {
  /** "art. 6, c. 1, d.lgs. 286/1998" */
  estremi: string;
  /** What the rule says, in our words. */
  contenuto: string;
  /** Literal text copied from the verified source, or null. */
  citazione?: string | null;
  url?: string | null;
}

export interface ProSentenzaRif {
  /** "Cons. Stato, sez. III" */
  corte: string;
  /** ISO date, or year only when unknown. */
  data: string;
  numero: string;
  principio: string;
  esito?: 'favorevole' | 'sfavorevole' | 'misto' | null;
  url?: string | null;
}

export interface ProPrassiRif {
  ente: string;
  estremi: string;
  data?: string | null;
  oggetto: string;
  url?: string | null;
}

export interface ProCasoLimite {
  titolo: string;
  testo: string;
}

export type ProVerdetto =
  | 'possibile'
  | 'condizionato'
  | 'incerto'
  | 'non_possibile'
  | 'non_necessaria';

export interface ProEsito {
  verdetto: ProVerdetto;
  titolo: string;
  /** Professional summary, references inline. Light markdown (**bold**, links). */
  sintesi: string;
  requisiti?: string[];
  procedura?: string;
  /** Who is still under the previous rules and why. */
  regimeTransitorio?: string | null;
  norme?: ProNorma[];
  giurisprudenza?: ProSentenzaRif[];
  prassi?: ProPrassiRif[];
  casiLimite?: ProCasoLimite[];
  /** Facts to check with the client before relying on the outcome. */
  verifiche?: { domanda: string; perche: string }[];
  /** Background shared by several outcomes (e.g. common UE long-term requirements). */
  approfondimenti?: { titolo: string; testo: string }[];
}

export interface ProQuestionNode {
  id: string;
  type: 'question';
  domanda: string;
  /** Short label for the path recap. */
  breve?: string;
  /** Why the question matters legally (shown in a "Perché conta" box). */
  nota?: string;
  /** Norms the criterion rests on, shown under the note. */
  riferimenti?: string[];
}

export interface ProResultNode {
  id: string;
  type: 'result';
  esito: ProEsito;
}

export type ProNode = ProQuestionNode | ProResultNode;

export interface ProEdge {
  from: string;
  to: string;
  label: string;
  optionKey: string;
  /** Optional hint under the option (e.g. which permits it includes). */
  descrizione?: string;
}

export interface ProTree {
  /** URL segment: /pro/questionario/{id} */
  id: string;
  titolo: string;
  descrizione: string;
  /** "2026-11-19" */
  aggiornatoAl: string;
  /** Disciplina applicata, shown in the header. */
  regime: string;
  /** Not yet validated by a lawyer. */
  bozza: boolean;
  startNodeId: string;
  nodes: Record<string, ProNode>;
  edges: ProEdge[];
}

/** Hub entry: modules not yet built are listed as coming soon. */
export interface ProModulo {
  id: string;
  titolo: string;
  descrizione: string;
  disponibile: boolean;
}
