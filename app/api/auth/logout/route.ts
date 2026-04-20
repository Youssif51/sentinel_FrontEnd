import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { clearSessionCookie } from '@/lib/auth';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const res = await proxyToNest(request, '/auth/logout', { method: 'POST' });
    clearSessionCookie(res);
    return res;
  }

  const response = NextResponse.json({ message: 'Logged out.' }, { status: 200 });
  clearSessionCookie(response);
  return response;
}
