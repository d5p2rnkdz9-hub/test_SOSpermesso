import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ASSISTENTE_PRO_ATTIVO } from '@/lib/assistente-pro';
import { accountUnicoOn } from '@/lib/pro-entitlement';
import { PRATICHE_ATTIVE } from '@/lib/pratiche';

import { C, INK } from '../accedi/stile';
import { ProvaForm } from './ProvaForm';

export const metadata: Metadata = {
  title: 'Prova gratis SOS Permesso PRO',
  description:
    'Gli strumenti di lavoro per le pratiche di permesso di soggiorno: archivio delle circolari, questionario per operatori, assistente con le fonti, scadenziario e avvisi via email.',
};

type Props = {
  params: Promise<{ locale: string }>;
  /** da: la pagina PRO da cui si arriva (ProGate), dove tornare dopo il link. */
  searchParams: Promise<{ da?: string }>;
};

function safeReturnPath(raw: string | undefined, locale: string): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) return raw;
  return `/${locale}/account`;
}

/* Stessa pagina di sosflussi.it/abbonati/ (design «Adesivo»), nel giallo di SOS Permesso. */
const chip = 'rounded-[10px] border-[2.5px] border-[#141414] bg-white px-4 py-2 text-[17px] font-extrabold';
const sezione = 'mx-auto w-full max-w-[1120px] px-4';
const h2 = 'text-[clamp(28px,3.4vw,40px)] font-extrabold leading-tight';

type Riga = { cosa: string; gratis: { testo: string; tipo: 'si' | 'parte' | 'no' }; pro: string };

function Segno({ tipo }: { tipo: 'si' | 'parte' | 'no' }) {
  const testo = tipo === 'si' ? '✓' : tipo === 'parte' ? '½' : '–';
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#141414] text-xs font-extrabold"
      style={{ background: tipo === 'si' ? C.accent : tipo === 'parte' ? '#fff' : '#eee' }}
    >
      {testo}
    </span>
  );
}

