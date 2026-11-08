import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

/**
 * pro.sospermesso.it è un alias dello stesso deploy: la sua home porta
 * all'account (l'ingresso dell'area PRO) invece che al test gratuito.
 * Tutto il resto è identico su entrambi gli host.
 */
export default function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  if (host.startsWith('pro.') && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/it/account', request.url), 308);
  }
  return intl(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
