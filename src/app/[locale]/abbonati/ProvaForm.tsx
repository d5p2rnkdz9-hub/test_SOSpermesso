'use client';

import { useRef, useState } from 'react';

import { authClient } from '@/lib/auth-client';

import { C, btnPro, input, label } from '../accedi/stile';

const emailValida = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * «Chiedi un link di prova gratuita», come sosflussi.it/abbonati/: email + informativa, poi il magic link.
 * Al primo accesso si completa l'account (nome, tipo di struttura) in /account/benvenuto, poi si torna a `da`.
 */
export function ProvaForm({ callbackURL, locale }: { callbackURL: string; locale: string }) {
  const [email, setEmail] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [msg, setMsg] = useState('');
  const [invalido, setInvalido] = useState<'email' | 'privacy' | null>(null);
  const [stato, setStato] = useState<'idle' | 'invio' | 'inviato'>('idle');
  const emailRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const okRef = useRef<HTMLDivElement>(null);

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setInvalido(null);
    const indirizzo = email.trim();
    if (!emailValida(indirizzo)) {
      setMsg('Scrivi un indirizzo email valido.');
      setInvalido('email');
      emailRef.current?.focus();
      return;
    }
    if (!privacy) {
      setMsg('Per continuare devi aver letto l’informativa privacy.');
      setInvalido('privacy');
      privacyRef.current?.focus();
      return;
    }
    setStato('invio');
    const { error } = await authClient.signIn.magicLink({
      email: indirizzo,
      callbackURL,
      newUserCallbackURL: `/${locale}/account/benvenuto?da=${encodeURIComponent(callbackURL)}`,
      errorCallbackURL: `/${locale}/accedi?errore=link`,
    });
    if (error) {
      setStato('idle');
      setMsg(
        error.status === 429
          ? 'Troppi tentativi. Aspetta qualche minuto e riprova.'
          : 'Non siamo riusciti a inviare il link. Controlla l’indirizzo e riprova.',
      );
      return;
    }
    setStato('inviato');
    requestAnimationFrame(() => okRef.current?.focus());
  }

  if (stato === 'inviato') {
    return (
      <div
        ref={okRef}
        tabIndex={-1}
        className="rounded-xl border-[2.5px] border-[#141414] px-[18px] py-4 text-base"
        style={{ background: C.okTint }}
      >
        <p className="font-bold">Controlla la posta</p>
        <p className="mt-2">
          Abbiamo mandato un link a <strong>{email.trim()}</strong>. Aprilo entro 10 minuti per entrare in SOS Permesso
          PRO. Se non lo trovi, guarda nello spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={invia} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="prova-email" className={label}>
          La tua email
        </label>
        <input
          ref={emailRef}
          id="prova-email"
          type="email"
          autoComplete="email"
          required
          className={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={invalido === 'email' || undefined}
        />
      </div>
      <label className="flex items-start gap-3 text-base">
        <input
          ref={privacyRef}
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-[#141414]"
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          aria-invalid={invalido === 'privacy' || undefined}
        />
        <span>
          Ho letto l&apos;
          <a
            href={`/${locale}/accedi/informativa`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            informativa privacy
          </a>
          .
        </span>
      </label>
      <p aria-live="polite" className="text-base font-semibold empty:hidden" style={{ color: C.errore }}>
        {msg}
      </p>
      <button type="submit" className={`${btnPro} min-h-[56px] w-full text-xl`} disabled={stato === 'invio'}>
        {stato === 'invio' ? 'Invio in corso…' : 'Mandami il link'}
      </button>
    </form>
  );
}
