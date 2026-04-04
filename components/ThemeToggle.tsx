'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

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
      style={{
        width: 36, height: 36,
        borderRadius: '50%',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg-from)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
        boxShadow: 'inset 0 1px 0 var(--glass-shine)',
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
