#!/usr/bin/env node
/**
 * Importa in Neon (pro.circolare) il corpus esportato dal SQLite del sito:
 *
 *   cd ../Sito_Nuovo && python3 data-pipeline/export_circolari_pro.py   # → app/.cache/circolari-pro.json
 *   cd ../app && node --env-file=.env.local scripts/import-circolari.mjs [--prod]
 *
 * Upsert per id: i documenti nuovi prendono importata_at = now() (è la data
 * che alimenta gli avvisi email), quelli esistenti aggiornano solo i campi
 * e aggiornata_at. Niente viene cancellato: un documento sparito dalla fonte
 * resta consultabile.
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
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'circolari-pro.json');
const docs = JSON.parse(readFileSync(file, 'utf-8'));
console.log(`[import-circolari] ${docs.length} documenti → ${prod ? 'PRODUZIONE' : 'dev'}`);

const COLS = [
  'id', 'fonte', 'slug_pubblico', 'source_url', 'pdf_url', 'tipo', 'ente', 'numero', 'data',
  'titolo', 'oggetto', 'tema', 'permessi', 'trasversale', 'fuori_ambito', 'testo', 'testo_piano',
];
const UPDATE = COLS.filter((c) => c !== 'id').map((c) => `${c} = EXCLUDED.${c}`).join(', ');
const BATCH = 100;

const client = new pg.Client({ connectionString: url });
await client.connect();
let inserted = 0;
let updated = 0;
try {
  for (let i = 0; i < docs.length; i += BATCH) {
    const chunk = docs.slice(i, i + BATCH);
    const values = [];
    const placeholders = chunk.map((d, j) => {
      const base = j * COLS.length;
      values.push(
        d.id, d.fonte, d.slug_pubblico, d.source_url, d.pdf_url, d.tipo, d.ente, d.numero, d.data,
        d.titolo, d.oggetto, d.tema, d.permessi, d.trasversale, d.fuori_ambito,
        JSON.stringify(d.testo), d.testo.join('\n\n'),
      );
      return `(${COLS.map((_, k) => `$${base + k + 1}`).join(', ')})`;
    });
    const { rows } = await client.query(
      `INSERT INTO pro.circolare (${COLS.join(', ')}) VALUES ${placeholders.join(', ')}
       ON CONFLICT (id) DO UPDATE SET ${UPDATE}, aggiornata_at = now()
       RETURNING (xmax = 0) AS inserted`,
      values,
    );
    for (const r of rows) r.inserted ? inserted++ : updated++;
  }
  const { rows } = await client.query('SELECT count(*)::int AS n FROM pro.circolare');
  console.log(`[import-circolari] inseriti ${inserted}, aggiornati ${updated}, totale in tabella ${rows[0].n}`);
} finally {
  await client.end();
}
