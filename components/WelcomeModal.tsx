'use client';
import { useEffect, useState } from 'react';

function StoreLogo({ domain, initials, color, border }: { domain: string; initials: string; color: string; border: string }) {
  const [failed, setFailed] = useState(false);
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
      background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {failed ? (
        <span style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: '0.03em' }}>{initials}</span>
      ) : (
        <img src={src} alt={initials} width={18} height={18} onError={() => setFailed(true)} style={{ borderRadius: 3 }} />
      )}
    </div>
  );
}

const STORES = [
  { name: 'Sigma Computer',    domain: 'sigma-computer.com',     initials: 'SC', color: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.25)',  text: '#38bdf8'  },
  { name: 'Alfrensia',         domain: 'alfrensia.com',          initials: 'AL', color: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa'  },
  { name: 'El Badr Group',     domain: 'elbadrgroupeg.store',    initials: 'EB', color: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)',  text: '#fbbf24'  },
  { name: 'Kimo Store',        domain: 'kimostore.net',          initials: 'KS', color: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.25)',  text: '#4ade80'  },
  { name: 'Games World Egypt', domain: 'gamesworldegypt.com',    initials: 'GW', color: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.25)', text: '#fb7185'  },
];

const STEPS = [
  { icon: '🔗', title: 'Copy a product URL', desc: 'Open any product page on a supported store and copy its link.' },
  { icon: '📋', title: 'Paste it here',       desc: 'Click "+ Track Product" and paste the URL.' },
  { icon: '🔔', title: 'Get notified',        desc: 'Set a price alert and we\'ll email you when it drops.' },
];

export function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('sp_welcomed');
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem('sp_welcomed', '1');
    }, 380);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6"
      style={{
        background: 'rgba(6,9,16,0.7)',
        backdropFilter: 'blur(10px)',
        animation: leaving
          ? 'toast-out 0.38s ease-in forwards'
          : 'toast-in 0.5s cubic-bezier(0.34,1.28,0.64,1) forwards',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="glass-strong w-full max-w-lg overflow-hidden"
        style={{
          borderRadius: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="px-7 pt-7 pb-5 text-center"
          style={{
            borderBottom: '1px solid var(--glass-border)',
            background: 'linear-gradient(160deg, rgba(34,211,238,0.06) 0%, transparent 100%)',
          }}
        >
          <div className="text-4xl mb-3">👋</div>
          <h2
            className="text-2xl font-black mb-2 gradient-text"
            style={{ letterSpacing: '-0.02em' }}
          >
            Welcome to SeerPrice
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Track product prices across Egyptian stores — get notified the moment a price drops.
          </p>
        </div>

        <div className="px-7 py-5 space-y-6">

          {/* How it works */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              How it works
            </p>
            <div className="space-y-2.5">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-3 rounded-xl"
                  style={{
                    background: 'var(--glass-bg-from)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <div
                    className="text-xl shrink-0 mt-0.5"
                    style={{
                      width: 36, height: 36,
                      background: 'rgba(34,211,238,0.08)',
                      border: '1px solid rgba(34,211,238,0.18)',
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      {step.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported stores */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Supported stores
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STORES.map((store) => (
                <div
                  key={store.name}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{
                    background: store.color,
                    border: `1px solid ${store.border}`,
                  }}
                >
                  <StoreLogo domain={store.domain} initials={store.initials} color={store.text} border={store.border} />
                  <span className="text-xs font-semibold" style={{ color: store.text }}>
                    {store.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className="px-7 pb-7 pt-1"
        >
          <button
            onClick={dismiss}
            className="btn-neon w-full py-3.5 text-sm font-semibold"
          >
            Start Tracking Prices →
          </button>
          <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            This won&apos;t appear again after you close it.
          </p>
        </div>
      </div>
    </div>
  );
}
