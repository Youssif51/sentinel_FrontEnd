'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

interface AlertRule {
  id: string;
  type: 'PERCENTAGE_DROP' | 'PRICE_BELOW';
  threshold: number | string;
  last_fired_at?: string | null;
}

interface ToastState {
  type: ToastType;
  title: string;
  message?: string;
}

export function AlertRulesPanel({ rules: initialRules, productId }: { rules: AlertRule[]; productId: string }) {
  const [rules, setRules] = useState<AlertRule[]>(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [ruleType, setRuleType] = useState<'PERCENTAGE_DROP' | 'PRICE_BELOW'>('PERCENTAGE_DROP');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/alert-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, type: ruleType, threshold: Number(threshold) }),
      });
      if (res.ok) {
        const newRule = await res.json();
        setRules((prev) => [...prev, newRule]);
        setShowForm(false);
        setThreshold('');
        router.refresh();
        setToast({ type: 'success', title: 'Rule added!', message: "You'll get an email when triggered" });
      } else {
        const errData = await res.json();
        setToast({ type: 'error', title: 'Failed to add rule', message: errData.message ?? 'Something went wrong' });
      }
    } catch {
      setToast({ type: 'error', title: 'Network error', message: 'Check your connection and try again' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ruleId: string) {
    try {
      const res = await fetch(`/api/alert-rules?id=${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
        router.refresh();
      } else {
        setToast({ type: 'error', title: 'Failed to delete rule', message: 'Please try again' });
      }
    } catch {
      setToast({ type: 'error', title: 'Network error', message: 'Check your connection and try again' });
    }
  }

  return (
    <>
      <div className="glass p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Alert Rules</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Email alerts when conditions are met</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-action-add text-xs px-3 py-1.5"
            >
              + Add Rule
            </button>
          )}
        </div>

        {rules.length === 0 && !showForm && (
          <p className="text-sm text-center py-5" style={{ color: 'var(--text-muted)' }}>
            No rules yet
          </p>
        )}

        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex justify-between items-center py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {rule.type === 'PERCENTAGE_DROP'
                  ? `📉 Drop by ${rule.threshold}%`
                  : `🎯 Price ≤ ${Number(rule.threshold).toLocaleString()} EGP`}
              </p>
              {rule.last_fired_at && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Fired: {new Date(rule.last_fired_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(rule.id)}
              className="btn-action-delete text-xs px-2.5 py-1"
            >
              Delete
            </button>
          </div>
        ))}

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="mt-4 pt-4 space-y-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as 'PERCENTAGE_DROP' | 'PRICE_BELOW')}
                className="input-glass"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="PERCENTAGE_DROP" style={{ background: '#080b14' }}>Price drops by %</option>
                <option value="PRICE_BELOW" style={{ background: '#080b14' }}>Price goes below (EGP)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                {ruleType === 'PERCENTAGE_DROP' ? 'Drop % threshold' : 'Target price (EGP)'}
              </label>
              <input
                type="number"
                min="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={ruleType === 'PERCENTAGE_DROP' ? 'e.g. 10' : 'e.g. 45000'}
                className="input-glass"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setThreshold(''); }}
                className="btn-cancel flex-1 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-neon flex-1 py-2 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </form>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onDone={() => setToast(null)}
        />
      )}
    </>
  );
}
