'use client';

import { Loader2, MessageSquarePlus, Search, SendHorizontal, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ChatEvent, ConversazioneSummary, Fonte, MessaggioView } from '@/lib/chat-pro-types';

import { Markdown } from './Markdown';

/**
 * Client of /api/pro/chat. Reads the NDJSON stream line by line and appends
 * text deltas to the pending assistant bubble; tool events show as a status
 * line ("Cerco nell'archivio: …") so the operator sees what is being looked up.
 */

interface Props {
  conversazioni: ConversazioneSummary[];
  dailyLimit: number;
  maxTurns: number;
  usatiOggi: number;
}

interface Bubble {
  id: string;
  ruolo: 'user' | 'assistant';
  testo: string;
  fonti: Fonte[];
  pending?: boolean;
  status?: string;
}

const BTN = 'rounded-md border-2 border-foreground px-3 py-1.5 text-sm font-bold text-foreground disabled:opacity-60';
const SUGGESTIONS = [
  'Attesa occupazione: quante volte si può rinnovare e con quali requisiti?',
  'Conversione da studio a lavoro subordinato fuori quota: cosa serve?',
  'Protezione speciale: la Questura può negare il rinnovo per assenza di integrazione?',
];

export function ChatPro({ conversazioni: initial, dailyLimit, maxTurns, usatiOggi }: Props) {
  const [conversazioni, setConversazioni] = useState(initial);
  const [current, setCurrent] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [usati, setUsati] = useState(usatiOggi);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const turniUtente = bubbles.filter((b) => b.ruolo === 'user').length;
  const quotaFinita = usati >= dailyLimit;
  const conversazionePiena = turniUtente >= maxTurns;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [bubbles]);

  async function openConversazione(id: string) {
    abortRef.current?.abort();
    setCurrent(id);
    setError('');
    const res = await fetch(`/api/pro/chat/${id}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.messaggi) {
      setError('Non riesco ad aprire la conversazione.');
      return;
    }
    setBubbles(
      (data.messaggi as MessaggioView[]).map((m) => ({ id: String(m.id), ruolo: m.ruolo, testo: m.testo, fonti: m.fonti })),
    );
  }

  function nuova() {
    abortRef.current?.abort();
    setCurrent(null);
    setBubbles([]);
    setError('');
  }

  async function elimina(id: string) {
    const res = await fetch(`/api/pro/chat/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 404) {
      setConversazioni((l) => l.filter((c) => c.id !== id));
      if (current === id) nuova();
    }
  }

  async function send(text: string) {
    const messaggio = text.trim();
    if (!messaggio || busy) return;
    setBusy(true);
    setError('');
    setInput('');
    const pendingId = `p-${Date.now()}`;
    setBubbles((b) => [
      ...b,
      { id: `u-${Date.now()}`, ruolo: 'user', testo: messaggio, fonti: [] },
      { id: pendingId, ruolo: 'assistant', testo: '', fonti: [], pending: true, status: 'Penso…' },
    ]);
    const update = (patch: Partial<Bubble> | ((prev: Bubble) => Partial<Bubble>)) =>
      setBubbles((b) => b.map((x) => (x.id === pendingId ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x)));

    const controller = new AbortController();
    abortRef.current = controller;
    let convId = current;
    try {
      const res = await fetch('/api/pro/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversazioneId: current, messaggio }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        const code = data?.error;
        setError(
          code === 'rate_limited'
            ? `Hai raggiunto il limite di ${dailyLimit} messaggi al giorno. Riprova domani.`
            : code === 'too_many_turns'
              ? 'Questa conversazione è lunga: aprine una nuova.'
              : code === 'login_required'
                ? 'La sessione è scaduta: ricarica la pagina e accedi di nuovo.'
                : code === 'not_configured' || code === 'disabled'
                  ? 'L’assistente non è disponibile al momento.'
                  : 'Non siamo riusciti a inviare il messaggio. Riprova.',
        );
        setBubbles((b) => b.filter((x) => x.id !== pendingId && x.testo !== messaggio));
        return;
      }
      setUsati((n) => n + 1);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const handle = (ev: ChatEvent) => {
        if (ev.t === 'meta') convId = ev.conversazioneId;
        else if (ev.t === 'tool') update({ status: ev.label });
        else if (ev.t === 'text') update((prev) => ({ testo: prev.testo + ev.d, status: undefined }));
        else if (ev.t === 'done') update({ fonti: ev.fonti, pending: false, status: undefined });
        else if (ev.t === 'error') {
          setError(ev.m);
          update({ pending: false, status: undefined });
        }
      };
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (line) handle(JSON.parse(line) as ChatEvent);
        }
      }
      update({ pending: false, status: undefined });
      if (convId && convId !== current) {
        setCurrent(convId);
        setConversazioni((l) => [
          { id: convId!, titolo: messaggio.slice(0, 80), updatedAt: new Date().toISOString() },
          ...l,
        ]);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError('Connessione interrotta. Riprova.');
      update({ pending: false, status: undefined });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Conversazioni */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={nuova} className={`${BTN} inline-flex items-center gap-1.5`} disabled={busy}>
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> Nuova
        </button>
        {conversazioni.length > 0 && (
          <select
            aria-label="Conversazioni precedenti"
            value={current ?? ''}
            onChange={(e) => (e.target.value ? openConversazione(e.target.value) : nuova())}
            className="min-w-0 flex-1 rounded-md border-2 border-foreground bg-background px-2 py-1.5 text-sm text-foreground"
            disabled={busy}
          >
            <option value="">Conversazioni precedenti…</option>
            {conversazioni.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titolo}
              </option>
            ))}
          </select>
        )}
        {current && (
          <button type="button" onClick={() => elimina(current)} className={BTN} aria-label="Elimina conversazione" title="Elimina conversazione" disabled={busy}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Thread */}
      <div className="flex min-h-[40vh] flex-col gap-3 rounded-lg border-2 border-foreground bg-card p-3 shadow-[3px_3px_0_hsl(var(--foreground))]">
        {bubbles.length === 0 && (
          <div className="text-sm text-muted-foreground">
            <p>
              Chiedi di procedure, documenti, prassi delle Questure o circolari. L&apos;assistente cerca
              nell&apos;archivio e nelle schede e cita le fonti: ogni risposta va verificata sul documento
              linkato.
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    disabled={busy || quotaFinita}
                    className="w-full rounded-md border-2 border-dashed border-foreground/40 px-3 py-2 text-start text-sm text-foreground hover:border-foreground disabled:opacity-60"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {bubbles.map((b) =>
          b.ruolo === 'user' ? (
            <div key={b.id} className="ms-6 self-end rounded-lg bg-primary px-3.5 py-2.5 text-[15px] text-primary-foreground">
              {b.testo}
            </div>
          ) : (
            <div key={b.id} className="me-6 self-start rounded-lg border-2 border-foreground bg-background px-3.5 py-2.5 text-foreground">
              {b.status && (
                <p className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  {b.status.startsWith('Cerco') || b.status.startsWith('Leggo') || b.status.startsWith('Apro') ? (
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  )}
                  {b.status}
                </p>
              )}
              {b.testo && <Markdown text={b.testo} />}
              {b.pending && b.testo && <span className="inline-block h-4 w-1.5 animate-pulse bg-foreground align-middle" aria-hidden="true" />}
              {!b.pending && b.fonti.length > 0 && (
                <p className="mt-2 border-t border-foreground/20 pt-2 text-xs text-muted-foreground">
                  Documenti consultati:{' '}
                  {b.fonti.map((f, i) => (
                    <span key={f.id}>
                      {i > 0 && ' · '}
                      <a href={`/it/pro/circolari/${f.id}`} className="underline">
                        {f.titolo.length > 70 ? `${f.titolo.slice(0, 70)}…` : f.titolo}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2"
      >
        <label htmlFor="chat-input" className="sr-only">
          Messaggio
        </label>
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={2}
          maxLength={2000}
          placeholder={quotaFinita ? 'Limite giornaliero raggiunto' : conversazionePiena ? 'Conversazione lunga: aprine una nuova' : 'Scrivi la domanda… (Invio per inviare)'}
          disabled={busy || quotaFinita || conversazionePiena}
          className="min-h-[56px] w-full flex-1 rounded-md border-2 border-foreground bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
        />
        <button
          type="submit"
          disabled={busy || !input.trim() || quotaFinita || conversazionePiena}
          className="inline-flex h-[56px] items-center gap-1.5 rounded-md border-2 border-foreground bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] disabled:opacity-60"
          aria-label="Invia"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <SendHorizontal className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        {usati}/{dailyLimit} messaggi oggi · informazioni operative, non consulenza legale · le conversazioni restano nel tuo account
      </p>
    </div>
  );
}
