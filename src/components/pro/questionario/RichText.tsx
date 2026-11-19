import type { ReactNode } from 'react';

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

/** Minimal inline markdown for PRO texts: **bold** and [label](https://…). */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(text); m; m = TOKEN.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(<strong key={`${keyBase}-${i++}`}>{m[1]}</strong>);
    } else {
      out.push(
        <a
          key={`${keyBase}-${i++}`}
          href={m[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 text-[hsl(var(--link))]"
        >
          {m[2]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Paragraphs split on blank lines; single newlines become <br>. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(/\n{2,}/).map((para, p) => (
        <p key={p} className="mt-2 first:mt-0">
          {para.split('\n').map((line, l) => (
            <span key={l}>
              {l > 0 && <br />}
              {inline(line, `${p}-${l}`)}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
