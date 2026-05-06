/**
 * Locale → translation-map loader.
 *
 * Italian is the source; for each non-IT locale we ship a flat JSON at
 * translations/{locale}.json — read at build time via static import so Next.js
 * bundles it for both server and client components.
 *
 * Missing locale = null (caller falls back to Italian).
 */

import type { TranslationMap } from './translateTree';

// Static imports — bundled by Next.js. Add more as locales are translated.
// Until a JSON exists for a locale, leave it null and the app gracefully falls
// back to Italian.
let enMap: TranslationMap | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  enMap = require('../../translations/en.json');
} catch {
  enMap = null;
}

const MAPS: Record<string, TranslationMap | null> = {
  it: null, // no translation needed; tree is already IT
  en: enMap,
  fr: null,
  es: null,
  ar: null,
  fa: null,
  ur: null,
  ru: null,
  tr: null,
  zh: null,
  bn: null,
};

export function getTranslationMap(locale: string): TranslationMap | null {
  return MAPS[locale] ?? null;
}
