import { cookies, headers } from 'next/headers';
import { TrackedList } from '@/components/TrackedList';
import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { AddProductButton } from '@/components/AddProductButton';
import { AuroraBg } from '@/components/AuroraBg';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WelcomeModal } from '@/components/WelcomeModal';
import { ReferralCard } from '@/components/ReferralCard';
import { UserMenu } from '@/components/UserMenu';
import { BrandMark } from '@/components/BrandMark';

export const dynamic = 'force-dynamic';

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

function readEmailFromSessionToken(token?: string) {
  if (!token) return '';

  try {
    const [, payload] = token.split('.');
    if (!payload) return '';

    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    const data = JSON.parse(decoded) as { email?: string; sub?: string };
    return typeof data.email === 'string' ? data.email : '';
  } catch {
    return '';
  }
}

function formatFirstName(email: string) {
  const raw = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  const firstName = raw.split(/\s+/)[0] ?? '';
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

async function getTrackedItems(cookie: string, appUrl: string): Promise<TrackedResponse> {
  if (!cookie) {
    return { items: [], plan: 'FREE', count: 0 };
  }

  try {
    const res = await fetch(`${appUrl}/api/tracked-items`, {
      cache: 'no-store',
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return { items: [], plan: 'FREE', count: 0 };
    return res.json();
  } catch {
    return { items: [], plan: 'FREE', count: 0 };
  }
}

async function getReferralSummary(cookie: string, appUrl: string): Promise<ReferralSummary | null> {
  if (!cookie) {
    return null;
  }

  try {
    const res = await fetch(`${appUrl}/api/auth/referral-summary`, {
      cache: 'no-store',
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getCurrentUser(cookie: string, appUrl: string): Promise<CurrentUser | null> {
  if (!cookie) {
    return null;
  }

  try {
    const res = await fetch(`${appUrl}/api/auth/me`, {
      cache: 'no-store',
      headers: cookie ? { cookie } : undefined,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function getAppUrl(headerList: Awaited<ReturnType<typeof headers>>) {
  const forwardedProto = headerList.get('x-forwarded-proto');
  const forwardedHost = headerList.get('x-forwarded-host');
  const host = forwardedHost ?? headerList.get('host');

  if (!host) {
    return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  }

  const protocol = forwardedProto ?? (host.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  const headerList = await headers();
  const appUrl = getAppUrl(headerList);
  const cookie = session ? headerList.get('cookie') ?? '' : '';
  const [{ items, plan }, referralSummary, currentUser] = await Promise.all([
    getTrackedItems(cookie, appUrl),
    getReferralSummary(cookie, appUrl),
    getCurrentUser(cookie, appUrl),
  ]);
  const isLoggedIn = Boolean(session);
  const totalLimit = referralSummary?.totalTrackingLimit ?? 5;
  const fallbackEmail = currentUser?.email ?? readEmailFromSessionToken(session);
  const firstName = fallbackEmail ? formatFirstName(fallbackEmail) : '';
  const userMenuEmail = fallbackEmail || 'Your account';

  return (
    <div className="min-h-screen">
      <AuroraBg />
      {isLoggedIn ? <WelcomeModal /> : null}

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
            {isLoggedIn && plan === 'FREE' ? (
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
            ) : isLoggedIn ? (
              <span className="shrink-0 text-xs font-semibold" style={{ color: 'var(--emerald)' }}>
                Pro
              </span>
            ) : (
              <Link href="/login?next=/dashboard" className="btn-neon px-4 py-2 text-sm">
                Log In
              </Link>
            )}

            <ThemeToggle />
            {isLoggedIn ? <UserMenu email={userMenuEmail} /> : null}
          </div>
        </div>
      </nav>

      <div className="page-content mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
        {isLoggedIn ? <ReferralCard summary={referralSummary} /> : null}

        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            {firstName ? (
              <p className="mb-1 text-sm font-semibold" style={{ color: '#b91c1c' }}>
                Hello, {firstName}!
              </p>
            ) : isLoggedIn ? (
              <p className="mb-1 text-sm font-semibold" style={{ color: '#b91c1c' }}>
                Welcome back!
              </p>
            ) : null}
            {!isLoggedIn && (
              <p
                className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{
                  color: '#f87171',
                  background: 'rgba(185,28,28,0.1)',
                  border: '1px solid rgba(248,113,113,0.18)',
                }}
              >
                Preview mode
              </p>
            )}
            <h1 className="mb-1 text-xl font-bold sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              {isLoggedIn ? 'My Tracked Products' : 'See how Sentinel works'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isLoggedIn
                ? 'Tap any item to expand details, chart, and alert rules'
                : 'Explore the flow first, then log in to add products, save alerts, and start tracking for real.'}
            </p>
          </div>
          <AddProductButton requiresAuth={!isLoggedIn} />
        </div>

        {items.length === 0 ? (
          <EmptyState name={firstName} requiresAuth={!isLoggedIn} />
        ) : (
          <TrackedList initialItems={items} plan={plan} totalLimit={totalLimit} />
        )}
      </div>
    </div>
  );
}


