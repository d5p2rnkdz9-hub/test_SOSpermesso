import { Search } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { CircolareCard } from '@/components/pro/CircolareCard';
import { ProGate } from '@/components/pro/ProGate';
import { Link } from '@/i18n/navigation';
import { getFacets, listFollows, normalizeQuery, searchCircolari } from '@/lib/circolari';
import { permitsList } from '@/lib/permits-list.generated';
import { getProAccess } from '@/lib/pro-access';

import { SeguiPermessi } from './SeguiPermessi';

export const metadata: Metadata = {
  title: 'Archivio circolari — SOS Permesso PRO',
  robots: { index: false },
};

type Query = { q?: string; permesso?: string; ente?: string; tipo?: string; anno?: string; p?: string };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Query>;
};

const FIELD =
  'w-full rounded-md border-2 border-foreground bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm';

function first(v: string | undefined): string {
  return (v ?? '').trim();
}

export default async function CircolariPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const access = await getProAccess(await headers());
  if (access.status !== 'active') {
    return (
      <ContentColumn>
        <h1 className="text-3xl font-extrabold leading-tight text-foreground">Archivio circolari</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Circolari, note, messaggi e decreti sul soggiorno degli stranieri, dal 2000 a oggi, con ricerca
          nel testo integrale.
        </p>
        <ProGate
          titolo="Oltre 1.900 documenti con ricerca nel testo"
          descrizione="Il sito pubblico mostra le circolari più importanti. L’archivio PRO contiene tutto il corpus, compresi i documenti mai pubblicati, e lo tiene aggiornato."
          da={`/${locale}/pro/circolari`}
          punti={[
            'Ricerca nel testo integrale, con i passaggi evidenziati',
            'Filtri per permesso, ente, tipo di atto e anno',
            'Avviso email quando esce una circolare sui permessi che segui',
            'Scadenziario delle pratiche con promemoria a 90, 60 e 30 giorni',
          ]}
        />
      </ContentColumn>
    );
  }

  const q = normalizeQuery(sp.q);
  const permesso = first(sp.permesso);
  const ente = first(sp.ente);
  const tipo = first(sp.tipo);
  const anno = Number.parseInt(first(sp.anno), 10) || undefined;
  const page = Math.max(1, Number.parseInt(first(sp.p), 10) || 1);
  const filtering = Boolean(q || permesso || ente || tipo || anno);

  const [result, facets, follows] = await Promise.all([
    searchCircolari({ q, permesso, ente, tipo, anno, page }),
    getFacets(),
    listFollows(access.session.user.id),
  ]);

  const baseQuery: Record<string, string> = {};
  if (q) baseQuery.q = q;
  if (permesso) baseQuery.permesso = permesso;
  if (ente) baseQuery.ente = ente;
  if (tipo) baseQuery.tipo = tipo;
  if (anno) baseQuery.anno = String(anno);

  return (
    <ContentColumn>
      <h1 className="text-3xl font-extrabold leading-tight text-foreground">Archivio circolari</h1>
      <p className="mt-2 mb-5 text-sm text-muted-foreground">
        {facets.totale.toLocaleString('it-IT')} documenti: circolari, note, messaggi, decreti e sentenze sul
        soggiorno degli stranieri. Ricerca nel testo integrale.
      </p>

      <form method="get" className="flex flex-col gap-3 rounded-lg border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_hsl(var(--foreground))]">
        <div className="flex gap-2">
          <label htmlFor="q" className="sr-only">
            Cerca nel testo
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder='Es. "attesa occupazione" conversione'
            className={FIELD}
            maxLength={200}
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))]"
          >
            <Search className="h-4 w-4" aria-hidden="true" /> Cerca
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select name="permesso" defaultValue={permesso} className={FIELD} aria-label="Permesso">
            <option value="">Tutti i permessi</option>
            {facets.permessi.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.titolo} ({p.n})
              </option>
            ))}
          </select>
          <select name="ente" defaultValue={ente} className={FIELD} aria-label="Ente">
            <option value="">Tutti gli enti</option>
            {facets.enti.map((e) => (
              <option key={e.ente} value={e.ente}>
                {e.ente} ({e.n})
              </option>
            ))}
          </select>
          <select name="tipo" defaultValue={tipo} className={FIELD} aria-label="Tipo di atto">
            <option value="">Tutti i tipi di atto</option>
            {facets.tipi.map((t) => (
              <option key={t.tipo} value={t.tipo}>
                {t.tipo} ({t.n})
              </option>
            ))}
          </select>
          <select name="anno" defaultValue={anno ? String(anno) : ''} className={FIELD} aria-label="Anno">
            <option value="">Tutti gli anni</option>
            {facets.anni.map((a) => (
              <option key={a.anno} value={a.anno}>
                {a.anno} ({a.n})
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          Virgolette per la frase esatta, il segno meno per escludere una parola, OR per alternative.
        </p>
      </form>

      <div className="mt-5 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {filtering ? `${result.total.toLocaleString('it-IT')} risultati` : 'Ultime entrate'}
        </h2>
        {filtering && (
          <Link href="/pro/circolari" className="text-xs text-muted-foreground underline">
            Azzera filtri
          </Link>
        )}
      </div>

      {result.items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Nessun documento trovato. Prova con meno parole o togli un filtro.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {result.items.map((doc) => (
            <CircolareCard key={doc.id} doc={doc} />
          ))}
        </ul>
      )}

      {result.pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagine">
          {result.page > 1 ? (
            <Link
              href={{ pathname: '/pro/circolari', query: { ...baseQuery, p: String(result.page - 1) } }}
              className="rounded-md border-2 border-foreground px-3 py-1.5 font-bold text-foreground"
            >
              ← Precedenti
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            pagina {result.page} di {result.pages}
          </span>
          {result.page < result.pages ? (
            <Link
              href={{ pathname: '/pro/circolari', query: { ...baseQuery, p: String(result.page + 1) } }}
              className="rounded-md border-2 border-foreground px-3 py-1.5 font-bold text-foreground"
            >
              Successivi →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <div className="mt-8">
        <SeguiPermessi initial={follows} permits={permitsList} />
      </div>
    </ContentColumn>
  );
}
