import { setRequestLocale } from 'next-intl/server';
import { ContentColumn } from '@/components/layout/ContentColumn';
import { SegnalaErroreForm } from '@/components/contact/SegnalaErroreForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SegnalaErrorePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ContentColumn>
      <SegnalaErroreForm />
    </ContentColumn>
  );
}
