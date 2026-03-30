'use client';

import { Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EmergencyNumbersProps {
  numbers: string[];
}

export function EmergencyNumbers({ numbers }: EmergencyNumbersProps) {
  const t = useTranslations('outcome');

  if (!numbers || numbers.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-[#1A1A1A] bg-primary/10 p-4 shadow-[2px_2px_0_#1A1A1A]">
      {numbers.map((number) => (
        <a
          key={number}
          href={`tel:${number.replace(/\s/g, '')}`}
          className="flex items-center gap-3 py-1 text-lg font-bold text-primary"
        >
          <Phone className="h-5 w-5 shrink-0" />
          <span>{number}</span>
          <span className="text-sm font-medium">{t('emergencyCallNow')}</span>
        </a>
      ))}
    </div>
  );
}
