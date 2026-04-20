'use client';

import { useState } from 'react';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

interface AlertRule {
  id: string;
  tracked_item_id?: string;
  type: 'PERCENTAGE_DROP' | 'TARGET_PRICE';
  threshold: number | string;
  last_fired_at?: string | null;
}

interface ToastState {
  type: ToastType;
  title: string;
  message?: string;
}

function WarningIcon() {
  return (
    <img
      src="/icons/warning.gif"
      alt="Warning"
      width={34}
      height={34}
      style={{
        width: 34,
        height: 34,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}

export function AlertRulesPanel({
  rules: initialRules,
  trackedItemId,
}: {
  rules: AlertRule[];
  trackedItemId: string;
}) {
  const [rules, setRules] = useState<AlertRule[]>(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [ruleType, setRuleType] = useState<'PERCENTAGE_DROP' | 'TARGET_PRICE'>('PERCENTAGE_DROP');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  function getThresholdNumber() {
    return Number(threshold);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const thresholdValue = getThresholdNumber();

    if (ruleType === 'PERCENTAGE_DROP' && (thresholdValue < 1 || thresholdValue > 90)) {
      setToast({
        type: 'error',
        title: 'Invalid drop percentage',
        message: 'Drop percentage must be between 1% and 90%.',
      });
      return;
    }

    setSaving(true);
    try {
      const body = editingId
        ? {
            threshold: thresholdValue,
          }
        : {
            tracked_item_id: trackedItemId,
            type: ruleType,
            threshold: thresholdValue,
          };

      const res = await fetch(`/api/alert-rules${editingId ? `?id=${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const savedRule = await res.json();
        setRules((prev) => (
          editingId
            ? prev.map((rule) => rule.id === editingId ? savedRule : rule)
            : [...prev, savedRule]
        ));
        setShowForm(false);
        setEditingId(null);
        setRuleType('PERCENTAGE_DROP');
        setThreshold('');
        setToast({
          type: 'success',
          title: editingId ? 'Rule updated' : 'Rule added',
          message: "You'll get an email when it triggers.",
        });
      } else {
        const errData = await res.json();
        setToast({
          type: 'error',
          title: editingId ? 'Failed to update rule' : 'Failed to add rule',
          message: errData.message ?? 'Something went wrong.',
        });
      }
    } catch {
      setToast({
        type: 'error',
        title: 'Network error',
        message: 'Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ruleId: string) {
    try {
      const res = await fetch(`/api/alert-rules?id=${ruleId}`, { method: 'DELETE' });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
      } else {
        setToast({
          type: 'error',
          title: 'Failed to delete rule',
          message: 'Please try again.',
        });
      }
    } catch {
      setToast({
        type: 'error',
        title: 'Network error',
        message: 'Check your connection and try again.',
      });
    }
  }

  function startEdit(rule: AlertRule) {
    setEditingId(rule.id);
    setRuleType(rule.type);
    setThreshold(String(rule.threshold));
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setRuleType('PERCENTAGE_DROP');
    setThreshold('');
  }

  return (
    <>
      <div className="glass p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Alert Rules
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Manage price alerts for this tracked item
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-action-add px-3 py-1.5 text-xs"
            >
              + Add Rule
            </button>
          )}
        </div>

        {rules.length === 0 && !showForm && (
          <div
            className="rounded-2xl px-4 py-4"
            style={{
              background: 'rgba(250, 204, 21, 0.08)',
              border: '1px solid rgba(250, 204, 21, 0.22)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 rounded-2xl"
                style={{
                  background: 'transparent',
                }}
              >
                <WarningIcon />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#facc15' }}>
                  No alert rules yet
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  This product is still being tracked and scraped normally, but you will not receive any notifications until you add an alert rule.
                </p>
              </div>
            </div>
          </div>
        )}

        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {rule.type === 'PERCENTAGE_DROP'
                  ? `Drop by ${rule.threshold}%`
                  : `Target price ${Number(rule.threshold).toLocaleString()} EGP`}
              </p>
              {rule.last_fired_at && (
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Fired: {new Date(rule.last_fired_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(rule)}
                className="btn-cancel px-2.5 py-1 text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                className="btn-action-delete px-2.5 py-1 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 space-y-3 border-t pt-4"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Type
              </label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as 'PERCENTAGE_DROP' | 'TARGET_PRICE')}
                className="input-glass"
                style={{ color: 'var(--text-primary)' }}
                disabled={Boolean(editingId)}
              >
                <option value="PERCENTAGE_DROP" style={{ background: '#080b14' }}>
                  Price drops by %
                </option>
                <option value="TARGET_PRICE" style={{ background: '#080b14' }}>
                  Target price (EGP)
                </option>
              </select>
              {editingId && (
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Rule type cannot be changed after creation.
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {ruleType === 'PERCENTAGE_DROP' ? 'Drop % threshold' : 'Target price (EGP)'}
              </label>
              <input
                type="number"
                min="1"
                max={ruleType === 'PERCENTAGE_DROP' ? '90' : undefined}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={ruleType === 'PERCENTAGE_DROP' ? 'e.g. 10' : 'e.g. 45000'}
                className="input-glass"
                required
              />
              {ruleType === 'PERCENTAGE_DROP' && (
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Allowed range: 1% to 90%
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="btn-cancel flex-1 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-neon flex-1 py-2 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Rule' : 'Save Rule'}
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
