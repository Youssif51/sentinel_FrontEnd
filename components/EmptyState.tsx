'use client';
import { useEffect, useState } from 'react';
import { AddProductButton } from './AddProductButton';

function StoreLogo({ domain, initials, color, border }: { domain: string; initials: string; color: string; border: string }) {
  const [failed, setFailed] = useState(false);
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 6, flexShrink: 0,
      background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {failed ? (
        <span style={{ fontSize: 8, fontWeight: 800, color, letterSpacing: '0.03em' }}>{initials}</span>
      ) : (
        <img src={src} alt={initials} width={16} height={16} onError={() => setFailed(true)} style={{ borderRadius: 3 }} />
      )}
    </div>
  );
}

const STORES = [
  { name: 'Sigma Computer',    domain: 'sigma-computer.com',   initials: 'SC', color: 'rgba(56,189,248,0.1)',   border: 'rgba(56,189,248,0.22)',  text: '#38bdf8'  },
  { name: 'Alfrensia',         domain: 'alfrensia.com',        initials: 'AL', color: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.22)', text: '#a78bfa'  },
  { name: 'El Badr Group',     domain: 'elbadrgroupeg.store',  initials: 'EB', color: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.22)',  text: '#fbbf24'  },
  { name: 'Kimo Store',        domain: 'kimostore.net',        initials: 'KS', color: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.22)',  text: '#4ade80'  },
  { name: 'Games World Egypt', domain: 'gamesworldegypt.com',  initials: 'GW', color: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.22)', text: '#fb7185'  },
];

const STEPS = [
  {
    num: '01',
    icon: '🔗',
    title: 'Open a product page',
    desc: 'Go to any supported store and find the product you want to track.',
    color: 'var(--cyan)',
    glow: 'rgba(34,211,238,0.12)',
  },
  {
    num: '02',
    icon: '📋',
    title: 'Paste the URL',
    desc: 'Copy the link and click "+ Track Product" — we\'ll do the rest.',
    color: 'var(--blue)',
    glow: 'rgba(56,189,248,0.12)',
  },
  {
    num: '03',
    icon: '🔔',
    title: 'Set a price alert',
    desc: 'Define a target price or drop % and get notified by email instantly.',
    color: 'var(--emerald)',
    glow: 'rgba(74,222,128,0.12)',
  },
];

function getGreeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${time}, ${name}! 👋`;
}

function formatName(email: string) {
  const raw = email.split('@')[0].replace(/[._-]/g, ' ');
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function EmptyState() {
  const [name, setName] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('sp_user_email') ?? '';
    if (email) setName(formatName(email));
  }, []);

  return (
    <div className="space-y-4 animate-fade-up">

      {/* Greeting */}
      <div className="glass p-6 text-center">
        <div className="text-5xl mb-4">🎯</div>
        {name && (
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {getGreeting(name)}
          </h2>
        )}
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          You haven&apos;t tracked any products yet. Here&apos;s how to get started:
        </p>
        <AddProductButton />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="glass p-4 animate-fade-up"
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: step.glow,
                  border: `1px solid ${step.glow.replace('0.12', '0.3')}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                {step.icon}
              </div>
              <span
                className="text-xs font-black tracking-widest"
                style={{ color: step.color }}
              >
                {step.num}
              </span>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {step.title}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Supported stores */}
      <div className="glass p-5 animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          Supported stores
        </p>
        <div className="flex flex-wrap gap-2">
          {STORES.map((store) => (
            <div
              key={store.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: store.color,
                border: `1px solid ${store.border}`,
                color: store.text,
              }}
            >
              <StoreLogo domain={store.domain} initials={store.initials} color={store.text} border={store.border} />
              <span>{store.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
