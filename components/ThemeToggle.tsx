'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored !== 'light';
    setDark(isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: hovered
          ? '1px solid rgba(34,211,238,0.42)'
          : dark
            ? '1px solid rgba(148,163,184,0.24)'
            : '1px solid var(--glass-border)',
        background: dark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
        boxShadow: hovered
          ? '0 0 0 3px rgba(34,211,238,0.12), 0 8px 22px rgba(0,0,0,0.18)'
          : 'inset 0 1px 0 var(--glass-shine)',
        flexShrink: 0,
        transform: hovered ? 'scale(1.08) rotate(10deg)' : 'scale(1) rotate(0deg)',
      }}
    >
      <img
        src={dark ? '/icons/light-mode.png' : '/icons/dark-mode-new.png'}
        alt={dark ? 'Dark mode' : 'Light mode'}
        width={20}
        height={20}
        style={{
          objectFit: 'contain',
          opacity: dark ? 1 : 0.95,
          filter: dark ? 'none' : 'none',
        }}
      />
    </button>
  );
}
