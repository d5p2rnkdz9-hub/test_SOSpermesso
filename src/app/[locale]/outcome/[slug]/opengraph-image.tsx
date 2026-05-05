import { OUTCOME_SLUGS } from '@/lib/outcome-slugs';
import { italianTree } from '@/lib/tree-data';
import { getNode } from '@/lib/tree-engine';
import {
  renderOutcomeOgImage,
  OG_IMAGE_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/outcome-og';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'SOSpermesso — risultato del test permessi';

export default async function Image({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const nodeId = OUTCOME_SLUGS[params.slug];
  const node = nodeId ? getNode(italianTree, nodeId) : undefined;
  if (!node) {
    return renderOutcomeOgImage({
      id: 'fallback',
      type: 'result',
      title: 'SOSpermesso',
    });
  }
  return renderOutcomeOgImage(node);
}
