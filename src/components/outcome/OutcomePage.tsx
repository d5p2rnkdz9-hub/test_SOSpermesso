'use client';

import { italianTree } from '@/lib/tree-data';
import { getNode } from '@/lib/tree-engine';
import { getLawyerLevel } from '@/lib/lawyer-level';
import { substituteVariables } from '@/lib/text-utils';
import { useTreeHydration, useTreeStore } from '@/store/tree-store';
import { ContentColumn } from '@/components/layout/ContentColumn';

import { TreeBreadcrumbs } from './TreeBreadcrumbs';
import { LawyerBanner } from './LawyerBanner';
import { IntroText } from './IntroText';
import { EmergencyNumbers } from './EmergencyNumbers';
import { FaqAccordion } from './FaqAccordion';
import { LinksSummary } from './LinksSummary';
import { LegalDisclaimer } from './LegalDisclaimer';

interface OutcomePageProps {
  nodeId: string;
}

export function OutcomePage({ nodeId }: OutcomePageProps) {
  const isHydrated = useTreeHydration();
  const userName = useTreeStore((s) => s.userName);
  const answers = useTreeStore((s) => s.answers);
  const history = useTreeStore((s) => s.history);

  const node = getNode(italianTree, nodeId);
  if (!node) return null;

  const sections = node.sections ?? [];
  const lawyerLevel = getLawyerLevel(sections);

  // Variable substitution: use hydrated values or empty defaults
  const hydratedName = isHydrated ? userName : null;
  const hydratedAnswers = isHydrated ? answers : {};
  const hydratedHistory = isHydrated ? history : [];

  const sub = (text: string) =>
    substituteVariables(text, hydratedName, hydratedAnswers);

  return (
    <ContentColumn>
      <div className="flex flex-col gap-5">
        {/* 1. Breadcrumbs */}
        <TreeBreadcrumbs history={hydratedHistory} answers={hydratedAnswers} />

        {/* 2. Title */}
        <h1 className="text-2xl font-bold">{node.title && sub(node.title)}</h1>

        {/* 3. Lawyer Banner */}
        <LawyerBanner level={lawyerLevel} />

        {/* 4. Intro Text */}
        {node.introText && <IntroText text={sub(node.introText)} />}

        {/* 5. Emergency Numbers */}
        {node.emergencyNumbers && node.emergencyNumbers.length > 0 && (
          <EmergencyNumbers numbers={node.emergencyNumbers} />
        )}

        {/* 6. FAQ Accordion */}
        <FaqAccordion sections={sections} substituteVars={sub} />

        {/* 7. Links Summary */}
        {node.links && <LinksSummary links={node.links} />}

        {/* 8. Legal Disclaimer */}
        <LegalDisclaimer />
      </div>
    </ContentColumn>
  );
}
