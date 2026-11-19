/**
 * Assistente PRO (chatbot con strumenti su circolari e schede): SOSPESO dal 16/11/2026.
 * Le risposte non erano affidabili (norme mai lette, circolari superate, testi troncati):
 * analisi e lavoro da fare in `docs/PRO-AREA-PIANO.md` §3 e `.planning/chatbot-qualita/`.
 * Dal 19/11/2026 nell'area PRO c'è il chatbot «normale» (quello che era sul sito pubblico):
 * pagina `/pro/assistente` → `ChatBase.tsx` → `/api/pro/chat-base` → funzione Netlify `chat`
 * del sito, chiamata da server con il segreto CHATBOT_PROXY_SECRET (il sito non lo mostra più).
 *
 * Spento per default: si riaccende solo con CHATBOT_PRO_ENABLED=1 (per i test in locale).
 * Il codice (`chat-pro.ts`, route `/api/pro/chat`, pagina `/pro/assistente`) resta com'è.
 */
export const ASSISTENTE_PRO_ATTIVO = process.env.CHATBOT_PRO_ENABLED === '1';

/** Funzione Netlify del sito che risponde con la base di conoscenza delle schede permesso. */
export const CHATBOT_BASE_ENDPOINT =
  process.env.CHATBOT_BASE_ENDPOINT || 'https://www.sospermesso.it/.netlify/functions/chat';

/** Turni per conversazione e lunghezza massima di una domanda: gli stessi limiti della funzione del sito. */
export const CHATBOT_BASE_MAX_TURNS = 10;
export const CHATBOT_BASE_MAX_CHARS = 1000;
