import { setRequestLocale } from 'next-intl/server';
import ConversioneContent from './ConversioneContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConversioneTreePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ConversioneContent />;
}
