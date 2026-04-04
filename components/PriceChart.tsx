'use client';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

interface PricePoint {
  scraped_at: string;
  price: number | string;
  in_stock: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(8,11,20,0.88)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(96,165,250,0.25)',
      borderRadius: '10px',
      padding: '9px 13px',
    }}>
      <p style={{ color: 'rgba(203,213,225,0.5)', fontSize: '11px', marginBottom: '3px' }}>{label}</p>
      <p style={{ color: '#93c5fd', fontWeight: 700, fontSize: '14px' }}>
        {Number(payload[0].value).toLocaleString()} EGP
      </p>
    </div>
  );
}

export function PriceChart({ data }: { data: PricePoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-sm"
        style={{ color: 'var(--text-muted)' }}>
        No price history yet
      </div>
    );
  }

  const formattedData = data.map((p) => ({
    date: new Date(p.scraped_at).toLocaleDateString('en-EG', { month: 'short', day: 'numeric' }),
    price: Number(p.price),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formattedData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'rgba(203,213,225,0.35)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'rgba(203,213,225,0.35)' }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={36}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#60a5fa"
          strokeWidth={2}
          fill="url(#priceGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#60a5fa', stroke: 'rgba(96,165,250,0.3)', strokeWidth: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
