import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { attachSessionFromJson, setSessionCookie } from '@/lib/auth';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const body = await request.json();
    const res = await proxyToNest(request, '/auth/register', { body, method: 'POST' });
    return attachSessionFromJson(res);
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
  setSessionCookie(response, 'mock-jwt-token');
  return response;
}
