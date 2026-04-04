'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

interface ToastState { type: ToastType; title: string; message?: string; }

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export function DeleteProductButton({ trackedItemId, productTitle }: { trackedItemId: string; productTitle: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tracked-items?id=${trackedItemId}`, { method: 'DELETE' });
      if (res.ok) {
        // persist deletion for mock API (real API will handle this server-side)
        try {
          const key = 'sp_deleted_items';
          const ids = JSON.parse(localStorage.getItem(key) ?? '[]');
          // save both the tracked id and product id so TrackedList can filter by either
          const toAdd = [trackedItemId, `track-${trackedItemId}`].filter(x => !ids.includes(x));
          localStorage.setItem(key, JSON.stringify([...ids, ...toAdd]));
        } catch {}
        setToast({ type: 'success', title: 'Product removed', message: productTitle });
        setTimeout(() => router.push('/dashboard'), 800);
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

  return (
    <>
      {confirming ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setConfirming(false)}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '10px',
              fontWeight: 500,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '10px',
              fontWeight: 600,
              background: 'rgba(251,113,133,0.15)',
              border: '1px solid rgba(251,113,133,0.35)',
              color: 'var(--rose)',
              cursor: deleting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <TrashIcon />
            {deleting ? 'Removing...' : 'Confirm Remove'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          style={{
            fontSize: '12px',
            padding: '6px 14px',
            borderRadius: '10px',
            fontWeight: 500,
            background: 'rgba(251,113,133,0.08)',
            border: '1px solid rgba(251,113,133,0.2)',
            color: 'rgba(251,113,133,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(251,113,133,0.15)';
            e.currentTarget.style.color = 'var(--rose)';
            e.currentTarget.style.borderColor = 'rgba(251,113,133,0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(251,113,133,0.08)';
            e.currentTarget.style.color = 'rgba(251,113,133,0.7)';
            e.currentTarget.style.borderColor = 'rgba(251,113,133,0.2)';
          }}
        >
          <TrashIcon />
          Remove Product
        </button>
      )}

      {toast && (
        <Toast type={toast.type} title={toast.title} message={toast.message} onDone={() => setToast(null)} />
      )}
    </>
  );
}
