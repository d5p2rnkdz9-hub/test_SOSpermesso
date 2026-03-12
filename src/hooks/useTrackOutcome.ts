'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { useTreeStore, useTreeHydration } from '@/store/tree-store';
import { getSlugFromNodeId } from '@/lib/outcome-slugs';
import type { TreeSessionPayload } from '@/lib/analytics';

export function useTrackOutcome(nodeId: string) {
  const isHydrated = useTreeHydration();
  const locale = useLocale();
  const answers = useTreeStore((s) => s.answers);
  const history = useTreeStore((s) => s.history);
  const sessionStartedAt = useTreeStore((s) => s.sessionStartedAt);
  const hasFired = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasFired.current || !sessionStartedAt) return;

    const sessionToken = `${sessionStartedAt}::${nodeId}`;
    const storageKey = `analytics-tracked::${sessionToken}`;

    if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
      return;
    }

    hasFired.current = true;

    const slug = getSlugFromNodeId(nodeId) ?? nodeId;
    const durationMs = sessionStartedAt
      ? Date.now() - new Date(sessionStartedAt).getTime()
      : null;

    const payload: TreeSessionPayload = {
      sessionToken,
      outcomeId: nodeId,
      outcomeSlug: slug,
      path: history,
      answers,
      stepsCount: Object.keys(answers).length,
      locale,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      durationMs,
      sessionStartedAt,
    };

    fetch('/api/analytics/tree-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(storageKey, '1');
        }
      })
      .catch(() => {});
  }, [isHydrated, nodeId, locale, answers, history, sessionStartedAt]);
}
