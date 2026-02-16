'use client';

import { useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { TreePlayer } from '@/components/tree';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { italianTree } from '@/lib/tree-data';
import { getNode, isTerminalNode } from '@/lib/tree-engine';
import { useTreeStore } from '@/store/tree-store';

export default function TreeContent() {
  const t = useTranslations('tree');
  const router = useRouter();

  const isHydrated = useTreeStore((s) => s.isHydrated);
  const currentNodeId = useTreeStore((s) => s.currentNodeId);
  const outcomeId = useTreeStore((s) => s.outcomeId);
  const sessionStartedAt = useTreeStore((s) => s.sessionStartedAt);
  const history = useTreeStore((s) => s.history);
  const reset = useTreeStore((s) => s.reset);

  // Redirect to welcome if user accessed /tree directly without a session
  useEffect(() => {
    if (
      isHydrated &&
      sessionStartedAt === null &&
      history.length === 0 &&
      currentNodeId === italianTree.startNodeId &&
      outcomeId === null
    ) {
      router.replace('/');
    }
  }, [isHydrated, sessionStartedAt, history.length, currentNodeId, outcomeId, router]);

  // Hydration guard: show spinner until localStorage state is loaded
  if (!isHydrated) {
    return (
      <ContentColumn>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
        </div>
      </ContentColumn>
    );
  }

  // Outcome screen: terminal node reached
  if (outcomeId && isTerminalNode(italianTree, outcomeId)) {
    const resultNode = getNode(italianTree, outcomeId);

    if (!resultNode) {
      return null;
    }

    return (
      <ContentColumn>
        <div className="py-4">
          <h1 className="text-2xl font-bold">{resultNode.title}</h1>

          {resultNode.resultDescription && (
            <p className="mt-4 text-foreground/80">
              {resultNode.resultDescription}
            </p>
          )}

          {resultNode.duration && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                {t('outcome.duration')}
              </h3>
              <p className="mt-1">{resultNode.duration}</p>
            </div>
          )}

          {resultNode.requirements && resultNode.requirements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                {t('outcome.requirements')}
              </h3>
              <ul className="mt-2 list-disc space-y-1 ps-5">
                {resultNode.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {resultNode.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                {t('outcome.notes')}
              </h3>
              <p className="mt-1 text-foreground/80">{resultNode.notes}</p>
            </div>
          )}

          {resultNode.link && (
            <a
              href={resultNode.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-foreground underline underline-offset-4"
            >
              {t('outcome.moreInfo')}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <Button
            size="lg"
            className="mt-8 w-full text-lg font-semibold"
            onClick={() => {
              reset();
              router.push('/');
            }}
          >
            {t('outcome.restart')}
          </Button>
        </div>
      </ContentColumn>
    );
  }

  // Question screen: render TreePlayer
  return (
    <ContentColumn>
      <TreePlayer />
    </ContentColumn>
  );
}
