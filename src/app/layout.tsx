import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site-url';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Verifica il tuo diritto al permesso di soggiorno`,
    template: `%s`,
  },
  description:
    'Scopri in pochi minuti quale permesso di soggiorno puoi richiedere in Italia. Gratuito, in più lingue, senza registrazione.',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Verifica il tuo diritto al permesso di soggiorno`,
    description:
      'Scopri in pochi minuti quale permesso di soggiorno puoi richiedere in Italia.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
