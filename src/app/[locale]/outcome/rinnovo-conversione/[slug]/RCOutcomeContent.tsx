'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';

import { OutcomePage } from '@/components/outcome';
import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import { getRCSlugFromNodeId } from '@/lib/rinnovo-conversione-outcome-slugs';
import {
  useRinnovoConversioneHydration,
  useRinnovoConversioneStore,
} from '@/store/rinnovo-conversione-store';
import { useTrackOutcome } from '@/hooks/useTrackOutcome';
import { translateTree } from '@/i18n/translateTree';
import { getTranslationMap } from '@/i18n/loadTranslations';

interface RCOutcomeContentProps {
  nodeId: string;
}

export default function RCOutcomeContent({ nodeId }: RCOutcomeContentProps) {
  const locale = useLocale();
  const tree = useMemo(
    () => translateTree(rinnovoConversioneTree, getTranslationMap(locale)),
    [locale],
  );

  const isHydrated = useRinnovoConversioneHydration();
  const userName = useRinnovoConversioneStore((s) => s.userName);
  const answers = useRinnovoConversioneStore((s) => s.answers);
  const history = useRinnovoConversioneStore((s) => s.history);
  const sessionStartedAt = useRinnovoConversioneStore((s) => s.sessionStartedAt);
  const reset = useRinnovoConversioneStore((s) => s.reset);
  const goBackTo = useRinnovoConversioneStore((s) => s.goBackTo);

  useTrackOutcome(nodeId, {
    treeType: 'rinnovo_conversione',
    answers,
    history,
    sessionStartedAt,
    userName,
    getSlug: (id) => getRCSlugFromNodeId(id) ?? null,
    isHydrated,
  });

  return (
    <OutcomePage
      nodeId={nodeId}
      tree={tree}
      isHydrated={isHydrated}
      userName={userName}
      answers={answers}
      history={history}
      onReset={reset}
      onGoBackTo={goBackTo}
      treePath="/tree/rinnovo-conversione"
      homePath="/tree/rinnovo-conversione"
    />
  );
}
