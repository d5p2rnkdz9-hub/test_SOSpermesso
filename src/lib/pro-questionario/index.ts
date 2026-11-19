import 'server-only';

import { conversionePro } from './conversione';
import type { ProModulo, ProTree } from './types';

/**
 * PRO questionnaire modules. Server-only: the trees reach the browser only
 * through the PRO pages, after getProAccess() has let the user in.
 */
const MODULI: Record<string, ProTree> = {
  [conversionePro.id]: conversionePro,
};

export const ELENCO_MODULI: ProModulo[] = [
  {
    id: 'conversione',
    titolo: 'Conversione del permesso',
    descrizione:
      'Da un titolo di soggiorno a un altro: ammissibilità, base normativa, procedura, giurisprudenza e casi limite per ogni coppia di permessi.',
    disponibile: true,
  },
  {
    id: 'primo-rilascio',
    titolo: 'Primo rilascio',
    descrizione: 'Quale permesso può chiedere chi è in Italia senza titolo o con un visto: presupposti e fonti.',
    disponibile: false,
  },
  {
    id: 'rinnovo',
    titolo: 'Rinnovo',
    descrizione: 'Requisiti per il rinnovo, rinnovo tardivo, diniego e rimedi.',
    disponibile: false,
  },
];

export function getProTree(id: string): ProTree | null {
  return MODULI[id] ?? null;
}
