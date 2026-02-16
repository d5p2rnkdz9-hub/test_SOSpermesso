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

  const [name, setName] = useState('');

  // Auto-resume: if user has an active session, redirect to /tree
  useEffect(() => {
    if (isHydrated && history.length > 0) {
      router.replace('/tree');
    }
  }, [isHydrated, history.length, router]);

  const handleStart = () => {
    startSession(name.trim() || null);
    router.push('/tree');
  };

  const handleSkip = () => {
    startSession(null);
    router.push('/tree');
  };

  return (
    <ContentColumn>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          {t('title')}
        </h1>

        <p className="mt-4 text-lg text-foreground/80">
          {tTree('explainer')}
        </p>

        <div className="mt-8 w-full">
          <label
            htmlFor="name-input"
            className="block text-start text-sm font-medium text-foreground/70"
          >
            {tTree('nameLabel')}
          </label>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tTree('namePlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStart();
            }}
            className="mt-2 w-full rounded-xl border-2 border-foreground bg-card px-4 py-3 text-lg placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground"
          />
        </div>

        <Button
          size="lg"
          className="mt-6 w-full text-lg font-semibold"
          onClick={handleStart}
        >
          {tTree('startButton')}
        </Button>

        <button
          type="button"
          onClick={handleSkip}
          className="mt-3 text-sm text-foreground/60 underline"
        >
          {tTree('skipName')}
        </button>

        <p className="mt-8 text-sm text-foreground/50">
          {tTree('disclaimer')}
        </p>
      </div>
    </ContentColumn>
  );
}
