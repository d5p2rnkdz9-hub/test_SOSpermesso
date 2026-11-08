import { Link } from '@/i18n/navigation';
import { HL_END, HL_START, type CircolareSummary } from '@/lib/circolari';
import { permitsBySlug } from '@/lib/permits-list.generated';

export function formatDateIt(iso: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
  if (!iso) return 'data non indicata';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('it-IT', { ...opts, timeZone: 'UTC' });
}

/** Snippet di ts_headline: i marker diventano <mark>, il resto è testo (mai HTML). */
export function Snippet({ text }: { text: string }) {
  const parts = text.split(HL_START);
  return (
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
      {parts.map((part, i) => {
        if (i === 0) return <span key={i}>{part}</span>;
        const [hit, rest] = part.split(HL_END);
        return (
          <span key={i}>
            <mark className="rounded-sm bg-[hsl(48_100%_60%/0.6)] px-0.5 text-foreground">{hit}</mark>
            {rest}
          </span>
        );
      })}
    </p>
  );
}

export function TipoBadge({ tipo }: { tipo: string }) {
  const sentenza = /sentenza|ordinanza/i.test(tipo);
  return (
    <span
      className={`rounded-full border-2 border-foreground px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        sentenza ? 'bg-foreground text-background' : 'bg-background text-foreground'
      }`}
    >
      {tipo}
    </span>
  );
}

export function CircolareCard({ doc }: { doc: CircolareSummary }) {
  const permessi = doc.permessi.filter((s) => permitsBySlug[s]);
  return (
    <li className="rounded-lg border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_hsl(var(--foreground))]">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <TipoBadge tipo={doc.tipo} />
        {doc.ente && <span className="font-semibold text-foreground">{doc.ente}</span>}
        <span>{formatDateIt(doc.data, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
      <h3 className="mt-2 text-base font-bold leading-snug text-foreground">
        <Link href={`/pro/circolari/${doc.urlId}`} className="hover:underline">
          {doc.oggetto ?? doc.titolo}
        </Link>
      </h3>
      {doc.oggetto && doc.numero && (
        <p className="mt-0.5 text-xs text-muted-foreground">n. {doc.numero}</p>
      )}
      {doc.snippet && <Snippet text={doc.snippet} />}
      {permessi.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {permessi.map((s) => (
            <Link
              key={s}
              href={{ pathname: '/pro/circolari', query: { permesso: s } }}
              className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
            >
              {permitsBySlug[s].titolo}
            </Link>
          ))}
        </p>
      )}
    </li>
  );
}
