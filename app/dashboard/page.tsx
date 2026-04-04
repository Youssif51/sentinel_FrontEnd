import { TrackedList } from '@/components/TrackedList';
import { EmptyState } from '@/components/EmptyState';
import { AddProductButton } from '@/components/AddProductButton';
import { AuroraBg } from '@/components/AuroraBg';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WelcomeModal } from '@/components/WelcomeModal';
import Link from 'next/link';

async function getTrackedItems() {
  try {
    const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3000'}/api/tracked-items`, {
      cache: 'no-store',
    });
    if (!res.ok) return { items: [], plan: 'FREE', count: 0 };
    return res.json();
  } catch {
    return { items: [], plan: 'FREE', count: 0 };
  }
}

export default async function DashboardPage() {
  const { items, plan, count } = await getTrackedItems();
  const limit = 5;
  const pct = Math.min((count / limit) * 100, 100);

  return (
    <div className="min-h-screen">
      <AuroraBg />
      <WelcomeModal />

      {/* Navbar */}
      <nav
        className="page-content sticky top-0 z-50"
        style={{
          background: 'rgba(6, 9, 16, 0.72)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <span className="text-base sm:text-lg font-black gradient-text shrink-0">SeerPrice</span>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {plan === 'FREE' ? (
              <Link
                href="/billing"
                className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg shrink-0"
                style={{
                  background: 'rgba(34,211,238,0.08)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  color: 'var(--cyan)',
                }}
              >
                ⚡ <span className="hidden sm:inline">Upgrade to </span>Pro
              </Link>
            ) : (
              <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--emerald)' }}>
                ✦ Pro
              </span>
            )}

            <ThemeToggle />

            <Link
              href="/login"
              aria-label="Sign out"
              title="Sign out"
              className="btn-icon-circle"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="page-content max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-3">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              My Tracked Products
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Real-time prices across Egyptian stores
            </p>
          </div>
          <AddProductButton />
        </div>

        {/* Product list */}
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <TrackedList initialItems={items} plan={plan} />
        )}
      </div>
    </div>
  );
}
