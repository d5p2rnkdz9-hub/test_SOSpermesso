'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { Button } from '@/components/ui/button';
import { TreePlayer } from '@/components/tree';
import { useRouter, Link } from '@/i18n/navigation';
import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import { isTerminalNode } from '@/lib/tree-engine';
import { getRCSlugFromNodeId } from '@/lib/rinnovo-conversione-outcome-slugs';
import {
  useRinnovoConversioneHydration,
  useRinnovoConversioneStore,
} from '@/store/rinnovo-conversione-store';
import { useTrackStep } from '@/hooks/useTrackStep';

export default function RinnovoConversioneContent() {
  const router = useRouter();
  const tRC = useTranslations('rinnovareConvertire');
  const tTree = useTranslations('tree');

  const isHydrated = useRinnovoConversioneHydration();
  const currentNodeId = useRinnovoConversioneStore((s) => s.currentNodeId);
  const answers = useRinnovoConversioneStore((s) => s.answers);
  const outcomeId = useRinnovoConversioneStore((s) => s.outcomeId);
  const sessionStartedAt = useRinnovoConversioneStore((s) => s.sessionStartedAt);
  const history = useRinnovoConversioneStore((s) => s.history);
  const userName = useRinnovoConversioneStore((s) => s.userName);
  const selectOption = useRinnovoConversioneStore((s) => s.selectOption);
  const startSession = useRinnovoConversioneStore((s) => s.startSession);
  const reset = useRinnovoConversioneStore((s) => s.reset);

  useTrackStep('rinnovo_conversione', { currentNodeId, answers, history, sessionStartedAt, userName });

  const [accepted, setAccepted] = useState(false);

  // Redirect to outcome page when tree reaches a terminal node
  useEffect(() => {
    if (isHydrated && outcomeId && isTerminalNode(rinnovoConversioneTree, outcomeId)) {
      const slug = getRCSlugFromNodeId(outcomeId);
      if (slug) {
        router.replace(`/outcome/rinnovo-conversione/${slug}`);
      }
    }
  }, [isHydrated, outcomeId, router]);

  // Hydration guard
  if (!isHydrated) {
    return (
      <ContentColumn>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="bg-foreground/5 rounded-2xl p-5">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
          </div>
        </div>
      </ContentColumn>
    );
  }

  // Redirect in progress
  if (outcomeId && isTerminalNode(rinnovoConversioneTree, outcomeId)) {
    return (
      <ContentColumn>
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="bg-foreground/5 rounded-2xl p-5">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
          </div>
        </div>
      </ContentColumn>
    );
  }

  // Welcome / intro screen (no active session)
  if (sessionStartedAt === null) {
    const handleStart = () => {
      startSession(null);
    };

    return (
      <ContentColumn>
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            {tRC.rich('welcomeTitle', {
              hl: (chunks) => (
                <span className="font-extrabold" style={{ background: 'linear-gradient(180deg, transparent 50%, #FFD700 50%)', padding: '0 4px' }}>
                  {chunks}
                </span>
              ),
            })}
          </h1>

          <div className="mt-8 w-full rounded-lg border-2 border-[#1A1A1A] bg-card p-5 text-start text-sm text-muted-foreground shadow-[2.5px_2.5px_0_#1A1A1A]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-primary"
              />
              <span>
                {tTree('policyNote')}
                {' '}
                <a
                  href="https://www.sospermesso.it/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {tTree('policyLink')}
                </a>
              </span>
            </label>
          </div>

          <Button
            size="lg"
            className="mt-6 w-full text-lg font-semibold"
            disabled={!accepted}
            onClick={handleStart}
          >
            {tTree('startButton')}
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            Non hai ancora un permesso?{' '}
            <Link href="/" className="underline">
              Scopri se puoi ottenerne uno
            </Link>
          </p>
        </div>
      </ContentColumn>
    );
  }

  return (
    <ContentColumn>
      <TreePlayer
        tree={rinnovoConversioneTree}
        currentNodeId={currentNodeId}
        answers={answers}
        historyLength={history.length}
        onSelectOption={selectOption}
      />
    </ContentColumn>
  );
}
