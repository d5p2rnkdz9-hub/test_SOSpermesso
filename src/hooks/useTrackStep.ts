'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import type { TreeStepPayload, TreeType } from '@/lib/analytics';

interface TrackStepParams {
  currentNodeId: string;
  answers: Record<string, string>;
  history: string[];
  sessionStartedAt: string | null;
  userName?: string | null;
}

export function useTrackStep(treeType: TreeType, params: TrackStepParams) {
  const locale = useLocale();
  const prevStepCount = useRef(0);

  const { currentNodeId, answers, history, sessionStartedAt, userName } = params;
  const stepsCount = Object.keys(answers).length;

  useEffect(() => {
    // Only fire when a NEW answer is added (stepsCount grows)
    if (!sessionStartedAt || stepsCount === 0 || stepsCount <= prevStepCount.current) {
      return;
    }

    prevStepCount.current = stepsCount;

    const sessionToken = `${sessionStartedAt}::${treeType}`;

    const payload: TreeStepPayload = {
      sessionToken,
      treeType,
      currentNodeId,
      answers,
      path: history,
      stepsCount,
      locale,
      userName: userName ?? null,
      sessionStartedAt,
    };

    fetch('/api/analytics/tree-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [stepsCount, currentNodeId, answers, history, sessionStartedAt, userName, treeType, locale]);
}
