import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Anteprime Netlify (branch deploy, deploy preview): indirizzo del deploy, fissato alla build.
// In produzione resta vuoto: lì valgono solo gli host di PROD_HOSTS (src/lib/auth.ts).
const ANTEPRIMA_URL =
  process.env.CONTEXT === 'branch-deploy' || process.env.CONTEXT === 'deploy-preview'
    ? (process.env.DEPLOY_PRIME_URL ?? '').replace(/\/$/, '')
    : '';

const nextConfig: NextConfig = {
  env: { ANTEPRIMA_URL },
  // NEXT_DIST_DIR lets a production build run next to a `next dev` that
  // holds .next (parallel sessions). Unset = default, as on Netlify.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
