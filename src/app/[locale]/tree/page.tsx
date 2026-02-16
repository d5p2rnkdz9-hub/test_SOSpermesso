import { setRequestLocale } from 'next-intl/server';
import TreeContent from './TreeContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TreePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TreeContent />;
}
