import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referralCode = searchParams.get('referralCode');
  const backendUrl = new URL(`${API_URL}/auth/google`);

  if (referralCode) {
    backendUrl.searchParams.set('referralCode', referralCode);
  }

  return NextResponse.redirect(backendUrl);
}
