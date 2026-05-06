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
function tryLoad(rel: string): TranslationMap | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(rel);
  } catch {
    return null;
  }
}

const MAPS: Record<string, TranslationMap | null> = {
  it: null, // no translation needed; tree is already IT
  en: tryLoad('../../translations/en.json'),
  fr: tryLoad('../../translations/fr.json'),
  es: tryLoad('../../translations/es.json'),
  ar: tryLoad('../../translations/ar.json'),
  fa: tryLoad('../../translations/fa.json'),
  ur: tryLoad('../../translations/ur.json'),
  ru: tryLoad('../../translations/ru.json'),
  tr: tryLoad('../../translations/tr.json'),
  zh: tryLoad('../../translations/zh.json'),
  bn: tryLoad('../../translations/bn.json'),
};

export function getTranslationMap(locale: string): TranslationMap | null {
  return MAPS[locale] ?? null;
}
