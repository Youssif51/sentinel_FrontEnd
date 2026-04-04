import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';

const USE_REAL_API = !!process.env.API_URL;

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const body = await request.json();
    const res = await proxyToNest(request, '/auth/register', { body, method: 'POST' });

    if (res.status === 200 || res.status === 201) {
      const data = await res.clone().json().catch(() => null);
      if (data?.access_token) {
        res.cookies.set('session', data.access_token, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        });
      }
    }
    return res;
  }

  // ── Mock fallback ──
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 422 });
  }
  if (email === 'taken@example.com') {
    return NextResponse.json({ message: 'Email already in use.' }, { status: 409 });
  }

  const response = NextResponse.json({ message: 'Registration successful' }, { status: 201 });
  response.cookies.set('session', 'mock-jwt-token', {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
  });
  return response;
}
