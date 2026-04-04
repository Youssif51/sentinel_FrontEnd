import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { generatePriceHistory } from '@/lib/mockData';

const USE_REAL_API = !!process.env.API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (USE_REAL_API) {
    return proxyToNest(request, `/price-history/${id}`, { method: 'GET' });
  }

  return NextResponse.json(generatePriceHistory(id));
}
