'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import Link from 'next/link';

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

const DELETED_KEY = 'sp_deleted_items';

function getDeletedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveDeletedId(id: string) {
  const ids = getDeletedIds();
  if (!ids.includes(id)) {
    localStorage.setItem(DELETED_KEY, JSON.stringify([...ids, id]));
  }
}

function applyDeletedFilter(items: TrackedItem[]): TrackedItem[] {
  if (typeof window === 'undefined') {
    return items;
  }

  const deleted = getDeletedIds();
  return items.filter((item) => !deleted.includes(item.id) && !deleted.includes(item.product.id));
}

export function TrackedList({
  initialItems,
  plan,
  totalLimit,
}: {
  initialItems: TrackedItem[];
  plan: string;
  totalLimit: number;
}) {
  const [items, setItems] = useState(() => applyDeletedFilter(initialItems));

  useEffect(() => {
    setItems(applyDeletedFilter(initialItems));
  }, [initialItems]);

  useEffect(() => {
    const hasPendingScrape = items.some(
      (item) => !item.product.last_scraped_at || item.product.last_price === null || item.product.last_price === undefined,
    );

    if (!hasPendingScrape) {
      return;
    }

    let cancelled = false;

    const refreshItems = async () => {
      try {
        const res = await fetch('/api/tracked-items', { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (!cancelled && Array.isArray(data?.items)) {
          setItems(applyDeletedFilter(data.items));
        }
      } catch {
        // Keep the current list and retry on the next poll.
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshItems();
    }, 5000);

    void refreshItems();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [items]);

  function removeItem(id: string) {
    saveDeletedId(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const count = items.length;
  const pct = Math.min((count / totalLimit) * 100, 100);

  return (
    <div className="flex flex-col gap-3">
      {plan === 'FREE' && (
        <div className="glass animate-fade-up p-4" style={{ animationDelay: '0.05s' }}>
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Free Plan
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {count}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {totalLimit}</span>
              </span>
            </div>
            {count >= totalLimit && (
              <Link href="/billing" className="text-xs font-semibold" style={{ color: 'var(--blue)' }}>
                Upgrade
              </Link>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--progress-track)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct >= 100
                  ? 'linear-gradient(90deg, #fb7185, #f97316)'
                  : 'linear-gradient(90deg, #22d3ee, #38bdf8)',
              }}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass py-12 text-center" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          No tracked products. Add one above.
        </div>
      ) : (
        items.map((item, index) => (
          <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${0.1 + index * 0.07}s` }}>
            <ProductCard item={item} onDeleted={() => removeItem(item.id)} />
          </div>
        ))
      )}
    </div>
  );
}

