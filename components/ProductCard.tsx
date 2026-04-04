'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { timeAgo } from '@/lib/utils';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

interface TrackedItem {
  id: string;
  product: {
    id: string;
    title: string;
    store: string;
    last_price: string | number;
    in_stock: boolean;
    last_scraped_at: string;
    price_history: Array<{ price: string | number }>;
  };
}

interface ToastState { type: ToastType; title: string; message?: string; }

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    try {
      const res = await fetch(`/api/tracked-items?id=${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ type: 'success', title: 'Product removed', message: item.product.title });
        if (onDeleted) {
          setTimeout(onDeleted, 400);
        } else {
          setTimeout(() => router.refresh(), 800);
        }
      } else {
        setToast({ type: 'error', title: 'Failed to remove', message: 'Please try again' });
        setDeleting(false);
        setConfirming(false);
      }
    } catch {
      setToast({ type: 'error', title: 'Network error', message: 'Check your connection' });
      setDeleting(false);
      setConfirming(false);
    }
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirming(false);
  }

  return (
    <>
      <div
        className="glass border-glow-animated cursor-pointer"
        style={{ padding: '14px 16px' }}
        onClick={() => !confirming && router.push(`/products/${item.product.id}`)}
      >
        {/* Row 1: title + price + trash */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          {/* Title */}
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

          {/* Price */}
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

          {/* Trash — always visible */}
          {!confirming && (
            <button
              onClick={handleDelete}
              title="Remove product"
              style={{
                flexShrink: 0,
                padding: '5px',
                borderRadius: '8px',
                background: 'rgba(251,113,133,0.08)',
                border: '1px solid rgba(251,113,133,0.18)',
                color: 'rgba(251,113,133,0.55)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                marginTop: '1px',
              }}
              onMouseEnter={e => {
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

        {/* Row 2: store / time / badges / confirm buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 500,
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.2)',
              color: 'var(--cyan)',
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

          {/* Price change badge — hidden when confirming */}
          {changePercent !== null && !confirming && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                ...(isPriceDrop
                  ? { background: 'rgba(74,222,128,0.1)', color: 'var(--emerald)', border: '1px solid rgba(74,222,128,0.25)' }
                  : { background: 'rgba(251,113,133,0.1)', color: 'var(--rose)', border: '1px solid rgba(251,113,133,0.25)' }),
              }}
            >
              {changePercent > 0 ? '+' : ''}{changePercent}%
            </span>
          )}

          {/* Stock badge — hidden when confirming */}
          {!confirming && (
            <span
              className={item.product.in_stock ? 'badge-instock' : 'badge-outofstock'}
              style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              {item.product.in_stock ? '● In Stock' : '● Out of Stock'}
            </span>
          )}

          {/* Confirm delete inline */}
          {confirming && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={e => e.stopPropagation()}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Remove this product?</span>
              <button
                onClick={handleCancel}
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
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
                  background: 'rgba(251,113,133,0.15)',
                  border: '1px solid rgba(251,113,133,0.35)',
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
      </div>

      {toast && (
        <Toast type={toast.type} title={toast.title} message={toast.message} onDone={() => setToast(null)} />
      )}
    </>
  );
}
