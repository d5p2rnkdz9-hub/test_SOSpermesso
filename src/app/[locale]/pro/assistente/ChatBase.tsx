'use client';

import { Loader2, MessageSquarePlus, SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Markdown } from './Markdown';

/**
 * Chatbot «normale» di SOS Permesso nell'area PRO (client di /api/pro/chat-base).
 * La conversazione vive solo nella pagina: la funzione del sito non salva nulla.
 */

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  maxTurns: number;
  maxChars: number;
}

const BTN = 'rounded-md border-2 border-foreground px-3 py-1.5 text-sm font-bold text-foreground disabled:opacity-60';
const SUGGESTIONS = [
  'Quali documenti servono per rinnovare il permesso per lavoro subordinato?',
  'Il permesso per attesa occupazione si può convertire?',
  'Quanto costa il kit postale per il primo rilascio?',
];

export function ChatBase({ maxTurns, maxChars }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const turni = msgs.filter((m) => m.role === 'user').length;
  const piena = turni >= maxTurns;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [msgs]);

  function nuova() {
    abortRef.current?.abort();
    setMsgs([]);
    setError('');
    setBusy(false);
  }

  async function invia(testo: string) {
    const domanda = testo.trim();
    if (!domanda || busy || piena) return;
    setError('');
    setInput('');
    const storia: Msg[] = [...msgs, { role: 'user', content: domanda }];
    setMsgs([...storia, { role: 'assistant', content: '' }]);
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch('/api/pro/chat-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: storia }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        let m = 'Si è verificato un errore. Riprova più tardi.';
        try {
          const j = await res.json();
          if (typeof j.error === 'string' && j.error.length > 12) m = j.error;
        } catch {
          /* risposta non JSON */
        }
        throw new Error(m);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...storia, { role: 'assistant', content: acc }]);
      }
    } catch (err) {
      if (ac.signal.aborted) return;
      setMsgs(storia.slice(0, -1));
      setInput(domanda);
      setError(err instanceof Error ? err.message : 'Errore di connessione. Riprova.');
    } finally {
      if (abortRef.current === ac) setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={nuova} className={`${BTN} inline-flex items-center gap-1.5`} disabled={msgs.length === 0}>
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> Nuova conversazione
        </button>
      </div>

      <div className="flex min-h-[40vh] flex-col gap-3 rounded-lg border-2 border-foreground bg-card p-3 shadow-[3px_3px_0_hsl(var(--foreground))]">
        {msgs.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Fai una domanda su un permesso di soggiorno: documenti, costi, procedure, conversioni.
            <ul className="mt-3 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => invia(s)}
                    className="w-full rounded-md border-2 border-dashed border-foreground/40 px-3 py-2 text-start text-sm text-foreground hover:border-foreground"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="ms-6 self-end rounded-lg bg-primary px-3.5 py-2.5 text-[15px] text-primary-foreground">
              {m.content}
            </div>
          ) : (
            <div key={i} className="me-6 self-start rounded-lg border-2 border-foreground bg-background px-3.5 py-2.5 text-foreground">
              {m.content ? (
                <Markdown text={m.content} />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" aria-label="Sto scrivendo" />
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
      {piena && (
        <p className="text-sm font-semibold">Hai raggiunto {maxTurns} domande in questa conversazione: iniziane una nuova.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          invia(input);
        }}
        className="flex items-end gap-2"
      >
        <label htmlFor="chat-base-input" className="sr-only">
          La tua domanda
        </label>
        <textarea
          id="chat-base-input"
          value={input}
          maxLength={maxChars}
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              invia(input);
            }
          }}
          placeholder="Scrivi la tua domanda…"
          disabled={piena}
          className="min-h-[56px] w-full flex-1 rounded-md border-2 border-foreground bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
        />
        <button
          type="submit"
          disabled={busy || piena || !input.trim()}
          className="inline-flex h-[56px] items-center gap-1.5 rounded-md border-2 border-foreground bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <SendHorizontal className="h-4 w-4" aria-hidden="true" />}
          Invia
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        Risposte generate automaticamente dalle schede di SOS Permesso: non sono una consulenza legale. Verifica sempre le
        informazioni importanti.
      </p>
    </div>
  );
}
