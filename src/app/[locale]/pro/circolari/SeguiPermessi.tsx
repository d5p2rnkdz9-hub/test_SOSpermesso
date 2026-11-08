'use client';

import { BellRing } from 'lucide-react';
import { useState } from 'react';

import { SEGUI_TUTTI } from '@/lib/circolari-shared';
import type { PermitListItem } from '@/lib/permits-list.generated';

/**
 * Checkbox list of permits to follow: PUT /api/pro/segui replaces the whole
 * list. Saving is explicit (one button) so an operator can tick several
 * boxes without firing a request per click.
 */
export function SeguiPermessi({ initial, permits }: { initial: string[]; permits: readonly PermitListItem[] }) {
  const [open, setOpen] = useState(initial.length > 0);
  const [slugs, setSlugs] = useState<Set<string>>(new Set(initial));
  const [saved, setSaved] = useState<Set<string>>(new Set(initial));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const tutti = slugs.has(SEGUI_TUTTI);
  const dirty = slugs.size !== saved.size || [...slugs].some((s) => !saved.has(s));

  function toggle(slug: string) {
    setSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setMsg('');
  }

  async function save() {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/api/pro/segui', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: [...slugs] }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.slugs) {
        setMsg('Non siamo riusciti a salvare. Riprova.');
        return;
      }
      setSaved(new Set(data.slugs as string[]));
      setSlugs(new Set(data.slugs as string[]));
      setMsg(data.slugs.length ? 'Salvato: ti avviseremo via email.' : 'Salvato: nessun avviso attivo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_hsl(var(--foreground))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-start"
        aria-expanded={open}
      >
        <BellRing className="h-5 w-5 shrink-0 text-foreground" aria-hidden="true" />
        <span className="font-bold text-foreground">Avvisami sulle nuove circolari</span>
        <span className="ms-auto text-xs text-muted-foreground">
          {saved.size === 0 ? 'nessun avviso' : saved.has(SEGUI_TUTTI) ? 'tutte' : `${saved.size} permess${saved.size === 1 ? 'o' : 'i'}`}
        </span>
      </button>

      {open && (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            Un&apos;email quando entra in archivio una circolare sui permessi che scegli. Al massimo una al giorno.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <input type="checkbox" checked={tutti} onChange={() => toggle(SEGUI_TUTTI)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            Tutte le circolari in materia di soggiorno
          </label>
          {!tutti && (
            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {permits.map((p) => (
                <li key={p.slug}>
                  <label className="flex items-start gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={slugs.has(p.slug)}
                      onChange={() => toggle(p.slug)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                    />
                    <span>{p.titolo}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy || !dirty}
              className="rounded-md border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] disabled:opacity-60"
            >
              {busy ? 'Salvo…' : 'Salva'}
            </button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
