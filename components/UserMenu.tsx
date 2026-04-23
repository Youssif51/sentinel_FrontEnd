'use client';

import { useEffect, useRef, useState } from 'react';

export function UserMenu({
  email,
}: {
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('sp_referral_code');
      localStorage.removeItem('sp_deleted_items');
      window.location.assign('/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="btn-icon-circle overflow-hidden"
        style={{
          width: 42,
          height: 42,
          borderRadius: '999px',
          padding: 0,
          background: 'var(--surface-elevated)',
          borderColor: hovered || open ? 'rgba(34,211,238,0.45)' : 'var(--glass-border)',
          boxShadow: hovered || open
            ? '0 0 0 3px rgba(34,211,238,0.12), 0 10px 24px rgba(0,0,0,0.22)'
            : 'inset 0 1px 0 var(--glass-shine)',
          transform: hovered || open ? 'translateY(-1px) scale(1.03)' : 'scale(1)',
        }}
      >
        <img
          src="/icons/user.gif"
          alt="User"
          width={42}
          height={42}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '999px',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl p-2"
          style={{
            direction: 'rtl',
            textAlign: 'right',
            background: 'rgba(10, 14, 24, 0.98)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 54px rgba(0,0,0,0.42)',
          }}
        >
          <div
            className="mb-2 rounded-xl px-3 py-3"
            style={{
              background: 'var(--surface-soft)',
              border: '1px solid rgba(148, 163, 184, 0.14)',
            }}
          >
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
              Signed in as
            </p>
            <p
              className="truncate text-sm font-semibold"
              title={email}
              style={{ color: 'var(--text-primary)' }}
            >
              {email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              flexDirection: 'row-reverse',
              justifyContent: 'flex-start',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--rose)',
              background: logoutHovered ? 'rgba(251,113,133,0.18)' : 'rgba(251,113,133,0.12)',
              border: logoutHovered
                ? '1px solid rgba(251,113,133,0.38)'
                : '1px solid rgba(251,113,133,0.24)',
              boxShadow: logoutHovered ? '0 0 0 3px rgba(251,113,133,0.10)' : 'none',
              transform: logoutHovered ? 'translateY(-1px)' : 'translateY(0)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{loading ? 'Signing out...' : 'Log out'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

