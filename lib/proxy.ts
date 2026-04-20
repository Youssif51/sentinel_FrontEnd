import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearSessionCookie } from './auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/**
 * Forwards a Next.js request to NestJS and returns the response.
 * - Attaches the session cookie as a Bearer token Authorization header.
 * - Forwards cookies so refresh/logout flows can work against the backend.
 * - Propagates backend Set-Cookie headers back to the browser.
 * - Preserves status codes and JSON body from NestJS.
 * - Attempts one token refresh on 401 before clearing the session cookie.
 */
export async function proxyToNest(
  request: NextRequest,
  path: string,
  options?: { body?: unknown; method?: string }
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  const method = options?.method ?? request.method;
  const url = `${API_URL}${path}`;
  const cookieHeader = request.headers.get('cookie') ?? '';

  let body: string | undefined;
  if (options?.body !== undefined) {
    body = JSON.stringify(options.body);
  } else if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
    try { body = JSON.stringify(await request.json()); } catch { /* no body */ }
  }

  const makeHeaders = (accessToken?: string): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });

  const toNextResponse = async (res: Response) => {
    const data = await res.json().catch(() => null);
    const response = NextResponse.json(data ?? {}, { status: res.status });
    response.headers.set('cache-control', 'no-store, no-cache, must-revalidate');

    for (const setCookie of res.headers.getSetCookie()) {
      response.headers.append('set-cookie', setCookie);
    }

    return response;
  };

  try {
    let res = await fetch(url, {
      method,
      headers: makeHeaders(token),
      body,
    });

    if (res.status === 401 && path !== '/auth/refresh') {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: makeHeaders(),
      });
      const refreshData = await refreshRes.clone().json().catch(() => null);

      if (refreshRes.ok && refreshData?.access_token) {
        res = await fetch(url, {
          method,
          headers: makeHeaders(refreshData.access_token),
          body,
        });

        const response = await toNextResponse(res);
        response.cookies.set('session', refreshData.access_token, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        });

        for (const setCookie of refreshRes.headers.getSetCookie()) {
          response.headers.append('set-cookie', setCookie);
        }

        if (res.status === 401) {
          clearSessionCookie(response);
        }

        return response;
      }
    }

    const response = await toNextResponse(res);
    if (res.status === 401) {
      clearSessionCookie(response);
    }
    return response;
  } catch {
    const response = NextResponse.json(
      { message: 'Could not reach backend. Check API_URL.' },
      { status: 503 }
    );
    response.headers.set('cache-control', 'no-store, no-cache, must-revalidate');
    return response;
  }
}
