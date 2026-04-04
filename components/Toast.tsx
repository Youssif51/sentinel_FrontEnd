'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  onDone: () => void;
}

export function Toast({ type, title, message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSuccess = type === 'success';

  const content = (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        className="toast-liquid"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '14px 20px',
          animation: 'toast-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards, toast-out 0.35s ease-in 2.85s forwards',
          minWidth: '280px',
          maxWidth: '360px',
          position: 'relative',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: isSuccess ? 'rgba(74,222,128,0.12)' : 'rgba(251,113,133,0.12)',
          border: `1px solid ${isSuccess ? 'rgba(74,222,128,0.3)' : 'rgba(251,113,133,0.3)'}`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px ${isSuccess ? 'rgba(74,222,128,0.15)' : 'rgba(251,113,133,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700,
          color: isSuccess ? 'var(--emerald)' : 'var(--rose)',
        }}>
          {isSuccess ? '✓' : '✕'}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>
            {title}
          </p>
          {message && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {message}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 16, right: 16,
          height: 2,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '0 0 18px 18px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: isSuccess
              ? 'linear-gradient(90deg, #4ade80, #22d3ee)'
              : 'linear-gradient(90deg, #fb7185, #f97316)',
            borderRadius: 2,
            animation: 'progress-shrink 3s linear forwards',
          }} />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
