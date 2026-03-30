'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { Button } from '@/components/ui/button';
import { useRouter, Link } from '@/i18n/navigation';
import { useTreeStore } from '@/store/tree-store';
import { useRinnovoConversioneStore } from '@/store/rinnovo-conversione-store';

export default function WelcomeContent() {
  const t = useTranslations('welcome');
  const tTree = useTranslations('tree');
  const router = useRouter();

  const startSession = useTreeStore((s) => s.startSession);
  const rcReset = useRinnovoConversioneStore((s) => s.reset);

  const [accepted, setAccepted] = useState(false);

  const handleStart = () => {
    startSession(null);
    router.push('/tree');
  };

  return (
    <ContentColumn>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          {t.rich('title', {
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
          Hai già un permesso e vuoi rinnovarlo o convertirlo?{' '}
          <Link
            href="/tree/rinnovo-conversione"
            className="underline"
            onClick={() => rcReset()}
          >
            Vai al test rinnovo/conversione
          </Link>
        </p>
      </div>
    </ContentColumn>
  );
}
