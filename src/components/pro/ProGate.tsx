import { Lock } from 'lucide-react';

import { Link } from '@/i18n/navigation';

/**
 * Teaser for anonymous visitors of a PRO page: what they get and the login
 * link back to the same page. Server component — no session needed.
 */
export function ProGate({ titolo, descrizione, da, punti }: { titolo: string; descrizione: string; da: string; punti: string[] }) {
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
      <Link
        href={`/accedi?da=${encodeURIComponent(da)}`}
        className="mt-5 inline-block rounded-md border-2 border-foreground bg-primary px-4 py-2.5 font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))]"
      >
        Accedi o registrati gratis
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        Per operatori di CAF, patronati, sindacati e consulenti del lavoro. Durante il periodo di lancio
        l&apos;accesso è gratuito.
      </p>
    </div>
  );
}
