'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { Button } from '@/components/ui/button';
import { TreePlayer } from '@/components/tree';
import { useRouter } from '@/i18n/navigation';
import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import { isTerminalNode } from '@/lib/tree-engine';
import { getRCSlugFromNodeId } from '@/lib/rinnovo-conversione-outcome-slugs';
import {
  useRinnovoConversioneHydration,
  useRinnovoConversioneStore,
} from '@/store/rinnovo-conversione-store';

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
  const selectOption = useRinnovoConversioneStore((s) => s.selectOption);
  const startSession = useRinnovoConversioneStore((s) => s.startSession);

  const [name, setName] = useState('');

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
      startSession(name.trim() || null);
    };

    return (
      <ContentColumn>
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            {tRC('welcomeTitle')}
          </h1>

          <div className="mt-8 w-full">
            <input
              id="rc-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tTree('namePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStart();
              }}
              className="w-full rounded-2xl border-2 border-border bg-white px-5 py-4 text-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] placeholder:text-muted-foreground transition-all duration-[250ms] ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:border-[#FFD700]"
            />
          </div>

          <Button
            size="lg"
            className="mt-6 w-full text-lg font-semibold"
            onClick={handleStart}
          >
            {tTree('startButton')}
          </Button>

          <div className="mt-6 w-full rounded-2xl bg-card p-5 text-start text-sm text-muted-foreground shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <p>{tTree('policyNote')}</p>
            <a
              href="https://www.sospermesso.it/src/pages/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block underline"
            >
              {tTree('policyLink')}
            </a>
          </div>
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
