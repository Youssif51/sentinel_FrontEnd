'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored !== 'light';
    setDark(isDark);
    document.documentElement.classList.toggle('light', !isDark);
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="btn-icon-circle"
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'var(--surface-elevated)',
        border: hovered
          ? '1px solid rgba(34,211,238,0.42)'
          : '1px solid var(--glass-border)',
        boxShadow: hovered
          ? '0 0 0 3px rgba(34,211,238,0.12), 0 10px 24px rgba(0,0,0,0.18)'
          : 'inset 0 1px 0 var(--glass-shine)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: ready ? 'pointer' : 'default',
        transition: 'background 0.25s, border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'scale(1.06) rotate(8deg)' : 'scale(1) rotate(0deg)',
        opacity: ready ? 1 : 0.9,
        flexShrink: 0,
      }}
    >
      <img
        src={dark ? '/icons/light-mode.png' : '/icons/dark-mode-new.png'}
        alt={dark ? 'Light mode icon' : 'Dark mode icon'}
        width={20}
        height={20}
        style={{
          objectFit: 'contain',
          opacity: 0.98,
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
        }}
      />
    </button>
  );
}
