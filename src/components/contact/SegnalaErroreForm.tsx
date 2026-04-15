'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  segnalaErroreSchema,
  TIPO_ERRORE,
  LINGUA_ERRORE,
  type SegnalaErroreInput,
} from '@/lib/contact-schemas';

type Status = 'idle' | 'submitting' | 'success' | 'error';

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
      <Card>
        <CardHeader>
          <CardTitle>{tCommon('successTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('successMessage')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">{t('intro')}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>{t('tipoLabel')}</Label>
            <RadioGroup
              value={tipoErrore}
              onValueChange={(v) =>
                setTipoErrore(v as (typeof TIPO_ERRORE)[number])
              }
            >
              {TIPO_ERRORE.map((v) => (
                <div key={v} className="flex items-center gap-3">
                  <RadioGroupItem value={v} id={`tipo-${v}`} />
                  <Label htmlFor={`tipo-${v}`} className="font-normal cursor-pointer">
                    {t(`tipo_${v}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.tipoErrore && (
              <p className="text-sm text-red-600">{tCommon('required')}</p>
            )}
          </div>

          {tipoErrore === 'traduzione' && (
            <div className="space-y-3">
              <Label>{t('linguaLabel')}</Label>
              <RadioGroup
                value={lingua}
                onValueChange={(v) =>
                  setLingua(v as (typeof LINGUA_ERRORE)[number])
                }
                className="grid-cols-5 grid"
              >
                {LINGUA_ERRORE.map((l) => (
                  <div key={l} className="flex items-center gap-2">
                    <RadioGroupItem value={l} id={`lingua-${l}`} />
                    <Label htmlFor={`lingua-${l}`} className="font-normal cursor-pointer uppercase">
                      {l}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.lingua && (
                <p className="text-sm text-red-600">{tCommon('required')}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dove">{t('doveLabel')}</Label>
            <Input
              id="dove"
              value={doveTrovato}
              onChange={(e) => setDoveTrovato(e.target.value)}
              placeholder={t('dovePlaceholder')}
            />
            {errors.doveTrovato && (
              <p className="text-sm text-red-600">{tCommon('required')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descrizione">{t('descrizioneLabel')}</Label>
            <Textarea
              id="descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder={t('descrizionePlaceholder')}
              rows={5}
            />
            {errors.descrizione && (
              <p className="text-sm text-red-600">{tCommon('tooShort')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('emailHelp')}</p>
            {errors.email && (
              <p className="text-sm text-red-600">{tCommon('invalidEmail')}</p>
            )}
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600">{tCommon('errorMessage')}</p>
          )}

          <Button type="submit" disabled={status === 'submitting'} className="w-full">
            {status === 'submitting' ? tCommon('submitting') : tCommon('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
