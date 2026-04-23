import { headers } from 'next/headers';
import { TrackedList } from '@/components/TrackedList';
import { EmptyState } from '@/components/EmptyState';
import { AddProductButton } from '@/components/AddProductButton';
import { AuroraBg } from '@/components/AuroraBg';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WelcomeModal } from '@/components/WelcomeModal';
import { ReferralCard } from '@/components/ReferralCard';
import { UserMenu } from '@/components/UserMenu';
import { BrandMark } from '@/components/BrandMark';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

interface TrackedResponse {
  items: Array<{
    id: string;
    product: {
      id: string;
      title: string;
      store: string;
      original_url?: string;
      url?: string;
      last_price: string | number;
      in_stock: boolean | null;
      last_scraped_at: string | null;
      price_history: Array<{ price: string | number }>;
    };
  }>;
  plan: string;
  count: number;
}

interface ReferralSummary {
  referralCode: string;
  successfulReferrals: number;
  bonusTrackingSlots: number;
  baseTrackingLimit: number;
  totalTrackingLimit: number;
  maxBonusTrackingSlots: number;
}

interface CurrentUser {
  id: string;
  email: string;
  role: string;
  authProvider?: string;
}

function formatFirstName(email: string) {
  const raw = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  const firstName = raw.split(/\s+/)[0] ?? '';
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

async function getTrackedItems(cookie: string): Promise<TrackedResponse> {
  try {
    const res = await fetch(`${APP_URL}/api/tracked-items`, {
      cache: 'no-store',
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return { items: [], plan: 'FREE', count: 0 };
    return res.json();
  } catch {
    return { items: [], plan: 'FREE', count: 0 };
  }
}

async function getReferralSummary(cookie: string): Promise<ReferralSummary | null> {
  try {
    const res = await fetch(`${APP_URL}/api/auth/referral-summary`, {
      cache: 'no-store',
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getCurrentUser(cookie: string): Promise<CurrentUser | null> {
  try {
    const res = await fetch(`${APP_URL}/api/auth/me`, {
      cache: 'no-store',
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const cookie = (await headers()).get('cookie') ?? '';
  const [{ items, plan }, referralSummary, currentUser] = await Promise.all([
    getTrackedItems(cookie),
    getReferralSummary(cookie),
    getCurrentUser(cookie),
  ]);
  const totalLimit = referralSummary?.totalTrackingLimit ?? 5;
  const firstName = currentUser?.email ? formatFirstName(currentUser.email) : '';

  return (
    <div className="min-h-screen">
      <AuroraBg />
      <WelcomeModal />

      <nav
        className="page-content sticky top-0 z-50"
        style={{
          background: 'var(--nav-surface)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--nav-border)',
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandMark size="sm" showTagline={false} />

          <div className="min-w-0 flex items-center gap-2 sm:gap-3">
            {plan === 'FREE' ? (
              <span
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold sm:px-3"
                style={{
                  background: 'rgba(15,23,42,0.05)',
                  border: '1px solid rgba(15,23,42,0.08)',
                  color: 'var(--text-primary)',
                }}
              >
                Limit {totalLimit}
              </span>
            ) : (
              <span className="shrink-0 text-xs font-semibold" style={{ color: 'var(--emerald)' }}>
                Pro
              </span>
            )}

            <ThemeToggle />
            {currentUser?.email ? <UserMenu email={currentUser.email} /> : null}
          </div>
        </div>
      </nav>

      <div className="page-content mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
        <ReferralCard summary={referralSummary} />

        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            {firstName && (
              <p className="mb-1 text-sm font-semibold" style={{ color: '#b91c1c' }}>
                Hello, {firstName}!
              </p>
            )}
            <h1 className="mb-1 text-xl font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              My Tracked Products
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Tap any item to expand details, chart, and alert rules
            </p>
          </div>
          <AddProductButton />
        </div>

        {items.length === 0 ? (
          <EmptyState name={firstName} />
        ) : (
          <TrackedList initialItems={items} plan={plan} totalLimit={totalLimit} />
        )}
      </div>
    </div>
  );
}

