-- Area PRO: registro degli invii del link di accesso, per indirizzo.
-- Il limite di frequenza di Better Auth conta per IP; questo conta per
-- destinatario, così nessuno può riempire la casella di un altro (o la quota
-- Resend) cambiando IP. Si salva l'impronta SHA-256 dell'email, non l'email.
-- Finché la tabella non esiste il login funziona lo stesso, senza tetto.

CREATE TABLE IF NOT EXISTS pro.accesso_invio (
  email_hash  text        NOT NULL,
  inviato_il  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS accesso_invio_email_idx
  ON pro.accesso_invio (email_hash, inviato_il DESC);
