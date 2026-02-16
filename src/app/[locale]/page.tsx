import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('welcome');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          {t('disclaimer')}
        </p>
      </div>
    </main>
  );
}
