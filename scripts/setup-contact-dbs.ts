/**
 * Setup script for the 3 "Scrivici" Notion DBs.
 *
 * Notion API v2025-09 splits databases into one-or-more data sources.
 * Properties (schema) live on the data source, not on the database.
 *
 * - Removes all existing custom properties (keeps the title `Name`).
 * - Recreates the schema per the contattaci plan.
 *
 * Run with:
 *   npx tsx scripts/setup-contact-dbs.ts
 * (loads NOTION_API_KEY from .env.local automatically)
 */
import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.NOTION_API_KEY) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
}

if (!process.env.NOTION_API_KEY) {
  console.error('NOTION_API_KEY is required');
  process.exit(1);
}

const notion: any = new Client({ auth: process.env.NOTION_API_KEY });

const DB_IDS = {
  segnalaErrore: '2f47355e7f7f8072aedcf43229874199',
  problemaLegale: '30d7355e7f7f800cbee7c653dce65f1d',
  contribuisci: '2f47355e7f7f80a4bed8d867abec2271',
};

// Property schemas (excluding the auto-required `Name` title)
const SCHEMAS: Record<string, Record<string, unknown>> = {
  segnalaErrore: {
    'Tipo errore': {
      select: {
        options: [
          { name: 'Informazione sbagliata', color: 'red' },
          { name: 'Errore di traduzione', color: 'orange' },
          { name: 'Link rotto / problema tecnico', color: 'gray' },
        ],
      },
    },
    Lingua: {
      select: {
        options: [
          { name: 'it', color: 'green' },
          { name: 'en', color: 'blue' },
          { name: 'fr', color: 'purple' },
          { name: 'ar', color: 'pink' },
          { name: 'es', color: 'yellow' },
        ],
      },
    },
    'Dove trovato': { rich_text: {} },
    Descrizione: { rich_text: {} },
    Email: { email: {} },
    Data: { date: {} },
  },
  problemaLegale: {
    Situazione: {
      select: {
        options: [
          { name: 'Ho già un permesso e ho un problema', color: 'orange' },
          { name: 'Non so che permesso richiedere', color: 'blue' },
          { name: 'Diniego / problema con la questura', color: 'red' },
          { name: 'Altro', color: 'gray' },
        ],
      },
    },
    'Quale permesso': { rich_text: {} },
    Descrizione: { rich_text: {} },
    'Tempo in Italia': { rich_text: {} },
    Email: { email: {} },
    'Consenso dati': { checkbox: {} },
    Data: { date: {} },
  },
  contribuisci: {
    'Come contribuire': {
      select: {
        options: [
          { name: 'Avvocato / operatore legale', color: 'blue' },
          { name: 'Traduzioni', color: 'purple' },
          { name: 'Donazione', color: 'green' },
          { name: 'Diffusione / comunicazione', color: 'pink' },
          { name: 'Altro', color: 'gray' },
        ],
      },
    },
    'Raccontaci di te': { rich_text: {} },
    Email: { email: {} },
    Data: { date: {} },
  },
};

async function resetDb(dbId: string, schema: Record<string, unknown>) {
  // 1. Get the database to find its data source(s)
  const db: any = await notion.databases.retrieve({ database_id: dbId });
  const title = db.title?.[0]?.plain_text ?? '?';
  const dataSources = db.data_sources;
  if (!dataSources?.length) {
    throw new Error(`No data sources for DB ${dbId}`);
  }
  const dataSourceId = dataSources[0].id;
  console.log(`\n→ ${title} (${dbId})`);
  console.log(`  data source: ${dataSourceId}`);

  // 2. Get current properties on the data source
  const ds: any = await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  });

  // 3. Build update payload: nullify existing non-title props, add new schema
  const properties: Record<string, unknown> = {};

  for (const [name, prop] of Object.entries(ds.properties as Record<string, { type: string }>)) {
    if (prop.type === 'title') continue;
    properties[name] = null;
    console.log(`  - removing: ${name}`);
  }

  for (const [name, def] of Object.entries(schema)) {
    properties[name] = def;
    console.log(`  + adding:   ${name}`);
  }

  await notion.dataSources.update({
    data_source_id: dataSourceId,
    properties,
  });

  console.log(`  ✓ done`);
  return dataSourceId;
}

async function main() {
  const ids: Record<string, string> = {};
  ids.segnalaErrore = await resetDb(DB_IDS.segnalaErrore, SCHEMAS.segnalaErrore);
  ids.problemaLegale = await resetDb(DB_IDS.problemaLegale, SCHEMAS.problemaLegale);
  ids.contribuisci = await resetDb(DB_IDS.contribuisci, SCHEMAS.contribuisci);

  console.log('\nAll 3 DBs configured. Data source IDs:');
  console.log(JSON.stringify(ids, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
