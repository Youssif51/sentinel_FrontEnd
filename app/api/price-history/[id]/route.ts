import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { generatePriceHistory } from '@/lib/mockData';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') ?? '30';

  if (USE_REAL_API) {
    const response = await proxyToNest(request, `/tracked-items/${id}/price-history?days=${days}`, { method: 'GET' });
    const data = await response.json().catch(() => null);
    const points = Array.isArray(data) ? data : data?.points;

    return NextResponse.json(Array.isArray(points) ? points : [], { status: response.status });
  }

  return NextResponse.json(generatePriceHistory(id));
}
