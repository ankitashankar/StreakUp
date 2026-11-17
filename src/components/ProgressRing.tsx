interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  color?: string; // hex
  trackColor?: string;
  animate?: boolean;
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  className = '',
  color = '#527d4e',
  trackColor,
  animate = true,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c * (1 - clamped);
  const gid = `ring-${color.replace('#', '')}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor || 'currentColor'}
          strokeOpacity={trackColor ? 1 : 0.12}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={animate ? { transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="font-display font-bold text-ink dark:text-zinc-100" style={{ fontSize: size * 0.22 }}>{label}</span>}
        {sublabel && <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted dark:text-zinc-500 mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
