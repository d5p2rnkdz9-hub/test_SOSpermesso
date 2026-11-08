/** Tipi del chatbot PRO condivisi fra server (chat-pro.ts) e client (ChatPro.tsx). */

export interface Fonte {
  id: string;
  titolo: string;
}

export interface ConversazioneSummary {
  id: string;
  titolo: string;
  updatedAt: string;
}

export interface MessaggioView {
  id: number;
  ruolo: 'user' | 'assistant';
  testo: string;
  fonti: Fonte[];
  createdAt: string;
}

export type ChatEvent =
  | { t: 'meta'; conversazioneId: string }
  | { t: 'tool'; name: string; label: string }
  | { t: 'text'; d: string }
  | { t: 'done'; fonti: Fonte[] }
  | { t: 'error'; m: string };
