'use client';

import { UserRound } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { useUiStore } from '@/store/ui-store';

/**
 * "Accedi" / account link — PRO mode only, so the migrant-facing
 * interface stays free of account prompts.
 */
export function HeaderAccount() {
  const pro = useUiStore((s) => s.mode) === 'pro';
  const { data: session, isPending } = authClient.useSession();

  if (!pro || isPending) return null;

  return (
    <Link
      href={session ? '/account' : '/accedi'}
      className="flex items-center gap-1.5 rounded-md border-2 border-foreground px-2.5 py-1.5 text-xs font-bold text-foreground"
      title={session?.user.email}
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      {session ? 'Account' : 'Accedi'}
    </Link>
  );
}
