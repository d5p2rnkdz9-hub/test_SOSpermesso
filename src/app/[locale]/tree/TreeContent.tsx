'use client';

import { useEffect } from 'react';
import { Loader2, ExternalLink, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ContentColumn } from '@/components/layout/ContentColumn';
import { TreePlayer } from '@/components/tree';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { italianTree } from '@/lib/tree-data';
import { getNode, isTerminalNode } from '@/lib/tree-engine';
import { substituteVariables } from '@/lib/text-utils';
import { useTreeHydration, useTreeStore } from '@/store/tree-store';

export default function TreeContent() {
  const t = useTranslations('tree');
  const router = useRouter();

  const isHydrated = useTreeHydration();
  const currentNodeId = useTreeStore((s) => s.currentNodeId);
  const outcomeId = useTreeStore((s) => s.outcomeId);
  const sessionStartedAt = useTreeStore((s) => s.sessionStartedAt);
  const history = useTreeStore((s) => s.history);
  const userName = useTreeStore((s) => s.userName);
  const answers = useTreeStore((s) => s.answers);
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
          <div className="bg-foreground/5 rounded-2xl p-5">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/40" />
          </div>
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

    const sub = (text: string) =>
      substituteVariables(text, userName, answers);

    return (
      <ContentColumn>
        <div className="bg-foreground/5 rounded-2xl p-5">
          <h1 className="text-2xl font-bold">{resultNode.title}</h1>

          {/* Intro text with variable substitution */}
          {resultNode.introText && (
            <p className="mt-4 whitespace-pre-line text-foreground/80">
              {sub(resultNode.introText)}
            </p>
          )}

          {/* Emergency numbers callout */}
          {resultNode.emergencyNumbers &&
            resultNode.emergencyNumbers.length > 0 && (
              <div className="mt-6 rounded-[0.75rem] bg-foreground/10 p-4">
                {resultNode.emergencyNumbers.map((number) => (
                  <a
                    key={number}
                    href={`tel:${number.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 text-lg font-bold"
                  >
                    <Phone className="h-5 w-5" />
                    {number}
                  </a>
                ))}
              </div>
            )}

          {/* FAQ-style sections */}
          {resultNode.sections &&
            resultNode.sections.length > 0 &&
            resultNode.sections.map((section, index) => (
              <div key={index} className="mt-6">
                <h3 className="text-base font-semibold">
                  {section.heading}
                </h3>
                <p className="mt-1 whitespace-pre-line text-foreground/80">
                  {sub(section.content)}
                </p>
              </div>
            ))}

          {/* Links */}
          {resultNode.links && resultNode.links.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              {resultNode.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground underline underline-offset-4"
                >
                  {link.label}
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              ))}
            </div>
          )}

          {/* Post-outcome section */}
          <div className="mt-10 border-t border-foreground/20 pt-6">
            <p className="text-lg font-semibold">
              {t('postOutcome.title')}
            </p>

            <a
              href="https://www.facebook.com/sospermesso"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-foreground/60 underline"
            >
              {t('postOutcome.feedback')}
            </a>

            <Button
              size="lg"
              className="mt-4 w-full text-lg font-semibold"
              asChild
            >
              <a
                href="https://www.sospermesso.it"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('postOutcome.home')}
              </a>
            </Button>
          </div>
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
