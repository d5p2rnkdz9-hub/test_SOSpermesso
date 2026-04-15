import { setRequestLocale } from 'next-intl/server';
import { ContentColumn } from '@/components/layout/ContentColumn';
import { ContribuisciForm } from '@/components/contact/ContribuisciForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContribuisciPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ContentColumn>
      <ContribuisciForm />
    </ContentColumn>
  );
}
