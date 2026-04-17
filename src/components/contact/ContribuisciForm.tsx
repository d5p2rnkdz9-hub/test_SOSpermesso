'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  contribuisciSchema,
  COME_CONTRIBUIRE,
  type ContribuisciInput,
} from '@/lib/contact-schemas';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const fieldBase =
  'w-full border-2 border-[#1A1A1A] rounded-lg bg-white px-4 py-3 text-base ' +
  'shadow-[2px_2px_0_#1A1A1A] transition-all duration-150 ' +
  'focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_#1A1A1A] ' +
  'placeholder:text-muted-foreground';

export function ContribuisciForm() {
  const t = useTranslations('contact.contribuisci');
  const tCommon = useTranslations('contact.common');

  const [comeContribuire, setComeContribuire] = useState<(typeof COME_CONTRIBUIRE)[number] | ''>('');
  const [raccontaci, setRaccontaci] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [consenso, setConsenso] = useState(false);

  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: Partial<ContribuisciInput> = {
      comeContribuire: comeContribuire || undefined,
      raccontaci,
      nome,
      email,
      consenso: consenso as true,
    };

    const parsed = contribuisciSchema.safeParse(payload);
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
      const res = await fetch('/api/contact/contribuisci', {
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
        {/* Come contribuire */}
        <fieldset className="space-y-3">
          <Label className="font-semibold text-[#1A1A1A]">{t('comeLabel')}</Label>
          <div className="space-y-2">
            {COME_CONTRIBUIRE.map((v) => {
              const selected = comeContribuire === v;
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
                    name="comeContribuire"
                    value={v}
                    checked={selected}
                    onChange={() => setComeContribuire(v)}
                    className="sr-only"
                  />
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border-2 border-[#1A1A1A] grid place-content-center bg-white"
                    aria-hidden="true"
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#1A1A1A]" />}
                  </span>
                  <span className="flex-1">{t(`come_${v}`)}</span>
                </label>
              );
            })}
          </div>
          {errors.comeContribuire && (
            <p className="text-sm font-semibold text-red-600">{tCommon('required')}</p>
          )}
        </fieldset>

        {/* Raccontaci */}
        <div className="space-y-2">
          <Label htmlFor="raccontaci" className="font-semibold text-[#1A1A1A]">{t('raccontaciLabel')}</Label>
          <textarea
            id="raccontaci"
            value={raccontaci}
            onChange={(e) => setRaccontaci(e.target.value)}
            placeholder={t('raccontaciPlaceholder')}
            rows={5}
            className={`${fieldBase} min-h-[120px] resize-y`}
          />
          {errors.raccontaci && (
            <p className="text-sm font-semibold text-red-600">{tCommon('tooShort')}</p>
          )}
        </div>

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome" className="font-semibold text-[#1A1A1A]">{t('nomeLabel')}</Label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className={fieldBase}
          />
          {errors.nome && (
            <p className="text-sm font-semibold text-red-600">{tCommon('required')}</p>
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
