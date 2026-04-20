import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, setRefreshCookie, setSessionCookie } from '@/lib/auth';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('socialError', error ?? 'missing_code');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const exchangeResponse = await fetch(`${API_URL}/auth/social/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await exchangeResponse.json().catch(() => null);
    if (!exchangeResponse.ok || !data?.access_token || !data?.refresh_token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('socialError', data?.message ?? 'exchange_failed');
      return NextResponse.redirect(loginUrl);
    }

    const dashboardUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(dashboardUrl);
    setSessionCookie(response, data.access_token);
    setRefreshCookie(response, data.refresh_token);
    return response;
  } catch {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('socialError', 'network_error');
    const response = NextResponse.redirect(loginUrl);
    clearSessionCookie(response);
    return response;
  }
}