export default async function AbbonatiPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { da } = await searchParams;
  const ritorno = safeReturnPath(da, locale);
  const unico = accountUnicoOn();

  const righe: Riga[] = [
    { cosa: 'Test «Che permesso posso chiedere?»', gratis: { testo: 'Sì', tipo: 'si' }, pro: 'Sì' },
    { cosa: 'Schede dei permessi di soggiorno, in più lingue', gratis: { testo: 'Sì', tipo: 'si' }, pro: 'Sì' },
    {
      cosa: 'Circolari, note e messaggi',
      gratis: { testo: 'Le più importanti', tipo: 'parte' },
      pro: 'Tutto l’archivio, oltre 1.900 documenti, con ricerca nel testo integrale e filtri per permesso, ente, tipo di atto e anno',
    },
    {
      cosa: 'Questionario per gli operatori',
      gratis: { testo: 'No', tipo: 'no' },
      pro: 'La conversione del permesso, coppia per coppia: ammissibilità, base normativa, procedura, giurisprudenza e casi limite (primo rilascio e rinnovo in arrivo)',
    },
    ...(ASSISTENTE_PRO_ATTIVO
      ? [
          {
            cosa: 'Assistente PRO',
            gratis: { testo: 'No', tipo: 'no' as const },
            pro: 'Risponde cercando nelle circolari e nelle schede, con il link alla fonte di ogni risposta',
          },
        ]
      : []),
    ...(PRATICHE_ATTIVE
      ? [
          {
            cosa: 'Scadenziario dei permessi',
            gratis: { testo: 'No', tipo: 'no' as const },
            pro: 'Le scadenze dei permessi che segui, con un promemoria via email 90, 60 e 30 giorni prima',
          },
        ]
      : []),
    {
      cosa: 'Avvisi via email',
      gratis: { testo: 'No', tipo: 'no' },
      pro: 'Un’email quando esce una circolare sui permessi che segui',
    },
  ];

  return (
    <div style={{ color: INK }} className="bg-[#FFFDF5]">
      {/* ---------- Hero con la richiesta del link ---------- */}
      <header className="border-b-[3px] border-[#141414] py-8 sm:py-12" style={{ background: C.accentTint }}>
        <div className={`${sezione} grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:gap-12`}>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-[#141414] bg-white px-4 py-1.5 text-base font-extrabold">
              SOS Permesso
              <span
                className="rounded-full border-2 border-[#141414] px-2.5 text-sm font-extrabold uppercase leading-6 tracking-wide"
                style={{ background: C.accent }}
              >
                pro
              </span>
            </span>
            <h1 className="mt-4 text-[clamp(36px,5.4vw,64px)] font-extrabold leading-[1.02] tracking-tight">
              Gli strumenti di lavoro per le pratiche di permesso di soggiorno
            </h1>
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed">
              Tutte le circolari con ricerca nel testo, il questionario per gli operatori sulle conversioni, le scadenze
              dei permessi che segui con i promemoria e un avviso via email quando esce una circolare nuova. In un posto
              solo, curato dallo Studio Legale Oltre.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="A chi serve">
              {['CAF e patronati', 'Sindacati e sportelli', 'Consulenti del lavoro', 'Avvocati', 'Associazioni'].map(
                (c) => (
                  <li key={c} className={chip}>
                    {c}
                  </li>
                ),
              )}
            </ul>
          </div>

          <aside
            id="prova"
            aria-labelledby="prova-titolo"
            className="relative mt-5 max-w-[440px] rounded-[24px] border-[3px] border-[#141414] bg-white px-5 pb-6 pt-9 shadow-[8px_8px_0_#141414] sm:px-6"
          >
            <p className="absolute -top-[19px] start-[22px] -rotate-3 rounded-lg bg-[#141414] px-4 pb-1.5 pt-1 text-base font-extrabold text-white">
              Gratis
            </p>
            <h2 id="prova-titolo" className="mb-4 text-[clamp(26px,3vw,32px)] font-extrabold leading-[1.12]">
              Chiedi un link di prova gratuita
            </h2>
            <ProvaForm callbackURL={ritorno} locale={locale} />
            <ul className="mt-5 grid gap-1.5 text-base">
              {[
                'Nessun pagamento, nessuna carta di credito',
                'Entri con il link che ti mandiamo via email',
                'Elimini l’account quando vuoi',
              ].map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span aria-hidden="true" className="font-extrabold">
                    ✓
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-base">
              Hai già un account?{' '}
              <a
                href={`/${locale}/accedi?da=${encodeURIComponent(ritorno)}`}
                className="font-semibold underline underline-offset-2"
              >
                Accedi
              </a>
            </p>
          </aside>
        </div>
      </header>

      <main id="contenuto">
        {/* ---------- Confronto ---------- */}
        <section className={`${sezione} pt-14`} aria-label="Confronto fra il sito gratuito e SOS Permesso PRO">
          {/* Da telefono la tabella si impila: una scheda per riga, con le etichette Gratis e PRO. */}
          <div className="overflow-hidden rounded-[18px] border-[2.5px] border-[#141414] bg-white shadow-[5px_5px_0_#141414]">
            <table className="w-full border-collapse text-left text-base max-sm:block">
              <caption className="sr-only">Confronto fra il sito gratuito e SOS Permesso PRO</caption>
              <thead className="max-sm:hidden">
                <tr className="border-b-[2.5px] border-[#141414]">
                  <th scope="col" className="px-4 py-3 font-extrabold">
                    Cosa trovi
                  </th>
                  <th scope="col" className="px-4 py-3 font-extrabold">
                    Gratis
                  </th>
                  <th
                    scope="col"
                    className="border-s-[2.5px] border-[#141414] px-4 py-3 font-extrabold"
                    style={{ background: C.accent }}
                  >
                    PRO
                  </th>
                </tr>
              </thead>
              <tbody className="max-sm:block">
                {righe.map((r) => (
                  <tr key={r.cosa} className="border-b border-[#141414]/20 align-top last:border-b-0 max-sm:block max-sm:border-b-[2.5px] max-sm:border-[#141414]">
                    <th scope="row" className="w-[34%] px-4 py-3 font-extrabold max-sm:block max-sm:w-auto max-sm:pb-1">
                      {r.cosa}
                    </th>
                    <td className="w-[22%] px-4 py-3 max-sm:block max-sm:w-auto max-sm:py-2">
                      <span className="block text-sm font-extrabold sm:hidden">Gratis</span>
                      <span className="flex gap-2.5" style={{ color: r.gratis.tipo === 'no' ? C.muted : undefined }}>
                        <Segno tipo={r.gratis.tipo} />
                        <span>{r.gratis.testo}</span>
                      </span>
                    </td>
                    <td
                      className="border-s-[2.5px] border-[#141414] px-4 py-3 max-sm:block max-sm:border-s-0 max-sm:border-t-[1.5px] max-sm:border-dashed"
                      style={{ background: C.accentTint }}
                    >
                      <span className="block text-sm font-extrabold sm:hidden">PRO</span>
                      <span className="flex gap-2.5">
                        <Segno tipo="si" />
                        <span>{r.pro}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {unico && (
            <p className="mt-5 text-base">
              Con lo stesso account entri anche in{' '}
              <a
                href="https://sosflussi.it/accedi/"
                target="_blank"
                rel="noopener"
                className="font-semibold underline underline-offset-2"
              >
                SOS Flussi PRO
              </a>
              , per le pratiche del decreto flussi.
            </p>
          )}
        </section>

        {/* ---------- Per chi è ---------- */}
        <section className={`${sezione} pt-14`} aria-labelledby="chi-titolo">
          <h2 id="chi-titolo" className={h2}>
            Per chi è
          </h2>
          <p className="mt-3 max-w-[62ch] text-lg">
            Per chi segue le pratiche di permesso di soggiorno come mestiere, o ne vede molte ogni anno.
          </p>
          <ul className="mt-6 border-t-[2.5px] border-[#141414]">
            {[
              [
                'CAF e patronati',
                'Trovi in fretta la circolare che ti serve sul rinnovo, la conversione o il ricongiungimento, con la ricerca nel testo integrale.',
              ],
              [
                'Sindacati e sportelli',
                'Il questionario per gli operatori ti dà, per ogni esito, la base normativa, la procedura, la giurisprudenza e i casi limite.',
              ],
              [
                'Consulenti del lavoro',
                'Segui le scadenze dei permessi dei lavoratori che assisti: ti avvisiamo per email 90, 60 e 30 giorni prima.',
              ],
              [
                'Avvocati',
                'Ritrovi la prassi delle Questure e dei Ministeri: circolari, note e messaggi dal 2000 a oggi, con il testo integrale.',
              ],
              [
                'Associazioni',
                'Ricevi un’email quando esce una circolare sui permessi che segui, senza controllare i siti dei Ministeri.',
              ],
            ].map(([t, d]) => (
              <li
                key={t}
                className="grid gap-1 border-b-[1.5px] border-[#141414]/30 py-4 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-6"
              >
                <h3 className="text-xl font-extrabold">{t}</h3>
                <p className="text-base leading-relaxed">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[62ch] text-[17px]">
            <strong>Ti serve per una pratica tua?</strong> Probabilmente ti basta il sito gratuito: parti da{' '}
            <a href="https://www.sospermesso.it" className="font-semibold underline underline-offset-2">
              sospermesso.it
            </a>
            .
          </p>
        </section>

        {/* ---------- Come funziona ---------- */}
        <section className={`${sezione} pt-14`} aria-labelledby="patto-titolo">
          <h2 id="patto-titolo" className={h2}>
            Come funziona la prova, in chiaro
          </h2>
          <p className="mt-3 text-lg">Tutto quello che succede dal momento in cui chiedi il link.</p>
          <dl className="mt-6 max-w-[860px] rounded-[18px] border-[3px] border-[#141414] bg-white px-5 py-1 shadow-[5px_5px_0_#141414] sm:px-6">
            {[
              ['Quanto costa', 'Niente. Non ti chiediamo una carta né altri dati di pagamento.'],
              [
                'Cosa ti chiediamo',
                'La tua email, per mandarti il link di accesso. Al primo accesso il tuo nome e che lavoro fai (CAF, patronato, sindacato...): ci serve per capire a chi è utile SOS Permesso PRO.',
              ],
              [
                'Quanto dura',
                'Per ora la prova non ha una scadenza. Se un giorno decideremo di chiuderla o di rendere PRO a pagamento, te lo scriveremo prima via email. Non ti verrà mai addebitato niente senza che sia tu a sceglierlo.',
              ],
              ['Come entri', 'Con il link che ti mandiamo via email, ogni volta che vuoi: niente password da ricordare.'],
              [
                'Se cambi idea',
                'Elimini l’account dalla tua pagina account: email, dati di accesso e scadenze si cancellano subito.',
              ],
              [
                'Cosa ricevi',
                'L’accesso a un servizio di informazione e aggiornamento. Non è una consulenza legale sul singolo caso.',
              ],
            ].map(([t, d]) => (
              <div
                key={t}
                className="grid gap-1 border-b-[1.5px] border-dashed border-[#141414]/40 py-4 last:border-b-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="font-extrabold">{t}</dt>
                <dd className="text-base leading-relaxed">{d}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-[860px] text-base">
            Come trattiamo i tuoi dati è nell&apos;
            <a href={`/${locale}/accedi/informativa`} className="font-semibold underline underline-offset-2">
              informativa privacy
            </a>
            {PRATICHE_ATTIVE && (
              <>
                ; per i dati delle persone che inserisci nello scadenziario vale l&apos;
                <a href={`/${locale}/account/pratiche/accordo`} className="font-semibold underline underline-offset-2">
                  accordo sul trattamento dei dati
                </a>
              </>
            )}
            .
          </p>
        </section>

        {/* ---------- Domande frequenti ---------- */}
        <section className={`${sezione} pb-16 pt-14`} aria-labelledby="faq-titolo">
          <h2 id="faq-titolo" className={h2}>
            Domande frequenti
          </h2>
          <div className="mt-6 grid max-w-[820px] gap-3.5">
            {[
              [
                'A chi serve?',
                'A chi segue molte pratiche di permesso di soggiorno: CAF, patronati, sindacati, sportelli, consulenti del lavoro, avvocati e associazioni. Se ti serve per una pratica tua, probabilmente ti basta il sito gratuito.',
              ],
              ['Quanto costa?', 'Niente: la prova è gratuita e non ti chiediamo dati di pagamento.'],
              [
                'Le informazioni sono aggiornate?',
                'L’archivio delle circolari si aggiorna di continuo, e ti avvisiamo per email quando ne esce una sui permessi che segui. Controlla sempre la fonte prima di usarla in una pratica.',
              ],
              [
                'Come elimino il mio account?',
                'Dalla tua pagina account, con «Elimina il mio account»: email, dati di accesso e scadenze si cancellano subito.',
              ],
              [
                'È una consulenza legale?',
                'No. SOS Permesso PRO è un servizio di informazione: le informazioni non sostituiscono una consulenza legale sul tuo caso.',
              ],
            ].map(([q, a]) => (
              <details
                key={q}
                className="rounded-[18px] border-[2.5px] border-[#141414] bg-white px-5 py-4 shadow-[3px_3px_0_#141414]"
              >
                <summary className="cursor-pointer text-lg font-extrabold">{q}</summary>
                <p className="mt-2 text-base leading-relaxed">{a}</p>
              </details>
            ))}
          </div>

          <div
            className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border-[2.5px] border-[#141414] p-6"
            style={{ background: C.accentTint }}
          >
            <h2 className="text-[clamp(24px,3vw,32px)] font-extrabold">Gratis, senza carta di credito</h2>
            <a
              href="#prova"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-[2.5px] border-[#141414] bg-[#FFD400] px-5 font-extrabold shadow-[4px_4px_0_#141414]"
            >
              Chiedi il link di prova
            </a>
          </div>
          <p className="mt-7 max-w-[70ch] text-[15px]" style={{ color: C.muted }}>
            SOS Permesso PRO è un servizio informativo dello Studio Legale Oltre. Le informazioni non sostituiscono una
            consulenza legale.
          </p>
        </section>
      </main>
    </div>
  );
}
