import { ExternalLink, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { CircolareCard, TipoBadge, formatDateIt } from '@/components/pro/CircolareCard';
import { Link } from '@/i18n/navigation';
import { fromUrlId, getCircolare, getCollegate } from '@/lib/circolari';
import { permitsBySlug } from '@/lib/permits-list.generated';
import { getProAccess } from '@/lib/pro-access';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const docId = fromUrlId(id);
  const access = await getProAccess(await headers());
  const doc = docId && access.status === 'active' ? await getCircolare(docId) : null;
  return {
    title: doc ? `${doc.titolo} — SOS Permesso PRO` : 'Circolare — SOS Permesso PRO',
    robots: { index: false },
  };
}

export default async function CircolarePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const docId = fromUrlId(id);
  if (!docId) notFound();

  const access = await getProAccess(await headers());
  if (access.status !== 'active') {
    redirect(`/${locale}/accedi?da=${encodeURIComponent(`/${locale}/pro/circolari/${id}`)}`);
  }

  const doc = await getCircolare(docId);
  if (!doc) notFound();
  const collegate = await getCollegate(doc);
  const permessi = doc.permessi.filter((s) => permitsBySlug[s]);

  return (
    <ContentColumn>
      <p className="mb-3 text-xs">
        <Link href="/pro/circolari" className="text-muted-foreground underline">
          ← Archivio circolari
        </Link>
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <TipoBadge tipo={doc.tipo} />
        {doc.ente && <span className="font-semibold text-foreground">{doc.ente}</span>}
        <span>{formatDateIt(doc.data)}</span>
      </div>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight text-foreground">{doc.oggetto ?? doc.titolo}</h1>
      {doc.oggetto && (
        <p className="mt-1 text-sm text-muted-foreground">
          {doc.titolo.split(':')[0]}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg border-2 border-foreground bg-card p-4 text-sm shadow-[3px_3px_0_hsl(var(--foreground))]">
        {doc.numero && (
          <>
            <dt className="font-semibold text-foreground">Numero</dt>
            <dd className="text-muted-foreground">{doc.numero}</dd>
          </>
        )}
        {doc.tema && (
          <>
            <dt className="font-semibold text-foreground">Tema</dt>
            <dd className="text-muted-foreground">{doc.tema}</dd>
          </>
        )}
        {permessi.length > 0 && (
          <>
            <dt className="font-semibold text-foreground">Permessi</dt>
            <dd className="flex flex-wrap gap-1.5">
              {permessi.map((s) => (
                <a
                  key={s}
                  href={`https://www.sospermesso.it/permesso-${s}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
                >
                  {permitsBySlug[s].titolo}
                </a>
              ))}
            </dd>
          </>
        )}
        <dt className="font-semibold text-foreground">Fonte</dt>
        <dd className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
          {doc.sourceUrl ? (
            <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
              {doc.fonte} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ) : (
            <span>{doc.fonte}</span>
          )}
          {doc.pdfUrl && (
            <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
              PDF originale <FileText className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          {doc.slugPubblico && (
            <a
              href={`https://www.sospermesso.it/${doc.slugPubblico}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              pagina pubblica <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </dd>
      </dl>

      <article className="mt-6 flex flex-col gap-3 text-[15px] leading-relaxed text-foreground">
        {doc.testo.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </article>

      <p className="mt-6 text-xs text-muted-foreground">
        Testo estratto automaticamente dalla fonte: per l&apos;uso in atti verificare sull&apos;originale.
      </p>

      {collegate.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {permessi.length ? 'Sullo stesso permesso' : 'Dello stesso ente'}
          </h2>
          <ul className="flex flex-col gap-3">
            {collegate.map((c) => (
              <CircolareCard key={c.id} doc={c} />
            ))}
          </ul>
        </section>
      )}
    </ContentColumn>
  );
}
