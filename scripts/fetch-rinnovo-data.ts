#!/usr/bin/env npx tsx
/**
 * Fetches permit renewal (rinnovo) data from Notion "Database IT"
 * and writes structured TypeScript data to src/lib/rinnovo-notion-data.generated.ts
 *
 * Usage:
 *   NOTION_API_KEY=ntn_xxx npx tsx scripts/fetch-rinnovo-data.ts
 *
 * The Notion API key is the same one used in the Sito_Nuovo project.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = '3097355e7f7f819caf33d0fd0739cc5b';
const NOTION_VERSION = '2022-06-28';
const OUTPUT_PATH = join(__dirname, '..', 'src', 'lib', 'rinnovo-notion-data.generated.ts');

if (!NOTION_API_KEY) {
  console.error('Error: NOTION_API_KEY env var is required');
  console.error('Usage: NOTION_API_KEY=ntn_xxx npx tsx scripts/fetch-rinnovo-data.ts');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Notion permit name → short tree key mapping
//
// These keys are used as nodeId suffixes in the rinnovo tree (r_end_<key>).
// Permits sharing the same tree key will be grouped in the UI.
// ---------------------------------------------------------------------------

const PERMIT_KEY_MAP: Record<string, string> = {
  // ── Lavoro ──
  'Lavoro subordinato (dopo ingresso con visto per "flussi")': 'lav_sub_flussi',
  'Lavoro subordinato (conversione da altro permesso)': 'lav_sub_conv',
  'Lavoro autonomo (dopo ingresso con visto per "flussi")': 'lav_aut_flussi',
  'Lavoro autonomo (conversione da altro permesso)': 'lav_aut_conv',
  'Lavoro subordinato stagionale (dopo ingresso con visto per "flussi stagionali")': 'stagionale',
  'Attesa occupazione': 'att_occ',
  'Tirocinio': 'tirocinio',

  // ── Studio ──
  'Studio (dopo ingresso con visto)': 'studio_visto',
  'Studio (conversione da altro permesso)': 'studio_conv',

  // ── Famiglia ──
  'Famiglia - genitore di cittadino italiano': 'fam_genitore_ita',
  'Famiglia - dopo ingresso con visto per ricongiungimento familiare': 'fam_ricong',
  'Famiglia - senza nullaosta per ricongiungimento ("coesione familiare")': 'fam_coesione',
  'Famiglia - convivente con parente cittadino italiano entro il secondo grado': 'fam_convivente_ita',
  'FAMIT per familiari di cittadini italiani "statici"': 'famit_statici',
  'Carta di soggiorno per familiari di italiani "dinamici"': 'carta_fam_ita',
  'Carta di soggiorno per familiari di cittadini UE': 'carta_fam_ue',
  'Figlio minore di più di 14 anni che vive con i genitori': 'figlio_14',
  'Famigliari di persone con status di rifugiato o protezione sussidiaria': 'fam_rifugiato',
  'Affidamento a familiari entro il quarto grado': 'affidamento',
  'Assistenza minore ("Articolo 31")': 'ass_minori',

  // ── Protezione ──
  'Asilo (status rifugiato)': 'asilo',
  'Protezione sussidiaria': 'prot_suss',
  'Protezione speciale dopo decisione positiva della Commissione o del Tribunale': 'prot_spec',
  'Richiesta Asilo': 'rich_asilo',
  'Protezione sociale vittime di violenza domestica': 'prot_soc_violenza',
  'Protezione sociale vittime di tratta': 'prot_soc_tratta',
  'Sfruttamento lavorativo': 'sfruttamento',
  'Calamità naturale': 'calamita',
  'Minore età (per MSNA)': 'minore',
  'Integrazione ("Prosieguo amministrativo")': 'prosieguo',

  // ── Salute ──
  'Cure mediche dopo ingresso con visto per cure mediche': 'cure_visto',
  'Cure mediche per persona gravemente malata che si trova già in Italia': 'cure_grave',
  'Cure mediche - padre di bambino minore di 6 mesi o che sta per nascere in Italia': 'cure_padre',
  'Cure mediche - donna in stato di gravidanza o con figlio minore di 6 mesi': 'cure_gravidanza',

  // ── Altro ──
  'Attività sportiva': 'sportiva',
  'Lavoro artistico': 'artistico',
  'Motivi religiosi': 'religiosi',
  'Ricerca scientifica': 'ricerca',
  'Residenza elettiva': 'res_elettiva',
  'Apolidia': 'apolidia',
  'UE per soggiornanti di lungo periodo ("Carta di soggiorno")': 'carta_ue',
};

// ---------------------------------------------------------------------------
// Notion API helpers
// ---------------------------------------------------------------------------

async function queryDatabase(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Notion API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return pages;
}

// ---------------------------------------------------------------------------
// Property extractors
// ---------------------------------------------------------------------------

interface NotionPage {
  properties: Record<string, any>;
}

function getTitle(page: NotionPage): string {
  const arr = page.properties['Nome permesso']?.title ?? [];
  return arr.map((t: any) => t.plain_text).join('') || '';
}

/** Normalize curly/smart quotes to straight quotes for reliable matching */
function normalizeQuotes(s: string): string {
  return s.replace(/[\u201c\u201d\u201e\u201f\u00ab\u00bb]/g, '"').replace(/[\u2018\u2019\u201a\u201b]/g, "'");
}

