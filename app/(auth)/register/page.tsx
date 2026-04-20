'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuroraBg } from '@/components/AuroraBg';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';

function getPasswordStrength(p: string) {
  if (!p) return null;
  if (p.length < 6) return { label: 'Too short', pct: 20, color: '#ff4466' };
  if (p.length < 8) return { label: 'Weak', pct: 40, color: '#f97316' };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', pct: 65, color: '#eab308' };
  if (p.length >= 12 && /[^a-zA-Z0-9]/.test(p)) return { label: 'Strong', pct: 100, color: '#00ff88' };
  return { label: 'Good', pct: 85, color: '#00d4ff' };
}

function isReferralCodeValid(value: string) {
  return /^[A-Z0-9]{6,32}$/.test(value);
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must contain at least one uppercase letter and one number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (referralCode.trim() && !isReferralCodeValid(referralCode.trim())) {
      setError('Referral code must contain only uppercase letters and numbers.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(referralCode.trim() ? { referralCode: referralCode.trim() } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.referralCode) {
          localStorage.setItem('sp_referral_code', data.referralCode);
        }
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      setError(data.message ?? 'Registration failed.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <AuroraBg />

      <div className="page-content w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-black gradient-text">SeerPrice</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Track gaming gear and tech prices across Egypt
          </p>
        </div>

        <div className="glass-strong p-7" style={{ borderRadius: '20px' }}>
          <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Create account
          </h2>
          <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Start tracking prices in seconds
          </p>

          <SocialAuthButtons mode="register" referralCode={referralCode} />

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
              {strength && (
                <div className="mt-2">
                  <div className="h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{ width: `${strength.pct}%`, background: strength.color, boxShadow: `0 0 8px ${strength.color}` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="........"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-glass"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Referral Code
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="input-glass"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon mt-2 w-full py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--cyan)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
