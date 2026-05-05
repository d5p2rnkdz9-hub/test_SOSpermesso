'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface IntroTextProps {
  text: string;
}

const BOLD_REGEX = /\*\*([^*]+)\*\*/g;

function renderBold(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  BOLD_REGEX.lastIndex = 0;
  while ((match = BOLD_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    result.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    result.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }
  return result.length > 0 ? result : [text];
}

export function IntroText({ text }: IntroTextProps) {
  const t = useTranslations('outcome');
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

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
        {renderBold(text)}
      </p>
      {isTruncated && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="mt-1 text-sm font-medium text-[#1565C0] underline underline-offset-2"
        >
          {t('readMore')}
        </button>
      )}
    </div>
  );
}
