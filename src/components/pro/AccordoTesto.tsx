import { ACCORDO_TESTO } from '@/lib/accordo-testo';

/** Rende ACCORDO_TESTO (paragrafi, "## "/"### " titoli, "- " elenchi). Server component. */
export function AccordoTesto() {
  const blocchi = ACCORDO_TESTO.split(/\n\s*\n/);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {blocchi.map((b, i) => {
        if (b.startsWith('## ')) {
          return (
            <h2 key={i} className="pt-4 text-lg font-extrabold">
              {b.slice(3)}
            </h2>
          );
        }
        if (b.startsWith('### ')) {
          return (
            <h3 key={i} className="pt-2 font-bold">
              {b.slice(4)}
            </h3>
          );
        }
        if (b.startsWith('- ')) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {b.split('\n').map((li, j) => (
                <li key={j}>{li.replace(/^- /, '')}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{b}</p>;
      })}
    </div>
  );
}
