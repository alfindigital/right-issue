import React, { useEffect, useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  accentColor?: 'blue' | 'green' | 'amber' | 'purple';
  animated?: boolean;
  delay?: number;
}

const accentMap = {
  blue: 'border-l-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]',
  green: 'border-l-[hsl(var(--success))] bg-[hsl(142_76%_36%/0.04)]',
  amber: 'border-l-[hsl(var(--warning))] bg-[hsl(38_92%_50%/0.04)]',
  purple: 'border-l-[hsl(270_70%_50%)] bg-[hsl(270_70%_50%/0.04)]',
};

const iconColorMap = {
  blue: 'text-primary',
  green: 'text-[hsl(var(--success))]',
  amber: 'text-[hsl(var(--warning))]',
  purple: 'text-[hsl(270_70%_50%)]',
};

const glowMap = {
  blue: 'glow-blue',
  green: 'glow-green',
  amber: 'glow-amber',
  purple: 'glow-purple',
};

function useCountUp(target: number, duration = 800, enabled = false, decimals = 0) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!enabled || target === 0) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const factor = Math.pow(10, decimals);
      setDisplay(Math.round(eased * target * factor) / factor);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, enabled, decimals]);

  return display;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  accentColor = 'blue',
  animated = false,
  delay = 0,
}) => {
  const [show, setShow] = useState(!animated);

  // Extract numeric part for count-up. Handle Indonesian format where `.` is thousands
  // and `,` is decimal separator (e.g. "1.250,50" → 1250.5, "2,50" → 2.5).
  const numericMatch = value.match(/([\d.,]+)/);
  const rawNum = numericMatch ? numericMatch[1] : '';
  const normalized = rawNum.replace(/\./g, '').replace(',', '.');
  const numericTarget = rawNum ? parseFloat(normalized) || 0 : 0;
  const decimalPart = rawNum.includes(',') ? rawNum.split(',')[1] : '';
  const decimals = decimalPart.length;
  const prefix = numericMatch ? value.slice(0, value.indexOf(rawNum)) : '';
  const suffix = numericMatch ? value.slice(value.indexOf(rawNum) + rawNum.length) : value;

  const countValue = useCountUp(numericTarget, 900, show && animated, decimals);
  const formattedCount = numericTarget > 0
    ? countValue.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : '';

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [animated, delay]);

  const displayValue = animated && numericTarget > 0 ? `${prefix}${formattedCount}${suffix}` : value;

  return (
    <div
      className={`rounded-xl border border-border/50 border-l-[3px] p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1 dark:bg-card/50 dark:backdrop-blur-md dark:border-border/30 dark:hover:border-primary/20 dark:hover:shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.15)] ${glowMap[accentColor]} ${accentMap[accentColor]} ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-3.5 h-3.5 ${iconColorMap[accentColor]}`} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-sm font-bold text-foreground tabular-nums ${animated && show ? 'animate-number-pop' : ''}`}>
        {displayValue}
      </p>
    </div>
  );
};

export default StatCard;
