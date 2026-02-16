import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['it', 'ar', 'fr', 'en', 'es'],
  defaultLocale: 'it',
  localePrefix: 'always',
});
