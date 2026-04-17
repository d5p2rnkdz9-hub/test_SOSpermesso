'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  problemaLegaleSchema,
  SITUAZIONE_LEGALE,
  type ProblemaLegaleInput,
} from '@/lib/contact-schemas';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const fieldBase =
  'w-full border-2 border-[#1A1A1A] rounded-lg bg-white px-4 py-3 text-base ' +
  'shadow-[2px_2px_0_#1A1A1A] transition-all duration-150 ' +
  'focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_#1A1A1A] ' +
  'placeholder:text-muted-foreground';

export function ProblemaLegaleForm() {
  const t = useTranslations('contact.problemaLegale');
  const tCommon = useTranslations('contact.common');

  const [situazione, setSituazione] = useState<(typeof SITUAZIONE_LEGALE)[number] | ''>('');
  const [qualePermesso, setQualePermesso] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [tempoItalia, setTempoItalia] = useState('');
  const [email, setEmail] = useState('');
  const [consenso, setConsenso] = useState(false);

  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: Partial<ProblemaLegaleInput> = {
      situazione: situazione || undefined,
      qualePermesso: qualePermesso || undefined,
      descrizione,
      tempoItalia: tempoItalia || undefined,
      email,
      consenso: consenso as true,
    };

    const parsed = problemaLegaleSchema.safeParse(payload);
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
      const res = await fetch('/api/contact/problema-legale', {
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
        {/* Situazione */}
        <fieldset className="space-y-3">
          <Label className="font-semibold text-[#1A1A1A]">{t('situazioneLabel')}</Label>
          <div className="space-y-2">
            {SITUAZIONE_LEGALE.map((v) => {
              const selected = situazione === v;
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
                    name="situazione"
                    value={v}
                    checked={selected}
                    onChange={() => setSituazione(v)}
                    className="sr-only"
                  />
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border-2 border-[#1A1A1A] grid place-content-center bg-white"
                    aria-hidden="true"
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />}
                  </span>
                  <span className="flex-1">{t(`situazione_${v}`)}</span>
                </label>
              );
            })}
          </div>
          {errors.situazione && (
            <p className="text-sm font-semibold text-red-600">{tCommon('required')}</p>
          )}
        </fieldset>

        {/* Quale permesso (conditional) */}
        {situazione === 'ha_permesso' && (
          <div className="space-y-2">
            <Label htmlFor="quale" className="font-semibold text-[#1A1A1A]">{t('qualePermessoLabel')}</Label>
            <input
              id="quale"
              type="text"
              value={qualePermesso}
              onChange={(e) => setQualePermesso(e.target.value)}
              placeholder={t('qualePermessoPlaceholder')}
              className={fieldBase}
            />
          </div>
        )}

        {/* Descrizione */}
        <div className="space-y-2">
          <Label htmlFor="descrizione" className="font-semibold text-[#1A1A1A]">{t('descrizioneLabel')}</Label>
          <textarea
            id="descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder={t('descrizionePlaceholder')}
            rows={6}
            className={`${fieldBase} min-h-[140px] resize-y`}
          />
          {errors.descrizione && (
            <p className="text-sm font-semibold text-red-600">{tCommon('tooShort')}</p>
          )}
        </div>

        {/* Tempo Italia */}
        <div className="space-y-2">
          <Label htmlFor="tempo" className="font-semibold text-[#1A1A1A]">{t('tempoItaliaLabel')}</Label>
          <input
            id="tempo"
            type="text"
            value={tempoItalia}
            onChange={(e) => setTempoItalia(e.target.value)}
            placeholder={t('tempoItaliaPlaceholder')}
            className={fieldBase}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-[#1A1A1A]">{t('emailLabel')}</Label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={fieldBase}
          />
          {errors.email && (
            <p className="text-sm font-semibold text-red-600">{tCommon('invalidEmail')}</p>
          )}
        </div>

        {/* Consenso */}
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border-2 border-[#1A1A1A] bg-white p-4 shadow-[2px_2px_0_#1A1A1A]">
          <input
            type="checkbox"
            checked={consenso}
            onChange={(e) => setConsenso(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`h-5 w-5 shrink-0 rounded-sm border-2 border-[#1A1A1A] grid place-content-center mt-0.5 ${
              consenso ? 'bg-[#FFD700]' : 'bg-white'
            }`}
            aria-hidden="true"
          >
            {consenso && (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 stroke-[#1A1A1A]" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l3 3 7-7" />
              </svg>
            )}
          </span>
          <span className="flex-1 font-semibold text-[#1A1A1A] leading-snug">
            {t('consensoLabel')}
          </span>
        </label>
        {errors.consenso && (
          <p className="text-sm font-semibold text-red-600">{tCommon('required')}</p>
        )}

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
