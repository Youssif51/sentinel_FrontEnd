'use client';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  centered?: boolean;
}

const sizeMap = {
  sm: {
    wrapper: 'gap-3',
    logo: 46,
    title: 'text-[1.2rem]',
    tagline: 'text-xs',
  },
  md: {
    wrapper: 'gap-4',
    logo: 64,
    title: 'text-[1.8rem]',
    tagline: 'text-sm',
  },
  lg: {
    wrapper: 'gap-5',
    logo: 92,
    title: 'text-[2.9rem]',
    tagline: 'text-lg',
  },
} as const;

export function BrandMark({
  size = 'md',
  showTagline = true,
  centered = false,
}: BrandMarkProps) {
  const preset = sizeMap[size];

  return (
    <div className={`flex items-center ${preset.wrapper} ${centered ? 'justify-center text-center' : ''}`}>
      <img
        src="/brand/sentinel-logo.png"
        alt="Sentinel logo"
        width={preset.logo}
        height={preset.logo}
        className="shrink-0 object-contain"
        style={{
          width: preset.logo,
          height: preset.logo,
        }}
      />
      <div>
        <p className={`${preset.title} font-black tracking-[-0.03em]`} style={{ color: 'var(--text-primary)', lineHeight: 1 }}>
          Sentinel
        </p>
        {showTagline && (
          <p className={`${preset.tagline} mt-1`} style={{ color: 'var(--text-secondary)' }}>
            Smarter tracking for Egyptian stores
          </p>
        )}
      </div>
    </div>
  );
}


