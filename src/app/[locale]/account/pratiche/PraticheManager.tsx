'use client';

import { Archive, ArchiveRestore, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { PermitListItem } from '@/lib/permits-list.generated';
import type { Pratica, PraticaInput, ValidationError } from '@/lib/pratiche';

/**
 * Client side of the PRO scadenziario: list + create/edit form, talking to
 * /api/pro/pratiche. Server state is the truth: every mutation replaces the
 * local row with what the API returns, so reminder flags stay accurate.
 */

interface Props {
  initial: Pratica[];
  permits: readonly PermitListItem[];
}

type FormState = { riferimento: string; permessoSlug: string; scadenza: string; note: string };

const EMPTY_FORM: FormState = { riferimento: '', permessoSlug: '', scadenza: '', note: '' };

const BOX = 'rounded-lg border-2 border-foreground bg-card shadow-[3px_3px_0_hsl(var(--foreground))]';
const BTN = 'rounded-md border-2 border-foreground px-3 py-1.5 text-sm font-bold text-foreground disabled:opacity-60';
const BTN_PRIMARY =
  'rounded-md border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] disabled:opacity-60';
const FIELD =
  'w-full rounded-md border-2 border-foreground bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm';

function todayInItaly(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });
}

function daysUntil(dateIso: string): number {
  const [y, m, d] = dateIso.split('-').map(Number);
  const [ty, tm, td] = todayInItaly().split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86_400_000);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function checklistUrl(permit: PermitListItem | undefined, slug: string): string {
  return `https://www.sospermesso.it/permesso-${slug}.html${permit?.rinnovo ? '#rinnovo' : '#cose'}`;
}

/** Days-left badge: tone follows the reminder thresholds (30/60/90). */
function Scadenza({ iso }: { iso: string }) {
  const days = daysUntil(iso);
  let tone = 'bg-background text-foreground';
  let label = `tra ${days} giorni`;
  if (days < 0) {
    tone = 'bg-destructive text-white';
    label = `scaduto da ${-days} ${-days === 1 ? 'giorno' : 'giorni'}`;
  } else if (days === 0) {
    tone = 'bg-destructive text-white';
    label = 'scade oggi';
  } else if (days <= 30) {
    tone = 'bg-destructive text-white';
  } else if (days <= 60) {
    tone = 'bg-orange-500 text-white';
  } else if (days <= 90) {
    tone = 'bg-primary text-primary-foreground';
  }
  if (days === 1) label = 'scade domani';
  return (
    <span className={`inline-block rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold ${tone}`}>
      {formatDate(iso)} · {label}
    </span>
  );
}

function errorsByField(errors: ValidationError[] | undefined): Partial<Record<keyof PraticaInput, string>> {
  const out: Partial<Record<keyof PraticaInput, string>> = {};
  for (const e of errors ?? []) out[e.field] = e.message;
  return out;
}

