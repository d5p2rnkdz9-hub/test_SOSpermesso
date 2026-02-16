import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('error')}
        </p>
      </div>
    </main>
  );
}
