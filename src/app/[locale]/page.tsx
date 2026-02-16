import { setRequestLocale } from 'next-intl/server';

import WelcomeContent from './WelcomeContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function WelcomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <WelcomeContent />;
}
