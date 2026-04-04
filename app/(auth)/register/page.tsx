'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuroraBg } from '@/components/AuroraBg';
import Link from 'next/link';

function getPasswordStrength(p: string) {
  if (!p) return null;
  if (p.length < 6) return { label: 'Too short', pct: 20, color: '#ff4466' };
  if (p.length < 8) return { label: 'Weak', pct: 40, color: '#f97316' };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', pct: 65, color: '#eab308' };
  if (p.length >= 12 && /[^a-zA-Z0-9]/.test(p)) return { label: 'Strong 💪', pct: 100, color: '#00ff88' };
  return { label: 'Good', pct: 85, color: '#00d4ff' };
}

function SocialButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        background: 'var(--cancel-bg)',
        border: '1px solid var(--cancel-border)',
        color: 'var(--text-primary)',
        boxShadow: 'inset 0 1px 0 var(--glass-shine)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--cancel-hover)';
        e.currentTarget.style.borderColor = 'var(--cancel-hover-border)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--cancel-bg)';
        e.currentTarget.style.borderColor = 'var(--cancel-border)';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        localStorage.setItem('sp_user_email', email);
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black gradient-text mb-2">SeerPrice</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Track gaming gear & tech prices across Egypt
          </p>
        </div>

        <div className="glass-strong p-7" style={{ borderRadius: '20px' }}>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Create account
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Start tracking prices in seconds
          </p>

          {/* Social auth */}
          <div className="flex gap-2.5 mb-5">
            <SocialButton icon={<GoogleIcon />} label="Google" />
            <SocialButton icon={<FacebookIcon />} label="Facebook" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
          </div>

          {error && (
            <div className="p-3 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', color: 'var(--rose)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="input-glass" required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} className="input-glass" required />
              {strength && (
                <div className="mt-2">
                  <div className="w-full rounded-full h-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-1 rounded-full transition-all duration-500"
                      style={{ width: `${strength.pct}%`, background: strength.color, boxShadow: `0 0 8px ${strength.color}` }} />
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input type="password" placeholder="••••••••" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className="input-glass" required />
            </div>

            <button type="submit" disabled={loading}
              className="btn-neon w-full py-3 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create Account →'}
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