function getSelect(page: NotionPage, prop: string): string {
  return page.properties[prop]?.select?.name ?? '';
}

function getMultiSelect(page: NotionPage, prop: string): string[] {
  return (page.properties[prop]?.multi_select ?? []).map((o: any) => o.name);
}

function getRichText(page: NotionPage, prop: string): string {
  const arr = page.properties[prop]?.rich_text ?? [];
  return arr.map((t: any) => t.plain_text).join('');
}

function getCheckbox(page: NotionPage, prop: string): boolean {
  return page.properties[prop]?.checkbox ?? false;
}

// ---------------------------------------------------------------------------
// Process permits
// ---------------------------------------------------------------------------

interface RinnovoPermit {
  notionName: string;
  treeKey: string;
  category: string;
  duration: string;
  rinnovoNonApplicabile: boolean;
  modRinnovo: string[];
  docRinnovo: string[];
  infoExtra: string;
  possoConvertire: string;
}

function processPage(page: NotionPage): RinnovoPermit | null {
  const name = getTitle(page);
  if (!name) return null; // skip empty rows

  // Normalize curly quotes from Notion for reliable key lookup
  const normalized = normalizeQuotes(name);
  const treeKey = PERMIT_KEY_MAP[name] ?? PERMIT_KEY_MAP[normalized];
  if (!treeKey) {
    console.warn(`  ⚠ No tree key mapping for: "${name}" — skipping`);
    return null;
  }

  return {
    notionName: normalized,
    treeKey,
    category: getSelect(page, 'Categoria'),
    duration: getSelect(page, 'Quanto dura?'),
    rinnovoNonApplicabile: getCheckbox(page, 'Rinnovo non applicabile'),
    modRinnovo: getMultiSelect(page, 'Mod rinnovo'),
    docRinnovo: getMultiSelect(page, 'Doc rinnovo'),
    infoExtra: getRichText(page, 'Info extra su doc rilascio/rinnovo'),
    possoConvertire: getRichText(page, 'posso convertire?'),
  };
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function escapeStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function generateTypeScript(permits: RinnovoPermit[]): string {
  // Sort by treeKey for stable output
  permits.sort((a, b) => a.treeKey.localeCompare(b.treeKey));

  const lines: string[] = [];

  lines.push(`/**`);
  lines.push(` * AUTO-GENERATED — do not edit manually.`);
  lines.push(` * Source: Notion "Database IT" (${DATABASE_ID})`);
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(` * Run: NOTION_API_KEY=ntn_xxx npx tsx scripts/fetch-rinnovo-data.ts`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`export interface RinnovoPermit {`);
  lines.push(`  /** Full name from Notion DB */`);
  lines.push(`  notionName: string;`);
  lines.push(`  /** Short key used in tree node IDs (r_end_<treeKey>) */`);
  lines.push(`  treeKey: string;`);
  lines.push(`  /** Notion category: Studio/Lavoro, Protezione, Cure Mediche, Motivi Familiari */`);
  lines.push(`  category: string;`);
  lines.push(`  /** How long the permit lasts */`);
  lines.push(`  duration: string;`);
  lines.push(`  /** True if renewal is explicitly marked as not applicable */`);
  lines.push(`  rinnovoNonApplicabile: boolean;`);
  lines.push(`  /** Renewal method: 'KIT', 'personalmente', 'n/a', 'rinnovabile previa conversione' */`);
  lines.push(`  modRinnovo: string[];`);
  lines.push(`  /** Documents required for renewal */`);
  lines.push(`  docRinnovo: string[];`);
  lines.push(`  /** Extra notes/warnings about renewal */`);
  lines.push(`  infoExtra: string;`);
  lines.push(`  /** Whether conversion is possible (free text from Notion) */`);
  lines.push(`  possoConvertire: string;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const rinnovoPermits: RinnovoPermit[] = [`);

  for (const p of permits) {
    lines.push(`  {`);
    lines.push(`    notionName: '${escapeStr(p.notionName)}',`);
    lines.push(`    treeKey: '${p.treeKey}',`);
    lines.push(`    category: '${escapeStr(p.category)}',`);
    lines.push(`    duration: '${escapeStr(p.duration)}',`);
    lines.push(`    rinnovoNonApplicabile: ${p.rinnovoNonApplicabile},`);
    lines.push(`    modRinnovo: [${p.modRinnovo.map(s => `'${escapeStr(s)}'`).join(', ')}],`);
    lines.push(`    docRinnovo: [`);
    for (const d of p.docRinnovo) {
      lines.push(`      '${escapeStr(d)}',`);
    }
    lines.push(`    ],`);
    if (p.infoExtra) {
      lines.push(`    infoExtra: '${escapeStr(p.infoExtra)}',`);
    } else {
      lines.push(`    infoExtra: '',`);
    }
    if (p.possoConvertire) {
      lines.push(`    possoConvertire: '${escapeStr(p.possoConvertire)}',`);
    } else {
      lines.push(`    possoConvertire: '',`);
    }
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);

  // Also export a lookup by treeKey for easy access
  lines.push(`/** Lookup by treeKey for quick access */`);
  lines.push(`export const rinnovoByKey: Record<string, RinnovoPermit> = Object.fromEntries(`);
  lines.push(`  rinnovoPermits.map(p => [p.treeKey, p]),`);
  lines.push(`);`);
  lines.push(``);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching permits from Notion...');
  const pages = await queryDatabase();
  console.log(`  Found ${pages.length} rows in Database IT`);

  const permits: RinnovoPermit[] = [];
  for (const page of pages) {
    const p = processPage(page);
    if (p) permits.push(p);
  }
  console.log(`  Mapped ${permits.length} permits (${pages.length - permits.length} skipped)`);

  // Summary
  console.log('\n--- Rinnovo Summary ---');
  const byMethod: Record<string, string[]> = {};
  for (const p of permits) {
    const method = p.modRinnovo.length > 0 ? p.modRinnovo.join('+') : '(empty)';
    (byMethod[method] ??= []).push(p.treeKey);
  }
  for (const [method, keys] of Object.entries(byMethod).sort()) {
    console.log(`  ${method}: ${keys.join(', ')}`);
  }

  // Write output
  const code = generateTypeScript(permits);
  writeFileSync(OUTPUT_PATH, code, 'utf-8');
  console.log(`\n✓ Wrote ${permits.length} permits to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
