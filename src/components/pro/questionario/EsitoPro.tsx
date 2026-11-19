import { BookOpen, ExternalLink, FileText, Gavel, ListChecks, MessageCircleQuestion, Route, TriangleAlert, History } from 'lucide-react';
import type { ReactNode } from 'react';

import type { ProEsito, ProVerdetto } from '@/lib/pro-questionario/types';

import { RichText } from './RichText';

const VERDETTO: Record<ProVerdetto, { label: string; bg: string; fg: string }> = {
  possibile: { label: 'Possibile', bg: '#2E7D32', fg: '#fff' },
  condizionato: { label: 'Possibile a condizioni', bg: '#F9A825', fg: '#141414' },
  incerto: { label: 'Incerto', bg: '#FB8C00', fg: '#141414' },
  non_possibile: { label: 'Non possibile', bg: '#C62828', fg: '#fff' },
  non_necessaria: { label: 'Non necessaria', bg: '#546E7A', fg: '#fff' },
};

function Blocco({ icon, titolo, children }: { icon: ReactNode; titolo: string; children: ReactNode }) {
  return (
    <section className="border-t-2 border-foreground/15 pt-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-foreground">
        {icon}
        {titolo}
      </h3>
      {children}
    </section>
  );
}

function Fonte({ url, children }: { url?: string | null; children: ReactNode }) {
  if (!url) return <>{children}</>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 text-[hsl(var(--link))]"
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
}

function dataIt(d: string): string {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d;
}

export function EsitoPro({ esito }: { esito: ProEsito }) {
  const v = VERDETTO[esito.verdetto];
  const icon = 'h-4 w-4';
  return (
    <article className="flex flex-col gap-4 rounded-xl border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_hsl(var(--foreground))] sm:p-6">
      <header className="flex flex-col gap-2">
        <span
          className="w-fit rounded-full border-2 border-foreground px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide"
          style={{ background: v.bg, color: v.fg }}
        >
          {v.label}
        </span>
        <h2 className="text-2xl font-extrabold leading-tight text-foreground">{esito.titolo}</h2>
      </header>

      <RichText text={esito.sintesi} className="text-[15px] leading-relaxed text-foreground" />

      {esito.regimeTransitorio && (
        <div className="rounded-lg border-2 border-foreground bg-[#FFF8E1] p-3 text-sm text-[#141414]">
          <p className="mb-1 flex items-center gap-2 font-extrabold">
            <History className={icon} aria-hidden="true" /> Regime transitorio
          </p>
          <RichText text={esito.regimeTransitorio} />
        </div>
      )}

      {esito.requisiti && esito.requisiti.length > 0 && (
        <Blocco icon={<ListChecks className={icon} aria-hidden="true" />} titolo="Requisiti">
          <ul className="list-disc space-y-1 ps-5 text-sm text-foreground">
            {esito.requisiti.map((r) => (
              <li key={r}>
                <RichText text={r} />
              </li>
            ))}
          </ul>
        </Blocco>
      )}

      {esito.procedura && (
        <Blocco icon={<Route className={icon} aria-hidden="true" />} titolo="Procedura">
          <RichText text={esito.procedura} className="text-sm text-foreground" />
        </Blocco>
      )}

      {esito.norme && esito.norme.length > 0 && (
        <Blocco icon={<BookOpen className={icon} aria-hidden="true" />} titolo="Riferimenti normativi">
          <ul className="flex flex-col gap-2.5 text-sm">
            {esito.norme.map((n) => (
              <li key={n.estremi}>
                <Fonte url={n.url}>{n.estremi}</Fonte>
                <span className="text-muted-foreground"> — {n.contenuto}</span>
                {n.citazione && (
                  <blockquote className="mt-1 border-s-4 border-foreground/30 ps-3 text-[13px] italic text-foreground/80">
                    «{n.citazione}»
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        </Blocco>
      )}

      {esito.giurisprudenza && esito.giurisprudenza.length > 0 && (
        <Blocco icon={<Gavel className={icon} aria-hidden="true" />} titolo="Giurisprudenza">
          <ul className="flex flex-col gap-3 text-sm">
            {esito.giurisprudenza.map((s) => (
              <li key={`${s.corte}-${s.numero}`}>
                <Fonte url={s.url}>
                  {s.corte}, {dataIt(s.data)}, {s.numero}
                </Fonte>
                <p className="mt-0.5 text-muted-foreground">{s.principio}</p>
              </li>
            ))}
          </ul>
        </Blocco>
      )}

      {esito.prassi && esito.prassi.length > 0 && (
        <Blocco icon={<FileText className={icon} aria-hidden="true" />} titolo="Prassi amministrativa">
          <ul className="flex flex-col gap-2 text-sm">
            {esito.prassi.map((c) => (
              <li key={`${c.ente}-${c.estremi}`}>
                <Fonte url={c.url}>
                  {c.ente}, {c.estremi}
                  {c.data ? ` del ${dataIt(c.data)}` : ''}
                </Fonte>
                <span className="text-muted-foreground"> — {c.oggetto}</span>
              </li>
            ))}
          </ul>
        </Blocco>
      )}

      {esito.verifiche && esito.verifiche.length > 0 && (
        <Blocco icon={<MessageCircleQuestion className={icon} aria-hidden="true" />} titolo="Da verificare con l’assistito">
          <ul className="flex flex-col gap-2 text-sm">
            {esito.verifiche.map((q) => (
              <li key={q.domanda} className="flex gap-2">
                <span aria-hidden="true" className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border-2 border-foreground/50" />
                <span>
                  <span className="font-semibold text-foreground">{q.domanda}</span>
                  <span className="block text-muted-foreground">{q.perche}</span>
                </span>
              </li>
            ))}
          </ul>
        </Blocco>
      )}

      {esito.approfondimenti && esito.approfondimenti.length > 0 && (
        <Blocco icon={<BookOpen className={icon} aria-hidden="true" />} titolo="Approfondimenti">
          {esito.approfondimenti.map((a) => (
            <details key={a.titolo} className="rounded-lg border-2 border-foreground/20 px-3 py-2 text-sm">
              <summary className="cursor-pointer font-bold text-foreground">{a.titolo}</summary>
              <RichText text={a.testo} className="mt-1 text-foreground/90" />
            </details>
          ))}
        </Blocco>
      )}

      {esito.casiLimite && esito.casiLimite.length > 0 && (
        <Blocco icon={<TriangleAlert className={icon} aria-hidden="true" />} titolo="Casi limite">
          <div className="flex flex-col gap-2">
            {esito.casiLimite.map((c) => (
              <details key={c.titolo} className="rounded-lg border-2 border-foreground/20 px-3 py-2 text-sm">
                <summary className="cursor-pointer font-bold text-foreground">{c.titolo}</summary>
                <RichText text={c.testo} className="mt-1 text-foreground/90" />
              </details>
            ))}
          </div>
        </Blocco>
      )}
    </article>
  );
}
