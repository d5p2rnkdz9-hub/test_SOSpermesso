-- Area PRO: scadenziario pratiche per operatori (CAF, consulenti, sindacati).
-- Applicata da scripts/db-migrate.mjs (idempotente).

CREATE SCHEMA IF NOT EXISTS pro;

CREATE TABLE IF NOT EXISTS pro.pratica (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
  riferimento     text NOT NULL,            -- nome o sigla con cui l'operatore riconosce la persona
  permesso_slug   text NOT NULL,            -- slug sospermesso.it (permits-list.generated.ts)
  permesso_titolo text NOT NULL,            -- snapshot del titolo al momento dell'inserimento
  scadenza        date NOT NULL,
  note            text,
  archiviata      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pratica_user_idx ON pro.pratica (user_id, archiviata, scadenza);
CREATE INDEX IF NOT EXISTS pratica_scadenza_idx ON pro.pratica (scadenza) WHERE NOT archiviata;

-- Un record per (pratica, soglia in giorni): 'inviato' = email partita,
-- 'saltato' = soglia già superata quando è scattata una più vicina.
CREATE TABLE IF NOT EXISTS pro.pratica_promemoria (
  pratica_id  uuid NOT NULL REFERENCES pro.pratica(id) ON DELETE CASCADE,
  giorni      integer NOT NULL,
  esito       text NOT NULL CHECK (esito IN ('inviato', 'saltato', 'errore')),
  dettaglio   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pratica_id, giorni)
);
