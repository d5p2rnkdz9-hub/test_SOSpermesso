import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { accountUnicoOn } from '@/lib/pro-entitlement';

import { C, INK, card } from '../stile';

export const metadata: Metadata = {
  title: 'Informativa privacy — SOS Permesso PRO',
  robots: { index: false },
};

type Props = { params: Promise<{ locale: string }> };

/**
 * Informativa (artt. 13-14 GDPR) mostrata all'iscrizione all'area PRO. Con
 * ACCOUNT_UNICO=1 vale anche per sosflussi.it (stesso account e abbonamento).
 * Qualsiasi modifica sostanziale: aggiornare la data.
 */
export default async function InformativaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const unico = accountUnicoOn();

  return (
    <div style={{ color: INK }}>
      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pb-16 pt-8" id="contenuto">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Informativa privacy</h1>
        <p className="text-base" style={{ color: C.muted }}>
          Account e area PRO · versione del 19 novembre 2026
        </p>

        <section className={card}>
          <h2 className="text-xl font-extrabold">Chi tratta i tuoi dati</h2>
          <p className="mt-2 text-base">
            Titolare del trattamento è Alberto Pasquero, Via Susa 32, Torino, PEC albertopasquero@pec.ordineavvocatitorino.it.
            {unico && (
              <>
                {' '}
                L&apos;account è unico per sospermesso.it e sosflussi.it: questa informativa vale per entrambi i siti e
                l&apos;account e l&apos;abbonamento sono trattati in comune.
              </>
            )}
          </p>
        </section>

        <section className={card}>
          <h2 className="text-xl font-extrabold">Quali dati e perché</h2>
          <ul className="mt-2 grid list-disc gap-2 ps-5 text-base">
            <li>
              <strong>Email e dati di accesso</strong> (link di accesso, sessione, eventuale password cifrata, nome e
              ruolo se li indichi): per creare l&apos;account e farti entrare. Base giuridica: esecuzione del servizio
              che richiedi (art. 6.1.b GDPR).
            </li>
            <li>
              <strong>Dati che salvi nell&apos;area PRO</strong> (permessi che segui, profilo, conversazioni con
              l&apos;assistente, scadenziario): per offrirti le funzioni che usi. Per i dati di terzi che inserisci nello
              scadenziario sei tu il titolare e valgono le condizioni dell&apos;accordo art. 28 GDPR che accetti prima
              di usarlo.
            </li>
            <li>
              <strong>Dati tecnici</strong> (indirizzo IP, registro degli invii dei link, con l&apos;email conservata
              solo come impronta cifrata): per la sicurezza e per evitare abusi. Base giuridica: legittimo interesse
              (art. 6.1.f).
            </li>
          </ul>
          <p className="mt-3 text-base">
            Non usiamo i tuoi dati per pubblicità né per addestrare sistemi di intelligenza artificiale, e non li
            vendiamo.
          </p>
        </section>

        <section className={card}>
          <h2 className="text-xl font-extrabold">Chi li riceve</h2>
          <p className="mt-2 text-base">
            Fornitori che trattano i dati per nostro conto: Neon (database, Francoforte), Netlify (hosting), Resend
            (invio delle email), il fornitore del modello linguistico dell&apos;assistente per le domande che gli scrivi.
            Alcuni sono negli Stati Uniti, con Data Privacy Framework o clausole contrattuali tipo.
          </p>
        </section>

        <section className={card}>
          <h2 className="text-xl font-extrabold">Per quanto tempo</h2>
          <p className="mt-2 text-base">
            Finché l&apos;account esiste. I link di accesso valgono 10 minuti. Se elimini l&apos;account da «Account»,
            cancelliamo subito anche i dati salvati
            {unico ? ' su entrambi i siti' : ''}; i backup si rinnovano entro 7 giorni.
          </p>
        </section>

        <section className={card}>
          <h2 className="text-xl font-extrabold">I tuoi diritti</h2>
          <p className="mt-2 text-base">
            Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento
            scrivendo alla PEC del titolare. Puoi anche presentare reclamo al Garante per la protezione dei dati
            personali (garanteprivacy.it).
          </p>
        </section>
      </main>
    </div>
  );
}
