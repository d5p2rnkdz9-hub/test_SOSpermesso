/**
 * PRO content lookup for outcome pages.
 *
 * Content is keyed by sospermesso.it permit slug (canonical, from the
 * site's permits-it cache). Outcome nodes map to site URLs via
 * permit-url-map; here we extract the slug from that URL and normalize
 * the few legacy aliases the map still uses (the site handles those via
 * Netlify redirects, so the link works but the slug differs).
 */

import { proContent } from './pro-content.generated';

export interface ProNorma {
  fonte: string;
  estremi: string;
  oggetto: string;
  url: string | null;
}

export interface ProSentenza {
  corte: string;
  estremi: string;
  data: string;
  massima: string;
  rilevanza_operativa: string;
  url_fonte: string | null;
  confidenza: string;
}

export interface ProCircolare {
  ente: string;
  estremi: string;
  data: string;
  oggetto: string;
  url: string | null;
}

export interface ProPermitContent {
  slug: string;
  titolo: string;
  aggiornato_al: string;
  sintesi: {
    descrizione: string;
    base_giuridica: string;
    requisiti: readonly string[];
    durata: string;
    rinnovo: string;
    convertibilita: string;
    note_operative: readonly string[];
  };
  norme: readonly ProNorma[];
  sentenze: readonly ProSentenza[];
  circolari: readonly ProCircolare[];
}

/** Legacy slug aliases used by permit-url-map → canonical site slugs. */
const SLUG_ALIASES: Record<string, string> = {
  'permesso-ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno':
    'ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno',
  'protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale':
    'protezione-speciale',
};

export const PRO_CONTENT_DRAFT: boolean = proContent.draft;

/** Extract the canonical permit slug from a sospermesso.it permit URL. */
export function slugFromPermitUrl(permitUrl: string): string | null {
  const match = permitUrl.match(/\/permesso-([^/#?]+)\.html/);
  if (!match) return null;
  const slug = match[1];
  return SLUG_ALIASES[slug] ?? slug;
}

export function getProContent(permitUrl: string | null): ProPermitContent | null {
  if (!permitUrl) return null;
  const slug = slugFromPermitUrl(permitUrl);
  if (!slug) return null;
  const permits = proContent.permits as Record<string, ProPermitContent | undefined>;
  return permits[slug] ?? null;
}
