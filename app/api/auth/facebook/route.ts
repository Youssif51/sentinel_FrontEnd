import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { attachSessionFromJson, setSessionCookie } from '@/lib/auth';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const body = await request.json();
    const res = await proxyToNest(request, '/auth/facebook', { body, method: 'POST' });
    return attachSessionFromJson(res);
  }

  const response = NextResponse.json(
    { access_token: 'mock-facebook-token', referralCode: 'DEMO123456' },
    { status: 200 }
  );
  setSessionCookie(response, 'mock-facebook-token');
  return response;
}
