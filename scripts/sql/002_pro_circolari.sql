-- Area PRO: corpus completo circolari/normativa/prassi (entrambe le fonti del
-- SQLite del sito) con ricerca full-text, permessi seguiti e avvisi inviati.

CREATE TABLE IF NOT EXISTS pro.circolare (
  id             text PRIMARY KEY,                 -- 'biz:123' | 'pds:909'
  fonte          text NOT NULL,                    -- immigrazione.biz | permessidisoggiorno.info
  slug_pubblico  text,                             -- 'circolare-123' se esiste la pagina pubblica sul sito
  source_url     text,
  pdf_url        text,
  tipo           text NOT NULL DEFAULT 'Circolare',-- Circolare | Sentenza | Messaggio | Decreto ...
  ente           text,
  numero         text,
  data           date,
  titolo         text NOT NULL,
  oggetto        text,
  tema           text,
  permessi       text[] NOT NULL DEFAULT '{}',     -- slug sospermesso.it (da classificazione.json)
  trasversale    boolean NOT NULL DEFAULT false,
  fuori_ambito   boolean NOT NULL DEFAULT false,
  testo          jsonb NOT NULL,                   -- array di paragrafi (rendering)
  testo_piano    text NOT NULL,                    -- paragrafi uniti (ricerca, chatbot)
  testo_tsv      tsvector GENERATED ALWAYS AS (
                   setweight(to_tsvector('italian', coalesce(titolo, '')), 'A') ||
                   setweight(to_tsvector('italian', coalesce(oggetto, '')), 'B') ||
                   setweight(to_tsvector('italian', testo_piano), 'C')
                 ) STORED,
  importata_at   timestamptz NOT NULL DEFAULT now(), -- prima comparsa nel corpus (per gli avvisi)
  aggiornata_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS circolare_tsv_idx ON pro.circolare USING gin (testo_tsv);
CREATE INDEX IF NOT EXISTS circolare_permessi_idx ON pro.circolare USING gin (permessi);
CREATE INDEX IF NOT EXISTS circolare_data_idx ON pro.circolare (data DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS circolare_importata_idx ON pro.circolare (importata_at DESC);

-- Permessi seguiti per gli avvisi email sulle nuove circolari ('*' = tutte).
CREATE TABLE IF NOT EXISTS pro.segue_permesso (
  user_id        text NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
  permesso_slug  text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permesso_slug)
);

-- Avvisi già mandati (una riga per utente e circolare): il digest non ripete.
CREATE TABLE IF NOT EXISTS pro.circolare_avviso (
  user_id        text NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
  circolare_id   text NOT NULL REFERENCES pro.circolare(id) ON DELETE CASCADE,
  inviato_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, circolare_id)
);
