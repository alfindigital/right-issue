import React from 'react';
import InfoTooltip from './InfoTooltip';
import { sanitizeIntegerInput } from '@/lib/parseDecimal';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  error?: string;
  hint?: string;
  unit?: string; // e.g. "Rp / lembar", "lot"
  prefix?: string; // e.g. "Rp"
}

const CurrencyInput = React.forwardRef<HTMLDivElement, CurrencyInputProps>(({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  tooltip,
  error,
  hint,
  unit = 'Rp / lembar',
  prefix = 'Rp',
}, ref) => {
  const formatNumber = (num: string): string => {
    const cleanNum = num.replace(/\D/g, '');
    if (!cleanNum) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(cleanNum));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Use shared sanitizer so paste of "1.000", "1,000", "Rp 1.000" → "1000"
    const rawValue = sanitizeIntegerInput(e.target.value);
    onChange(rawValue);
  };

  // Auto-correct on blur: clear "0"/all-zero, trim leading zeros (e.g. "007" -> "7")
  const handleBlur = () => {
    if (!value) return;
    if (/^0+$/.test(value)) {
      onChange('');
      return;
    }
    const trimmed = value.replace(/^0+/, '');
    if (trimmed !== value) onChange(trimmed);
  };

  return (
    <div className="space-y-1.5" ref={ref}>
      <label htmlFor={id} className="text-xs font-medium text-foreground flex items-center">
        {label}
        <span className="ml-1 text-[10px] font-normal text-muted-foreground">({unit})</span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          id={id}
          value={formatNumber(value)}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`input-calculator ${prefix ? 'pl-8' : ''} ${error ? 'border-destructive focus:border-destructive ring-1 ring-destructive/30' : ''}`}
          inputMode="numeric"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive mt-1 animate-fade-in">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
