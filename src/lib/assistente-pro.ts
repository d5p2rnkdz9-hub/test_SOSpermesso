/**
 * Assistente PRO (chatbot con strumenti su circolari e schede): SOSPESO dal 16/11/2026.
 * Le risposte non erano affidabili (norme mai lette, circolari superate, testi troncati):
 * analisi e lavoro da fare in `docs/PRO-AREA-PIANO.md` §3 e `.planning/chatbot-qualita/`.
 * Nell'area PRO resta il chatbot gratuito del sito (widget su www.sospermesso.it).
 *
 * Spento per default: si riaccende solo con CHATBOT_PRO_ENABLED=1 (per i test in locale).
 * Il codice (`chat-pro.ts`, route `/api/pro/chat`, pagina `/pro/assistente`) resta com'è.
 */
export const ASSISTENTE_PRO_ATTIVO = process.env.CHATBOT_PRO_ENABLED === '1';

/** Dove sta il chatbot gratuito (widget in basso a destra in ogni pagina italiana del sito). */
export const CHATBOT_FREE_URL = 'https://www.sospermesso.it/';
