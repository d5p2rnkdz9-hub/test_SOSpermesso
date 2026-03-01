'use client';

import { OutcomePage } from '@/components/outcome';

interface OutcomeContentProps {
  nodeId: string;
}

export default function OutcomeContent({ nodeId }: OutcomeContentProps) {
  return <OutcomePage nodeId={nodeId} />;
}
