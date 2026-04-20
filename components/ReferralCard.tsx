interface ReferralSummary {
  referralCode: string;
  successfulReferrals: number;
  bonusTrackingSlots: number;
  baseTrackingLimit: number;
  totalTrackingLimit: number;
  maxBonusTrackingSlots: number;
}

export function ReferralCard({ summary }: { summary: ReferralSummary | null }) {
  if (!summary) return null;

  const progress = summary.maxBonusTrackingSlots
    ? Math.min((summary.bonusTrackingSlots / summary.maxBonusTrackingSlots) * 100, 100)
    : 0;

  return (
    <section className="glass p-5 animate-fade-up" style={{ animationDelay: '0.04s' }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Referral Boost
          </p>
          <h2 className="mt-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Invite friends, unlock more tracking slots
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Code: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{summary.referralCode}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Referrals</p>
            <p className="mt-1 text-xl font-bold">{summary.successfulReferrals}</p>
          </div>
          <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bonus Slots</p>
            <p className="mt-1 text-xl font-bold">{summary.bonusTrackingSlots}</p>
          </div>
          <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Base Limit</p>
            <p className="mt-1 text-xl font-bold">{summary.baseTrackingLimit}</p>
          </div>
          <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Limit</p>
            <p className="mt-1 text-xl font-bold">{summary.totalTrackingLimit}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Bonus progress</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {summary.bonusTrackingSlots} / {summary.maxBonusTrackingSlots}
          </span>
        </div>
        <div className="h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #22d3ee, #4ade80)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
