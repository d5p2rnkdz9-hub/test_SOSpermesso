import { RC_OUTCOME_SLUGS } from '@/lib/rinnovo-conversione-outcome-slugs';
import { rinnovoConversioneTree } from '@/lib/rinnovo-conversione-tree';
import { getNode } from '@/lib/tree-engine';
import {
  renderOutcomeOgImage,
  OG_IMAGE_SIZE,
  OG_CONTENT_TYPE,
} from '@/lib/outcome-og';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'SOSpermesso — rinnovo o conversione del permesso';

export default async function Image({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const nodeId = RC_OUTCOME_SLUGS[params.slug];
  const node = nodeId ? getNode(rinnovoConversioneTree, nodeId) : undefined;
  if (!node) {
    return renderOutcomeOgImage({
      id: 'fallback',
      type: 'result',
      title: 'SOSpermesso',
    });
  }
  return renderOutcomeOgImage(node);
}
