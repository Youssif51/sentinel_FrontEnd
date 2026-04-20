'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <button
      type="button"
      aria-label="Sign out"
      title="Sign out"
      onClick={handleLogout}
      disabled={loading}
      className="btn-icon-circle disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}
