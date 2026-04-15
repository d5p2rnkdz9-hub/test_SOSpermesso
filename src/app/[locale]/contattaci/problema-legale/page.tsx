import { setRequestLocale } from 'next-intl/server';
import { ContentColumn } from '@/components/layout/ContentColumn';
import { ProblemaLegaleForm } from '@/components/contact/ProblemaLegaleForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProblemaLegalePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ContentColumn>
      <ProblemaLegaleForm />
    </ContentColumn>
  );
}
