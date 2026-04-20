import { NextRequest, NextResponse } from 'next/server';
import { proxyToNest } from '@/lib/proxy';
import { MOCK_ALERT_RULES } from '@/lib/mockData';
import { shouldUseRealApi } from '@/lib/runtime-mode';

const USE_REAL_API = shouldUseRealApi();
type RuleType = 'PERCENTAGE_DROP' | 'TARGET_PRICE';

const rules = [...MOCK_ALERT_RULES];

function normalizeRuleType(type: unknown): RuleType | null {
  if (type === 'PRICE_BELOW') return 'TARGET_PRICE';
  if (type === 'PERCENTAGE_DROP' || type === 'TARGET_PRICE') return type;
  return null;
}

function isValidThreshold(type: RuleType, threshold: unknown) {
  const numericThreshold = Number(threshold);
  if (!Number.isFinite(numericThreshold)) return false;
  if (type === 'PERCENTAGE_DROP') {
    return numericThreshold >= 1 && numericThreshold <= 90;
  }
  return numericThreshold >= 1;
}

export async function GET(request: NextRequest) {
  if (USE_REAL_API) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const trackedItemId = searchParams.get('trackedItemId');
    const query = trackedItemId
      ? `tracked_item_id=${encodeURIComponent(trackedItemId)}`
      : productId
        ? `productId=${encodeURIComponent(productId)}`
        : '';
    const path = query ? `/alert-rules?${query}` : '/alert-rules';
    return proxyToNest(request, path, { method: 'GET' });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const trackedItemId = searchParams.get('trackedItemId');
  const filtered = trackedItemId
    ? rules.filter((rule) => rule.tracked_item_id === trackedItemId)
    : productId
      ? rules.filter((rule) => rule.tracked_item_id === `track-${productId}`)
      : rules;
  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (USE_REAL_API) {
    const normalizedBody = {
      ...body,
      type: normalizeRuleType(body.type),
      tracked_item_id: body.tracked_item_id ?? body.trackedItemId ?? body.productId,
    };
    return proxyToNest(request, '/alert-rules', { body: normalizedBody, method: 'POST' });
  }

  const trackedItemId = body.tracked_item_id ?? body.trackedItemId ?? body.productId;
  const type = normalizeRuleType(body.type);
  const { threshold } = body;

  if (!trackedItemId || !type || threshold === undefined) {
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
  }
  if (!isValidThreshold(type, threshold)) {
    return NextResponse.json(
      { message: type === 'PERCENTAGE_DROP' ? 'Drop percentage must be between 1 and 90.' : 'Threshold must be at least 1.' },
      { status: 422 }
    );
  }

  const newRule = {
    id: `rule-${Date.now()}`,
    tracked_item_id: trackedItemId,
    type,
    threshold: Number(threshold),
    last_fired_at: null,
  };
  rules.push(newRule);
  return NextResponse.json(newRule, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Rule id is required.' }, { status: 400 });
  }

  if (USE_REAL_API) {
    const normalizedBody = {
      ...body,
      ...(body.type ? { type: normalizeRuleType(body.type) } : {}),
    };
    return proxyToNest(request, `/alert-rules/${id}`, { body: normalizedBody, method: 'PATCH' });
  }

  const rule = rules.find((item) => item.id === id);
  if (!rule) {
    return NextResponse.json({ message: 'Rule not found.' }, { status: 404 });
  }

  if (body.threshold !== undefined) {
    if (!isValidThreshold(rule.type, body.threshold)) {
      return NextResponse.json(
        { message: rule.type === 'PERCENTAGE_DROP' ? 'Drop percentage must be between 1 and 90.' : 'Threshold must be at least 1.' },
        { status: 422 }
      );
    }
    rule.threshold = Number(body.threshold);
  }
  if (body.type) {
    const normalizedType = normalizeRuleType(body.type);
    if (!normalizedType) {
      return NextResponse.json({ message: 'Invalid rule type.' }, { status: 400 });
    }
    if (body.threshold !== undefined && !isValidThreshold(normalizedType, body.threshold)) {
      return NextResponse.json(
        { message: normalizedType === 'PERCENTAGE_DROP' ? 'Drop percentage must be between 1 and 90.' : 'Threshold must be at least 1.' },
        { status: 422 }
      );
    }
    rule.type = normalizedType;
  }

  return NextResponse.json(rule);
}

export async function DELETE(request: NextRequest) {
  if (USE_REAL_API) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    return proxyToNest(request, `/alert-rules/${id}`, { method: 'DELETE' });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const idx = rules.findIndex((rule) => rule.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Rule not found.' }, { status: 404 });
  rules.splice(idx, 1);
  return NextResponse.json({ message: 'Deleted' });
}
