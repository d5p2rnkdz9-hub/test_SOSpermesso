'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LANGUAGE_NAMES: Record<string, string> = {
  it: '\uD83C\uDDEE\uD83C\uDDF9 Italiano',
  ar: '\uD83C\uDDF8\uD83C\uDDE6 \u0627\u0644\u0639\u0631\u0628\u064a\u0629',
  fr: '\uD83C\uDDEB\uD83C\uDDF7 Fran\u00e7ais',
  en: '\uD83C\uDDEC\uD83C\uDDE7 English',
  es: '\uD83C\uDDEA\uD83C\uDDF8 Espa\u00f1ol',
  tr: '\uD83C\uDDF9\uD83C\uDDF7 T\u00fcrk\u00e7e',
  bn: '\uD83C\uDDE7\uD83C\uDDE9 \u09AC\u09BE\u0982\u09B2\u09BE',
  ru: '\uD83C\uDDF7\uD83C\uDDFA \u0420\u0443\u0441\u0441\u043A\u0438\u0439',
  ur: '\uD83C\uDDF5\uD83C\uDDF0 \u0627\u0631\u062F\u0648',
  fa: '\uD83C\uDDEE\uD83C\uDDF7 \u0641\u0627\u0631\u0633\u06CC',
  zh: '\uD83C\uDDE8\uD83C\uDDF3 \u4E2D\u6587',
};

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = event.target.value;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      aria-label="Select language"
      className="min-h-[48px] rounded-md border border-border bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {LANGUAGE_NAMES[loc] ?? loc}
        </option>
      ))}
    </select>
  );
}
