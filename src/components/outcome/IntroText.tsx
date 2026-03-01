'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface IntroTextProps {
  text: string;
}

export function IntroText({ text }: IntroTextProps) {
  const t = useTranslations('outcome');
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Compare scrollHeight vs clientHeight to detect if clamping is active
    setIsTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div>
      <p
        ref={textRef}
        className={`whitespace-pre-line text-foreground/80 ${
          !isExpanded ? 'line-clamp-5' : ''
        }`}
      >
        {text}
      </p>
      {isTruncated && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="mt-1 text-sm font-medium text-primary underline underline-offset-2"
        >
          {t('readMore')}
        </button>
      )}
    </div>
  );
}
