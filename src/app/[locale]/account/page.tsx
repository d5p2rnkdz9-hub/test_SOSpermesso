import { CalendarClock, Library, MessageSquareText } from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { Link } from '@/i18n/navigation';
import { getProAccess } from '@/lib/pro-access';

import { AccountActions } from './AccountActions';

export const metadata: Metadata = {
  title: 'Il tuo account — SOS Permesso PRO',
  robots: { index: false },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const access = await getProAccess(await headers());
  if (access.status !== 'active') {
    redirect(`/${locale}/accedi?da=${encodeURIComponent(`/${locale}/account`)}`);
  }
  const { user } = access.session;
  const since = new Date(user.createdAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <ContentColumn>
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">Il tuo account</h1>

      <dl className="mt-6 flex flex-col gap-3 rounded-lg border-2 border-foreground bg-card p-5 text-sm shadow-[3px_3px_0_hsl(var(--foreground))]">
        <div>
          <dt className="font-semibold text-foreground">Email</dt>
          <dd className="text-muted-foreground">{user.email}</dd>
        </div>
        {user.name && (
          <div>
            <dt className="font-semibold text-foreground">Nome</dt>
            <dd className="text-muted-foreground">{user.name}</dd>
          </div>
        )}
        <div>
          <dt className="font-semibold text-foreground">Iscritto dal</dt>
          <dd className="text-muted-foreground">{since}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Accesso PRO</dt>
          <dd className="text-muted-foreground">
            Attivo e gratuito durante il periodo di lancio. Ti avviseremo via email prima di
            qualsiasi cambiamento.
          </dd>
        </div>
      </dl>

      <nav className="mt-6 flex flex-col gap-3" aria-label="Strumenti PRO">
        <Link
          href="/account/pratiche"
          className="flex items-center justify-between rounded-lg border-2 border-foreground bg-primary px-5 py-4 text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))]"
        >
          <span>
            <span className="block font-extrabold">Scadenziario</span>
            <span className="block text-sm opacity-90">Le pratiche che segui, con avviso email a 90, 60 e 30 giorni</span>
          </span>
          <CalendarClock className="h-6 w-6 shrink-0" aria-hidden="true" />
        </Link>
        <Link
          href="/pro/circolari"
          className="flex items-center justify-between rounded-lg border-2 border-foreground bg-card px-5 py-4 text-foreground shadow-[3px_3px_0_hsl(var(--foreground))]"
        >
          <span>
            <span className="block font-extrabold">Archivio circolari</span>
            <span className="block text-sm text-muted-foreground">Oltre 1.900 documenti con ricerca nel testo e avvisi sulle novità</span>
          </span>
          <Library className="h-6 w-6 shrink-0" aria-hidden="true" />
        </Link>
        <Link
          href="/pro/assistente"
          className="flex items-center justify-between rounded-lg border-2 border-foreground bg-card px-5 py-4 text-foreground shadow-[3px_3px_0_hsl(var(--foreground))]"
        >
          <span>
            <span className="block font-extrabold">Assistente PRO</span>
            <span className="block text-sm text-muted-foreground">Descrivi il caso: cerca nelle circolari e risponde con le fonti</span>
          </span>
          <MessageSquareText className="h-6 w-6 shrink-0" aria-hidden="true" />
        </Link>
      </nav>

      <AccountActions locale={locale} />
    </ContentColumn>
  );
}
