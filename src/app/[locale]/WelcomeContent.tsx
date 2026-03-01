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

  return (
    <ContentColumn>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          {t('title')}
        </h1>

        <div className="mt-8 w-full">
          <input
            id="name-input"
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
