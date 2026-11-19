import { Atkinson_Hyperlegible, Poppins } from 'next/font/google';

/* Gli stessi caratteri di sosflussi.it (design «Adesivo»): Poppins per titoli, etichette e bottoni,
 * Atkinson Hyperlegible per il testo. Solo in questa pagina, che deve essere uguale a sosflussi.it/abbonati/. */
export const poppins = Poppins({
  weight: ['700', '800'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-poppins',
  display: 'swap',
});

export const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-atkinson',
  display: 'swap',
});

/** Classe per il carattere dei titoli (Poppins). */
export const disp = '[font-family:var(--font-poppins),system-ui,sans-serif]';
