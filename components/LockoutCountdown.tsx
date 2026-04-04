'use client';
import { useEffect, useState } from 'react';

export function LockoutCountdown({ unlocksAt }: { unlocksAt: Date }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = unlocksAt.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('You can try again now.');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setRemaining(`Try again in ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [unlocksAt]);

  return (
    <p className="mt-1.5 text-xs font-bold" style={{ color: '#ff4466', letterSpacing: '0.05em' }}>
      ⏱ {remaining}
    </p>
  );
}
