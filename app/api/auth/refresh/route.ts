import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { attachSessionFromJson, setSessionCookie } from '@/lib/auth';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const res = await proxyToNest(request, '/auth/refresh', { method: 'POST' });
    return attachSessionFromJson(res);
  }

  const response = NextResponse.json({ access_token: 'mock-refreshed-token' }, { status: 200 });
  setSessionCookie(response, 'mock-refreshed-token');
  return response;
}
