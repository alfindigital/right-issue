import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ValidationErrors } from '@/hooks/useInputValidation';

interface ErrorSummaryProps {
  errors: ValidationErrors;
  max?: number;
}

// Friendly labels per field key (matches useInputValidation keys).
const LABELS: Record<string, { id: string; en: string; anchor?: string }> = {
  ratioOld: { id: 'Rasio lama (RI)', en: 'Old ratio (RI)' },
  ratioNew: { id: 'Rasio baru (RI)', en: 'New ratio (RI)' },
  rightPrice: { id: 'Harga pelaksanaan', en: 'Exercise price', anchor: 'right-price' },
  cumDatePrice: { id: 'Harga cum-date', en: 'Cum-date price', anchor: 'cum-date-price' },
  currentLots: { id: 'Jumlah lot dimiliki', en: 'Current lots' },
  currentAvgPrice: { id: 'Harga rata-rata', en: 'Average price' },
  hmetdLots: { id: 'Lot HMETD dibeli', en: 'HMETD lots bought' },
  hmetdPrice: { id: 'Harga HMETD', en: 'HMETD price' },
  warrantRatioOld: { id: 'Rasio waran (RI)', en: 'Warrant ratio (RI)' },
  warrantRatioNew: { id: 'Rasio waran (waran)', en: 'Warrant ratio (warrant)' },
};

const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors, max = 3 }) => {
  const { language } = useLanguage();
  const entries = Object.entries(errors).filter(([, v]) => !!v);
  if (entries.length === 0) return null;

  const visible = entries.slice(0, max);
  const remaining = entries.length - visible.length;

  const handleJump = (anchor?: string) => {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLElement).focus?.();
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="card-calculator border-destructive/40 bg-destructive/5 animate-fade-in"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-destructive mb-1.5">
            {language === 'id'
              ? `Perlu diperbaiki (${entries.length})`
              : `Needs fixing (${entries.length})`}
          </p>
          <ul className="space-y-1">
            {visible.map(([key, msg]) => {
              const label = LABELS[key];
              const labelText = label ? (language === 'id' ? label.id : label.en) : key;
              const anchor = label?.anchor;
              return (
                <li key={key} className="text-xs text-foreground leading-snug">
                  {anchor ? (
                    <button
                      type="button"
                      onClick={() => handleJump(anchor)}
                      className="text-left hover:underline focus:outline-none focus:underline"
                    >
                      <span className="font-medium text-destructive">{labelText}:</span>{' '}
                      <span className="text-muted-foreground">{msg}</span>
                    </button>
                  ) : (
                    <>
                      <span className="font-medium text-destructive">{labelText}:</span>{' '}
                      <span className="text-muted-foreground">{msg}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          {remaining > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {language === 'id'
                ? `+${remaining} error lainnya`
                : `+${remaining} more error${remaining > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorSummary;