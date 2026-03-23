import { setRequestLocale } from 'next-intl/server';
import RinnovoConversioneContent from './RinnovoConversioneContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RinnovoConversioneTreePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RinnovoConversioneContent />;
}
