export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://app.sospermesso.it';

export const SITE_NAME = 'SOSpermesso';

export const SUPPORTED_OG_LOCALES = ['it', 'en', 'fr', 'es', 'bn'] as const;
export type OgLocale = (typeof SUPPORTED_OG_LOCALES)[number];

const OG_LOCALE_MAP: Record<OgLocale, string> = {
  it: 'it_IT',
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  bn: 'bn_BD',
};

export function ogLocale(locale: string): string {
  return (OG_LOCALE_MAP as Record<string, string>)[locale] ?? 'it_IT';
}
