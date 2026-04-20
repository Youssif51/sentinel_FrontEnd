import { NextResponse } from 'next/server';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/',
  maxAge: SESSION_MAX_AGE,
  sameSite: 'lax' as const,
};

export function setSessionCookie(response: NextResponse, accessToken: string) {
  response.cookies.set('session', accessToken, COOKIE_OPTIONS);
}

export function setRefreshCookie(response: NextResponse, refreshToken: string) {
  response.cookies.set('refresh_token', refreshToken, COOKIE_OPTIONS);
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set('session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    expires: new Date(0),
  });
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    expires: new Date(0),
  });
}

export async function attachSessionFromJson(response: NextResponse) {
  const data = await response.clone().json().catch(() => null);
  if (data?.access_token) {
    setSessionCookie(response, data.access_token);
  }
  if (data?.refresh_token) {
    setRefreshCookie(response, data.refresh_token);
  }

  return response;
}
