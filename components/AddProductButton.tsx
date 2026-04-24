'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

interface ToastState {
  type: ToastType;
  title: string;
  message?: string;
}

interface AddProductButtonProps {
  requiresAuth?: boolean;
  loginHref?: string;
}

export function AddProductButton({
  requiresAuth = false,
  loginHref = '/login?next=/dashboard',
}: AddProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeModal();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
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
      const msg = 'Network error - check your connection';
      setError(msg);
      setToast({ type: 'error', title: 'Network error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setOpen(false);
    setError('');
  }

  const addProductModal = open ? (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center overflow-hidden px-4 py-6"
      style={{
        background: 'rgba(3, 7, 14, 0.68)',
        backdropFilter: 'blur(30px) saturate(155%)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.18) 0%, rgba(29,78,216,0.05) 42%, transparent 72%)', filter: 'blur(34px)' }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.22) 0%, rgba(220,38,38,0.06) 38%, transparent 70%)', filter: 'blur(38px)' }}
        />
      </div>

      <div
        className="glass-strong relative w-full max-w-xl p-6 sm:p-8"
        style={{
          borderRadius: 28,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          background: 'linear-gradient(180deg, rgba(10, 18, 34, 0.97) 0%, rgba(8, 13, 24, 0.94) 100%)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.54), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 72%)', filter: 'blur(26px)' }}
        />

        <h2 className="relative mb-1 text-xl font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          Track a Product
        </h2>
        <p className="relative mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Paste a URL from Sigma Computer, El Badr Group, Kemo Store, and other supported stores.
        </p>

        {error && (
          <div
            className="relative mb-4 rounded-xl p-3 text-sm"
            style={{
              background: 'rgba(251,113,133,0.08)',
              border: '1px solid rgba(251,113,133,0.22)',
              color: 'var(--rose)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} className="relative space-y-4">
          <input
            type="url"
            placeholder="https://sigma-computer.com/product/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input-glass"
            required
            autoFocus
            style={{
              minHeight: 54,
              fontSize: 15,
              borderColor: 'rgba(34, 211, 238, 0.34)',
              boxShadow: '0 0 0 1px rgba(34,211,238,0.09), 0 0 34px rgba(34,211,238,0.12)',
            }}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="btn-cancel flex-1 py-3 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-neon flex-1 py-3 text-sm disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  const authModal = open ? (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center overflow-hidden px-4 py-6"
      style={{
        background: 'rgba(3, 7, 14, 0.7)',
        backdropFilter: 'blur(26px) saturate(150%)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(29,78,216,0.17) 0%, rgba(29,78,216,0.05) 40%, transparent 72%)',
            filter: 'blur(34px)',
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, rgba(220,38,38,0.06) 38%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div
        className="glass-strong relative w-full max-w-lg p-6 sm:p-8"
        style={{
          borderRadius: 28,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          background: 'linear-gradient(180deg, rgba(10, 18, 34, 0.97) 0%, rgba(8, 13, 24, 0.94) 100%)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.54), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-10 top-0 h-28 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 72%)', filter: 'blur(26px)' }}
        />

        <p
          className="relative mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
          style={{
            color: '#fca5a5',
            background: 'rgba(185,28,28,0.14)',
            border: '1px solid rgba(248,113,113,0.2)',
          }}
        >
          Log in required
        </p>
        <h2 className="relative mb-2 text-xl font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          Log in to start tracking
        </h2>
        <p className="relative mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          You can explore the dashboard first, but adding products, saving alerts, and managing your tracked items needs an account.
        </p>

        <div
          className="relative mb-5 rounded-2xl p-4 text-sm"
          style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(59,130,246,0.16)',
            color: 'var(--text-secondary)',
          }}
        >
          Log in now so your tracked products and alerts stay connected to your account.
        </div>

        <div className="relative flex gap-3">
          <button type="button" onClick={closeModal} className="btn-cancel flex-1 py-3 text-sm">
            Maybe later
          </button>
          <button
            type="button"
            onClick={() => window.location.assign(loginHref)}
            className="btn-neon flex-1 py-3 text-sm"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-neon px-4 py-2.5 text-sm">
        + Track Product
      </button>

      {mounted && open ? createPortal(requiresAuth ? authModal : addProductModal, document.body) : null}

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
