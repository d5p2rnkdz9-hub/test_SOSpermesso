'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LANGUAGE_NAMES: Record<string, string> = {
  it: 'Italiano',
  ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
  fr: 'Fran\u00e7ais',
  en: 'English',
  es: 'Espa\u00f1ol',
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
      className="min-h-[48px] rounded-md border border-foreground bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {LANGUAGE_NAMES[loc] ?? loc}
        </option>
      ))}
    </select>
  );
}
