-- Area PRO: conversazioni del chatbot professionale (src/lib/chat-pro.ts).
-- Ogni messaggio API (anche i turni interni tool_use / tool_result) è salvato
-- com'è in `blocchi`, così la conversazione si può riprendere senza riscrivere
-- la storia; `testo` è la sola parte mostrata nell'interfaccia (NULL per i
-- turni interni).

CREATE TABLE IF NOT EXISTS pro.chat_conversazione (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
  titolo      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_conversazione_user_idx ON pro.chat_conversazione (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS pro.chat_messaggio (
  id                bigserial PRIMARY KEY,
  conversazione_id  uuid NOT NULL REFERENCES pro.chat_conversazione(id) ON DELETE CASCADE,
  ruolo             text NOT NULL CHECK (ruolo IN ('user', 'assistant')),
  testo             text,                 -- parte visibile (NULL = turno interno)
  blocchi           jsonb NOT NULL,       -- content blocks API, replay fedele
  fonti             jsonb,                -- [{id, titolo}] circolari lette/citate (solo assistant)
  usage             jsonb,                -- usage API dell'ultimo giro (solo assistant)
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messaggio_conv_idx ON pro.chat_messaggio (conversazione_id, id);
CREATE INDEX IF NOT EXISTS chat_messaggio_quota_idx ON pro.chat_messaggio (created_at) WHERE ruolo = 'user' AND testo IS NOT NULL;
