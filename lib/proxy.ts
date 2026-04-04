import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/**
 * Forwards a Next.js request to NestJS and returns the response.
 * - Attaches the session cookie as a Bearer token Authorization header.
 * - Preserves status codes and JSON body from NestJS.
 * - On 401, clears the session cookie so the frontend redirects to login.
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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let body: string | undefined;
  if (options?.body !== undefined) {
    body = JSON.stringify(options.body);
  } else if (!['GET', 'HEAD', 'DELETE'].includes(method)) {
    try { body = JSON.stringify(await request.json()); } catch { /* no body */ }
  }

  try {
    const res = await fetch(url, { method, headers, body });
    const data = await res.json().catch(() => null);

    const response = NextResponse.json(data ?? {}, { status: res.status });

    // If NestJS returns 401, clear the session so user gets redirected to login
    if (res.status === 401) {
      response.cookies.delete('session');
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: 'Could not reach backend. Check API_URL.' },
      { status: 503 }
    );
  }
}
