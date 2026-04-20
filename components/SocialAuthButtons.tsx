'use client';

import { useMemo, useState } from 'react';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

interface ToastState {
  type: ToastType;
  title: string;
  message?: string;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function SocialButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
      style={{
        background: 'var(--cancel-bg)',
        border: '1px solid var(--cancel-border)',
        color: 'var(--text-primary)',
        boxShadow: 'inset 0 1px 0 var(--glass-shine)',
      }}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.background = 'var(--cancel-hover)';
        e.currentTarget.style.borderColor = 'var(--cancel-hover-border)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--cancel-bg)';
        e.currentTarget.style.borderColor = 'var(--cancel-border)';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export function SocialAuthButtons({
  referralCode,
}: {
  referralCode?: string;
  mode?: 'login' | 'register';
}) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const googleHref = useMemo(
    () => `/api/auth/google${referralCode ? `?referralCode=${encodeURIComponent(referralCode)}` : ''}`,
    [referralCode],
  );

  function handleGoogle() {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined') {
      setToast({
        type: 'error',
        title: 'Google login not configured',
        message: 'Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.',
      });
      return;
    }
    window.location.assign(googleHref);
  }

  return (
    <>
      <div className="flex gap-2.5 mb-5">
        <SocialButton
          icon={<GoogleIcon />}
          label={!GOOGLE_CLIENT_ID ? 'Google (Setup needed)' : 'Google'}
          disabled={false}
          onClick={handleGoogle}
        />
      </div>

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
