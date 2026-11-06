import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR lets a production build run next to a `next dev` that
  // holds .next (parallel sessions). Unset = default, as on Netlify.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
