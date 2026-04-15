'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  problemaLegaleSchema,
  SITUAZIONE_LEGALE,
  type ProblemaLegaleInput,
} from '@/lib/contact-schemas';

type Status = 'idle' | 'submitting' | 'success' | 'error';

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
            <Label>{t('situazioneLabel')}</Label>
            <RadioGroup
              value={situazione}
              onValueChange={(v) =>
                setSituazione(v as (typeof SITUAZIONE_LEGALE)[number])
              }
            >
              {SITUAZIONE_LEGALE.map((v) => (
                <div key={v} className="flex items-start gap-3">
                  <RadioGroupItem value={v} id={`sit-${v}`} className="mt-1" />
                  <Label htmlFor={`sit-${v}`} className="font-normal cursor-pointer">
                    {t(`situazione_${v}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.situazione && (
              <p className="text-sm text-red-600">{tCommon('required')}</p>
            )}
          </div>

          {situazione === 'ha_permesso' && (
            <div className="space-y-2">
              <Label htmlFor="quale">{t('qualePermessoLabel')}</Label>
              <Input
                id="quale"
                value={qualePermesso}
                onChange={(e) => setQualePermesso(e.target.value)}
                placeholder={t('qualePermessoPlaceholder')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descrizione">{t('descrizioneLabel')}</Label>
            <Textarea
              id="descrizione"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              placeholder={t('descrizionePlaceholder')}
              rows={6}
            />
            {errors.descrizione && (
              <p className="text-sm text-red-600">{tCommon('tooShort')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tempo">{t('tempoItaliaLabel')}</Label>
            <Input
              id="tempo"
              value={tempoItalia}
              onChange={(e) => setTempoItalia(e.target.value)}
              placeholder={t('tempoItaliaPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{tCommon('invalidEmail')}</p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-input p-4">
            <Checkbox
              id="consenso"
              checked={consenso}
              onCheckedChange={(c) => setConsenso(c === true)}
              className="mt-0.5"
            />
            <Label htmlFor="consenso" className="font-normal cursor-pointer leading-snug">
              {t('consensoLabel')}
            </Label>
          </div>
          {errors.consenso && (
            <p className="text-sm text-red-600">{tCommon('required')}</p>
          )}

          <p className="text-xs text-muted-foreground italic">
            {t('disclaimer')}
          </p>

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
