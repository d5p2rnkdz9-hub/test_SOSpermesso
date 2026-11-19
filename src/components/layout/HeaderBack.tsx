'use client';

import { BackButton } from '@/components/tree/BackButton';
import { usePathname } from '@/i18n/navigation';

/** «Indietro» solo nel test (domande ed esiti), dove torna alla domanda prima. Altrove c'è il menu. */
export function HeaderBack() {
  const pathname = usePathname();
  if (!pathname.startsWith('/tree') && !pathname.startsWith('/outcome')) return null;
  return <BackButton />;
}
