import {
  AlarmClock,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  FolderOpen,
  Library,
  MessageSquareText,
  Newspaper,
  Plus,
  Settings2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { getDashboard, type ScadenzaView } from '@/lib/dashboard';
import { getProAccess } from '@/lib/pro-access';
import { getProfilo } from '@/lib/profilo';
import { tipoLabel } from '@/lib/profilo-shared';

import { AccountActions } from './AccountActions';

export const metadata: Metadata = {
  title: 'La tua dashboard — SOS Permesso PRO',
  robots: { index: false },
};

type Props = { params: Promise<{ locale: string }> };

/* Palette del design system «Adesivo» (Sito_Nuovo/src/styles/main.css). */
const INK = '#141414';
const C = {
  yellow: '#FFD400',
  yellowTint: '#FFF4C2',
  red: '#D62828',
  redTint: '#FDE5E5',
  orange: '#FF8A3D',
  orangeTint: '#FFEBDD',
  blue: '#4D9FFF',
  blueTint: '#E4F0FF',
  teal: '#22B8A0',
  tealTint: '#DCF5F0',
  purple: '#A98BF5',
  purpleTint: '#EEE8FE',
  green: '#1F9D55',
  greenTint: '#E3F6EA',
  muted: '#5A5A5A',
  paper: '#FFFDF5',
};

// Stringhe letterali: Tailwind non vede classi composte a runtime.
const sticker = 'rounded-2xl border-[2.5px] border-[#141414] shadow-[5px_5px_0_#141414]';
const lift =
  'transition-[transform,box-shadow] duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[8px_8px_0_#141414] focus-visible:-translate-x-[3px] focus-visible:-translate-y-[3px]';

function fmtData(iso: string | null, opts: Intl.DateTimeFormatOptions) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('it-IT', { timeZone: 'UTC', ...opts });
}

