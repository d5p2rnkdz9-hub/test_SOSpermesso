'use client';

import { useRef, useState } from 'react';

import { authClient } from '@/lib/auth-client';
import { TIPI_PROFILO } from '@/lib/profilo-shared';

import { C } from '../accedi/stile';
import { disp } from './fonts';

const emailValida = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const tipiValidi = new Set<string>(TIPI_PROFILO.map((t) => t.value));

/* Campi e bottone come .pro-input e .btn.btn-pro di sosflussi.it (assets/pro.css, assets/adesivo.css). */
const etichetta = `text-base font-bold ${disp}`;
const campo =
  'min-h-[48px] w-full rounded-[12px] border-[2.5px] border-[#141414] bg-white px-3.5 py-2.5 text-[17px] outline-none focus-visible:ring-4 focus-visible:ring-[#4D9FFF]/50 aria-[invalid=true]:border-[#B3261E]';
const bottone = `inline-flex min-h-[56px] w-full items-center justify-center rounded-full border-[2.5px] border-[#141414] bg-[#FFD400] px-[22px] text-xl font-bold shadow-[4px_4px_0_#141414] transition-[transform,box-shadow] duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[7px_7px_0_#141414] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#141414] disabled:opacity-60 ${disp}`;

/**
 * «Chiedi un link di prova gratuita», come sosflussi.it/abbonati/: email, che lavoro fai, informativa, poi il magic link.
 * Al primo accesso si completa l'account in /account/benvenuto (il tipo arriva già scelto, ?tipo=), poi si torna a `da`.
 */
export function ProvaForm({ callbackURL, locale }: { callbackURL: string; locale: string }) {
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [msg, setMsg] = useState('');
  const [invalido, setInvalido] = useState<'email' | 'tipo' | 'privacy' | null>(null);
  const [stato, setStato] = useState<'idle' | 'invio' | 'inviato'>('idle');
  const emailRef = useRef<HTMLInputElement>(null);
  const tipoRef = useRef<HTMLSelectElement>(null);
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
    if (!tipiValidi.has(tipo)) {
      setMsg('Scegli che lavoro fai.');
      setInvalido('tipo');
      tipoRef.current?.focus();
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
      newUserCallbackURL: `/${locale}/account/benvenuto?tipo=${encodeURIComponent(tipo)}&da=${encodeURIComponent(callbackURL)}`,
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
        className="rounded-[12px] border-[2.5px] border-[#141414] px-[18px] py-4 text-base"
        style={{ background: C.okTint }}
      >
        <p className={`font-bold ${disp}`}>Controlla la posta</p>
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
        <label htmlFor="prova-email" className={etichetta}>
          La tua email
        </label>
        <input
          ref={emailRef}
          id="prova-email"
          type="email"
          autoComplete="email"
          required
          className={campo}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={invalido === 'email' || undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="prova-tipo" className={etichetta}>
          Che lavoro fai?
        </label>
        <select
          ref={tipoRef}
          id="prova-tipo"
          required
          className={campo}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          aria-invalid={invalido === 'tipo' || undefined}
        >
          <option value="">Scegli…</option>
          {TIPI_PROFILO.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
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
      <button type="submit" className={bottone} disabled={stato === 'invio'}>
        {stato === 'invio' ? 'Invio in corso…' : 'Mandami il link'}
      </button>
    </form>
  );
}
