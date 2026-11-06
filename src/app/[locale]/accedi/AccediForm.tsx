'use client';

import { MailCheck } from 'lucide-react';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';

interface AccediFormProps {
  callbackURL: string;
  locale: string;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function AccediForm({ callbackURL, locale }: AccediFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const { error } = await authClient.signIn.magicLink({
      email: email.trim(),
      name: name.trim() || undefined,
      callbackURL,
      newUserCallbackURL: callbackURL,
      errorCallbackURL: `/${locale}/accedi?errore=link`,
    });
    if (error) {
      setStatus('error');
      setErrorMsg(
        error.status === 429
          ? 'Troppi tentativi. Aspetta un minuto e riprova.'
          : 'Non siamo riusciti a inviare il link. Controlla l’indirizzo e riprova.',
      );
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="flex gap-3 rounded-lg border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_hsl(var(--foreground))]">
        <MailCheck className="h-6 w-6 shrink-0 text-foreground" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-bold text-foreground">Controlla la posta</p>
          <p className="mt-1 text-muted-foreground">
            Abbiamo mandato un link a <strong>{email}</strong>. Vale 10 minuti e si usa una
            volta sola. Se non lo trovi, guarda nello spam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border-2 border-foreground bg-white px-3 py-2 text-base font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
        <span>
          Nome e organizzazione <span className="font-normal text-muted-foreground">(facoltativo)</span>
        </span>
        <input
          type="text"
          autoComplete="name"
          maxLength={120}
          placeholder="Es. Maria Rossi — CAF di Torino"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border-2 border-foreground bg-white px-3 py-2 text-base font-normal"
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          Ho letto l&apos;
          <a
            href="https://www.sospermesso.it/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--link))] underline"
          >
            informativa privacy
          </a>{' '}
          e accetto che il mio indirizzo email venga usato per l&apos;accesso.
        </span>
      </label>
      {status === 'error' && (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {errorMsg}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-md border-2 border-foreground bg-primary px-4 py-2.5 font-bold text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] disabled:opacity-60"
      >
        {status === 'sending' ? 'Invio in corso…' : 'Mandami il link'}
      </button>
    </form>
  );
}
