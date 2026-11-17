import { Lock } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SOSFLUSSI_ABBONAMENTO_URL, accountUnicoOn, freeLaunchOn } from '@/lib/pro-entitlement';

const cta =
  'mt-5 inline-block rounded-md border-2 border-foreground bg-primary px-4 py-2.5 font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))]';

/**
 * Teaser of a PRO page. Server component.
 * - anonymous visitor: what they get and the login link back to the same page;
 * - `connesso` (account senza accesso PRO): stesso teaser, con il link per
 *   abbonarsi su sosflussi.it (account e abbonamento sono unici fra i due siti).
 */
export function ProGate({
  titolo,
  descrizione,
  da,
  punti,
  connesso = false,
}: {
  titolo: string;
  descrizione: string;
  da: string;
  punti: string[];
  connesso?: boolean;
}) {
  return (
    <div className="rounded-lg border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_hsl(var(--foreground))]">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-foreground" aria-hidden="true" />
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
          SOS Permesso PRO
        </span>
      </div>
      <h2 className="mt-3 text-xl font-extrabold text-foreground">{titolo}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{descrizione}</p>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm text-foreground">
        {punti.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {connesso ? (
        <AbbonatiCta />
      ) : (
        <>
          <Link href={`/accedi?da=${encodeURIComponent(da)}`} className={cta}>
            {freeLaunchOn() ? 'Accedi o registrati gratis' : 'Accedi o registrati'}
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Per operatori di CAF, patronati, sindacati e consulenti del lavoro.
            {freeLaunchOn() && <> Durante il periodo di lancio l&apos;accesso è gratuito.</>}
          </p>
        </>
      )}
    </div>
  );
}

/** Per chi ha un account ma non l'accesso PRO: dove abbonarsi. */
export function AbbonatiCta() {
  if (!accountUnicoOn()) {
    return (
      <p className="mt-5 text-sm font-semibold text-foreground">
        Il tuo account non ha un abbonamento PRO attivo. Gli abbonamenti non sono ancora aperti.
      </p>
    );
  }
  return (
    <>
      <p className="mt-5 text-sm font-semibold text-foreground">Il tuo account non ha un abbonamento PRO attivo.</p>
      <a href={SOSFLUSSI_ABBONAMENTO_URL} className={cta}>
        Abbonati
      </a>
      <p className="mt-3 text-xs text-muted-foreground">
        L&apos;abbonamento si fa su sosflussi.it: lo stesso account e lo stesso abbonamento valgono anche su SOS
        Flussi PRO. Dopo il pagamento ricarica questa pagina.
      </p>
    </>
  );
}
