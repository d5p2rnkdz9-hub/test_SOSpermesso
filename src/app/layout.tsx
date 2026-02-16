import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOSpermesso - Verifica il tuo diritto al permesso di soggiorno',
  description: 'Scopri quale permesso di soggiorno puoi richiedere in Italia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
