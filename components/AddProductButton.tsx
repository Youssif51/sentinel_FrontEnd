'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

interface ToastState {
  type: ToastType;
  title: string;
  message?: string;
}

export function AddProductButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/tracked-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setOpen(false);
        setUrl('');
        router.refresh();
        setToast({ type: 'success', title: 'Product added!', message: "We're scraping the price now" });
      } else {
        const data = await res.json();
        const msg = data.message ?? 'Could not add product';
        setError(msg);
        setToast({ type: 'error', title: 'Failed to add', message: msg });
      }
    } catch {
      const msg = 'Network error — check your connection';
      setError(msg);
      setToast({ type: 'error', title: 'Network error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-neon px-4 py-2.5 text-sm">
        + Track Product
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); setError(''); } }}
        >
          <div className="glass-strong w-full max-w-md p-6">
            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Track a Product
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Paste a URL from Sigma Computer, El Badr Group, Kemo Store, etc.
            </p>

            {error && (
              <div
                className="p-2.5 rounded-xl mb-3 text-xs"
                style={{
                  background: 'rgba(251,113,133,0.08)',
                  border: '1px solid rgba(251,113,133,0.22)',
                  color: 'var(--rose)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-3">
              <input
                type="url"
                placeholder="https://sigma-computer.com/product/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input-glass"
                required
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(''); }}
                  className="btn-cancel flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon flex-1 py-2.5 text-sm disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onDone={() => setToast(null)}
        />
      )}
    </>
  );
}
