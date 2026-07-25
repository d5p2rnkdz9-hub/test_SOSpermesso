'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { Button } from '@/components/ui/button';
import { useRouter, Link } from '@/i18n/navigation';
import { useTreeStore } from '@/store/tree-store';
import { useRinnovoConversioneStore } from '@/store/rinnovo-conversione-store';
import { useUiStore } from '@/store/ui-store';

/**
 * Sportello mode remembers the policy acceptance per device: the operator
 * accepts once, not before every screening. Only the flag is stored.
 */
const CONSENT_KEY = 'sos-sportello-consent';

export default function WelcomeContent() {
  const t = useTranslations('welcome');
  const tTree = useTranslations('tree');
  const tSportello = useTranslations('sportello');
  const router = useRouter();

  const startSession = useTreeStore((s) => s.startSession);
  const rcReset = useRinnovoConversioneStore((s) => s.reset);
  const sportello = useUiStore((s) => s.mode) === 'sportello';

  const [accepted, setAccepted] = useState(false);
  const [consentStored, setConsentStored] = useState(false);

  useEffect(() => {
    if (!sportello) return;
    try {
      if (localStorage.getItem(CONSENT_KEY) === '1') {
        setConsentStored(true);
        setAccepted(true);
      }
    } catch {
      // Storage unavailable: fall back to the checkbox
    }
  }, [sportello]);

  const rememberConsent = () => {
    if (!sportello) return;
    try {
      localStorage.setItem(CONSENT_KEY, '1');
    } catch {
      // Best effort only
    }
  };

  const handleStart = () => {
    rememberConsent();
    startSession(null);
    router.push('/tree');
  };

  const handleStartRinnovoConversione = () => {
    rememberConsent();
    rcReset();
    router.push('/tree/rinnovo-conversione');
  };

  return (
    <ContentColumn>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          {t.rich('title', {
            hl: (chunks) => (
              <span className="font-extrabold" style={{ background: 'linear-gradient(180deg, transparent 50%, hsl(var(--accent)) 50%)', padding: '0 4px' }}>
                {chunks}
              </span>
            ),
          })}
        </h1>

        {sportello && (
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-foreground/60">
            {tSportello('welcomeSubtitle')}
          </p>
        )}

        {sportello && consentStored ? (
          <p className="mt-8 text-sm text-muted-foreground">
            {tSportello('consentNote')}
            {' · '}
            <a
              href="https://www.sospermesso.it/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {tTree('policyLink')}
            </a>
          </p>
        ) : (
          <div className="mt-8 w-full rounded-lg border-2 border-foreground bg-card p-5 text-start text-sm text-muted-foreground shadow-[2.5px_2.5px_0_hsl(var(--foreground))]">
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
        )}

        {sportello ? (
          <div className="mt-6 flex w-full flex-col gap-3">
            <Button
              size="lg"
              className="w-full text-lg font-semibold"
              disabled={!accepted}
              onClick={handleStart}
            >
              {tSportello('startPossoAvere')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg font-semibold"
              disabled={!accepted}
              onClick={handleStartRinnovoConversione}
            >
              {tSportello('startRinnovoConversione')}
            </Button>
          </div>
        ) : (
          <>
            <Button
              size="lg"
              className="mt-6 w-full text-lg font-semibold"
              disabled={!accepted}
              onClick={handleStart}
            >
              {tTree('startButton')}
            </Button>

            <p className="mt-6 text-base text-foreground">
              {t.rich('alreadyHavePermit', {
                b: (chunks) => <strong>{chunks}</strong>,
                link: (chunks) => (
                  <Link
                    href="/tree/rinnovo-conversione"
                    className="underline font-semibold text-[hsl(var(--link))]"
                    onClick={() => rcReset()}
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </>
        )}
      </div>
    </ContentColumn>
  );
}
