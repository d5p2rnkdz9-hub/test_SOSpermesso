import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConversioneTreePage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/tree/rinnovo-conversione`);
}
