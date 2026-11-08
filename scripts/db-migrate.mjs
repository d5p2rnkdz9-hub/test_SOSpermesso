#!/usr/bin/env node
/**
 * Applies scripts/sql/*.sql in name order, once each, recording them in
 * pro.schema_migration. Every file must be idempotent anyway (IF NOT EXISTS).
 *
 *   node --env-file=.env.local scripts/db-migrate.mjs          # Neon branch "dev"
 *   node --env-file=.env.local scripts/db-migrate.mjs --prod   # NEON_DATABASE_URL_PROD
 *
 * Better Auth's own tables (schema auth) are NOT handled here: run
 * `npx @better-auth/cli migrate` for those (see docs/PRO-DEPLOY.md).
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const prod = process.argv.includes('--prod');
const url = prod ? process.env.NEON_DATABASE_URL_PROD : process.env.NEON_DATABASE_URL;
if (!url) {
  console.error(`Missing ${prod ? 'NEON_DATABASE_URL_PROD' : 'NEON_DATABASE_URL'}`);
  process.exit(1);
}
const host = new URL(url).host;
console.log(`[db-migrate] target: ${prod ? 'PRODUZIONE' : 'dev'} (${host})`);

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'sql');
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query('CREATE SCHEMA IF NOT EXISTS pro');
  await client.query(
    'CREATE TABLE IF NOT EXISTS pro.schema_migration (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  const { rows } = await client.query('SELECT name FROM pro.schema_migration');
  const done = new Set(rows.map((r) => r.name));
  for (const file of files) {
    if (done.has(file)) {
      console.log(`[db-migrate] ok   ${file}`);
      continue;
    }
    const sql = readFileSync(path.join(dir, file), 'utf-8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO pro.schema_migration (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[db-migrate] done ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[db-migrate] FAIL ${file}: ${err.message}`);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await client.end();
}
