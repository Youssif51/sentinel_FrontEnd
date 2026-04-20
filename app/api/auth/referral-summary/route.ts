import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();

export async function GET(request: NextRequest) {
  if (USE_REAL_API) {
    return proxyToNest(request, '/auth/referral-summary', { method: 'GET' });
  }

  return NextResponse.json({
    referralCode: 'DEMO123456',
    successfulReferrals: 2,
    bonusTrackingSlots: 2,
    baseTrackingLimit: 5,
    totalTrackingLimit: 7,
    maxBonusTrackingSlots: 3,
  });
}
