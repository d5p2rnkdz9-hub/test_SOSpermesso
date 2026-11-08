import type { ReactNode } from 'react';

/**
 * Minimal markdown for chatbot replies: ### headings, "- " lists, paragraphs,
 * **bold**, [text](url). Everything is rendered as React nodes — never as
 * HTML — so model output cannot inject markup. Links: only http(s) and
 * same-site relative paths; internal /it/pro/... links open in the same tab.
 */

const INLINE_RE = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g;

function safeHref(url: string): string | null {
  if (url.includes('\\')) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const token = m[0];
    if (token.startsWith('**')) {
      out.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const close = token.indexOf('](');
      const label = token.slice(1, close);
      const href = safeHref(token.slice(close + 2, -1));
      if (!href) out.push(label);
      else {
        const external = href.startsWith('http');
        out.push(
          <a
            key={key++}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="font-semibold text-foreground underline decoration-2 underline-offset-2"
          >
            {label}
          </a>,
        );
      }
    }
    last = idx + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={key++}>{renderInline(para.join(' '))}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="ms-5 list-disc space-y-1">
          {list.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <h4 key={key++} className="mt-1 font-extrabold text-foreground">
          {renderInline(heading[1])}
        </h4>,
      );
    } else if (bullet || numbered) {
      flushPara();
      list.push((bullet ?? numbered)![1]);
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return <div className="flex flex-col gap-2 text-[15px] leading-relaxed">{blocks}</div>;
}
