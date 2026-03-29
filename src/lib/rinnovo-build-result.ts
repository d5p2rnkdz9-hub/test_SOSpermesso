/**
 * Shared helper: builds a rinnovo result node from Notion data.
 *
 * Extracted to avoid circular dependency between conversione-tree and rinnovo-conversione-tree.
 */

import type { TreeNode, ResultSection } from '@/types/tree';
import type { RinnovoPermit } from './rinnovo-notion-data.generated';

const GENERIC_DOC_PATTERNS = [
  /^marca da bollo/i,
  /^fototessere/i,
  /^\d+ fototessere/i,
  /^bollettino postale/i,
  /^copia del passaporto/i,
  /^permesso in scadenza/i,
  /^copia del permesso/i,
  /^dichiarazione di ospitalit/i,
];

export function buildResult(
  nodeId: string,
  permit: RinnovoPermit | undefined,
  overrides?: { title?: string; introText?: string; extraSections?: ResultSection[] },
): TreeNode {
  if (!permit) {
    return {
      id: nodeId,
      type: 'result',
      title: 'Informazioni non disponibili',
      introText: 'Non abbiamo informazioni su questo permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale gratuita.',
      sections: [],
    };
  }

  const method = permit.modRinnovo[0] ?? '';
  const notPossible = method === 'n/a' || method === 'rinnovabile previa conversione' || method === '';
  const sections: ResultSection[] = [];

  const realDocs = permit.docRinnovo
    .filter((d) => d !== 'n/a' && d !== 'rinnovabile previa conversione')
    .map((d) => d.replace(/^Permesso in scadenza$/i, 'Copia del permesso che hai adesso'));
  const hallmarkDocs = realDocs.filter(
    (d) => !GENERIC_DOC_PATTERNS.some((p) => p.test(d)),
  );
  const genericDocs = realDocs.filter(
    (d) => GENERIC_DOC_PATTERNS.some((p) => p.test(d)),
  );

  // --- Green badge + descriptive intro ---
  const displayName = (overrides?.title ?? permit.notionName).toLowerCase();
  if (!notPossible) {
    sections.push({
      heading: '\u2705 Rinnovo possibile',
      content: `[Nome], il tuo permesso per ${displayName} [StatoPermesso] e può essere rinnovato. Puoi fare da solo, ma è sempre consigliabile chiedere un parere legale.`,
    });
  }

  // --- Method section ---
  if (method === 'KIT') {
    sections.push({
      heading: '\ud83d\udce6 Come rinnovare',
      content:
        'La domanda di rinnovo si presenta tramite il [kit postale](https://www.sospermesso.it/kit-postale) disponibile presso gli uffici postali abilitati. Compila il modulo, allega i documenti e spedisci.',
    });
  } else if (method === 'personalmente') {
    sections.push({
      heading: '\ud83d\udce6 Come rinnovare',
      content:
        'La domanda di rinnovo si presenta di persona in Questura. Prendi un appuntamento e porta tutti i documenti necessari.',
    });
  } else if (method === 'n/a') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
      content:
        permit.possoConvertire
          ? `Questo permesso non si rinnova direttamente. Tuttavia, è possibile convertirlo: ${permit.possoConvertire}. Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)`
          : 'Questo permesso non si rinnova direttamente. Ti consigliamo di rivolgerti a un servizio di consulenza legale per valutare le alternative.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
    });
  } else if (method === 'rinnovabile previa conversione') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
      content:
        'Questo permesso non si rinnova: prima della scadenza devi convertirlo in un altro tipo di permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
    });
  } else if (method === '') {
    sections.push({
      heading: '\ud83d\udc68\u200d\u2696\ufe0f Consulenza legale consigliata',
      content:
        'Non abbiamo informazioni sufficienti sul rinnovo di questo permesso. Ti consigliamo di rivolgerti a un servizio di consulenza legale.\n\n[Trova assistenza legale gratuita](https://www.sospermesso.it/aiuto-legale)',
    });
  }

  // For "not possible" outcomes, only show the lawyer advice above — skip details
  if (!notPossible) {
    // --- Duration section (merged with duration-related warnings) ---
    if (permit.duration) {
      let durationContent = `Il permesso dura ${permit.duration}.`;
      if (permit.infoExtra) {
        const durationWarnings = permit.infoExtra
          .split('\n\n')
          .filter((s) => /durat|anni|mesi|scaden|rinnov/i.test(s));
        if (durationWarnings.length > 0) {
          durationContent += '\n\n' + durationWarnings.join('\n\n');
        }
      }
      sections.push({
        heading: '\u23f3 Durata',
        content: durationContent,
      });
    }

    // --- Documents section (hallmark bold + generic together) ---
    const allDocLines: string[] = [];
    if (hallmarkDocs.length > 0) {
      allDocLines.push(...hallmarkDocs.map((d) => `\u2022 **${d}**`));
    }
    if (genericDocs.length > 0) {
      allDocLines.push(...genericDocs.map((d) => `\u2022 ${d}`));
    }
    if (allDocLines.length > 0) {
      sections.push({
        heading: '\ud83d\udcc4 Documenti necessari',
        content: allDocLines.join('\n'),
      });
    }

    // --- Warnings section (excluding duration-related ones already merged) ---
    if (permit.infoExtra) {
      const nonDurationWarnings = permit.infoExtra
        .split('\n\n')
        .filter((s) => !/durat|anni|mesi|scaden|rinnov/i.test(s));
      if (nonDurationWarnings.length > 0) {
        sections.push({
          heading: '\u26a0\ufe0f Note importanti',
          content: nonDurationWarnings.join('\n\n'),
        });
      }
    }

    // --- Conversione section ---
    if (permit.possoConvertire) {
      sections.push({
        heading: '\ud83d\udd04 Conversione possibile',
        content: `${permit.possoConvertire}.\n\nAttenzione: la domanda di conversione deve essere presentata prima della scadenza del permesso.`,
      });
    }
  }

  // --- Extra sections from overrides ---
  if (overrides?.extraSections) {
    sections.push(...overrides.extraSections);
  }

  // Guide link is now rendered as the yellow CTA button in OutcomePage
  // via permit-url-map.ts (r_end_* → sospermesso.it#rinnovo)

  const title = overrides?.title ?? permit.notionName;

  let introText: string;
  if (method === 'KIT') {
    introText = overrides?.introText ?? `Il tuo permesso per ${displayName} può essere rinnovato tramite il kit postale.`;
  } else if (method === 'personalmente') {
    introText =
      overrides?.introText ?? `Il tuo permesso per ${displayName} può essere rinnovato presentandoti di persona in Questura.`;
  } else if (method === 'n/a' || method === 'rinnovabile previa conversione') {
    introText = overrides?.introText ?? 'Purtroppo, questo permesso non si può rinnovare direttamente.';
  } else {
    introText =
      overrides?.introText ??
      'Non abbiamo informazioni complete sul rinnovo di questo permesso. Ti consigliamo una consulenza legale.';
  }

  return { id: nodeId, type: 'result', title, introText, sections };
}
