import 'server-only';

import { getSQL } from './neon';
import { SEGUI_TUTTI, toUrlId } from './circolari-shared';
import { permitsBySlug } from './permits-list.generated';

export { SEGUI_TUTTI, toUrlId };

/**
 * Corpus PRO: circolari, note, messaggi, decreti e sentenze (1900+ documenti)
 * importati in pro.circolare da scripts/import-circolari.mjs. Ricerca
 * full-text Postgres (config 'italian') sulla colonna generata testo_tsv.
 * Usato dalle pagine /pro/circolari e dagli strumenti del chatbot PRO.
 */

export const PER_PAGE = 20;
export const MAX_QUERY = 200;

/** Marker dello snippet: il testo viene spezzato su questi in React, mai iniettato come HTML. */
export const HL_START = '\u0001';
export const HL_END = '\u0002';

export interface CircolareSummary {
  id: string;
  /** id usabile in URL: 'biz:123' → 'biz-123' */
  urlId: string;
  fonte: string;
  slugPubblico: string | null;
  tipo: string;
  ente: string | null;
  numero: string | null;
  /** YYYY-MM-DD */
  data: string | null;
  titolo: string;
  oggetto: string | null;
  permessi: string[];
  fuoriAmbito: boolean;
  /** Estratto con marker HL_START/HL_END intorno ai termini trovati (solo con query). */
  snippet: string | null;
}

export interface Circolare extends CircolareSummary {
  sourceUrl: string | null;
  pdfUrl: string | null;
  tema: string | null;
  testo: string[];
}

export interface SearchParams {
  q?: string;
  permesso?: string;
  ente?: string;
  tipo?: string;
  anno?: number;
  page?: number;
  perPage?: number;
}

export interface SearchResult {
  items: CircolareSummary[];
  total: number;
  page: number;
  pages: number;
}

export function fromUrlId(urlId: string): string | null {
  const m = /^(biz|pds)-(\d{1,8})$/.exec(urlId);
  return m ? `${m[1]}:${m[2]}` : null;
}

interface SummaryRow {
  id: string;
  fonte: string;
  slug_pubblico: string | null;
  tipo: string;
  ente: string | null;
  numero: string | null;
  data: string | null;
  titolo: string;
  oggetto: string | null;
  permessi: string[];
  fuori_ambito: boolean;
  snippet?: string | null;
  total?: number;
}

function toSummary(r: SummaryRow): CircolareSummary {
  return {
    id: r.id,
    urlId: toUrlId(r.id),
    fonte: r.fonte,
    slugPubblico: r.slug_pubblico,
    tipo: r.tipo,
    ente: r.ente,
    numero: r.numero,
    data: r.data,
    titolo: r.titolo,
    oggetto: r.oggetto,
    permessi: r.permessi ?? [],
    fuoriAmbito: r.fuori_ambito,
    snippet: r.snippet ?? null,
  };
}

const SUMMARY_COLS = `c.id, c.fonte, c.slug_pubblico, c.tipo, c.ente, c.numero,
  to_char(c.data, 'YYYY-MM-DD') AS data, c.titolo, c.oggetto, c.permessi, c.fuori_ambito`;

export function normalizeQuery(raw: string | undefined): string {
  return (raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY);
}

