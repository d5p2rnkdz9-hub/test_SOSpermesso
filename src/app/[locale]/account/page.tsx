import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { ContentColumn } from '@/components/layout/ContentColumn';
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

      <AccountActions locale={locale} />
    </ContentColumn>
  );
}
