'use client';

import { ExternalLink, RotateCcw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { italianTree } from '@/lib/tree-data';
import { getNode } from '@/lib/tree-engine';
import { getLawyerLevel } from '@/lib/lawyer-level';
import { getPermitUrl } from '@/lib/permit-url-map';
import { substituteVariables } from '@/lib/text-utils';
import { useRouter } from '@/i18n/navigation';
import { useTreeHydration, useTreeStore } from '@/store/tree-store';
import { ContentColumn } from '@/components/layout/ContentColumn';

import { TreeBreadcrumbs } from './TreeBreadcrumbs';
import { LawyerBanner } from './LawyerBanner';
import { IntroText } from './IntroText';
import { FaqAccordion } from './FaqAccordion';
import { EmergencyNumbers } from './EmergencyNumbers';
import { LegalDisclaimer } from './LegalDisclaimer';

interface OutcomePageProps {
  nodeId: string;
}

export function OutcomePage({ nodeId }: OutcomePageProps) {
  const t = useTranslations('outcome');
  const tTree = useTranslations('tree');
  const locale = useLocale();
  const router = useRouter();
  const isHydrated = useTreeHydration();
  const userName = useTreeStore((s) => s.userName);
  const answers = useTreeStore((s) => s.answers);
  const history = useTreeStore((s) => s.history);
  const reset = useTreeStore((s) => s.reset);

  const node = getNode(italianTree, nodeId);
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

  const handleRestart = () => {
    reset();
    router.replace('/');
  };

  return (
    <ContentColumn>
      <div className="flex flex-col gap-4">
        {/* 1. Breadcrumbs */}
        <TreeBreadcrumbs history={hydratedHistory} answers={hydratedAnswers} />

        {/* 2. Card container */}
        <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
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
          <FaqAccordion sections={sections} substituteVars={sub} />

          {/* Link out to sospermesso.it */}
          {permitUrl && (
            <a
              href={permitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#FFC107] bg-gradient-to-br from-[#FFF9C4] to-[#FFD700] px-6 py-3.5 text-center font-semibold text-[#5D4E00] shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-[250ms] ease-in-out hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
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
          className="flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-transparent px-4 py-3 font-medium text-foreground transition-all duration-[250ms] ease-in-out hover:bg-foreground hover:text-white"
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
