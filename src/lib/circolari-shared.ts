/** Costanti del corpus circolari condivise fra server e client (niente 'server-only' qui). */

/** Valore speciale in pro.segue_permesso: avvisi su tutte le nuove circolari in ambito. */
export const SEGUI_TUTTI = '*';

export function toUrlId(id: string): string {
  return id.replace(':', '-');
}
