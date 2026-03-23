import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ConversioneOutcomePage({ params }: Props) {
  const { locale, slug } = await params;
  redirect(`/${locale}/outcome/rinnovo-conversione/conversione-${slug}`);
}
