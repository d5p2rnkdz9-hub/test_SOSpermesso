/* Palette e classi del design system «Adesivo», come in sosflussi.it/assets/pro.css.
 * Stringhe letterali: Tailwind non vede classi composte a runtime. */

export const INK = '#141414';
export const C = {
  accent: '#FFD400', // giallo SOS Permesso (--brand)
  accentTint: '#FFF4C2',
  brandTint: '#FBEFD8',
  muted: '#5A5A5A',
  okTint: '#E3F6EA',
  warnTint: '#FFF4D6',
  errore: '#B3261E',
};

/** Scheda a adesivo (.pro-card). */
export const card = 'rounded-[18px] border-[2.5px] border-[#141414] bg-white p-4 shadow-[5px_5px_0_#141414] sm:p-6';
/** Variante chiara (.pro-card--chiara). */
export const cardChiara = 'rounded-[18px] border-[2.5px] border-[#141414] p-4 shadow-[3px_3px_0_#141414] sm:p-6';
/** Riquadro di avviso (.pro-box). */
export const box = 'rounded-xl border-[2.5px] border-[#141414] px-[18px] py-4 text-base';
export const input =
  'w-full rounded-lg border-[2.5px] border-[#141414] bg-white px-3 py-2.5 text-base font-normal outline-none focus-visible:ring-4 focus-visible:ring-[#4D9FFF]/50 aria-[invalid=true]:border-[#B3261E]';
export const label = 'text-base font-bold';
/** Bottone PRO (.btn.btn-pro). */
export const btnPro =
  'inline-flex min-h-[48px] items-center justify-center rounded-xl border-[2.5px] border-[#141414] bg-[#FFD400] px-5 font-extrabold shadow-[4px_4px_0_#141414] transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_#141414] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#141414] disabled:opacity-60';
/** Bottone secondario piccolo (.btn.btn-secondary.btn-piccolo). */
export const btnSecondario =
  'inline-flex min-h-[40px] items-center justify-center rounded-xl border-[2.5px] border-[#141414] bg-white px-4 text-sm font-extrabold shadow-[3px_3px_0_#141414] disabled:opacity-60';
/** Bottone a forma di link (.pro-link-btn). */
export const linkBtn = 'min-h-[40px] px-1 text-[15px] font-bold underline decoration-2 underline-offset-[3px]';
