'use client';

import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

/**
 * «Accedi PRO» / «Account PRO», come la voce «Accedi PRO» del menu del sito.
 * Sempre visibile: PRO è solo «hai fatto il login», non c'è più una modalità da attivare.
 */
export function HeaderAccount({ className }: { className: string }) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <Link
      href={session ? '/account' : '/abbonati'}
      className={className}
      title={session?.user.email}
      aria-busy={isPending || undefined}
    >
      {session ? 'Account' : 'Accedi'}
      <span className="ms-1 rounded-full border-[1.5px] border-[#141414] bg-[#FFD400] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-[1.2] tracking-[.5px] shadow-[1.5px_1.5px_0_#141414]">
        pro
      </span>
    </Link>
  );
}
