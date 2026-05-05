'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ShareButtonProps {
  title: string;
  text?: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
  const t = useTranslations('outcome.share');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard access denied — no-op
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#1A1A1A] bg-[#FFD700] px-4 py-3 font-semibold text-[#1A1A1A] shadow-[2.5px_2.5px_0_#1A1A1A] transition-all duration-150 ease-in-out hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1px_1px_0_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0.5px_0.5px_0_#1A1A1A]"
      aria-label={t('label')}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {t('copied')}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {t('label')}
        </>
      )}
    </button>
  );
}