function PraticaForm({
  permits,
  initial,
  onCancel,
  onSaved,
  submitLabel,
  endpoint,
  method,
}: {
  permits: readonly PermitListItem[];
  initial: FormState;
  onCancel?: () => void;
  onSaved: (p: Pratica) => void;
  submitLabel: string;
  endpoint: string;
  method: 'POST' | 'PATCH';
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PraticaInput, string>>>({});
  const [genericError, setGenericError] = useState('');

  const grouped = useMemo(() => {
    const map = new Map<string, PermitListItem[]>();
    for (const p of permits) {
      const key = p.categoria ?? 'Altri';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()];
  }, [permits]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setGenericError('');
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 422) {
        setErrors(errorsByField(data?.errors));
        return;
      }
      if (!res.ok || !data?.pratica) {
        setGenericError(
          res.status === 401
            ? 'La sessione è scaduta: ricarica la pagina e accedi di nuovo.'
            : 'Non siamo riusciti a salvare. Riprova.',
        );
        return;
      }
      onSaved(data.pratica as Pratica);
      if (method === 'POST') setForm(EMPTY_FORM);
    } catch {
      setGenericError('Non siamo riusciti a salvare. Riprova.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="riferimento" className="mb-1 block text-sm font-semibold text-foreground">
          Persona o riferimento
        </label>
        <input
          id="riferimento"
          className={FIELD}
          value={form.riferimento}
          onChange={(e) => setForm({ ...form, riferimento: e.target.value })}
          placeholder="Es. Rossi M. oppure pratica 2026/14"
          maxLength={80}
          required
        />
        {errors.riferimento && <p className="mt-1 text-xs font-semibold text-destructive">{errors.riferimento}</p>}
      </div>

      <div>
        <label htmlFor="permesso" className="mb-1 block text-sm font-semibold text-foreground">
          Permesso di soggiorno
        </label>
        <select
          id="permesso"
          className={FIELD}
          value={form.permessoSlug}
          onChange={(e) => setForm({ ...form, permessoSlug: e.target.value })}
          required
        >
          <option value="">Scegli…</option>
          {grouped.map(([cat, items]) => (
            <optgroup key={cat} label={cat}>
              {items.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.titolo}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.permessoSlug && <p className="mt-1 text-xs font-semibold text-destructive">{errors.permessoSlug}</p>}
      </div>

      <div>
        <label htmlFor="scadenza" className="mb-1 block text-sm font-semibold text-foreground">
          Data di scadenza del permesso
        </label>
        <input
          id="scadenza"
          type="date"
          className={FIELD}
          value={form.scadenza}
          onChange={(e) => setForm({ ...form, scadenza: e.target.value })}
          required
        />
        {errors.scadenza && <p className="mt-1 text-xs font-semibold text-destructive">{errors.scadenza}</p>}
      </div>

      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-semibold text-foreground">
          Note <span className="font-normal text-muted-foreground">(facoltative)</span>
        </label>
        <textarea
          id="note"
          className={`${FIELD} min-h-[72px]`}
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          maxLength={500}
          placeholder="Es. manca il contratto aggiornato"
        />
        {errors.note && <p className="mt-1 text-xs font-semibold text-destructive">{errors.note}</p>}
      </div>

      {genericError && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {genericError}
        </p>
      )}

      <div className="mt-1 flex items-center gap-2">
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>
          {busy ? 'Salvo…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={BTN}>
            Annulla
          </button>
        )}
      </div>
    </form>
  );
}

function PraticaRow({
  pratica,
  permits,
  onChange,
  onDelete,
}: {
  pratica: Pratica;
  permits: readonly PermitListItem[];
  onChange: (p: Pratica) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const permit = permits.find((p) => p.slug === pratica.permessoSlug);

  async function patch(body: unknown) {
    setBusy(true);
    try {
      const res = await fetch(`/api/pro/pratiche/${pratica.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.pratica) onChange(data.pratica as Pratica);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/pro/pratiche/${pratica.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 404) onDelete(pratica.id);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <li className={`${BOX} p-4`}>
        <PraticaForm
          permits={permits}
          initial={{
            riferimento: pratica.riferimento,
            permessoSlug: pratica.permessoSlug,
            scadenza: pratica.scadenza,
            note: pratica.note ?? '',
          }}
          endpoint={`/api/pro/pratiche/${pratica.id}`}
          method="PATCH"
          submitLabel="Salva"
          onCancel={() => setEditing(false)}
          onSaved={(p) => {
            onChange(p);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`${BOX} p-4 ${pratica.archiviata ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground">{pratica.riferimento}</p>
          <p className="text-sm text-muted-foreground">
            {permit?.emoji ? `${permit.emoji} ` : ''}
            {pratica.permessoTitolo}
          </p>
        </div>
        {!pratica.archiviata && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={busy}
            className="shrink-0 rounded-md border-2 border-foreground p-1.5 text-foreground disabled:opacity-60"
            aria-label="Modifica"
            title="Modifica"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-2">
        {pratica.archiviata ? (
          <span className="inline-block rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
            archiviata · scadeva il {formatDate(pratica.scadenza)}
          </span>
        ) : (
          <Scadenza iso={pratica.scadenza} />
        )}
      </div>

      {pratica.note && <p className="mt-2 whitespace-pre-line text-sm text-foreground">{pratica.note}</p>}

      {!pratica.archiviata && pratica.promemoriaInviati.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Promemoria inviati: {pratica.promemoriaInviati.map((g) => `${g} gg`).join(', ')}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={checklistUrl(permit, pratica.permessoSlug)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BTN} inline-flex items-center gap-1.5`}
        >
          {permit?.rinnovo ? 'Documenti per il rinnovo' : 'Scheda del permesso'}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => patch({ archiviata: !pratica.archiviata })}
          disabled={busy}
          className={`${BTN} inline-flex items-center gap-1.5`}
        >
          {pratica.archiviata ? (
            <>
              <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" /> Riattiva
            </>
          ) : (
            <>
              <Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archivia
            </>
          )}
        </button>
        {confirmDelete ? (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-foreground">Eliminare?</span>
            <button type="button" onClick={remove} disabled={busy} className="rounded-md bg-destructive px-2.5 py-1 text-sm font-bold text-white">
              Sì
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className={BTN} aria-label="Annulla">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground underline"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Elimina
          </button>
        )}
      </div>
    </li>
  );
}

export function PraticheManager({ initial, permits }: Props) {
  const [pratiche, setPratiche] = useState<Pratica[]>(initial);
  const [adding, setAdding] = useState(initial.length === 0);
  const [showArchived, setShowArchived] = useState(false);

  const attive = pratiche.filter((p) => !p.archiviata).sort((a, b) => a.scadenza.localeCompare(b.scadenza));
  const archiviate = pratiche.filter((p) => p.archiviata).sort((a, b) => b.scadenza.localeCompare(a.scadenza));

  function upsert(p: Pratica) {
    setPratiche((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]));
  }

  return (
    <div className="flex flex-col gap-5">
      {adding ? (
        <section className={`${BOX} p-4`}>
          <h2 className="mb-3 text-lg font-extrabold text-foreground">Nuova pratica</h2>
          <PraticaForm
            permits={permits}
            initial={EMPTY_FORM}
            endpoint="/api/pro/pratiche"
            method="POST"
            submitLabel="Aggiungi allo scadenziario"
            onCancel={pratiche.length > 0 ? () => setAdding(false) : undefined}
            onSaved={(p) => {
              upsert(p);
              setAdding(false);
            }}
          />
        </section>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`${BTN_PRIMARY} inline-flex w-fit items-center gap-2`}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nuova pratica
        </button>
      )}

      {attive.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            In scadenza · {attive.length}
          </h2>
          <ul className="flex flex-col gap-3">
            {attive.map((p) => (
              <PraticaRow key={p.id} pratica={p} permits={permits} onChange={upsert} onDelete={(id) => setPratiche((l) => l.filter((x) => x.id !== id))} />
            ))}
          </ul>
        </section>
      )}

      {attive.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">Nessuna pratica attiva.</p>
      )}

      {archiviate.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground underline"
          >
            Archiviate · {archiviate.length} {showArchived ? '▾' : '▸'}
          </button>
          {showArchived && (
            <ul className="flex flex-col gap-3">
              {archiviate.map((p) => (
                <PraticaRow key={p.id} pratica={p} permits={permits} onChange={upsert} onDelete={(id) => setPratiche((l) => l.filter((x) => x.id !== id))} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
