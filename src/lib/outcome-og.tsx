import { ImageResponse } from 'next/og';
import type { TreeNode } from '@/types/tree';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export function renderOutcomeOgImage(node: TreeNode): ImageResponse {
  const title = node.title ?? node.question ?? 'Risultato';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#FFD700',
          padding: 48,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            border: '8px solid #000',
            background: '#FFF',
            padding: 56,
            boxShadow: '12px 12px 0 #000',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 2,
              color: '#000',
            }}
          >
            S.O.S. PERMESSO
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: title.length > 60 ? 56 : 72,
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#000',
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: '#000',
              opacity: 0.7,
            }}
          >
            Verifica il tuo diritto al permesso di soggiorno
          </div>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
