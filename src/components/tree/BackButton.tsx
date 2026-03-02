'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useTreeStore } from '@/store/tree-store';

/**
 * Context-aware back button for the sticky header.
 *
 * Always renders (never returns null) so users never feel trapped.
 * Behavior adapts based on the current page:
 *
 * - Welcome page: browser back (router.back)
 * - Tree first question (no history): reset session, navigate to welcome
 * - Tree mid-question (has history): pop history via goBack()
 * - Outcome page (has history): pop history via goBack(), navigate to /tree
 * - Outcome page (no history, direct URL): navigate to welcome
 *
 * Arrow mirrors automatically for RTL via rtl:rotate-180.
 */
export function BackButton() {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const history = useTreeStore((s) => s.history);
  const goBack = useTreeStore((s) => s.goBack);
  const reset = useTreeStore((s) => s.reset);
  const sessionStartedAt = useTreeStore((s) => s.sessionStartedAt);

  const handleBack = () => {
    const isOutcome = pathname.startsWith('/outcome');
    const isTree = pathname === '/tree';

    if (isOutcome) {
      if (history.length > 0) {
        goBack();
        router.replace('/tree');
      } else {
        // Direct URL access -- no session to go back to
        router.replace('/');
      }
      return;
    }

    if (isTree) {
      if (history.length > 0) {
        // Mid-tree: go to previous question
        goBack();
      } else {
        // First question: go back to welcome
        reset();
        router.replace('/');
      }
      return;
    }

    // Welcome page or unknown: browser back
    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={t('back')}
      className="flex items-center gap-1 text-sm font-medium text-foreground"
    >
      <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
      <span className="hidden sm:inline">{t('back')}</span>
    </button>
  );
}
