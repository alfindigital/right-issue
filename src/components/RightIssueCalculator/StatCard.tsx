import React, { useEffect, useState } from 'react';
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

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  accentColor = 'blue',
  animated = false,
  delay = 0,
}) => {
  const [show, setShow] = useState(!animated);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [animated, delay]);

  return (
    <div
      className={`rounded-xl border border-border/50 border-l-[3px] p-3 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5 ${accentMap[accentColor]} ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${iconColorMap[accentColor]}`} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-sm font-bold text-foreground ${animated && show ? 'animate-number-pop' : ''}`}>{value}</p>
    </div>
  );
};

export default StatCard;
