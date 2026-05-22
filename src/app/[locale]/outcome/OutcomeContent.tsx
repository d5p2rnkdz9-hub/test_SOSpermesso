'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';

import { OutcomePage } from '@/components/outcome';
import { italianTree } from '@/lib/tree-data';
import { getSlugFromNodeId } from '@/lib/outcome-slugs';
import { useTreeStore } from '@/store/tree-store';
import { useTrackOutcome } from '@/hooks/useTrackOutcome';
import { translateTree } from '@/i18n/translateTree';
import { getTranslationMap } from '@/i18n/loadTranslations';

interface OutcomeContentProps {
  nodeId: string;
}

export default function OutcomeContent({ nodeId }: OutcomeContentProps) {
  const locale = useLocale();
  const tree = useMemo(() => translateTree(italianTree, getTranslationMap(locale)), [locale]);

  const userName = useTreeStore((s) => s.userName);
  const answers = useTreeStore((s) => s.answers);
  const history = useTreeStore((s) => s.history);
  const sessionStartedAt = useTreeStore((s) => s.sessionStartedAt);
  const reset = useTreeStore((s) => s.reset);
  const goBackTo = useTreeStore((s) => s.goBackTo);

  useTrackOutcome(nodeId, {
    treeType: 'posso_avere',
    answers,
    history,
    sessionStartedAt,
    userName,
    getSlug: (id) => getSlugFromNodeId(id) ?? null,
  });

  return (
    <OutcomePage
      nodeId={nodeId}
      tree={tree}
      userName={userName}
      answers={answers}
      history={history}
      onReset={reset}
      onGoBackTo={goBackTo}
    />
  );
}
