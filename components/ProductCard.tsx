'use client';

import { useEffect, useState } from 'react';
import { timeAgo } from '@/lib/utils';
import { Toast } from './Toast';
import type { ToastType } from './Toast';
import { AlertRulesPanel } from './AlertRulesPanel';
import { PriceChart } from './PriceChart';

interface TrackedItem {
  id: string;
  product: {
    id: string;
    title: string;
    store: string;
    original_url?: string;
    url?: string;
    last_price: string | number;
    in_stock: boolean | null;
    last_scraped_at: string | null;
    price_history: Array<{ price: string | number }>;
  };
}

interface AlertRule {
  id: string;
  tracked_item_id?: string;
  trackedItemId?: string;
  productId?: string;
  type: 'PERCENTAGE_DROP' | 'TARGET_PRICE';
  threshold: number | string;
  last_fired_at?: string | null;
}

interface PricePoint {
  scraped_at: string;
  price: number | string;
  in_stock: boolean;
}

interface ToastState {
  type: ToastType;
  title: string;
  message?: string;
}

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export function ProductCard({
  item,
  onDeleted,
}: {
  item: TrackedItem;
  onDeleted?: () => void;
}) {
  const [deletePlan, setDeletePlan] = useState<{ ruleIds: string[]; message: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const currentPrice = Number(item.product.last_price);
  const previousPrice = item.product.price_history?.[0]
    ? Number(item.product.price_history[0].price)
    : null;
  const changePercent =
    previousPrice && previousPrice !== currentPrice
      ? Math.round(((currentPrice - previousPrice) / previousPrice) * 100)
      : null;
  const isPriceDrop = changePercent !== null && changePercent < 0;
  const originalUrl = item.product.original_url ?? item.product.url;

  function ruleBelongsToItem(rule: AlertRule) {
    const owner = rule.tracked_item_id ?? rule.trackedItemId ?? rule.productId;
    return owner === item.id || owner === item.product.id || owner === `track-${item.product.id}`;
  }

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;

    async function loadRules() {
      setLoadingRules(true);
      try {
        const res = await fetch(`/api/alert-rules?trackedItemId=${item.id}&productId=${item.product.id}`);
        const data = await res.json().catch(() => []);
        if (!cancelled) {
          const filtered = Array.isArray(data) ? data.filter(ruleBelongsToItem) : [];
          setRules(filtered);
        }
      } catch {
        if (!cancelled) {
          setRules([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRules(false);
        }
      }
    }

    void loadRules();
    return () => {
      cancelled = true;
    };
  }, [expanded, item.id, item.product.id]);

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;

    async function loadChart() {
      setLoadingChart(true);
      try {
        const res = await fetch(`/api/price-history/${item.id}?days=30`);
        const data = await res.json().catch(() => []);
        if (!cancelled) {
          setChartData(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setChartData([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingChart(false);
        }
      }
    }

    void loadChart();
    return () => {
      cancelled = true;
    };
  }, [expanded, item.id]);

  async function loadRulesForDelete() {
    if (rules.length > 0) {
      return rules.map((rule) => rule.id);
    }

    const res = await fetch(`/api/alert-rules?trackedItemId=${item.id}&productId=${item.product.id}`);
    const data = await res.json().catch(() => []);

    if (!res.ok || !Array.isArray(data)) {
      throw new Error('Could not check alert rules.');
    }

    return data.filter(ruleBelongsToItem).map((rule) => rule.id);
  }

  async function removeProductWithRules(ruleIds: string[]) {
    setDeleting(true);
    try {
      for (const ruleId of ruleIds) {
        const ruleRes = await fetch(`/api/alert-rules?id=${ruleId}`, { method: 'DELETE' });
        if (!ruleRes.ok) {
          throw new Error('Failed to remove alert rules first.');
        }
      }

      const res = await fetch(`/api/tracked-items?id=${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        setRules([]);
        setToast({ type: 'success', title: 'Product removed', message: item.product.title });
        if (onDeleted) {
          setTimeout(onDeleted, 400);
        }
      } else {
        const data = await res.json().catch(() => null);
        setToast({
          type: 'error',
          title: 'Failed to remove',
          message: data?.message ?? 'Please try again.',
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Could not remove product',
        message: error instanceof Error ? error.message : 'Check your connection and try again.',
      });
    } finally {
      setDeleting(false);
      setDeletePlan(null);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();

    if (deletePlan) {
      await removeProductWithRules(deletePlan.ruleIds);
      return;
    }

    setDeleting(true);
    try {
      const ruleIds = await loadRulesForDelete();
      if (ruleIds.length === 0) {
        await removeProductWithRules([]);
        return;
      }

      setDeletePlan({
        ruleIds,
        message:
          ruleIds.length === 1
            ? 'This product has 1 alert rule. Remove the rule and the product?'
            : `This product has ${ruleIds.length} alert rules. Remove them and the product?`,
      });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Could not check alert rules',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setDeletePlan(null);
  }

  return (
    <>
      <div
        className="glass border-glow-animated cursor-pointer"
        style={{ padding: '14px 16px' }}
        onClick={() => !deletePlan && setExpanded((value) => !value)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          <h3
            style={{
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '1.35',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.product.title}
          </h3>

          <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '100px' }}>
            <p
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: isPriceDrop ? 'var(--emerald)' : 'var(--text-primary)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {currentPrice ? `${currentPrice.toLocaleString()} EGP` : (
                <span className="pulse-soft" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Scraping...
                </span>
              )}
            </p>
          </div>

          {!deletePlan && (
            <button
              onClick={handleDelete}
              title="Remove product"
              disabled={deleting}
              style={{
                flexShrink: 0,
                padding: '5px',
                borderRadius: '8px',
                background: 'rgba(251,113,133,0.08)',
                border: '1px solid rgba(251,113,133,0.18)',
                color: 'rgba(251,113,133,0.55)',
                cursor: deleting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                marginTop: '1px',
              }}
              onMouseEnter={e => {
                if (deleting) return;
                e.currentTarget.style.background = 'rgba(251,113,133,0.18)';
                e.currentTarget.style.color = 'var(--rose)';
                e.currentTarget.style.borderColor = 'rgba(251,113,133,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(251,113,133,0.08)';
                e.currentTarget.style.color = 'rgba(251,113,133,0.55)';
                e.currentTarget.style.borderColor = 'rgba(251,113,133,0.18)';
              }}
            >
              <TrashIcon />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 500,
              background: 'rgba(15,23,42,0.05)',
              border: '1px solid rgba(15,23,42,0.08)',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            {item.product.store}
          </span>

          {item.product.last_scraped_at && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {timeAgo(item.product.last_scraped_at)}
            </span>
          )}

          <div style={{ flex: 1 }} />

          {changePercent !== null && !deletePlan && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                ...(isPriceDrop
                  ? { background: 'rgba(22,163,74,0.1)', color: 'var(--emerald)', border: '1px solid rgba(22,163,74,0.2)' }
                  : { background: 'rgba(220,38,38,0.1)', color: 'var(--rose)', border: '1px solid rgba(220,38,38,0.18)' }),
              }}
            >
              {changePercent > 0 ? '+' : ''}{changePercent}%
            </span>
          )}

          {!deletePlan && (
            <span
              className={item.product.in_stock ? 'badge-instock' : 'badge-outofstock'}
              style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              {item.product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          )}

          {deletePlan && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{deletePlan.message}</span>
              <button
                onClick={handleCancel}
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(15,23,42,0.08)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'rgba(220,38,38,0.12)',
                  border: '1px solid rgba(220,38,38,0.28)',
                  color: 'var(--rose)',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                <TrashIcon />
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          )}
        </div>

        {expanded && (
          <div
            className="mt-4 rounded-2xl border p-4"
            style={{
              borderColor: 'var(--glass-border)',
              background: 'var(--panel-subtle)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--glass-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  Source
                </p>
                <p className="mt-2 break-all text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {originalUrl ? (
                    <a href={originalUrl} target="_blank" rel="noreferrer" style={{ color: '#b91c1c' }}>
                      {originalUrl}
                    </a>
                  ) : (
                    'URL not provided by backend yet'
                  )}
                </p>
              </div>

              <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--glass-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  Tracking status
                </p>
                <div className="mt-2 space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p>Current price: {currentPrice ? `${currentPrice.toLocaleString()} EGP` : 'Pending scrape'}</p>
                  <p>Status: {item.product.in_stock ? 'In stock' : 'Out of stock'}</p>
                  <p>Updated: {item.product.last_scraped_at ? timeAgo(item.product.last_scraped_at) : 'Not scraped yet'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="mb-4 flex items-center gap-2">
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Price history
                </h4>
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-semibold"
                  style={{
                    background: 'rgba(15,23,42,0.05)',
                    border: '1px solid rgba(15,23,42,0.08)',
                    color: 'var(--text-primary)',
                  }}
                >
                  30 days
                </span>
              </div>
              {loadingChart ? (
                <div
                  className="flex h-[260px] items-center justify-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Loading chart...
                </div>
              ) : (
                <PriceChart data={chartData} />
              )}
            </div>

            <div className="mt-4">
              {loadingRules ? (
                <div
                  className="rounded-2xl border p-4 text-sm"
                  style={{ borderColor: 'var(--glass-border)', color: 'var(--text-muted)' }}
                >
                  Loading alert rules...
                </div>
              ) : (
                <AlertRulesPanel rules={rules} trackedItemId={item.id} />
              )}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast type={toast.type} title={toast.title} message={toast.message} onDone={() => setToast(null)} />
      )}
    </>
  );
}

