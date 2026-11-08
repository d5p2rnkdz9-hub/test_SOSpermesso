-- Area PRO: un solo turno alla volta per conversazione (due schede aperte o un
-- doppio clic non devono intrecciare la storia API). Il "lucchetto" scade da solo
-- dopo 90 secondi, oltre il limite di 60 s delle funzioni Netlify.
ALTER TABLE pro.chat_conversazione ADD COLUMN IF NOT EXISTS in_corso_fino timestamptz;

-- Promemoria: stato "in_corso" per prenotare l'invio prima di spedire
-- (due esecuzioni del cron in parallelo non mandano la stessa email due volte).
ALTER TABLE pro.pratica_promemoria DROP CONSTRAINT IF EXISTS pratica_promemoria_esito_check;
ALTER TABLE pro.pratica_promemoria ADD CONSTRAINT pratica_promemoria_esito_check
  CHECK (esito IN ('inviato', 'saltato', 'errore', 'in_corso'));
