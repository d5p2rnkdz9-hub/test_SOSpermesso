'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { TIPI_PROFILO, type TipoProfilo } from '@/lib/profilo-shared';

interface Props {
  nuovo: boolean;
  destinazione: string;
  iniziale: { nome: string; tipo: TipoProfilo | null; organizzazione: string; citta: string };
}

type Errors = Partial<Record<'nome' | 'tipo' | 'organizzazione' | 'citta', string>>;

const input =
  'rounded-lg border-[2.5px] border-[#141414] bg-white px-3 py-2.5 text-base font-normal text-[#141414] focus:outline-none focus:ring-4 focus:ring-[#FFD400]';

export function BenvenutoForm({ nuovo, destinazione, iniziale }: Props) {
  const router = useRouter();
  const [nome, setNome] = useState(iniziale.nome);
  const [tipo, setTipo] = useState<TipoProfilo | null>(iniziale.tipo);
  const [organizzazione, setOrganizzazione] = useState(iniziale.organizzazione);
  const [citta, setCitta] = useState(iniziale.citta);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFail('');
    setErrors({});
    const res = await fetch('/api/pro/profilo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, tipo, organizzazione, citta }),
    });
    if (res.ok) {
      router.push(destinazione);
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (res.status === 422 && data?.errors) setErrors(data.errors);
    else if (res.status === 401) setFail('La sessione è scaduta: accedi di nuovo.');
    else setFail('Non siamo riusciti a salvare. Riprova tra poco.');
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5" noValidate>
      <label className="flex flex-col gap-1.5 text-sm font-bold text-[#141414]">
        Come ti chiami
        <input
          type="text"
          autoComplete="name"
          maxLength={120}
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Es. Maria Rossi"
          className={input}
          aria-invalid={!!errors.nome}
        />
        {errors.nome && <span className="text-sm font-semibold text-[#D62828]">{errors.nome}</span>}
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-[#141414]">Dove lavori</legend>
        <div className="flex flex-wrap gap-2">
          {TIPI_PROFILO.map((t) => {
            const on = tipo === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={on}
                onClick={() => setTipo(t.value)}
                className={`rounded-full border-[2.5px] border-[#141414] px-3.5 py-1.5 text-sm font-bold transition-transform ${
                  on
                    ? 'bg-[#141414] text-[#FFD400] shadow-none'
                    : 'bg-white text-[#141414] shadow-[3px_3px_0_#141414] hover:-translate-x-px hover:-translate-y-px'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {errors.tipo && <p className="mt-1.5 text-sm font-semibold text-[#D62828]">{errors.tipo}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
        <label className="flex flex-col gap-1.5 text-sm font-bold text-[#141414]">
          <span>
            Nome della struttura <span className="font-normal text-[#5A5A5A]">(facoltativo)</span>
          </span>
          <input
            type="text"
            autoComplete="organization"
            maxLength={120}
            value={organizzazione}
            onChange={(e) => setOrganizzazione(e.target.value)}
            placeholder="Es. CAF Torino Centro"
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-[#141414]">
          <span>
            Città <span className="font-normal text-[#5A5A5A]">(facoltativo)</span>
          </span>
          <input
            type="text"
            autoComplete="address-level2"
            maxLength={80}
            value={citta}
            onChange={(e) => setCitta(e.target.value)}
            placeholder="Es. Torino"
            className={input}
          />
        </label>
      </div>

      {fail && (
        <p role="alert" className="text-sm font-semibold text-[#D62828]">
          {fail}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl border-[2.5px] border-[#141414] bg-[#D62828] px-5 py-3 text-lg font-extrabold text-white shadow-[4px_4px_0_#141414] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#141414] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#141414] disabled:opacity-60"
      >
        {busy ? 'Salvo…' : nuovo ? 'Crea account e vai alla dashboard' : 'Salva'}
      </button>
    </form>
  );
}
