'use client';

import { OutcomePage } from '@/components/outcome';
import { conversioneTree } from '@/lib/conversione-tree';
import {
  useConversioneHydration,
  useConversioneStore,
} from '@/store/conversione-store';

interface ConversioneOutcomeContentProps {
  nodeId: string;
}

export default function ConversioneOutcomeContent({
  nodeId,
}: ConversioneOutcomeContentProps) {
  const isHydrated = useConversioneHydration();
  const answers = useConversioneStore((s) => s.answers);
  const history = useConversioneStore((s) => s.history);
  const reset = useConversioneStore((s) => s.reset);
  const goBackTo = useConversioneStore((s) => s.goBackTo);

  return (
    <OutcomePage
      nodeId={nodeId}
      tree={conversioneTree}
      isHydrated={isHydrated}
      userName={null}
      answers={answers}
      history={history}
      onReset={reset}
      onGoBackTo={goBackTo}
      treePath="/tree/conversione"
    />
  );
}
