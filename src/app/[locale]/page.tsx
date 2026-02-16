import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ContentColumn } from '@/components/layout/ContentColumn';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function WelcomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <WelcomeContent />;
}

function WelcomeContent() {
  const t = useTranslations('welcome');

  return (
    <ContentColumn>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          {t('title')}
        </h1>

        <p className="mt-4 text-lg text-foreground/80">
          {t('subtitle')}
        </p>

        <Button size="lg" className="mt-8 w-full text-lg font-semibold" asChild>
          <Link href="/tree">{t('start')}</Link>
        </Button>

        <p className="mt-6 text-sm text-foreground/60">
          {t('disclaimer')}
        </p>
      </div>
    </ContentColumn>
  );
}
