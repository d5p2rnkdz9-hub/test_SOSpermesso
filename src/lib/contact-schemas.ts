import { z } from 'zod';

export const TIPO_ERRORE = [
  'info_sbagliata',
  'traduzione',
  'tecnico',
] as const;

export const LINGUA_ERRORE = ['it', 'en', 'fr', 'ar', 'es'] as const;

export const SITUAZIONE_LEGALE = [
  'ha_permesso',
  'non_so',
  'diniego',
  'altro',
] as const;

export const COME_CONTRIBUIRE = [
  'legale',
  'traduzioni',
  'donazione',
  'comunicazione',
  'altro',
] as const;

const emailOptional = z
  .string()
  .trim()
  .max(200)
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined))
  .pipe(z.string().email().optional());

export const segnalaErroreSchema = z
  .object({
    tipoErrore: z.enum(TIPO_ERRORE),
    lingua: z.enum(LINGUA_ERRORE).optional(),
    doveTrovato: z.string().trim().min(1).max(2000),
    descrizione: z.string().trim().min(10).max(2000),
    email: emailOptional,
  })
  .refine(
    (d) => d.tipoErrore !== 'traduzione' || !!d.lingua,
    { message: 'Lingua obbligatoria per errori di traduzione', path: ['lingua'] },
  );

export const problemaLegaleSchema = z.object({
  situazione: z.enum(SITUAZIONE_LEGALE),
  qualePermesso: z.string().trim().max(500).optional().transform((v) => v || undefined),
  descrizione: z.string().trim().min(10).max(2000),
  tempoItalia: z.string().trim().max(200).optional().transform((v) => v || undefined),
  email: z.string().trim().email().max(200),
  consenso: z.literal(true),
});

export const contribuisciSchema = z.object({
  comeContribuire: z.enum(COME_CONTRIBUIRE),
  raccontaci: z.string().trim().min(10).max(2000),
  nome: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
});

export type SegnalaErroreInput = z.infer<typeof segnalaErroreSchema>;
export type ProblemaLegaleInput = z.infer<typeof problemaLegaleSchema>;
export type ContribuisciInput = z.infer<typeof contribuisciSchema>;

// Mapping from form values to Notion select option names (must match
// the names created by scripts/setup-contact-dbs.ts exactly)
export const TIPO_ERRORE_LABEL: Record<(typeof TIPO_ERRORE)[number], string> = {
  info_sbagliata: 'Informazione sbagliata',
  traduzione: 'Errore di traduzione',
  tecnico: 'Link rotto / problema tecnico',
};

export const SITUAZIONE_LABEL: Record<(typeof SITUAZIONE_LEGALE)[number], string> = {
  ha_permesso: 'Ho già un permesso e ho un problema',
  non_so: 'Non so che permesso richiedere',
  diniego: 'Diniego / problema con la questura',
  altro: 'Altro',
};

export const COME_CONTRIBUIRE_LABEL: Record<(typeof COME_CONTRIBUIRE)[number], string> = {
  legale: 'Avvocato / operatore legale',
  traduzioni: 'Traduzioni',
  donazione: 'Donazione',
  comunicazione: 'Diffusione / comunicazione',
  altro: 'Altro',
};