export async function searchCircolari(params: SearchParams): Promise<SearchResult> {
  const sql = getSQL();
  const q = normalizeQuery(params.q);
  const perPage = Math.min(Math.max(params.perPage ?? PER_PAGE, 1), 50);
  const page = Math.max(params.page ?? 1, 1);

  const where: string[] = [];
  const values: unknown[] = [];
  const add = (v: unknown) => {
    values.push(v);
    return `$${values.length}`;
  };

  let queryRef: string | null = null;
  if (q) {
    queryRef = add(q);
    where.push(`c.testo_tsv @@ websearch_to_tsquery('italian', ${queryRef})`);
  }
  if (params.permesso && Object.hasOwn(permitsBySlug, params.permesso)) {
    where.push(`${add(params.permesso)} = ANY(c.permessi)`);
  }
  if (params.ente) where.push(`c.ente = ${add(params.ente.slice(0, 120))}`);
  if (params.tipo) where.push(`c.tipo = ${add(params.tipo.slice(0, 60))}`);
  if (params.anno && params.anno >= 1990 && params.anno <= 2100) {
    where.push(`extract(year from c.data) = ${add(params.anno)}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = queryRef
    ? `ORDER BY ts_rank_cd(c.testo_tsv, websearch_to_tsquery('italian', ${queryRef})) DESC, c.data DESC NULLS LAST`
    : 'ORDER BY c.data DESC NULLS LAST, c.id';
  const limitRef = add(perPage);
  const offsetRef = add((page - 1) * perPage);

  // Lo snippet (ts_headline) è costoso: calcolato solo sulle righe della pagina.
  const snippetSql = queryRef
    ? `ts_headline('italian', c.testo_piano, websearch_to_tsquery('italian', ${queryRef}),
        'MaxFragments=2, MaxWords=22, MinWords=8, FragmentDelimiter= … , StartSel=${HL_START}, StopSel=${HL_END}') AS snippet`
    : 'NULL::text AS snippet';

  const rows = (await sql.query(
    `WITH pagina AS (
       SELECT c.id, count(*) OVER()::int AS total
       FROM pro.circolare c ${whereSql} ${orderSql}
       LIMIT ${limitRef} OFFSET ${offsetRef}
     )
     SELECT ${SUMMARY_COLS}, pagina.total, ${snippetSql}
     FROM pagina JOIN pro.circolare c ON c.id = pagina.id
     ${orderSql}`,
    values,
  )) as SummaryRow[];

  const total = rows[0]?.total ?? 0;
  return {
    items: rows.map(toSummary),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getCircolare(id: string): Promise<Circolare | null> {
  const sql = getSQL();
  const rows = (await sql.query(
    `SELECT ${SUMMARY_COLS}, c.source_url, c.pdf_url, c.tema, c.testo
     FROM pro.circolare c WHERE c.id = $1`,
    [id],
  )) as (SummaryRow & { source_url: string | null; pdf_url: string | null; tema: string | null; testo: string[] })[];
  const r = rows[0];
  if (!r) return null;
  return {
    ...toSummary(r),
    sourceUrl: r.source_url,
    pdfUrl: r.pdf_url,
    tema: r.tema,
    testo: Array.isArray(r.testo) ? r.testo : [],
  };
}

/** Documenti collegati: stesso permesso (se classificato), altrimenti stesso ente, più recenti. */
export async function getCollegate(doc: Circolare, limit = 5): Promise<CircolareSummary[]> {
  const sql = getSQL();
  const rows = (await sql.query(
    doc.permessi.length
      ? `SELECT ${SUMMARY_COLS} FROM pro.circolare c
         WHERE c.id <> $1 AND c.permessi && $2::text[] ORDER BY c.data DESC NULLS LAST LIMIT $3`
      : `SELECT ${SUMMARY_COLS} FROM pro.circolare c
         WHERE c.id <> $1 AND c.ente = $2 AND NOT c.fuori_ambito ORDER BY c.data DESC NULLS LAST LIMIT $3`,
    [doc.id, doc.permessi.length ? doc.permessi : doc.ente ?? '', limit],
  )) as SummaryRow[];
  return rows.map(toSummary);
}

export interface Facets {
  enti: { ente: string; n: number }[];
  tipi: { tipo: string; n: number }[];
  permessi: { slug: string; titolo: string; n: number }[];
  anni: { anno: number; n: number }[];
  totale: number;
}

export async function getFacets(): Promise<Facets> {
  const sql = getSQL();
  const rows = <T>(text: string) => sql.query(text) as Promise<T[]>;
  const [enti, tipi, permessi, anni, tot] = await Promise.all([
    rows<{ ente: string; n: number }>(
      `SELECT ente, count(*)::int AS n FROM pro.circolare WHERE ente IS NOT NULL
       GROUP BY ente ORDER BY n DESC, ente LIMIT 25`,
    ),
    rows<{ tipo: string; n: number }>(
      `SELECT tipo, count(*)::int AS n FROM pro.circolare GROUP BY tipo ORDER BY n DESC, tipo LIMIT 20`,
    ),
    rows<{ slug: string; n: number }>(
      `SELECT slug, count(*)::int AS n FROM pro.circolare c, unnest(c.permessi) AS slug GROUP BY slug ORDER BY n DESC`,
    ),
    rows<{ anno: number; n: number }>(
      `SELECT extract(year from data)::int AS anno, count(*)::int AS n FROM pro.circolare
       WHERE data IS NOT NULL GROUP BY 1 ORDER BY 1 DESC`,
    ),
    rows<{ n: number }>(`SELECT count(*)::int AS n FROM pro.circolare`),
  ]);
  return {
    enti,
    tipi,
    permessi: permessi
      .filter((p) => permitsBySlug[p.slug])
      .map((p) => ({ slug: p.slug, titolo: permitsBySlug[p.slug].titolo, n: p.n }))
      .sort((a, b) => a.titolo.localeCompare(b.titolo, 'it')),
    anni,
    totale: tot[0]?.n ?? 0,
  };
}

/* ---------- permessi seguiti (avvisi email) ---------- */

export async function listFollows(userId: string): Promise<string[]> {
  const sql = getSQL();
  const rows = (await sql.query('SELECT permesso_slug FROM pro.segue_permesso WHERE user_id = $1', [userId])) as {
    permesso_slug: string;
  }[];
  return rows.map((r) => r.permesso_slug);
}

export async function setFollows(userId: string, slugs: string[]): Promise<string[]> {
  const sql = getSQL();
  const clean = [...new Set(slugs.filter((s) => s === SEGUI_TUTTI || Object.hasOwn(permitsBySlug, s)))];
  await sql.query('DELETE FROM pro.segue_permesso WHERE user_id = $1 AND NOT (permesso_slug = ANY($2::text[]))', [
    userId,
    clean,
  ]);
  if (clean.length) {
    await sql.query(
      `INSERT INTO pro.segue_permesso (user_id, permesso_slug)
       SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING`,
      [userId, clean],
    );
  }
  return clean;
}
