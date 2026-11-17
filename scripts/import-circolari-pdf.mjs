#!/usr/bin/env node
/**
 * Aggiorna in Neon (pro.circolare) SOLO pdf_url, pdf_fonte e pdf_ufficiale:
 *
 *   cd ../Sito_Nuovo && python3 data-pipeline/export_circolari_pdf.py   # → app/.cache/circolari-pdf.json
 *   cd ../app && node --env-file=.env.local scripts/import-circolari-pdf.mjs [--prod]
 *
 * Applica prima scripts/sql/007_circolare_pdf.sql. Non tocca testo né altri campi,
 * non inserisce righe nuove.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const prod = process.argv.includes('--prod');
const url = prod ? process.env.NEON_DATABASE_URL_PROD : process.env.NEON_DATABASE_URL;
if (!url) {
  console.error(`Missing ${prod ? 'NEON_DATABASE_URL_PROD' : 'NEON_DATABASE_URL'}`);
  process.exit(1);
}
const dir = path.dirname(fileURLToPath(import.meta.url));
const docs = JSON.parse(readFileSync(path.join(dir, '..', '.cache', 'circolari-pdf.json'), 'utf-8'));
console.log(`[import-circolari-pdf] ${docs.length} righe → ${prod ? 'PRODUZIONE' : 'dev'}`);

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(readFileSync(path.join(dir, 'sql', '007_circolare_pdf.sql'), 'utf-8'));
  const { rowCount } = await client.query(
    `UPDATE pro.circolare c
        SET pdf_url = d.pdf_url, pdf_fonte = d.pdf_fonte, pdf_ufficiale = d.pdf_ufficiale
       FROM jsonb_to_recordset($1::jsonb) AS d(id text, pdf_url text, pdf_fonte text, pdf_ufficiale boolean)
      WHERE c.id = d.id`,
    [JSON.stringify(docs)],
  );
  const { rows } = await client.query(
    `SELECT count(*) FILTER (WHERE pdf_ufficiale) ::int AS ufficiale,
            count(*) FILTER (WHERE pdf_ufficiale = false) ::int AS secondaria,
            count(*) FILTER (WHERE pdf_ufficiale IS NULL) ::int AS nessuno
       FROM pro.circolare`,
  );
  console.log(`[import-circolari-pdf] aggiornate ${rowCount};`, rows[0]);
} finally {
  await client.end();
}
