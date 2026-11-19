'use client';

import { ArrowLeft, Check, Info, Link2, Printer, RotateCcw } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AnswerCard } from '@/components/tree/AnswerCard';
import { optionsOf, replay } from '@/lib/pro-questionario/engine';
import type { ProTree } from '@/lib/pro-questionario/types';

import { EsitoPro } from './EsitoPro';
import { RichText } from './RichText';

const SEP = '.';

const btn =
  'inline-flex items-center gap-2 rounded-lg border-2 border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground shadow-[2px_2px_0_hsl(var(--foreground))] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_hsl(var(--foreground))]';

/**
 * Player of a PRO module. The path lives in the URL (?r=key.key.key) so an
 * operator can bookmark or share an outcome with a colleague; the tree comes
 * from the server page, which renders it only for PRO users.
 */
export function ProQuestionario({ tree }: { tree: ProTree }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [copiato, setCopiato] = useState(false);

  const keys = useMemo(() => {
    const r = searchParams.get('r');
    return r ? r.split(SEP).filter(Boolean) : [];
  }, [searchParams]);

  const { steps, current } = useMemo(() => replay(tree, keys), [tree, keys]);

  const go = (next: string[]) => {
    const qs = next.length ? `?r=${next.join(SEP)}` : '';
    router.push(`${pathname}${qs}`, { scroll: true });
  };

  const choose = (optionKey: string) => go([...steps.map((s) => s.edge.optionKey), optionKey]);
  const backTo = (index: number) => go(steps.slice(0, index).map((s) => s.edge.optionKey));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2000);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  if (!current) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Percorso */}
      {steps.length > 0 && (
        <nav aria-label="Il percorso" className="rounded-xl border-2 border-foreground/20 bg-card p-4 print:border-0 print:p-0">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Percorso</p>
          <ol className="flex flex-col gap-1.5 text-sm">
            {steps.map((s, i) => (
              <li key={s.node.id} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-muted-foreground">
                  {s.node.type === 'question' ? (s.node.breve ?? s.node.domanda) : ''}:
                </span>
                <button
                  type="button"
                  onClick={() => backTo(i)}
                  className="font-semibold text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground print:no-underline"
                  title="Cambia questa risposta"
                >
                  {s.edge.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {current.type === 'question' ? (
        <div className="rounded-xl border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_hsl(var(--foreground))] sm:p-6">
          <h2 className="text-xl font-extrabold leading-tight text-foreground">{current.domanda}</h2>

          {current.nota && (
            <div className="mt-3 rounded-lg border-2 border-foreground/15 bg-muted/40 p-3 text-sm">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-foreground">
                <Info className="h-4 w-4" aria-hidden="true" /> Perché conta
              </p>
              <RichText text={current.nota} className="text-foreground/90" />
              {current.riferimenti && current.riferimenti.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold">Rif.: </span>
                  {current.riferimenti.join(' · ')}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2">
            {optionsOf(tree, current.id).map((o) => (
              <AnswerCard
                key={o.optionKey}
                label={o.label}
                description={o.descrizione}
                selected={false}
                onSelect={() => choose(o.optionKey)}
                disabled={false}
              />
            ))}
          </div>
        </div>
      ) : (
        <EsitoPro esito={current.esito} />
      )}

      <div className="flex flex-wrap gap-2 print:hidden">
        {steps.length > 0 && (
          <button type="button" className={btn} onClick={() => backTo(steps.length - 1)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Indietro
          </button>
        )}
        {current.type === 'result' && (
          <>
            <button type="button" className={btn} onClick={copyLink}>
              {copiato ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
              {copiato ? 'Link copiato' : 'Copia link'}
            </button>
            <button type="button" className={btn} onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden="true" /> Stampa
            </button>
          </>
        )}
        {steps.length > 0 && (
          <button type="button" className={btn} onClick={() => go([])}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Ricomincia
          </button>
        )}
      </div>
    </div>
  );
}
