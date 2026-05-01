import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
  children: React.ReactNode;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  subtitle,
  badge,
  defaultOpen = false,
  storageKey,
  children,
  className,
}) => {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !storageKey) return defaultOpen;
    const saved = window.localStorage.getItem(`ri-section-${storageKey}`);
    if (saved === '1') return true;
    if (saved === '0') return false;
    return defaultOpen;
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(`ri-section-${storageKey}`, open ? '1' : '0');
    } catch {
      // ignore quota errors
    }
  }, [open, storageKey]);

  return (
    <section className={cn('card-calculator animate-fade-in p-0 overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 min-h-[44px] text-left hover:bg-muted/30 transition-colors"
      >
        {icon && <span className="flex-shrink-0 text-primary">{icon}</span>}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-foreground truncate">{title}</h2>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        {badge && !open && (
          <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
            {badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 animate-fade-in">
          {children}
        </div>
      )}
    </section>
  );
};

export default CollapsibleSection;
