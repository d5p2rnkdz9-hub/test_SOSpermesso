'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Attivazione dello scadenziario. L'utente vede un pulsante e un link per
 * leggere l'accordo; il pulsante apre una finestra con il testo completo e
 * "Accetto" si sblocca solo dopo aver scorso il testo fino in fondo.
 * L'accettazione va a POST /api/pro/accordo.
 */

interface Props {
  versione: string;
  accordoHref: string;
  /** Il testo dell'accordo, reso lato server (AccordoTesto). */
  children: ReactNode;
}

const BOX = 'rounded-lg border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_hsl(var(--foreground))]';
const BTN = 'rounded-md border-2 border-foreground px-4 py-2 text-sm font-bold text-foreground disabled:opacity-60';
const BTN_PRIMARY =
  'rounded-md border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] disabled:opacity-60';

export function AccordoGate({ versione, accordoHref, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [letto, setLetto] = useState(false);
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  function controllaFondo() {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 16) setLetto(true);
  }

  function apri() {
    setErrore(null);
    dialogRef.current?.showModal();
    // Testo più corto della finestra (schermi alti): niente da scorrere.
    requestAnimationFrame(controllaFondo);
  }

  useEffect(() => {
    window.addEventListener('resize', controllaFondo);
    return () => window.removeEventListener('resize', controllaFondo);
  }, []);

  async function accetta() {
    setInvio(true);
    setErrore(null);
    try {
      const res = await fetch('/api/pro/accordo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accetto: true, versione }),
      });
      if (!res.ok) throw new Error(String(res.status));
      window.location.reload();
    } catch {
      setErrore('Non è stato possibile attivare lo scadenziario. Riprova tra poco.');
      setInvio(false);
    }
  }

  return (
    <section className={BOX} aria-labelledby="accordo-titolo">
      <h2 id="accordo-titolo" className="text-xl font-extrabold text-foreground">
        Attiva lo scadenziario
      </h2>
      <p className="mt-2 text-sm text-foreground">
        Nello scadenziario inserisci dati delle persone che assisti: per quei dati il titolare sei tu, e Alberto
        Pasquero li conserva per tuo conto. Per questo, prima di iniziare, serve accettare l&apos;accordo sul
        trattamento dei dati (art. 28 GDPR). Dopo l&apos;accettazione te ne mandiamo una copia per email.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="button" className={BTN_PRIMARY} onClick={apri}>
          Leggi e accetta l&apos;accordo
        </button>
        <a href={accordoHref} target="_blank" rel="noopener" className="text-sm font-bold underline">
          Apri l&apos;accordo in una nuova pagina
        </a>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="accordo-dialog-titolo"
        className="w-[min(46rem,calc(100vw-2rem))] rounded-lg border-2 border-foreground bg-card p-0 text-foreground backdrop:bg-black/50"
      >
        <div className="flex max-h-[85vh] flex-col">
          <h2 id="accordo-dialog-titolo" className="border-b-2 border-foreground px-5 py-3 text-base font-extrabold">
            Accordo sul trattamento dei dati · versione {versione}
          </h2>
          <div ref={scrollRef} onScroll={controllaFondo} className="flex-1 overflow-y-auto px-5 py-4" tabIndex={0}>
            {children}
          </div>
          <div className="border-t-2 border-foreground px-5 py-3">
            {!letto && (
              <p className="mb-2 text-xs text-muted-foreground">Scorri il testo fino in fondo per poter accettare.</p>
            )}
            {errore && <p className="mb-2 text-sm font-semibold text-destructive">{errore}</p>}
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" className={BTN} onClick={() => dialogRef.current?.close()} disabled={invio}>
                Chiudi
              </button>
              <button type="button" className={BTN_PRIMARY} onClick={accetta} disabled={!letto || invio}>
                {invio ? 'Attivazione…' : 'Accetto'}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
