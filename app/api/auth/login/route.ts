import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';

const USE_REAL_API = !!process.env.API_URL;

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const body = await request.json();
    const res = await proxyToNest(request, '/auth/login', { body, method: 'POST' });

    // If NestJS returns a token in the body, store it as an httpOnly cookie
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
  if (email === 'locked@example.com') {
    const unlocksAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    return NextResponse.json({ message: 'Account is locked.', unlocksAt }, { status: 423 });
  }
  if (password.length < 6) {
    return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
  }

  const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
  response.cookies.set('session', 'mock-jwt-token', {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
  });
  return response;
}
