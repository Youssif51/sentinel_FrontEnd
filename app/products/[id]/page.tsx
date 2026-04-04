import { PriceChart } from '@/components/PriceChart';
import { AlertRulesPanel } from '@/components/AlertRulesPanel';
import { DeleteProductButton } from '@/components/DeleteProductButton';
import { AuroraBg } from '@/components/AuroraBg';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

const BASE = process.env.API_URL ?? 'http://localhost:3000';

async function getProductData(id: string) {
  try {
    const [productRes, chartRes, rulesRes] = await Promise.all([
      fetch(`${BASE}/api/tracked-items?productId=${id}`, { cache: 'no-store' }),
      fetch(`${BASE}/api/price-history/${id}`, { cache: 'no-store' }),
      fetch(`${BASE}/api/alert-rules?productId=${id}`, { cache: 'no-store' }),
    ]);
    return {
      product: productRes.ok ? await productRes.json() : null,
      chartData: chartRes.ok ? await chartRes.json() : [],
      alertRules: rulesRes.ok ? await rulesRes.json() : [],
    };
  } catch {
    return { product: null, chartData: [], alertRules: [] };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product, chartData, alertRules } = await getProductData(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AuroraBg />
        <div className="page-content text-center">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Product not found</p>
          <Link href="/dashboard" className="text-sm font-semibold" style={{ color: 'var(--blue)' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = Number(product.last_price);
  const previousPrice = product.price_history?.[0] ? Number(product.price_history[0].price) : null;
  const changePercent =
    previousPrice && previousPrice !== currentPrice
      ? Math.round(((currentPrice - previousPrice) / previousPrice) * 100)
      : null;
  const isPriceDrop = changePercent !== null && changePercent < 0;

  return (
    <div className="min-h-screen">
      <AuroraBg />

      {/* Navbar */}
      <nav
        className="page-content sticky top-0 z-50"
        style={{
          background: 'rgba(6,9,16,0.72)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0"
            style={{
              background: 'var(--glass-bg-from)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
            }}
          >
            ← <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="text-base sm:text-lg font-black gradient-text flex-1">SeerPrice</span>
          <ThemeToggle />
        </div>
      </nav>

      <div className="page-content max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">

        {/* Header */}
        <div className="animate-fade-up">
          <h1
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {product.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.2)',
                color: 'var(--cyan)',
              }}
            >
              {product.store}
            </span>
            {product.last_scraped_at && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Last checked {timeAgo(product.last_scraped_at)}
              </span>
            )}
            <DeleteProductButton trackedItemId={id} productTitle={product.title} />
          </div>
        </div>

        {/* Current Price */}
        <div
          className="glass p-4 sm:p-5 animate-fade-up"
          style={{ animationDelay: '0.08s' }}
        >
          {/* Mobile: stack, desktop: row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Current Price
              </p>
              <p
                className="text-3xl sm:text-4xl font-bold"
                style={{ color: isPriceDrop ? 'var(--emerald)' : 'var(--text-primary)' }}
              >
                {currentPrice ? `${currentPrice.toLocaleString()} EGP` : (
                  <span className="pulse-soft text-2xl" style={{ color: 'var(--text-muted)' }}>
                    Pending...
                  </span>
                )}
              </p>
              {changePercent !== null && (
                <p
                  className="text-sm font-semibold mt-1"
                  style={{ color: isPriceDrop ? 'var(--emerald)' : 'var(--rose)' }}
                >
                  {changePercent > 0 ? '+' : ''}{changePercent}% vs previous
                </p>
              )}
            </div>
            <span
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold self-start sm:self-auto ${
                product.in_stock ? 'badge-instock' : 'badge-outofstock'
              }`}
            >
              {product.in_stock ? '● In Stock' : '● Out of Stock'}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div
          className="glass p-4 sm:p-5 animate-fade-up"
          style={{ animationDelay: '0.16s' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Price History
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-semibold"
              style={{
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.22)',
                color: 'var(--blue)',
              }}
            >
              30 days
            </span>
          </div>
          <PriceChart data={chartData} />
        </div>

        {/* Alert Rules */}
        <div className="animate-fade-up" style={{ animationDelay: '0.24s' }}>
          <AlertRulesPanel rules={alertRules} productId={id} />
        </div>
      </div>
    </div>
  );
}
