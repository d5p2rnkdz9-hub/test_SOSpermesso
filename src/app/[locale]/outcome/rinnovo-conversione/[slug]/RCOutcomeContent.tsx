'use client';

import { OutcomePage } from '@/components/outcome';
import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import {
  useRinnovoConversioneHydration,
  useRinnovoConversioneStore,
} from '@/store/rinnovo-conversione-store';

interface RCOutcomeContentProps {
  nodeId: string;
}

export default function RCOutcomeContent({ nodeId }: RCOutcomeContentProps) {
  const isHydrated = useRinnovoConversioneHydration();
  const answers = useRinnovoConversioneStore((s) => s.answers);
  const history = useRinnovoConversioneStore((s) => s.history);
  const reset = useRinnovoConversioneStore((s) => s.reset);
  const goBackTo = useRinnovoConversioneStore((s) => s.goBackTo);

  return (
    <OutcomePage
      nodeId={nodeId}
      tree={rinnovoConversioneTree}
      isHydrated={isHydrated}
      userName={null}
      answers={answers}
      history={history}
      onReset={reset}
      onGoBackTo={goBackTo}
      treePath="/tree/rinnovo-conversione"
      homePath="/tree/rinnovo-conversione"
    />
  );
}
