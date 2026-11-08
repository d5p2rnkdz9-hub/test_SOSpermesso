/** Tipi del profilo PRO condivisi fra server e client (niente 'server-only' qui). */

export const TIPI_PROFILO = [
  { value: 'caf', label: 'CAF' },
  { value: 'patronato', label: 'Patronato' },
  { value: 'sindacato', label: 'Sindacato' },
  { value: 'consulente', label: 'Consulente del lavoro' },
  { value: 'avvocato', label: 'Studio legale' },
  { value: 'associazione', label: 'Associazione / sportello' },
  { value: 'pa', label: 'Ente pubblico' },
  { value: 'altro', label: 'Altro' },
] as const;

export type TipoProfilo = (typeof TIPI_PROFILO)[number]['value'];

export interface Profilo {
  tipo: TipoProfilo;
  organizzazione: string | null;
  citta: string | null;
}

export interface ProfiloInput extends Profilo {
  nome: string;
}

export function tipoLabel(tipo: string): string {
  return TIPI_PROFILO.find((t) => t.value === tipo)?.label ?? 'Altro';
}