function urgenza(giorni: number) {
  if (giorni < 0) return { bg: C.red, fg: '#fff', label: `Scaduta da ${-giorni} gg` };
  if (giorni === 0) return { bg: C.red, fg: '#fff', label: 'Scade oggi' };
  if (giorni <= 30) return { bg: C.orange, fg: INK, label: `Tra ${giorni} gg` };
  if (giorni <= 90) return { bg: C.yellow, fg: INK, label: `Tra ${giorni} gg` };
  return { bg: C.greenTint, fg: C.green, label: `Tra ${giorni} gg` };
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const access = await getProAccess(await headers());
  if (access.status !== 'active') {
    redirect(`/${locale}/accedi?da=${encodeURIComponent(`/${locale}/account`)}`);
  }
  const { user } = access.session;
  const [profilo, d] = await Promise.all([getProfilo(user.id), getDashboard(user.id)]);
  // Account creato dal link ma mai completato (anche chi è entrato prima del benvenuto).
  if (!profilo) redirect(`/${locale}/account/benvenuto`);

  const nome = user.name?.trim().split(' ')[0] || 'collega';
  const oggi = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Rome',
  });
  const iscritto = new Date(user.createdAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const quotaPct = Math.min(100, Math.round((d.assistente.usatiOggi / d.assistente.limite) * 100));
  const urgenti = d.pratiche.scadute + d.pratiche.entro30;

  const stats = [
    {
      href: '/account/pratiche',
      label: 'Scadute',
      value: d.pratiche.scadute,
      hint: d.pratiche.scadute ? 'da rinnovare subito' : 'nessun ritardo',
      icon: TriangleAlert,
      color: C.red,
      tint: C.redTint,
    },
    {
      href: '/account/pratiche',
      label: 'Entro 30 giorni',
      value: d.pratiche.entro30,
      hint: `${d.pratiche.entro90} entro 90 giorni`,
      icon: AlarmClock,
      color: C.orange,
      tint: C.orangeTint,
    },
    {
      href: '/account/pratiche',
      label: 'Pratiche seguite',
      value: d.pratiche.attive,
      hint: 'nello scadenziario',
      icon: FolderOpen,
      color: C.blue,
      tint: C.blueTint,
    },
    {
      href: '/pro/circolari',
      label: 'Circolari nuove',
      value: d.circolari.nuove30,
      hint: 'negli ultimi 30 giorni',
      icon: Newspaper,
      color: C.teal,
      tint: C.tealTint,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 py-6 sm:py-8" style={{ color: INK }}>
      {/* ---------- Saluto ---------- */}
      <section
        className={`${sticker} relative overflow-hidden p-5 sm:p-7`}
        style={{ background: C.yellow }}
        aria-labelledby="saluto"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-14 h-28 w-28 rounded-full sm:-right-10 sm:-top-12 sm:h-44 sm:w-44 border-[2.5px]"
          style={{ background: C.red, borderColor: INK }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-[42%] hidden h-28 w-28 rotate-12 rounded-3xl border-[2.5px] lg:block"
          style={{ background: C.blue, borderColor: INK }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[560px]">
            <p className="text-sm font-bold capitalize">{oggi}</p>
            <h1 id="saluto" className="mt-1 text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Ciao, {nome}!
            </h1>
            <p className="mt-2 text-base font-semibold">
              {urgenti > 0
                ? `Hai ${urgenti} ${urgenti === 1 ? 'pratica che richiede' : 'pratiche che richiedono'} attenzione.`
                : d.pratiche.attive > 0
                  ? 'Nessuna scadenza nei prossimi 30 giorni. Tutto sotto controllo.'
                  : 'Inizia aggiungendo le pratiche che segui: ti avvisiamo noi prima che scadano.'}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span
                className="inline-block -rotate-2 rounded-md px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white"
                style={{ background: INK }}
              >
                PRO · gratis nel lancio
              </span>
              <span className="font-semibold">
                {tipoLabel(profilo.tipo)}
                {profilo.organizzazione && ` · ${profilo.organizzazione}`}
                {profilo.citta && ` · ${profilo.citta}`}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/account/pratiche"
              className={`flex items-center gap-2 rounded-xl border-[2.5px] px-4 py-2.5 font-extrabold text-white shadow-[4px_4px_0_#141414] ${lift}`}
              style={{ background: C.red, borderColor: INK }}
            >
              <Plus className="h-5 w-5" aria-hidden="true" /> Nuova pratica
            </Link>
            <Link
              href="/pro/assistente"
              className={`flex items-center gap-2 rounded-xl border-[2.5px] bg-white px-4 py-2.5 font-extrabold shadow-[4px_4px_0_#141414] ${lift}`}
              style={{ borderColor: INK }}
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" /> Chiedi all&apos;assistente
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Numeri ---------- */}
      <section aria-label="In sintesi" className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`${sticker} ${lift} flex flex-col gap-2 bg-white p-4`}
          >
            <span className="flex items-center justify-between">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl border-[2.5px]"
                style={{ background: s.color, borderColor: INK, color: s.color === C.red ? '#fff' : INK }}
              >
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <ArrowRight className="h-4 w-4 opacity-40" aria-hidden="true" />
            </span>
            <span className="text-4xl font-extrabold tabular-nums leading-none">{s.value}</span>
            <span>
              <span className="block text-sm font-extrabold">{s.label}</span>
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: s.tint }}
              >
                {s.hint}
              </span>
            </span>
          </Link>
        ))}
      </section>

      {/* ---------- Corpo ---------- */}
      <div className="mt-8 grid gap-7 lg:grid-cols-[1.35fr_1fr]">
        {/* Scadenze */}
        <section className={`${sticker} bg-white lg:self-start`} aria-labelledby="scadenze">
          <header
            className="flex items-center justify-between gap-3 rounded-t-[14px] border-b-[2.5px] px-5 py-4"
            style={{ background: C.orangeTint, borderColor: INK }}
          >
            <h2 id="scadenze" className="flex items-center gap-2 text-xl font-extrabold">
              <CalendarClock className="h-6 w-6" aria-hidden="true" /> Prossime scadenze
            </h2>
            <Link href="/account/pratiche" className="text-sm font-bold underline underline-offset-4">
              Scadenziario
            </Link>
          </header>

          {d.pratiche.prossime.length === 0 ? (
            <div className="flex flex-col items-start gap-3 p-6">
              <p className="text-lg font-extrabold">Nessuna pratica ancora.</p>
              <p className="text-sm" style={{ color: C.muted }}>
                Inserisci nome o sigla della persona, il permesso e la data di scadenza. Ti scriviamo a 90, 60 e
                30 giorni con il link alla checklist di rinnovo.
              </p>
              <Link
                href="/account/pratiche"
                className={`mt-1 flex items-center gap-2 rounded-xl border-[2.5px] px-4 py-2.5 font-extrabold shadow-[4px_4px_0_#141414] ${lift}`}
                style={{ background: C.yellow, borderColor: INK }}
              >
                <Plus className="h-5 w-5" aria-hidden="true" /> Aggiungi la prima pratica
              </Link>
            </div>
          ) : (
            <ul className="divide-y-2 divide-dashed" style={{ borderColor: '#E6E1D3' }}>
              {d.pratiche.prossime.map((p) => (
                <ScadenzaRow key={p.id} p={p} />
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-7">
          {/* Assistente */}
          <section
            className={`${sticker} p-5`}
            style={{ background: C.purpleTint }}
            aria-labelledby="assistente"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="assistente" className="flex items-center gap-2 text-xl font-extrabold">
                <MessageSquareText className="h-6 w-6" aria-hidden="true" /> Assistente PRO
              </h2>
              <span className="text-xs font-bold tabular-nums">
                {d.assistente.usatiOggi}/{d.assistente.limite} oggi
              </span>
            </div>
            <div
              className="mt-3 h-3 overflow-hidden rounded-full border-2 bg-white"
              style={{ borderColor: INK }}
              role="meter"
              aria-label="Domande usate oggi"
              aria-valuemin={0}
              aria-valuemax={d.assistente.limite}
              aria-valuenow={d.assistente.usatiOggi}
            >
              <div className="h-full" style={{ width: `${quotaPct}%`, background: C.purple }} />
            </div>

            {d.assistente.recenti.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2">
                {d.assistente.recenti.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/pro/assistente?c=${c.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border-2 bg-white px-3 py-2 text-sm font-semibold hover:bg-[#FFFDF5]"
                      style={{ borderColor: INK }}
                    >
                      <span className="line-clamp-1">{c.titolo}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm" style={{ color: C.muted }}>
                Descrivi un caso: l&apos;assistente cerca nelle circolari e nelle schede e risponde con le fonti.
              </p>
            )}
            <Link
              href="/pro/assistente"
              className={`mt-4 flex items-center justify-center gap-2 rounded-xl border-[2.5px] px-4 py-2.5 font-extrabold shadow-[4px_4px_0_#141414] ${lift}`}
              style={{ background: C.purple, borderColor: INK }}
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" /> Nuova domanda
            </Link>
          </section>

          {/* Circolari */}
          <section className={`${sticker} bg-white`} aria-labelledby="circolari">
            <header
              className="flex items-center justify-between gap-3 rounded-t-[14px] border-b-[2.5px] px-5 py-4"
              style={{ background: C.tealTint, borderColor: INK }}
            >
              <h2 id="circolari" className="flex items-center gap-2 text-xl font-extrabold">
                <Library className="h-6 w-6" aria-hidden="true" /> Ultime circolari
              </h2>
              <Link href="/pro/circolari" className="text-sm font-bold underline underline-offset-4">
                Archivio
              </Link>
            </header>
            <ul className="flex flex-col">
              {d.circolari.ultime.map((c) => (
                <li key={c.urlId} className="border-b-2 border-dashed last:border-b-0" style={{ borderColor: '#E6E1D3' }}>
                  <Link href={`/pro/circolari/${c.urlId}`} className="block px-5 py-3 hover:bg-[#FFFDF5]">
                    <span className="flex items-center gap-2 text-xs font-bold" style={{ color: C.muted }}>
                      <span
                        className="rounded px-1.5 py-0.5 text-[11px] uppercase tracking-wide"
                        style={{ background: C.tealTint, color: INK }}
                      >
                        {c.tipo}
                      </span>
                      {fmtData(c.data, { day: 'numeric', month: 'short', year: 'numeric' })}
                      {c.ente && ` · ${c.ente}`}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm font-semibold">{c.titolo}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="rounded-b-[14px] px-5 py-3 text-xs" style={{ background: C.paper, color: C.muted }}>
              {d.circolari.tutti
                ? 'Ricevi un avviso email per ogni nuova circolare.'
                : d.circolari.seguiti.length
                  ? `Filtrate sui ${d.circolari.seguiti.length} permessi che segui.`
                  : 'Scegli i permessi da seguire per ricevere le novità via email.'}{' '}
              <Link href="/pro/circolari" className="font-bold underline">
                Gestisci avvisi
              </Link>
            </p>
          </section>
        </div>
      </div>

      {/* ---------- Account ---------- */}
      <section
        className={`${sticker} mt-8 grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-start`}
        style={{ background: C.paper }}
        aria-labelledby="account"
      >
        <div>
          <h2 id="account" className="flex items-center gap-2 text-lg font-extrabold">
            <Settings2 className="h-5 w-5" aria-hidden="true" /> Il tuo account
          </h2>
          <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-bold">Email</dt>
              <dd className="[overflow-wrap:anywhere] [hyphens:none]" style={{ color: C.muted }}>{user.email}</dd>
            </div>
            <div>
              <dt className="font-bold">Iscritto dal</dt>
              <dd style={{ color: C.muted }}>{iscritto}</dd>
            </div>
            <div>
              <dt className="font-bold">Piano</dt>
              <dd style={{ color: C.muted }}>PRO gratuito durante il lancio</dd>
            </div>
          </dl>
          <Link
            href="/account/benvenuto"
            className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4"
          >
            Modifica profilo
          </Link>
        </div>
        <div className="sm:w-56">
          <AccountActions locale={locale} />
        </div>
      </section>
    </main>
  );
}

function ScadenzaRow({ p }: { p: ScadenzaView }) {
  const u = urgenza(p.giorni);
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <span
        className="flex w-14 shrink-0 flex-col items-center rounded-xl border-[2.5px] bg-white py-1 leading-none"
        style={{ borderColor: INK }}
        aria-hidden="true"
      >
        <span className="text-2xl font-extrabold tabular-nums">{fmtData(p.scadenza, { day: 'numeric' })}</span>
        <span className="mt-0.5 text-[11px] font-bold uppercase">{fmtData(p.scadenza, { month: 'short' })}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-extrabold">{p.riferimento}</span>
        <span className="block truncate text-sm" style={{ color: C.muted }}>
          {p.permessoTitolo} · {fmtData(p.scadenza, { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className="rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold"
          style={{ background: u.bg, color: u.fg, borderColor: INK }}
        >
          {u.label}
        </span>
        <a
          href={p.checklist}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-xs font-bold underline underline-offset-2"
        >
          Checklist <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </a>
      </span>
    </li>
  );
}
