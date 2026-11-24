'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Verifica Cloudflare Turnstile per i moduli che mandano un'email (src/lib/antibot.ts).
 * Il widget è invisibile finché Cloudflare non chiede un clic; il token si chiede al momento
 * dell'invio (execute) e vale una volta sola. Senza NEXT_PUBLIC_TURNSTILE_SITE_KEY non fa nulla.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface Turnstile {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  execute(id: string): void;
  reset(id: string): void;
  remove(id: string): void;
}
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let caricamento: Promise<Turnstile> | null = null;
function caricaScript(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!caricamento) {
    caricamento = new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      s.onload = () => (window.turnstile ? ok(window.turnstile) : ko(new Error('turnstile assente')));
      s.onerror = () => {
        caricamento = null;
        ko(new Error('turnstile non caricato'));
      };
      document.head.appendChild(s);
    });
  }
  return caricamento;
}

/**
 * `ref` va su un <div> dentro il modulo (lì compare la casella se Cloudflare la chiede).
 * `headers()` restituisce l'intestazione da mandare con la richiesta, oppure {} se Turnstile è spento.
 */
export function useTurnstile(action: string) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const attesa = useRef<{ ok: (t: string) => void; ko: (e: Error) => void } | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let vivo = true;
    caricaScript()
      .then((ts) => {
        if (!vivo || !ref.current || idRef.current) return;
        idRef.current = ts.render(ref.current, {
          sitekey: SITE_KEY,
          action,
          execution: 'execute',
          appearance: 'interaction-only',
          language: 'it',
          callback: (t: string) => attesa.current?.ok(t),
          'error-callback': () => attesa.current?.ko(new Error('verifica non riuscita')),
          'expired-callback': () => idRef.current && window.turnstile?.reset(idRef.current),
        });
      })
      .catch(() => {});
    return () => {
      vivo = false;
      if (idRef.current) window.turnstile?.remove(idRef.current);
      idRef.current = null;
    };
  }, [action]);

  const headers = useCallback(async (): Promise<Record<string, string>> => {
    if (!SITE_KEY) return {};
    const ts = await caricaScript();
    const id = idRef.current;
    if (!id) throw new Error('verifica non pronta');
    const token = await new Promise<string>((ok, ko) => {
      attesa.current = { ok, ko };
      ts.reset(id);
      ts.execute(id);
    });
    attesa.current = null;
    return { 'x-captcha-response': token };
  }, []);

  return { ref, headers };
}

/** Messaggio da mostrare quando la verifica non va. */
export const VERIFICA_FALLITA = 'Non siamo riusciti a verificare che non sei un robot. Ricarica la pagina e riprova.';
