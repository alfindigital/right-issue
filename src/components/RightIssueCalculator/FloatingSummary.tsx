import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FloatingSummaryProps {
  isVisible: boolean;
  stockCode?: string;
  avgPrice: string;
  terp: string;
  recommendation: 'positive' | 'negative' | null;
}

const FloatingSummary: React.FC<FloatingSummaryProps> = ({
  isVisible,
  stockCode,
  avgPrice,
  terp,
  recommendation,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className="fixed top-[52px] md:top-[60px] left-0 right-0 z-30 animate-slide-up" data-no-swipe="true">
      <div className="max-w-2xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-b-xl bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/50 dark:border-primary/10 shadow-lg dark:shadow-[0_4px_24px_-4px_hsl(0_0%_0%/0.4)]">
          {stockCode && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {stockCode}
            </span>
          )}
          <div className="flex items-center gap-4 text-[11px]">
            <div>
              <span className="text-muted-foreground">Avg </span>
              <span className="font-bold text-foreground">{avgPrice}</span>
            </div>
            <div>
              <span className="text-muted-foreground">TERP </span>
              <span className="font-bold text-foreground">{terp}</span>
            </div>
          </div>
          {recommendation && (
            <div className={`flex items-center gap-1 text-[10px] font-bold ${
              recommendation === 'positive' ? 'text-[hsl(var(--success))]' : 'text-destructive'
            }`}>
              {recommendation === 'positive' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingSummary;
