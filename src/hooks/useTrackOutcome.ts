'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import type { TreeSessionPayload, TreeType } from '@/lib/analytics';

interface TrackOutcomeParams {
  treeType: TreeType;
  answers: Record<string, string>;
  history: string[];
  sessionStartedAt: string | null;
  userName?: string | null;
  getSlug: (nodeId: string) => string | null;
  isHydrated: boolean;
}

export function useTrackOutcome(nodeId: string, params: TrackOutcomeParams) {
  const {
    treeType,
    answers,
    history,
    sessionStartedAt,
    userName,
    getSlug,
    isHydrated,
  } = params;
  const locale = useLocale();
  const hasFired = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasFired.current || !sessionStartedAt) return;

    const sessionToken = `${sessionStartedAt}::${treeType}`;
    const storageKey = `analytics-tracked::${sessionToken}`;

    if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
      return;
    }

    hasFired.current = true;

    const slug = getSlug(nodeId) ?? nodeId;
    const durationMs = sessionStartedAt
      ? Date.now() - new Date(sessionStartedAt).getTime()
      : null;

    const payload: TreeSessionPayload = {
      sessionToken,
      treeType,
      outcomeId: nodeId,
      outcomeSlug: slug,
      path: history,
      answers,
      stepsCount: Object.keys(answers).length,
      locale,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userName: userName ?? null,
      durationMs,
      sessionStartedAt,
    };

    // Record in Neon
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

    // Sync to Notion (fire-and-forget)
    fetch('/api/analytics/notion-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [isHydrated, nodeId, locale, answers, history, sessionStartedAt, userName, treeType, getSlug]);
}
