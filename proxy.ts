import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/dashboard',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/social/callback',
  '/api/auth/refresh',
  '/api/auth/logout',
];

const PUBLIC_PREFIXES = [
  '/_next',
  '/brand',
  '/icons',
  '/stores',
  '/favicon',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === '/' ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt)$/i.test(pathname);

  if (isPublic) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
