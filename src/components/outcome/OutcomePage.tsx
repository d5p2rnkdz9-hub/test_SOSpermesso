'use client';

import { ExternalLink, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getNode } from '@/lib/tree-engine';
import { getLawyerLevel } from '@/lib/lawyer-level';
import { getPermitUrl } from '@/lib/permit-url-map';
import { substituteVariables, withDictionaryLinks } from '@/lib/text-utils';
import { useRouter } from '@/i18n/navigation';
import { ContentColumn } from '@/components/layout/ContentColumn';
import type { TreeData } from '@/types/tree';

import { TreeBreadcrumbs } from './TreeBreadcrumbs';
import { LawyerBanner } from './LawyerBanner';
import { IntroText } from './IntroText';
import { FaqAccordion } from './FaqAccordion';
import { EmergencyNumbers } from './EmergencyNumbers';
import { LegalDisclaimer } from './LegalDisclaimer';

interface OutcomePageProps {
  nodeId: string;
  tree: TreeData;
  isHydrated: boolean;
  userName: string | null;
  answers: Record<string, string>;
  history: string[];
  onReset: () => void;
  onGoBackTo: (nodeId: string) => void;
  /** Override for breadcrumb tree path back link (defaults to /tree) */
  treePath?: string;
  /** Override for restart/home navigation (defaults to /) */
  homePath?: string;
}

export function OutcomePage({
  nodeId,
  tree,
  isHydrated,
  userName,
  answers,
  history,
  onReset,
  onGoBackTo,
  treePath = '/tree',
  homePath = '/',
}: OutcomePageProps) {
  const t = useTranslations('outcome');
  const tTree = useTranslations('tree');
  const locale = useLocale();
  const router = useRouter();

  const node = getNode(tree, nodeId);
  if (!node) return null;

  const sections = node.sections ?? [];
  const lawyerLevel = getLawyerLevel(sections);
  const permitUrl = getPermitUrl(nodeId, locale);

  // Variable substitution: use hydrated values or empty defaults
  const hydratedName = isHydrated ? userName : null;
  const hydratedAnswers = isHydrated ? answers : {};
  const hydratedHistory = isHydrated ? history : [];

  const sub = (text: string) =>
    substituteVariables(text, hydratedName, hydratedAnswers);
  const subWithLinks = (text: string) =>
    withDictionaryLinks(sub(text));

  const handleRestart = () => {
    onReset();
    router.replace(homePath);
  };

  return (
    <ContentColumn>
      <div className="flex flex-col gap-4">
        {/* 1. Breadcrumbs */}
        <TreeBreadcrumbs
          history={hydratedHistory}
          answers={hydratedAnswers}
          tree={tree}
          treePath={treePath}
          onGoBackTo={onGoBackTo}
        />

        {/* 2. Card container */}
        <div className="flex flex-col gap-4 rounded-xl border-2 border-[#1A1A1A] bg-card p-6 shadow-[3px_3px_0_#1A1A1A]">
          {/* Title */}
          <h1 className="text-xl font-bold text-card-foreground">
            {node.title && sub(node.title)}
          </h1>

          {/* Lawyer Banner */}
          <LawyerBanner level={lawyerLevel} />

          {/* Intro Text */}
          {node.introText && <IntroText text={sub(node.introText)} />}

          {/* Emergency Numbers */}
          {node.emergencyNumbers && node.emergencyNumbers.length > 0 && (
            <EmergencyNumbers numbers={node.emergencyNumbers} />
          )}

          {/* FAQ Sections */}
          <FaqAccordion sections={sections} substituteVars={subWithLinks} />

          {/* Link out to sospermesso.it */}
          {permitUrl && (
            <a
              href={permitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#1A1A1A] bg-[#FFD700] px-6 py-3.5 text-center font-semibold text-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] transition-all duration-150 ease-in-out hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0_#1A1A1A] active:translate-x-[2.5px] active:translate-y-[2.5px] active:shadow-[0.5px_0.5px_0_#1A1A1A]"
            >
              {t('readFullGuide')}
              <ExternalLink className="h-4 w-4 shrink-0" />
            </a>
          )}
        </div>

        {/* Restart button */}
        <button
          type="button"
          onClick={handleRestart}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#1A1A1A] bg-transparent px-4 py-3 font-semibold text-foreground shadow-[2.5px_2.5px_0_#1A1A1A] transition-all duration-150 ease-in-out hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1px_1px_0_#1A1A1A] hover:bg-[#1A1A1A] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0.5px_0.5px_0_#1A1A1A]"
        >
          <RotateCcw className="h-4 w-4" />
          {tTree('restart')}
        </button>

        {/* Legal Disclaimer */}
        <LegalDisclaimer />
      </div>
    </ContentColumn>
  );
}
