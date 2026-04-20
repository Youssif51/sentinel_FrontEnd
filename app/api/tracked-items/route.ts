import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { MOCK_TRACKED_ITEMS, MOCK_PRODUCTS } from '@/lib/mockData';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();

export async function GET(request: NextRequest) {
  if (USE_REAL_API) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const path = productId
      ? `/tracked-items/by-product/${productId}`
      : '/tracked-items';
    return proxyToNest(request, path, { method: 'GET' });
  }

  // ── Mock fallback ──
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (productId) {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  }

  return NextResponse.json({
    items: MOCK_TRACKED_ITEMS,
    plan: 'FREE',
    count: MOCK_TRACKED_ITEMS.length,
  });
}

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const body = await request.json();
    return proxyToNest(request, '/tracked-items', { body, method: 'POST' });
  }

  // ── Mock fallback ──
  const body = await request.json();
  const { url } = body;
  if (!url) return NextResponse.json({ message: 'Product URL is required.' }, { status: 400 });

  return NextResponse.json(
    {
      id: `track-new-${Date.now()}`,
      product: {
        id: `prod-new-${Date.now()}`,
        title: 'New Tracked Product (scraping...)',
        store: 'Unknown',
        original_url: url,
        last_price: null,
        in_stock: null,
        last_scraped_at: null,
        price_history: [],
      },
    },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  if (USE_REAL_API) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    return proxyToNest(request, `/tracked-items/${id}`, { method: 'DELETE' });
  }

  // ── Mock fallback ──
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'ID is required.' }, { status: 400 });
  return NextResponse.json({ message: 'Deleted.' }, { status: 200 });
}
