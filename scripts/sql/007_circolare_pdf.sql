-- Area PRO: provenienza del PDF della circolare (verificata con data-pipeline/pdf_ufficiali/verify3.py).
-- pdf_ufficiale: true = PDF dell'ente (o copia Wayback del suo URL), pdf_url valorizzato;
--                false = solo fonte secondaria (immigrazione.biz, ASGI, siti terzi), nessun link;
--                null = nessun PDF abbinato.
ALTER TABLE pro.circolare ADD COLUMN IF NOT EXISTS pdf_fonte text;
ALTER TABLE pro.circolare ADD COLUMN IF NOT EXISTS pdf_ufficiale boolean;
