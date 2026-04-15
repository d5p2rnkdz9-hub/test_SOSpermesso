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
  contribuisciSchema,
  COME_CONTRIBUIRE,
  type ContribuisciInput,
} from '@/lib/contact-schemas';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContribuisciForm() {
  const t = useTranslations('contact.contribuisci');
  const tCommon = useTranslations('contact.common');

  const [comeContribuire, setComeContribuire] = useState<(typeof COME_CONTRIBUIRE)[number] | ''>('');
  const [raccontaci, setRaccontaci] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

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
            <Label>{t('comeLabel')}</Label>
            <RadioGroup
              value={comeContribuire}
              onValueChange={(v) =>
                setComeContribuire(v as (typeof COME_CONTRIBUIRE)[number])
              }
            >
              {COME_CONTRIBUIRE.map((v) => (
                <div key={v} className="flex items-start gap-3">
                  <RadioGroupItem value={v} id={`come-${v}`} className="mt-1" />
                  <Label htmlFor={`come-${v}`} className="font-normal cursor-pointer">
                    {t(`come_${v}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.comeContribuire && (
              <p className="text-sm text-red-600">{tCommon('required')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="raccontaci">{t('raccontaciLabel')}</Label>
            <Textarea
              id="raccontaci"
              value={raccontaci}
              onChange={(e) => setRaccontaci(e.target.value)}
              placeholder={t('raccontaciPlaceholder')}
              rows={5}
            />
            {errors.raccontaci && (
              <p className="text-sm text-red-600">{tCommon('tooShort')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">{t('nomeLabel')}</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{tCommon('required')}</p>
            )}
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
