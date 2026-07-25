import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Scale, AlertTriangle, HeartHandshake, ChevronRight } from 'lucide-react';
import { ContentColumn } from '@/components/layout/ContentColumn';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContattaciPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact.landing');

  const options = [
    {
      href: '/contattaci/problema-legale' as const,
      Icon: Scale,
      title: t('problemaLegale_title'),
      desc: t('problemaLegale_desc'),
    },
    {
      href: '/contattaci/segnala-errore' as const,
      Icon: AlertTriangle,
      title: t('segnalaErrore_title'),
      desc: t('segnalaErrore_desc'),
    },
    {
      href: '/contattaci/contribuisci' as const,
      Icon: HeartHandshake,
      title: t('contribuisci_title'),
      desc: t('contribuisci_desc'),
    },
  ];

  return (
    <ContentColumn>
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">
        {t('title')}
      </h1>
      <p className="mt-3 mb-6 text-sm text-muted-foreground">{t('subtitle')}</p>

      <div className="space-y-4">
        {options.map(({ href, Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-lg border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_hsl(var(--foreground))] transition-all duration-150 hover:bg-[#FFF9CC] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_hsl(var(--foreground))]"
          >
            <span className="grid h-12 w-12 shrink-0 place-content-center rounded-lg border-2 border-foreground bg-primary">
              <Icon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block text-lg font-extrabold text-foreground">{title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{desc}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-foreground rtl:rotate-180" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </ContentColumn>
  );
}
