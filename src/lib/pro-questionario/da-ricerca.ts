import type { ProEsito, ProSentenzaRif, ProVerdetto } from './types';

/**
 * Shape of the research files in ./dati/<modulo>/*.json, written by the
 * research agents with the immigrazbot-norme / immigrazbot-kb / ricerca-ga
 * skills and kept in the repo as the audit trail behind every outcome
 * (punti_da_validare are for the reviewing lawyer and are never rendered).
 */
export interface RicercaConversione {
  da: string;
  a: string;
  esito_verificato: string;
  discrepanza?: string | null;
  sintesi: string;
  regime_transitorio?: string | null;
  conta_nei_5_anni?: string | null;
  requisiti?: string[];
  procedura?: string;
  norme?: { estremi: string; contenuto: string; citazione?: string | null; url?: string | null }[];
  giurisprudenza?: {
    corte: string;
    data: string;
    numero: string;
    principio: string;
    esito?: string | null;
    url?: string | null;
  }[];
  prassi?: { ente: string; estremi: string; data?: string | null; oggetto: string; url?: string | null }[];
  casi_limite?: { titolo: string; testo: string }[];
  domande_discriminanti?: { domanda: string; perche: string; opzioni: string[] }[];
}

export interface RicercaFile {
  gruppo: string;
  regime: string;
  conversioni: RicercaConversione[];
  punti_da_validare?: string[];
}

function verdetto(v: string): ProVerdetto {
  const s = v.toLowerCase();
  if (s.startsWith('non_nec') || s.includes('non necessari')) return 'non_necessaria';
  if (s.startsWith('non')) return 'non_possibile';
  if (s.startsWith('condiz')) return 'condizionato';
  if (s.startsWith('incert')) return 'incerto';
  return 'possibile';
}

function esitoSentenza(e?: string | null): ProSentenzaRif['esito'] {
  if (!e) return null;
  const s = e.toLowerCase();
  if (s.includes('misto') || s.includes('parz')) return 'misto';
  if (s.includes('stranier') || s.includes('ricorrent') || s.includes('favorevole allo')) return 'favorevole';
  if (s.includes('pa') || s.includes('amministrazione')) return 'sfavorevole';
  return null;
}

/** Research entry → rendered outcome. */
export function esitoDaRicerca(r: RicercaConversione, titolo: string): ProEsito {
  return {
    verdetto: verdetto(r.esito_verificato),
    titolo,
    sintesi: r.sintesi,
    regimeTransitorio: r.regime_transitorio ?? null,
    requisiti: r.requisiti,
    procedura: r.procedura,
    norme: r.norme?.map((n) => ({ ...n })),
    giurisprudenza: r.giurisprudenza?.map((g) => ({
      corte: g.corte,
      data: g.data,
      numero: g.numero,
      principio: g.principio,
      esito: esitoSentenza(g.esito),
      url: g.url ?? null,
    })),
    prassi: r.prassi,
    casiLimite: r.casi_limite,
    verifiche: r.domande_discriminanti?.map((d) => ({ domanda: d.domanda, perche: d.perche })),
  };
}
