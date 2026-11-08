-- Area PRO: profilo professionale compilato al primo accesso (/account/benvenuto).
-- Better Auth crea l'utente (auth."user") al primo click sul link magico;
-- questa riga è il passo "crea il tuo account": chi non ce l'ha viene
-- mandato al benvenuto prima della dashboard. Il nome resta in auth."user".name.

CREATE TABLE IF NOT EXISTS pro.profilo (
  user_id         text PRIMARY KEY REFERENCES auth."user"(id) ON DELETE CASCADE,
  tipo            text NOT NULL CHECK (tipo IN ('caf', 'patronato', 'sindacato', 'consulente', 'avvocato', 'associazione', 'pa', 'altro')),
  organizzazione  text,
  citta           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
