'use client';

import { useEffect, useRef, useState } from 'react';

import { authClient } from '@/lib/auth-client';

import { C, box, btnPro, btnSecondario, card, cardChiara, input, label, linkBtn } from './stile';

interface AccediFormProps {
  callbackURL: string;
  locale: string;
  /** Token dall'email per la password: mostra «Imposta una nuova password». */
  token: string;
  linkScaduto: boolean;
  accountUnico: boolean;
}

type Avviso = { testo: string; tipo: 'ok' | 'attenzione' } | null;

const GENERICO = 'Qualcosa non ha funzionato. Riprova tra poco.';
const TROPPI = 'Troppi tentativi. Aspetta qualche minuto e riprova.';
const emailValida = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function Msg({ id, testo, ok = false }: { id: string; testo: string; ok?: boolean }) {
  return (
    <p id={id} aria-live="polite" className="min-h-0 text-base font-semibold empty:hidden" style={{ color: ok ? undefined : C.errore }}>
      {testo}
    </p>
  );
}

/**
 * Accedi a SOS Permesso PRO, come sosflussi.it/accedi/: magic link (crea anche
 * l'account) oppure email + password; reset della password via email.
 */
export function AccediForm({ callbackURL, locale, token, linkScaduto, accountUnico }: AccediFormProps) {
  const [avviso, setAvviso] = useState<Avviso>(
    linkScaduto ? { testo: 'Il link è scaduto o è già stato usato. Chiedine uno nuovo qui sotto.', tipo: 'attenzione' } : null,
  );
  const [nuovaPw, setNuovaPw] = useState(Boolean(token));

  // ---------- Magic link ----------
  const [email, setEmail] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');
  const [linkInvalido, setLinkInvalido] = useState<'email' | 'privacy' | null>(null);
  const [linkStato, setLinkStato] = useState<'idle' | 'invio' | 'inviato'>('idle');
  const inviatoRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);

  async function inviaLink(e: React.FormEvent) {
    e.preventDefault();
    setLinkMsg('');
    setLinkInvalido(null);
    const indirizzo = email.trim();
    if (!emailValida(indirizzo)) {
      setLinkMsg('Scrivi un indirizzo email valido.');
      setLinkInvalido('email');
      emailRef.current?.focus();
      return;
    }
    if (!privacy) {
      setLinkMsg('Per continuare devi accettare l’informativa privacy.');
      setLinkInvalido('privacy');
      privacyRef.current?.focus();
      return;
    }
    setLinkStato('invio');
    const { error } = await authClient.signIn.magicLink({
      email: indirizzo,
      callbackURL,
      // Primo accesso: completa l'account prima di tornare dove si era.
      newUserCallbackURL: `/${locale}/account/benvenuto?da=${encodeURIComponent(callbackURL)}`,
      errorCallbackURL: `/${locale}/accedi?errore=link`,
    });
    if (error) {
      setLinkStato('idle');
      setLinkMsg(error.status === 429 ? TROPPI : 'Non siamo riusciti a inviare il link. Controlla l’indirizzo e riprova.');
      return;
    }
    setLinkStato('inviato');
  }
  useEffect(() => {
    if (linkStato === 'inviato') inviatoRef.current?.focus();
  }, [linkStato]);

  // ---------- Email + password ----------
  const [pwAperto, setPwAperto] = useState(false);
  const [pwEmail, setPwEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwInvalido, setPwInvalido] = useState<'email' | 'password' | null>(null);
  const [pwInvio, setPwInvio] = useState(false);
  const pwEmailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  async function entra(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg('');
    setPwInvalido(null);
    const indirizzo = pwEmail.trim();
    if (!emailValida(indirizzo)) {
      setPwMsg('Scrivi un indirizzo email valido.');
      setPwInvalido('email');
      pwEmailRef.current?.focus();
      return;
    }
    if (!pw) {
      setPwMsg('Scrivi la password.');
      setPwInvalido('password');
      pwRef.current?.focus();
      return;
    }
    setPwInvio(true);
    const { error } = await authClient.signIn.email({ email: indirizzo, password: pw, callbackURL, rememberMe: true });
    if (!error) {
      window.location.assign(callbackURL);
      return;
    }
    setPwInvio(false);
    if (error.status === 429) return setPwMsg(TROPPI);
    if (error.status === 401 || error.status === 400) {
      setPwMsg('Email o password non corrette. Se non hai mai impostato una password, entra con il link via email.');
      setPwInvalido('password');
      pwRef.current?.focus();
      return;
    }
    setPwMsg(GENERICO);
  }

  // ---------- Password dimenticata ----------
  const [resetAperto, setResetAperto] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState<{ testo: string; ok: boolean }>({ testo: '', ok: false });
  const [resetInvio, setResetInvio] = useState(false);
  const resetRef = useRef<HTMLInputElement>(null);

  function toggleReset() {
    const apri = !resetAperto;
    setResetAperto(apri);
    if (apri && !resetEmail) setResetEmail(pwEmail.trim());
  }
  useEffect(() => {
    if (resetAperto) resetRef.current?.focus();
  }, [resetAperto]);

  async function chiediReset(e: React.FormEvent) {
    e.preventDefault();
    const indirizzo = resetEmail.trim();
    if (!emailValida(indirizzo)) {
      setResetMsg({ testo: 'Scrivi un indirizzo email valido.', ok: false });
      resetRef.current?.focus();
      return;
    }
    setResetMsg({ testo: '', ok: false });
    setResetInvio(true);
    const { error } = await authClient.requestPasswordReset({ email: indirizzo, redirectTo: `/${locale}/accedi` });
    setResetInvio(false);
    if (error) {
      setResetMsg({ testo: error.status === 429 ? TROPPI : GENERICO, ok: false });
      return;
    }
    // Stessa risposta che l'account esista o no (non diciamo quali indirizzi sono registrati).
    setResetMsg({
      testo: `Se ${indirizzo} ha un account, ti abbiamo mandato un link per impostare la password. Vale per poco tempo: se non lo trovi, guarda nello spam.`,
      ok: true,
    });
  }

  // ---------- Nuova password (dal link via email) ----------
  const [np, setNp] = useState('');
  const [npRipeti, setNpRipeti] = useState('');
  const [npMsg, setNpMsg] = useState('');
  const [npInvalido, setNpInvalido] = useState<'np' | 'ripeti' | null>(null);
  const [npInvio, setNpInvio] = useState(false);
  const npTitoloRef = useRef<HTMLHeadingElement>(null);
  const npRef = useRef<HTMLInputElement>(null);
  const npRipetiRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (nuovaPw) npTitoloRef.current?.focus();
  }, [nuovaPw]);

  async function salvaPassword(e: React.FormEvent) {
    e.preventDefault();
    setNpMsg('');
    setNpInvalido(null);
    if (np.length < 10) {
      setNpMsg('La password deve avere almeno 10 caratteri.');
      setNpInvalido('np');
      npRef.current?.focus();
      return;
    }
    if (np !== npRipeti) {
      setNpMsg('Le due password non sono uguali.');
      setNpInvalido('ripeti');
      npRipetiRef.current?.focus();
      return;
    }
    setNpInvio(true);
    const { error } = await authClient.resetPassword({ newPassword: np, token });
    setNpInvio(false);
    if (error) {
      setNpMsg(
        error.status === 400
          ? 'Il link per la password è scaduto o è già stato usato. Chiedine uno nuovo da «Password dimenticata o da impostare?».'
          : GENERICO,
      );
      return;
    }
    // Fatto: si torna al modulo di accesso con la password aperta.
    const da = new URLSearchParams(window.location.search).get('da');
    window.history.replaceState(null, '', window.location.pathname + (da ? `?da=${encodeURIComponent(da)}` : ''));
    setNuovaPw(false);
    setPwAperto(true);
    setAvviso({ testo: 'Password salvata. Ora entra con la tua email e la nuova password.', tipo: 'ok' });
    setTimeout(() => pwEmailRef.current?.focus(), 0);
  }

  return (
    <>
      {avviso && (
        <div role="alert" className={box} style={{ background: avviso.tipo === 'ok' ? C.okTint : C.warnTint }}>
          {avviso.testo}
        </div>
      )}

      {nuovaPw ? (
        <section className={card} aria-labelledby="nuova-password-titolo">
          <h2 id="nuova-password-titolo" ref={npTitoloRef} tabIndex={-1} className="text-2xl font-extrabold outline-none">
            Imposta una nuova password
          </h2>
          <form className="mt-4 grid gap-4" onSubmit={salvaPassword} noValidate>
            <div className="grid gap-1.5">
              <label htmlFor="np-password" className={label}>
                Nuova password
              </label>
              <input
                ref={npRef}
                className={input}
                type="password"
                id="np-password"
                autoComplete="new-password"
                minLength={10}
                required
                aria-describedby="np-aiuto"
                aria-invalid={npInvalido === 'np' || undefined}
                value={np}
                onChange={(e) => setNp(e.target.value)}
              />
              <span id="np-aiuto" className="text-sm" style={{ color: C.muted }}>
                Almeno 10 caratteri.
              </span>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="np-ripeti" className={label}>
                Ripeti la password
              </label>
              <input
                ref={npRipetiRef}
                className={input}
                type="password"
                id="np-ripeti"
                autoComplete="new-password"
                minLength={10}
                required
                aria-invalid={npInvalido === 'ripeti' || undefined}
                value={npRipeti}
                onChange={(e) => setNpRipeti(e.target.value)}
              />
            </div>
            <Msg id="np-msg" testo={npMsg} />
            <div>
              <button type="submit" className={btnPro} disabled={npInvio}>
                {npInvio ? 'Salvo…' : 'Salva la password'}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="flex flex-col gap-6">
          <section className={card} aria-labelledby="link-titolo">
            <h2 id="link-titolo" className="text-2xl font-extrabold">
              Entra con un link via email
            </h2>
            <p className="mt-2 text-base">
              Niente password: inserisci la tua email e ti mandiamo un link per entrare. Se non hai ancora un account,
              lo creiamo con lo stesso link.
            </p>
            {linkStato === 'inviato' ? (
              <div ref={inviatoRef} tabIndex={-1} className={`${box} mt-4 outline-none`} style={{ background: C.okTint }}>
                <p className="font-bold">Controlla la posta</p>
                <p className="mt-1.5">
                  Abbiamo mandato un link a <strong>{email.trim()}</strong>. Vale 10 minuti e si usa una volta sola. Se
                  non lo trovi, guarda nello spam.
                </p>
              </div>
            ) : (
              <form className="mt-4 grid gap-4" onSubmit={inviaLink} noValidate>
                <div className="grid gap-1.5">
                  <label htmlFor="link-email" className={label}>
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    className={input}
                    type="email"
                    id="link-email"
                    autoComplete="email"
                    required
                    aria-invalid={linkInvalido === 'email' || undefined}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <label className="flex items-start gap-2.5 text-base">
                  <input
                    ref={privacyRef}
                    type="checkbox"
                    id="link-privacy"
                    required
                    aria-invalid={linkInvalido === 'privacy' || undefined}
                    checked={privacy}
                    onChange={(e) => setPrivacy(e.target.checked)}
                    className="mt-0.5 h-[22px] w-[22px] shrink-0 accent-[#141414]"
                  />
                  <span>
                    Ho letto l&apos;
                    <a
                      href="https://www.sospermesso.it/privacy-policy.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      informativa privacy
                    </a>{' '}
                    e accetto che il mio indirizzo email venga usato per l&apos;accesso.
                  </span>
                </label>
                {accountUnico && (
                  <p className="text-sm" style={{ color: C.muted }}>
                    Con lo stesso indirizzo accedi anche a SOS Flussi PRO: l&apos;account è unico.
                  </p>
                )}
                <Msg id="link-msg" testo={linkMsg} />
                <div>
                  <button type="submit" className={btnPro} disabled={linkStato === 'invio'}>
                    {linkStato === 'invio' ? 'Invio in corso…' : 'Mandami il link'}
                  </button>
                </div>
              </form>
            )}
          </section>

          <p
            aria-hidden="true"
            className="flex items-center gap-3.5 text-sm font-bold uppercase tracking-[.06em] before:flex-1 before:border-t-2 before:border-dashed before:border-[#141414]/35 before:content-[''] after:flex-1 after:border-t-2 after:border-dashed after:border-[#141414]/35 after:content-['']"
            style={{ color: C.muted }}
          >
            oppure
          </p>

          <details
            className={`${cardChiara} group`}
            style={{ background: C.brandTint }}
            open={pwAperto}
            onToggle={(e) => setPwAperto(e.currentTarget.open)}
          >
            <summary className="flex min-h-[48px] cursor-pointer list-none items-center gap-2.5 text-xl font-extrabold [&::-webkit-details-marker]:hidden">
              Hai una password?
              <span
                aria-hidden="true"
                className="ms-auto h-[9px] w-[9px] rotate-45 border-b-[2.5px] border-r-[2.5px] border-[#141414] transition-transform group-open:-rotate-[135deg]"
              />
            </summary>
            <p className="mt-3 text-base">Se hai impostato una password, puoi entrare anche così.</p>
            <form className="mt-4 grid gap-4" onSubmit={entra} noValidate>
              <div className="grid gap-1.5">
                <label htmlFor="pw-email" className={label}>
                  Email
                </label>
                <input
                  ref={pwEmailRef}
                  className={input}
                  type="email"
                  id="pw-email"
                  autoComplete="username"
                  required
                  aria-invalid={pwInvalido === 'email' || undefined}
                  value={pwEmail}
                  onChange={(e) => setPwEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="pw-password" className={label}>
                  Password
                </label>
                <input
                  ref={pwRef}
                  className={input}
                  type="password"
                  id="pw-password"
                  autoComplete="current-password"
                  required
                  aria-invalid={pwInvalido === 'password' || undefined}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
              </div>
              <Msg id="pw-msg" testo={pwMsg} />
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className={btnPro} disabled={pwInvio}>
                  {pwInvio ? 'Accesso in corso…' : 'Entra'}
                </button>
                <button
                  type="button"
                  className={linkBtn}
                  aria-expanded={resetAperto}
                  aria-controls="form-reset"
                  onClick={toggleReset}
                >
                  Password dimenticata o da impostare?
                </button>
              </div>
            </form>
            {resetAperto && (
              <form id="form-reset" className="mt-5 grid gap-4" onSubmit={chiediReset} noValidate>
                <p className="text-base">
                  Scrivi l&apos;email del tuo account: ti mandiamo un link per scegliere una nuova password.
                </p>
                <div className="grid gap-1.5">
                  <label htmlFor="reset-email" className={label}>
                    Email
                  </label>
                  <input
                    ref={resetRef}
                    className={input}
                    type="email"
                    id="reset-email"
                    autoComplete="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <Msg id="reset-msg" testo={resetMsg.testo} ok={resetMsg.ok} />
                <div>
                  <button type="submit" className={btnSecondario} disabled={resetInvio}>
                    {resetInvio ? 'Invio in corso…' : 'Mandami il link per la password'}
                  </button>
                </div>
              </form>
            )}
          </details>
        </div>
      )}
    </>
  );
}
