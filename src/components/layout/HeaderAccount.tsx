'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

/**
 * Tendina «SOS Permesso PRO» del menu, come la voce omonima del sito (Sito_Nuovo/_data/nav.js):
 * tutte le pagine PRO in un posto solo. Chi non ha fatto l'accesso vede «Accedi» (le pagine PRO lo
 * mandano comunque ad /abbonati, vedi ProGate); con una sessione «Account» ed «Esci».
 * `inline`: dentro il pannello ☰ la lista si apre sotto il bottone invece di galleggiare.
 * `pratiche`: PRATICHE_ATTIVE di lib/pratiche.ts (server-only), passato da StickyHeader.
 */
const VOCI = [
  { href: '/pro/circolari', label: 'Tutte le circolari' },
  { href: '/pro/questionario', label: 'Questionario PRO' },
  { href: '/pro/assistente', label: 'Assistente' },
];

const voce =
  'flex min-h-[44px] items-center whitespace-nowrap rounded-xl px-3.5 text-base font-bold text-[#141414] no-underline hover:bg-[#FFF6CC] aria-[current=page]:bg-[#FFD400]';

export function HeaderAccount({
  className,
  inline = false,
  pratiche = false,
}: {
  className: string;
  inline?: boolean;
  pratiche?: boolean;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [aperta, setAperta] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();
  const pathname = usePathname();
  const router = useRouter();

  // Click fuori ed Esc chiudono la tendina; cambiando pagina si richiude.
  useEffect(() => {
    if (!aperta) return;
    const fuori = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setAperta(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setAperta(false);
      btn.current?.focus();
    };
    document.addEventListener('click', fuori);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('click', fuori);
      document.removeEventListener('keydown', esc);
    };
  }, [aperta]);
  useEffect(() => setAperta(false), [pathname]);

  const voci = [
    ...(pratiche ? [{ href: '/account/pratiche', label: 'Scadenziario' }] : []),
    ...VOCI,
    ...(session ? [{ href: '/account', label: 'Account' }] : [{ href: '/abbonati', label: 'Accedi' }]),
  ];
  const dentro = voci.some((v) => pathname === v.href);

  async function esci() {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  // Frecce su/giù, Home e Fine fra le voci, come nelle tendine del sito.
  function tastiera(e: React.KeyboardEvent<HTMLUListElement>) {
    const link = [...e.currentTarget.querySelectorAll<HTMLElement>('a, button')];
    const i = link.indexOf(document.activeElement as HTMLElement);
    const vai = ({ ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: link.length - 1 } as Record<string, number>)[e.key];
    if (vai === undefined) return;
    e.preventDefault();
    link[(vai + link.length) % link.length]?.focus();
  }

  return (
    <div ref={box} className={inline ? 'flex flex-col' : 'relative'}>
      <button
        ref={btn}
        type="button"
        className={`${className} justify-between`}
        aria-expanded={aperta}
        aria-controls={id}
        aria-current={dentro || undefined}
        aria-busy={isPending || undefined}
        title={session?.user.email}
        onClick={() => setAperta((a) => !a)}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return;
          e.preventDefault();
          setAperta(true);
          requestAnimationFrame(() => document.getElementById(id)?.querySelector<HTMLElement>('a')?.focus());
        }}
      >
        <span className="inline-flex items-center gap-1">
          SOS Permesso
          <span className="ms-1 rounded-full border-[1.5px] border-[#141414] bg-[#FFD400] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-[1.2] tracking-[.5px] shadow-[1.5px_1.5px_0_#141414]">
            pro
          </span>
        </span>
        <span aria-hidden="true" className={`ms-1 text-xs transition-transform ${aperta ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>
      <ul
        id={id}
        hidden={!aperta}
        onKeyDown={tastiera}
        className={
          inline
            ? 'mt-2 ms-3 flex flex-col rounded-[14px] border-2 border-[#141414] bg-white p-1.5'
            : 'absolute end-0 top-[calc(100%+10px)] z-10 flex min-w-full flex-col rounded-[18px] border-2 border-[#141414] bg-white p-2 shadow-[5px_5px_0_#141414]'
        }
      >
        {voci.map((v) => (
          <li key={v.href}>
            <Link href={v.href} className={voce} aria-current={pathname === v.href ? 'page' : undefined}>
              {v.label}
            </Link>
          </li>
        ))}
        {session && (
          <li>
            <button type="button" onClick={esci} className={`${voce} w-full`}>
              Esci
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
