/**
 * Locale → translation-map loader.
 *
 * Italian is the source; for each non-IT locale we ship a flat JSON at
 * translations/{locale}.json. Next.js bundles these via static imports.
 * Missing locale = null (caller falls back to Italian).
 */

import type { TranslationMap } from './translateTree';

import en from '../../translations/en.json';
import fr from '../../translations/fr.json';
import es from '../../translations/es.json';
import ar from '../../translations/ar.json';
import fa from '../../translations/fa.json';
import ur from '../../translations/ur.json';
import ru from '../../translations/ru.json';
import tr from '../../translations/tr.json';
import zh from '../../translations/zh.json';
import bn from '../../translations/bn.json';

const MAPS: Record<string, TranslationMap | null> = {
  it: null, // tree is already IT, no swap needed
  en: en as TranslationMap,
  fr: fr as TranslationMap,
  es: es as TranslationMap,
  ar: ar as TranslationMap,
  fa: fa as TranslationMap,
  ur: ur as TranslationMap,
  ru: ru as TranslationMap,
  tr: tr as TranslationMap,
  zh: zh as TranslationMap,
  bn: bn as TranslationMap,
};

export function getTranslationMap(locale: string): TranslationMap | null {
  return MAPS[locale] ?? null;
}
