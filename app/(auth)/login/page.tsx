'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockoutCountdown } from '@/components/LockoutCountdown';
import { AuroraBg } from '@/components/AuroraBg';
import { BrandMark } from '@/components/BrandMark';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      if (res.status === 423) {
        setLockoutTime(new Date(data.unlocksAt));
        setError(`Account locked until ${new Date(data.unlocksAt).toLocaleTimeString()}`);
      } else {
        setError(data.message ?? 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AuroraBg />

      <div className="page-content w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandMark size="lg" />
        </div>

        <div className="glass-strong p-7" style={{ borderRadius: '20px' }}>
          <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h2>
          <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account
          </p>

          <SocialAuthButtons mode="login" />

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'var(--glass-border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              or with email
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--glass-border)' }} />
          </div>

          {error && (
            <div
              className="mb-4 rounded-xl p-3 text-sm"
              style={{
                background: 'rgba(251,113,133,0.1)',
                border: '1px solid rgba(251,113,133,0.3)',
                color: 'var(--rose)',
              }}
            >
              {error}
              {lockoutTime && <LockoutCountdown unlocksAt={lockoutTime} />}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon mt-2 w-full py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            No account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--cyan)' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
