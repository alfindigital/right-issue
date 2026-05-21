import React from 'react';
import { TrendingUp, TrendingDown, ChevronUp } from 'lucide-react';

interface Props {
  isVisible: boolean;
  stockCode?: string;
  finalTotalValue: string;
  recommendation: 'positive' | 'negative' | null;
  recommendationLabel: string;
  onTap?: () => void;
}

/**
 * Mobile sticky bar above BottomNav showing the most important results.
 * Always visible (when isCalculated) on mobile.
 */
const SmartResultBar: React.FC<Props> = ({
  isVisible,
  stockCode,
  finalTotalValue,
  recommendation,
  recommendationLabel,
  onTap,
}) => {
  if (!isVisible) return null;

  const isPositive = recommendation === 'positive';
  const tone = isPositive
    ? 'border-[hsl(var(--success))]/40 bg-[hsl(142_76%_95%/0.95)] dark:bg-[hsl(142_76%_10%/0.95)]'
    : 'border-[hsl(var(--warning))]/40 bg-[hsl(38_92%_95%/0.95)] dark:bg-[hsl(38_92%_10%/0.95)]';

  return (
    <button
      type="button"
      onClick={onTap}
      data-no-swipe="true"
      className={`md:hidden fixed left-2 right-2 bottom-[60px] z-40 rounded-2xl border ${tone} backdrop-blur-xl shadow-lg p-2.5 flex items-center justify-between gap-2 animate-slide-up active:scale-[0.98] transition-transform`}
      aria-label="Lihat hasil"
    >
      <div className="flex items-center gap-2 min-w-0">
        {stockCode && (
          <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded">
            {stockCode}
          </span>
        )}
        <div className="text-left min-w-0">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none">
            Total
          </p>
          <p className="text-xs font-black text-foreground truncate">{finalTotalValue}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
        isPositive ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--warning))]'
      }`}>
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span className="whitespace-nowrap">{recommendationLabel}</span>
        <ChevronUp className="w-3 h-3 opacity-60" />
      </div>
    </button>
  );
};

export default SmartResultBar;