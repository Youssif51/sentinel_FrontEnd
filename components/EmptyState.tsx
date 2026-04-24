'use client';

import { useState } from 'react';
import { AddProductButton } from './AddProductButton';

function StoreLogo({
  src,
  initials,
  color,
  border,
}: {
  src: string;
  initials: string;
  color: string;
  border: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 6,
        flexShrink: 0,
        background: 'var(--surface-elevated)',
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {failed ? (
        <span style={{ fontSize: 8, fontWeight: 800, color, letterSpacing: '0.03em' }}>
          {initials}
        </span>
      ) : (
        <img
          src={src}
          alt={initials}
          width={28}
          height={28}
          onError={() => setFailed(true)}
          style={{ objectFit: 'contain' }}
        />
      )}
    </div>
  );
}

function IconImage({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return <img src={src} alt={alt} width={size} height={size} style={{ objectFit: 'contain' }} />;
}

const STORES = [
  { name: 'Sigma Computer', href: 'https://sigma-computer.com/en', src: '/stores/sigma.png', initials: 'SC', color: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.22)', text: '#38bdf8' },
  { name: 'Alfrensia', href: 'https://alfrensia.com/ar/', src: '/stores/alfrensia.png', initials: 'AL', color: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.22)', text: '#a78bfa' },
  { name: 'El Badr Group', href: 'https://elbadrgroupeg.store/', src: '/stores/elbadr.png', initials: 'EB', color: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.22)', text: '#fbbf24' },
  { name: 'Kimo Store', href: 'https://kimostore.net/', src: '/stores/kimo.png', initials: 'KS', color: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.22)', text: '#4ade80' },
  { name: 'Games World Egypt', href: 'https://www.gamesworldegypt.com/', src: '/stores/games-world-egypt.png', initials: 'GW', color: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.22)', text: '#fb7185' },
];

const STEPS = [
  {
    num: '01',
    icon: <IconImage src="/icons/copy.png" alt="Copy" size={22} />,
    title: 'Open a product page',
    desc: 'Choose a product from a supported Egyptian store and copy its page link.',
    color: 'var(--cyan)',
    glow: 'rgba(34,211,238,0.12)',
  },
  {
    num: '02',
    icon: <IconImage src="/icons/paste.png" alt="Paste" size={22} />,
    title: 'Paste the URL',
    desc: 'Paste the product link and Sentinel starts tracking price changes for you.',
    color: 'var(--blue)',
    glow: 'rgba(56,189,248,0.12)',
  },
  {
    num: '03',
    icon: <IconImage src="/icons/alert.png" alt="Alert" size={22} />,
    title: 'Set a price alert',
    desc: 'Choose a target price or drop percentage and get notified when the price moves.',
    color: 'var(--emerald)',
    glow: 'rgba(74,222,128,0.12)',
  },
];

export function EmptyState({
  name,
  requiresAuth = false,
}: {
  name?: string;
  requiresAuth?: boolean;
}) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="glass p-6 text-center">
        <div
          className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(34,211,238,0.08)',
            border: '1px solid rgba(34,211,238,0.2)',
            color: 'var(--cyan)',
          }}
        >
          <IconImage src="/icons/handshake.png" alt="Handshake" size={34} />
        </div>
        {name ? (
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Hello, {name}!
          </h2>
        ) : requiresAuth ? (
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Track prices from Egyptian stores
          </h2>
        ) : null}
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          {requiresAuth
            ? 'Paste any supported product link to monitor price changes and get alerts later. Browse the flow first, then log in when you are ready to save your tracked products.'
            : 'Paste your first product link to start tracking its price, history, and alerts in one place.'}
        </p>
        <div className="flex justify-center">
          <AddProductButton requiresAuth={requiresAuth} />
        </div>
      </div>

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
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: step.glow,
                  border: `1px solid ${step.glow.replace('0.12', '0.3')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step.color,
                }}
              >
                {step.icon}
              </div>
              <span className="text-xs font-black tracking-widest" style={{ color: step.color }}>
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

      <div className="glass p-5 animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          Supported stores
        </p>
        <div className="flex flex-wrap gap-2">
          {STORES.map((store) => (
            <a
              key={store.name}
              href={store.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: store.color,
                border: `1px solid ${store.border}`,
                color: store.text,
                textDecoration: 'none',
              }}
            >
              <StoreLogo src={store.src} initials={store.initials} color={store.text} border={store.border} />
              <span>{store.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

