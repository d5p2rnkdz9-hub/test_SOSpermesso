'use client';

import { ExternalLink, Lock, Scale } from 'lucide-react';

import type { ProPermitContent } from '@/lib/pro-content';

interface ProCardProps {
  content: ProPermitContent;
  draft: boolean;
}

const TEASER_CHARS = 140;

/**
 * Professional permit card shown on outcome pages in PRO mode.
 *
 * Register is deliberately technical (no colloquial tone): succinct
 * summary, normative references, key case law. Case law shows a teaser
 * (first lines of the massima); the rest is blurred behind the future
 * PRO subscription — demo paywall, no real entitlement check yet.
 */
export function ProCard({ content, draft }: ProCardProps) {
  const s = content.sintesi;

  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-foreground bg-card p-5 text-start shadow-[3px_3px_0_hsl(var(--foreground))]">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
          Scheda PRO
        </span>
        {draft && (
          <span
            className="rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-foreground"
            title="Contenuto in bozza: in attesa di validazione legale"
          >
            Bozza
          </span>
        )}
        <span className="ms-auto text-xs text-muted-foreground">
          agg. {content.aggiornato_al}
        </span>
      </div>

      {/* Sintesi */}
      <div className="flex flex-col gap-1.5 text-sm">
        <p className="text-foreground">{s.descrizione}</p>
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Base giuridica: </span>
          {s.base_giuridica}
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Durata</dt>
          <dd className="text-muted-foreground">{s.durata}</dd>
        </div>
        <div>
          <dt className="font-semibold">Rinnovo</dt>
          <dd className="text-muted-foreground">{s.rinnovo}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold">Convertibilità</dt>
          <dd className="text-muted-foreground">{s.convertibilita}</dd>
        </div>
      </dl>

      {s.requisiti.length > 0 && (
        <div className="text-sm">
          <h3 className="mb-1 font-semibold">Requisiti</h3>
          <ul className="list-disc space-y-0.5 ps-5 text-muted-foreground">
            {s.requisiti.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {s.note_operative.length > 0 && (
        <div className="rounded-md bg-secondary p-3 text-sm">
          <h3 className="mb-1 font-semibold">Note operative</h3>
          <ul className="list-disc space-y-0.5 ps-5 text-secondary-foreground">
            {s.note_operative.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Norme */}
      {content.norme.length > 0 && (
        <div className="text-sm">
          <h3 className="mb-1 font-semibold">Norme di riferimento</h3>
          <ul className="space-y-1">
            {content.norme.map((n) => (
              <li key={`${n.fonte}-${n.estremi}`} className="text-muted-foreground">
                {n.url ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[hsl(var(--link))] underline"
                  >
                    {n.fonte}, {n.estremi}
                  </a>
                ) : (
                  <span className="font-medium text-foreground">
                    {n.fonte}, {n.estremi}
                  </span>
                )}
                {' — '}
                {n.oggetto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sentenze: teaser + paywall */}
      {content.sentenze.length > 0 && (
        <div className="text-sm">
          <h3 className="mb-2 flex items-center gap-1.5 font-semibold">
            <Scale className="h-4 w-4" />
            Giurisprudenza essenziale
          </h3>
          <ul className="space-y-3">
            {content.sentenze.map((sent) => {
              const teaser = sent.massima.slice(0, TEASER_CHARS);
              const rest = sent.massima.slice(TEASER_CHARS);
              return (
                <li
                  key={`${sent.corte}-${sent.estremi}`}
                  className="rounded-md border border-border p-3"
                >
                  <p className="font-semibold text-foreground">
                    {sent.corte}, {sent.estremi}
                    <span className="ms-2 font-normal text-muted-foreground">{sent.data}</span>
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {teaser}
                    {rest && (
                      <span aria-hidden="true" className="select-none blur-[3px]">
                        {rest}
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    disabled
                    title="Disponibile con l'abbonamento PRO (in arrivo)"
                    className="mt-2 flex cursor-not-allowed items-center gap-1.5 rounded-md border border-foreground/30 px-2.5 py-1 text-xs font-semibold text-foreground/60"
                  >
                    <Lock className="h-3 w-3" />
                    Massima integrale e rilevanza operativa — PRO
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Circolari */}
      {content.circolari.length > 0 && (
        <div className="text-sm">
          <h3 className="mb-1 font-semibold">Circolari chiave</h3>
          <ul className="space-y-1 text-muted-foreground">
            {content.circolari.map((c) => (
              <li key={`${c.ente}-${c.estremi}`}>
                <span className="font-medium text-foreground">
                  {c.ente} {c.estremi}
                </span>
                {c.data && ` (${c.data})`} — {c.oggetto}
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ms-1 text-[hsl(var(--link))] underline"
                  >
                    testo
                  </a>
                )}
              </li>
            ))}
          </ul>
          <a
            href="https://www.sospermesso.it/circolari-db.html"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--link))] underline"
          >
            Tutte le circolari su questo permesso
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
