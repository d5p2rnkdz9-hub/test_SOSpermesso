-- Area PRO: accettazioni dell'accordo sul trattamento dei dati (art. 28 GDPR)
-- che sblocca lo scadenziario. Una riga per utente e versione: è la prova di
-- chi ha accettato cosa e quando (testo identificato dall'impronta SHA-256).
-- Le righe non si cancellano con le pratiche, solo con l'account.

CREATE TABLE IF NOT EXISTS pro.accordo_accettazione (
  user_id               text        NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
  versione              text        NOT NULL,
  testo_sha256          text        NOT NULL,
  email                 text        NOT NULL,
  ip                    text,
  user_agent            text,
  accettato_il          timestamptz NOT NULL DEFAULT now(),
  copia_inviata         boolean     NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, versione)
);
