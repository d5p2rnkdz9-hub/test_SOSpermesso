'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  segnalaErroreSchema,
  TIPO_ERRORE,
  LINGUA_ERRORE,
  type SegnalaErroreInput,
} from '@/lib/contact-schemas';

type Status = 'idle' | 'submitting' | 'success' | 'error';

// Brutalist input/textarea classes — bordo nero spesso, ombra offset rigida
const fieldBase =
  'w-full border-2 border-[#1A1A1A] rounded-lg bg-white px-4 py-3 text-base ' +
  'shadow-[2px_2px_0_#1A1A1A] transition-all duration-150 ' +
  'focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_#1A1A1A] ' +
  'placeholder:text-muted-foreground';

export function SegnalaErroreForm() {
  const t = useTranslations('contact.segnalaErrore');
  const tCommon = useTranslations('contact.common');

  const [tipoErrore, setTipoErrore] = useState<(typeof TIPO_ERRORE)[number] | ''>('');
  const [lingua, setLingua] = useState<(typeof LINGUA_ERRORE)[number] | ''>('');
  const [doveTrovato, setDoveTrovato] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [email, setEmail] = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: Partial<SegnalaErroreInput> = {
      tipoErrore: tipoErrore || undefined,
      lingua: lingua || undefined,
      doveTrovato,
      descrizione,
      email: email || undefined,
    };

    const parsed = segnalaErroreSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/contact/segnala-errore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border-2 border-[#1A1A1A] bg-card shadow-[3px_3px_0_#1A1A1A] p-6">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">
          {tCommon('successTitle')}
        </h2>
        <p>{t('successMessage')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-[#1A1A1A] bg-card shadow-[3px_3px_0_#1A1A1A] p-6">
      <h2 className="text-3xl font-extrabold text-[#1A1A1A] leading-tight">
        {t('title')}
      </h2>
      <p className="text-sm text-muted-foreground mt-3 mb-6">{t('intro')}</p>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Tipo errore */}
        <fieldset className="space-y-3">
          <Label className="font-semibold text-[#1A1A1A]">{t('tipoLabel')}</Label>
          <div className="space-y-2">
            {TIPO_ERRORE.map((v) => {
              const selected = tipoErrore === v;
              return (
                <label
                  key={v}
                  className={`flex items-center gap-3 cursor-pointer rounded-lg border-2 border-[#1A1A1A] px-4 py-3 font-semibold transition-all duration-150 ${
                    selected
                      ? 'bg-[#FFD700] text-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]'
                      : 'bg-white text-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] hover:bg-[#FFF9CC]'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoErrore"
                    value={v}
                    checked={selected}
                    onChange={() => setTipoErrore(v)}
                    className="sr-only"
                  />
                  <span
                    className={`h-5 w-5 shrink-0 rounded-full border-2 border-[#1A1A1A] grid place-content-center bg-white`}
                    aria-hidden="true"
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />}
                  </span>
                  <span className="flex-1">{t(`tipo_${v}`)}</span>
                </label>
              );
            })}
          </div>
          {errors.tipoErrore && (
            <p className="text-sm font-semibold text-red-600">{tCommon('required')}</p>
          )}
        </fieldset>

        {/* Lingua (conditional) */}
        {tipoErrore === 'traduzione' && (
          <fieldset className="space-y-3">
            <Label className="font-semibold text-[#1A1A1A]">{t('linguaLabel')}</Label>
            <div className="flex flex-wrap gap-2">
              {LINGUA_ERRORE.map((l) => {
                const selected = lingua === l;
                return (
                  <label
                    key={l}
                    className={`cursor-pointer uppercase font-bold text-sm rounded-lg border-2 border-[#1A1A1A] px-4 py-2 transition-all duration-150 ${
                      selected
                        ? 'bg-[#FFD700] text-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]'
                        : 'bg-white text-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] hover:bg-[#FFF9CC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lingua"
                      value={l}
                      checked={selected}
                      onChange={() => setLingua(l)}
                      className="sr-only"
                    />
                    {l}
                  </label>
                );
              })}
            </div>
            {errors.lingua && (
              <p className="text-sm font-semibold text-red-600">{tCommon('required')}</p>
            )}
          </fieldset>
        )}

        {/* Dove */}
        <div className="space-y-2">
          <Label htmlFor="dove" className="font-semibold text-[#1A1A1A]">{t('doveLabel')}</Label>
          <input
            id="dove"
            type="text"
            value={doveTrovato}
            onChange={(e) => setDoveTrovato(e.target.value)}
            placeholder={t('dovePlaceholder')}
            className={fieldBase}
          />
          {errors.doveTrovato && (
            <p className="text-sm font-semibold text-red-600">{tCommon('required')}</p>
          )}
        </div>

        {/* Descrizione */}
        <div className="space-y-2">
          <Label htmlFor="descrizione" className="font-semibold text-[#1A1A1A]">{t('descrizioneLabel')}</Label>
          <textarea
            id="descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder={t('descrizionePlaceholder')}
            rows={5}
            className={`${fieldBase} min-h-[120px] resize-y`}
          />
          {errors.descrizione && (
            <p className="text-sm font-semibold text-red-600">{tCommon('tooShort')}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-[#1A1A1A]">{t('emailLabel')}</Label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldBase}
          />
          <p className="text-xs text-muted-foreground">{t('emailHelp')}</p>
          {errors.email && (
            <p className="text-sm font-semibold text-red-600">{tCommon('invalidEmail')}</p>
          )}
        </div>

        {status === 'error' && (
          <p className="text-sm font-semibold text-red-600">{tCommon('errorMessage')}</p>
        )}

        <Button type="submit" disabled={status === 'submitting'} className="w-full">
          {status === 'submitting' ? tCommon('submitting') : tCommon('submit')}
        </Button>
      </form>
    </div>
  );
}
