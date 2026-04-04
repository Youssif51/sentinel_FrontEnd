import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { MOCK_ALERT_RULES } from '@/lib/mockData';

const USE_REAL_API = !!process.env.API_URL;

// In-memory store for mock only
const rules = [...MOCK_ALERT_RULES];

export async function GET(request: NextRequest) {
  if (USE_REAL_API) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const path = productId ? `/alert-rules?productId=${productId}` : '/alert-rules';
    return proxyToNest(request, path, { method: 'GET' });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const filtered = productId ? rules.filter((r) => r.productId === productId) : rules;
  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  if (USE_REAL_API) {
    const body = await request.json();
    return proxyToNest(request, '/alert-rules', { body, method: 'POST' });
  }

  const body = await request.json();
  const { productId, type, threshold } = body;
  if (!productId || !type || threshold === undefined) {
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
  }
  const newRule = { id: `rule-${Date.now()}`, productId, type, threshold: Number(threshold), last_fired_at: null };
  rules.push(newRule);
  return NextResponse.json(newRule, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (USE_REAL_API) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    return proxyToNest(request, `/alert-rules/${id}`, { method: 'DELETE' });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Rule not found.' }, { status: 404 });
  rules.splice(idx, 1);
  return NextResponse.json({ message: 'Deleted' });
}
