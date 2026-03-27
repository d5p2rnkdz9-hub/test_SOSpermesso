'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { useTreeHydration, useTreeStore } from '@/store/tree-store';

export default function WelcomeContent() {
  const t = useTranslations('welcome');
  const tTree = useTranslations('tree');
  const router = useRouter();

  const isHydrated = useTreeHydration();
  const history = useTreeStore((s) => s.history);
  const startSession = useTreeStore((s) => s.startSession);

  const [accepted, setAccepted] = useState(false);

  // Auto-resume: if user has an active session, redirect to /tree
  useEffect(() => {
    if (isHydrated && history.length > 0) {
      router.replace('/tree');
    }
  }, [isHydrated, history.length, router]);

  const handleStart = () => {
    startSession(null);
    router.push('/tree');
  };

  return (
    <ContentColumn>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          {t('title')}
        </h1>

        <div className="mt-8 w-full rounded-2xl bg-card p-5 text-start text-sm text-muted-foreground shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
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
      </div>
    </ContentColumn>
  );
}
