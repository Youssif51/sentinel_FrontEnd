'use client';
import { useState } from 'react';
import { ProductCard } from './ProductCard';
import Link from 'next/link';

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

const LIMIT = 5;

const DELETED_KEY = 'sp_deleted_items';

function getDeletedIds(): string[] {
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) ?? '[]'); } catch { return []; }
}

function saveDeletedId(id: string) {
  const ids = getDeletedIds();
  if (!ids.includes(id)) localStorage.setItem(DELETED_KEY, JSON.stringify([...ids, id]));
}

export function TrackedList({ initialItems, plan }: { initialItems: TrackedItem[]; plan: string }) {
  const [items, setItems] = useState(() => {
    // filter already-deleted items on mount
    if (typeof window === 'undefined') return initialItems;
    const deleted = getDeletedIds();
    return initialItems.filter(i => !deleted.includes(i.id) && !deleted.includes(i.product.id));
  });

  function removeItem(id: string) {
    saveDeletedId(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const count = items.length;
  const pct = Math.min((count / LIMIT) * 100, 100);

  return (
    <div className="flex flex-col gap-3">
      {/* Usage bar — updates live */}
      {plan === 'FREE' && (
        <div className="glass p-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Free Plan
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {count}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {LIMIT}</span>
              </span>
            </div>
            {count >= LIMIT && (
              <Link href="/billing" className="text-xs font-semibold" style={{ color: 'var(--blue)' }}>
                Upgrade →
              </Link>
            )}
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
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

      {/* Cards */}
      {items.length === 0 ? (
        <div className="glass text-center py-12" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          No tracked products. Add one above!
        </div>
      ) : (
        items.map((item, i) => (
          <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
            <ProductCard item={item} onDeleted={() => removeItem(item.id)} />
          </div>
        ))
      )}
    </div>
  );
}
